import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createRecipe } from "@/features/recipes/api/recipes";
import { getDailyPicks } from "../data/daily-picks";

export function useChefBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();
  const dailyPicks = getDailyPicks();

  const handleAddRecipe = (title: string, content: string) => {
    startTransition(async () => {
      try {
        const newRecipe = await createRecipe(title, content);
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
        router.push(`/dashboard?recipeId=${newRecipe.id}`);
        setIsOpen(false);
      } catch (error) {
        console.error("Failed to add recipe");
      }
    });
  };

  return {
    isOpen,
    setIsOpen,
    isPending,
    dailyPicks,
    handleAddRecipe,
  };
}
