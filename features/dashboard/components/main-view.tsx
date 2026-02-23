"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import {
  getRecipe,
  updateRecipe,
  deleteRecipe,
  Recipe,
} from "@/features/recipes/api/recipes";
import { Loader2, Save, Trash2, Share2, Check } from "lucide-react";
import LZString from "lz-string";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChefBot } from "@/features/chef-bot/components/chef-bot";
import { Button } from "@/components/ui/button";

export function Main() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const recipeId = searchParams.get("recipeId");
  const queryClient = useQueryClient();

  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipe", Number(recipeId)],
    queryFn: () => getRecipe(Number(recipeId)),
    enabled: !!recipeId,
  });

  const [localRecipe, setLocalRecipe] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (recipe) {
      setLocalRecipe(recipe);
    }
  }, [recipe]);

  const handleUpdate = useCallback(
    async (updates: Partial<Recipe>) => {
      if (!recipeId) return;
      setSaving(true);
      try {
        await updateRecipe(Number(recipeId), updates);
        queryClient.invalidateQueries({
          queryKey: ["recipe", Number(recipeId)],
        });
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
      } catch (error) {
        console.error("Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [recipeId, queryClient],
  );

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedSave = useCallback(
    debounce((updates: Partial<Recipe>) => {
      handleUpdate(updates);
    }, 1000),
    [handleUpdate],
  );

  const handleChange = (field: keyof Recipe, value: string) => {
    if (!localRecipe) return;
    const updated = { ...localRecipe, [field]: value };
    setLocalRecipe(updated);
    debouncedSave({ [field]: value });
  };

  const handleDelete = async () => {
    if (!recipeId) return;
    try {
      await deleteRecipe(Number(recipeId));
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setLocalRecipe(null);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete");
    }
  };

  const handleShare = async () => {
    if (!localRecipe) return;
    try {
      const data = LZString.compressToEncodedURIComponent(
        JSON.stringify({
          title: localRecipe.title,
          content: localRecipe.content,
        }),
      );
      const url = `${window.location.origin}/share?data=${data}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!recipeId) {
    return (
      <div className="flex-3 bg-customWhite text-customGreen flex items-center justify-center">
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
      <div className="flex-3 bg-customWhite rounded-xl border border-border text-customGreen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-50" />
      </div>
    );
  }

  if (error || !localRecipe) {
    return (
      <div className="flex-3 bg-customWhite rounded-xl border border-border text-customGreen flex items-center justify-center">
        <p>Recipe not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-3 bg-customWhite text-customGreen p-8 flex flex-col gap-6 relative">
      <div className="flex justify-between items-start gap-4">
        <input
          type="text"
          value={localRecipe.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Untitled Recipe"
          className="text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-300 w-full"
        />
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-gray-400 flex items-center gap-1 animate-pulse">
              <Save className="w-3 h-3" /> Saving...
            </span>
          )}

          <Button
            onClick={handleShare}
            title="Share Link"
            variant="ghost"
          >
            {copied ? (
              <Check className="w-5 h-5 text-customGreen" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                title="Delete Recipe"
                variant="ghost"
              >
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
