
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db, storage } from '@/lib/firebase-admin';
import type { Banner } from '@/types';
import admin from 'firebase-admin';
import { uploadFile } from '@/lib/storage';

// Zod schema for banner validation
const bannerSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().min(1, { message: "Subtitle is required" }),
  imageFile: z.instanceof(File).refine(file => file.size > 0, "An image is required."),
  productId: z.string().min(1, { message: "A product must be linked" }),
});

/**
 * Adds a new banner to Firestore.
 * This is a server action that handles form submission including file upload.
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
    const imageUrl = await uploadFile(data.imageFile, 'banners');

    await db.collection("banners").add({
      title: data.title,
      subtitle: data.subtitle,
      productId: data.productId,
      imageUrl: imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true,
    });
    
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };

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
    const snapshot = await db.collection('banners').where("active", "==", true).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    const banners = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        return { 
            id: doc.id, 
            ...data,
            // Convert timestamp to a serializable format (ISO string)
            createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : new Date().toISOString()
        } as Banner
    });

    // Sort by createdAt timestamp in descending order (newest first)
    banners.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });

    return banners;

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
                const filePathWithQuery = decodedUrl.substring(decodedUrl.indexOf('/o/') + 3);
                const filePath = filePathWithQuery.split('?alt=media')[0];
                
                if(filePath) {
                    await bucket.file(filePath).delete();
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
