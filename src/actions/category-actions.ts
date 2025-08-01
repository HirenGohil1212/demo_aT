
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Category } from '@/types';
import { query } from '@/lib/db';

/**
 * Fetches all categories from the MySQL database.
 * @returns An array of categories.
 */
export async function getCategories(): Promise<Category[]> {
  try {
   const results = await query('SELECT id, name FROM categories ORDER BY name ASC');
   return results as Category[];
  } catch (error) {
    console.error("Error in getCategories:", error);
    // Return empty array on error to prevent site crash
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
        // TODO: Check if any products in MySQL are using this category
        // For now, we will allow deletion. A check should be added once products are in MySQL.
        
        await query('DELETE FROM categories WHERE id = ?', [categoryId]);
        
        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');

        return { success: true };

    } catch (error) {
        console.error("Error in deleteCategory:", error);
        return { error: "Failed to delete category due to a server error." };
    }
}
