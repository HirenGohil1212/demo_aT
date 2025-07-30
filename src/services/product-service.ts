'use server'

import admin from 'firebase-admin'
import type { Category, Product } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

const db = admin.firestore();

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().int().min(1),
  category: z.string().min(1),
  image: z.string().url(),
  featured: z.coerce.boolean().optional(),
})

export async function getProducts(): Promise<Product[]> {
  const snapshot = await db.collection('products').get()
  if (snapshot.empty) {
    return []
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await db.collection('products').doc(id).get()
  if (!doc.exists) {
    return null
  }
  return { id: doc.id, ...doc.data() } as Product
}

export async function getCategories(): Promise<Category[]> {
  const snapshot = await db.collection('categories').orderBy('name').get()
  if (snapshot.empty) {
    return []
  }
  return snapshot.docs.map(
    doc => ({ id: doc.id, ...doc.data() } as Category)
  )
}

export async function addCategory(formData: FormData) {
  const categorySchema = z.object({
    name: z.string().min(1),
  })

  const validatedFields = categorySchema.safeParse({
    name: formData.get('name'),
  })

  if (!validatedFields.success) {
    // Handle validation errors, maybe return them
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  await db.collection('categories').add(validatedFields.data)
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products/new')
}

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = productSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data

  await db.collection('products').add({
    ...data,
    price: data.price / 100, // convert from cents
    featured: data.featured || false,
    details: [], // Default empty values
    recipe: null,
  })

  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin/products')
  redirect('/admin/products')
}
