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
import { useSearchParams } from "next/navigation";
import { div } from "framer-motion/client";
import PenIcon from "@/assets/main/svg/pen-icon";
import TrashCanIcon from "@/assets/main/svg/trash-can-icon";
import NicknameButton from "@/assets/main/svg/nickname-button";
import UndoNickname from "@/assets/main/svg/undo-nickname";

export default function ProfilePost({ post }) {
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
  const [targetCommentId, setTargetCommentId] = useState<number | null>(null);
  const [postExists, setPostExists] = useState(true);
  const searchParams = useSearchParams();
  const commentId = searchParams.get("commentId");
  const shouldOpenComments = searchParams.get("openComments");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isSinglePostPage = window.location.pathname.includes("/posts/");
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [postText, setPostText] = useState(post.text); // Напрямую используем post.text
  const [isEditingTextPost, setIsEditingTextPost] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaUrl, setMediaUrl] = useState(post.media_url);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `posts/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("posts")
        .update({ media_url: urlData.publicUrl })
        .eq("id", post.id);

      if (updateError) throw updateError;

      // Сразу обновляем локальное состояние
      setMediaUrl(urlData.publicUrl);
    } catch (error) {
      console.error("Error uploading media:", error);
      alert("Failed to upload media");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const checkLike = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("likes")
        .select()
        .eq("user_id", user.id)
        .eq("post_id", post.id)
        .single();

      setIsLiked(!!data);
    };

    checkLike();
  }, [post.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post.id);
      setIsLiked(false);
    } else {
      await supabase
        .from("likes")
        .insert([{ user_id: user.id, post_id: post.id }]);
      setIsLiked(true);
    }
  };

  useEffect(() => {
    const checkIfSaved = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("saved_posts")
        .select()
        .eq("user_id", user.id)
        .eq("post_id", post.id)
        .single();

      setIsSaved(!!data);
    };
    checkIfSaved();
  }, [post.id]);

  const handleSavePost = async (e: React.MouseEvent) => {
    e.stopPropagation(); 

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      if (isSaved) {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", post.id);

        if (!error) setIsSaved(false);
      } else {
        const { error } = await supabase
          .from("saved_posts")
          .insert([{ user_id: user.id, post_id: post.id }]);

        if (!error) setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments((prev) => {
      if (!prev) fetchComments();
      return !prev;
    });
  };

  useEffect(() => {
    if (isSinglePostPage && commentId) {
      setShowComments(true);
      fetchComments().then(() => {
        const element = document.getElementById(`comment-${commentId}`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [isSinglePostPage, commentId]);

  useEffect(() => {
    if (commentId && !showComments) {
      setShowComments(true);
      fetchComments();
    }
  }, [commentId]);

  useEffect(() => {
    if (targetCommentId && comments.length > 0) {
      const element = document.getElementById(`comment-${targetCommentId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("highlight-comment");
        }, 500);
      }
    }
  }, [comments, targetCommentId]);

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
    setIsCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles:profiles(id, avatar_url, username, login)")
        .eq("post_id", post.id)
        .is("parent_id", null)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setComments(data);
        const allComments = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", post.id);

        if (allComments.data) {
          const targetComment = allComments.data.find(
            (c) => c.id === targetCommentId
          );
          if (targetComment?.parent_id) {
            setOpenedReplies((prev) => ({
              ...prev,
              [targetComment.parent_id]: true,
            }));
            fetchReplies(targetComment.parent_id);
          }
        }
      }
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const useScrollToComment = (targetId: number) => {
    useEffect(() => {
      const element = document.getElementById(`comment-${targetId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
          element.classList.add("highlight-comment");
        }, 500);
      }
    }, [targetId, comments]);
  };

  useScrollToComment(Number(commentId));

  useScrollToComment(targetCommentId, [comments]);

  useEffect(() => {
    const channel = supabase
      .channel("post-comments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${post.id}`,
        },
        () => fetchComments()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [post.id]);

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
          [parentId]: [...(prev[parentId] || []), data], 
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

  useEffect(() => {
    const checkPostExists = async () => {
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("id", post.id);

      setPostExists(count > 0);
    };

    checkPostExists();
  }, [post.id]);

  useEffect(() => {
    // Редирект со старых URL с хешем
    const handleHashRedirect = () => {
      const hash = window.location.hash;
      const match = hash.match(/comment-(.+)/);

      if (match) {
        const commentId = match[1];
        window.location.href = `/main/posts/${post.id}/comments/${commentId}`;
      }
    };

    handleHashRedirect();
  }, [post.id]);

  // В компоненте Post (post.tsx)
  useEffect(() => {
    const scrollToComment = async () => {
      if (!targetCommentId || !comments.length) return;

      await new Promise((resolve) => setTimeout(resolve, 50));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const commentElement = document.getElementById(
        `comment-${targetCommentId}`
      );

      if (commentElement) {
        const yOffset = -100; 
        const y =
          commentElement.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });

        commentElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });

        const pulse = document.createElement("div");
        pulse.style.cssText = `
        position: absolute;
        background: rgba(255, 220, 0, 0.3);
        border-radius: 8px;
        animation: highlight-pulse 2s ease-out;
        pointer-events: none;
      `;

        const rect = commentElement.getBoundingClientRect();
        pulse.style.width = `${rect.width}px`;
        pulse.style.height = `${rect.height}px`;
        pulse.style.left = `${rect.left}px`;
        pulse.style.top = `${rect.top}px`;

        document.body.appendChild(pulse);

        setTimeout(() => pulse.remove(), 2000);
      }
    };

    scrollToComment();
  }, [comments, targetCommentId]);

  useEffect(() => {
    if (showComments && comments.length > 0 && commentId && !hasScrolled) {
      const scrollToTarget = () => {
        const element = document.getElementById(`comment-${commentId}`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
          element.classList.add("highlight-comment");
          setHasScrolled(true);
        }
      };

      const timer = setTimeout(scrollToTarget, 500);
      return () => clearTimeout(timer);
    }
  }, [comments, showComments, commentId, hasScrolled]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setText(post.text); 
    }
  };

  const handleSaveTextPostClick = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ text: postText })
        .eq("id", post.id);

      if (error) throw error;

      setIsEditing(false);
      setIsEditingTextPost(false);
    } catch (error) {
      console.error("Ошибка при обновлении поста:", error);
      alert("Не удалось обновить пост");
    }
  };

  const handeDeletePostMedia = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ media_url: null })
        .eq("id", post.id);

      if (error) throw error;

      setMediaUrl(null);
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("Failed to delete media");
    }
  };

  const handleAddMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleReplaceMedia = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*, video/*";

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);

      try {
        if (mediaUrl) {
          const fileName = mediaUrl.split("/").pop();
          if (fileName) {
            await supabase.storage
              .from("post-images")
              .remove([`posts/${fileName}`]);
          }
          setMediaUrl(null);
        }

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from("posts")
          .update({ media_url: urlData.publicUrl })
          .eq("id", post.id);

        if (updateError) throw updateError;

        setMediaUrl(urlData.publicUrl);
      } catch (error) {
        console.error("Error replacing media:", error);
        alert("Failed to replace media");
      } finally {
        setIsUploading(false);
      }
    };

    fileInput.click();
  };

  const handleDeletePost = async () => {
    if (
      !confirm(
        "Are you sure you want to delete the post and all relative comments?"
      )
    ) {
      return;
    }

    try {
      const { error: commentsError } = await supabase
        .from("comments")
        .delete()
        .eq("post_id", post.id);
      if (commentsError) throw commentsError;

      const { error: likesError } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id);
      if (likesError) throw likesError;

      const { error: savedError } = await supabase
        .from("saved_posts")
        .delete()
        .eq("post_id", post.id);
      if (savedError) throw savedError;

      if (post.media_url) {
        const fileName = post.media_url.split("/").pop();
        if (fileName) {
          await supabase.storage
            .from("post-images")
            .remove([`posts/${fileName}`]);
        }
      }

      const { error: postError } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);
      if (postError) throw postError;

      setPostExists(false);
    } catch (error) {
      alert("Error, try again later");
    }
  };

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
        {isEditing ? (
          <div className="flex flex-row gap-2 items-center">
            {isEditingTextPost ? (
              <>
                <input
                  className="bg-[#FFFFFF] h-[34px] w-[220px] p-2 rounded-[10px] text-[#000000]"
                  type="text"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTextPostClick}
                    className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                  >
                    <NicknameButton />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTextPost(false);
                      setPostText(post.text); 
                    }}
                    className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                  >
                    <UndoNickname />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="mr-2">{postText}</span>
                <button
                  onClick={() => setIsEditingTextPost(true)}
                  className="hover:bg-gray-100 p-1 rounded cursor-pointer"
                >
                  <PenIcon />
                </button>
              </>
            )}
          </div>
        ) : (
          <>{postText}</>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*, video/*"
          className="hidden"
        />

        {isEditing ? (
          <div className="flex flex-row gap-2">
            {mediaUrl ? (
              <div className="relative rounded-[10px] overflow-hidden max-w-[400px]">
                {getMediaType(mediaUrl) === "image" ? (
                  <Image
                    src={mediaUrl}
                    alt="Post media"
                    width={400}
                    height={400}
                    className="rounded-[10px] object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    controls
                    className="w-full max-w-full object-contain aspect-video"
                    playsInline
                    preload="metadata"
                  >
                    <source src={`${mediaUrl}#t=0.5`} />
                  </video>
                )}
                <div className="absolute bottom-3 right-3 z-50 flex-row gap-1 flex">
                  <button
                    onClick={handeDeletePostMedia}
                    className="p-2 bg-white rounded-[5px] backdrop-blur-sm cursor-pointer"
                  >
                    <TrashCanIcon />
                  </button>
                  <button
                    onClick={handleReplaceMedia}
                    className="p-2 bg-white rounded-[5px] backdrop-blur-sm cursor-pointer"
                  >
                    <PenIcon />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={handleAddMediaClick}
                className="relative border-2 border-dashed border-gray-400 rounded-[10px] p-10 text-center cursor-pointer hover:bg-gray-100 transition-colors max-w-[400px]"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-gray-600 font-medium">
                      Add Media...
                    </span>
                    <span className="text-sm text-gray-500">
                      Click to browse files
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {mediaUrl && (
              <div className="relative w-full overflow-hidden rounded-[10px]">
                {getMediaType(mediaUrl) === "image" ? (
                  <Image
                    className="rounded-[10px] object-cover"
                    src={mediaUrl}
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
                      src={`${mediaUrl}#t=0.5`}
                      type={`video/${mediaUrl.split(".").pop()}`}
                    />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex flex-row items-center justify-between">
          {isEditing ? (
            <div></div>
          ) : (
            <>
              {" "}
              <div className="flex flex-row gap-5 items-center ml-0.5">
                <button onClick={handleLike} className="cursor-pointer">
                  <HeartPostIcon filled={isLiked} />
                </button>
                <button onClick={handleCommentClick} className="cursor-pointer">
                  <CommentPostIcon filled={showComments} />
                </button>
                <button onClick={handleSavePost} className="cursor-pointer">
                  <BookmarkPostIcon filled={isSaved} />
                </button>
              </div>
            </>
          )}
          {isEditing ? (
            <div className="flex flex-row gap-5">
              <button
                onClick={handleEditClick}
                className="flex justify-center cursor-pointer items-center h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-8 w-full whitespace-nowrap"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              {" "}
              <div className="flex flex-row gap-5">
                <button
                  onClick={handleEditClick}
                  className="flex justify-center cursor-pointer items-center h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-5 w-full whitespace-nowrap"
                >
                  Change post
                </button>
                <button
                  onClick={handleDeletePost}
                  className="flex cursor-pointer justify-center items-center h-[50px] bg-[#FF4A4A] text-white rounded-[15px] text-[15px] px-5 w-full whitespace-nowrap hover:bg-[#FF3333] transition-colors"
                >
                  Delete post
                </button>
              </div>
            </>
          )}
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
                  id={`comment-${comment.id}`}
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
                            <div className="flex flex-row justify-between mt-2">
                              <HeartCommentIcon width={23} height={20} />
                              <button className="text-[#969696] text-[13px]">
                                Answer
                              </button>
                            </div>
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
