import { useState } from "react";
import {
  addBuyItem,
  deleteBuyItem,
  getBuyItems,
  toggleBuyItem,
} from "../api/buy-list";
import { Item } from "../types/buy-items";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useBuyList() {
  const [newItem, setNewItem] = useState("");
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["buy-items"],
    queryFn: () => getBuyItems(),
  });

  const addMutation = useMutation({
    mutationFn: (title: string) => addBuyItem(title),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: ["buy-items"] });
      const previousItems = queryClient.getQueryData<Item[]>(["buy-items"]);

      const optimisticItem: Item = {
        id: Date.now(),
        title,
        quantity: "1",
        checked: false,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Item[]>(["buy-items"], (old = []) => [
        ...old,
        optimisticItem,
      ]);

      return { previousItems };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["buy-items"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["buy-items"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, checked }: { id: number; checked: boolean }) =>
      toggleBuyItem(id, checked),
    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey: ["buy-items"] });
      const previousItems = queryClient.getQueryData<Item[]>(["buy-items"]);

      queryClient.setQueryData<Item[]>(["buy-items"], (old = []) =>
        old.map((item) =>
          item.id === id ? { ...item, checked: checked } : item,
        ),
      );

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["buy-items"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["buy-items"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBuyItem,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["buy-items"] });
      const previousItems = queryClient.getQueryData<Item[]>(["buy-items"]);

      queryClient.setQueryData<Item[]>(["buy-items"], (old = []) =>
        old.filter((item) => item.id !== id),
      );

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["buy-items"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["buy-items"] });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    addMutation.mutate(newItem);
    setNewItem("");
  };

  const handleToggle = (id: number, currentChecked: boolean) => {
    toggleMutation.mutate({ id, checked: !currentChecked });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return {
    items,
    isLoading,
    addMutation,
    toggleMutation,
    deleteMutation,
    newItem,
    setNewItem,
    handleAddItem,
    handleToggle,
    handleDelete,
  };
}
