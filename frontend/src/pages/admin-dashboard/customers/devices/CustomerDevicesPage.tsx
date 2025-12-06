"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ArrowLeft, Plus, Trash2, Settings2 } from "lucide-react";

import { User } from "@/types/admin";

// =============================
// COMPONENT
// =============================
export default function ManageDevicesPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { toast } = useToast();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // --------------------------
  // STATE
  // --------------------------
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<string[]>([]);
  const [deviceMeta, setDeviceMeta] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Add device
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");

  // Firmware
  const [showFirmwareDialog, setShowFirmwareDialog] = useState(false);
  const [selectedDeviceForFirmware, setSelectedDeviceForFirmware] = useState("");
  const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
  const [firmwareVersion, setFirmwareVersion] = useState("");

  // Delete device
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState("");

  // Preset access dialog
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetList, setPresetList] = useState<any[]>([]);
  const [presetDays, setPresetDays] = useState(30);

  // ===========================
  // Fetch metadata for devices
  // ===========================
  const fetchDeviceMetadata = async (deviceList: string[]) => {
    if (!token || !deviceList.length) return;

    try {
      const names = deviceList.join(",");
      const res = await axios.get(
        `http://localhost:5000/api/devices/metadata?deviceNames=${encodeURIComponent(
          names
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data || {};
      const next: Record<string, any> = {};

      deviceList.forEach((deviceId) => {
        const m = data[deviceId];
        next[deviceId] = m
          ? {
              active: m.active,
              subscriptionStart: m.subscriptionStart
                ? new Date(m.subscriptionStart).toISOString()
                : undefined,
              subscriptionEnd: m.subscriptionEnd
                ? new Date(m.subscriptionEnd).toISOString()
                : undefined,
              daysRemaining: m.daysRemaining ?? undefined,
              lastActive: m.lastActive
                ? new Date(m.lastActive).toISOString()
                : undefined,
            }
          : { active: true };
      });

      setDeviceMeta(next);
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }
  };

  // ===========================
  // Fetch user + devices
  // ===========================
  const fetchUserAndDevices = async () => {
    if (!token || !userId) return;

    try {
      setLoading(true);

      const userRes = await axios.get(
        `http://localhost:5000/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const foundUser = userRes.data;
      setUser(foundUser);

      const list: string[] = foundUser.devices || [];
      setDevices(list);

      await fetchDeviceMetadata(list);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndDevices();
  }, [userId, token]);

  // --------------------------
  // Date Formatter
  // --------------------------
  const formatDisplayDate = (iso?: string) => {
    if (!iso) return "N/A";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString();
  };

  // --------------------------
  // Toggle Active Status
  // --------------------------
  const handleToggleActive = async (deviceId: string, value: boolean) => {
    setDeviceMeta((prev) => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], active: value },
    }));

    try {
      await axios.patch(
        `http://localhost:5000/api/devices/metadata/${deviceId}`,
        { active: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Status updated" });
    } catch {
      toast({ variant: "destructive", title: "Failed to update status" });
    }
  };

  // --------------------------
  // Update subscription dates
  // --------------------------
  const updateEndFromDays = async (deviceId: string) => {
    const current = deviceMeta[deviceId] || {};
    const days = current.daysRemaining ?? 0;

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + days);

    setDeviceMeta((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        subscriptionStart: now.toISOString(),
        subscriptionEnd: end.toISOString(),
        daysRemaining: days,
      },
    }));

    try {
      await axios.patch(
        `http://localhost:5000/api/devices/metadata/${deviceId}`,
        {
          subscriptionStart: now.toISOString(),
          subscriptionEnd: end.toISOString(),
          daysRemaining: days,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Subscription updated" });
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to update subscription",
      });
    }
  };

  // --------------------------
  // Add Device
  // --------------------------
  const addDevice = async () => {
    if (!newDeviceName.trim() || !user) return;

    try {
      await axios.post(
        "http://localhost:5000/api/users/device/add",
        { phone: user.phone, device: newDeviceName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Device added",
        description: `Assigned ${newDeviceName} to ${user.name}`,
      });

      setShowAddDialog(false);
      setNewDeviceName("");

      fetchUserAndDevices();
    } catch {
      toast({ variant: "destructive", title: "Failed to add device" });
    }
  };

  // --------------------------
  // Delete device (confirmation)
  // --------------------------
  const confirmDeleteDevice = async () => {
    if (!user || !deviceToDelete) return;

    try {
      await axios.post(
        "http://localhost:5000/api/users/device/remove",
        { phone: user.phone, device: deviceToDelete },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Device removed",
        description: `Removed ${deviceToDelete} from ${user.name}`,
      });

      setShowDeleteDialog(false);
      fetchUserAndDevices();
    } catch {
      toast({ variant: "destructive", title: "Failed to delete device" });
    }
  };

  // --------------------------
  // Upload Firmware
  // --------------------------
  const handleFirmwareUpload = async () => {
    if (!firmwareFile || !firmwareVersion) {
      toast({ variant: "destructive", title: "Missing Fields" });
      return;
    }

    const formData = new FormData();
    formData.append("firmware", firmwareFile);
    formData.append("version", firmwareVersion);

    try {
      await axios.post(
        `http://localhost:5000/api/firmware/upload/${selectedDeviceForFirmware}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({ title: "Firmware uploaded" });

      setShowFirmwareDialog(false);
      setFirmwareFile(null);
      setFirmwareVersion("");
    } catch {
      toast({ variant: "destructive", title: "Upload failed" });
    }
  };

  // ===========================
  // PRESET ACCESS MANAGEMENT
  // ===========================
  const fetchPresetList = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/${userId}/presets`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPresetList(res.data);
    } catch (err) {
      console.error("Preset load error:", err);
    }
  };

  const assignPreset = async (presetId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/users/${userId}/presets/assign`,
        { presetId, days: presetDays },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Preset assigned" });
      fetchPresetList();
    } catch {
      toast({ variant: "destructive", title: "Error assigning preset" });
    }
  };

  const removePreset = async (presetId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/users/${userId}/presets/remove`,
        { presetId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Preset removed" });
      fetchPresetList();
    } catch {
      toast({ variant: "destructive", title: "Error removing preset" });
    }
  };

  if (loading) return <div>Loading...</div>;

  // ===========================
  // RENDER UI
  // ===========================
  return (
    <AdminSidebarLayout>
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50 p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 mt-10 md:mt-0">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <h1 className="text-2xl font-bold">Manage Devices for {user?.name}</h1>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">
            {/* PRESET ACCESS */}
            <Button
              variant="outline"
              onClick={() => {
                setShowPresetDialog(true);
                fetchPresetList();
              }}
              className="flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              Manage Preset Access
            </Button>

            {/* ADD DEVICE */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Device
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Device</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <Label>Device ID</Label>
                  <Input
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="Enter device ID"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>

                  <Button onClick={addDevice} disabled={!newDeviceName.trim()}>
                    Add
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* TABLE */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription Start</TableHead>
                  <TableHead>Subscription End</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {devices.map((deviceId) => (
                  <TableRow key={deviceId}>
                    <TableCell>{deviceId}</TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!deviceMeta[deviceId]?.active}
                          onCheckedChange={(v) => handleToggleActive(deviceId, v)}
                        />
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            deviceMeta[deviceId]?.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {deviceMeta[deviceId]?.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>

                    {/* SUB START */}
                    <TableCell>
                      {formatDisplayDate(deviceMeta[deviceId]?.subscriptionStart)}
                    </TableCell>

                    {/* SUB END */}
                    <TableCell>
                      {formatDisplayDate(deviceMeta[deviceId]?.subscriptionEnd)}
                    </TableCell>

                    {/* DAYS */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-24 h-8"
                          value={deviceMeta[deviceId]?.daysRemaining ?? ""}
                          onChange={(e) =>
                            setDeviceMeta((prev) => ({
                              ...prev,
                              [deviceId]: {
                                ...prev[deviceId],
                                daysRemaining: Number(e.target.value),
                              },
                            }))
                          }
                        />

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateEndFromDays(deviceId)}
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>

                    {/* LAST ACTIVE */}
                    <TableCell>{formatDisplayDate(deviceMeta[deviceId]?.lastActive)}</TableCell>

                    {/* ACTIONS */}
                    <TableCell className="flex gap-2">

                      {/* VIEW DATA */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/admin-dashboard/customers/${userId}/devices/${deviceId}`
                          )
                        }
                      >
                        View Data
                      </Button>

                      {/* CONTROL DEVICE */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/admin-dashboard/customers/${userId}/devices/${deviceId}/control`
                          )
                        }
                      >
                        Control
                      </Button>

                      {/* UPLOAD FIRMWARE */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDeviceForFirmware(deviceId);
                          setShowFirmwareDialog(true);
                        }}
                      >
                        Upload Firmware
                      </Button>

                      {/* DELETE */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => {
                          setDeviceToDelete(deviceId);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* FIRMWARE MODAL */}
        <Dialog open={showFirmwareDialog} onOpenChange={setShowFirmwareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Upload Firmware for {selectedDeviceForFirmware}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Firmware (.bin)</Label>
                <Input
                  type="file"
                  accept=".bin"
                  onChange={(e) => setFirmwareFile(e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <Label>Version</Label>
                <Input
                  value={firmwareVersion}
                  onChange={(e) => setFirmwareVersion(e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFirmwareDialog(false)}>
                Cancel
              </Button>

              <Button onClick={handleFirmwareUpload}>Upload</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* PRESET ACCESS DIALOG */}
        <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Manage Preset Access for {user?.name}</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 p-2">

      {/* Assign days field (only for LOCKED presets) */}
      <div className="flex items-center gap-3">
        <Label>Assign Locked Preset For (Days)</Label>
        <Input
          type="number"
          value={presetDays}
          min={1}
          className="w-32"
          onChange={(e) => setPresetDays(Number(e.target.value))}
        />
      </div>

      {presetList.length === 0 && (
        <div className="py-6 text-center text-gray-500">
          No presets found.
        </div>
      )}

      {/* LOOP THROUGH PRESETS */}
      {presetList.map((entry) => {
        const { crop, assigned, expiresAt, free } = entry;
        const expired = expiresAt && new Date(expiresAt) < new Date();

        return (
          <div
            key={crop._id}
            className="flex justify-between items-center p-3 border rounded-lg"
          >
            <div>
              <div className="font-semibold flex items-center gap-2">
                {crop.crop_name}

                {crop.tier === "free" && (
                  <span className="text-xs bg-green-200 text-green-700 rounded px-2 py-0.5">
                    FREE
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {free ? (
                  <span className="text-green-600 font-medium">
                    Available (Free preset)
                  </span>
                ) : assigned ? (
                  expired ? (
                    <span className="text-red-500 font-medium">
                      Expired on {new Date(expiresAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      Assigned • Expires{" "}
                      {new Date(expiresAt).toLocaleDateString()}
                    </span>
                  )
                ) : (
                  <span className="text-gray-500">Not Assigned</span>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {crop.tier === "free" ? (
              <Button variant="secondary" disabled>
                Free Access
              </Button>
            ) : assigned ? (
              <Button variant="destructive" onClick={() => removePreset(crop._id)}>
                Remove
              </Button>
            ) : (
              <Button onClick={() => assignPreset(crop._id)}>Assign</Button>
            )}
          </div>
        );
      })}

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowPresetDialog(false)}>
          Close
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

        {/* DELETE CONFIRMATION */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Device</DialogTitle>
            </DialogHeader>

            <p>
              Are you sure you want to delete <b>{deviceToDelete}</b>?  
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteDevice}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AdminSidebarLayout>
  );
}
