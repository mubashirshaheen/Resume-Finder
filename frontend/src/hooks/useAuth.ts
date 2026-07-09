import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { me, logout as logoutToken } from "../api/auth";
import type { User } from "../lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useProvideAuth(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setUser(await me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return useMemo(
    () => ({
      user,
      loading,
      refresh,
      logout: () => {
        logoutToken();
        setUser(null);
      }
    }),
    [user, loading]
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthContext.Provider");
  }
  return context;
}
