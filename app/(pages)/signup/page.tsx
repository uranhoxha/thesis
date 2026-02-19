"use client";

import { useState } from "react";
import { signup } from "@/features/auth/api/auth";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import HappyLogo from "@/public/happy.svg";
import EyesClosed from "@/public/eyes_closed.svg";
import NormalLogo from "@/public/normal.svg";
import Image from "next/image";
import GoogleLogo from "@/public/google.svg";
import AuthBg from "@/components/layout/auth-bg";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const { error } = await signup(email, password);
    if (error) setError(error.message);
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen relative overflow-hidden bg-gray-50">
      <AuthBg />

      <div className="relative z-10 flex flex-col gap-4 max-w-md w-full bg-gray-100 p-4 rounded-lg shadow-md border border-border">
        <div className="absolute -top-16 -left-14 w-[120px] h-[120px] group">
          <Image
            src={NormalLogo}
            alt="logo"
            fill
            className={`transition-all duration-500 ease-in-out group-hover:-rotate-6 ${
              focusedField === null ? "opacity-100" : "opacity-0"
            }`}
          />
          <Image
            src={HappyLogo}
            alt="logo"
            fill
            className={`transition-all duration-500 ease-in-out group-hover:-rotate-6 ${
              focusedField === "email" ? "opacity-100" : "opacity-0"
            }`}
          />
          <Image
            src={EyesClosed}
            alt="logo"
            fill
            className={`transition-all duration-500 ease-in-out group-hover:-rotate-6 ${
              focusedField === "password" || focusedField === "confirmPassword"
                ? "opacity-100"
                : "opacity-0"
            }`}
          />
        </div>
        <Card className="max-w-md w-full shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome to Cooksmth, Chef!
            </CardTitle>
            <CardDescription>Start cooking an account below!</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email address</Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="e.g. chef@example.com"
                  value={email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border p-2"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="e.g. ••••••••"
                    name="password"
                    value={password}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="e.g. ••••••••"
                    name="confirmPassword"
                    value={confirm}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="border p-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button>Create Account</Button>

              {error && <p className="text-destructive capitalize">{error}</p>}
            </form>

            <div className="flex items-center justify-between mt-4">
              <p>Already have an account?</p>
              <Link
                href="/login"
                className="text-customGreen underline hover:text-customGreen/70"
              >
                Log in and start cooking.
              </Link>
            </div>
          </CardContent>
        </Card>
        <div className="text-center text-muted-foreground w-full flex items-center justify-center gap-2">
          <span className="border border-border w-full h-[1px]"></span>or{" "}
          <span className="border border-border w-full h-[1px]"></span>
        </div>
        <Button variant="outline" onClick={handleGoogleLogin}>
          <Image src={GoogleLogo} alt="Google" width={18} height={18} />
          <span>Continue with Google</span>
        </Button>
      </div>
    </div>
  );
}
