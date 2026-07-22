/**
 * useAuth — thin convenience hook for the communities feature.
 *
 * Re-exports token, user, and loading from the global AuthContext so
 * community components don't need to import from a different path.
 */
import { useAuth as _useAuth } from "../contexts/AuthContext";

export function useAuth() {
  return _useAuth();
}

export default useAuth;
