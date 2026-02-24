'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Recipe {
  id: number
  title: string
  content: string
  updated_at: string
}

export async function getRecipes(): Promise<Recipe[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching recipes:', error)
    return []
  }

  return data as Recipe[]
}

export async function getRecipe(id: number): Promise<Recipe | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data as Recipe
}

export async function createRecipe(
  title: string = 'Untitled Recipe',
  content: string = '',
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      title,
      content,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating recipe:', error)
    throw new Error('Failed to create recipe')
  }

  revalidatePath('/home')
  return data as Recipe
}

export async function updateRecipe(id: number, updates: Partial<Recipe>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('recipes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating recipe:', error)
    throw new Error('Failed to update recipe')
  }

  revalidatePath('/home')
}

export async function deleteRecipe(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('recipes').delete().eq('id', id)

  if (error) {
    console.error('Error deleting recipe:', error)
    throw new Error('Failed to delete recipe')
  }

  revalidatePath('/home')
}
