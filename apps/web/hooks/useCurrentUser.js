"use client";

import { useAuth } from "@/lib/auth/AuthProvider";

export function useCurrentUser() {
  return useAuth();
}
