export interface DailyPickData {
  id: number
  title: string
  category: 'savory' | 'snack' | 'dessert'
  content: string
  created_at: string
}
