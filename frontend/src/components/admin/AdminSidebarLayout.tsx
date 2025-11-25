import { ReactNode, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, BookUser, Settings2 } from "lucide-react";

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
};

export default function AdminSidebarLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = useMemo(
    () => [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin-dashboard" },
      { icon: BookUser, label: "Customers", path: "/admin-dashboard/customers" },
      { icon: Settings2, label: "Manage Presets", path: "/admin-dashboard/presets" },
    ],
    []
  );

  const isActive = (itemPath: string) => {
  const current = location.pathname;

  // Exact match for dashboard
  if (itemPath === "/admin-dashboard") {
    return current === "/admin-dashboard" || current === "/admin-dashboard/";
  }

  // Other items: highlight if path starts with itemPath
  return current.startsWith(itemPath);
};

  return (
    <div className="flex min-h-screen w-full">
      
      {/* FIXED SIDEBAR - PERMANENT - 256px */}
      <aside
  className="
    fixed
    left-0
    top-16        /* Push sidebar BELOW navbar */
    w-56          /* Reduce width from w-64 to w-56 */
    h-[calc(100vh-64px)]  /* Full height minus navbar */
    bg-[rgb(33,37,41)]
    text-white
    shadow-lg
    z-40
  "
>
        <div className="px-6 py-5 text-xl font-bold border-b border-gray-700">
          Admin Dashboard
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full px-6 py-3 text-left
                ${isActive(item.path)
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"}
              `}
            >
              <item.icon className="mr-3 w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT → PUSHED RIGHT BY 256px */}
      <main className="ml-64 w-[calc(100%-200px)] p-6 bg-gray-50 min-h-screen">
        {children}
      </main>

    </div>
  );
}
