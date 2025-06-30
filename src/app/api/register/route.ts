// src/app/api/register/route.ts
import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/user'; // Import the User model

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { username, fullname, email, password, confirmPassword, phoneNumber, country, referralID, recaptchaToken } = await req.json();

        // reCAPTCHA Verification
        const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
        const recaptchaRes = await fetch(recaptchaUrl, { method: 'POST' });
        const recaptchaData = await recaptchaRes.json();

        if (!recaptchaData.success) {
            return NextResponse.json(
                { error: 'CAPTCHA verification failed' },
                { status: 400 }
            );
        }
        // Server-side validation for required fields
        if (!username || !fullname || !email || !password || !confirmPassword || !country) {
            return NextResponse.json(
                { error: 'Please fill in all required fields' },
                { status: 400 }
            );
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
        }

        // Check if the username or email already exists (case-insensitive)
        const existingUser = await User.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: email.toLowerCase() },
            ],
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
            }
            if (existingUser.username === username.toLowerCase()) {
                return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
            }
        }

        // Create a new user
        const newUser = new User({
            username,
            fullname,
            email,
            password, // Password will be hashed by middleware
            phoneNumber,
            country,
            referralID: referralID ? referralID.toUpperCase() : undefined,
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Respond with success
        return NextResponse.json(
            {
                message: 'User registered successfully',
                user: {
                    id: savedUser._id,
                    username: savedUser.username,
                    fullname: savedUser.fullname,
                    email: savedUser.email,
                    isVerified: savedUser.isVerified,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration failed:', error);

        // Handle Mongoose validation errors
        if (error?.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                { message: 'Registration failed due to validation errors', errors },
                { status: 400 }
            );
        }

        // Handle other errors
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong during registration';
        return NextResponse.json(
            { message: errorMessage },
            { status: 500 }
        );
    }
}
