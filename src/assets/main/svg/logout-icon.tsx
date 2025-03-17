import React from "react";

export default function LogoutIcon({ color }: { color?: string }) {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 33 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.3334 29.3334H6.00008C4.15913 29.3334 2.66675 27.841 2.66675 26V6.00002C2.66675 4.15907 4.15913 2.66669 6.00008 2.66669H19.3334M12.6667 16H31.0001M31.0001 16L26.0001 21M31.0001 16L26.0001 11"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
