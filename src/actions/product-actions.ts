
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { query } from '@/lib/db';

// Zod schema for product validation
const productSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  quantity: z.coerce.number().positive({ message: 'Quantity must be a positive number' }),
  category: z.string().min(1, { message: 'Category is required' }),
  featured: z.preprocess((val) => val === 'on', z.boolean().optional()),
  imageUrl: z.string().url({ message: "A valid image URL is required." }).optional().or(z.literal('')),
});

/**
 * Adds a new product to the database.
 */
export async function addProduct(prevState: unknown, formData: FormData) {
  const validatedFields = productSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  let { name, description, price, quantity, category, featured, imageUrl } = validatedFields.data;
  
  if (!imageUrl) {
    imageUrl = `https://placehold.co/600x600.png?text=${encodeURIComponent(name)}`;
  }

  try {
    await query(
        'INSERT INTO products (name, description, price, quantity, category, featured, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, price, quantity, category, featured ?? false, imageUrl]
    );
  } catch (error) {
    console.error(error);
    return { error: { _server: ["Database error: Could not add product."]}};
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

/**
 * Updates an existing product in the database.
 */
export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  if (!id) {
    return { error: { _server: ["Invalid product ID."] } };
  }

  const validatedFields = productSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
    
  let { name, description, price, quantity, category, featured, imageUrl } = validatedFields.data;

  if (!imageUrl) {
    imageUrl = `https://placehold.co/600x600.png?text=${encodeURIComponent(name)}`;
  }

  try {
     const result: any = await query(
        'UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, category = ?, featured = ?, image = ? WHERE id = ?',
        [name, description, price, quantity, category, featured ?? false, imageUrl, id]
    );

    if (result.affectedRows === 0) {
        return { error: { _server: ["Product not found or no changes made."] } };
    }
  } catch (error) {
    console.error(error);
    return { error: { _server: ["Database error: Could not update product."]}};
  }

  revalidatePath('/');
  revalidatePath(`/products/${id}`);
  revalidatePath('/admin/products');
  redirect('/admin/products');
}


/**
 * Fetches all products from the database.
 * @returns An array of products.
 */
export async function getProducts(): Promise<Product[]> {
    try {
        const results = await query('SELECT * FROM products ORDER BY name ASC');
        return results as Product[];
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return []; 
    }
}

/**
 * Fetches a single product by its ID from the database.
 * @param id The ID of the product to fetch.
 * @returns The product object or null if not found.
 */
export async function getProductById(id: string): Promise<Product | null> {
    try {
        const results: any[] = await query('SELECT * FROM products WHERE id = ?', [id]);
        if (results.length > 0) {
            return results[0] as Product;
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch product with id ${id}:`, error);
        return null;
    }
}

/**
 * Deletes a product from the database and its image from Storage.
 * @param productId The ID of the product to delete.
 */
export async function deleteProduct(productId: string) {
    if (!productId) {
        return { error: "Invalid product ID." };
    }
    
    try {
        await query('DELETE FROM products WHERE id = ?', [productId]);
    } catch (error) {
        console.error(`Failed to delete product ${productId}:`, error);
        return { error: "Database error: Could not delete product." };
    }
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true };
}
