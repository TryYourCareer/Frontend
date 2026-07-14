import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCurrentUser,
  getSupabaseSession,
  loginWithOAuth,
  loginWithOtp,
  registerProfile,
  updateCurrentUser,
  setAuthToken,
  supabaseSignOut,
} from "../services/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "clearcareers_auth_token";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const loginWithPhone = async ({ phone, otp }) => {
    setAuthLoading(true);
    try {
      const result = await loginWithOtp({ phone, otp });
      setTokenState(result.token || "");
      setUser(result.user || null);
      setIsRegistered(Boolean(result.isRegistered));
      return result;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGoogle = async (code) => {
    setAuthLoading(true);
    try {
      const result = await loginWithOAuth(code);
      setTokenState(result.token || "");
      setUser(result.user || null);
      setIsRegistered(Boolean(result.isRegistered));
      return result;
    } finally {
      setAuthLoading(false);
    }
  };

  const completeRegistration = async (payload) => {
    setAuthLoading(true);
    try {
      const result = await registerProfile(payload);
      setUser(result.user || null);
      setProfile(result.user || null);
      setIsRegistered(true);
      return result;
    } finally {
      setAuthLoading(false);
    }
  };

  const saveProfile = async (userId, payload) => {
    setAuthLoading(true);
    try {
      const result = await updateCurrentUser(userId, payload);
      setProfile(result || null);
      setUser(result || null);
      return result;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = useCallback(async (shouldNavigate = true) => {
    try {
      await supabaseSignOut();
    } catch { /* ignore */ }
    setTokenState("");
    setUser(null);
    setProfile(null);
    setIsRegistered(false);
    if (shouldNavigate) navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;

    async function restore() {
      try {
        const session = await getSupabaseSession();
        const sessionToken = session?.access_token || "";
        const nextToken = sessionToken || token;

        if (!nextToken) {
          if (mounted) setLoading(false);
          return;
        }

        if (sessionToken && sessionToken !== token) {
          setTokenState(sessionToken);
        }

        setAuthToken(nextToken);
        if (session?.user) {
          setUser(session.user);
        }
        const profile = await fetchCurrentUser();
        if (!mounted) return;
        setProfile(profile?.user || null);
        setUser(profile?.user || session?.user || null);
        setIsRegistered(Boolean(profile?.isRegistered));
      } catch {
        if (!mounted) return;
        logout(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restore();

    return () => {
      mounted = false;
    };
  }, [token, logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      isRegistered,
      loading,
      authLoading,
      loginWithPhone,
      loginWithGoogle,
      completeRegistration,
      saveProfile,
      logout,
      setTokenState,
      setUser,
      setIsRegistered,
    }),
    [token, user, profile, isRegistered, loading, authLoading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
