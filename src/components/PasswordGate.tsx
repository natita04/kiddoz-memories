"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Heart, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticate, enterAsGuest } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";

interface PasswordGateProps {
  onSuccess: () => void;
  onGuest: () => void;
  error?: string | null;
}

export function PasswordGate({ onSuccess, onGuest, error: loadError }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, dir } = useLanguage();

  const isHe = language === "he";

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
      {/* Controls — fixed to top-right physically, never moves with RTL */}
      <div className="fixed top-4 right-4 flex items-center gap-2" dir="ltr">
        <button
          onClick={() => setLanguage(isHe ? "en" : "he")}
          className="px-3 py-1 rounded-md text-xs font-semibold border border-border hover:bg-secondary transition-colors bg-background"
        >
          {isHe ? "EN" : "עב"}
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
            {isHe ? "הזכרונות שלנו" : "Our Memories"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isHe ? "הזיכרונות של המשפחה" : "A private family scrapbook"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <form id="password-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground block">
                {isHe ? "סיסמה" : "Password"}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder={isHe ? "הכנס סיסמה" : "Enter password"}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                autoFocus
                autoComplete="current-password"
                dir="ltr"
              />
              {error && (
                <p className="text-xs text-destructive">
                  {isHe ? "סיסמה שגויה" : "Wrong password"}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" size="lg">
              {isHe ? "כניסה" : "Enter"}
            </Button>
          </form>

          {loadError && (
            <p className="mt-3 text-xs text-destructive text-center">{loadError}</p>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => { enterAsGuest(); onGuest(); }}
            >
              {isHe ? "כניסה כאורח (צפייה בלבד)" : "Continue as guest (view only)"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
