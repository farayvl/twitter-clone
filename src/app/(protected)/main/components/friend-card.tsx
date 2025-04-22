"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../../../../../supabaseClient";

interface FriendProfile {
  id: string;
  username: string;
  login: string;
  avatar_url: string | null;
  // Другие поля профиля, если они есть
}

interface FriendCardProps {
  friend: {
    id: string;
  };
  onRemove: () => void;
}

export default function FriendCard({ friend, onRemove }: FriendCardProps) {
  const [friendProfile, setFriendProfile] = useState<FriendProfile | null>(null);

  useEffect(() => {
    const fetchFriend = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', friend.id)
        .single();
      setFriendProfile(data);
    };
    fetchFriend();
  }, [friend]);

  const handleRemove = async () => {
    await supabase
      .from('friends')
      .delete()
      .or(`user1_id.eq.${friend.id},user2_id.eq.${friend.id}`);

    onRemove();
  };

  if (!friendProfile) return null;

  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row items-center gap-2 mb-5">
        <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px] overflow-hidden">
          {friendProfile.avatar_url && (
            <Image 
              width={35}
              height={35}
              src={friendProfile.avatar_url} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[15px] m-0 p-0">{friendProfile.username}</div>
          <div className="text-[11px] text-[#444444] m-0 p-0">@{friendProfile.login}</div>
        </div>
      </div>
      <button 
        onClick={handleRemove}
        className="text-[15px] text-[#FF4A4A] cursor-pointer"
      >
        Delete friend
      </button>
    </div>
  );
}
