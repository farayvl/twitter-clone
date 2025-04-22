"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import HeartPostIcon from "@/assets/main/svg/heart-post-icon";
import BookmarkPostIcon from "@/assets/main/svg/bookmark-post-icon";
import CommentPostIcon from "@/assets/main/svg/comment-post-icon";
import HeartCommentIcon from "@/assets/main/svg/heart-comment-icon";
import { supabase } from "../../../../../supabaseClient";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  avatar_url: string | null;
  username: string | null;
  login: string | null;
}

interface Comment {
  id: number;
  post_id: string;
  user_id: string;
  text: string;
  parent_id: number | null;
  created_at: string;
  profiles: Profile;
}

interface Post {
  id: string;
  user_id: string;
  text: string;
  media_url?: string;
}

export default function Post({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [login, setLogin] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [openedReplies, setOpenedReplies] = useState<Record<number, boolean>>(
    {}
  );
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [replies, setReplies] = useState<Record<number, Comment[]>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const [targetCommentId] = useState<number | null>(null);
  const [, setPostExists] = useState(true);
  const searchParams = useSearchParams();
  const commentId = searchParams.get("commentId");
  const [, setIsCommentsLoading] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isSinglePostPage = typeof window !== 'undefined' && window.location.pathname.includes("/posts/");
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [repliesCount, setRepliesCount] = useState<Record<number, number>>({});
  const router = useRouter();


  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!login) {
      console.error("Login is missing");
      return;
    }

    const params = new URLSearchParams();
    if (avatar) params.set("avatar", avatar);
    if (username) params.set("username", username || "");
    params.set("login", login);

    router.push(`/main/pages/other-profile?${params.toString()}`);
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

    if (!user) {
      console.log("User not authenticated");
      return;
    }

    console.log("Toggling save for post:", post.id, "current state:", isSaved);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", post.id);

        console.log("Delete result:", error);

        if (!error) {
          setIsSaved(false);
          console.log("Post unsaved successfully");
        }
      } else {
        const { error } = await supabase
          .from("saved_posts")
          .insert([{ user_id: user.id, post_id: post.id }]);

        console.log("Insert result:", error);

        if (!error) {
          setIsSaved(true);
          console.log("Post saved successfully");
        }
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

  const fetchComments = useCallback(async () => {
    setIsCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles:profiles(id, avatar_url, username, login)")
        .eq("post_id", post.id)
        .is("parent_id", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data) return;

      setComments(data);

      // Подсчет ответов с проверкой на null
      const counts = await Promise.all(
        data.map(async (comment) => {
          const { count, error: countError } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("parent_id", comment.id);

          if (countError) throw countError;
          return { id: comment.id, count: count ?? 0 };
        })
      );

      setRepliesCount(
        counts.reduce((acc, { id, count }) => ({ ...acc, [id]: count }), {})
      );

      const { data: allComments, error: allCommentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id);

      if (allCommentsError) throw allCommentsError;
      if (!allComments) return;

      const targetComment = allComments.find((c) => c.id === targetCommentId);
      if (targetComment?.parent_id) {
        setOpenedReplies((prev) => ({
          ...prev,
          [targetComment.parent_id]: true,
        }));
        fetchReplies(targetComment.parent_id);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsCommentsLoading(false);
    }
  }, [post.id, targetCommentId]);

  const useScrollToComment = (
    targetId: number | null,
    dependencies: React.DependencyList = []
  ) => {
    useEffect(() => {
      if (!targetId) return;

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
    }, [targetId, ...dependencies]);
  };

  useScrollToComment(Number(commentId), [comments]);
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
        () => {
          fetchComments().catch(console.error);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(console.error);
    };
  }, [post.id, fetchComments]);

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
      const { count, error } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("id", post.id);

      if (error) {
        console.error("Error checking post existence:", error);
        return;
      }

      setPostExists((count ?? 0) > 0);
    };

    checkPostExists();
  }, [post.id]);

  useEffect(() => {
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

  useEffect(() => {
    const loadRepliesCount = async () => {
      const counts = await Promise.all(
        comments.map(async (comment) => {
          const { count } = await supabase
            .from("comments")
            .select("*", { count: "exact" })
            .eq("parent_id", comment.id);
          return { id: comment.id, count: count || 0 };
        })
      );

      setRepliesCount((prev) => ({
        ...prev,
        ...counts.reduce((acc, { id, count }) => ({ ...acc, [id]: count }), {}),
      }));
    };

    if (comments.length > 0) {
      loadRepliesCount();
    }
  }, [comments]);

  return (
    <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col">
      <div
        onClick={goToProfile}
        className="flex flex-row items-center gap-2 mb-5 cursor-pointer"
      >
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

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-[#F0F0F0] p-5 rounded-[15px] flex flex-row justify-between">
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
                        Answers ({repliesCount[comment.id] ?? 0})
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

                      <div className="bg-[#F0F0F0] p-5 rounded-[15px] flex flex-row justify-between">
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
