"use client";

import { useState, useEffect } from "react";
import FriendIcon from "@/assets/main/svg/friend-icon";
import FriendCard from "../../components/friend-card";
import { supabase } from "../../../../../../supabaseClient";

// types.ts
export interface FriendRelation {
  id: string; 
  created_at: string; 
  user1_id: string; 
  user2_id: string; 
}

export interface UserProfile {
  id: string; 
  created_at?: string; 
  login: string;
  username: string;
  avatar_url: string | null;
}
export default function FriendsPage() {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [, setIsLoading] = useState(false);
  const userId = localStorage.getItem("token");
  
  useEffect(() => {
    const fetchFriends = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data: friendRelations, error: relationsError } = await supabase
          .from("friends")
          .select("*")
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

        if (relationsError) throw relationsError;

        const friendIds = friendRelations?.map((relation: FriendRelation) => 
          relation.user1_id === userId ? relation.user2_id : relation.user1_id
        ) || [];

        const { data: friendsProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", friendIds);

        if (profilesError) throw profilesError;

        setFriends(friendsProfiles as UserProfile[]);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setIsLoading(false);
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
