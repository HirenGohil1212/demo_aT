
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
        const results = await query('SELECT * FROM categories ORDER BY name ASC');
        return results as Category[];
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return []; // Return an empty array on error
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
  
  const { name } = validatedFields.data;

  try {
    const existing: any[] = await query('SELECT id FROM categories WHERE LOWER(name) = ?', [name.toLowerCase()]);
    if (existing.length > 0) {
        return { error: `Category "${name}" already exists.` };
    }

    await query('INSERT INTO categories (name) VALUES (?)', [name]);

  } catch (error) {
      console.error("Failed to add category:", error);
      return { error: "Database error: Could not add category." };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products/new'); // Revalidate to update category dropdown
  return { success: true };
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
        // Optional: Check if any products are using this category before deleting.
        const products: any[] = await query('SELECT id FROM products WHERE category = (SELECT name FROM categories WHERE id = ?)', [categoryId]);
        if (products.length > 0) {
            return { error: "Cannot delete category. It is currently assigned to one or more products." };
        }
        
        await query('DELETE FROM categories WHERE id = ?', [categoryId]);
    } catch (error) {
         console.error(`Failed to delete category ${categoryId}:`, error);
        return { error: "Database error: Could not delete category." };
    }
    
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');

    return { success: true };
}
