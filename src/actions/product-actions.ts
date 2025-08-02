
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- SIMULATED DATABASE ---
let products: Product[] = [
    {
        id: '1',
        name: 'Classic Single Malt',
        description: 'A smooth and smoky single malt whiskey.',
        price: 4500,
        quantity: 750,
        category: 'Whiskey',
        featured: true,
        image: 'https://placehold.co/600x600.png',
    },
    {
        id: '2',
        name: 'Botanical Gin',
        description: 'A refreshing gin with hints of juniper and citrus.',
        price: 3200,
        quantity: 750,
        category: 'Gin',
        featured: true,
        image: 'https://placehold.co/600x600.png',
    }
];
// --- END SIMULATED DATABASE ---


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

  const newProduct: Product = {
      id: uuidv4(),
      name,
      description,
      price,
      quantity,
      category,
      featured: featured ?? false,
      image: imageUrl
  };

  products.unshift(newProduct);

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

  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return { error: { _server: ["Product not found or no changes made."] } };
  }

  products[productIndex] = {
      ...products[productIndex],
      name,
      description,
      price,
      quantity,
      category,
      featured: featured ?? false,
      image: imageUrl,
  };


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
    console.log("getProducts called, returning simulated data.");
    return products;
}

/**
 * Fetches a single product by its ID from the database.
 * @param id The ID of the product to fetch.
 * @returns The product object or null if not found.
 */
export async function getProductById(id: string): Promise<Product | null> {
    console.log(`getProductById called for ID: ${id}, using simulated data.`);
    const product = products.find(p => p.id === id);
    return product || null;
}

/**
 * Deletes a product from the database and its image from Storage.
 * @param productId The ID of the product to delete.
 */
export async function deleteProduct(productId: string) {
    if (!productId) {
        return { error: "Invalid product ID." };
    }
    
    products = products.filter(p => p.id !== productId);
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true };
}
