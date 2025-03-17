import React from "react";

export default function FriendRequest() {
  return (
    <div className="bg-[#D9D9D9] p-5 m-5 rounded-[15px] flex flex-col">
      <div className="flex flex-row items-center gap-2 mb-5">
        <div className="rounded-[100px] bg-[#969696] h-[35px] w-[35px]" />
        <div className="flex gap-1 flex-col leading-none">
          <div className="text-[15px] m-0 p-0">Alex</div>
          <div className="text-[11px] text-[#444444] m-0 p-0">Your Friend</div>
        </div>
      </div>
      <div className="flex flex-col">Want to become your friend.</div>
      <div className="flex flex-row justify-between gap-10 mt-5">
        <button className="flex justify-center items-center h-[50px] bg-[#5BB8FF] text-white rounded-[15px] text-[15px] px-10 w-full">
          Add friend
        </button>
        <button className="flex justify-center items-center h-[50px] bg-[#FF4A4A] text-white rounded-[15px] text-[15px] px-10 w-full">
          Reject
        </button>
      </div>
    </div>
  );
}
