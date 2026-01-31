"use client";

import { useEffect, useState, useTransition } from "react";
import {
  addBuyItem,
  deleteBuyItem,
  getBuyItems,
  toggleBuyItem,
} from "../actions/buy-list";
import { Item } from "@/types/buy-items";
import { Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export function BuyList() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchItems = async () => {
    try {
      const data = await getBuyItems();
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const tempId = Date.now();
    const optimisticItem: Item = {
      id: tempId,
      title: newItem,
      quantity: "1",
      checked: false,
      created_at: new Date().toISOString(),
    };

    setItems((prev) => [...prev, optimisticItem]);
    setNewItem("");

    startTransition(async () => {
      try {
        await addBuyItem(optimisticItem.title);
        await fetchItems(); // Re-fetch to get real ID
      } catch (error) {
        setItems((prev) => prev.filter((item) => item.id !== tempId));
        console.error("Failed to add item");
      }
    });
  };

  const handleToggle = async (id: number, currentChecked: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !currentChecked } : item
      )
    );

    startTransition(async () => {
      try {
        await toggleBuyItem(id, !currentChecked);
      } catch (error) {
        // Revert on error
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, checked: currentChecked } : item
          )
        );
      }
    });
  };

  const handleDelete = async (id: number) => {
    const previousItems = items;
    setItems((prev) => prev.filter((item) => item.id !== id));

    startTransition(async () => {
      try {
        await deleteBuyItem(id);
      } catch (error) {
        setItems(previousItems);
      }
    });
  };

  return (
    <div className="flex-1 bg-customWhite rounded-xl border border-border text-customGreen flex flex-col overflow-hidden h-full">
      <div className="p-4 border-b border-border bg-gray-50/50">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          To-Buy List
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No items yet. Add something to buy!
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-100",
                item.checked && "opacity-60"
              )}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggle(item.id, item.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 transition cursor-pointer accent-customGreen"
              />
              <span
                className={cn(
                  "flex-1 text-sm transition-all",
                  item.checked && "line-through text-gray-400"
                )}
              >
                {item.title}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border bg-white">
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add new item..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-customGreen/20 focus:border-customGreen transition"
          />
          <button
            type="submit"
            disabled={!newItem.trim() || isPending}
            className="p-2 bg-customGreen text-white rounded-lg hover:bg-customGreen/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

