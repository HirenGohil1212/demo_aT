// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Category } from '@/types';

// This ensures that this route is dynamically rendered and not cached.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // This assumes you have a table named 'categories' with 'id' and 'name' columns.
    // You will need to create this table in your MySQL database.
    const results = await query('SELECT id, name FROM categories ORDER BY name ASC');
    
    // The query returns rows, we'll cast them to the Category type.
    const categories: Category[] = results as Category[];

    return NextResponse.json(categories);
  } catch (error) {
    console.error('API Error in /api/categories:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to fetch categories' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
