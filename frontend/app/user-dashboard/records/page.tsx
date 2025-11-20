"use client";

import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/lib/config";

type Log = {
  _id: string;
  timestamp?: string;
  device_name: string;
  temperature?: number;
  humidity?: number;
  set_temperature?: number;
  set_humidity?: number;
  ac_fan_status?: number;
  dc_fan_status?: number;
  circular_fan_speed?: number;
  operation_mode?: string;
  device_status?: number;
};

export default function DeviceRecordsPage() {
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [fromDateTime, setFromDateTime] = useState<string>("");
  const [toDateTime, setToDateTime] = useState<string>("");
  const [logs, setLogs] = useState<Log[]>([]);
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

  // Helper functions to convert numeric status to meaningful text
  const getFanStatus = (status: number | null | undefined) => {
    if (status === null || status === undefined) return "";
    return status === 1 ? "ON" : "OFF";
  };

  const getDeviceStatus = (status: number | null | undefined) => {
    if (status === null || status === undefined) return "";
    return status === 1 ? "Online" : "Offline";
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
      // Sensor logs endpoint: deviceController.getRecentByDevice (adjust if different):
      const url = new URL(`${API_BASE_URL}/api/devices/${selectedDevice}/recent`);
      url.searchParams.set("start", fromDateTime);
      url.searchParams.set("end", toDateTime);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch logs");
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
      "Temperature",
      "Humidity",
      "Set Temperature",
      "Set Humidity",
      "AC Fan Status",
      "DC Fan Status",
      "Circular Fan Speed",
      "Operation Mode",
      "Device Status",
    ];
    const rows = logs.map((l, idx) => [
      idx + 1,
      toDate(l.timestamp),
      toTime(l.timestamp),
      l.device_name,
      l.temperature ?? "",
      l.humidity ?? "",
      l.set_temperature ?? "",
      l.set_humidity ?? "",
      getFanStatus(l.ac_fan_status),
      getFanStatus(l.dc_fan_status),
      l.circular_fan_speed ?? "",
      l.operation_mode ?? "",
      getDeviceStatus(l.device_status),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedDevice || "device"}-logs.csv`;
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
      <h1 className="text-2xl font-bold mb-4">Device Data Logs</h1>

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
              <th className="p-2 border">Temperature</th>
              <th className="p-2 border">Humidity</th>
              <th className="p-2 border">Set Temperature</th>
              <th className="p-2 border">Set Humidity</th>
              <th className="p-2 border">AC Fan Status</th>
              <th className="p-2 border">DC Fan Status</th>
              <th className="p-2 border">Circular Fan Speed</th>
              <th className="p-2 border">Operation Mode</th>
              <th className="p-2 border">Device Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-center" colSpan={13}>Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td className="p-4 text-center" colSpan={13}>No logs found</td></tr>
            ) : (
              logs.map((l, idx) => (
                <tr key={l._id || idx}>
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border">{toDate(l.timestamp)}</td>
                  <td className="p-2 border">{toTime(l.timestamp)}</td>
                  <td className="p-2 border">{l.device_name}</td>
                  <td className="p-2 border">{l.temperature ?? ""}</td>
                  <td className="p-2 border">{l.humidity ?? ""}</td>
                  <td className="p-2 border">{l.set_temperature ?? ""}</td>
                  <td className="p-2 border">{l.set_humidity ?? ""}</td>
                  <td className="p-2 border">{getFanStatus(l.ac_fan_status)}</td>
                  <td className="p-2 border">{getFanStatus(l.dc_fan_status)}</td>
                  <td className="p-2 border">{l.circular_fan_speed ?? ""}</td>
                  <td className="p-2 border">{l.operation_mode ?? ""}</td>
                  <td className="p-2 border">{getDeviceStatus(l.device_status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


