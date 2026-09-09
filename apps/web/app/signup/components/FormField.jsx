"use client";

import Image from "next/image";
import { useState } from "react";

export default function FormField({ label, type = "text", error, ...inputProps }) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block font-sans-400 text-sm text-white">{label}</span>

      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          aria-invalid={error ? true : undefined}
          className={`h-14 w-full rounded-[0.25rem] border bg-transparent px-4 font-sans-400 text-[18px] leading-[3.5rem] text-white placeholder:font-sans-300 placeholder:text-sm placeholder:text-gray-200 focus:border-purple focus:outline-none ${
            error ? "border-red" : "border-gray-200"
          } ${isPassword ? "pr-12" : ""}`}
          {...inputProps}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="absolute top-1/2 right-4 -translate-y-1/2"
          >
            <Image
              src={showPassword ? "/visible.png" : "/invisible.png"}
              alt=""
              width={96}
              height={96}
              className="size-5"
            />
          </button>
        )}
      </div>

      {error && <p className="mt-2 font-sans-400 text-xs text-red">{error}</p>}
    </label>
  );
}
