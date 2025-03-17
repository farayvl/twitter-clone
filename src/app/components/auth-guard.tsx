"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Токен:", token); // Добавляем лог

    if (!token) {
      console.log("Редирект на /auth/login"); // Лог перед редиректом
      router.push("/auth/login");
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated === null) return null;

  return <>{children}</>;
}
