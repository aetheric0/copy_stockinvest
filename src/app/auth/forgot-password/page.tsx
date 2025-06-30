"use client";

import CardWrapper from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ForgetPasswordSchema } from "@root/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MailIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const router = useRouter();

  type FormData = z.infer<typeof ForgetPasswordSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!recaptchaValue) {
      setError("Please complete the CAPTCHA verification");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          recaptchaToken: recaptchaValue, // Added separately
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to send reset email");
      }

      setSuccess(responseData.message || "Reset link sent to your email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      label="Forgot your password?"
      title=""
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
      showForgetButton={false} 
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-10 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={setRecaptchaValue}
            onExpired={() => setRecaptchaValue(null)}
          />
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !recaptchaValue}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}