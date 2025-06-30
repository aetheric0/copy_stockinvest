import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/user";
import { verifyResetToken } from "@/lib/token";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, password, recaptchaToken } = await req.json();

    // Debug logs
    console.log("Incoming reset request:", { 
      token: token.substring(0, 10) + "...", 
      passwordLength: password.length,
      recaptchaToken: recaptchaToken?.substring(0, 10) + "..."
    });

    // 1. Verify reCAPTCHA
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
    const recaptchaRes = await fetch(recaptchaUrl, { method: 'POST' });
    const recaptchaData = await recaptchaRes.json();
    
    if (!recaptchaData.success) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // 2. Verify reset token
    let payload;
    try {
      payload = verifyResetToken(token);
      console.log("Token payload:", payload);
    } catch (err) {
      console.error("Token verification failed:", err);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // 3. Find user
    const user = await User.findById(payload.userId).select('+password');
    if (!user) {
      console.log("User not found for ID:", payload.userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 4. Set the new plaintext password
    console.log("User before update:", {
      _id: user._id,
      email: user.email,
      currentHash: user.password?.substring(0, 10) + "..."
    });
    
    user.password = password; // Let Mongoose pre-save hook handle hashing
    await user.save(); // This triggers the hashing in your user model

    // 5. Verify the update
    const updatedUser = await User.findById(user._id).select('+password');
    const passwordMatches = await bcrypt.compare(password, updatedUser.password);

    console.log("Verification results:", {
      inputPassword: password,
      storedHash: updatedUser.password?.substring(0, 10) + "...",
      matches: passwordMatches
    });

    if (!passwordMatches) {
      throw new Error("Password update failed - hash mismatch");
    }

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });

  } catch (error: any) {
    console.error("Reset password error:", {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}