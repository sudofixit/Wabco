// This layout file is intentionally separated for flexibility and future design adjustments for this specific admin feature page.

import AdminLayout from "@/app/admin/layout";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      <div className="pt-1 pb-8 px-2 w-full ml-0">
        {children}
      </div>
    </AdminLayout>
  );
} 