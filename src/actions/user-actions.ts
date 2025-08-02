
'use server';

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';

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
    const existingUsers: any[] = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return {
        message: 'An account with this email already exists.',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

    // Redirecting is not ideal here as it's a form action response.
    // The client-side will handle redirection based on the success flag.
    return { success: true };
  } catch (error) {
    console.error('Signup Error:', error);
    return {
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}


const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function loginUser(prevState: unknown, formData: FormData) {
    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Invalid data provided."
        };
    }

    const { email, password } = validatedFields.data;

    try {
        const users: any[] = await query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return { message: 'No user found with this email.' };
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return { message: 'Incorrect password.' };
        }

        // In a real app, you would set up a session here (e.g., with cookies, JWT).
        // For now, we will just return success and let the client redirect.
        // We are assuming anyone who can log in is an admin for this demo.
        if (user.role !== 'admin') {
           // For now, we allow any user to login to the admin panel
           // return { message: 'You do not have permission to access the admin area.' };
        }

    } catch (error) {
        console.error('Login Error:', error);
        return { message: 'An unexpected database error occurred.' };
    }

    // Since server actions on pages can't directly redirect before render,
    // we return a success flag and let the client-side `useEffect` handle redirection.
    return { success: true };
}
