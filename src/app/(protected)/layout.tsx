"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import AuthGuard from "../components/auth-guard";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  return <AuthGuard>{children}</AuthGuard>;
}