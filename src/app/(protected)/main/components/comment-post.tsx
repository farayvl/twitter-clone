import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../../../../../supabaseClient";

export default function CommentPost() {
  const [user, setUser] = useState<{
    login: string;
    username: string;
    avatar_url: string | null;
  }>({
    login: "",
    username: "",
    avatar_url: null,
  });
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [login, setLogin] = useState<string | null>(null);

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
    <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col">
      <div className="flex flex-row items-center gap-2 mb-5">
        <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px]" />
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[15px] m-0 p-0">Alex</div>
          <div className="text-[11px] text-[#444444] m-0 p-0">Your Friend</div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="text-[12px] text-[#444444]">Commented your post:</div>
        <div className="text-[15px]">Wow! So beautiful!!</div>
        <div className="relative w-full overflow-hidden rounded-[10px]">
          <div className="bg-[#FFFFFF] p-5 m-5 rounded-[15px] flex flex-col">
            <div className="flex flex-row items-center gap-2 mb-5">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Avatar"
                  width={25}
                  height={25}
                  className="rounded-full"
                />
              ) : (
                <div className="rounded-[100px] bg-[#969696] h-[25px] w-[25px]" />
              )}
              <div className="flex gap-1 flex-col leading-none">
                <div className="text-[12px] m-0 p-0">{username}</div>
                <div className="text-[10px] text-[#444444] m-0 p-0">
                  @{login}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-[12px]">
              A picture from the campground 😍
              <div className="relative w-full overflow-hidden rounded-[10px]">
                <Image
                  src="/assets/image/image.png"
                  alt="Post image"
                  width={600}
                  height={0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
