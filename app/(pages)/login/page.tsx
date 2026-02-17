"use client";

import { useState } from "react";
import { login } from "@/features/auth/api/auth";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await login(email, password);
    if (error) setError(error.message);
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            Hello chef, welcome to Tastebook
          </CardTitle>
          <CardDescription>
            Quickly log in before the food gets cold!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <Input
                type="email"
                placeholder="e.g. masterchef@example.com"
                value={email}
                name="email"
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
                  value={password}
                  name="password"
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

            <Button>Login</Button>

            {error && <p className="text-destructive capitalize">{error}</p>}
          </form>
          <div className="flex items-center justify-between mt-4">
            <p>Don&apos;t have an account?</p>
            <Link
              href="/signup"
              className="text-customGreen underline hover:text-customGreen/70"
            >
              Cook one right now.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
