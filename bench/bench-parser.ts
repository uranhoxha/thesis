/**
 * Benchmark 1 — Voice intent parser (latency + accuracy)
 *
 * Runs the production parser `parseCommand` from
 * features/voice/lib/parse-command.ts against a hand-curated, hand-labelled
 * test set covering every intent the parser supports, plus deliberately
 * awkward phrasings (extra words, reordering, typos) to probe robustness.
 *
 * Run with:  node_modules/.bin/tsx bench/bench-parser.ts
 *
 * The source parser is NOT modified by this script.
 */

import { parseCommand, type Command } from '../features/voice/lib/parse-command'

/**
 * Normalise a Command into a single "intent" string so that semantically
 * distinct sub-intents are compared correctly:
 *   - set-timer-mode -> mode-countdown / mode-stopwatch
 *   - check-buy-item -> check-on (checked) / check-off (unchecked)
 * Payload fields (title text, ms value) are intentionally ignored — we only
 * grade whether the parser routed the utterance to the right intent.
 */
function intentOf(c: Command): string {
  switch (c.kind) {
    case 'set-timer-mode':
      return `mode-${c.mode}`
    case 'check-buy-item':
      return c.checked ? 'check-on' : 'check-off'
    default:
      return c.kind
  }
}

interface Case {
  utterance: string
  expected: string // normalised intent (see intentOf)
  note?: string // why it's interesting (awkward/typo/etc.)
}

// Expected labels reflect the user's *intended* intent. For clean inputs this
// equals what the parser logic produces; for the awkward/typo inputs it is the
// intent a robust parser *should* return — so genuine robustness failures show
// up honestly as mismatches rather than being labelled away.
const CASES: Case[] = [
  // ---- start-timer ----
  { utterance: 'start', expected: 'start-timer' },
  { utterance: 'begin', expected: 'start-timer' },
  { utterance: 'go', expected: 'start-timer' },
  { utterance: 'start the timer', expected: 'start-timer' },
  { utterance: 'begin timer', expected: 'start-timer' },

  // ---- stop-timer (pause) ----
  { utterance: 'pause', expected: 'stop-timer' },
  { utterance: 'stop', expected: 'stop-timer' },
  { utterance: 'hold', expected: 'stop-timer' },
  { utterance: 'stop the timer', expected: 'stop-timer' },
  { utterance: 'pause timer', expected: 'stop-timer' },

  // ---- reset-timer ----
  { utterance: 'reset', expected: 'reset-timer' },
  { utterance: 'reset timer', expected: 'reset-timer' },
  { utterance: 'reset the timer', expected: 'reset-timer' },

  // ---- set-timer (duration parsing) ----
  { utterance: 'set a timer for 5 minutes', expected: 'set-timer' },
  { utterance: '10 minutes', expected: 'set-timer' },
  { utterance: 'set timer for 1 hour 30 minutes', expected: 'set-timer' },
  { utterance: 'start a 5 minute timer', expected: 'set-timer' },
  { utterance: '2 minutes and 30 seconds', expected: 'set-timer' },
  { utterance: 'set a timer for five minutes', expected: 'set-timer', note: 'word-number "five"' },
  { utterance: '45 seconds', expected: 'set-timer' },

  // ---- set-timer-mode: countdown ----
  { utterance: 'countdown', expected: 'mode-countdown' },
  { utterance: 'switch to countdown', expected: 'mode-countdown' },
  { utterance: 'use countdown', expected: 'mode-countdown' },
  { utterance: 'change to countdown timer', expected: 'mode-countdown' },

  // ---- set-timer-mode: stopwatch ----
  { utterance: 'stopwatch', expected: 'mode-stopwatch' },
  { utterance: 'switch to stopwatch', expected: 'mode-stopwatch' },
  { utterance: 'stopwatch mode', expected: 'mode-stopwatch' },

  // ---- add-buy-item ----
  { utterance: 'add milk to my list', expected: 'add-buy-item' },
  { utterance: 'put eggs on the shopping list', expected: 'add-buy-item' },
  { utterance: 'add some butter to the list', expected: 'add-buy-item' },
  { utterance: 'add organic bananas to my shopping list', expected: 'add-buy-item' },
  { utterance: 'add milk and eggs to my list', expected: 'add-buy-item', note: 'compound title' },

  // ---- remove-buy-item ----
  { utterance: 'remove milk from my list', expected: 'remove-buy-item' },
  { utterance: 'delete eggs from the shopping list', expected: 'remove-buy-item' },
  { utterance: 'take butter off the list', expected: 'remove-buy-item' },
  { utterance: 'remove the eggs from my list', expected: 'remove-buy-item', note: 'leading article' },

  // ---- check-buy-item (mark done) ----
  { utterance: 'check off milk', expected: 'check-on' },
  { utterance: 'mark eggs as done', expected: 'check-on' },
  { utterance: 'tick butter', expected: 'check-on' },
  { utterance: 'check bread off my list', expected: 'check-on' },

  // ---- check-buy-item (uncheck) ----
  { utterance: 'uncheck milk', expected: 'check-off' },
  { utterance: 'unmark eggs', expected: 'check-off' },

  // ---- list-buy-items ----
  { utterance: "what's on my list", expected: 'list-buy-items' },
  { utterance: 'what is on the shopping list', expected: 'list-buy-items' },
  { utterance: 'read my buy list', expected: 'list-buy-items' },

  // ---- voice-off ----
  { utterance: 'stop listening', expected: 'voice-off' },
  { utterance: 'voice off', expected: 'voice-off' },
  { utterance: 'turn off voice', expected: 'voice-off' },
  { utterance: 'disable voice', expected: 'voice-off' },

  // ---- genuine non-commands (should be unrecognized) ----
  { utterance: "what's the weather today", expected: 'unrecognized' },
  { utterance: 'play some music', expected: 'unrecognized' },

  // ---- awkward / typo robustness (intended intent labelled) ----
  { utterance: 'give me a timer for 3 minutes', expected: 'set-timer', note: 'verb "give" not in parser whitelist' },
  { utterance: 'pause the timer please', expected: 'stop-timer', note: 'trailing "please"' },
  { utterance: 'set a timer for ten minutes', expected: 'set-timer', note: 'word-number "ten"' },
  { utterance: 'ad milk to my list', expected: 'add-buy-item', note: 'typo "ad"' },
  { utterance: 'timer 90 seconds', expected: 'set-timer', note: 'no "for"/"of" after "timer"' },
]

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return NaN
  // Nearest-rank method.
  const rank = Math.ceil((p / 100) * sortedAsc.length)
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, rank - 1))
  return sortedAsc[idx]
}

