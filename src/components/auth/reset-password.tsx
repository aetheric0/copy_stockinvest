"use client"

import CardWrapper from "@/components/auth/card-wrapper"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ResetPasswordSchema } from "@root/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LockIcon } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha"
import { toast } from "sonner"

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const router = useRouter()

  type FormData = z.infer<typeof ResetPasswordSchema>

  const form = useForm<FormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: FormData) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!recaptchaValue) {
      setError("Please complete the CAPTCHA verification")
      setLoading(false)
      return
    }

    try {
      // Reset password
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: values.password,
          recaptchaToken: recaptchaValue,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to reset password")
      }

      setSuccess(responseData.message || "Password reset successful")

      // Show success message before redirecting
      toast.success("Password reset successful", {
        description: "You will be redirected to login",
      })

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <CardWrapper
      label="Reset your password"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" className="pl-10 h-10 text-lg" />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LockIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" className="pl-10 h-10 text-lg" />
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

          <Button type="submit" className="w-full" disabled={loading || !recaptchaValue}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
