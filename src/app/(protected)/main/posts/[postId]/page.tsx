// app/(protected)/main/posts/[postId]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../../../supabaseClient";
import Post from "@/app/(protected)/main/components/post";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const searchParams = useSearchParams();
  const commentId = searchParams.get("commentId");

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.postId)
        .single();
      setPost(data);
    };

    if (params.postId) fetchPost();
  }, [params.postId]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className="bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <Post post={post} />
    </div>
  );
}
