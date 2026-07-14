import BACKEND_BASE_URL from "../API/BaseURL";
import { supabase } from "../supabaseConfig";

let authToken = localStorage.getItem("clearcareers_auth_token") || "";

export function setAuthToken(token) {
  authToken = token || "";
}

function authHeaders(extra = {}) {
  return {
    ...extra,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
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
    body: JSON.stringify({ phone }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

export async function verifyOtp(phone, otp) {
  const response = await fetch(`${BACKEND_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

export async function loginWithOtp({ phone, otp }) {
  const response = await fetch(`${BACKEND_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

export async function loginWithOAuth(code) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw new Error(error.message);
  return {
    token: data.session?.access_token || "",
    user: data.user || data.session?.user || null,
    isRegistered: false,
  };
}

export async function registerProfile(payload) {
  const response = await fetch(`${BACKEND_BASE_URL}/user/register`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

export async function fetchCurrentUser() {
  const response = await fetch(`${BACKEND_BASE_URL}/user/profile`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

export async function getSupabaseSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data?.session || null;
}

export async function supabaseSignOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function updateCurrentUser(userId, payload) {
  const response = await fetch(`${BACKEND_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
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
