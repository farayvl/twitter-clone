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

export default function HomePage({ post }) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState<{
    login: string;
    username: string;
    avatar_url: string | null;
  }>({ login: "", username: "", avatar_url: null });

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
      const { data, error } = await supabase.from("posts").select("*");

      if (!error) {
        setPosts(data);
      } else {
        console.error("Ошибка загрузки постов:", error);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      console.log("Data:", data, "Error:", error);
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

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

    let mediaUrl = null;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `post-images/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, selectedFile, {
            contentType: selectedFile.type,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(uploadData.path);

        mediaUrl = publicUrl;
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

      // Обновление списка постов
      const { data: newPosts } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      setPosts(newPosts);
      setText("");
      setSelectedImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Ошибка:", error);
      alert(`Ошибка: ${error.message}`);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Выбранный файл:", file); // Проверка
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <HomeIcon color="#969696" />
        Home
      </div>
      <div className="h-[1px] w-full bg-[#969696]" />
      <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col justify-between">
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
            <div className="rounded-full bg-[#969696] h-[35px] w-[35px]" /> // Заглушка, если нет аватарки
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
        {selectedImage && (
          <div className="mt-3 flex justify-start">
            <Image
              width={50}
              height={50}
              src={selectedImage}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-md border border-gray-400"
            />
          </div>
        )}
        <div className="flex flex-row justify-between items-center mt-3">
          <div className="flex flex-row gap-3 items-center">
            <GifIcon />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="fileInput"
              onChange={handleFileChange}
            />
            <button
              onClick={() => document.getElementById("fileInput").click()}
              className="cursor-pointer"
            >
              <ImgIcon />
            </button>
            <SmileIcon />
            <VideoIcon />
          </div>
          <button
            className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-10 cursor-pointer"
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
