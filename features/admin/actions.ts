'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DailyPickData, CookingTipData } from './types'

export async function checkIsAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) return false

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(user.email)
}

export async function getUsers() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const { data, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }

  return data.users
}

export async function deleteUser(userId: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getAdminDailyPicks(): Promise<DailyPickData[]> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_picks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching daily picks:', error)
    return []
  }

  return data as DailyPickData[]
}

export async function createDailyPick(
  pickData: Omit<DailyPickData, 'id' | 'created_at'>,
) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('daily_picks').insert([pickData])

  if (error) {
    console.error('Error creating daily pick:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/chatbot')
  return { success: true }
}

export async function deleteDailyPick(id: number) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('daily_picks').delete().eq('id', id)

  if (error) {
    console.error('Error deleting daily pick:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/chatbot')
  return { success: true }
}

export async function updateDailyPick(
  id: number,
  pickData: Partial<Omit<DailyPickData, 'id' | 'created_at'>>,
) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('daily_picks')
    .update(pickData)
    .eq('id', id)

  if (error) {
    console.error('Error updating daily pick:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/chatbot')
  return { success: true }
}

export async function getAdminCookingTips(): Promise<CookingTipData[]> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cooking_tips')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cooking tips:', error)
    return []
  }

  return data as CookingTipData[]
}

export async function createCookingTip(
  tipData: Omit<CookingTipData, 'id' | 'created_at'>,
) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('cooking_tips').insert([tipData])

  if (error) {
    console.error('Error creating cooking tip:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/cooking-tips')
  return { success: true }
}

export async function deleteCookingTip(id: number) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('cooking_tips').delete().eq('id', id)

  if (error) {
    console.error('Error deleting cooking tip:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/cooking-tips')
  return { success: true }
}

export async function updateCookingTip(
  id: number,
  tipData: Partial<Omit<CookingTipData, 'id' | 'created_at'>>,
) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('cooking_tips')
    .update(tipData)
    .eq('id', id)

  if (error) {
    console.error('Error updating cooking tip:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/cooking-tips')
  return { success: true }
}
