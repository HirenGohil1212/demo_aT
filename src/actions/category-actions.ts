
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase-admin';
import type { Category } from '@/types';

/**
 * Fetches all categories from Firestore, ordered by name.
 * @returns An array of categories.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const snapshot = await db.collection('categories').orderBy('name').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as Category)
    );
  } catch (error) {
    console.error("Error in getCategories:", error);
    return [];
  }
}

/**
 * Adds a new category to Firestore.
 * This is a server action that handles form submission.
 */
export async function addCategory(formData: FormData) {
  const categorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
  });

  const validatedFields = categorySchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await db.collection('categories').add(validatedFields.data);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products/new'); // Revalidate to update category dropdown
  } catch (error) {
    console.error("Error in addCategory:", error);
    return { errors: { name: ["Failed to add category due to a server error."] } };
  }
}
