"use client";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/features/auth/api/auth";
import tipsData from "@/public/cooking-tips.json";
import { ProfileModal } from "@/features/profile/components/profile-modal";

export function Topbar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [tip, setTip] = useState<string>("");

  useEffect(() => {
    const randomTip = tipsData[Math.floor(Math.random() * tipsData.length)].tip;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTip(randomTip);
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="bg-customWhite rounded-tr-xl border-b border-border text-customGreen h-16 shrink-0 flex items-center justify-between px-4">
      <h1 className="text-2xl">
        <b>Cooking tip:</b> {tip}
      </h1>

      <ProfileModal user={user}>
        <div className="flex items-center bg-white rounded-full border border-border gap-2 cursor-pointer w-max hover:bg-gray-50 transition-colors">
          <div className="border border-border  rounded-full h-9 w-9 flex items-center justify-center overflow-hidden shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="w-5 h-5" />
            )}
          </div>
          <div className="pr-4">
            <h4 className="text-muted-foreground text-sm font-medium">
              {user ? user.email : "Boiling..."}
            </h4>
          </div>
        </div>
      </ProfileModal>
    </div>
  );
}
