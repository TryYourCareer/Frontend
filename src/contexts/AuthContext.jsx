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
  setSupabaseAuthSession,
} from "../services/auth";
import { setApiToken } from "../lib/api";
import { supabase } from "../supabaseConfig";

const AuthContext = createContext(null);

const TOKEN_KEY = "clearcareers_auth_token";
const REFRESH_TOKEN_KEY = "clearcareers_refresh_token";
const USER_KEY = "clearcareers_auth_user";
const PROFILE_KEY = "clearcareers_auth_profile";
const IS_REG_KEY = "clearcareers_is_registered";

function getStoredJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => getStoredJson(USER_KEY));
  const [profile, setProfile] = useState(() => getStoredJson(PROFILE_KEY));
  const [isRegistered, setIsRegistered] = useState(() => localStorage.getItem(IS_REG_KEY) === "true");

  // If token and profile are already cached in localStorage, start with loading=false for 0ms latency
  const [loading, setLoading] = useState(() => {
    const cachedToken = localStorage.getItem(TOKEN_KEY);
    const cachedProfile = getStoredJson(PROFILE_KEY);
    return Boolean(cachedToken && !cachedProfile);
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Sync token to auth headers and storage
  useEffect(() => {
    setAuthToken(token);
    setApiToken(token);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  // Sync user, profile, isRegistered to storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(IS_REG_KEY, isRegistered ? "true" : "false");
  }, [isRegistered]);

  // Unified synchronous auth completion helper
  const handleAuthSuccess = useCallback(({ token: newToken, refreshToken: newRefreshToken, user: newUser, profile: newProfile, isRegistered: newIsRegistered }) => {
    if (newToken) {
      setTokenState(newToken);
      setAuthToken(newToken);
      setApiToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
    }
    if (newRefreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    }
    if (newUser !== undefined) {
      setUser(newUser);
      if (newUser) localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      else localStorage.removeItem(USER_KEY);
    }
    if (newProfile !== undefined) {
      setProfile(newProfile);
      if (newProfile) localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      else localStorage.removeItem(PROFILE_KEY);
    }
    if (newIsRegistered !== undefined) {
      const reg = Boolean(newIsRegistered);
      setIsRegistered(reg);
      localStorage.setItem(IS_REG_KEY, reg ? "true" : "false");
    }
    setLoading(false);
  }, []);

  // Listen to Supabase token refresh and auth events to automatically keep tokens fresh
  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        const freshToken = session.access_token;
        setTokenState(freshToken);
        setAuthToken(freshToken);
        setApiToken(freshToken);
        localStorage.setItem(TOKEN_KEY, freshToken);
        if (session.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
        }
        if (session.user) {
          setUser((prev) => prev || session.user);
        }
      } else if (event === "SIGNED_OUT") {
        setTokenState("");
        setUser(null);
        setProfile(null);
        setIsRegistered(false);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(IS_REG_KEY);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithPhone = useCallback(async ({ phone, otp }) => {
    setAuthLoading(true);
    try {
      const result = await loginWithOtp({ phone, otp });
      const newToken = result.token || "";
      const newRefreshToken = result.refreshToken || "";
      const baseUser = result.user || null;
      const baseIsReg = Boolean(result.isRegistered);

      if (newToken && newRefreshToken) {
        await setSupabaseAuthSession(newToken, newRefreshToken);
      }

      handleAuthSuccess({
        token: newToken,
        refreshToken: newRefreshToken,
        user: baseUser,
        profile: baseUser,
        isRegistered: baseIsReg,
      });

      // Quick background fetch to refresh full DB profile
      fetchCurrentUser()
        .then((prof) => {
          if (prof?.user) {
            handleAuthSuccess({
              token: newToken,
              user: prof.user,
              profile: prof.user,
              isRegistered: prof.isRegistered,
            });
          }
        })
        .catch(() => {});

      return result;
    } finally {
      setAuthLoading(false);
    }
  }, [handleAuthSuccess]);

  const loginWithGoogle = useCallback(async (code) => {
    setAuthLoading(true);
    try {
      const result = await loginWithOAuth(code);
      const newToken = result.token || "";
      const newRefreshToken = result.refreshToken || "";
      handleAuthSuccess({
        token: newToken,
        refreshToken: newRefreshToken,
        user: result.user || null,
      });
      return result;
    } finally {
      setAuthLoading(false);
    }
  }, [handleAuthSuccess]);

  const completeRegistration = useCallback(async (payload) => {
    setAuthLoading(true);
    try {
      const result = await registerProfile(payload);
      handleAuthSuccess({
        user: result || null,
        profile: result || null,
        isRegistered: true,
      });
      return result;
    } finally {
      setAuthLoading(false);
    }
  }, [handleAuthSuccess]);

  const saveProfile = useCallback(async (userId, payload) => {
    setAuthLoading(true);
    try {
      const result = await updateCurrentUser(userId, payload);
      handleAuthSuccess({
        profile: result || null,
        user: result || null,
      });
      return result;
    } finally {
      setAuthLoading(false);
    }
  }, [handleAuthSuccess]);

  const logout = useCallback(async (shouldNavigate = true) => {
    try {
      await supabaseSignOut();
    } catch { /* ignore */ }
    setTokenState("");
    setUser(null);
    setProfile(null);
    setIsRegistered(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(IS_REG_KEY);
    if (shouldNavigate) navigate("/", { replace: true });
  }, [navigate]);

  // Background restore / revalidation (stale-while-revalidate)
  useEffect(() => {
    let mounted = true;

    async function restore() {
      try {
        let activeToken = token || localStorage.getItem(TOKEN_KEY) || "";

        // Check Supabase session for valid / auto-refreshed session
        const session = await getSupabaseSession();
        if (session?.access_token) {
          activeToken = session.access_token;
          if (mounted) {
            setTokenState(activeToken);
            if (session.user) setUser((prev) => prev || session.user);
          }
        }

        if (!activeToken) {
          if (mounted) setLoading(false);
          return;
        }

        setAuthToken(activeToken);
        setApiToken(activeToken);

        // Fetch current profile from backend
        const profileData = await fetchCurrentUser();
        if (!mounted) return;

        const resolvedUser = profileData?.user || null;
        const resolvedIsReg = Boolean(profileData?.isRegistered);

        setProfile(resolvedUser);
        if (resolvedUser) setUser(resolvedUser);
        setIsRegistered(resolvedIsReg);

        localStorage.setItem(IS_REG_KEY, resolvedIsReg ? "true" : "false");
        if (resolvedUser) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(resolvedUser));
          localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
        }
      } catch (err) {
        if (!mounted) return;
        // Only logout on failure if there is no valid cached profile
        const cached = getStoredJson(PROFILE_KEY);
        if (!cached) {
          logout(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restore();

    return () => {
      mounted = false;
    };
  }, [logout]); // eslint-disable-line react-hooks/exhaustive-deps

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
      handleAuthSuccess,
      isLoginOpen,
      setIsLoginOpen,
    }),
    [
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
      isLoginOpen,
      handleAuthSuccess,
    ]
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
