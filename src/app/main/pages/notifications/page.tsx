import React from "react";
import NotificationIcon from "@/assets/main/svg/notification-icon";
import Image from "next/image";
import BookmarkPostIcon from "@/assets/main/svg/bookmark-post-icon";
import HeartPostIcon from "@/assets/main/svg/heart-post-icon";
import CommentPostIcon from "@/assets/main/svg/comment-post-icon";
import LikePost from "../../components/like-post";
import Post from "../../components/post";
import CommentPost from "../../components/comment-post";
import FriendRequest from "../../components/friend-request";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <NotificationIcon color="#969696" />
        Notifications
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      <LikePost />
      <CommentPost />
      <FriendRequest/>
    </div>
  );
}
