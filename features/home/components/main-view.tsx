"use client";

import { useSearchParams } from "next/navigation";
import { Loader2, Save, Trash2, Share2, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChefBot } from "@/features/chef-bot/components/chef-bot";
import { Button } from "@/components/ui/button";
import { useRecipe } from "@/features/home/hooks/use-recipe";

export function Main() {
  const searchParams = useSearchParams();
  const rawRecipeId = searchParams.get("recipeId");
  const {
    recipeId,
    isLoading,
    error,
    localRecipe,
    saving,
    copied,
    handleChange,
    handleDelete,
    handleShare,
  } = useRecipe(rawRecipeId);

  if (!recipeId) {
    return (
      <div className="flex-1 md:flex-3 bg-customWhite text-brand flex items-center justify-center">
        <div className="text-center space-y-2 opacity-50">
          <p className="text-lg font-medium">No Recipe Selected</p>
          <p className="text-sm">
            Select a recipe from the sidebar or help yourself to a new one.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 md:flex-3 bg-customWhite text-brand flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-50" />
      </div>
    );
  }

  if (error || !localRecipe) {
    return (
      <div className="flex-1 md:flex-3 bg-customWhite text-brand flex items-center justify-center">
        <p>Recipe not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 md:flex-3 min-w-0 bg-customWhite text-brand p-4 md:p-8 flex flex-col gap-4 md:gap-6 relative">
      <div className="flex justify-between items-start gap-2 md:gap-4">
        <input
          type="text"
          value={localRecipe.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Untitled Recipe"
          className="text-2xl md:text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-300 w-full min-w-0"
        />
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-gray-400 flex items-center gap-1 animate-pulse">
              <Save className="w-3 h-3" /> Saving...
            </span>
          )}

          <Button onClick={handleShare} title="Share Link" variant="ghost">
            {copied ? (
              <Check className="w-5 h-5 text-brand" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button title="Delete Recipe" variant="ghost">
                <Trash2 className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your recipe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <textarea
        value={localRecipe.content || ""}
        onChange={(e) => handleChange("content", e.target.value)}
        placeholder="Start typing your recipe details..."
        className="flex-1 w-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-lg leading-relaxed placeholder:text-gray-300"
      />

      <ChefBot />
    </div>
  );
}
