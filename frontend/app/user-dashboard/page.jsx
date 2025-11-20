"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/config";

export default function UserDashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || Cookies.get("token")
        : null;

    if (!token) {
      alert("Session expired. Please log in again.");
      router.push("/login");
      return;
    }

    const fetchUserAndDevices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load user data");
        }

        setDevices(data.devices || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch devices");
        setTimeout(() => router.push("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndDevices();
  }, [router]);

  // ===============================
  // LOADING UI
  // ===============================
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ===============================
  // ERROR UI
  // ===============================
  if (error) {
    return <div className="p-6 text-red-600">❌ {error}</div>;
  }

  // ===============================
  // DASHBOARD UI
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              My Devices
            </h1>
            <p className="text-slate-600">
              Monitor and control your IoT devices
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 hover:shadow-md"
          >
            🔄 Refresh
          </button>
        </div>

        {/* NO DEVICES */}
        {devices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Devices Found
            </h3>
            <p className="text-slate-600">
              No devices are currently assigned to your account.
            </p>
          </div>
        ) : (
          // DEVICE GRID
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device, idx) => {
              const start = device.subscriptionStart
                ? new Date(device.subscriptionStart)
                : null;

              const end = device.subscriptionEnd
                ? new Date(device.subscriptionEnd)
                : null;

              const today = new Date();

              const daysRemaining = end
                ? Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)))
                : "N/A";

              return (
                <div
                  key={device.device_name}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-300 p-6 group"
                >
                  {/* Status Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full animate-pulse ${
                          device.active ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          device.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {device.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Device Name */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      {device.device_name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-sm">🌐</span>
                      <span className="text-sm">IoT Device</span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Days Remaining */}
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-purple-500 text-sm">⏰</span>
                        <span className="text-xs font-medium text-purple-600">
                          Days Remaining
                        </span>
                      </div>
                      <div className="text-lg font-bold text-slate-800">
                        {daysRemaining}
                      </div>
                    </div>

                    {/* Preset */}
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-500 text-sm">🌱</span>
                        <span className="text-xs font-medium text-green-600">
                          Preset
                        </span>
                      </div>
                      <div className="text-lg font-bold text-slate-800">
                        {device.preset || "N/A"}
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-500 text-sm">📅</span>
                        <span className="text-xs font-medium text-blue-600">
                          Start Date
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {start ? start.toLocaleDateString("en-IN") : "N/A"}
                      </div>
                    </div>

                    {/* Expiry */}
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-orange-500 text-sm">⏳</span>
                        <span className="text-xs font-medium text-orange-600">
                          Expiry
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {end ? end.toLocaleDateString("en-IN") : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        router.push(`/user-dashboard/${device.device_name}`)
                      }
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <span>👁️</span>
                      View Data
                    </button>

                    <button
                      onClick={() =>
                        router.push(
                          `/user-dashboard/${device.device_name}/control`
                        )
                      }
                      className="flex-1 px-4 py-3 border-2 border-yellow-400 text-slate-700 rounded-lg font-semibold hover:bg-yellow-50 transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <span>⚙️</span>
                      Control
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
