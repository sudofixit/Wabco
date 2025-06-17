"use server";

import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
  console.log("=== LOGIN ACTION STARTED ===");
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Login attempt for email:", email);

  if (!email || !password) {
    return { error: "Email and password are required", success: false };
  }

  try {
    // Check user status before attempting signIn
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isActive: true,
      },
    });

    console.log("User found:", user ? { id: user.id, email: user.email, isActive: user.isActive } : "No user found");

    if (!user) {
      console.log("Returning error: User not found");
      return { error: "Invalid email or password", success: false };
    }

    if (!user.isActive) {
      console.log("Returning error: User is inactive");
      return { 
        error: "This account has been deactivated. Please contact an administrator.", 
        success: false 
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log("Password valid:", isValidPassword);
    
    if (!isValidPassword) {
      console.log("Returning error: Invalid password");
      return { error: "Invalid email or password", success: false };
    }

    console.log("All checks passed, calling signIn");
    // If all checks pass, proceed with signIn
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/products",
    });

    console.log("signIn completed successfully");
    return { success: true, error: null };
  } catch (error: any) {
    // Handle Next.js redirect (this is expected behavior)
    if (error?.message?.includes("NEXT_REDIRECT")) {
      console.log("Next.js redirect detected, re-throwing");
      throw error;
    }

    console.error("Login error:", error);
    return { error: "An error occurred during login", success: false };
  }
} 