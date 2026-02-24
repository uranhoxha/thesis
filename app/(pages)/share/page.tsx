'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import LZString from 'lz-string'
import { createRecipe } from '@/features/recipes/api/recipes'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function SharePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<{
    title: string
    content: string
  } | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) {
      setError('No recipe data found in link.')
      return
    }

    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(data)
      if (!decompressed) throw new Error('Could not decode recipe.')
      const parsed = JSON.parse(decompressed)

      if (!parsed.title || parsed.content === undefined) {
        throw new Error('Invalid recipe data format.')
      }

      setRecipe(parsed)
    } catch (err) {
      console.error(err)
      setError('Failed to decode the shared recipe. The link might be broken.')
    }
  }, [searchParams])

  const handleSave = async () => {
    if (!recipe) return
    setSaving(true)
    try {
      const newRecipe = await createRecipe(recipe.title, recipe.content)
      router.push(`/home?recipeId=${newRecipe.id}`)
    } catch (err) {
      console.error(err)
      setError(
        'Failed to save the recipe to your account (you might need to log in first).',
      )
      setSaving(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-customWhite text-brand p-8 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <Link
          href="/home"
          className="flex items-center gap-2 text-brand hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-customWhite text-brand flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-50" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-customWhite text-brand p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-border p-8 pb-12 flex flex-col gap-6">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-2xl font-bold">
            Someone shared a recipe with you!
          </h1>
          <p className="text-gray-500">
            Preview the recipe below and add it to your collection.
          </p>
        </div>

        <div className="bg-customWhite p-6 rounded-xl border border-border">
          <h2 className="text-xl font-bold mb-4">{recipe.title}</h2>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-serif">
            {recipe.content || (
              <span className="italic text-gray-400">No content provided</span>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {saving ? 'Saving...' : 'Add to My Recipes'}
        </button>

        <Link
          href="/home"
          className="text-center text-sm text-gray-500 hover:text-brand transition"
        >
          Maybe later
        </Link>
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-customWhite text-brand flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin opacity-50" />
        </div>
      }
    >
      <SharePageContent />
    </Suspense>
  )
}
