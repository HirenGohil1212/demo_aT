
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/firebase-admin';
import type { Product } from '@/types';

// Zod schema for product validation
const productSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  category: z.string().min(1, { message: 'Category is required' }),
  imageUrl: z.string().url({ message: 'A valid image URL is required' }),
  featured: z.preprocess((val) => val === 'on', z.boolean().optional()),
});


/**
 * Adds a new product to the Firestore database.
 * This is a server action that handles form submission.
 */
export async function addProduct(prevState: unknown, formData: FormData) {
  const result = productSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  try {
    const data = result.data;

    await db.collection('products').add({
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      image: data.imageUrl,
      featured: data.featured || false,
      details: [],
      recipe: null,
    });

  } catch (error) {
    console.error("Full error in addProduct:", error);
    return { serverError: ["Failed to add product due to a server error."] };
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

/**
 * Fetches all products from Firestore.
 * @returns An array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const snapshot = await db.collection('products').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data, 
        price: data.price || 0 
      } as Product;
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
}

/**
 * Fetches a single product by its ID from Firestore.
 * @param id The ID of the product to fetch.
 * @returns The product object or null if not found.
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    return { id: doc.id, ...data, price: data?.price || 0 } as Product;
  } catch (error) {
    console.error("Error in getProductById:", error);
    return null;
  }
}
