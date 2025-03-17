import SearchIcon from "@/assets/main/svg/search-icon";
import React from "react";


export default function Search() {
  return (
    <div className="flex flex-col p-6 bg-[#F0F0F0] rounded-[10px]">
      <div className="flex items-center bg-[#DFDFDF] h-[50px] rounded-[10px] px-4">
        <SearchIcon className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent flex-1 pl-3 text-[15px] font-abeezee focus:outline-none"
        />
      </div>
    </div>
  );
}
