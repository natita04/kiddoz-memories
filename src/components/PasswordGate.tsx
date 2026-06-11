"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authenticate, enterAsGuest } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface PasswordGateProps {
  onSuccess: () => void;
  onGuest: () => void;
  error?: string | null;
}

export function PasswordGate({
  onSuccess,
  onGuest,
  error: loadError,
}: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, dir } = useLanguage();
  const { setMode } = useAuth();

  const isHe = language === "he";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (authenticate(password)) {
      setMode("full");
      onSuccess();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPassword("");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#FBF6F0" }}
      dir={dir}
    >
      {/* Controls — fixed to top-right physically */}
      <div className="fixed top-4 right-4 flex items-center gap-2" dir="ltr">
        <button
          onClick={() => setLanguage(isHe ? "en" : "he")}
          className="font-round px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
          style={{
            borderColor: "#EFE7DE",
            background: "#fff",
            color: "#8E869C",
          }}
        >
          {isHe ? "EN" : "עב"}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className={`w-full max-w-sm ${shaking ? "animate-shake" : ""}`}>
        {/* Logo area */}
        <div className="text-center mb-8">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              background: "#FCE3D5",
              display: "grid",
              placeItems: "center",
              fontSize: 32,
              transform: "rotate(-6deg)",
              margin: "0 auto 16px",
            }}
          >
            💛
          </div>
          <h1
            className="font-display"
            style={{ fontSize: 32, color: "#4B4358", margin: "0 0 8px" }}
          >
            {isHe ? "זכרונות משפחת רז" : "Memories - Raz Family"}
          </h1>
          <p
            className="font-round"
            style={{ color: "#8E869C", fontSize: 14, margin: 0 }}
          >
            {isHe ? "הזיכרונות של המשפחה" : "A private family scrapbook"}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 6px 22px rgba(75,67,88,0.10)",
            border: "1px solid #EFE7DE",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                className="font-round"
                style={{ fontSize: 13.5, color: "#8E869C" }}
              >
                {isHe ? "סיסמה" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder={isHe ? "הכנס סיסמה" : "Enter password"}
                autoFocus
                autoComplete="current-password"
                dir="ltr"
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: 14,
                  border: error ? "1.5px solid #DC2626" : "1.5px solid #EFE7DE",
                  background: "#FAFAF8",
                  fontFamily: "var(--font-sans, Rubik, sans-serif)",
                  fontSize: 15,
                  color: "#4B4358",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {error && (
                <p
                  className="font-round"
                  style={{ fontSize: 12, color: "#DC2626", margin: 0 }}
                >
                  {isHe ? "סיסמה שגויה" : "Wrong password"}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="font-round w-full"
              style={{
                padding: "14px",
                borderRadius: 99,
                border: "none",
                cursor: "pointer",
                background: "#E07F52",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: "0 6px 16px #F7BD9C",
              }}
            >
              {isHe ? "כניסה" : "Enter"}
            </button>
          </form>

          {loadError && (
            <p
              className="font-round"
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "#DC2626",
                textAlign: "center",
              }}
            >
              {loadError}
            </p>
          )}

          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid #EFE7DE",
            }}
          >
            <button
              type="button"
              className="font-round w-full"
              onClick={() => {
                enterAsGuest();
                setMode("guest");
                onGuest();
              }}
              style={{
                padding: "12px",
                borderRadius: 99,
                cursor: "pointer",
                background: "transparent",
                color: "#8E869C",
                fontSize: 14,
                border: "1.5px solid #EFE7DE",
                width: "100%",
              }}
            >
              {isHe
                ? "כניסה כאורח (צפייה בלבד)"
                : "Continue as guest (view only)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
