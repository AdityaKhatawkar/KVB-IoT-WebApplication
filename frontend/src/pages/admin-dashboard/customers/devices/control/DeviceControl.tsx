"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

type CropPreset = {
  _id: string;
  crop_name: string;
  temperature: number | null;
  humidity: number | null;
  fan_stages: number[] | null;

  free?: boolean;
  assigned?: boolean;
  expired?: boolean;
  expiresAt?: string | null;
};

export default function AdminDeviceControlPage() {
  const params = useParams<{ id: string; deviceId: string }>();
  const navigate = useNavigate();
  const userId = params.id;
  const deviceId = params.deviceId;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [presets, setPresets] = useState<CropPreset[]>([]);

  const [operationMode, setOperationMode] = useState<"wifi" | "manual">("wifi");
  const [presetMode, setPresetMode] = useState<"preset" | "manual">("preset");

  const [selectedPresetId, setSelectedPresetId] = useState("");

  const [setTemp, setSetTemp] = useState<number | "">("");
  const [setHum, setSetHum] = useState<number | "">("");
  const [presetName, setPresetName] = useState("");

  const [manualFanStages, setManualFanStages] = useState<Array<number | "">>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [submitting, setSubmitting] = useState(false);

  const selectedPreset = useMemo(
    () => presets.find((p) => p._id === selectedPresetId),
    [presets, selectedPresetId]
  );

  // =====================================================================================
  // FETCH OPERATION MODE
  // =====================================================================================
  const fetchOperationMode = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/operation-mode?device_name=${deviceId}`
      );
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to load operation mode");

      setOperationMode(data.operation_mode === 1 ? "wifi" : "manual");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const updateOperationMode = async (mode: "wifi" | "manual") => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/operation-mode/${deviceId}/set`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation_mode: mode === "wifi" ? 1 : 0 }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update mode");

      setOperationMode(mode);

      toast({
        title: "Operation Mode Updated",
        description: mode === "wifi" ? "WiFi mode enabled" : "Manual mode enabled",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message,
      });
    }
  };

  // =====================================================================================
  // LOAD ADMIN PRESETS + LAST CONFIG
  // =====================================================================================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        await fetchOperationMode();

        // ADMIN always sees ALL user presets
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

        // Last config history
        const histRes = await fetch(
          `${API_BASE_URL}/api/device-config/${deviceId}/history?start=&end=`
        );
        const hist = await histRes.json();

        const latest = Array.isArray(hist) && hist.length ? hist[0] : null;

        if (latest) {
          setSetTemp(latest.temperature ?? "");
          setSetHum(latest.humidity ?? "");

          // Autofill fan stages
          const stages = [
            latest.stage1_pwm,
            latest.stage2_pwm,
            latest.stage3_pwm,
            latest.stage4_pwm,
            latest.stage5_pwm,
            latest.stage6_pwm,
          ];

          setManualFanStages(
            stages.map((v) => (typeof v === "number" ? v : ""))
          );

          if (latest.crop_name && latest.crop_name !== "manual") {
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
        toast({
          variant: "destructive",
          title: "Loading Error",
          description: err.message,
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [deviceId]);

  const presetOptions = useMemo(() => {
    return presets.slice().sort((a, b) =>
      a.crop_name.localeCompare(b.crop_name)
    );
  }, [presets]);

  // =====================================================================================
  // SUBMIT CONFIG
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
        if (preset.fan_stages) {
          body.fan_stages = preset.fan_stages.slice(0, 6);
        }
      } else {
        if (setTemp === "" || setHum === "")
          throw new Error("Enter temperature and humidity set-points");

        if (!presetName.trim())
          throw new Error("Preset name is required for manual mode");

        body.temperature = Number(setTemp);
        body.humidity = Number(setHum);
        body.cropName = "manual";
        body.presetName = presetName.trim();

        body.fan_stages = manualFanStages.map((v) =>
          v === "" ? undefined : Number(v)
        );
      }

      const res = await fetch(
        `${API_BASE_URL}/api/device-config/${deviceId}/configure`,
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

      toast({
        title: "Configuration Updated",
        description: "Device settings have been saved successfully",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: err.message,
      });
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <AdminSidebarLayout>
        <div className="p-6">Loading…</div>
      </AdminSidebarLayout>
    );

  // =====================================================================================
  // UI
  // =====================================================================================
  return (
    <AdminSidebarLayout>
      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">
                {/* <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"> */}
                  {/* <span className="text-2xl">⚙️</span> */}
                {/* </div> */}
                <div>
                  <h1 className="text-2xl font-bold">Device Control</h1>
                  <p className="text-green-100">{deviceId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Online</span>
                </div>

                <Button
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() =>
                    navigate(
                      `/admin-dashboard/customers/${userId}/devices/${deviceId}`
                    )
                  }
                >
                  ← Device Data
                </Button>

                <Button
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() =>
                    navigate(
                      `/admin-dashboard/customers/${userId}/devices`
                    )
                  }
                >
                  ← Back to Devices
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <form onSubmit={onSubmit} className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT COLUMN */}
              <div className="space-y-6">

                {/* Operation Mode */}
                <div className="bg-white rounded-2xl shadow-lg border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📶</span>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Operation Mode
                    </h2>
                  </div>

                  <div className="flex gap-10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="operationMode"
                        value="wifi"
                        checked={operationMode === "wifi"}
                        onChange={() => updateOperationMode("wifi")}
                      />
                      <span>🌐 WiFi</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="operationMode"
                        value="manual"
                        checked={operationMode === "manual"}
                        onChange={() => updateOperationMode("manual")}
                      />
                      <span>⚙️ Manual</span>
                    </label>
                  </div>
                </div>

                {/* Preset Selection */}
                <div className="bg-white rounded-2xl shadow-lg border p-6">
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
                        />
                        <span>🌱 Preset</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="presetMode"
                          value="manual"
                          checked={presetMode === "manual"}
                          onChange={() => setPresetMode("manual")}
                        />
                        <span>⚙️ Manual</span>
                      </label>
                    </div>

                    {/* PRESET MODE */}
                    {presetMode === "preset" && (
                      <div className="space-y-4">

                        <select
                          className="w-full border rounded-lg px-4 py-3"
                          value={selectedPresetId}
                          onChange={(e) => setSelectedPresetId(e.target.value)}
                        >
                          <option value="">Choose preset</option>

                          {presetOptions.map((p) => (
                            <option
                              key={p._id}
                              value={p._id}
                              className={p.expired ? "text-red-500" : ""}
                            >
                              {p.crop_name} {p.expired ? "(Expired)" : ""}
                            </option>
                          ))}
                        </select>

                        {selectedPreset && (
                          <div className="bg-green-50 border rounded-xl p-4">
                            <div className="font-semibold mb-4">
                              Selected: {selectedPreset.crop_name}
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                              <div className="bg-white rounded-lg p-3 border">
                                <div className="text-sm text-green-600 mb-1">
                                  Temperature
                                </div>
                                <div className="text-xl font-bold">
                                  {selectedPreset.temperature ?? "--"}
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-3 border">
                                <div className="text-sm text-green-600 mb-1">
                                  Humidity
                                </div>
                                <div className="text-xl font-bold">
                                  {selectedPreset.humidity ?? "--"}
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
                        <input
                          type="text"
                          placeholder="Preset name"
                          className="w-full border rounded-lg px-4 py-3"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="number"
                            placeholder="Temperature"
                            className="w-full border rounded-lg px-4 py-3"
                            value={setTemp}
                            onChange={(e) =>
                              setSetTemp(
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                          />

                          <input
                            type="number"
                            placeholder="Humidity"
                            className="w-full border rounded-lg px-4 py-3"
                            value={setHum}
                            onChange={(e) =>
                              setSetHum(
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">

                {/* Status */}
                <div className="bg-white rounded-2xl shadow-lg border p-6">
                  <div className="text-xl font-semibold mb-6">📊 Status</div>

                  <div className="grid grid-cols-2 gap-4">

                    <div className="bg-green-50 border rounded-lg p-4">
                      <div className="font-medium">Device Status</div>
                      <div className="text-lg font-bold">Online</div>
                    </div>

                    <div className="bg-blue-50 border rounded-lg p-4">
                      <div className="font-medium">Connection</div>
                      <div className="text-lg font-bold">
                        {operationMode === "wifi" ? "WiFi" : "Manual"}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Fan Control */}
                <div className="bg-white rounded-2xl shadow-lg border p-6">
                  <div className="text-xl font-semibold mb-6">🌀 Fan Control</div>

                  {presetMode === "preset" && selectedPreset && (
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="border rounded px-3 py-2 flex justify-between"
                        >
                          <span>Stage {idx}</span>
                          <span>
                            {selectedPreset.fan_stages &&
                            typeof selectedPreset.fan_stages[idx] === "number"
                              ? selectedPreset.fan_stages[idx]
                              : "--"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {presetMode === "manual" && (
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx}>
                          <label className="text-xs">Stage {idx}</label>
                          <input
                            type="number"
                            className="w-full border rounded-lg px-3 py-2 mt-1"
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
                            placeholder="RPM"
                            min={0}
                            step={5}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Errors */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center gap-3"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    {/* <span>💾</span> */}
                    Save Configuration
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </AdminSidebarLayout>
  );
}
