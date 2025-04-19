"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../../../../../supabaseClient";

export default function LikePost({ notification }) {
  const sender = notification?.sender;

  const handleClick = () => {
    const url = `/main/posts/${notification.post_id}`;
    window.location.href = url;
  };
  
    const [user, setUser] = useState<{
      login: string;
      username: string;
      avatar_url: string | null;
    }>({
      login: "",
      username: "",
      avatar_url: null,
    });
  
    useEffect(() => {
      const fetchUser = async () => {
        const userId = localStorage.getItem("token");
        if (!userId) return;
  
        const { data } = await supabase
          .from("profiles")
          .select("login, username, avatar_url")
          .eq("id", userId)
          .single();
  
        if (data) setUser(data);
      };
  
      fetchUser();
    }, []);

  return (
    <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col cursor-pointer" onClick={handleClick}>
      <div className="flex flex-row items-center gap-2 mb-5">
        <Image
          width={35}
          height={35}
          src={sender?.avatar_url || "/default-avatar.png"}
          alt="Avatar"
          className="rounded-full h-[35px] w-[35px] object-cover"
        />
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[15px] m-0 p-0">
            {sender?.username || "Unknown"}
          </div>
          <div className="text-[11px] text-[#444444] m-0 p-0">
            @{sender?.login}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        Liked your post
        <div className="relative w-full overflow-hidden rounded-[10px]">
          <div className="bg-[#FFFFFF] p-5 m-5 rounded-[15px] flex flex-col">
            <div className="flex flex-row items-center gap-2 mb-5">
              <Image
                width={35}
                height={35}
                src={user.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className="rounded-full h-[25px] w-[25px] object-cover"
              />
              <div className="flex gap-1 flex-col leading-none">
                <div className="text-[12px] m-0 p-0">{user?.username}</div>
                <div className="text-[10px] text-[#444444] m-0 p-0">
                  @{user.login}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-[12px]">
              <div className="relative w-full overflow-hidden rounded-[10px]">
                {notification?.post?.media_url && (
                  <Image
                    src={notification.post.media_url}
                    alt="Post image"
                    width={600}
                    height={0}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
