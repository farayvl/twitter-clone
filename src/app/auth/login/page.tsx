"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ABeeZee } from "next/font/google";
import { supabase } from "../../../../supabaseClient";

const abeezee = ABeeZee({ subsets: ["latin"], weight: "400" });

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!data.user?.id) {
        throw new Error("Authentication failed: No user ID received");
      }

      localStorage.setItem("token", data.user.id);
      router.replace(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex justify-center items-center h-screen flex-col ${abeezee.className}`}>
      <div className="flex-col flex justify-center items-center w-[332px]">
        <div className="text-[32px] mb-5 font-bold">Log in</div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm w-full text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5 w-full">
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
            disabled={isLoading}
          />
        </div>

        <button 
          onClick={handleLogin} 
          disabled={isLoading}
          className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white w-full mt-5 rounded-[10px] text-[15px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Continue"}
        </button>

        <div className="mt-4">
          Don’t have an account?{" "}
          <a href="/auth/registration" className="text-[#5BB8FF]">
            Registration
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}