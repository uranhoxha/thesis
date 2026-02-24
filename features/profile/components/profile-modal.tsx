"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader2, UploadCloud, UserRound } from "lucide-react";
import { useProfile } from "../hooks/use-profile";

export function ProfileModal({
  user,
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  children: React.ReactNode;
}) {
  const {
    open,
    setOpen,
    isUploading,
    isUpdatingPassword,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
    passwordMessage,
    handleAvatarUpload,
    handlePasswordUpdate,
  } = useProfile({ user, children });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium leading-none">
              Profile Picture{" "}
              <span className="text-xs text-muted-foreground">
                (5MB limit)
              </span>
            </h4>
            <div className="flex justify-center w-full">
              <Label
                htmlFor="avatar-upload"
                className="relative group cursor-pointer h-24 w-24 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover group-hover:opacity-50 transition-opacity"
                  />
                ) : (
                  <span className="text-muted-foreground group-hover:opacity-50 transition-opacity">
                    <UserRound className="w-10 h-10" />
                  </span>
                )}
                <div className="absolute inset-0 bg-brand/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center p-2 font-medium">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin mb-1" />
                  ) : (
                    <UploadCloud className="w-5 h-5 mb-1" />
                  )}
                  {isUploading ? "Uploading" : "Upload"}
                </div>

                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </Label>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
            <h4 className="text-sm font-medium leading-none">
              Change Password
            </h4>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="******"
                disabled={isUpdatingPassword}
              />
            </div>

            {passwordMessage && (
              <p
                className={`text-sm ${
                  passwordMessage.type === "error"
                    ? "text-red-500"
                    : "text-brand"
                }`}
              >
                {passwordMessage.text}
              </p>
            )}

            <Button
              type="submit"
              disabled={isUpdatingPassword || !password || !passwordConfirm}
              className="mt-2"
            >
              {isUpdatingPassword && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Update Password
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
