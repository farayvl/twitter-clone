"use client";

import React, { useEffect, useState } from "react";
import PenIcon from "@/assets/main/svg/pen-icon";
import BookmarkPostIcon from "@/assets/main/svg/bookmark-post-icon";
import CommentPostIcon from "@/assets/main/svg/comment-post-icon";
import HeartPostIcon from "@/assets/main/svg/heart-post-icon";
import Image from "next/image";
import { supabase } from "../../../../../supabaseClient";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    login: string;
    username: string;
    avatar_url: string | null;
  }>({ login: "", username: "", avatar_url: null });

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("token");
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("login, username, avatar_url")
        .eq("id", userId)
        .single();

      if (data) setUser(data);
    };

    fetchUser();
  }, []);

  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <div className="bg-[#969696] w-[100px] h-[100px] rounded-[100px]" />
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[20px] m-0 p-0 text=[#000000] gap-3 flex flex-row">
          {user.username} <PenIcon />
          </div>
          <div className="text-[15px] text-[#444444] m-0 p-0">
            @{user.login}
          </div>
        </div>
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col">
        <div className="flex flex-row items-center gap-2 mb-5">
          <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px]" />
          <div className="flex gap-1 flex-col leading-none">
            <div className="text-[15px] m-0 p-0">Alex</div>
            <div className="text-[11px] text-[#444444] m-0 p-0">
              Your Friend
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          A picture from the campground 😍
          <div className="relative w-full overflow-hidden rounded-[10px]">
            <Image
              src="/assets/image/image.png"
              alt="Post image"
              width={800}
              height={0}
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row gap-5 ml-3">
              <BookmarkPostIcon />
              <HeartPostIcon />
              <CommentPostIcon />
            </div>
            <div className="flex flex-row gap-5">
              <button className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-5 w-full whitespace-nowrap">
                Change post
              </button>
              <button className="flex justify-center items-center h-[50px] bg-[#FF4A4A] text-white rounded-[15px] text-[15px] px-5 w-full whitespace-nowrap">
                Delete post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
