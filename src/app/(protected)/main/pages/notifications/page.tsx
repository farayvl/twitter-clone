"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../../../supabaseClient";
import NotificationIcon from "@/assets/main/svg/notification-icon";
import LikePost from "../../components/like-post";
import CommentPost from "../../components/comment-post";
import FriendRequest from "../../components/friend-request";

export default function NotificationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const userId = localStorage.getItem("token");

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("receiver_id", userId)
        .eq("status", "pending");

      setRequests(data || []);
    };

    fetchRequests();
  }, [userId]);

  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <NotificationIcon color="#969696" />
        Notifications
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      {/* ... существующая верстка */}
      {requests.map((request) => (
        <FriendRequest
          key={request.id}
          request={request}
          onUpdate={() =>
            setRequests((prev) => prev.filter((r) => r.id !== request.id))
          }
        />
      ))}
    </div>
  );
}
