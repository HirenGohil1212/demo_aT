
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- SIMULATED DATABASE ---
// In-memory array to simulate a database table for products.
let products: Product[] = [
    {
      id: '1',
      name: 'Glenfiddich 18 Year',
      category: 'Whiskey',
      price: 7500,
      quantity: 750,
      image: 'https://placehold.co/600x600.png',
      description: 'A truly exceptional single malt, the result of eighteen years of care and attention. Its complex and seductive character is a testament to the art of whisky making.',
      featured: true,
      details: ['18 Year Old', 'Single Malt Scotch Whisky', '40% ABV'],
      recipe: {
        name: 'Classic Old Fashioned',
        ingredients: ['60ml Glenfiddich 18 Year', '1 Sugar Cube', '2 Dashes Angostura Bitters', 'Orange Peel'],
        instructions: ['Muddle sugar and bitters in a glass.', 'Add a large ice cube and the whisky.', 'Stir well and garnish with an orange peel.']
      }
    },
    {
      id: '2',
      name: 'Hendrick\'s Gin',
      category: 'Gin',
      price: 3500,
      quantity: 700,
      image: 'https://placehold.co/600x600.png',
      description: 'A gin made with infusions of cucumber and rose petals. The result is an exquisitely balanced gin with a delightfully floral aroma.',
      featured: true,
      details: ['Infused with Cucumber & Rose', 'Scottish Gin', '41.4% ABV'],
      recipe: {
        name: 'Gin & Tonic',
        ingredients: ['50ml Hendrick\'s Gin', '150ml Premium Tonic Water', '3 thinly sliced rounds of Cucumber'],
        instructions: ['Fill a highball glass with cubed ice.', 'Add gin, then tonic.', 'Garnish with cucumber slices.']
      }
    },
    {
      id: '3',
      name: 'Belvedere Vodka',
      category: 'Vodka',
      price: 2800,
      quantity: 750,
      image: 'https://placehold.co/600x600.png',
      description: 'Crafted from 100% Polish rye and purified water from its own natural well, Belvedere is all-natural, contains zero additives or sugar, and is certified Kosher.',
      featured: false,
    },
    {
      id: '4',
      name: 'Diplomático Reserva Exclusiva',
      category: 'Rum',
      price: 4200,
      quantity: 700,
      image: 'https://placehold.co/600x600.png',
      description: 'A complex blend of copper pot still rums aged for up to 12 years. Rich, sweet and fruity, as a sipping rum should be.',
      featured: true,
    },
     {
      id: '5',
      name: 'Don Julio 1942',
      category: 'Tequila',
      price: 15000,
      quantity: 750,
      image: 'https://placehold.co/600x600.png',
      description: 'Celebrated in exclusive cocktail bars, restaurants and nightclubs, the iconic Don Julio 1942 Tequila is the choice of connoisseurs around the globe.',
      featured: true,
    },
];
// --- END SIMULATED DATABASE ---


// Base schema for product fields
const productSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  quantity: z.coerce.number().positive({ message: 'Quantity must be a positive number' }),
  category: z.string().min(1, { message: 'Category is required' }),
  featured: z.preprocess((val) => val === 'on', z.boolean().optional()),
  imageUrl: z.string().url({ message: "A valid image URL is required." }),
});


/**
 * Adds a new product to the database.
 */
export async function addProduct(prevState: unknown, formData: FormData) {
  const validatedFields = productSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  const newProduct: Product = {
      id: uuidv4(),
      name: validatedFields.data.name,
      description: validatedFields.data.description,
      price: validatedFields.data.price,
      quantity: validatedFields.data.quantity,
      category: validatedFields.data.category,
      featured: validatedFields.data.featured,
      image: validatedFields.data.imageUrl
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

  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return { error: { _server: ["Product not found."] } };
  }
  
  const updatedProduct: Product = {
      ...products[productIndex],
      name: validatedFields.data.name,
      description: validatedFields.data.description,
      price: validatedFields.data.price,
      quantity: validatedFields.data.quantity,
      category: validatedFields.data.category,
      featured: validatedFields.data.featured,
      image: validatedFields.data.imageUrl
  };

  products[productIndex] = updatedProduct;

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
  console.log(`getProductById called for ID: ${id}, returning simulated data.`);
  const product = products.find(p => p.id === id) || null;
  return product;
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
    console.log(`deleteProduct called for ID: ${productId}, using simulated data.`);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');

    return { success: true };
}
