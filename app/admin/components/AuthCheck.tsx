"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthCheckProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function AuthCheck({ children, requiredRole = "ADMIN" }: AuthCheckProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session?.user) {
      console.log("AuthCheck: Redirecting unauthenticated user");
      router.push("/admin-login");
      return;
    }

    if (session.user.role !== requiredRole) {
      console.log(`AuthCheck: User role ${session.user.role} doesn't match required role ${requiredRole}`);
      router.push("/admin-login");
      return;
    }
  }, [session, status, router, requiredRole]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a1c58] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users
  if (status === "unauthenticated" || !session?.user || session.user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a1c58] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If authenticated and authorized, render children
  return <>{children}</>;
} 