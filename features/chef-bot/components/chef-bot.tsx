'use client'

import Image from 'next/image'
import { Loader2, Plus, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
type RecipeCategory = 'savory' | 'snack' | 'dessert'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useChefBot } from '../hooks/use-chef-bot'
import ChatIcon from '@/public/normal.svg'
import ChatIconHover from '@/public/happy.svg'

const categoryColors: Record<RecipeCategory, string> = {
  savory: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  snack: 'bg-blue-100 text-blue-800 border border-blue-200',
  dessert: 'bg-pink-100 text-pink-800 border border-pink-200',
}

export function ChefBot() {
  const {
    isOpen,
    setIsOpen,
    isPending,
    dailyPicks,
    isLoadingPicks,
    handleAddRecipe,
  } = useChefBot()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="group fixed bottom-4 right-4 md:bottom-8 md:right-59 w-15 h-15 rounded-full shadow-lg bg-white hover:bg-gray-50 border border-border p-2 overflow-hidden z-30"
          size="icon"
        >
          <div className="relative w-full h-full">
            <Image
              src={ChatIcon}
              alt="ChefBot"
              fill
              className="transition-all duration-300 group-hover:opacity-0 group-hover:-rotate-12"
            />

            <Image
              src={ChatIconHover}
              alt="ChefBot Hover"
              fill
              className="opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-rotate-12"
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm md:w-96 mr-4 md:mr-8 mb-4 p-0 overflow-hidden border-border bg-white shadow-xl rounded-xl">
        <div className="bg-gradient-to-r from-brand/10 to-brand/5 p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <ChefHat className="w-5 h-5 text-brand" />
            <h3 className="font-semibold text-brand">ChefBot</h3>
          </div>
          <p className="text-sm text-gray-600">
            Don't know what to cook? Here are our daily picks!
          </p>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
          {isLoadingPicks ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand/50" />
            </div>
          ) : dailyPicks.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              No daily picks found! Come back later. 👨‍🍳
            </div>
          ) : (
            dailyPicks.map((pick, index) => (
              <div
                key={index}
                className="group border border-gray-100 rounded-lg p-3 hover:border-brand/30 hover:bg-brand/5 transition-all"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{pick.title}</h4>
                    <span
                      className={cn(
                        'text-xs capitalize px-2 py-0.5 rounded-full mt-1 inline-block',
                        categoryColors[pick.category as RecipeCategory] ||
                          'bg-gray-100 text-gray-500',
                      )}
                    >
                      {pick.category}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-brand bg-white border border-brand/20 hover:bg-brand hover:text-white rounded-full shadow-sm"
                    onClick={() => handleAddRecipe(pick.title, pick.content)}
                    disabled={isPending}
                    title="Cook this"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {pick.content}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
