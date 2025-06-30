"use client";

import CardWrapper from "./card-wrapper";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoginSchema } from "@root/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import type { z } from "zod";
import { MailIcon, LockIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from '@/contexts/user/user-context';

type FormData = z.infer<typeof LoginSchema>;

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { fetchUser } = useUser();
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    if (!recaptchaValue) {
      setError("Please complete the CAPTCHA verification");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ ...data, recaptchaToken: recaptchaValue }),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Login failed');
      await fetchUser();
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      label="Login to your Account"
      title="Login"
      backButtonHref="/auth/register"
      backButtonLabel="Don't have an account? Register Here"
    >
      {/* Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-black/60 z-50">
          <Loader2 className="animate-spin h-16 w-16 text-primary" />
          <span className="sr-only">Logging in...</span>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`space-y-6 ${loading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <FormControl>
                      <Input {...field} className="pl-10 h-10 text-lg" />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <FormControl>
                      <Input {...field} type="password" className="pl-10 h-10 text-lg" />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => setRecaptchaValue(token)}
            onExpired={() => setRecaptchaValue(null)}
          />

          {error && <p className="text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !recaptchaValue}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
