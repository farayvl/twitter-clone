"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../../../../../supabaseClient";
import Post from "../../components/post";

export default function OtherProfilePage() {
  const searchParams = useSearchParams();

  const avatar = searchParams.get("avatar");
  const login = searchParams.get("login");
  const username = searchParams.get("username");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      if (!login) return;

      try {
        // 1. Сначала находим user_id по логину
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id")
          .eq("login", login)
          .single();

        if (userError || !userData) {
          console.error("User not found:", userError);
          return;
        }

        const userId = userData.id;

        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (postsError) {
          console.error("Error loading posts:", postsError);
        } else {
          setPosts(postsData || []);
        }
      } catch (error) {
        console.error("Error in fetchUserAndPosts:", error);
      }
    };

    fetchUserAndPosts();
  }, [login]);

  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        {avatar ? (
          <Image
            src={avatar}
            alt="Avatar"
            width={100}
            height={100}
            className="rounded-full object-cover w-[100px] h-[100px]"
          />
        ) : (
          <div className="bg-[#969696] w-[100px] h-[100px] rounded-full flex items-center justify-center" />
        )}
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[20px] m-0 p-0 text=[#000000] gap-3 flex flex-row">
            <div className="text-[#000000]">{username || "Unknown"}</div>
          </div>
          <div className="text-[15px] text-[#444444] m-0 p-0">
            @{login || "user"}
          </div>
        </div>
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
