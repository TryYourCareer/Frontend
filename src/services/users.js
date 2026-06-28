import BACKEND_BASE_URL from "../API/BaseURL";

const API_BASE_URL = BACKEND_BASE_URL;

async function parseApiError(response) {
  try {
    const data = await response.json();
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item) => item?.msg || item?.message)
        .filter(Boolean)
        .join(" ");
    }
    return data?.detail || data?.message || "Unable to complete registration.";
  } catch {
    return "Unable to complete registration.";
  }
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}
