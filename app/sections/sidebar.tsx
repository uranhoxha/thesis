"use client";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "../actions/auth";

export function Sidebar() {
  return (
    <div className="bg-customWhite rounded-xl border border-border text-customGreen w-50 shrink-0 flex items-center flex-col justify-between py-4">
      <Image src={Logo} alt="Logo" className="-rotate-12" />
      <Button variant="outline" onClick={() => logout()}>
        <LogOut />
        <span>Get out of the kitchen</span>
      </Button>
    </div>
  );
}
