import React from "react";

export default function BookmarkIcon({ color }: { color?: string }) {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 30 38"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.6667 0.666687H9.98333C8.15 0.666687 6.66667 2.16669 6.66667 4.00002H23.3333C25.1667 4.00002 26.6667 5.50002 26.6667 7.33335V29L30 30.6667V4.00002C30 2.16669 28.5 0.666687 26.6667 0.666687ZM20 10.6667V32.2834L11.6667 28.7L3.33333 32.2834V10.6667H20ZM3.33333 7.33335H20C21.8333 7.33335 23.3333 8.83335 23.3333 10.6667V37.3334L11.6667 32.3334L0 37.3334V10.6667C0 8.83335 1.5 7.33335 3.33333 7.33335Z"
        fill={color}
      />
    </svg>
  );
}
