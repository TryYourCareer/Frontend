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
    // Try to read an OAuth "code" from either the query string or the URL fragment/hash.
    let code = params.get("code");
    let tokenFromHash = null;

    if (!code) {
      const hash = window.location.hash || "";
      if (hash) {
        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
        code = hashParams.get("code");
        tokenFromHash = hashParams.get("access_token") || hashParams.get("token");
      }
    }

    if (!code && !tokenFromHash) {
      setError("Missing OAuth code.");
      return;
    }

    // If the provider returned an access token in the URL fragment, use it directly.
    if (tokenFromHash) {
      setAuthToken(tokenFromHash);
      setTokenState(tokenFromHash);
      // AuthContext restore() will fetch profile & isRegistered automatically.
      // Navigate to dashboard immediately — redirect to /register happens if needed.
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