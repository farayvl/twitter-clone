"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import HeartPostIcon from "@/assets/main/svg/heart-post-icon";
import BookmarkPostIcon from "@/assets/main/svg/bookmark-post-icon";
import CommentPostIcon from "@/assets/main/svg/comment-post-icon";
import GifIcon from "@/assets/main/svg/gif-icon";
import ImgIcon from "@/assets/main/svg/img-icon";
import SmileIcon from "@/assets/main/svg/smile-icon";
import VideoIcon from "@/assets/main/svg/video-icon";
import HeartCommentIcon from "@/assets/main/svg/heart-comment-icon";
import { supabase } from "../../../../../supabaseClient";

export default function Post({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [login, setLogin] = useState<string | null>(null);

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  useEffect(() => {
    if (post.user_id) {
      const fetchUser = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, username, login")
          .eq("id", post.user_id)
          .single();

        if (!error && data) {
          setAvatar(data.avatar_url);
          setUsername(data.username);
          setLogin(data.login);
        }
      };
      fetchUser();
    }
  }, [post.user_id]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col">
      <div className="flex flex-row items-center gap-2 mb-5">
        {avatar ? (
          <Image
            src={avatar}
            alt="Avatar"
            width={35}
            height={35}
            className="rounded-full"
          />
        ) : (
          <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px]" /> // Заглушка, если нет аватарки
        )}
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[15px] m-0 p-0">{username || "Unknown"}</div>
          <div className="text-[11px] text-[#444444] m-0 p-0">
            @{login || "user"}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {post.text}
        <div className="relative w-full overflow-hidden rounded-[10px]">
          {post.media_url && (
            <div className="relative w-full overflow-hidden rounded-[10px]">
              <Image
                src={post.media_url}
                alt="Post image"
                width={400}
                height={400}
              />
            </div>
          )}
        </div>
        <div className="flex flex-row gap-5 items-center ml-3">
          <BookmarkPostIcon />
          <HeartPostIcon />
          <button onClick={toggleComments} className="cursor-pointer">
            <CommentPostIcon filled={showComments} />
          </button>
        </div>
        {/* Обертка для анимации при добавлении и удалении */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-[#F0F0F0] p-5 rounded-[15px] flex flex-col justify-between">
                <div className="flex flex-row items-center gap-3">
                  <div className="rounded-full bg-[#969696] h-[35px] w-[35px]" />
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent text-[15px] text-[#000000] outline-none resize-none overflow-hidden"
                    placeholder="What's new?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={1}
                  />
                </div>
                <div className="flex flex-row justify-between items-center mt-3">
                  <div className="flex flex-row gap-3 items-center">
                    <GifIcon />
                    <ImgIcon />
                    <SmileIcon />
                    <VideoIcon />
                  </div>
                  <button className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-10">
                    Post
                  </button>
                </div>
              </div>
              <div className="bg-[#F0F0F0] rounded-[15px] flex flex-col justify-between mt-5">
                <div className="p-5">
                  <div className="flex flex-row items-center gap-2 mb-5">
                    <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px]" />
                    <div className="flex gap-1 flex-col leading-none">
                      <div className="text-[15px] m-0 p-0">Angelica_Super</div>
                      <div className="text-[11px] text-[#444444] m-0 p-0">
                        @angelica_12457
                      </div>
                    </div>
                  </div>
                  Wow! So beautiful!!
                  <div className="flex justify-between flex-row mt-5 text-[#969696] text-[15px]">
                    <HeartCommentIcon />
                    Answer
                  </div>
                </div>
                <div className="h-[1px] w-full bg-[#969696]" />
                <div className="p-5">
                  <div className="flex flex-row items-center gap-2 mb-5">
                    <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px]" />
                    <div className="flex gap-1 flex-col leading-none">
                      <div className="text-[15px] m-0 p-0">Angelica_Super</div>
                      <div className="text-[11px] text-[#444444] m-0 p-0">
                        @angelica_12457
                      </div>
                    </div>
                  </div>
                  Wow! So beautiful!!
                  <div className="flex justify-between flex-row mt-5 text-[#969696] text-[15px]">
                    <HeartCommentIcon />
                    Answer
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
