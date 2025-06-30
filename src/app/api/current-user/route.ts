import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
   try {
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
        return NextResponse.json(
            {error: 'Not authenticated'},
            {status: 401}
        );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json(decoded);
   } catch (error) {
    console.log('Token verification failed', error);
    return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
    );
   }
}