"use client"

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function ConfirmationContent() {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const BackToLogin = () => {
    router.push("login")
  }

  return (
    <div className={`flex justify-center items-center h-screen flex-col`}>
      <div className="flex-col flex justify-center items-center bg-[#E9E9E9] p-20 rounded-[50px]">
        <div className="text-[20px] text-center">
          A link to confirm your account has been sent to <br />  
          {email}
        </div>
        <button onClick={BackToLogin} className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white p-5 w-full mt-5 rounded-[10px] text-[15px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          Back to login page
        </button>
      </div>
    </div>
  );
}

export default function ConfirmationSendedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
