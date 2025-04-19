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
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    setConfirmPasswordError("");
    setUsernameError("");
    setEmailError("");
    setLoginError("");
    setPasswordError("");

    let hasErrors = false;

    if (!email) {
      setEmailError("Enter your email.");
      hasErrors = true;
    }

    if (!login) {
      setLoginError("Enter your login");
      hasErrors = true;
    }

    if (!username) {
      setUsernameError("Enter your username");
      hasErrors = true;
    }

    if (!password) {
      setPasswordError("Enter your password.");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match!");
      return;
    }

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (checkError) {
        console.error("Email validation error:", checkError.message);
        setEmailError("Email validation error, try again later.");
        return;
      }

      if (existingUser) {
        setEmailError("An account with this email already exists.");
        return;
      }
    } catch (error) {
      console.error("Email validation error:", error.message);
      return;
    }

    // ✅ Регистрируем пользователя
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
      router.push(`/auth/confirmation-sended?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div
      className={`flex justify-center items-center h-screen flex-col ${abeezee.className}`}
    >
      <div className="flex-col flex justify-center items-center w-[332px]">
        <div className="text-[32px] mb-5 font-bold">Registration</div>
        <div className="flex flex-col gap-5 w-full">
          <div>
            {" "}
            <input
              type="text"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
            />
            {emailError ? (
              <div className="text-[#FF4A4A]">{emailError}</div>
            ) : null}
          </div>
          <div>
            {" "}
            <input
              type="text"
              placeholder="Enter your login..."
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
            />
            {loginError ? (
              <div className="text-[#FF4A4A]">{loginError}</div>
            ) : null}
          </div>
          <div>
            {" "}
            <input
              type="text"
              placeholder="Enter your username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-7 bg-[#E7E7E7] h-[50px] rounded-[10px] text-[15px] w-full"
            />
            {usernameError ? (
              <div className="text-[#FF4A4A]">{usernameError}</div>
            ) : null}
          </div>
          <div className="flex flex-col">
            {" "}
            <div className="flex flex-col gap-5">
              {" "}
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
            {passwordError ? (
              <div className="text-[#FF4A4A]">{passwordError}</div>
            ) : null}
            {confirmPasswordError ? (
              <div className="text-[#FF4A4A]">{confirmPasswordError}</div>
            ) : null}
          </div>
        </div>
        <button
          onClick={handleRegister}
          className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white w-full mt-5 rounded-[10px] text-[15px] cursor-pointer"
        >
          Continue
        </button>
        <div className="mt-4">
          Already have an account?{" "}
          <a href="/auth/login" className="text-[#5BB8FF]">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
