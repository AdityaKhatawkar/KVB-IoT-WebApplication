"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/contexts/toast-context";

type CropPreset = {
  _id: string;
  crop_name: string;
  temperature: number;
  humidity: number;
  fan_stages: number[];

  free: boolean;      // free-tier preset
  assigned: boolean;  // user has access
  expired: boolean;   // expired access
  expiresAt?: string | null; 
};

export default function DeviceControlPage() {
  const { deviceName } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);

  const [presets, setPresets] = useState<CropPreset[]>([]);

  // Device operation mode
  const [operationMode, setOperationMode] =
    useState<"wifi" | "manual">("wifi");

  // Preset / Manual mode toggle
  const [presetMode, setPresetMode] =
    useState<"preset" | "manual">("preset");

  const [selectedPresetId, setSelectedPresetId] = useState("");

  // Manual mode values
  const [setTemp, setSetTemp] = useState<number | "">("");
  const [setHum, setSetHum] = useState<number | "">("");
  const [presetName, setPresetName] = useState("");

  const [manualFanStages, setManualFanStages] = useState<
    Array<number | "">
  >(["", "", "", "", "", ""]);

  const [submitting, setSubmitting] = useState(false);

  const selectedPreset = useMemo(() => {
    return presets.find((p) => p._id === selectedPresetId);
  }, [presets, selectedPresetId]);

  // =====================================================================================
  // FETCH OPERATION MODE
  // =====================================================================================
  const fetchOperationMode = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/operation-mode?device_name=${deviceName}`
      );

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to load operation mode");

      setOperationMode(data.operation_mode === 1 ? "wifi" : "manual");
    } catch (err: any) {
      showError("Error", err.message || "Failed to fetch operation mode");
    }
  };

  // =====================================================================================
  // UPDATE OPERATION MODE
  // =====================================================================================
  const updateOperationMode = async (mode: "wifi" | "manual") => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/operation-mode/${deviceName}/set`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation_mode: mode === "wifi" ? 1 : 0,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to update operation mode");

      setOperationMode(mode);

      showSuccess(
        "Operation Mode Updated",
        mode === "wifi"
          ? "WiFi mode enabled"
          : "Manual mode enabled"
      );
    } catch (err: any) {
      showError("Update Failed", err.message || "Could not update mode");
    }
  };

  // =====================================================================================
  // LOAD PRESETS + LAST CONFIG
  // =====================================================================================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        await fetchOperationMode();

        // Load user ID
        const storedUser = localStorage.getItem("user");
        let userId = null;

        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            userId = parsed._id || parsed.id;
          } catch {}
        }

        // Fetch presets from backend
        const presetRes = await fetch(
          `${API_BASE_URL}/api/users/${userId}/presets`
        );
        const presetJson = await presetRes.json();

        const formatted: CropPreset[] = presetJson.map((item: any) => {
          const crop = item.crop;

          return {
            _id: crop._id,
            crop_name: crop.crop_name,
            temperature: crop.temperature,
            humidity: crop.humidity,
            fan_stages: crop.fan_stages,

            free: item.free,
            assigned: item.assigned,
            expiresAt: item.expiresAt,
            expired: item.expiresAt
              ? new Date(item.expiresAt) < new Date()
              : false,
          };
        });

        setPresets(formatted);

        // Fetch last configuration
        const histRes = await fetch(
          `${API_BASE_URL}/api/device-config/${deviceName}/history?start=&end=`
        );
        const hist = await histRes.json();

        const latest =
          Array.isArray(hist) && hist.length ? hist[0] : null;

        if (latest) {
          setSetTemp(latest.temperature ?? "");
          setSetHum(latest.humidity ?? "");

          // Auto select latest preset
          if (latest.crop_name) {
            setPresetMode("preset");

            const match = formatted.find(
              (c) => c.crop_name === latest.crop_name
            );
            if (match) setSelectedPresetId(match._id);
          } else {
            setPresetMode("manual");
          }
        } else {
          setPresetMode("preset");
        }
      } catch (err: any) {
        showError("Loading Error", err.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [deviceName]);

  // =====================================================================================
  // SORTED PRESET LIST
  // =====================================================================================
  const presetOptions = useMemo(() => {
    return presets.slice().sort((a, b) =>
      a.crop_name.localeCompare(b.crop_name)
    );
  }, [presets]);
  // =====================================================================================
  // SUBMIT HANDLER
  // =====================================================================================
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const body: any = {
        operationMode,
        presetMode,
      };

      if (presetMode === "preset") {
        const preset = presets.find((p) => p._id === selectedPresetId);
        if (!preset) throw new Error("Please select a preset");

        body.cropName = preset.crop_name;
        body.fan_stages = preset.fan_stages.slice(0, 6);
      } else {
        if (setTemp === "" || setHum === "")
          throw new Error("Enter temperature and humidity set-points");

        if (!presetName.trim())
          throw new Error("Preset name is required for manual mode");

        body.temperature = Number(setTemp);
        body.humidity = Number(setHum);
        body.cropName = "manual";
        body.presetName = presetName.trim();

        const cleaned = manualFanStages.map((v) =>
          v === "" ? undefined : Number(v)
        );
        body.fan_stages = cleaned;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/device-config/${deviceName}/configure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to configure device");
      }

      showSuccess(
        "Configuration Updated!",
        "Device settings have been saved successfully"
      );
    } catch (err: any) {
      showError("Configuration Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  // =====================================================================================
  // UI START — LEFT COLUMN
  // =====================================================================================
return (
  <div className="min-h-screen bg-gray-50">
    {/* Header Banner */}
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold">Device Control</h1>
              <p className="text-green-100">{deviceName}</p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Online</span>
            </div>

            <button
              className="px-4 py-2 text-sm rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              onClick={() => navigate(`/user-dashboard/${deviceName}`)}
            >
              ← Device Data
            </button>

            <button
              className="px-4 py-2 text-sm rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh
            </button>
          </div>

        </div>
      </div>
    </div>

    {/* MAIN CONTENT */}
    <div className="max-w-7xl mx-auto px-6 py-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* Operation Mode */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📶</span>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Operation Mode
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-10 items-center">

                  {/* WiFi */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="operationMode"
                      value="wifi"
                      checked={operationMode === "wifi"}
                      onChange={() => updateOperationMode("wifi")}
                      className="w-4 h-4 text-green-600"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌐</span>
                      <span className="font-medium">WiFi</span>
                    </div>
                  </label>

                  {/* Manual */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="operationMode"
                      value="manual"
                      checked={operationMode === "manual"}
                      onChange={() => updateOperationMode("manual")}
                      className="w-4 h-4 text-green-600"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚙️</span>
                      <span className="font-medium">Manual</span>
                    </div>
                  </label>

                </div>
              </div>
            </div>

            {/* Preset Selection */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🌱</span>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Preset Selection
                </h2>
              </div>

              <div className="space-y-4">

                {/* Toggle */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="presetMode"
                      value="preset"
                      checked={presetMode === "preset"}
                      onChange={() => setPresetMode("preset")}
                      className="w-4 h-4 text-green-600"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌱</span>
                      <span className="font-medium">Preset</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="presetMode"
                      value="manual"
                      checked={presetMode === "manual"}
                      onChange={() => setPresetMode("manual")}
                      className="w-4 h-4 text-green-600"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚙️</span>
                      <span className="font-medium">Manual</span>
                    </div>
                  </label>
                </div>

                {/* PRESET MODE */}
                {presetMode === "preset" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Preset
                      </label>

                      <select
  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
  value={selectedPresetId}
  onChange={(e) => {
    const id = e.target.value;
    const preset = presetOptions.find((p) => p._id === id);

    // ---- LOCKED PRESET ----
    if (preset && preset.free === false && preset.assigned === false) {
      showError(
        "Preset Locked",
        "You need to purchase this preset to use it"
      );
      return;
    }

    // ---- EXPIRED PRESET ----
    if (preset?.expired) {
      showError(
        "Preset Expired",
        "Your access to this preset has expired"
      );
      return;
    }

    // Valid & usable → set
    setSelectedPresetId(id);
  }}
>
  <option value="">— Choose preset —</option>

  {presetOptions.map((p) => (
    <option
      key={p._id}
      value={p._id}
      disabled={p.expired || (!p.free && !p.assigned)}   // block expired + locked
      className={
        p.expired
          ? "text-red-500"
          : !p.free && !p.assigned
          ? "text-gray-400"
          : "text-black"
      }
    >
      {p.crop_name}
      {p.expired ? " (Expired)" : ""}
      {!p.free && !p.assigned ? " (Locked)" : ""}
    </option>
  ))}
</select>

                    </div>

                    {selectedPreset && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-green-600 text-xl">🌱</span>
                          <span className="font-semibold text-green-800">
                            Selected: {selectedPreset.crop_name}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-3 border border-green-100">
                            <div className="text-sm text-green-600 font-medium mb-1">
                              Temperature
                            </div>
                            <div className="text-xl font-bold text-slate-800">
                              {selectedPreset.temperature !== null
                                ? `${selectedPreset.temperature}°C`
                                : "Not set"}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-green-100">
                            <div className="text-sm text-green-600 font-medium mb-1">
                              Humidity
                            </div>
                            <div className="text-xl font-bold text-slate-800">
                              {selectedPreset.humidity !== null
                                ? `${selectedPreset.humidity}%`
                                : "Not set"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MANUAL MODE */}
                {presetMode === "manual" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preset Name
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Enter a name for this manual configuration"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature Set-point (°C)
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-lg px-4 py-3 text-lg font-semibold border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={setTemp}
                          onChange={(e) =>
                            setSetTemp(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          step={0.1}
                          placeholder="Enter temperature"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Humidity Set-point (%)
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-lg px-4 py-3 text-lg font-semibold border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={setHum}
                          onChange={(e) =>
                            setSetHum(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          step={1}
                          placeholder="Enter humidity"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📊</span>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Status
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">
                        Device Status
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-800">
                      Online
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-500">📶</span>
                      <span className="text-sm font-medium text-blue-700">
                        Connection
                      </span>
                    </div>
                    <div className="text-lg font-bold text-blue-800">
                      {operationMode === "wifi" ? "WiFi" : "Manual"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fan Control */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🌀</span>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Fan Control
                </h2>
              </div>

              <div className="space-y-6">

                {presetMode === "preset" && selectedPreset && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Preset Fan Stages (RPM)
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 rounded border bg-white"
                        >
                          <span className="text-gray-500 text-xs">
                            Stage {idx}
                          </span>
                          <span className="font-semibold tabular-nums text-sm">
                            {selectedPreset.fan_stages &&
                            typeof selectedPreset.fan_stages[idx] === "number"
                              ? selectedPreset.fan_stages[idx]
                              : "--"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {presetMode === "manual" && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Fan Stages (RPM)
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx}>
                          <label className="block text-xs text-gray-600 mb-1">
                            Stage {idx}
                          </label>
                          <input
                            type="number"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            value={manualFanStages[idx]}
                            onChange={(e) => {
                              const val =
                                e.target.value === "" ? "" : Number(e.target.value);
                              setManualFanStages((prev) => {
                                const next = [...prev];
                                next[idx] = val;
                                return next;
                              });
                            }}
                            min={0}
                            step={5}
                            placeholder="RPM"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  </div>
);
}
