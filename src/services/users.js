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

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
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

export async function updateUser(userId, payload) {
  if (!userId) {
    throw new Error("Missing user id for profile update.");
  }

  const candidates = [
    `${API_BASE_URL}/users/${userId}`,
    `${API_BASE_URL}/users/update/${userId}`,
    `${API_BASE_URL}/users/profile/${userId}`,
  ];

  let lastError = null;

  for (const url of candidates) {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return parseJsonResponse(response);
    }

    lastError = await parseApiError(response);
  }

  throw new Error(lastError || "Unable to update profile.");
}

export async function getUserProfile(userId) {
  if (!userId) {
    throw new Error("Missing user id for profile lookup.");
  }

  const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}
