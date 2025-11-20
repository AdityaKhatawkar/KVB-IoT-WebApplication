"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
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
  Download,
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

import { Firmware, FirmwareUploadData } from "@/types/admin";

export default function FirmwareManagementPage() {
  const router = useRouter();
  const [firmwareList, setFirmwareList] = useState<Firmware[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [firmwareVersion, setFirmwareVersion] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch firmware list
  const fetchFirmware = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockFirmware: Firmware[] = [
        {
          _id: "1",
          device: "Solar Tunnel Dryer",
          version: "v2.1.0",
          filename: "dryer_v2.1.0.bin",
          uploadedAt: "2024-01-15",
          fileSize: "2.4 MB"
        },
        {
          _id: "2",
          device: "Scheffler Dish",
          version: "v1.8.5",
          filename: "scheffler_v1.8.5.bin",
          uploadedAt: "2024-01-10",
          fileSize: "1.8 MB"
        },
        {
          _id: "3",
          device: "Parabolic Cooker",
          version: "v3.2.1",
          filename: "cooker_v3.2.1.bin",
          uploadedAt: "2024-01-05",
          fileSize: "3.1 MB"
        }
      ];
      setFirmwareList(mockFirmware);
    } catch (err: any) {
      console.error("Fetch firmware error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload new firmware
  const uploadFirmware = async () => {
    if (!firmwareVersion.trim() || !deviceName.trim() || !firmwareFile) {
      alert("Please fill all fields and select a firmware file.");
      return;
    }

    try {
      setUploadLoading(true);

      // Mock API call - replace with actual API
      const newFirmware: Firmware = {
        _id: Date.now().toString(),
        device: deviceName,
        version: firmwareVersion,
        filename: firmwareFile.name,
        uploadedAt: new Date().toISOString().split('T')[0],
        fileSize: `${(firmwareFile.size / (1024 * 1024)).toFixed(1)} MB`
      };

      setFirmwareList(prev => [...prev, newFirmware]);

      // Reset form
      setFirmwareVersion("");
      setDeviceName("");
      setFirmwareFile(null);
      setShowUploadDialog(false);

      alert("Firmware uploaded successfully!");
    } catch (err) {
      alert("Error uploading firmware");
    } finally {
      setUploadLoading(false);
    }
  };

  // Download firmware file
  const downloadFirmware = (firmware: Firmware) => {
    // Mock download - replace with actual file download
    alert(`Downloading firmware: ${firmware.filename}`);
  };

  useEffect(() => {
    fetchFirmware();
  }, []);

  return (
    <AdminSidebarLayout>
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
          <div className="flex-1 w-full px-4 sm:px-6 md:px-8 pb-24">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-green-900 mb-6 md:mb-8">
              Firmware Management
            </h1>

            {/* Upload Firmware Button */}
            <div className="mb-6 flex flex-col sm:flex-row justify-end gap-2">
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2 w-full sm:w-auto">
                    <Upload className="w-4 h-4" />
                    Upload New Firmware
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Firmware</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firmwareVersion">Firmware Version</Label>
                      <Input
                        id="firmwareVersion"
                        value={firmwareVersion}
                        onChange={(e) => setFirmwareVersion(e.target.value)}
                        placeholder="e.g., v1.0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deviceName">Device Name</Label>
                      <Input
                        id="deviceName"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="e.g., Solar Tunnel Dryer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firmwareFile">Firmware File</Label>
                      <Input
                        id="firmwareFile"
                        type="file"
                        accept=".bin,.hex,.zip"
                        onChange={(e) => setFirmwareFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowUploadDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={uploadFirmware}
                        disabled={uploadLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {uploadLoading ? "Uploading..." : "Upload Firmware"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Firmware Table */}
            <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50">
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Device</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Version</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">File (Download)</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Uploaded At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : firmwareList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No firmware found
                        </TableCell>
                      </TableRow>
                    ) : (
                      firmwareList.map((firmware) => (
                        <TableRow key={firmware._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-xs md:text-sm">{firmware.device}</TableCell>
                          <TableCell className="text-xs md:text-sm">{firmware.version}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => downloadFirmware(firmware)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-xs md:text-sm"
                            >
                              <Download className="w-3 h-3" />
                              {firmware.filename}
                            </Button>
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">{firmware.uploadedAt}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
          <AdminFooterCopyright />
        </div>
    </AdminSidebarLayout>
  );
}
