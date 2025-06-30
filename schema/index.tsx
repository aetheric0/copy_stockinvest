import * as z from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  fullname: z.string().min(1, {
    message: "Full name is required",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }), // Making phone number optional for this schema
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  confirmPassword: z.string().min(8, {
    message: "Confirm password must be at least 8 characters long",
  }),
  phoneNumber: z.string().min(10, { // Example: Minimum 10 digits for a phone number
    message: "Phone number must be at least 10 digits long",
  }).optional(),
  country: z.string().min(1, {
    message: "Country is required",
  }),
  referralID : z.string().min(1, {
    message: "Referral id  is required",
  }),
})

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Invalid email address",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long",
    })
})


export const ForgetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
});

// Schema for reset password validation
export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type inference for the form
export type FormData = z.infer<typeof ResetPasswordSchema>;
