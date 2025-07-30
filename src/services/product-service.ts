
'use server'

import admin from 'firebase-admin'
import type { Category, Product, Banner, AppSettings } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Readable } from 'stream';

const FIREBASE_PROJECT_ID = "fir-5d78f";
const FIREBASE_STORAGE_BUCKET = `${FIREBASE_PROJECT_ID}.appspot.com`;


// Helper function to initialize Firebase Admin and get the Firestore instance
function initializeAdmin() {
    if (admin.apps.length > 0) {
        return;
    }

    // Check if the service account key is available. This is for local development.
    // In a deployed environment (like App Hosting), Google's infrastructure provides
    // the credentials automatically.
    try {
        const serviceAccount = require('../../serviceAccountKey.json');
        console.log("Initializing Firebase Admin with serviceAccountKey.json");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: FIREBASE_STORAGE_BUCKET,
        });
    } catch (error) {
        console.log("serviceAccountKey.json not found, initializing with default credentials (expected in production).");
        // This will be used in the deployed App Hosting environment
        admin.initializeApp({
            storageBucket: FIREBASE_STORAGE_BUCKET,
        });
    }
}

function getDb() {
    initializeAdmin();
    return admin.firestore();
}

function getStorage() {
    initializeAdmin();
    return admin.storage();
}


async function uploadImage(file: File) {
    const bucket = getStorage().bucket();
    const fileName = `${Date.now()}_${file.name}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const stream = Readable.from(fileBuffer);
    const writeStream = bucket.file(`images/${fileName}`).createWriteStream({
        metadata: {
            contentType: file.type,
        },
    });

    return new Promise<string>((resolve, reject) => {
        stream.pipe(writeStream)
            .on('finish', () => {
                const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(`images/${fileName}`)}?alt=media`;
                resolve(publicUrl);
            })
            .on('error', (err) => {
                console.error('Error uploading image to storage:', err);
                reject(err);
            });
    });
}


const productSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.coerce.number().int().positive({ message: 'Price must be a positive integer in cents' }),
  category: z.string().min(1, { message: 'Category is required' }),
  image: z.instanceof(File).refine((file) => file.size > 0, { message: 'Image is required.' }),
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
  const result = productSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }
  
  try {
    const db = getDb();
    const data = result.data

    const imageUrl = await uploadImage(data.image);

    await db.collection('products').add({
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price / 100, // convert from cents to dollars
      image: imageUrl,
      featured: data.featured || false,
      details: [], // Default empty values
      recipe: null,
    })
  } catch (error) {
    console.error("Full error in addProduct:", error);
    return { serverError: ["Failed to add product due to a server error."] };
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
  imageUrl: z.instanceof(File).refine((file) => file.size > 0, { message: 'Image is required.' }),
  productId: z.string().min(1, { message: "A product must be linked" }),
});

export async function addBanner(prevState: unknown, formData: FormData) {
  const result = bannerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    console.error("Banner validation error:", result.error.formErrors);
    return { error: "Invalid data provided." };
  }

  try {
    const db = getDb();
    const imageUrl = await uploadImage(result.data.imageUrl);
    await db.collection("banners").add({
      title: result.data.title,
      subtitle: result.data.subtitle,
      productId: result.data.productId,
      imageUrl: imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true,
    });
  } catch (error) {
    console.error("Error in addBanner:", error);
    return { error: "Failed to add banner due to a server error." };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect('/admin/banners')
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const db = getDb();
    const snapshot = await db.collection('banners').orderBy("createdAt", "desc").where("active", "==", true).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));

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
    // A switch sends "on" when checked, and nothing when unchecked.
    // We preprocess this to a boolean.
    allowSignups: z.preprocess((val) => val === 'on', z.boolean().default(false)),
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
