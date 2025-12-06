export interface User {
  _id: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  devices: string[];
  device_status?: string;
}

export interface Device {
  _id: string;
  name: string;
  status: 'online' | 'offline';
  user_id: string;
}

export interface Preset {
  _id: string;
  name: string;
  temperature: number;
  humidity: number;
  createdAt: string;
}

export interface Firmware {
  _id: string;
  device: string;
  version: string;
  filename: string;
  uploadedAt: string;
  fileSize: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
}

export interface PresetUploadData {
  name: string;
  temperature: number;
  humidity: number;
}

export interface FirmwareUploadData {
  version: string;
  device: string;
  file: File;
}
