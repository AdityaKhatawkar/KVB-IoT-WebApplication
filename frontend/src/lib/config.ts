const isRailway = typeof window !== "undefined" && window.location.hostname.includes("railway");

export const API_BASE_URL = isRailway
  ? "https://kvbproject-production.up.railway.app"
  : "http://localhost:5000";
