"use client";

import Link from "next/link";

interface ForgetButtonProps {
  label?: string;
  href?:string;
}

const ForgetButton = ({ label="forgot password?", href="/auth/forgot-password" }: ForgetButtonProps) => {
  return (
    <Link  href={href} className="text-green-500 hover:underline text-sm ">
      {label}
    </Link>
  );
};
export default ForgetButton;