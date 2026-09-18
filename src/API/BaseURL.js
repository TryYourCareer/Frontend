// Automatically detect environment:
// When running locally in browser (localhost/127.0.0.1), use local backend (http://localhost:8000).
// In production (Vercel / domain), use production backend URL.
const isLocalhost =
  typeof window !== "undefined" &&
  Boolean(
    window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]"
  );

const BACKEND_BASE_URL = isLocalhost
  ? (process.env.REACT_APP_LOCAL_API_URL || "http://localhost:8000")
  : (process.env.REACT_APP_API_URL || "https://backend-9g1n.onrender.com");

export default BACKEND_BASE_URL;