"use client";

import { useState } from "react";
import { signup } from "@/app/actions/auth";
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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome to Tastebook, Chef!
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
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="e.g. ********"
                  name="password"
                  value={password}
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
                  placeholder="e.g. ********"
                  name="confirmPassword"
                  value={confirm}
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
    </div>
  );
}
