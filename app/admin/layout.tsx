"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminAppSidebar } from "@/components/admin-app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminAppSidebar />
      <main className="p-2 w-full">
        <SidebarTrigger />
        <div className="py-6 px-2">{children}</div>
      </main>
    </SidebarProvider>
  );
}
