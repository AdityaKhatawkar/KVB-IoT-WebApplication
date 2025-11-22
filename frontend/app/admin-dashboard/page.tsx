"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { AdminFooterCopyright } from "@/components/footer";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [devicesMetadataMap, setDevicesMetadataMap] = useState<Record<string, any>>({});
  const [onlineUsersBackend, setOnlineUsersBackend] = useState<any[]>([]);
  const [activeDeviceSummaries, setActiveDeviceSummaries] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    activeDevices: 0,
    inactiveDevices: 0,
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "devices">("users");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Helper to format lastActive
  const timeAgo = (iso?: string | null) => {
    if (!iso) return "N/A";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "N/A";
    }
  };

  // Fetch everything
  const fetchDashboardStats = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const [
        usersCountRes,
        deviceCountRes,
        activeDeviceRes,
        usersRes
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
      ]);

      const totalUsers = usersCountRes.data.totalUsers || 0;
      const totalDevices = deviceCountRes.data.totalDevices || 0;
      const activeDevicesCount = activeDeviceRes.data.activeDevices || 0;

      setDashboardStats({
        totalUsers,
        totalDevices,
        activeDevices: activeDevicesCount,
        inactiveDevices: totalDevices - activeDevicesCount,
      });

      const usersData = usersRes.data || [];
      setUsers(usersData);

      // Build device list
      const allNames: string[] = [];
      usersData.forEach((u: any) => {
        if (Array.isArray(u.devices)) {
          u.devices.forEach((dn: string) => allNames.push(dn));
        }
      });
      const uniqueNames = Array.from(new Set(allNames));

      // Fetch metadata for devices
      let metaMap: any = {};
      if (uniqueNames.length > 0) {
        const q = encodeURIComponent(uniqueNames.join(","));
        const metaRes = await axios.get(
          `${API_BASE_URL}/api/devices/metadata?deviceNames=${q}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        metaMap = metaRes.data || {};
      }
      setDevicesMetadataMap(metaMap);

      // Compute active devices from metadata
      const now = new Date();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const activeSummaries = Object.keys(metaMap)
        .map((deviceName) => {
          const meta = metaMap[deviceName];
          if (!meta) return null;

          const subscriptionValid =
            meta.subscriptionEnd && new Date(meta.subscriptionEnd) > now;
          const lastActiveValid =
            meta.lastActive && new Date(meta.lastActive) >= oneHourAgo;

          if (meta.active && subscriptionValid && lastActiveValid) {
            return {
              name: deviceName,
              lastTs: meta.lastActive,
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => {
          const ta = a.lastTs ? new Date(a.lastTs).getTime() : 0;
          const tb = b.lastTs ? new Date(b.lastTs).getTime() : 0;
          return tb - ta;
        });

      setActiveDeviceSummaries(activeSummaries);

      // Fetch ONLY user.lastActive-based online users
      const onlineRes = await axios.get(`${API_BASE_URL}/api/users/online`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOnlineUsersBackend(onlineRes.data?.users || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <AdminSidebarLayout>
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50 w-full">
        <div className="flex-1 w-full px-4 sm:px-6 md:px-8 pb-24 max-w-none">
          <h1 className="text-5xl font-bold text-center text-green-900 mb-8">
            Admin Dashboard
          </h1>

          {/* Summary Cards */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between mb-6 w-full">
            <Card className="bg-[#eaf6ea] border-green-900 border rounded-xl shadow-sm flex-1 min-w-[280px] p-6 text-center">
              <span className="text-xl text-green-900 block">
                Online Users
              </span>
              <span className="text-3xl font-bold">
                {onlineUsersBackend.length} / {dashboardStats.totalUsers}
              </span>
            </Card>

            <Card className="bg-[#eaf6ea] border-green-900 border rounded-xl shadow-sm flex-1 min-w-[280px] p-6 text-center">
              <span className="text-xl text-green-900 block">
                Active Devices
              </span>
              <span className="text-3xl font-bold">
                {dashboardStats.activeDevices} / {dashboardStats.totalDevices}
              </span>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "users"
                    ? "bg-green-700 text-white shadow"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Active Users
              </button>

              <button
                onClick={() => setActiveTab("devices")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "devices"
                    ? "bg-green-700 text-white shadow"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Active Devices
              </button>
            </div>

            <button
              onClick={fetchDashboardStats}
              className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-sm"
            >
              Refresh
            </button>
          </div>

          {/* TAB: ACTIVE USERS */}
          {activeTab === "users" && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-12">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                Active Users ({onlineUsersBackend.length})
              </h2>

              {onlineUsersBackend.length === 0 ? (
                <div className="text-sm text-gray-600">No active users.</div>
              ) : (
                <ul className="divide-y">
                  {onlineUsersBackend.map((u: any) => (
                    <li key={u._id} className="py-3 flex justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-600">{u.email}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Devices: {u.devices?.length || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last active: {timeAgo(u.lastActive)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* TAB: ACTIVE DEVICES */}
          {activeTab === "devices" && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-12">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                Active Devices ({activeDeviceSummaries.length})
              </h2>

              {activeDeviceSummaries.length === 0 ? (
                <div className="text-sm text-gray-600">No active devices.</div>
              ) : (
                <ul className="divide-y">
                  {activeDeviceSummaries.map((d: any) => {
                    const owners = users
                      .filter((u: any) => u.devices?.includes(d.name))
                      .map((u: any) => u.name);

                    return (
                      <li key={d.name} className="py-3">
                        <div className="flex justify-between">
                          <div className="font-medium text-gray-900">
                            {d.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {timeAgo(d.lastTs)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Owner: {owners.length > 0 ? owners.join(", ") : "Unknown"}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <AdminFooterCopyright />
      </div>
    </AdminSidebarLayout>
  );
}
