import { supabase } from "../supabaseConfig";

export async function sendOtp(phone) {
  const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function verifyOtp(phone, token) {
  const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: "sms",
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
