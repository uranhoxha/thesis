/**
 * Benchmark 2 — Pantry Scan / Gemini pipeline reliability
 *
 * The production scan lives in features/pantry-scan/api/scan.ts as a single
 * `'use server'` function `generateRecipesFromPantry`. That function:
 *   1. opens a cookie-aware Supabase client (next/headers cookies()) and calls
 *      auth.getUser() — this THROWS outside a Next.js request context, so the
 *      function cannot be imported and called from a plain script; and
 *   2. there is no separate exported "core logic" function to import.
 *
 * The task forbids modifying application source, so instead of refactoring
 * scan.ts this script re-implements the POST-AUTH half of the pipeline
 * verbatim: identical model id, system prompt, generation config, and the same
 * JSON.parse-with-code-fence-fallback. An integrity check (assertSourceUnchanged)
 * reads scan.ts at runtime and fails loudly if any of those copied constants
 * drift from the source, so this benchmark stays faithful to production.
 *
 * Nothing about runtime behaviour is changed; only auth + revalidatePath are
 * absent (neither affects the Gemini round-trip being measured).
 *
 * Run with:
 *   node --env-file=.env.local node_modules/.bin/tsx bench/bench-pantry-scan.ts
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { GoogleGenAI } from '@google/genai'

// ----- Config -----
const RUNS = Number(process.env.BENCH_RUNS ?? '20')
const IMAGE_PATH = resolve(__dirname, 'fixtures/fridge.png')
const IMAGE_MIME = 'image/png'
const MODEL = 'gemini-2.5-flash'

// ----- Verbatim copy from features/pantry-scan/api/scan.ts -----
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

const GEN_CONFIG = { responseMimeType: 'application/json', temperature: 0.7 }

// ----- Integrity guard: confirm the copied constants still match source -----
function assertSourceUnchanged() {
  const src = readFileSync(
    resolve(__dirname, '../features/pantry-scan/api/scan.ts'),
    'utf8',
  )
  const problems: string[] = []
  if (!src.includes(`model: '${MODEL}'`)) problems.push(`model id "${MODEL}" not found in scan.ts`)
  if (!src.includes('responseMimeType')) problems.push('responseMimeType not found in scan.ts')
  if (!src.includes('temperature: 0.7')) problems.push('temperature: 0.7 not found in scan.ts')
  // Spot-check the prompt by its first and last sentences.
  if (!src.includes('You are a recipe assistant.')) problems.push('system prompt opening drifted')
  if (!src.includes('Do not include any prose outside the JSON.')) problems.push('system prompt closing drifted')
  if (problems.length) {
    console.error('INTEGRITY CHECK FAILED — bench no longer matches scan.ts:')
    for (const p of problems) console.error('  - ' + p)
    process.exit(1)
  }
  console.log('Integrity check OK: model/prompt/config match scan.ts.\n')
}

interface PantryRecipe { title: string; content: string }
interface PantryScanResult { ingredients: string[]; recipes: PantryRecipe[] }

// Verbatim parse logic from scan.ts (JSON, then code-fence-stripped fallback).
function parseGeminiText(text: string): { parsed: PantryScanResult; usedFallback: boolean } {
  try {
    return { parsed: JSON.parse(text), usedFallback: false }
  } catch {
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    return { parsed: JSON.parse(cleaned), usedFallback: true }
  }
}

function isValidShape(p: PantryScanResult): { ok: boolean; reason: string } {
  if (!p || typeof p !== 'object') return { ok: false, reason: 'not an object' }
  if (!Array.isArray(p.ingredients)) return { ok: false, reason: 'ingredients not array' }
  if (!p.ingredients.every((i) => typeof i === 'string')) return { ok: false, reason: 'ingredients not all strings' }
  if (!Array.isArray(p.recipes)) return { ok: false, reason: 'recipes not array' }
  if (p.recipes.length !== 3) return { ok: false, reason: `recipes length = ${p.recipes.length}, expected 3` }
  for (let i = 0; i < p.recipes.length; i++) {
    const r = p.recipes[i]
    if (!r || typeof r.title !== 'string' || r.title.trim() === '') return { ok: false, reason: `recipe[${i}].title invalid` }
    if (typeof r.content !== 'string' || r.content.trim() === '') return { ok: false, reason: `recipe[${i}].content invalid` }
  }
  return { ok: true, reason: '' }
}

function percentile(sortedAsc: number[], p: number): number {
  if (!sortedAsc.length) return NaN
  const rank = Math.ceil((p / 100) * sortedAsc.length)
  return sortedAsc[Math.min(sortedAsc.length - 1, Math.max(0, rank - 1))]
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()

interface RunRow {
  run: number
  ms: number
  jsonOk: boolean
  usedFallback: boolean
  shapeOk: boolean
  shapeReason: string
  titles: string[]
  dupWithinRun: boolean
  promptTokens: number
  outputTokens: number
  totalTokens: number
  error?: string
}

async function main() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    console.error('MISSING ENV VAR: GOOGLE_GENERATIVE_AI_API_KEY is not set.')
    console.error('Run with: node --env-file=.env.local node_modules/.bin/tsx bench/bench-pantry-scan.ts')
    process.exit(1)
  }

  assertSourceUnchanged()

  let imageBase64: string
  try {
    imageBase64 = readFileSync(IMAGE_PATH).toString('base64')
  } catch {
    console.error('MISSING FIXTURE: ' + IMAGE_PATH)
    process.exit(1)
  }
  console.log(`Image fixture : ${IMAGE_PATH} (${imageBase64.length} base64 chars)`)
  console.log(`Model         : ${MODEL}`)
  console.log(`Runs          : ${RUNS} (sequential)\n`)

  const ai = new GoogleGenAI({ apiKey })
  const rows: RunRow[] = []

  for (let run = 1; run <= RUNS; run++) {
    const parts = [
      { text: SYSTEM_PROMPT },
      { inlineData: { mimeType: IMAGE_MIME, data: imageBase64 } },
    ]
    const t0 = performance.now()
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts }],
        config: GEN_CONFIG,
      })
      const ms = performance.now() - t0
      const text = response.text ?? ''
      const usage = response.usageMetadata
      let jsonOk = false, usedFallback = false, shapeOk = false, shapeReason = 'parse failed'
      let titles: string[] = []
      if (text) {
        try {
          const { parsed, usedFallback: uf } = parseGeminiText(text)
          jsonOk = true; usedFallback = uf
          const v = isValidShape(parsed)
          shapeOk = v.ok; shapeReason = v.ok ? 'ok' : v.reason
          titles = Array.isArray(parsed.recipes) ? parsed.recipes.map((r) => r?.title ?? '(none)') : []
        } catch (e) {
          shapeReason = 'JSON.parse failed: ' + (e as Error).message
        }
      } else {
        shapeReason = 'empty response text'
      }
      const normTitles = titles.map(norm)
      const dupWithinRun = new Set(normTitles).size !== normTitles.length
      rows.push({
        run, ms, jsonOk, usedFallback, shapeOk, shapeReason, titles, dupWithinRun,
        promptTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
        totalTokens: usage?.totalTokenCount ?? 0,
      })
      console.log(`run ${String(run).padStart(2)}: ${ms.toFixed(0).padStart(6)} ms | json=${jsonOk?'Y':'N'} fb=${usedFallback?'Y':'N'} shape=${shapeOk?'Y':'N'} | ${titles.join(' | ') || shapeReason}`)
    } catch (e) {
      const ms = performance.now() - t0
      rows.push({
        run, ms, jsonOk: false, usedFallback: false, shapeOk: false,
        shapeReason: 'request error', titles: [], dupWithinRun: false,
        promptTokens: 0, outputTokens: 0, totalTokens: 0, error: (e as Error).message,
      })
      console.log(`run ${String(run).padStart(2)}: ${ms.toFixed(0).padStart(6)} ms | REQUEST ERROR: ${(e as Error).message}`)
    }
  }

  // ---- Summary ----
  const valid = rows.filter((r) => r.jsonOk && r.shapeOk)
  const successRate = (valid.length / rows.length) * 100
  const lat = rows.map((r) => r.ms).sort((a, b) => a - b)
  const medianLat = percentile(lat, 50)
  const p95Lat = percentile(lat, 95)

  // Distinctness within each valid run
  const withinDupRuns = rows.filter((r) => r.shapeOk && r.dupWithinRun).map((r) => r.run)
  // Distinctness across runs: how many unique titles overall vs total
  const allTitles = valid.flatMap((r) => r.titles.map(norm))
  const uniqueTitles = new Set(allTitles)
  // cross-run repeats: titles that appear in more than one run
  const titleCounts = new Map<string, number>()
  for (const t of allTitles) titleCounts.set(t, (titleCounts.get(t) ?? 0) + 1)
  const repeated = [...titleCounts.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1])

  const totPrompt = rows.reduce((s, r) => s + r.promptTokens, 0)
  const totOutput = rows.reduce((s, r) => s + r.outputTokens, 0)
  const totTokens = rows.reduce((s, r) => s + r.totalTokens, 0)

  console.log('\n============================================================')
  console.log('Full results table')
  console.log('============================================================')
  console.log('run |   ms  | json | fb | shape | within-dup | titles')
  for (const r of rows) {
    console.log(
      `${String(r.run).padStart(3)} | ${r.ms.toFixed(0).padStart(5)} |  ${r.jsonOk?'Y':'N'}   |  ${r.usedFallback?'Y':'N'} |   ${r.shapeOk?'Y':'N'}   |     ${r.dupWithinRun?'Y':'N'}      | ${r.titles.join(' / ') || r.shapeReason}`,
    )
  }

  console.log('\n============================================================')
  console.log('Summary')
  console.log('============================================================')
  console.log(`Runs                         : ${rows.length}`)
  console.log(`Valid (JSON + shape)         : ${valid.length}`)
  console.log(`Success rate                 : ${successRate.toFixed(2)} %`)
  console.log(`JSON.parse succeeded         : ${rows.filter(r=>r.jsonOk).length}/${rows.length} (code-fence fallback used: ${rows.filter(r=>r.usedFallback).length})`)
  console.log(`Shape valid {ingredients[], 3 recipes w/ title+content} : ${rows.filter(r=>r.shapeOk).length}/${rows.length}`)
  console.log(`Median round-trip latency    : ${medianLat.toFixed(0)} ms`)
  console.log(`p95 round-trip latency       : ${p95Lat.toFixed(0)} ms`)
  console.log(`min / max latency            : ${lat[0].toFixed(0)} / ${lat[lat.length-1].toFixed(0)} ms`)
  console.log('')
  console.log(`Distinctness — within-run duplicates : ${withinDupRuns.length ? 'runs ' + withinDupRuns.join(', ') : 'none (all valid runs had 3 distinct titles)'}`)
  console.log(`Distinctness — across runs : ${uniqueTitles.size} unique titles out of ${allTitles.length} total across valid runs`)
  if (repeated.length) {
    console.log('  titles appearing in multiple runs:')
    for (const [t, c] of repeated) console.log(`    ${c}x  "${t}"`)
  } else {
    console.log('  no title repeated across runs')
  }
  console.log('')
  console.log(`Token usage (summed)         : prompt=${totPrompt}, output=${totOutput}, total=${totTokens}`)
  // Cost estimate — gemini-2.5-flash published rates (USD per 1M tokens).
  // ASSUMED RATES (flag in report): input $0.30 / 1M, output $2.50 / 1M.
  const inRate = 0.30, outRate = 2.50
  const cost = (totPrompt / 1e6) * inRate + (totOutput / 1e6) * outRate
  console.log(`Est. cost (ASSUMED $${inRate}/1M in, $${outRate}/1M out) : $${cost.toFixed(5)}`)
  console.log('  NOTE: image is billed as input tokens (already included in promptTokenCount).')
  console.log('============================================================')
}

main().catch((e) => { console.error(e); process.exit(1) })
