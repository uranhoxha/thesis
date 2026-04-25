'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  generateRecipesFromPantry,
  PantryRecipe,
  PantryScanResult,
} from '../api/scan'
import { createRecipe } from '@/features/recipes/api/recipes'

type Mode = 'snap' | 'upload' | 'text'

export function usePantryScan(onClose: () => void) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [mode, setMode] = useState<Mode>('snap')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMimeType, setImageMimeType] = useState<string | null>(null)
  const [ingredientsText, setIngredientsText] = useState('')
  const [result, setResult] = useState<PantryScanResult | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const reset = () => {
    setImagePreview(null)
    setImageBase64(null)
    setImageMimeType(null)
    setIngredientsText('')
    setResult(null)
    setSelected(new Set())
    generateMutation.reset()
    saveMutation.reset()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setImagePreview(null)
    setImageBase64(null)
    setImageMimeType(null)
    setIngredientsText('')
    setResult(null)
    setSelected(new Set())
  }

  const handleFile = async (file: File) => {
    const { base64, mimeType, dataUrl } = await resizeImage(file)
    setImageBase64(base64)
    setImageMimeType(mimeType)
    setImagePreview(dataUrl)
    setResult(null)
    setSelected(new Set())
  }

  const generateMutation = useMutation({
    mutationFn: () =>
      generateRecipesFromPantry({
        imageBase64: imageBase64 || undefined,
        imageMimeType: imageMimeType || undefined,
        ingredientsText:
          mode === 'text' ? ingredientsText : undefined,
      }),
    onSuccess: (data) => {
      setResult(data)
      setSelected(new Set(data.recipes.map((_, i) => i)))
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (recipes: PantryRecipe[]) => {
      const created = []
      for (const r of recipes) {
        const recipe = await createRecipe(r.title, r.content)
        created.push(recipe)
      }
      return created
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      handleClose()
      if (created[0]) {
        router.push(`/home?recipeId=${created[0].id}`)
      }
    },
  })

  const toggleSelected = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleSave = () => {
    if (!result) return
    const chosen = result.recipes.filter((_, i) => selected.has(i))
    if (chosen.length === 0) return
    saveMutation.mutate(chosen)
  }

  const canGenerate =
    (mode === 'text' && ingredientsText.trim().length > 0) ||
    ((mode === 'snap' || mode === 'upload') && !!imageBase64)

  return {
    mode,
    switchMode,
    imagePreview,
    ingredientsText,
    setIngredientsText,
    handleFile,
    result,
    selected,
    toggleSelected,
    canGenerate,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.error,
    generate: () => generateMutation.mutate(),
    isSaving: saveMutation.isPending,
    handleSave,
    handleClose,
  }
}

async function resizeImage(
  file: File,
  maxDim = 1024,
  quality = 0.8,
): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round(height * (maxDim / width))
          width = maxDim
        } else {
          width = Math.round(width * (maxDim / height))
          height = maxDim
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Could not get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      URL.revokeObjectURL(objectUrl)
      resolve({
        base64: dataUrl.split(',')[1],
        mimeType: 'image/jpeg',
        dataUrl,
      })
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl)
      reject(e)
    }
    img.src = objectUrl
  })
}
