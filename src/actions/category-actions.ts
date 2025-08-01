
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Category } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- SIMULATED DATABASE ---
let categories: Category[] = [
    { id: '1', name: 'Whiskey' },
    { id: '2', name: 'Gin' },
    { id: '3', name: 'Vodka' },
    { id: '4', name: 'Rum' },
    { id: '5', name: 'Tequila' },
];
// --- END SIMULATED DATABASE ---

/**
 * Fetches all categories from the MySQL database.
 * @returns An array of categories.
 */
export async function getCategories(): Promise<Category[]> {
  console.log("getCategories called, returning simulated data.");
  return categories.sort((a,b) => a.name.localeCompare(b.name));
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
  
  if (categories.some(c => c.name.toLowerCase() === validatedFields.data.name.toLowerCase())) {
      return { error: `Category "${validatedFields.data.name}" already exists.` };
  }
  
  const newCategory: Category = {
      id: uuidv4(),
      name: validatedFields.data.name,
  }
  
  categories.push(newCategory);

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
    
    // In a real app, you would check if products are using this category.
    
    categories = categories.filter(c => c.id !== categoryId);
    
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');

    return { success: true };
}
