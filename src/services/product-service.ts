'use server'

import admin from 'firebase-admin'
import type { Category, Product, Banner, AppSettings } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Helper function to initialize Firebase Admin and get the Firestore instance
function getDb() {
  if (admin.apps.length === 0) {
    try {
      // Check if service account JSON file exists
      const serviceAccount = require('../../serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (error: any) {
      console.error('Firebase admin initialization error:', error.message);
      // Fallback to default credentials for environments like Cloud Run
      if (admin.apps.length === 0) {
           admin.initializeApp();
      }
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

// --- Banner Functions ---

const bannerSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().min(1, { message: "Subtitle is required" }),
  imageUrl: z.string().url({ message: "A valid image URL is required" }),
  productId: z.string().min(1, { message: "A product must be linked" }),
});

export async function addBanner(formData: FormData) {
  const db = getDb();
  const result = bannerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    console.error("Banner validation error:", result.error.formErrors);
    // A more user-friendly error handling would be ideal here
    return { error: "Invalid data provided." };
  }

  try {
    await db.collection("banners").add({
      ...result.data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true,
    });
  } catch (error) {
    console.error("Error in addBanner:", error);
    return { error: "Failed to add banner due to a server error." };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const db = getDb();
    const snapshot = await db.collection('banners').get();
    if (snapshot.empty) {
      return [];
    }
    
    const allBanners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
    const activeBanners = allBanners.filter(banner => banner.active === true);
    activeBanners.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    return activeBanners;

  } catch (error) {
    console.error("Error in getBanners:", error);
    return [];
  }
}

// --- Settings Functions ---

const defaultSettings: AppSettings = {
  allowSignups: true,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const db = getDb();
    const settingsDoc = await db.collection('settings').doc('config').get();

    if (!settingsDoc.exists) {
      // If settings don't exist, create them with default values
      await db.collection('settings').doc('config').set(defaultSettings);
      return defaultSettings;
    }
    return settingsDoc.data() as AppSettings;
  } catch (error) {
    console.error("Error in getSettings:", error);
    // Return default settings on error to avoid crashing the app
    return defaultSettings;
  }
}

export async function updateSettings(prevState: unknown, formData: FormData) {
  const db = getDb();
  const settingsSchema = z.object({
    allowSignups: z.preprocess((val) => val === 'on', z.boolean()),
  });

  const result = settingsSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return { message: "Invalid data provided." };
  }

  try {
    await db.collection('settings').doc('config').set(result.data, { merge: true });
    revalidatePath('/admin/settings');
    revalidatePath('/signup');
    revalidatePath('/login');
    revalidatePath('/api/settings'); // Revalidate the API route
  } catch (error) {
    console.error("Error in updateSettings:", error);
    return { message: "Failed to update settings due to a server error." };
  }
}
