// /admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminIndexPage() {
  const session = await auth();

  // If no session, redirect to login without error parameter to avoid confusion
  if (!session?.user) {
    redirect("/admin-login");
  }

  // If user exists but is not admin, redirect with access denied error
  if (session.user.role !== "ADMIN") {
    redirect("/admin-login?error=access_denied");
  }

  // If admin, redirect to products dashboard
  redirect("/admin/products");

}
