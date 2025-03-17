"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";
import { supabase } from "../../../../supabaseClient";

const abeezee = ABeeZee({ subsets: ["latin"], weight: "400" });

export default function RegistrationPage() {
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          login,
          username,
          email,
          avatar_url: "",
        },
      ]);

      if (profileError) {
        alert(profileError.message);
        return;
      }

      localStorage.setItem("token", userId);
      router.push("/main/pages/home");
    }
  };

  return (
    <div className={`flex justify-center items-center h-screen flex-col ${abeezee.className}`}>
      <div className="flex-col flex justify-center items-center w-[332px]">
        <div className="text-[32px] mb-5 font-bold">Registration</div>
        <div className="flex flex-col gap-5 w-full">
          <input
            type="text"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
          />
          <input
            type="text"
            placeholder="Enter your login..."
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
          />
          <input
            type="text"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
          />
          <input
            type="password"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
          />
          <input
            type="password"
            placeholder="Repeat password..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
          />
        </div>
        <button onClick={handleRegister} className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white w-full mt-5 rounded-[10px] text-[15px] cursor-pointer">
          Continue
        </button>
        <div className="mt-4">
          Already have an account? <a href="/auth/login" className="text-[#5BB8FF]">Log in</a>
        </div>
      </div>
    </div>
  );
}
