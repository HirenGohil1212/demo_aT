
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase-admin';
import type { Category } from '@/types';

/**
 * Fetches all categories by calling the new API endpoint.
 * @returns An array of categories.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    // Construct the absolute URL for the API endpoint.
    // In a real deployment, you'd want to use an environment variable
    // for the base URL.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const res = await fetch(`${baseUrl}/api/categories`, {
        // We add this to ensure the data is always fresh.
        cache: 'no-store' 
    });

    if (!res.ok) {
        console.error("Failed to fetch categories:", res.status, res.statusText);
        return [];
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in getCategories:", error);
    return [];
  }
}

/**
 * Adds a new category to Firestore.
 * This is a server action that handles form submission.
 * This function will be migrated next.
 */
export async function addCategory(prevState: unknown, formData: FormData) {
  const categorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
  });

  const validatedFields = categorySchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      error: "Category name is required.",
    };
  }

  try {
    // This part still uses Firebase and will be migrated.
    await db.collection('categories').add(validatedFields.data);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products/new'); // Revalidate to update category dropdown
    return { success: true };
  } catch (error) {
    console.error("Error in addCategory:", error);
    return { error: "Failed to add category due to a server error." };
  }
}

/**
 * Deletes a category from Firestore.
 * It first checks if any products are using this category.
 * @param categoryId The ID of the category to delete.
 * This function will be migrated next.
 */
export async function deleteCategory(categoryId: string) {
    if (!categoryId) {
        return { error: "Invalid category ID." };
    }

    try {
        const categoryRef = db.collection('categories').doc(categoryId);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
            return { error: "Category not found." };
        }
        
        const categoryName = categoryDoc.data()?.name;

        // Check if any products are using this category
        const productsSnapshot = await db.collection('products').where('category', '==', categoryName).limit(1).get();

        if (!productsSnapshot.empty) {
            return { error: `Cannot delete category "${categoryName}" as it is currently in use by one or more products.` };
        }

        // Delete the category document from Firestore
        await categoryRef.delete();
        
        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');

        return { success: true };

    } catch (error) {
        console.error("Error in deleteCategory:", error);
        return { error: "Failed to delete category due to a server error." };
    }
}
