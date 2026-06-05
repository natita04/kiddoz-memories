"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthMode, type AuthMode } from "@/lib/auth";

interface AuthContextValue {
  mode: AuthMode;
  isGuest: boolean;
  setMode: (mode: AuthMode) => void;
}

const AuthContext = createContext<AuthContextValue>({
  mode: null,
  isGuest: false,
  setMode: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AuthMode>(null);

  useEffect(() => {
    setMode(getAuthMode());
  }, []);

  return (
    <AuthContext.Provider value={{ mode, isGuest: mode === "guest", setMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
