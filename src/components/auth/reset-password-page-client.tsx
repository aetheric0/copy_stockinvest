import ResetPasswordForm from "@/components/auth/reset-password"
import { notFound } from "next/navigation"

interface ResetPasswordPageProps {
  params: {
    token: string
  }
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  if (!params.token) {
    return notFound()
  }

  return (
      <ResetPasswordForm token={params.token} />
  )
}
