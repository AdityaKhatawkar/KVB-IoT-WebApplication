"use client";

import { ReactNode, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { LayoutDashboard, BookUser, Settings2, Cpu } from "lucide-react";

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
};

export default function AdminSidebarLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: MenuItem[] = useMemo(
    () => [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin-dashboard" },
      { icon: BookUser, label: "Customers", path: "/admin-dashboard/customers" },
      { icon: Settings2, label: "Manage Presets", path: "/admin-dashboard/presets" },
      // { icon: Cpu, label: "Firmware", path: "/admin-dashboard/firmware" },
    ],
    []
  );

  const isActive = (itemPath: string) => {
    if (!pathname) return false;
    // Dashboard should only be active on exact path
    if (itemPath === "/admin-dashboard") {
      return pathname === itemPath;
    }
    // Other sections active on exact or nested paths
    return pathname === itemPath || pathname.startsWith(itemPath + "/");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full max-w-full">
        {/* Persistent sidebar toggle trigger */}
        <div className="fixed left-2 top-20 z-50 md:left-4">
          <SidebarTrigger className="mr-2 text-gray-700 bg-white/70 backdrop-blur-sm border rounded shadow hover:bg-white" />
        </div>
        <Sidebar className="bg-[rgb(33,37,41)] text-[rgb(88,91,94)] border-r border-gray-700 fixed left-0 top-16 h-[calc(100vh-4rem)] z-50">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-700">
            <SidebarTrigger className="mr-2 text-gray-300 hover:text-white" />
            <span className="text-xl font-bold text-white">Admin Dashboard</span>
          </div>
          <SidebarContent className="flex-1 overflow-y-auto">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
                    onClick={() => router.push(item.path)}
                    className={`flex items-center w-full px-4 py-2 ${
                      isActive(item.path)
                        ? "bg-gray-700 text-white"
                        : "hover:bg-gray-700 text-[rgb(88,91,94)] hover:text-white"
                    }`}
                  >
                    <item.icon className="mr-3 w-5 h-5" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 min-w-0 w-full max-w-full flex flex-col min-h-screen bg-gray-50 pt-20">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}


