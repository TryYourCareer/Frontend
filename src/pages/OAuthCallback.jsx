import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { fetchCurrentUser, loginWithOAuth, setAuthToken } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenState, setUser, setIsRegistered } = useAuth();
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
      const finishWithToken = async () => {
        try {
          setAuthToken(tokenFromHash);
          setTokenState(tokenFromHash);
          const profile = await fetchCurrentUser();
          const registered = Boolean(profile?.isRegistered);
          setIsRegistered(registered);
          setUser(profile?.user || null);
          navigate(registered ? "/profile" : "/register", { replace: true });
        } catch (err) {
          setError(err.message || "OAuth login failed.");
        }
      };
      finishWithToken();
      return;
    }

    // Otherwise exchange the authorization code for a session/token.
    loginWithOAuth(code)
      .then(async (result) => {
        setAuthToken(result.token || "");
        setTokenState(result.token || "");
        setUser(result.user || null);
        const profile = await fetchCurrentUser();
        const registered = Boolean(profile?.isRegistered);
        setIsRegistered(registered);
        setUser(profile?.user || result.user || null);
        navigate(registered ? "/profile" : "/register", { replace: true });
      })
      .catch((err) => setError(err.message || "OAuth login failed."));
  }, [navigate, params, setIsRegistered, setTokenState, setUser]);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
      {error ? <p className="text-red-300">{error}</p> : <Loader2 className="animate-spin" size={28} />}
    </div>
  );
}
