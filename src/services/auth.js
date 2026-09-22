import BACKEND_BASE_URL from "../API/BaseURL";
import { supabase } from "../supabaseConfig";

const TOKEN_KEY = "clearcareers_auth_token";
const REFRESH_TOKEN_KEY = "clearcareers_refresh_token";

let authToken = localStorage.getItem(TOKEN_KEY) || "";

export function setAuthToken(token) {
  authToken = token || "";
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken() {
  return authToken || localStorage.getItem(TOKEN_KEY) || "";
}

function authHeaders(extra = {}) {
  const currentToken = getAuthToken();
  return {
    ...extra,
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
  };
}

export async function setSupabaseAuthSession(accessToken, refreshToken) {
  if (!supabase || !accessToken) return null;
  try {
    if (refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (!error && data?.session?.access_token) {
        setAuthToken(data.session.access_token);
        if (data.session.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.session.refresh_token);
        }
        return data.session;
      }
    }
  } catch (err) {
    console.warn("Failed to set Supabase session:", err);
  }
  return null;
}

export async function refreshSupabaseSession() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data?.session?.access_token) {
      setAuthToken(data.session.access_token);
      if (data.session.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.session.refresh_token);
      }
      return data.session;
    }
  } catch (err) {
    console.warn("Failed to refresh Supabase session:", err);
  }
  return null;
}

async function parseApiError(response) {
  try {
    const data = await response.json();
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item) => item?.msg || item?.message)
        .filter(Boolean)
        .join(" ");
    }
    return data?.detail || data?.message || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export async function sendOtp(phone) {
  const response = await fetch(`${BACKEND_BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

export async function verifyOtp(phone, otp) {
  const response = await fetch(`${BACKEND_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone, otp }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = await response.json();
  if (data.token) {
    setAuthToken(data.token);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      await setSupabaseAuthSession(data.token, data.refreshToken);
    }
  }
  return data;
}

export async function loginWithOtp({ phone, otp }) {
  return verifyOtp(phone, otp);
}

export async function loginWithOAuth(code) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw new Error(error.message);
  if (data?.session?.access_token) {
    setAuthToken(data.session.access_token);
    if (data.session.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.session.refresh_token);
    }
  }
  return {
    token: data.session?.access_token || "",
    refreshToken: data.session?.refresh_token || "",
    user: data.user || data.session?.user || null,
  };
}

export async function registerProfile(payload) {
  let response = await fetch(`${BACKEND_BASE_URL}/user/register`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (response.status === 401 && supabase) {
    const refreshed = await refreshSupabaseSession();
    if (refreshed?.access_token) {
      response = await fetch(`${BACKEND_BASE_URL}/user/register`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(payload),
      });
    }
  }

  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

export async function fetchCurrentUser() {
  let response = await fetch(`${BACKEND_BASE_URL}/user/profile`, {
    headers: authHeaders(),
    credentials: "include",
  });

  if (response.status === 401 && supabase) {
    const refreshed = await refreshSupabaseSession();
    if (refreshed?.access_token) {
      response = await fetch(`${BACKEND_BASE_URL}/user/profile`, {
        headers: authHeaders(),
        credentials: "include",
      });
    }
  }

  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

export async function getSupabaseSession() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data?.session || null;
  } catch {
    return null;
  }
}

export async function supabaseSignOut() {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  try {
    await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore
  }
  setAuthToken("");
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function updateCurrentUser(userId, payload) {
  let response = await fetch(`${BACKEND_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (response.status === 401 && supabase) {
    const refreshed = await refreshSupabaseSession();
    if (refreshed?.access_token) {
      response = await fetch(`${BACKEND_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(payload),
      });
    }
  }

  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

export async function loginRedirect(provider) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const redirectTo = `${window.location.origin}/oauth/callback`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) throw new Error(error.message);
  if (data?.url) {
    window.location.href = data.url;
  }
}
