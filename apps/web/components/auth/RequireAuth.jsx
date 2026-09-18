"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/AuthProvider";

export default function RequireAuth({ children }) {
  const { currentUser, isLoading, isLoggingOutRef } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser && !isLoggingOutRef.current) {
      router.replace("/login");
    }
  }, [isLoading, currentUser, isLoggingOutRef, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-black">
        <p className="font-sans-400 text-sm text-gray-300">로딩 중...</p>
      </main>
    );
  }

  if (!currentUser) return null;

  return children;
}
