// const isRailway = typeof window !== "undefined" && window.location.hostname.includes("railway");

// export const API_BASE_URL = isRailway
//   ? "https://kvbproject-production.up.railway.app"
//   : "http://localhost:5000";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
