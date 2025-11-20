"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { AdminFooterCopyright } from "@/components/footer";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import { Card } from "@/components/ui/card";
import { User, Device, DashboardStats } from "@/types/admin";

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDevices: 0,
    activeDevices: 0,
    inactiveDevices: 0,
  });

  const [activeDeviceSummaries, setActiveDeviceSummaries] = useState<
    { name: string; lastTs?: string }[]
  >([]);

  const [search, setSearch] = useState("");
  const [newDevice, setNewDevice] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ==============================
  // Fetch backend stats
  // ==============================
  const fetchDashboardStats = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const [
        usersCountRes,
        deviceCountRes,
        activeDeviceRes,
        usersRes,
        devicesRes,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),

        axios.get(`${API_BASE_URL}/api/users/devices/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),

        axios.get(`${API_BASE_URL}/api/users/devices/active`, {
          headers: { Authorization: `Bearer ${token}` },
        }),

        axios.get(`${API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),

        axios.get(`${API_BASE_URL}/api/devices`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const totalUsers = usersCountRes.data.totalUsers || 0;
      const totalDevices = deviceCountRes.data.totalDevices || 0;
      const activeDevices = activeDeviceRes.data.activeDevices || 0;

      setDashboardStats({
        totalUsers,
        totalDevices,
        activeDevices,
        inactiveDevices: totalDevices - activeDevices,
      });

      // FIXED HERE — extract devices array properly
      const users = usersRes.data || [];
      const devices = devicesRes.data?.devices || [];

      setUsers(users);
      setDevices(devices);

      // Build active device list
      const online = devices.filter((d: any) => d.status === "online");

      const summaries = await Promise.all(
        online.map(async (d: any) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/api/devices/${encodeURIComponent(
                d.name || d.device_name || ""
              )}/recent`
            );

            const logs = await res.json();
            const lastTs =
              Array.isArray(logs) && logs.length > 0
                ? logs[0]?.timestamp
                : undefined;

            return {
              name: d.name || d.device_name || "—",
              lastTs,
            };
          } catch {
            return { name: d.name || d.device_name || "—" };
          }
        })
      );

      summaries.sort((a, b) => {
        const ta = a.lastTs ? new Date(a.lastTs).getTime() : 0;
        const tb = b.lastTs ? new Date(b.lastTs).getTime() : 0;
        return tb - ta;
      });

      setActiveDeviceSummaries(summaries);
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Load on mount
  // ==============================
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <AdminSidebarLayout>
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50 w-full">
        <div className="flex-1 w-full px-4 sm:px-6 md:px-8 pb-24 max-w-none">
          <h1 className="text-5xl font-bold text-center text-green-900 mb-10">
            Admin Dashboard
          </h1>

          {/* Summary Cards */}
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 justify-center md:justify-between mb-12 w-full">
            <Card className="bg-[#eaf6ea] border-green-800 border rounded-xl shadow-sm flex-1 min-w-[280px] p-6 md:p-8 text-center">
              <span className="text-xl md:text-2xl text-green-900 mb-2">
                Online Users
              </span>
              <span className="text-2xl md:text-3xl font-bold">
                {(() => {
                  if (!Array.isArray(users) || !Array.isArray(devices))
                    return `0 / ${dashboardStats.totalUsers}`;

                  const onlineUsers = users.filter((user) =>
                    user.devices.some((deviceName) =>
                      devices.some(
                        (d: any) =>
                          (d.name === deviceName ||
                            d.device_name === deviceName) &&
                          d.status === "online"
                      )
                    )
                  ).length;

                  return `${onlineUsers} / ${dashboardStats.totalUsers}`;
                })()}
              </span>
            </Card>

            <Card className="bg-[#eaf6ea] border-green-800 border rounded-xl shadow-sm flex-1 min-w-[280px] p-6 md:p-8 text-center">
              <span className="text-xl md:text-2xl text-green-900 mb-2">
                Active Devices
              </span>
              <span className="text-2xl md:text-3xl font-bold">
                {dashboardStats.activeDevices} / {dashboardStats.totalDevices}
              </span>
            </Card>
          </div>

          {/* Active Device List */}
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Active Devices
              </h2>
              <span className="text-sm text-gray-500">
                Sorted by most recent update
              </span>
            </div>

            {activeDeviceSummaries.length === 0 ? (
              <div className="text-sm text-gray-600">No active devices.</div>
            ) : (
              <ul className="divide-y">
                {activeDeviceSummaries.map((d) => (
                  <li
                    key={d.name}
                    className="py-2 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">
                      {d.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {d.lastTs
                        ? new Date(d.lastTs).toLocaleString()
                        : "N/A"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <AdminFooterCopyright />
      </div>
    </AdminSidebarLayout>
  );
}
