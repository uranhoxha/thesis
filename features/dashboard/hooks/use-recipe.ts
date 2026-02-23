import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import LZString from "lz-string";
import {
  getRecipe,
  updateRecipe,
  deleteRecipe,
  Recipe,
} from "@/features/recipes/api/recipes";

export function useRecipe(recipeId: string | null) {
  const router = useRouter();
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

  return {
    recipeId,
    recipe,
    isLoading,
    error,
    localRecipe,
    saving,
    copied,
    handleChange,
    handleDelete,
    handleShare,
  };
}
