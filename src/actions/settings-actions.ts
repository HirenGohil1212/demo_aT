
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase-admin';
import type { AppSettings } from '@/types';

const defaultSettings: AppSettings = {
  allowSignups: true,
};

/**
 * Fetches application settings from Firestore.
 * If no settings exist, it creates them with default values.
 * @returns The application settings object.
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const settingsDoc = await db.collection('settings').doc('config').get();

    if (!settingsDoc.exists) {
      // If settings don't exist, create them with default values
      await db.collection('settings').doc('config').set(defaultSettings);
      return defaultSettings;
    }
    const data = settingsDoc.data();
    // Merge with defaults to ensure new settings are present
    return { ...defaultSettings, ...data } as AppSettings;
  } catch (error) {
    console.error("Error in getSettings:", error);
    // Return default settings on error to avoid crashing the app
    return defaultSettings;
  }
}

/**
 * Updates application settings in Firestore.
 * This is a server action that handles form submission.
 */
export async function updateSettings(prevState: unknown, formData: FormData) {
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
