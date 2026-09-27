import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchCurrentUser, loginWithOAuth, setAuthToken, setSupabaseAuthSession, getAuthToken } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabaseConfig";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function processAuth() {
      const errorParam = params.get("error_description") || params.get("error");
      if (errorParam) {
        setError(errorParam);
        return;
      }

      // 1. Try to read an OAuth "code" or token from query string or URL hash.
      let code = params.get("code");
      let token = params.get("access_token") || params.get("token");
      let refreshToken = params.get("refresh_token") || "";

      if (!code && !token) {
        const hash = window.location.hash || "";
        if (hash && hash !== "#") {
          const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
          code = hashParams.get("code");
          token = hashParams.get("access_token") || hashParams.get("token");
          refreshToken = hashParams.get("refresh_token") || refreshToken;
          const hashError = hashParams.get("error_description") || hashParams.get("error");
          if (hashError) {
            setError(hashError);
            return;
          }
        }
      }

      // 2. If Supabase client already consumed the hash, retrieve session from Supabase
      let authUser = null;
      if (!code && !token && supabase) {
        for (let i = 0; i < 4; i++) {
          try {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.access_token) {
              token = data.session.access_token;
              refreshToken = data.session.refresh_token || refreshToken;
              authUser = data.session.user || null;
              break;
            }
          } catch {
            // continue polling
          }
          await new Promise((r) => setTimeout(r, 250));
        }
      }

      // 3. Fallback to existing stored token if Supabase onAuthStateChange already stored it
      if (!code && !token) {
        const storedToken = getAuthToken();
        if (storedToken) {
          token = storedToken;
        }
      }

      if (!code && !token) {
        setError("Missing OAuth code.");
        return;
      }

      try {
        let activeToken = token;

        if (!activeToken && code) {
          const result = await loginWithOAuth(code);
          activeToken = result.token || "";
          refreshToken = result.refreshToken || refreshToken;
          authUser = result.user || null;
        } else if (activeToken && refreshToken) {
          await setSupabaseAuthSession(activeToken, refreshToken);
        }

        if (!activeToken) {
          setError("Failed to retrieve authentication token.");
          return;
        }

        setAuthToken(activeToken);

        // Fetch user profile right now in the callback screen while spinner is already visible
        let profileData = null;
        try {
          profileData = await fetchCurrentUser();
        } catch {
          // If profile fetch fails, user metadata can still be used
        }

        if (!active) return;

        const resolvedUser = profileData?.user || authUser || null;
        const resolvedProfile = profileData?.user || null;
        const isRegistered = Boolean(profileData?.isRegistered);

        handleAuthSuccess({
          token: activeToken,
          user: resolvedUser,
          profile: resolvedProfile,
          isRegistered: isRegistered,
        });

        // If not registered yet, navigate to register, otherwise dashboard
        navigate(isRegistered ? "/dashboard" : "/registration", { replace: true });
      } catch (err) {
        if (!active) return;
        setError(err.message || "OAuth login failed.");
      }
    }

    processAuth();

    return () => {
      active = false;
    };
  }, [navigate, params, handleAuthSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] grid place-items-center">
      {error ? (
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-lg">!</div>
          <p className="text-sm font-semibold text-slate-700">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button onClick={() => navigate("/dashboard", { replace: true })} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all">Go to Dashboard</button>
            <button onClick={() => navigate("/", { replace: true })} className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">Back to Home</button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#1E88E5] border-t-transparent animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Signing you in...</p>
        </div>
      )}
    </div>
  );
}