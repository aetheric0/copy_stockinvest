// src/app/api/login/route.ts
import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { email, password, recaptchaToken } = await req.json();

        const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
        const recaptchaRes = await fetch(recaptchaUrl, { method: 'POST' });
        const recaptchaData = await recaptchaRes.json();

        if (!recaptchaData.success) {
            return NextResponse.json(
                { error: 'CAPTCHA verification failed' },
                { status: 400 }
            );
        }

        if (!email || !password) {
            return NextResponse.json({ error: 'Please provide both email and password' }, { status: 400 });
        }

        // Find the user by email, explicitly selecting the password
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }); // 401 Unauthorized
        }

        // Compare the provided password with the stored hashed password
       const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            console.log("Password mismatch for user:", user.email);
            return NextResponse.json(
                { error: "Invalid credentials" },
            { status: 401 }
            );
        }
        const tokenPayload = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expiration time can be adjusted
        // Update last login time
        user.lastLogin = new Date();
        await user.save();

        // Create a session or JWT here (we'll implement this in a later step)
        // For now, let's just return basic user info
        const response = NextResponse.json(
            { message: 'Login successful', user: { id: user._id, username: user.username, fullname: user.fullname, email: user.email } },
            { status: 200 }
        );

        response.cookies.delete('authToken');
        
        response.cookies.set({
            name: 'authToken',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // Same expiry as the token
            sameSite: 'lax',
        });
        return response// 200 OK

    } catch (error: unknown) {
        console.error('Login failed:', error);
        return NextResponse.json({ error: 'Something went wrong during login' }, { status: 500 });
    }
}
