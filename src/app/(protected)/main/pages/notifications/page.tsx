"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../../../supabaseClient";
import NotificationIcon from "@/assets/main/svg/notification-icon";
import LikePost from "../../components/like-post";
import CommentPost from "../../components/comment-post";
import FriendRequest from "../../components/friend-request";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState<any[]>([]);
  const userId = localStorage.getItem("token");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // NotificationsPage.tsx
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

      if (!error) {
        console.log("Notifications data:", data); // Добавьте для отладки
        setNotifications(data);
      } else {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Реалтайм обновления
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
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
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
      {/* Отображаем запросы дружбы */}
      {requests.map((request) => (
        <FriendRequest
          key={request.id}
          request={request}
          onUpdate={() =>
            setRequests((prev) => prev.filter((r) => r.id !== request.id))
          }
        />
      ))}
      {/* Отображаем комментарии */}
      {notifications.map((notification) => {
        if (!notification.comment_id || !notification.post_id) return null;

        return (
          <CommentPost key={notification.id} notification={notification} />
        );
      })}
    </div>
  );
}
