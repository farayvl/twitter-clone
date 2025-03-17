import React from "react";

export default function FriendCard() {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row items-center gap-2 mb-5">
        <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px]" />
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[15px] m-0 p-0">Alex</div>
          <div className="text-[11px] text-[#444444] m-0 p-0">@alex_aiaiai</div>
        </div>
      </div>
      <div className="text-[15px] text-[#FF4A4A]">Delete friend</div>
    </div>
  );
}
