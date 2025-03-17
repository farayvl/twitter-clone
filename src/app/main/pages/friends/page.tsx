import FriendIcon from "@/assets/main/svg/friend-icon";
import React from "react";
import FriendCard from "../../components/friend-card";

export default function FriendsPage() {
  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <FriendIcon color="#969696" />
        Friends
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      <div className="flex flex-col gap-0 p-5">
        <FriendCard/>
        <FriendCard/>
        <FriendCard/>
        <FriendCard/>
      </div>
    </div>
  );
}
