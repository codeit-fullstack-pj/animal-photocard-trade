"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading, isLoggingOutRef } = useAuth();

  useEffect(() => {
    if (isLoading || isLoggingOutRef.current) return;
    if (currentUser) return;

    const nextPath = `${pathname}${window.location.search}`;
    router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
  }, [currentUser, isLoading, isLoggingOutRef, router, pathname]);

  //로딩중일때 스피너 위치
  if (isLoading || !currentUser) return null;

  return children;
}
