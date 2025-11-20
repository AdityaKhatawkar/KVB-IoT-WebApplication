"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminFooterCopyright } from "@/components/footer";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  BookUser,
  Settings2,
  Package,
  Cpu,
  Upload,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Preset = {
  _id: string;
  crop_name: string;
  temperature: number | string;
  humidity: number | string;
  tier?: "free" | "locked";
};

export default function ManagePresetsPage() {
  const router = useRouter();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [editForm, setEditForm] = useState({
    crop_name: "",
    temperature: "",
    humidity: ""
  });

  // Fetch presets
  const fetchPresets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/crops", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setPresets(arr);
    } catch (err: any) {
      console.error("Fetch presets error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update preset tier
  const updatePresetTier = async (presetId: string, tier: "free" | "locked") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/crops/${presetId}/tier`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.msg || "Failed to update tier");
      }
      
      await fetchPresets();
    } catch (err: any) {
      alert(err.message || "Error updating tier");
    }
  };

  // Handle file selection and auto-upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // Auto-upload when file is selected
    try {
      setUploadLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("http://localhost:5000/api/crops/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const result = await res.json();
      setMessage(result?.msg || "Upload complete.");
      await fetchPresets();
      setFile(null);
      // Reset the input
      e.target.value = "";
    } catch (err) {
      console.error(err);
      setMessage("Error uploading file.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete preset (placeholder)
  const deletePreset = async (presetId: string) => {
    if (!confirm("Are you sure you want to delete this preset?")) return;

    try {
      // TODO: Replace with actual API call when endpoint is available
      setPresets(prev => prev.filter(preset => preset._id !== presetId));
      alert("Preset deleted successfully!");
    } catch (err: any) {
      alert("Error deleting preset");
    }
  };

  // Open update dialog with preset data
  const openUpdateDialog = (preset: Preset) => {
    setEditingPreset(preset);
    setEditForm({
      crop_name: preset.crop_name,
      temperature: preset.temperature.toString(),
      humidity: preset.humidity.toString()
    });
    setShowUpdateDialog(true);
  };

  // Save preset updates
  const savePresetUpdate = async () => {
    if (!editingPreset) return;
    
    try {
      // TODO: Replace with actual API call when endpoint is available
      setPresets(prev => prev.map(preset => 
        preset._id === editingPreset._id 
          ? {
              ...preset,
              crop_name: editForm.crop_name,
              temperature: editForm.temperature,
              humidity: editForm.humidity
            }
          : preset
      ));
      setShowUpdateDialog(false);
      setEditingPreset(null);
      alert("Preset updated successfully!");
    } catch (err: any) {
      alert("Error updating preset");
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  return (
    <AdminSidebarLayout>
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
          <div className="flex-1 w-full px-4 sm:px-6 md:px-8 pb-24">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-green-900 mb-6 md:mb-8">
              Preset Manager
            </h1>

            {/* Upload Preset (JSON file) */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-end gap-2">
              <Input
                id="preset-upload"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={uploadLoading}
                className="hidden"
              />
              <Label htmlFor="preset-upload">
                <Button
                  asChild
                  disabled={uploadLoading}
                  className="bg-green-600 hover:bg-green-700 cursor-pointer"
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Preset
                  </span>
                </Button>
              </Label>
              {uploadLoading && (
                <span className="text-green-700">Uploading...</span>
              )}
            </div>
            {message && (
              <p className="text-green-700 mb-4 text-center">{message}</p>
            )}

            {/* Presets Table */}
            <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50">
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Preset Name</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Temperature (°C)</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Humidity (%)</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Tier</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : presets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No presets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      presets.map((preset) => (
                        <TableRow key={preset._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-xs md:text-sm">{preset.crop_name}</TableCell>
                          <TableCell className="text-xs md:text-sm">{preset.temperature}°C</TableCell>
                          <TableCell className="text-xs md:text-sm">{preset.humidity}%</TableCell>
                          <TableCell>
                            <select
                              value={preset.tier || "locked"}
                              onChange={(e) => updatePresetTier(preset._id, e.target.value as "free" | "locked")}
                              className="text-xs md:text-sm border rounded px-2 py-1"
                            >
                              <option value="free">Free</option>
                              <option value="locked">Locked</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-1 md:gap-2">
                              <Button
                                onClick={() => openUpdateDialog(preset)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-xs md:text-sm"
                              >
                                <Edit className="w-3 h-3" />
                                Update
                              </Button>
                              <Button
                                onClick={() => deletePreset(preset._id)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs md:text-sm"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Update Preset Dialog */}
            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Preset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editCropName">Crop Name</Label>
                    <Input
                      id="editCropName"
                      value={editForm.crop_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, crop_name: e.target.value }))}
                      placeholder="Enter crop name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editTemperature">Temperature (°C)</Label>
                    <Input
                      id="editTemperature"
                      type="number"
                      value={editForm.temperature}
                      onChange={(e) => setEditForm(prev => ({ ...prev, temperature: e.target.value }))}
                      placeholder="Enter temperature"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editHumidity">Humidity (%)</Label>
                    <Input
                      id="editHumidity"
                      type="number"
                      value={editForm.humidity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, humidity: e.target.value }))}
                      placeholder="Enter humidity"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowUpdateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={savePresetUpdate}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <AdminFooterCopyright />
        </div>
    </AdminSidebarLayout>
  );
}