const f3 = (n: number) => n.toFixed(3)

function main() {
  // --- Cold start: very first parser call after module load ---
  const coldUtterance = CASES[0].utterance
  const c0 = performance.now()
  const coldResult = parseCommand(coldUtterance)
  const c1 = performance.now()
  const coldMs = c1 - c0
  void coldResult

  // --- Steady-state: time each case individually ---
  interface Row {
    utterance: string
    expected: string
    got: string
    ok: boolean
    ms: number
    note?: string
  }
  const rows: Row[] = []
  for (const c of CASES) {
    const t0 = performance.now()
    const result = parseCommand(c.utterance)
    const t1 = performance.now()
    const got = intentOf(result)
    rows.push({
      utterance: c.utterance,
      expected: c.expected,
      got,
      ok: got === c.expected,
      ms: t1 - t0,
      note: c.note,
    })
  }

  const total = rows.length
  const correct = rows.filter((r) => r.ok).length
  const accuracy = (correct / total) * 100

  const latencies = rows.map((r) => r.ms).sort((a, b) => a - b)
  const median = percentile(latencies, 50)
  const p95 = percentile(latencies, 95)
  const max = latencies[latencies.length - 1]

  console.log('============================================================')
  console.log('Benchmark 1 — Voice intent parser (parseCommand)')
  console.log('Source: features/voice/lib/parse-command.ts (unmodified)')
  console.log('============================================================\n')

  console.log('Per-utterance results:')
  console.log(
    '  ' +
      'OK'.padEnd(4) +
      'expected'.padEnd(16) +
      'got'.padEnd(16) +
      'ms'.padStart(8) +
      '  utterance',
  )
  for (const r of rows) {
    console.log(
      '  ' +
        (r.ok ? 'PASS' : 'FAIL').padEnd(4) +
        r.expected.padEnd(16) +
        r.got.padEnd(16) +
        f3(r.ms).padStart(8) +
        '  ' +
        JSON.stringify(r.utterance) +
        (r.note ? `  [${r.note}]` : ''),
    )
  }

  const mismatches = rows.filter((r) => !r.ok)
  console.log('\n------------------------------------------------------------')
  console.log('Mismatches (' + mismatches.length + '):')
  if (mismatches.length === 0) {
    console.log('  (none)')
  } else {
    for (const m of mismatches) {
      console.log(
        `  - ${JSON.stringify(m.utterance)}\n` +
          `      expected: ${m.expected}\n` +
          `      got:      ${m.got}\n` +
          `      reason:   ${m.note ?? 'see parser logic'}`,
      )
    }
  }

  console.log('\n------------------------------------------------------------')
  console.log('Summary')
  console.log('------------------------------------------------------------')
  console.log(`  Test-set size            : ${total}`)
  console.log(`  Correct                  : ${correct}`)
  console.log(`  Accuracy                 : ${accuracy.toFixed(2)} %`)
  console.log(`  Cold-start latency (ms)  : ${f3(coldMs)}   [utterance: ${JSON.stringify(coldUtterance)}]`)
  console.log(`  Steady-state median (ms) : ${f3(median)}`)
  console.log(`  Steady-state p95 (ms)    : ${f3(p95)}`)
  console.log(`  Steady-state max (ms)    : ${f3(max)}`)
  console.log(`  Steady-state min (ms)    : ${f3(latencies[0])}`)
  console.log('============================================================')
}

main()
