import ResetPasswordForm from "@/components/auth/reset-password"
import { notFound } from "next/navigation"

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  if (!token) {
    return notFound()
  }

  return <ResetPasswordForm token={token} />
}
