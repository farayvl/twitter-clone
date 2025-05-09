"use client";

import React, { useEffect, useState, useRef } from "react";
import PenIcon from "@/assets/main/svg/pen-icon";
import Image from "next/image";
import { supabase } from "../../../../../../supabaseClient";
import NicknameButton from "@/assets/main/svg/nickname-button";
import UndoNickname from "@/assets/main/svg/undo-nickname";
import AvatarHoverImg from "@/assets/main/svg/avatar-hover-img";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Modal from "react-modal";
import ProfilePost from "../../components/profile_post";

Modal.setAppElement("#__next");

interface Post {
  id: string;
  user_id: string;
  text: string;
  media_url: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<{
    login: string;
    username: string;
    avatar_url: string | null;
  }>({ login: "", username: "", avatar_url: null });

  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [uploading, setUploading] = useState(false);
  const [src, setSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [isCropping, setIsCropping] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const userId = localStorage.getItem("token");

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
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
    };

    fetchPosts();
  }, []);

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    const userId = localStorage.getItem("token");
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername })
      .eq("id", userId);

    if (!error) {
      setUser((prev) => ({ ...prev, username: newUsername }));
      setIsEditing(false);
    }
  };

  const handleUndoClick = () => {
    setNewUsername(user.username);
    setIsEditing(false);
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSrc(URL.createObjectURL(file));
    setIsCropping(true);
  };

  const getCroppedImg = async (): Promise<Blob> => {
    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image!.naturalWidth / image!.width;
    const scaleY = image!.naturalHeight / image!.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      image!,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg");
    });
  };

  const uploadCroppedAvatar = async () => {
    const userId = localStorage.getItem("token");
    if (!userId) return;

    try {
      const croppedImage = await getCroppedImg();

      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}.jpg`;
      const filePath = `user_uploads/${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedImage, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: `${publicUrl}?v=${timestamp}`,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      setUser((prev) => ({
        ...prev,
        avatar_url: `${publicUrl}?v=${timestamp}`,
      }));
      // Исправьте обработку ошибки в uploadCroppedAvatar
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert("Avatar update error: " + errorMessage);
    } finally {
      setUploading(false);
      setIsCropping(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#F0F0F0] rounded-[10px] w-full h-full mx-5">
      <Modal
        isOpen={isCropping}
        onRequestClose={() => {
          setIsCropping(false);
          setTimeout(() => setSrc(""), 300);
        }}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm"
      >
        <div className="bg-white rounded-xl p-6 max-w-[90vw] max-h-[90vh]">
          {src && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={1}
              circularCrop
            >
              <Image
                ref={imgRef}
                src={src}
                alt="Crop preview"
                width={400}
                height={400}
                className="max-w-full max-h-[70vh] object-contain"
                onLoad={() => {
                  setCrop((prev) => ({ ...prev }));
                }}
              />
            </ReactCrop>
          )}
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => setIsCropping(false)}
              className="px-4 py-2 bg-gray-300 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={uploadCroppedAvatar}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>
      <div className="flex flex-row gap-5 items-center text-[#969696] text-[20px] p-5">
        <label
          htmlFor="avatar-upload"
          className="cursor-pointer relative group"
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt="Avatar"
              width={100}
              height={100}
              className="rounded-full object-cover w-[100px] h-[100px]"
              loader={({ src, width, quality }) => {
                const url = new URL(src);
                url.searchParams.set("width", width.toString());
                url.searchParams.set("quality", (quality || 80).toString());
                return url.href;
              }}
            />
          ) : (
            <div className="bg-[#969696] w-[100px] h-[100px] rounded-full flex items-center justify-center">
              {uploading ? "..." : "Upload"}
            </div>
          )}

          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 
                w-[100px] h-[50px] bg-[#ABABAB] opacity-0 rounded-b-full 
                flex items-center justify-center transition-opacity duration-300 ease-in-out 
                group-hover:opacity-80"
          >
            <AvatarHoverImg />
          </div>

          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </label>

        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[20px] m-0 p-0 text=[#000000] gap-3 flex flex-row">
            {isEditing ? (
              <>
                <input
                  className="bg-[#DFDFDF] h-[34px] w-[220px] p-5 rounded-[10px] text-[#000000]"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <button onClick={handleSaveClick} className="cursor-pointer">
                  <NicknameButton />
                </button>
                <button onClick={handleUndoClick} className="cursor-pointer">
                  <UndoNickname />
                </button>
              </>
            ) : (
              <>
                <div className="text-[#000000]">{user.username}</div>
                <button onClick={handleEditClick} className="cursor-pointer">
                  <PenIcon />
                </button>
              </>
            )}
          </div>

          <div className="text-[15px] text-[#444444] m-0 p-0">
            @{user.login}
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-[#969696]" />
      {posts.map((post) => (
        <ProfilePost key={post.id} post={post} />
      ))}
    </div>
  );
}
