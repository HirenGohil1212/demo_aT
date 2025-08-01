
// src/app/api/categories/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 
import type { Category } from '@/types';

// This ensures that this route is dynamically rendered and not cached.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // This will now attempt to get the categories from the database.
    const categories = await query('SELECT id, name FROM categories ORDER BY name ASC') as Category[];
    return NextResponse.json(categories);

  } catch (error) {
    // This block will now catch the specific error from testConnection
    // and return it in the response, making it visible.
    console.error('API Error in /api/categories:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ message: 'Failed to connect to the database', error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
