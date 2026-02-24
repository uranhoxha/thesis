export interface DailyPickData {
  id: number
  title: string
  category: 'savory' | 'snack' | 'dessert'
  content: string
  created_at: string
}

export interface CookingTipData {
  id: number
  tip: string
  created_at: string
}