"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => {
        if (window.confirm("Are you sure you want to log out?")) {
          signOut({ callbackUrl: "/admin-login" });
        }
      }}
      className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
} 