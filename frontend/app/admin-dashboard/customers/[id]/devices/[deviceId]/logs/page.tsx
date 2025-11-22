"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
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

export default function AdminDeviceLogsPage() {
  const params = useParams<{ id: string; deviceId: string }>();
  const userId = params.id;
  const deviceId = params.deviceId;

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

  const getFanStatus = (v: number | null | undefined) =>
    v === 1 ? "ON" : "OFF";

  const getDeviceStatus = (v: number | null | undefined) =>
    v === 1 ? "Online" : "Offline";

  // Default last 30 days
  useEffect(() => {
    const now = new Date();
    const past = new Date(now);
    past.setDate(now.getDate() - 30);

    const toLocalIso = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;

    setFromDateTime(toLocalIso(past));
    setToDateTime(toLocalIso(now));
  }, []);

  const fetchLogs = async () => {
    if (!deviceId || !fromDateTime || !toDateTime) return;

    setLoading(true);
    setError("");

    try {
      const url = new URL(`${API_BASE_URL}/api/devices/${deviceId}/recent`);
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
    if (deviceId && fromDateTime && toDateTime) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

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

    const rows = logs.map((l, i) => [
      i + 1,
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

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deviceId}-logs.csv`;
    a.click();
  };

  const infoLine = useMemo(() => {
    if (!deviceId || !fromDateTime || !toDateTime) return "";
    return `Device: ${deviceId} | From: ${fromDateTime} | To: ${toDateTime}`;
  }, [deviceId, fromDateTime, toDateTime]);

  return (
    <AdminSidebarLayout>
      <div className="p-6 min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">
          Device Logs — {deviceId}
        </h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm mb-1 font-medium">
              From
            </label>
            <input
              type="datetime-local"
              value={fromDateTime}
              onChange={(e) => setFromDateTime(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">
              To
            </label>
            <input
              type="datetime-local"
              value={toDateTime}
              onChange={(e) => setToDateTime(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit
            </button>
            <button
              onClick={downloadExcel}
              className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50"
            >
              Export CSV
            </button>
          </div>
        </div>

        {infoLine && (
          <div className="text-sm text-gray-600 mb-3">{infoLine}</div>
        )}

        {error && (
          <div className="text-red-500 font-medium mb-3">{error}</div>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-left border">
            <thead className="bg-gray-100">
              <tr>
                {[
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
                ].map((h) => (
                  <th key={h} className="p-2 border text-sm font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-center" colSpan={13}>
                    Loading…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td className="p-4 text-center" colSpan={13}>
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((l, i) => (
                  <tr key={l._id || i} className="text-sm">
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{toDate(l.timestamp)}</td>
                    <td className="p-2 border">{toTime(l.timestamp)}</td>
                    <td className="p-2 border">{l.device_name}</td>
                    <td className="p-2 border">{l.temperature ?? ""}</td>
                    <td className="p-2 border">{l.humidity ?? ""}</td>
                    <td className="p-2 border">{l.set_temperature ?? ""}</td>
                    <td className="p-2 border">{l.set_humidity ?? ""}</td>
                    <td className="p-2 border">
                      {getFanStatus(l.ac_fan_status)}
                    </td>
                    <td className="p-2 border">
                      {getFanStatus(l.dc_fan_status)}
                    </td>
                    <td className="p-2 border">
                      {l.circular_fan_speed ?? ""}
                    </td>
                    <td className="p-2 border">{l.operation_mode ?? ""}</td>
                    <td className="p-2 border">
                      {getDeviceStatus(l.device_status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
