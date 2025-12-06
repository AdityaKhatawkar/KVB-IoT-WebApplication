"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdminSidebarLayout from "../../../components/admin/AdminSidebarLayout";
const API_URL = import.meta.env.VITE_API_BASE_URL;

interface DeviceHistory {
  _id: string;
  device_name: string;
  crop_name: string;
  temperature: number;
  humidity: number;
  configuredAt: string;
}

// format date to DD-MM-YYYY HH:mm:ss
const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
};

const formatDateOnly = (dateString: string) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTimeOnly = (dateString: string) => {
  const d = new Date(dateString);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export default function DeviceHistoryPage() {
  const params = useParams();
  const deviceName = Array.isArray(params.device)
    ? params.device[0]
    : params.device;

  const [history, setHistory] = useState<DeviceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!deviceName) {
          console.warn("No deviceName in URL params");
          setLoading(false);
          return;
        }

        let url = `${API_URL}/api/device-config/${deviceName}/history`;
        const params: Record<string, string> = {};
        if (startDate) params.start = startDate; // yyyy-mm-dd from input
        if (endDate) params.end = endDate;

        const query = new URLSearchParams(params).toString();
        if (query) url += `?${query}`;

        const res = await axios.get(url);
        setHistory(res.data || []);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [deviceName, startDate, endDate]);

  // sorting (frontend)
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.configuredAt).getTime();
    const dateB = new Date(b.configuredAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // download CSV with DD-MM-YYYY format
  const downloadCSV = () => {
    if (!history.length) return;

    const headers = [
      "Device Name",
      "Crop Name",
      "Temperature",
      "Humidity",
      "Date",
      "Time",
    ];

    const rows = history.map((h) => [
      h.device_name,
      h.crop_name,
      h.temperature,
      h.humidity,
      formatDateOnly(h.configuredAt),
      formatTimeOnly(h.configuredAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${deviceName}-history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminSidebarLayout>
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">
          Device History: {deviceName}
        </h1>
        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={!history.length}
        >
          Download CSV
        </button>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sort Order</label>
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "newest" | "oldest")
            }
            className="border p-2 rounded"
          >
            <option value="newest">Newest → Oldest</option>
            <option value="oldest">Oldest → Newest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading history...</p>
      ) : sortedHistory.length > 0 ? (
        <table className="min-w-full border bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Crop Name</th>
              <th className="p-2 border">Temperature</th>
              <th className="p-2 border">Humidity</th>
              <th className="p-2 border">Configured At</th>
            </tr>
          </thead>
          <tbody>
            {sortedHistory.map((h) => (
              <tr key={h._id}>
                <td className="p-2 border">{h.crop_name}</td>
                <td className="p-2 border">{h.temperature}°C</td>
                <td className="p-2 border">{h.humidity}%</td>
                <td className="p-2 border">{formatDateTime(h.configuredAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No history found for this device.</p>
      )}
    </div>
    </AdminSidebarLayout>
  );
}
