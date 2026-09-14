"use client";

import { useEffect, useState } from "react";

import { getCurrentUser, signout } from "@/lib/auth/api";

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then(
      ({ user }) => {
        if (!cancelled) setCurrentUser(user);
      },
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    try {
      await signout();
    } catch {}
    setCurrentUser(null);
  }

  return { currentUser, logout };
}
