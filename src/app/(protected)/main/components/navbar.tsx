"use client";

import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";

import BookmarkIcon from "@/assets/main/svg/bookmark-icon";
import FriendIcon from "@/assets/main/svg/friend-icon";
import HomeIcon from "@/assets/main/svg/home-icon";
import LogoutIcon from "@/assets/main/svg/logout-icon";
import NotificationIcon from "@/assets/main/svg/notification-icon";
import UserIcon from "@/assets/main/svg/user-icon";
import React from "react";

const navItems = [
  { Icon: UserIcon, label: "Profile", path: "/main/pages/profile" },
  {
    Icon: NotificationIcon,
    label: "Notifications",
    path: "/main/pages/notifications",
  },
  { Icon: HomeIcon, label: "Home", path: "/main/pages/home" },
  { Icon: FriendIcon, label: "Friends", path: "/main/pages/friends" },
  { Icon: BookmarkIcon, label: "Storage", path: "/main/pages/storage" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter(); 

  const logOut = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <div className="flex flex-col p-6 bg-[#F0F0F0] gap-6 rounded-[10px] text-[17px] font-medium">
      {navItems.map(({ Icon, label, path }, index) => {
        const isActive = pathname === path;
        return (
          <Link
            key={index}
            href={path}
            className={`flex flex-row items-center gap-3 ${
              isActive ? "text-[#818181]" : "text-black"
            }`}
          >
            <Icon color={isActive ? "#818181" : "#000000"} />
            <div>{label}</div>
          </Link>
        );
      })}
      <button onClick={logOut} className="flex flex-row items-center gap-3 cursor-pointer">
        <LogoutIcon color="#FF4A4A" />
        <div className="text-[#FF4A4A]">Log out</div>
      </button>
    </div>
  );
}
