
import connectDB from '@/lib/db';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    return NextResponse.json({ message: 'Database connection successful!' }, { status: 200 });
  } catch (error) {
    console.error('Database connection failed:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Database connection failed', error: errorMessage }, { status: 500 });
  }
}