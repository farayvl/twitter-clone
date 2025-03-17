"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";
import { supabase } from "../../../../supabaseClient";

const abeezee = ABeeZee({ subsets: ["latin"], weight: "400" });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      localStorage.setItem("token", userId);
      router.push("/main/pages/home");
    }
  };

  return (
    <div className={`flex justify-center items-center h-screen flex-col ${abeezee.className}`}>
      <div className="flex-col flex justify-center items-center w-[332px]">
        <div className="text-[32px] mb-5 font-bold">Log in</div>
        <div className="flex flex-col gap-5 w-full">
          <input
            type="text"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
          />
          <input
            type="password"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
          />
        </div>
        <button onClick={handleLogin} className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white w-full mt-5 rounded-[10px] text-[15px] cursor-pointer">
          Continue
        </button>
        <div className="mt-4">
          Don’t have an account? <a href="/auth/registration" className="text-[#5BB8FF]">Registration</a>
        </div>
      </div>
    </div>
  );
}
