import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from '@/lib/models/user';
import { sendMail, sendPasswordResetEmail } from "@/lib/mail";
import { generateResetToken } from "@/lib/token";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL as string;

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, recaptchaToken } = await req.json();

    // Verify reCAPTCHA first
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
    const recaptchaRes = await fetch(recaptchaUrl, { method: 'POST' });
    const recaptchaData = await recaptchaRes.json();
    
    if (!recaptchaData.success) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Check if user exists (but don't reveal if they don't)
    const existingUser = await User.findOne({ email });

    // Return same success message regardless to prevent email enumeration
    if (!existingUser) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent password reset instructions",
      });
    }

    // Generate reset token
    const token = generateResetToken({
      userId: existingUser._id.toString(),
      email: existingUser.email,
    });

    // Send email
    const resetLink = `${APP_URL}/auth/reset-password/${token}`;
    const emailOptions = sendPasswordResetEmail(email, resetLink);
    await sendMail(emailOptions);

    return NextResponse.json({ 
      success: true,
      message: "Reset link sent to your email" 
    });
    
  } catch (error: unknown) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" }, 
      { status: 500 }
    );
  }
}