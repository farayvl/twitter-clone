"use client";

import { useState, useRef, useEffect } from "react";
import GifIcon from "@/assets/main/svg/gif-icon";
import HomeIcon from "@/assets/main/svg/home-icon";
import ImgIcon from "@/assets/main/svg/img-icon";
import SmileIcon from "@/assets/main/svg/smile-icon";
import VideoIcon from "@/assets/main/svg/video-icon";
import Post from "../../components/post";
import { supabase } from "../../../../../../supabaseClient";
import Image from "next/image";
import GifPicker from "../../components/gif-picker";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [posts, setPosts] = useState([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [postWarning, setPostWarning] = useState();

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

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setPosts(data);
      else console.error("Ошибка загрузки постов:", error);
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSelectGif = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setMediaPreview(null);
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : null;

    if (!type) {
      alert("Поддерживаются только изображения и видео");
      return;
    }

    setMediaType(type);
    setSelectedFile(file);
    setSelectedGif(null);
    setMediaPreview(URL.createObjectURL(file));
  };

  const createPost = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      alert("Требуется авторизация");
      return;
    }

    let mediaUrl = selectedGif || null;

    if (!text && !selectedGif && !selectedFile) {
      setPostWarning(true);
      return;
    }

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `post-media/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("post-images")
          .getPublicUrl(uploadData.path);
        mediaUrl = data.publicUrl;
      }

      const { error } = await supabase.from("posts").insert([
        {
          user_id: user.id,
          text,
          media_url: mediaUrl,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setText("");
      setSelectedFile(null);
      setMediaPreview(null);
      setSelectedGif(null);

      const { data: newPosts } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      setPosts(newPosts);
    } catch (error) {
      console.error("Ошибка:", error);
      alert(`Ошибка: ${error.message}`);
    }
  };

  setTimeout(() => {
    setPostWarning(false);
  }, 7000);

  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <HomeIcon color="#969696" />
        Home
      </div>

      <div className="h-[1px] w-full bg-[#969696]" />

      <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col">
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

        {mediaPreview && mediaType === "image" && (
          <div className="mt-3">
            <Image
              src={mediaPreview}
              alt="Preview"
              width={64}
              height={64}
              className="rounded-md border border-gray-400"
            />
          </div>
        )}

        {mediaPreview && mediaType === "video" && (
          <div className="mt-3">
            <video
              controls
              className="w-64 h-36 rounded-md border border-gray-400"
            >
              <source src={mediaPreview} />
            </video>
          </div>
        )}

        {selectedGif && (
          <div className="mt-3">
            <Image
              src={selectedGif}
              alt="Selected GIF"
              width={64}
              height={64}
              className="rounded-md border border-gray-400"
            />
          </div>
        )}

        <div className="flex flex-row justify-between items-center mt-3">
          <div className="flex flex-row gap-3 items-center">
            <div className="relative flex flex-col">
              <button
                onClick={() => setShowGifPicker(!showGifPicker)}
                className="cursor-pointer relative z-20"
              >
                <GifIcon />
              </button>

              <div className="absolute top-full left-0 mt-2 w-[320px] z-50">
                <AnimatePresence>
                  {showGifPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-75 z-50 rounded-xl w-[320px] min-h-[150px]"
                    >
                      <GifPicker
                        onSelect={handleSelectGif}
                        onClose={() => setShowGifPicker(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="absolute top-full left-0 mt-2 w-[320px] z-50">
                <AnimatePresence>
                  {postWarning && (
                    <motion.div
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 30, opacity: 1 }}
                      exit={{ y: -100, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[9999] bg-white border-[3px] border-[#FF9292] px-6 py-3 rounded-xl shadow-lg"
                    >
                      A post cannot be created because there is nothing in it.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <input
              type="file"
              accept="image/*, video/*"
              className="hidden"
              id="fileInput"
              onChange={handleFileChange}
            />

            <button
              onClick={() => document.getElementById("fileInput")?.click()}
              className="cursor-pointer"
            >
              <ImgIcon />
            </button>

            <SmileIcon />
          </div>

          <button
            className="h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-10 cursor-pointer"
            onClick={createPost}
          >
            Post
          </button>
        </div>
      </div>

      <div className="h-[1px] w-full bg-[#969696]" />

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
