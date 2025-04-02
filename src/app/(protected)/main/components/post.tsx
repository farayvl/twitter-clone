"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import HeartPostIcon from "@/assets/main/svg/heart-post-icon";
import BookmarkPostIcon from "@/assets/main/svg/bookmark-post-icon";
import CommentPostIcon from "@/assets/main/svg/comment-post-icon";
import GifIcon from "@/assets/main/svg/gif-icon";
import ImgIcon from "@/assets/main/svg/img-icon";
import SmileIcon from "@/assets/main/svg/smile-icon";
import VideoIcon from "@/assets/main/svg/video-icon";
import HeartCommentIcon from "@/assets/main/svg/heart-comment-icon";
import { supabase } from "../../../../../supabaseClient";

export default function Post({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [login, setLogin] = useState<string | null>(null);
  const [comments, setComments] = useState([]);
  const [openedReplies, setOpenedReplies] = useState<Record<number, boolean>>(
    {}
  );
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [replies, setReplies] = useState<Record<number, any[]>>({});

  const videoRef = useRef<HTMLVideoElement>(null);

  const [user, setUser] = useState<{
    login: string;
    username: string;
    avatar_url: string | null;
  }>({
    login: "",
    username: "",
    avatar_url: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("token");
      if (!userId) return;

      const { data } = await supabase
        .from("profiles")
        .select("login, username, avatar_url")
        .eq("id", userId)   
        .single();

      if (data) setUser(data);
    };

    fetchUser();
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles:profiles(id, avatar_url, username, login)")
      .eq("post_id", post.id)
      .is("parent_id", null)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  };

  const fetchReplies = async (commentId: number) => {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles:profiles(id, avatar_url, username, login)")
      .eq("parent_id", commentId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setReplies((prev) => ({ ...prev, [commentId]: data }));
    }
  };

  const addComment = async (parentId: number | null = null) => {
    const textToAdd = parentId ? replyTexts[parentId] : text;
    if (!textToAdd.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const commentData = {
      post_id: post.id,
      user_id: user.id,
      text: textToAdd,
      parent_id: parentId || null,
    };

    const { data, error } = await supabase
      .from("comments")
      .insert([commentData])
      .select("*, profiles:profiles(id, avatar_url, username, login)")
      .single();

    if (!error && data) {
      if (parentId) {
        setReplies((prev) => ({
          ...prev,
          [parentId]: [...(prev[parentId] || []), data], // Исправлено здесь
        }));
        setReplyTexts((prev) => ({ ...prev, [parentId]: "" }));
      } else {
        setComments((prev) => [...prev, data]);
        setText("");
      }
    }
  };

  const toggleReplies = async (commentId: number) => {
    setOpenedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

    if (!replies[commentId]) {
      await fetchReplies(commentId);
    }
  };

  const getMediaType = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    const videoExtensions = ["mp4", "webm", "ogg"];
    return videoExtensions.includes(extension || "") ? "video" : "image";
  };

  const toggleComments = () => {
    setShowComments((prev) => {
      if (!prev) fetchComments();
      return !prev;
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (post.user_id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, username, login")
          .eq("id", post.user_id)
          .single();

        if (!error && data) {
          setAvatar(data.avatar_url);
          setUsername(data.username);
          setLogin(data.login);
        }
      }
    };
    fetchUser();
  }, [post.user_id]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col">
      <div className="flex flex-row items-center gap-2 mb-5">
        {avatar ? (
          <Image
            src={avatar}
            alt="Avatar"
            width={35}
            height={35}
            className="rounded-full"
          />
        ) : (
          <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px]" />
        )}
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[15px] m-0 p-0">{username || "Unknown"}</div>
          <div className="text-[11px] text-[#444444] m-0 p-0">
            @{login || "user"}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {post.text}
        {post.media_url && (
          <div className="relative w-full overflow-hidden rounded-[10px]">
            {getMediaType(post.media_url) === "image" ? (
              <Image
                className="rounded-[10px] object-cover"
                src={post.media_url}
                alt="Post media"
                width={400}
                height={400}
                quality={80}
              />
            ) : (
              <video
                ref={videoRef}
                controls
                className="w-[400px] rounded-[10px] aspect-video"
                playsInline
                preload="metadata"
              >
                <source
                  src={`${post.media_url}#t=0.5`}
                  type={`video/${post.media_url.split(".").pop()}`}
                />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}

        <div className="flex flex-row gap-5 items-center ml-3">
          <HeartPostIcon />
          <button onClick={toggleComments} className="cursor-pointer">
            <CommentPostIcon filled={showComments} />
          </button>
          <BookmarkPostIcon />
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-[#F0F0F0] p-5 rounded-[15px] flex flex-col justify-between">
                <div className="flex flex-row items-center gap-3">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Avatar"
                      width={35}
                      height={35}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="rounded-full bg-[#969696] h-[35px] w-[35px]" />
                  )}
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent text-[15px] text-[#000000] outline-none resize-none overflow-hidden"
                    placeholder="What's new?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={1}
                  />
                </div>
                <div className="flex flex-row justify-between items-center mt-3">
                  <div className="flex flex-row gap-3 items-center">
                    <GifIcon />
                    <ImgIcon />
                    <SmileIcon />
                    <VideoIcon />
                  </div>
                  <button
                    onClick={() => addComment()}
                    className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-10"
                  >
                    Post
                  </button>
                </div>
              </div>

              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-[#F0F0F0] rounded-[15px] flex flex-col justify-between mt-5"
                >
                  <div className="p-5">
                    <div className="flex flex-row items-center gap-2 mb-5">
                      {comment.profiles?.avatar_url ? (
                        <Image
                          src={comment.profiles.avatar_url}
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
                          {comment.profiles?.username || "Unknown"}
                        </div>
                        <div className="text-[11px] text-[#444444] m-0 p-0">
                          @{comment.profiles?.login || "user"}
                        </div>
                      </div>
                    </div>
                    {comment.text}
                    <div className="flex justify-between flex-row mt-5 text-[#969696] text-[15px]">
                      <HeartCommentIcon />
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="cursor-pointer"
                      >
                        Answers
                      </button>
                    </div>
                  </div>

                  {openedReplies[comment.id] && (
                    <>
                      {replies[comment.id]?.map((reply) => (
                        <div
                          key={reply.id}
                          className="ml-5 pl-3 border-l-2 border-[#969696]"
                        >
                          <div className="p-3 bg-[#F0F0F0] rounded-[10px]">
                            <div className="flex items-center gap-2 mb-3">
                              {reply.profiles?.avatar_url ? (
                                <Image
                                  src={reply.profiles.avatar_url}
                                  alt="Avatar"
                                  width={30}
                                  height={30}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="bg-[#969696] h-[30px] w-[30px] rounded-full" />
                              )}
                              <div className="flex flex-col leading-none">
                                <div className="text-[14px]">
                                  {reply.profiles?.username || "Unknown"}
                                </div>
                                <div className="text-[12px] text-[#444]">
                                  @{reply.profiles?.login || "user"}
                                </div>
                              </div>
                            </div>
                            <p className="text-[14px]">{reply.text}</p>
                          </div>
                        </div>
                      ))}

                      <div className="bg-[#F0F0F0] p-5 rounded-[15px]">
                        <div className="flex flex-row items-center gap-3">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt="Avatar"
                              width={35}
                              height={35}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="rounded-full bg-[#969696] h-[35px] w-[35px]" />
                          )}
                          <textarea
                            className="w-full bg-transparent text-[15px] text-[#000000] outline-none resize-none overflow-hidden"
                            placeholder="Write a reply..."
                            value={replyTexts[comment.id] || ""}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            rows={1}
                          />
                        </div>
                        <div className="flex flex-row justify-between items-center mt-3">
                          <div className="flex flex-row gap-3 items-center">
                            <GifIcon />
                            <ImgIcon />
                            <SmileIcon />
                            <VideoIcon />
                          </div>
                          <button
                            onClick={() => addComment(comment.id)}
                            className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-10 cursor-pointer  "
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
