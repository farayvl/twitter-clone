"use client";

import BookmarkIcon from "@/assets/main/svg/bookmark-icon";
import React, { useEffect, useState } from "react";
import Post from "../../components/post";
import { supabase } from "../../../../../../supabaseClient";

interface Post {
  id: string;
  user_id: string;
  text: string;
  media_url?: string | null;
  created_at: string;
}

export default function StoragePage() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: saved } = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", user.id);

      if (!saved?.length) {
        setSavedPosts([]);
        return;
      }

      const { data: posts } = await supabase
        .from("posts")
        .select("*, user:profiles(id, username, avatar_url)") 
        .in(
          "id",
          saved.map((item) => item.post_id)
        )
        .order("created_at", { ascending: false }); 

      setSavedPosts(posts || []);
    };

    fetchSavedPosts().finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <BookmarkIcon color="#969696" />
        Storage
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          Loading...
        </div>
      ) : savedPosts.length > 0 ? (
        savedPosts.map((post) => <Post key={post.id} post={post} />)
      ) : (
        <div className="flex-1 flex justify-center items-center">
          No saved posts
        </div>
      )}
    </div>
  );
}
