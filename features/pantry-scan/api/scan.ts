'use server'

import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'

export interface PantryRecipe {
  title: string
  content: string
}

export interface PantryScanResult {
  ingredients: string[]
  recipes: PantryRecipe[]
}

interface ScanInput {
  imageBase64?: string
  imageMimeType?: string
  ingredientsText?: string
}

const SYSTEM_PROMPT = `You are a recipe assistant. Look at the input (an image of a fridge/counter/pantry, or a list of typed ingredients) and:

1. Identify the edible ingredients available.
2. Propose exactly 3 DISTINCT recipes the user can make right now, using primarily those ingredients plus common pantry staples (salt, pepper, oil, water, basic spices).
3. Make the 3 recipes meaningfully different (e.g. different cuisines, or quick / medium / more elaborate).

Return ONLY valid JSON in this exact shape:
{
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "recipes": [
    {
      "title": "Short recipe name",
      "content": "Markdown body with two sections: an Ingredients list (using bullet points) and Steps (numbered). Be concise but complete."
    },
    { "title": "...", "content": "..." },
    { "title": "...", "content": "..." }
  ]
}

Do not include any prose outside the JSON.`

export async function generateRecipesFromPantry(
  input: ScanInput,
): Promise<PantryScanResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
  }

  if (!input.imageBase64 && !input.ingredientsText?.trim()) {
    throw new Error('Provide either an image or a list of ingredients')
  }

  const ai = new GoogleGenAI({ apiKey })

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [{ text: SYSTEM_PROMPT }]

  if (input.ingredientsText?.trim()) {
    parts.push({
      text: `User-provided ingredients:\n${input.ingredientsText.trim()}`,
    })
  }

  if (input.imageBase64) {
    parts.push({
      inlineData: {
        mimeType: input.imageMimeType || 'image/jpeg',
        data: input.imageBase64,
      },
    })
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts }],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  })

  const text = response.text
  if (!text) {
    throw new Error('Empty response from Gemini')
  }

  let parsed: PantryScanResult
  try {
    parsed = JSON.parse(text)
  } catch {
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    parsed = JSON.parse(cleaned)
  }

  if (
    !parsed ||
    !Array.isArray(parsed.ingredients) ||
    !Array.isArray(parsed.recipes)
  ) {
    throw new Error('Unexpected response shape from Gemini')
  }

  return parsed
}
