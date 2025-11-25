import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // keeps cookies/auth
});

export default api;
