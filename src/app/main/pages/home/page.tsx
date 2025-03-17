"use client";

import { useState, useRef, useEffect } from "react";
import GifIcon from "@/assets/main/svg/gif-icon";
import HomeIcon from "@/assets/main/svg/home-icon";
import ImgIcon from "@/assets/main/svg/img-icon";
import SmileIcon from "@/assets/main/svg/smile-icon";
import VideoIcon from "@/assets/main/svg/video-icon";
import Post from "../../components/post";
import { supabase } from "../../../../../supabaseClient";

export default function HomePage() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      console.log("Data:", data, "Error:", error);
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <HomeIcon color="#969696" />
        Home
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col justify-between">
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
      <div className="h-[1px] w-full bg-[#969696]" />
      <Post />
      <Post />
      <Post />
    </div>
  );
}
