"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { API_BASE_URL } from "@/lib/config";

export default function DeviceDetailsPage() {
  const { deviceName } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("offline");
  const [lastTs, setLastTs] = useState("");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [setTemp, setSetTemp] = useState<number | null>(null);
  const [setHum, setSetHum] = useState<number | null>(null);
  const [preset, setPreset] = useState<string>("—");
  const [acFan, setAcFan] = useState<string>("OFF");
  const [dcFan, setDcFan] = useState<string>("OFF");
  const [circularRpm, setCircularRpm] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [range, setRange] = useState<string>("30d"); // 1d,5d,10d,15d,30d,custom
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtTs = (iso?: string) => {
    if (!iso) return "N/A";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "N/A";
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // latest sensor log
        const res = await fetch(`${API_BASE_URL}/api/devices/${deviceName}/recent`);
        let logs: any[] = [];
        if (res.ok) {
          logs = await res.json();
        }
        if (Array.isArray(logs) && logs.length) {
          const latest = logs[0];
          setLastTs(latest.timestamp);
          setTemperature(latest.temperature ?? null);
          setHumidity(latest.humidity ?? null);
          setAcFan(latest.ac_fan_status ?? "OFF");
          setDcFan(latest.dc_fan_status ?? "OFF");
          setCircularRpm(latest.circular_fan_speed ?? null);
          setStatus(latest.device_status === "online" ? "online" : "offline");
        }

        // latest config/preset
        const resCfg = await fetch(`${API_BASE_URL}/api/device-config/${deviceName}/history?start=&end=`);
        const cfgLogs = await resCfg.json();
        if (Array.isArray(cfgLogs) && cfgLogs.length) {
          const latestCfg = cfgLogs[0];
          setSetTemp(latestCfg.temperature ?? null);
          setSetHum(latestCfg.humidity ?? null);
          setPreset(latestCfg.crop_name || "—");
        }
      } catch (e: any) {
        setError(e.message || "Failed to load device");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deviceName]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const now = new Date();
        let start = "";
        let end = "";
        if (range === "custom") {
          start = customStart;
          end = customEnd;
        } else {
          const daysMap: Record<string, number> = { "1d": 1, "5d": 5, "10d": 10, "15d": 15, "30d": 30 };
          const days = daysMap[range] ?? 1;
          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - days);
          start = startDate.toISOString().slice(0, 10);
          end = now.toISOString().slice(0, 10);
        }
        const res = await fetch(`${API_BASE_URL}/api/device-config/${deviceName}/history?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (e) {
        setHistory([]);
      }
    };
    fetchHistory();
  }, [deviceName, range, customStart, customEnd]);

  // Loading shimmer component
  const LoadingShimmer = () => (
    <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-lg h-4 w-16"></div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
          <div className="text-red-600 text-lg font-semibold">{error}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              status === "online" 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              {status === "online" ? "ONLINE" : "OFFLINE"}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{deviceName}</h1>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
            <button
              className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              onClick={() => router.push(`/user-dashboard/${deviceName}/control`)}
            >
              Device Control →
            </button>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Sensor Data */}
          <div className="space-y-4">
            {/* Environmental Data */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-green-500">📊</span>
                ENVIRONMENTAL DATA
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Temperature Section */}
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-red-500 text-xl">🌡️</span>
                      <span className="font-semibold text-slate-700">TEMPERATURE</span>
                    </div>
                    
                    {/* Temperature Dial */}
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="8"
                          strokeDasharray={`${temperature !== null ? (temperature / 50) * 283 : 0} 283`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-slate-800">
                            {temperature !== null ? temperature : "—"}
                          </div>
                          <div className="text-sm text-slate-600">°C</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Temperature Setpoint */}
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <div className="text-sm font-medium text-slate-600 mb-1">TEMPERATURE SET-POINT</div>
                      <div className="text-lg font-bold text-slate-800">
                        {setTemp !== null ? setTemp : "—"}°C
                      </div>
                    </div>
                  </div>
                </div>

                {/* Humidity Section */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-blue-500 text-xl">💧</span>
                      <span className="font-semibold text-slate-700">HUMIDITY</span>
                    </div>
                    
                    {/* Humidity Dial */}
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          strokeDasharray={`${humidity !== null ? (humidity / 100) * 283 : 0} 283`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-slate-800">
                            {humidity !== null ? humidity : "—"}
                          </div>
                          <div className="text-sm text-slate-600">%</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Humidity Setpoint */}
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="text-sm font-medium text-slate-600 mb-1">HUMIDITY SET-POINT</div>
                      <div className="text-lg font-bold text-slate-800">
                        {setHum !== null ? setHum : "—"}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Preset - Subsection */}
              <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm font-medium text-slate-600 mb-2">CURRENT PRESET</div>
                <div className="text-xl font-bold text-green-700 flex items-center gap-2">
                  <span>🌱</span>
                  {preset}
                </div>
              </div>
            </div>

            {/* Fan Status */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-orange-500">🌪️</span>
                FAN STATUS
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-sm font-medium text-slate-600 mb-2">AC FAN STATUS</div>
                  <div className={`text-2xl font-bold ${
                    acFan === "ON" ? "text-green-600" : "text-slate-400"
                  }`}>
                    {acFan || "OFF"}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-sm font-medium text-slate-600 mb-2">DC FAN STATUS</div>
                  <div className={`text-2xl font-bold ${
                    dcFan === "ON" ? "text-green-600" : "text-slate-400"
                  }`}>
                    {dcFan || "OFF"}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-sm font-medium text-slate-600 mb-2">CIRCULAR FAN SPEED</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {circularRpm !== null ? `${circularRpm} RPM` : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Historical Trends */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-500">📈</span>
                HISTORICAL TRENDS
              </h2>
              <div className="flex items-center gap-2">
                <select
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-slate-400 transition-colors"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                >
                  <option value="1d">Last 1 day</option>
                  <option value="5d">Last 5 days</option>
                  <option value="10d">Last 10 days</option>
                  <option value="15d">Last 15 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="custom">Custom</option>
                </select>
                {range === "custom" && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-slate-400 transition-colors"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                    />
                    <input
                      type="date"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-slate-400 transition-colors"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Temperature Chart */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-center mb-4">
                  <div className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
                    🌡️ Temperature Trend
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="configuredAt" 
                        tickFormatter={(v) => new Date(v).toLocaleDateString()}
                        stroke="#64748b"
                        fontSize={10}
                      />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="url(#tempGradient)"
                        name="°C"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Humidity Chart */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-center mb-4">
                  <div className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
                    💧 Humidity Trend
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <defs>
                        <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="configuredAt" 
                        tickFormatter={(v) => new Date(v).toLocaleDateString()}
                        stroke="#64748b"
                        fontSize={10}
                      />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#humidityGradient)"
                        name="%"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}