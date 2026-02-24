import { createClient } from '@/lib/supabase/browser'
import { DailyPickData } from '@/features/admin/types'

export async function getDailyPicksFromDB(): Promise<DailyPickData[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('daily_picks').select('*')

  if (error) {
    console.error('Error fetching daily picks:', error)
    return []
  }

  const allRecipes = data as DailyPickData[]

  if (allRecipes.length === 0) return []

  const today = new Date()
  const seedString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

  let hash = 0
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  const random = (min: number, max: number, salt: number) => {
    const x = Math.sin(Math.abs(hash) + salt) * 10000
    return Math.floor((x - Math.floor(x)) * (max - min)) + min
  }

  const savoryOptions = allRecipes.filter((r) => r.category === 'savory')
  const snackOptions = allRecipes.filter((r) => r.category === 'snack')
  const dessertOptions = allRecipes.filter((r) => r.category === 'dessert')

  const savoryPick =
    savoryOptions.length > 0
      ? savoryOptions[random(0, savoryOptions.length, 1)]
      : null
  const snackPick =
    snackOptions.length > 0
      ? snackOptions[random(0, snackOptions.length, 2)]
      : null
  const dessertPick =
    dessertOptions.length > 0
      ? dessertOptions[random(0, dessertOptions.length, 3)]
      : null

  return [savoryPick, snackPick, dessertPick].filter(
    (pick): pick is DailyPickData => pick !== null,
  )
}
