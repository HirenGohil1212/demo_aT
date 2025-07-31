
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db, storage } from '@/lib/firebase-admin';
import type { Banner } from '@/types';
import admin from 'firebase-admin';

// Zod schema for banner validation
// Image is now validated as a URL string, not a File object.
const bannerSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().min(1, { message: "Subtitle is required" }),
  imageUrl: z.string().url({ message: "A valid image URL is required. Please upload an image." }),
  productId: z.string().min(1, { message: "A product must be linked" }),
});

/**
 * Adds a new banner to Firestore.
 * This is a server action that handles form submission.
 */
export async function addBanner(prevState: unknown, formData: FormData) {
  const result = bannerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    const fieldErrors = result.error.flatten().fieldErrors;
    console.error("Banner validation error:", fieldErrors);
    return { error: fieldErrors };
  }

  try {
    const data = result.data;
    const createdAt = admin.firestore.FieldValue.serverTimestamp();
    
    const docRef = await db.collection("banners").add({
      title: data.title,
      subtitle: data.subtitle,
      productId: data.productId,
      imageUrl: data.imageUrl, // The URL comes directly from the form
      createdAt: createdAt,
      active: true,
    });
    
    revalidatePath("/admin/banners");
    revalidatePath("/");

    const newBanner = {
        id: docRef.id,
        ...data,
        active: true,
        createdAt: new Date().toISOString(), // Return a serializable date
    }
    
    return { success: true, banner: newBanner };

  } catch (error) {
    console.error("Error in addBanner:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to add banner due to a server error.";
    return { error: { _server: [errorMessage] } };
  }
}

/**
 * Fetches all active banners from Firestore, ordered by creation date.
 * @returns An array of banners.
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    // First, fetch all banners ordered by creation date.
    const snapshot = await db.collection('banners').orderBy("createdAt", "desc").get();
    
    if (snapshot.empty) {
      return [];
    }
    
    const allBanners = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        return { 
            id: doc.id, 
            ...data,
            // Convert timestamp to a serializable format (ISO string)
            createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : new Date().toISOString()
        } as Banner
    });

    // Then, filter for active banners in the code.
    // This avoids needing a composite index in Firestore.
    return allBanners.filter(banner => banner.active);

  } catch (error) {
    console.error("Error in getBanners:", error);
    return [];
  }
}

/**
 * Deletes a banner from Firestore and its image from Storage.
 * @param bannerId The ID of the banner to delete.
 */
export async function deleteBanner(bannerId: string) {
    if (!bannerId) {
        return { error: "Invalid banner ID." };
    }

    try {
        const bannerRef = db.collection('banners').doc(bannerId);
        const bannerDoc = await bannerRef.get();

        if (!bannerDoc.exists) {
            return { error: "Banner not found." };
        }

        const bannerData = bannerDoc.data() as Banner;
        const imageUrl = bannerData.imageUrl;

        // Delete the image from Firebase Storage
        if (imageUrl) {
            try {
                const bucket = storage.bucket();
                // Extract the file path from the URL
                const decodedUrl = decodeURIComponent(imageUrl);
                const gcsPath = decodedUrl.substring(decodedUrl.indexOf('/o/') + 3).split('?')[0];

                if(gcsPath) {
                    await bucket.file(gcsPath).delete();
                }
            } catch (storageError) {
                console.error("Error deleting image from storage, continuing with firestore deletion:", storageError);
                // We don't want to block Firestore deletion if image deletion fails
            }
        }
        
        // Delete the banner document from Firestore
        await bannerRef.delete();
        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true };

    } catch (error) {
        console.error("Error in deleteBanner:", error);
        return { error: "Failed to delete banner due to a server error." };
    }
}
