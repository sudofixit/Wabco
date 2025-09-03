import AdminLoginClient from "./AdminLoginClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.role === "ADMIN") {
    redirect("/admin/products");
  }
  return (
    <AdminLoginClient />
  );
} 