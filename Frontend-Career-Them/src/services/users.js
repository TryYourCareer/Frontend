import { fetchCurrentUser, registerProfile, updateCurrentUser } from "./auth";

export async function registerUser(payload) {
  return registerProfile(payload);
}

export async function updateUser(userId, payload) {
  return updateCurrentUser(userId, payload);
}

export async function getUserProfile() {
  const response = await fetchCurrentUser();
  return response?.user || null;
}
