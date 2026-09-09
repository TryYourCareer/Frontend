import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginWithOAuth, setAuthToken } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenState, setUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const errorParam = params.get("error_description") || params.get("error");
    if (errorParam) {
      setError(errorParam);
      return;
    }

    // Try to read an OAuth "code" or token from either query string or URL hash.
    let code = params.get("code");
    let token = params.get("access_token") || params.get("token");

    if (!code && !token) {
      const hash = window.location.hash || "";
      if (hash) {
        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
        code = hashParams.get("code");
        token = hashParams.get("access_token") || hashParams.get("token");
        const hashError = hashParams.get("error_description") || hashParams.get("error");
        if (hashError) {
          setError(hashError);
          return;
        }
      }
    }

    if (!code && !token) {
      setError("Missing OAuth code.");
      return;
    }

    // If access token was provided directly, use it
    if (token) {
      setAuthToken(token);
      setTokenState(token);
      navigate("/dashboard", { replace: true });
      return;
    }

    // Otherwise exchange the authorization code for a session/token.
    loginWithOAuth(code)
      .then((result) => {
        setAuthToken(result.token || "");
        setTokenState(result.token || "");
        setUser(result.user || null);
        // AuthContext restore() will fetch profile & isRegistered automatically.
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => setError(err.message || "OAuth login failed."));
  }, [navigate, params, setTokenState, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] grid place-items-center">
      {error ? (
        <div className="text-center space-y-3">
          <p className="text-sm font-bold text-red-600">{error}</p>
          <button onClick={() => navigate("/login", { replace: true })} className="text-xs text-slate-500 underline">Back to login</button>
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