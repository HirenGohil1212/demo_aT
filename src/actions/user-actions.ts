
'use server';

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

export async function signupUser(prevState: unknown, formData: FormData) {
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUsers: any[] = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return {
        message: 'An account with this email already exists.',
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    // The role defaults to 'user' in the database schema
    await query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

    return { success: true };
  } catch (error) {
    console.error('Signup Error:', error);
    return {
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
