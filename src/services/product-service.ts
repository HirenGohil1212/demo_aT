'use server'

import admin from 'firebase-admin'
import type { Category, Product } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Helper function to initialize Firebase Admin and get the Firestore instance
function getDb() {
  if (admin.apps.length === 0) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
      }
      admin.initializeApp({
        credential: admin.credential.cert({
          project_id: process.env.FIREBASE_PROJECT_ID,
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          private_key: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error: any) {
      console.error('Firebase admin initialization error:', error.message);
      throw new Error('Firebase admin initialization failed. Please check your server environment variables.');
    }
  }
  return admin.firestore();
}

const productSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.coerce.number().int().positive({ message: 'Price must be a positive integer in cents' }),
  category: z.string().min(1, { message: 'Category is required' }),
  image: z.string().url({ message: 'A valid image URL is required' }),
  featured: z.preprocess((val) => val === 'on', z.boolean().optional()),
})

export async function getProducts(): Promise<Product[]> {
  try {
    const db = getDb();
    const snapshot = await db.collection('products').get()
    if (snapshot.empty) {
      return []
    }
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return { 
        id: doc.id, 
        ...data, 
        price: data.price || 0 
      } as Product
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const db = getDb();
    const doc = await db.collection('products').doc(id).get()
    if (!doc.exists) {
      return null
    }
    const data = doc.data();
    return { id: doc.id, ...data, price: data?.price || 0 } as Product;
  } catch (error) {
    console.error("Error in getProductById:", error);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const db = getDb();
    const snapshot = await db.collection('categories').orderBy('name').get()
    if (snapshot.empty) {
      return []
    }
    return snapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as Category)
    )
  } catch (error) {
    console.error("Error in getCategories:", error);
    return [];
  }
}

export async function addCategory(formData: FormData) {
  try {
    const db = getDb();
    const categorySchema = z.object({
      name: z.string().min(1, "Category name is required"),
    })

    const validatedFields = categorySchema.safeParse({
      name: formData.get('name'),
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    await db.collection('categories').add(validatedFields.data)
    revalidatePath('/admin/categories')
    revalidatePath('/admin/products/new')
  } catch (error) {
    console.error("Error in addCategory:", error);
    return { errors: { name: ["Failed to add category due to a server error."] } };
  }
}

export async function addProduct(prevState: unknown, formData: FormData) {
  try {
    const db = getDb();
    const result = productSchema.safeParse(Object.fromEntries(formData.entries()))
    if (result.success === false) {
      return result.error.formErrors.fieldErrors
    }

    const data = result.data

    await db.collection('products').add({
      ...data,
      price: data.price / 100, // convert from cents to dollars
      featured: data.featured || false,
      details: [], // Default empty values
      recipe: null,
    })
  } catch (error) {
    console.error("Error in addProduct:", error);
    return { name: ["Failed to add product due to a server error."] };
  }

  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin/products')
  redirect('/admin/products')
}
