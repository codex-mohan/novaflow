"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react"; // For loading state

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Small delay to prevent flash of loading state
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/auth/signin");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Show loading state while checking auth
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <p className="text-white text-sm">Loading...</p>
      </div>
    </div>
  );
}
