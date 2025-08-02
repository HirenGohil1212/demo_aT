
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Banner } from '@/types';
import { v4 as uuidv4 } from 'uuid';


// --- SIMULATED DATABASE ---
let banners: Banner[] = [
    {
        id: '1',
        imageUrl: 'https://placehold.co/1200x600.png',
        title: 'Summer Specials',
        subtitle: 'The finest spirits for the season',
        active: true,
        productId: '1',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        imageUrl: 'https://placehold.co/1200x600.png',
        title: 'New Arrivals',
        subtitle: 'Discover the latest additions',
        active: true,
        productId: '2',
        createdAt: new Date().toISOString(),
    }
];
// --- END SIMULATED DATABASE ---


// Zod schema for banner validation
const bannerSchema = z.object({
  imageUrl: z.string().url({ message: "A valid image URL is required. Please upload an image." }).optional().or(z.literal('')),
});

/**
 * Adds a new banner to the database.
 * This is a server action that handles form submission.
 */
export async function addBanner(prevState: unknown, formData: FormData) {
  const validatedFields = bannerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  let { imageUrl } = validatedFields.data;
  const title = formData.get('title') as string || 'New Banner';
  
  if (!imageUrl) {
    imageUrl = `https://placehold.co/1200x600.png?text=${encodeURIComponent(title)}`;
  }

  const newBanner: Banner = {
      id: uuidv4(),
      imageUrl: imageUrl,
      title: title,
      subtitle: formData.get('subtitle') as string || '',
      active: true,
      productId: formData.get('productId') as string || '',
      createdAt: new Date().toISOString(),
  }
  
  banners.unshift(newBanner);
  
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true, banner: newBanner };
}

/**
 * Fetches all active banners from the database.
 * @returns An array of banners.
 */
export async function getBanners(): Promise<Banner[]> {
  console.log("getBanners called, returning simulated data.");
  return banners.filter(b => b.active);
}

/**
 * Deletes a banner from the database and its image from Storage.
 * @param bannerId The ID of the banner to delete.
 */
export async function deleteBanner(bannerId: string) {
    if (!bannerId) {
        return { error: "Invalid banner ID." };
    }
    banners = banners.filter(b => b.id !== bannerId);
    console.log(`deleteBanner called for ID: ${bannerId}, using simulated data.`);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
}
