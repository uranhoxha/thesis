"use client";

import Image from "next/image";
import RedLogo from "@/public/red_logo.svg";
import GreenLogo from "@/public/green_logo.svg";
import BlueLogo from "@/public/blue_logo.svg";
import YellowLogo from "@/public/yellow_logo.svg";

import { Button } from "@/components/ui/button";
import { LogOut, Plus, FileText, Loader2, Settings } from "lucide-react";
import { logout } from "@/features/auth/api/auth";
import { useTransition } from "react";
import { createRecipe, getRecipes } from "@/features/recipes/api/recipes";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { SettingsModal } from "@/features/settings/components/settings-modal";
import { useTheme } from "@/features/settings/hooks/use-theme";

const logos = {
  red: RedLogo,
  green: GreenLogo,
  blue: BlueLogo,
  yellow: YellowLogo,
};

export function Sidebar() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = Number(searchParams.get("recipeId"));
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => getRecipes(),
  });

  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("recipes_channel_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recipes",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  const handleCreate = async () => {
    startTransition(async () => {
      try {
        const newRecipe = await createRecipe();
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
        router.push(`/dashboard?recipeId=${newRecipe.id}`);
      } catch (error) {
        console.error("Failed to create recipe");
      }
    });
  };

  const handleSelect = (id: number) => {
    router.push(`/dashboard?recipeId=${id}`);
  };

  const Logo = logos[theme] || GreenLogo;

  return (
    <div className="bg-customWhite rounded-l-xl border-r border-border text-brand w-64 flex flex-col py-4 gap-4 h-full">
      <div className="px-2 flex flex-col items-center gap-4">
        <Image src={Logo} alt="Logo" className=" w-50 absolute top-4" />
      </div>
      <div className="flex-1 flex flex-col justify-center min-h-0 gap-4 py-2">
        <div className="overflow-y-auto px-2 space-y-1">
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => handleSelect(recipe.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shrink-0",
                activeId === recipe.id
                  ? "bg-green-100/50 text-brand font-medium"
                  : "hover:bg-gray-100 text-gray-600",
              )}
            >
              <FileText className="w-4 h-4 opacity-50 shrink-0" />
              <span className="truncate">{recipe.title || "Untitled"}</span>
            </button>
          ))}
        </div>
        <div className="shrink-0 w-full px-2">
          <Button
            onClick={handleCreate}
            disabled={isPending}
            className="w-full bg-brand text-white hover:bg-brand/90"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            New Recipe
          </Button>
        </div>
      </div>

      <div className="px-4 mt-auto shrink-0 space-y-2">
        <SettingsModal>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-brand/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </SettingsModal>
        <Button
          variant="ghost"
          onClick={() => logout()}
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
