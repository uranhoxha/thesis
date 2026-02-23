import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/browser";

export function useProfile({
  user,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isUploading, startUploadTransition] = useTransition();
  const [isUpdatingPassword, startPasswordTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    startUploadTransition(async () => {
      try {
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: data.publicUrl },
        });

        if (updateError) {
          throw updateError;
        }
        window.location.reload();
      } catch (error) {
        console.error("Avatar upload error:", error);
        alert("Failed to upload avatar");
      }
    });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (password !== passwordConfirm) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (password.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    startPasswordTransition(async () => {
      try {
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) {
          setPasswordMessage({ type: "error", text: error.message });
        } else {
          setPasswordMessage({
            type: "success",
            text: "Password updated successfully!",
          });
          setPassword("");
          setPasswordConfirm("");
        }
      } catch (error) {
        setPasswordMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  return {
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
  };
}
