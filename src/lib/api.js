/**
 * Authenticated API wrapper for FastAPI backend calls.
 *
 * Reads the current Supabase session JWT and attaches it as
 * `Authorization: Bearer <token>` on every request.
 * Automatically attempts session refresh on 401 Unauthorized before failing.
 */

import BACKEND_BASE_URL from "../API/BaseURL";
import { supabase } from "../supabaseConfig";

const BASE_URL = BACKEND_BASE_URL;

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
 * Core fetch wrapper. Automatically injects the Bearer token,
 * retries once with refreshed token if 401 is encountered,
 * and parses JSON responses. Throws on non-2xx status codes.
 */
async function request(method, path, body, hasRetried = false) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Try to get the token from memory or localStorage
  const token = _token || localStorage.getItem("clearcareers_auth_token") || "";
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init = {
    method,
    headers,
    credentials: "include",
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, init);

  // If unauthorized and haven't retried yet, try refreshing the Supabase session
  if (res.status === 401 && !hasRetried && supabase) {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data?.session?.access_token) {
        const newToken = data.session.access_token;
        _token = newToken;
        localStorage.setItem("clearcareers_auth_token", newToken);
        if (data.session.refresh_token) {
          localStorage.setItem("clearcareers_refresh_token", data.session.refresh_token);
        }
        return await request(method, path, body, true);
      } else {
        // Refresh token is expired or session was revoked on server — clear dead tokens
        _token = "";
        localStorage.removeItem("clearcareers_auth_token");
        localStorage.removeItem("clearcareers_refresh_token");
      }
    } catch {
      _token = "";
      localStorage.removeItem("clearcareers_auth_token");
      localStorage.removeItem("clearcareers_refresh_token");
    }
  }

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
  put:    (path, body)  => request("PUT",    path, body),
  patch:  (path, body)  => request("PATCH",  path, body),
  delete: (path)        => request("DELETE", path),
  upload: async (path, formData, hasRetried = false) => {
    const headers = {};
    const token = _token || localStorage.getItem("clearcareers_auth_token") || "";
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    if (res.status === 401 && !hasRetried && supabase) {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (!error && data?.session?.access_token) {
          const newToken = data.session.access_token;
          _token = newToken;
          localStorage.setItem("clearcareers_auth_token", newToken);
          if (data.session.refresh_token) {
            localStorage.setItem("clearcareers_refresh_token", data.session.refresh_token);
          }
          return await api.upload(path, formData, true);
        }
      } catch {
        // ignore
      }
    }

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
