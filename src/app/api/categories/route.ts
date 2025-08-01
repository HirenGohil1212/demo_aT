
// src/app/api/categories/route.ts
/*
import { NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/db'; // Import testConnection
import type { Category } from '@/types';

// This ensures that this route is dynamically rendered and not cached.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // We are calling the new connection test function.
    // This will log the result to the server console.
    await testConnection();
    
    // For now, we will return an empty array to prevent the app from crashing
    // while we diagnose the connection issue. Once the connection is successful,
    // we will restore the original query logic here.
    const categories: Category[] = [];

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
*/
