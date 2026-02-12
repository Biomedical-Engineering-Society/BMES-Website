"use client";

import { useState, useRef, useEffect } from "react";

type TeamCardProps = {
  image: string;
  name: string;
  role: string;
  bio?: string;
};

export default function TeamCard({ image, name, role, bio }: TeamCardProps) {
  const [active, setActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close bio if click is outside the card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
  ref={cardRef}
  className="relative flex items-center justify-center h-[275px] bg-white shadow-[0_0_5px_rgba(0,0,0,0.2)]"
>
  {/* Member Image */}
  <img
    src={`/members/${image}`}
    alt={name}
    className="h-[calc(100%-10px)] w-[calc(100%-10px)] object-cover rounded-[2px]"
  />

  {/* Overlay Card */}
  <div
    className={`absolute -bottom-6 left-5 right-5 bg-[var(--bmes-purple)] text-white p-2 cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-[var(--bmes-purple-hover)] overflow-hidden
      ${active ? "h-full" : "h-24"} 
      flex flex-col items-center justify-center text-center`}
    onClick={() => setActive(!active)}
  >
    {/* Name */}
    <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg">
      {name}
    </h3>

    {/* Role */}
    <p className="text-[10px] sm:text-xs md:text-sm lg:text-md">
      {role}
    </p>

    {/* Bio */}
    {bio && (
      <p
        className={`text-[10px] sm:text-[12px] md:text-[12px] lg:text-[13px] mt-2 transition-all duration-500 overflow-hidden ${
          active ? "opacity-100 max-h-40" : "opacity-0 max-h-0"
        }`}
      >
        {bio}
      </p>
    )}
  </div>
</div>

  );
}
