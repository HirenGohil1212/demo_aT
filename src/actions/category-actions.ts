
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db as firestoreDb } from '@/lib/firebase-admin'; // Keep for product check for now
import type { Category } from '@/types';
import { query } from '@/lib/db';

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
 * Adds a new category to the MySQL database.
 * This is a server action that handles form submission.
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
    await query('INSERT INTO categories (name) VALUES (?)', [validatedFields.data.name]);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products/new'); // Revalidate to update category dropdown
    return { success: true };
  } catch (error: any) {
    console.error("Error in addCategory:", error);
    // Handle potential duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return { error: `Category "${validatedFields.data.name}" already exists.` };
    }
    return { error: "Failed to add category due to a server error." };
  }
}

/**
 * Deletes a category from the MySQL database.
 * @param categoryId The ID of the category to delete.
 */
export async function deleteCategory(categoryId: string) {
    if (!categoryId) {
        return { error: "Invalid category ID." };
    }

    try {
        // TODO: Re-implement this check after products are migrated to MySQL
        // For now, we are checking against Firestore data.
        const categoryResult = await query('SELECT name FROM categories WHERE id = ?', [categoryId]) as any[];
        if (categoryResult.length === 0) {
            return { error: "Category not found." };
        }
        const categoryName = categoryResult[0].name;

        // Check if any products in Firestore are using this category
        const productsSnapshot = await firestoreDb.collection('products').where('category', '==', categoryName).limit(1).get();

        if (!productsSnapshot.empty) {
            return { error: `Cannot delete category "${categoryName}" as it is currently in use by one or more products.` };
        }

        // Delete the category from MySQL
        await query('DELETE FROM categories WHERE id = ?', [categoryId]);
        
        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');

        return { success: true };

    } catch (error) {
        console.error("Error in deleteCategory:", error);
        return { error: "Failed to delete category due to a server error." };
    }
}
