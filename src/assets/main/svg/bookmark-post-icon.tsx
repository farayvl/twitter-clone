import React from "react";

export default function BookmarkPostIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="29"
      viewBox="0 0 24 29"
      fill={filled ? "#5BB8FF" : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 6.44444C2 4.88874 2 4.11089 2.31141 3.51669C2.58533 2.99401 3.02241 2.56907 3.56003 2.30276C4.1712 2 4.97127 2 6.57143 2H17.4286C19.0287 2 19.8289 2 20.44 2.30276C20.9776 2.56907 21.4147 2.99401 21.6886 3.51669C22 4.11089 22 4.88874 22 6.44444V27L12 20.0556L2 27V6.44444Z"
        stroke="#5BB8FF"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
