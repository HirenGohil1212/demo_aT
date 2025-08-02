
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
];
// --- END SIMULATED DATABASE ---


/**
 * Fetches all categories from the simulated database.
 * @returns An array of categories.
 */
export async function getCategories(): Promise<Category[]> {
    console.log("getCategories called, returning simulated data.");
    // Sort alphabetically for consistent order
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Adds a new category to the simulated database.
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

  const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
      return { error: `Category "${name}" already exists.` };
  }

  const newCategory: Category = {
      id: uuidv4(),
      name,
  }

  categories.push(newCategory);

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products/new'); // Revalidate to update category dropdown
  return { success: true, category: newCategory };
}

/**
 * Deletes a category from the simulated database.
 * @param categoryId The ID of the category to delete.
 */
export async function deleteCategory(categoryId: string) {
    if (!categoryId) {
        return { error: "Invalid category ID." };
    }
    
    // In a real app, you'd check if products are using this category.
    // We'll skip that for the simulation.
    
    const initialLength = categories.length;
    categories = categories.filter(c => c.id !== categoryId);

    if (categories.length === initialLength) {
        return { error: "Category not found." };
    }
    
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');

    return { success: true };
}
