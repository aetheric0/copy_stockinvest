import ResetPasswordForm from "@/components/auth/reset-password";
import { notFound } from "next/navigation";

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;

  if (!token) {
    return notFound();
  }

  return <ResetPasswordForm token={token} />;
}