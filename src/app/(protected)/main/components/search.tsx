"use client"

import SearchIcon from "@/assets/main/svg/search-icon";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../supabaseClient";
import Image from "next/image";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<Set<string>>(new Set());
  const currentUserId = localStorage.getItem("token");

  // Добавляем состояние для принудительного обновления
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm || !currentUserId) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, login, username, avatar_url')
        .ilike('username', `%${searchTerm}%`)
        .neq('id', currentUserId);

      if (data) setUsers(data);
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, currentUserId, refreshTrigger]); // Добавляем триггер

  useEffect(() => {
    const fetchFriendsAndRequests = async () => {
      if (!currentUserId) return;

      // Обновленный запрос для друзей
      const { data: friendsData } = await supabase
        .from('friends')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

      const friendIds = new Set(
        friendsData?.flatMap(f => 
          [f.user1_id, f.user2_id].filter(id => id !== currentUserId)
        ) || []
      );
      setFriends(friendIds);

      // Обновленный запрос для запросов с учетом статуса
      const { data: requestsData } = await supabase
        .from('friend_requests')
        .select('receiver_id, status')
        .eq('sender_id', currentUserId)
        .eq('status', 'pending');

      const requestIds = new Set(
        requestsData?.map(r => r.receiver_id) || []
      );
      setSentRequests(requestIds);
    };

    fetchFriendsAndRequests();
  }, [currentUserId, refreshTrigger]); // Добавляем триггер

  const sendFriendRequest = async (receiverId: string) => {
    if (!currentUserId) return;

    // Удаляем из друзей если были друзьями
    await supabase
      .from('friends')
      .delete()
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
      .or(`user1_id.eq.${receiverId},user2_id.eq.${receiverId}`);

    const { error } = await supabase
      .from('friend_requests')
      .insert([{ 
        sender_id: currentUserId, 
        receiver_id: receiverId,
        status: 'pending'
      }]);

    if (!error) {
      setSentRequests(prev => new Set(prev.add(receiverId)));
      setFriends(prev => {
        const newSet = new Set(prev);
        newSet.delete(receiverId);
        return newSet;
      });
      setRefreshTrigger(prev => prev + 1); // Принудительное обновление
    }
  };

  const getButtonState = (userId: string) => {
    if (friends.has(userId)) return 'Already Friends';
    if (sentRequests.has(userId)) return 'Request Sent';
    return 'Send Request';
  };

  return (
    <div className="flex flex-col p-6 bg-[#F0F0F0] rounded-[10px] w-[350px]">
      <div className="flex items-center bg-[#DFDFDF] h-[50px] rounded-[10px] px-4">
        <SearchIcon className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent flex-1 pl-3 text-[15px] font-abeezee focus:outline-none"
        />
      </div>
      <div className="flex-col flex gap-5 mt-5">
        {users.map(user => {
          const buttonState = getButtonState(user.id);
          return (
            <div key={user.id} className="flex-row flex justify-between items-center">
              <div className="flex flex-row items-center gap-2">
                <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px] overflow-hidden">
                  {user.avatar_url && (
                    <Image 
                      width={35}
                      height={35}
                      src={user.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex gap-1 flex-col leading-none">
                  <div className="text-[15px] m-0 p-0">{user.username}</div>
                  <div className="text-[11px] text-[#444444] m-0 p-0">@{user.login}</div>
                </div>
              </div>
              <button
                onClick={() => sendFriendRequest(user.id)}
                className={`text-[10px] text-center rounded-[10px] p-2 ${
                  buttonState !== 'Send Request' ? 'bg-[#969696]' : 'bg-[#DFDFDF]'
                }`}
                disabled={buttonState !== 'Send Request'}
              >
                {buttonState}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}