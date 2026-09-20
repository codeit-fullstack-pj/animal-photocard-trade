"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/AuthProvider";

export default function GuestOnlyLayout({ children }) {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !currentUser) return;

    router.replace("/market");
  }, [currentUser, isLoading, router]);

  if (isLoading || currentUser) return null;

  return children;
}
