"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

type CropPreset = {
  _id: string;
  crop_name: string;
  temperature?: number | null;
  humidity?: number | null;
  fan_stages?: number[] | null;
};

export default function AdminDeviceControlPage() {
  const params = useParams<{ id: string; deviceId: string }>();
  const router = useRouter();
  const userId = params.id;
  const deviceId = params.deviceId;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [presets, setPresets] = useState<CropPreset[]>([]);

  const [operationMode, setOperationMode] = useState<"wifi" | "manual">("wifi");
  const [presetMode, setPresetMode] = useState<"preset" | "manual">("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [setTemp, setSetTemp] = useState<number | "">("");
  const [setHum, setSetHum] = useState<number | "">("");
  const [presetName, setPresetName] = useState<string>("");
  const [manualFanStages, setManualFanStages] = useState<Array<number | "">>(["","","","","",""]);
  const [submitting, setSubmitting] = useState(false);

  const selectedPreset = useMemo(
    () => presets.find((p) => p._id === selectedPresetId),
    [presets, selectedPresetId]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch crops filtered by user (userId from route params)
        const cropsUrl = userId 
          ? `${API_BASE_URL}/api/crops?userId=${userId}`
          : `${API_BASE_URL}/api/crops`;
        
        const [cropsRes, histRes] = await Promise.all([
          fetch(cropsUrl),
          fetch(`${API_BASE_URL}/api/device-config/${deviceId}/history?start=&end=`),
        ]);
        const cropsJson = await cropsRes.json();
        const cropsList: CropPreset[] = Array.isArray(cropsJson?.crops) ? cropsJson.crops : cropsJson;
        setPresets(cropsList);

        const hist = await histRes.json();
        const latest = Array.isArray(hist) && hist.length ? hist[0] : null;
        if (latest) {
          const cropName = latest.crop_name;
          const temp = latest.temperature;
          const hum = latest.humidity;
          setSetTemp(temp ?? "");
          setSetHum(hum ?? "");
          const stageValues = [
            latest.stage1_pwm,
            latest.stage2_pwm,
            latest.stage3_pwm,
            latest.stage4_pwm,
            latest.stage5_pwm,
            latest.stage6_pwm,
          ];
          if (stageValues.some((v) => typeof v === "number")) {
            setManualFanStages(stageValues.map((v) => (typeof v === "number" ? v : "")));
          } else {
            setManualFanStages(["","","","","",""]);
          }

          if (cropName && cropName.toLowerCase() !== "manual") {
            // Preset mode currently in use if crop was selected previously
            setPresetMode("preset");
            const match = cropsList.find((c) => c.crop_name === cropName);
            if (match) setSelectedPresetId(match._id);
          } else {
            // Manual mode currently in use
            setPresetMode("manual");
          }
        } else {
          // Fallback to preset selection by default if no history
          setPresetMode("preset");
        }
      } catch (e: any) {
        setError(e.message || "Failed to load controls");
        toast({
          variant: "destructive",
          title: "Loading Error",
          description: e.message || "Failed to load controls",
        });
      } finally {
        setLoading(false);
      }
    };
    if (deviceId) load();
  }, [deviceId]);

  const presetOptions = useMemo(() => {
    return presets
      .slice()
      .sort((a, b) => a.crop_name.localeCompare(b.crop_name));
  }, [presets]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setSubmitting(true);
      const body: any = {
        operationMode,
        presetMode,
      };
      if (presetMode === "preset") {
        const preset = presets.find((p) => p._id === selectedPresetId);
        if (!preset) throw new Error("Please select a preset");
        // Backend expects 'cropName'
        body.cropName = preset.crop_name;
        if (Array.isArray(preset.fan_stages)) {
          body.fan_stages = preset.fan_stages.slice(0, 6);
        }
      } else {
        if (setTemp === "" || setHum === "") {
          throw new Error("Enter temperature and humidity set-points");
        }
        if (!presetName.trim()) {
          throw new Error("Preset name is required for manual mode");
        }
        body.temperature = Number(setTemp);
        body.humidity = Number(setHum);
        // Explicitly mark manual mode for older backends
        body.cropName = "manual";
        body.presetName = presetName.trim();
        const cleanedStages = manualFanStages.map((v) => (v === "" ? undefined : Number(v)));
        if (cleanedStages.some((v) => typeof v === "number" && !Number.isNaN(v))) {
          body.fan_stages = cleanedStages.map((v) => (typeof v === "number" ? v : undefined));
        }
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
        title: "Configuration Updated!",
        description: "Device settings have been saved successfully",
      });
    } catch (e: any) {
      setError(e.message || "Failed to submit configuration");
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: e.message || "Failed to submit configuration",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <AdminSidebarLayout>
      <div className="p-6">Loading…</div>
    </AdminSidebarLayout>
  );

  return (
    <AdminSidebarLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => router.push(`/admin-dashboard/customers/${userId}/devices/${deviceId}`)}
                  >
                    ← Device Data
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => router.push(`/admin-dashboard/customers/${userId}/devices`)}
                  >
                    ← Back to Devices
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column - Configuration */}
              <div className="space-y-6">
                
                {/* Operation Mode Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📶</span>
                    <h2 className="text-2xl font-semibold text-gray-800">Operation Mode</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="operationMode"
                          value="wifi"
                          checked={operationMode === "wifi"}
                          onChange={() => setOperationMode("wifi")}
                          className="w-4 h-4 text-green-600"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌐</span>
                          <span className="font-medium">WiFi</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="operationMode"
                          value="manual"
                          checked={operationMode === "manual"}
                          onChange={() => setOperationMode("manual")}
                          className="w-4 h-4 text-green-600"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚙️</span>
                          <span className="font-medium">Manual</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preset Selection Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🌱</span>
                    <h2 className="text-2xl font-semibold text-gray-800">Preset Selection</h2>
                  </div>
                  
                  <div className="space-y-4">
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

                    {presetMode === "preset" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Preset</label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={selectedPresetId}
                            onChange={(e) => setSelectedPresetId(e.target.value)}
                          >
                            <option value="">— Choose preset —</option>
                            {presetOptions.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.crop_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Preset Values Display */}
                        {selectedPreset && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-green-600 text-xl">🌱</span>
                              <span className="font-semibold text-green-800">Selected: {selectedPreset.crop_name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white rounded-lg p-3 border border-green-100">
                                <div className="text-sm text-green-600 font-medium mb-1">Temperature</div>
                                <div className="text-xl font-bold text-slate-800">
                                  {selectedPreset.temperature !== null ? `${selectedPreset.temperature}°C` : "Not set"}
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-green-100">
                                <div className="text-sm text-green-600 font-medium mb-1">Humidity</div>
                                <div className="text-xl font-bold text-slate-800">
                                  {selectedPreset.humidity !== null ? `${selectedPreset.humidity}%` : "Not set"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Temperature Set-point (°C)</label>
                            <input
                              type="number"
                              className="w-full border rounded-lg px-4 py-3 text-lg font-semibold border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              value={setTemp}
                              onChange={(e) => setSetTemp(e.target.value === "" ? "" : Number(e.target.value))}
                              step={0.1}
                              placeholder="Enter temperature"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Humidity Set-point (%)</label>
                            <input
                              type="number"
                              className="w-full border rounded-lg px-4 py-3 text-lg font-semibold border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={setHum}
                              onChange={(e) => setSetHum(e.target.value === "" ? "" : Number(e.target.value))}
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

              {/* Right Column - Status + Fan */}
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📊</span>
                    <h2 className="text-2xl font-semibold text-gray-800">Status</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Status Indicators */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-700">Device Status</span>
                        </div>
                        <div className="text-lg font-bold text-green-800">Online</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-500">📶</span>
                          <span className="text-sm font-medium text-blue-700">Connection</span>
                        </div>
                        <div className="text-lg font-bold text-blue-800">WiFi</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Fan Control Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🌀</span>
                    <h2 className="text-2xl font-semibold text-gray-800">Fan Control</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {presetMode === "preset" && selectedPreset ? (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Preset Fan Stages (RPM)</div>
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="flex items-center justify-between px-3 py-2 rounded border bg-white">
                              <span className="text-gray-500 text-xs">Stage {idx}</span>
                              <span className="font-semibold tabular-nums text-sm">
                                {selectedPreset.fan_stages && typeof selectedPreset.fan_stages[idx] === "number"
                                  ? selectedPreset.fan_stages[idx]
                                  : "--"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : presetMode === "manual" ? (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Fan Stages (RPM)</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx}>
                              <label className="block text-xs text-gray-600 mb-1">Stage {idx}</label>
                              <input
                                type="number"
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                value={manualFanStages[idx]}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? "" : Number(e.target.value);
                                  setManualFanStages((prev) => {
                                    const next = [...prev] as Array<number | "">;
                                    next[idx] = value;
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
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Save Button - Outside Cards */}
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
    </AdminSidebarLayout>
  );
}
