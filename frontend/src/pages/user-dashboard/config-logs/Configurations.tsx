"use client";

import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/config";

type ConfigLog = {
  _id: string;
  device_name: string;
  crop_name?: string;
  temperature?: number;
  humidity?: number;
  configuredAt?: string;
  set_temperature?: number;
  set_humidity?: number;
  preset_mode?: string;
  preset_name?: string;
  stage1_pwm?: number;
  stage2_pwm?: number;
  stage3_pwm?: number;
  stage4_pwm?: number;
  stage5_pwm?: number;
  stage6_pwm?: number;
};

export default function ConfigLogsPage() {
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [fromDateTime, setFromDateTime] = useState<string>("");
  const [toDateTime, setToDateTime] = useState<string>("");
  const [logs, setLogs] = useState<ConfigLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const pad = (n: number) => String(n).padStart(2, "0");
  const toDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };
  const toTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // default past 30 days
  useEffect(() => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 30);
    const pad = (n: number) => String(n).padStart(2, "0");
    const toIsoLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setFromDateTime(toIsoLocal(past));
    setToDateTime(toIsoLocal(now));
  }, []);

  // fetch user's devices
  useEffect(() => {
    const token = localStorage.getItem("token") || Cookies.get("token");
    const storedUser = localStorage.getItem("user");
    let email = "";
    if (storedUser) {
      try {
        email = JSON.parse(storedUser)?.email || "";
      } catch {}
    }
    if (!email) email = Cookies.get("email") || "";
    if (!token || !email) return;

    const run = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/devices?email=${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch devices");
        const list = Array.isArray(data.devices) ? data.devices : [];
        setDevices(list);
        if (list.length && !selectedDevice) setSelectedDevice(list[0]);
      } catch (e: any) {
        setError(e.message || "Failed to load devices");
      }
    };
    run();
  }, [selectedDevice]);

  const fetchLogs = async () => {
    if (!selectedDevice || !fromDateTime || !toDateTime) return;
    setLoading(true);
    setError("");
    try {
      // Config logs endpoint
      const url = new URL(`${API_BASE_URL}/api/device-config/${selectedDevice}/history`);
      url.searchParams.set("start", fromDateTime.slice(0, 10));
      url.searchParams.set("end", toDateTime.slice(0, 10));
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch logs");
      // Expecting array of { device_name, crop_name, temperature, humidity, configuredAt }
      setLogs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDevice && fromDateTime && toDateTime) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevice]);

  const downloadExcel = () => {
    const headers = [
      "Sl. No.",
      "Date",
      "Time",
      "Device Name",
      "Preset Mode",
      "Preset Name",
      "Temp Setpoint",
      "Humidity Setpoint",
      "Stage 0 RPM",
      "Stage 1 RPM",
      "Stage 2 RPM",
      "Stage 3 RPM",
      "Stage 4 RPM",
      "Stage 5 RPM",
    ];
    const rows = logs.map((l, idx) => [
      idx + 1,
      toDate(l.configuredAt),
      toTime(l.configuredAt),
      l.device_name,
      l.preset_mode || (l.crop_name && l.crop_name.toLowerCase() !== "manual" ? "Preset" : "Manual"),
      l.preset_name || l.crop_name || "",
      // Backend stores setpoints in `temperature` and `humidity` fields in DeviceHistory
      l.temperature ?? "",
      l.humidity ?? "",
      l.stage1_pwm ?? "",
      l.stage2_pwm ?? "",
      l.stage3_pwm ?? "",
      l.stage4_pwm ?? "",
      l.stage5_pwm ?? "",
      l.stage6_pwm ?? "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedDevice || "device"}-config-logs.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const infoLine = useMemo(() => {
    if (!selectedDevice || !fromDateTime || !toDateTime) return "";
    return `Device Name: ${selectedDevice} | From: ${fromDateTime} To: ${toDateTime}`;
  }, [selectedDevice, fromDateTime, toDateTime]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Config Logs</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-md shadow flex flex-col md:flex-row gap-3 md:items-end mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Device</label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {devices.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">From</label>
          <input type="datetime-local" value={fromDateTime} onChange={(e) => setFromDateTime(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <input type="datetime-local" value={toDateTime} onChange={(e) => setToDateTime(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit</button>
          <button onClick={downloadExcel} className="px-4 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50">Export Data</button>
        </div>
      </div>

      {/* Info line */}
      {infoLine && (
        <div className="text-sm text-gray-600 mb-3">{infoLine}</div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-md shadow">
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Sl. No.</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Device Name</th>
              <th className="p-2 border">Preset Mode</th>
              <th className="p-2 border">Preset Name</th>
              <th className="p-2 border">Temp Setpoint</th>
              <th className="p-2 border">Humidity Setpoint</th>
              <th className="p-2 border">Stage 0 RPM</th>
              <th className="p-2 border">Stage 1 RPM</th>
              <th className="p-2 border">Stage 2 RPM</th>
              <th className="p-2 border">Stage 3 RPM</th>
              <th className="p-2 border">Stage 4 RPM</th>
              <th className="p-2 border">Stage 5 RPM</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-center" colSpan={14}>Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td className="p-4 text-center" colSpan={14}>No logs found</td></tr>
            ) : (
              logs.map((l, idx) => (
                <tr key={l._id || idx}>
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border">{toDate(l.configuredAt)}</td>
                  <td className="p-2 border">{toTime(l.configuredAt)}</td>
                  <td className="p-2 border">{l.device_name}</td>
                  <td className="p-2 border">{l.preset_mode || (l.crop_name && l.crop_name.toLowerCase() !== "manual" ? "Preset" : "Manual")}</td>
                  <td className="p-2 border">{l.preset_name || l.crop_name || ""}</td>
                  <td className="p-2 border">{l.temperature ?? ""}</td>
                  <td className="p-2 border">{l.humidity ?? ""}</td>
                  <td className="p-2 border">{l.stage1_pwm ?? ""}</td>
                  <td className="p-2 border">{l.stage2_pwm ?? ""}</td>
                  <td className="p-2 border">{l.stage3_pwm ?? ""}</td>
                  <td className="p-2 border">{l.stage4_pwm ?? ""}</td>
                  <td className="p-2 border">{l.stage5_pwm ?? ""}</td>
                  <td className="p-2 border">{l.stage6_pwm ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


