"use client";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const params = useParams();
  const token = params?.token;

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!password) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/reset-password/${token}`,
        { password }
      );

      if (
        res.data.success ||
        res.data.message === "Password reset successful"
      ) {
        setSuccess("✅ Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(res.data.message || "Failed to reset password");
      }
    } catch (err: unknown) {
      // Normalize error handling for Axios and generic Errors
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data ?? err.message);
        setError(err.response?.data?.message || err.message || "Server error");
      } else if (err instanceof Error) {
        console.error(err.message);
        setError(err.message || "Server error");
      } else {
        console.error(err);
        setError("Server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <Card className="w-full max-w-md shadow-xl rounded-2xl p-8 bg-white">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Reset Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <p className="text-red-700 bg-red-100 p-3 rounded-md mb-4 text-center font-medium">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-700 bg-green-100 p-3 rounded-md mb-4 text-center font-medium">
              {success}
            </p>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Label
                  htmlFor="password"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none text-base"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all"
                disabled={loading}
              >
                {loading ? "Updating Password..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-green-600 font-semibold hover:underline cursor-pointer"
              >
                Login
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
