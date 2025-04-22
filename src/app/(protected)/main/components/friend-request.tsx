import React, { useEffect, useState } from "react";
import { supabase } from "../../../../../supabaseClient";
import Image from "next/image";

interface Profile {
  id: string;
  username: string;
  login: string;
  avatar_url: string | null;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
}

interface FriendRequestProps {
  request: FriendRequest;
  onUpdate: () => void;
}

export default function FriendRequest({ request, onUpdate }: FriendRequestProps) {
  const [sender, setSender] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchSender = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', request.sender_id)
        .single();
      setSender(data);
    };
    fetchSender();
  }, [request]);

  const handleResponse = async (status: 'accepted' | 'rejected') => {
    await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', request.id);

    if (status === 'accepted') {
      await supabase.from('friends').insert([
        { user1_id: request.receiver_id, user2_id: request.sender_id }
      ]);
    }
    
    onUpdate();
  };

  if (!sender) return null;

  return (
    <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col">
      <div className="flex flex-row items-center gap-2 mb-5">
        <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px] overflow-hidden">
          {sender.avatar_url && (
            <Image 
              width={35}
              height={35}
              src={sender.avatar_url} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[15px] m-0 p-0">{sender.username}</div>
          <div className="text-[11px] text-[#444444] m-0 p-0">@{sender.login}</div>
        </div>
      </div>
      <div className="flex flex-col">Want to become your friend.</div>
      <div className="flex flex-row justify-between gap-10 mt-5">
        <button 
          onClick={() => handleResponse('accepted')}
          className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-10 w-full"
        >
          Add friend
        </button>
        <button 
          onClick={() => handleResponse('rejected')}
          className="flex justify-center items-center h-[50px] bg-[#FF4A4A] text-white rounded-[15px] text-[15px] px-10 w-full"
        >
          Reject
        </button>
      </div>
    </div>
  );
}