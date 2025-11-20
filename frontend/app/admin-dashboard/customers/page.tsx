"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AdminFooterCopyright } from "@/components/footer";
import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  BookUser,
  Settings2,
  Package,
  Cpu,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { User } from "@/types/admin";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";

export default function CustomersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch users
  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (err: any) {
      console.error("Fetch users error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return fetchUsers();
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/search?query=${encodeURIComponent(
          search
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin-dashboard"
    },
    {
      icon: BookUser,
      label: "Customers",
      path: "/admin-dashboard/customers"
    },
    {
      icon: Settings2,
      label: "Manage Presets",
      path: "/admin-dashboard/presets"
    },
    {
      icon: Cpu,
      label: "Firmware",
      path: "/admin-dashboard/firmware"
    }
  ];

  const handleManageDevices = (user: User) => {
    router.push(`/admin-dashboard/customers/${user._id}/devices`);
  };

  return (
    <AdminSidebarLayout>
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
          <div className="flex-1 w-full px-4 sm:px-6 md:px-8 pb-24">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-green-900 mb-6 md:mb-8">
              Customers
            </h1>

            {/* Search Bar */}
            <div className="mb-6 flex flex-col sm:flex-row justify-center gap-2">
              <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button type="submit" className="bg-green-600 hover:bg-green-700 px-3 md:px-4 py-2 text-sm md:text-base">
                  Search
                </Button>
              </form>
            </div>

            {/* Users Table */}
            <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50">
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Name</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Email</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Contact No.</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">State</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">City</TableHead>
                      <TableHead className="text-green-900 font-semibold text-xs md:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-xs md:text-sm">{user.name}</TableCell>
                          <TableCell className="text-xs md:text-sm">{user.email}</TableCell>
                          <TableCell className="text-xs md:text-sm">{user.phone}</TableCell>
                          <TableCell className="text-xs md:text-sm">{user.state}</TableCell>
                          <TableCell className="text-xs md:text-sm">{user.city}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleManageDevices(user)}
                              className="bg-green-600 hover:bg-green-700 text-xs md:text-sm px-2 md:px-3 py-1"
                            >
                              Manage Devices
                            </Button>
                          </TableCell>
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
