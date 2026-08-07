/**
 * Authenticated API wrapper for FastAPI backend calls.
 *
 * Reads the current Supabase session JWT and attaches it as
 * `Authorization: Bearer <token>` on every request.
 *
 * Usage:
 *   import api from "../lib/api";
 *   const careers = await api.get("/api/careers");
 *   const msg = await api.post("/api/communities/{id}/messages", { content: "Hello!" });
 */

import BACKEND_BASE_URL from "../API/BaseURL";

const BASE_URL = (process.env.REACT_APP_API_URL || BACKEND_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

// Token store — updated by the AuthContext via setApiToken()
let _token = "";

/**
 * Call this whenever the auth token changes (login, logout, refresh).
 * The AuthContext already does this via setAuthToken().
 */
export function setApiToken(token) {
  _token = token || "";
}

/**
 * Core fetch wrapper. Automatically injects the Bearer token and
 * parses JSON responses. Throws on non-2xx status codes.
 */
async function request(method, path, body) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Try to get the token from localStorage as a fallback
  const token = _token || localStorage.getItem("clearcareers_auth_token") || "";
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init = {
    method,
    headers,
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, init);

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || JSON.stringify(err);
    } catch {
      // ignore JSON parse errors
    }
    const error = new Error(detail);
    error.status = res.status;
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

const api = {
  get:    (path)        => request("GET",    path),
  post:   (path, body)  => request("POST",   path, body),
  patch:  (path, body)  => request("PATCH",  path, body),
  delete: (path)        => request("DELETE", path),
  upload: async (path, formData) => {
    const headers = {};
    const token = _token || localStorage.getItem("clearcareers_auth_token") || "";
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        detail = err.detail || JSON.stringify(err);
      } catch {
        // ignore JSON parse errors
      }
      const error = new Error(detail);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },
};

export default api;
