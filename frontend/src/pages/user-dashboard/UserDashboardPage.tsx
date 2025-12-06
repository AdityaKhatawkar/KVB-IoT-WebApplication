import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../lib/config";

interface Device {
  device_name: string;
  active: boolean;
  preset?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

export default function UserDashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || Cookies.get("token")
        : null;

    if (!token) {
      alert("Session expired. Please log in again.");
      navigate("/login");
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
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch devices");
        }
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndDevices();
  }, [navigate]);

  // --------------------------
  // LOADING UI
  // --------------------------
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

  // --------------------------
  // ERROR UI
  // --------------------------
  if (error) {
    return <div className="p-6 text-red-600">❌ {error}</div>;
  }

  // --------------------------
  // MAIN UI
  // --------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">My Devices</h1>
            <p className="text-slate-600">Monitor and control your IoT devices</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 hover:shadow-md"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Empty UI */}
        {devices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Devices Found</h3>
            <p className="text-slate-600">No devices are currently assigned to your account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device, idx) => {
              const start = device.subscriptionStart ? new Date(device.subscriptionStart) : null;
              const end = device.subscriptionEnd ? new Date(device.subscriptionEnd) : null;
              const today = new Date();

              const daysRemaining = end
                ? Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
                : "N/A";

              return (
                <div
                  key={device.device_name}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-300 p-6 group"
                >
                  {/* Status */}
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
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {device.device_name}
                  </h3>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <span className="text-xs font-medium text-purple-600">Days Remaining</span>
                      <div className="text-lg font-bold">{daysRemaining}</div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <span className="text-xs font-medium text-green-600">Preset</span>
                      <div className="text-lg font-bold">{device.preset || "N/A"}</div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <span className="text-xs font-medium text-blue-600">Start Date</span>
                      <div>{start ? start.toLocaleDateString("en-IN") : "N/A"}</div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <span className="text-xs font-medium text-orange-600">Expiry</span>
                      <div>{end ? end.toLocaleDateString("en-IN") : "N/A"}</div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/user-dashboard/${device.device_name}`)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 hover:shadow-md"
                    >
                      👁️ View Data
                    </button>

                    <button
                      onClick={() => navigate(`/user-dashboard/${device.device_name}/control`)}
                      className="flex-1 px-4 py-3 border-2 border-yellow-400 text-slate-700 rounded-lg font-semibold hover:bg-yellow-50 hover:shadow-md"
                    >
                      ⚙️ Control
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
