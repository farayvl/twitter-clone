import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../../../../../supabaseClient";

interface CommentPostProps {
  notification: {
    id: string;
    post_id: string;
    comment_id: string;
    sender: {
      username: string;
      login: string;
      avatar_url: string | null;
    };
    comment_text: string;
    post?: {
      media_url: string | null;
    };
  };
}

export default function CommentPost({ notification }: CommentPostProps) {
  const [postMedia, setPostMedia] = useState("");
  const [sender] = useState(notification.sender);

  const handleClick = () => {
    const url = `/main/posts/${notification.post_id}?commentId=${notification.comment_id}&openComments=true`;
    window.location.href = url;
  };

  useEffect(() => {
    const fetchPostMedia = async () => {
      if (notification.post_id) {
        const { data: postData } = await supabase
          .from("posts")
          .select("media_url")
          .eq("id", notification.post_id)
          .single();

        if (postData) setPostMedia(postData.media_url);
      }
    };

    fetchPostMedia();
  }, [notification.post_id]);

  return (
    <div
      className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-row items-center gap-2 mb-5">
        {sender?.avatar_url ? (
          <Image
            src={sender.avatar_url}
            alt="Avatar"
            width={35}
            height={35}
            className="rounded-full"
          />
        ) : (
          <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px]" />
        )}
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[15px] m-0 p-0">
            {sender?.username || "Unknown"}
          </div>
          <div className="text-[11px] text-[#444444] m-0 p-0">
            @{sender?.login || "user"}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="text-[12px] text-[#444444]">Commented your post:</div>
        <div className="text-[15px]">{notification.comment_text}</div>
        {postMedia && (
          <div className="relative w-full overflow-hidden rounded-[10px] mt-2">
            <Image
              src={postMedia}
              alt="Post media"
              width={600}
              height={400}
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
