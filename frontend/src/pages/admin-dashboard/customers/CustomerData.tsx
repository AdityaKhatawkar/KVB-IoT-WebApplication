"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AdminFooterCopyright } from "../../../components/footer";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  LayoutDashboard,
  BookUser,
  Settings2,
  Cpu,
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

import { User } from "@/types/admin";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function CustomersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (err: any) {
      console.error("Fetch users error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Search users
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return fetchUsers();
    try {
      const res = await axios.get(
        `${API_URL}/api/users/search?query=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleManageDevices = (user: User) => {
    navigate(`/admin-dashboard/customers/${user._id}/devices`);
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(`${API_URL}/api/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove user from UI instantly
      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));

      setShowDeleteModal(false);
    } catch (err) {
      console.error("Delete user error:", err);
    }
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
                        <TableCell className="flex gap-2">
                          <Button
                            onClick={() => handleManageDevices(user)}
                            className="bg-green-600 hover:bg-green-700 text-xs md:text-sm px-2 md:px-3 py-1"
                          >
                            Manage Devices
                          </Button>

                          <Button
  onClick={() => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }}
  variant="outline"
  size="sm"
  className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-300 text-xs md:text-sm"
>
  <Trash2 className="w-3 h-3" />
  Delete
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-2">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser?.name}</span>?  
              This will also remove all their devices.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black"
              >
                Cancel
              </Button>

              <Button
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebarLayout>
  );
}
