'use server'

import { createClient } from '@/lib/supabase/server'
import { Item } from '../types/buy-items'
import { revalidatePath } from 'next/cache'

export async function getBuyItems(): Promise<Item[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buy_list_items')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching items:', error)
    return []
  }

  return data as Item[]
}

export async function addBuyItem(title: string, quantity: string = '1') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase.from('buy_list_items').insert({
    title,
    quantity,
    user_id: user.id,
  })

  if (error) {
    console.error('Error adding item:', error)
    throw new Error('Failed to add item')
  }

  revalidatePath('/home')
}

export async function toggleBuyItem(id: number, checked: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('buy_list_items')
    .update({ checked })
    .eq('id', id)

  if (error) {
    console.error('Error toggling item:', error)
    throw new Error('Failed to update item')
  }

  revalidatePath('/home')
}

export async function deleteBuyItem(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('buy_list_items').delete().eq('id', id)

  if (error) {
    console.error('Error deleting item:', error)
    throw new Error('Failed to delete item')
  }

  revalidatePath('/home')
}
