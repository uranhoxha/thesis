"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTheme, ThemeType } from "../hooks/use-theme";
import { cn } from "@/lib/utils";

const themes: { name: string; value: ThemeType; color: string }[] = [
  { name: "Green (Default)", value: "green", color: "#25671E" },
  { name: "Red", value: "red", color: "#D92C54" },
  { name: "Blue", value: "blue", color: "#36656B" },
  { name: "Yellow", value: "yellow", color: "#FF9B2F" },
];

export function SettingsModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium leading-none">Theme Color</h4>
            <div className="flex gap-2 border border-border w-max p-1 rounded-sm">
              {themes.map((t) => (
                <div
                  key={t.value}
                  className="flex flex-col items-center"
                >
                  <button
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "h-8 w-8 rounded-sm  transition-all hover:scale-105 cursor-pointer" ,
                      theme === t.value
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: t.color }}
                    aria-label={`Select ${t.name} theme`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
