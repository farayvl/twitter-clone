import React from "react";

export default function CommentPostIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 29 29"
      fill={filled ? "#5BB8FF" : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.5 27C21.4035 27 27 21.4035 27 14.5C27 7.59644 21.4035 2 14.5 2C7.59644 2 2 7.59644 2 14.5C2 16.4996 2.46952 18.3895 3.30432 20.0656C3.52617 20.511 3.60001 21.0201 3.4714 21.5007L2.72689 24.2834C2.40369 25.4913 3.50876 26.5963 4.71669 26.2731L7.49924 25.5286C7.97991 25.4 8.48901 25.4739 8.93441 25.6956C10.6105 26.5305 12.5004 27 14.5 27Z"
        stroke="#5BB8FF"
        strokeWidth="4"
      />
    </svg>
  );
}

