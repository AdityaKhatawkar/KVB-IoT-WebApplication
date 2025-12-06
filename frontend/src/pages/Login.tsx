import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/contexts/toast-context";

export default function LoginPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!identifier || !password) {
      showError("Validation Error", "All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        identifier,
        password,
      });

      const { token, user } = res.data;

      if (token && user) {
        Cookies.set("token", token, { expires: 1 / 24 });
        Cookies.set("role", user.role, { expires: 1 / 24 });
        Cookies.set("email", user.email || "", { expires: 1 / 24 });
        if (user.phone) Cookies.set("phone", user.phone, { expires: 1 / 24 });

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        window.dispatchEvent(new Event("authChanged"));

        showSuccess(
          "Login Successful!",
          `Welcome back${user.name ? `, ${user.name}` : ""}!`
        );

        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/user-dashboard");
          }
        }, 1000);
      } else {
        showError("Login Failed", "Invalid credentials. Please try again.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data || err.message);
        showError("Login Error", err.response?.data?.message || "Server error");
      } else if (err instanceof Error) {
        console.error(err.message);
        showError("Login Error", err.message);
      } else {
        console.error(err);
        showError("Login Error", "An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Log in to your account
        </h2>
        <p className="text-center text-gray-600 mb-4">
          KVB Green Energies
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email or Phone</label>
            <input
              type="text"
              placeholder="Enter email or phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-2 rounded-xl font-semibold transition-all ${
              loading
                ? "bg-green-500 text-white cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="mt-3 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-green-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-green-600 hover:underline font-medium"
          >
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}
