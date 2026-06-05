"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticate } from "@/lib/auth";

interface PasswordGateProps {
  onSuccess: () => void;
  error?: string | null;
}

export function PasswordGate({ onSuccess, error: loadError }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className={`w-full max-w-sm ${shaking ? "animate-shake" : ""}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            הזכרונות שלנו
          </h1>
          <p className="text-muted-foreground text-sm">Our family memories</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <form id="password-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                סיסמה / Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter password"
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                autoFocus
                autoComplete="current-password"
              />
              {error && (
                <p className="text-xs text-destructive">סיסמה שגויה · Wrong password</p>
              )}
            </div>
            <Button type="submit" className="w-full" size="lg">
              כניסה · Enter
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
