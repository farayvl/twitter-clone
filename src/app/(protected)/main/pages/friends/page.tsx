"use client";

import { useState, useEffect } from "react";
import FriendIcon from "@/assets/main/svg/friend-icon";
import FriendCard from "../../components/friend-card";
import { supabase } from "../../../../../../supabaseClient";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const userId = localStorage.getItem("token");
  
  useEffect(() => {
    const fetchFriends = async () => {
      const { data } = await supabase
        .from("friends")
        .select("*")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (data) {
        const friendIds = data.map((f) =>
          f.user1_id === userId ? f.user2_id : f.user1_id
        );

        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", friendIds);

        setFriends(profiles || []);
      }
    };

    fetchFriends();
  }, [userId]);

  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <FriendIcon color="#969696" />
        Friends
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      {/* ... существующая верстка */}
      <div className="flex flex-col gap-0 p-5">
        {friends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onRemove={() =>
              setFriends((prev) => prev.filter((f) => f.id !== friend.id))
            }
          />
        ))}
      </div>
    </div>
  );
}
