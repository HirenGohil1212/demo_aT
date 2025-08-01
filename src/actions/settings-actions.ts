
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { AppSettings } from '@/types';

// --- SIMULATED DATABASE ---
let appSettings: AppSettings = {
  allowSignups: false,
  whatsappNumber: '911234567890',
  minOrderQuantity: 4,
};
// --- END SIMULATED DATABASE ---

/**
 * Fetches application settings from the database.
 * @returns The application settings object.
 */
export async function getSettings(): Promise<AppSettings> {
  console.log("getSettings called, returning simulated data.");
  return appSettings;
}

/**
 * Updates application settings in the database.
 * This is a server action that handles form submission.
 */
export async function updateSettings(prevState: unknown, formData: FormData) {
  const settingsSchema = z.object({
    allowSignups: z.preprocess((val) => val === 'on', z.boolean().default(false)),
    whatsappNumber: z.string().min(10, { message: "WhatsApp number must be at least 10 digits."}).regex(/^\d+$/, { message: "WhatsApp number must contain only digits."}),
    minOrderQuantity: z.coerce.number().int().positive({ message: "Minimum order quantity must be a positive whole number."}),
  });

  const result = settingsSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return { error: result.error.flatten().fieldErrors };
  }
  
  // Update the in-memory settings
  appSettings = result.data;
  console.log("updateSettings called, using simulated data. New settings:", appSettings);
  
  revalidatePath('/admin/settings');
  revalidatePath('/signup');
  revalidatePath('/ab_login');
  revalidatePath('/cart');
  revalidatePath('/api/settings'); 
  return { success: true };
}
