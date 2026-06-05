"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Heart, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticate } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";

interface PasswordGateProps {
  onSuccess: () => void;
  error?: string | null;
}

export function PasswordGate({ onSuccess, error: loadError }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, dir } = useLanguage();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (authenticate(password)) {
      onSuccess();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir={dir}>
      {/* Top-right controls — mirrors the Nav */}
      <div className="fixed top-4 end-4 flex items-center gap-2">
        <button
          onClick={() => setLanguage(language === "he" ? "en" : "he")}
          className="px-3 py-1 rounded-md text-xs font-semibold border border-border hover:bg-secondary transition-colors bg-background"
        >
          {language === "he" ? "EN" : "עב"}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className={`w-full max-w-sm ${shaking ? "animate-shake" : ""}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            {language === "he" ? "הזכרונות שלנו" : "Our Memories"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {language === "he" ? "Our family memories" : "הזיכרונות של המשפחה"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <form id="password-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground block">
                {language === "he" ? "סיסמה / Password" : "Password / סיסמה"}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder={language === "he" ? "הכנס סיסמה" : "Enter password"}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                autoFocus
                autoComplete="current-password"
                dir="ltr"
              />
              {error && (
                <p className="text-xs text-destructive">
                  {language === "he" ? "סיסמה שגויה · Wrong password" : "Wrong password · סיסמה שגויה"}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" size="lg">
              {language === "he" ? "כניסה · Enter" : "Enter · כניסה"}
            </Button>
          </form>

          {loadError && (
            <p className="mt-3 text-xs text-destructive text-center">{loadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
