import BookmarkIcon from "@/assets/main/svg/bookmark-icon";
import React from "react";
import Post from "../../components/post";

export default function StoragePage() {
  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <BookmarkIcon color="#969696" />
        Storage
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      <Post />
      <Post />
      <Post />
    </div>
  );
}
