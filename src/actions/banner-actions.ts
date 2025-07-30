
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db, storage } from '@/lib/firebase-admin';
import type { Banner } from '@/types';
import { Readable } from 'stream';
import admin from 'firebase-admin';


/**
 * Uploads a file to Firebase Storage and returns the public URL.
 * @param file The file to upload.
 * @returns The public URL of the uploaded file.
 */
async function uploadImage(file: File): Promise<string> {
    const bucket = storage.bucket();
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
  
    const stream = Readable.from(fileBuffer);
    const writeStream = bucket.file(`images/${fileName}`).createWriteStream({
      metadata: {
        contentType: file.type,
      },
    });
  
    return new Promise((resolve, reject) => {
      stream.pipe(writeStream)
        .on('finish', () => {
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(`images/${fileName}`)}?alt=media`;
          resolve(publicUrl);
        })
        .on('error', (err) => {
          console.error('Error uploading image to storage:', err);
          reject(new Error('Failed to upload image.'));
        });
    });
  }

// Zod schema for banner validation
const bannerSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().min(1, { message: "Subtitle is required" }),
  imageUrl: z.instanceof(File).refine((file) => file.size > 0, { message: 'Image is required.' }),
  productId: z.string().min(1, { message: "A product must be linked" }),
});

/**
 * Adds a new banner to Firestore.
 * This is a server action that handles form submission.
 */
export async function addBanner(prevState: unknown, formData: FormData) {
  const result = bannerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    console.error("Banner validation error:", result.error.formErrors);
    return { error: "Invalid data provided." };
  }

  try {
    const imageUrl = await uploadImage(result.data.imageUrl);
    await db.collection("banners").add({
      title: result.data.title,
      subtitle: result.data.subtitle,
      productId: result.data.productId,
      imageUrl: imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true,
    });
  } catch (error) {
    console.error("Error in addBanner:", error);
    return { error: "Failed to add banner due to a server error." };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect('/admin/banners');
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
    
    const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));

    // Sort by createdAt timestamp in descending order (newest first)
    banners.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });

    return banners;

  } catch (error) {
    console.error("Error in getBanners:", error);
    return [];
  }
}
