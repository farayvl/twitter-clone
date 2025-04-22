"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../../../supabaseClient";
import NotificationIcon from "@/assets/main/svg/notification-icon";
import LikePost from "../../components/like-post";
import CommentPost from "../../components/comment-post";
import FriendRequest from "../../components/friend-request";

interface Notification {
  sender: {
    username: string;
    login: string;
    avatar_url: string | null;
  };
  post_id: string;
  post?: {
    media_url: string | null;
  };
}

interface FriendRequest {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const userId = localStorage.getItem("token");

  useEffect(() => {
    // Create a flag to track mounted state
    let isMounted = true;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          sender:profiles!sender_id(username, avatar_url, login),
          post:posts!post_id(media_url)
        `
        )
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false });

      if (!error && isMounted) {
        console.log("Notifications data:", data);
        setNotifications(data);
      } else if (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          if (isMounted) {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

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
      {requests.map((request) => (
        <FriendRequest
          key={request.id}
          request={request}
          onUpdate={() =>
            setRequests((prev) => prev.filter((r) => r.id !== request.id))
          }
        />
      ))}
      {notifications.map((notification) => {
        if (notification.comment_text && notification.post_id) {
          return (
            <CommentPost key={notification.id} notification={notification} />
          );
        }

        if (!notification.comment_text && notification.post_id) {
          return <LikePost key={notification.id} notification={notification} />;
        }

        return null;
      })}
    </div>
  );
}
