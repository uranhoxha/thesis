export type Command =
  | { kind: 'start-timer' }
  | { kind: 'stop-timer' }
  | { kind: 'reset-timer' }
  | { kind: 'set-timer'; ms: number; label: string }
  | { kind: 'set-timer-mode'; mode: 'stopwatch' | 'countdown' }
  | { kind: 'add-buy-item'; title: string }
  | { kind: 'remove-buy-item'; title: string }
  | { kind: 'check-buy-item'; title: string; checked: boolean }
  | { kind: 'list-buy-items' }
  | { kind: 'voice-off' }
  | { kind: 'unrecognized'; raw: string }

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
  forty: 40,
  forty5: 45,
  sixty: 60,
}

function parseNumber(token: string): number | null {
  if (/^\d+$/.test(token)) return parseInt(token, 10)
  const cleaned = token.replace(/[^a-z]/g, '')
  return cleaned in NUMBER_WORDS ? NUMBER_WORDS[cleaned] : null
}

export function parseCommand(raw: string): Command {
  const t = raw
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .trim()

  if (/(stop listening|voice off|turn off voice|disable voice)/.test(t)) {
    return { kind: 'voice-off' }
  }

  const timerSpec = parseTimerDuration(t)
  if (timerSpec) {
    return { kind: 'set-timer', ms: timerSpec.ms, label: timerSpec.label }
  }

  if (/^(start|begin|go)(\s+(the\s+)?timer)?$/.test(t)) {
    return { kind: 'start-timer' }
  }

  if (/^(pause|stop|hold)(\s+(the\s+)?timer)?$/.test(t)) {
    return { kind: 'stop-timer' }
  }

  if (/^reset(\s+(the\s+)?timer)?$/.test(t)) {
    return { kind: 'reset-timer' }
  }

  if (
    /^(switch\s+to\s+|use\s+|change\s+to\s+)?countdown(\s+mode|\s+timer)?$/.test(
      t,
    )
  ) {
    return { kind: 'set-timer-mode', mode: 'countdown' }
  }

  if (
    /^(switch\s+to\s+|use\s+|change\s+to\s+)?stopwatch(\s+mode)?$/.test(t)
  ) {
    return { kind: 'set-timer-mode', mode: 'stopwatch' }
  }

  const uncheckMatch = t.match(
    /^(?:uncheck|unmark|untick)\s+(?:off\s+)?(.+?)(?:\s+(?:on|from|in)\s+(?:my|the)?\s*(?:buy|shopping)?\s*list)?$/,
  )
  if (uncheckMatch) {
    return {
      kind: 'check-buy-item',
      title: cleanTitle(uncheckMatch[1]),
      checked: false,
    }
  }

  const checkMatch = t.match(
    /^(?:check|mark|tick)\s+(?:off\s+)?(.+?)(?:\s+as\s+(?:done|complete|completed))?(?:\s+(?:on|from|in)\s+(?:my|the)?\s*(?:buy|shopping)?\s*list)?$/,
  )
  if (checkMatch) {
    return {
      kind: 'check-buy-item',
      title: cleanTitle(checkMatch[1]),
      checked: true,
    }
  }

  if (
    /^(what'?s|what is)\s+on\s+(my|the)\s+(buy|shopping)?\s*list$/.test(t) ||
    /^read\s+(my|the)\s+(buy|shopping)?\s*list$/.test(t)
  ) {
    return { kind: 'list-buy-items' }
  }

  const addMatch = t.match(
    /^(?:add|put)\s+(.+?)\s+(?:to|on)\s+(?:my|the)?\s*(?:buy|shopping)?\s*list$/,
  )
  if (addMatch) {
    return { kind: 'add-buy-item', title: cleanTitle(addMatch[1]) }
  }

  const removeMatch = t.match(
    /^(?:remove|delete|take)\s+(.+?)\s+(?:from|off)\s+(?:my|the)?\s*(?:buy|shopping)?\s*list$/,
  )
  if (removeMatch) {
    return { kind: 'remove-buy-item', title: cleanTitle(removeMatch[1]) }
  }

  return { kind: 'unrecognized', raw }
}

function cleanTitle(s: string): string {
  return s
    .replace(/^(some|a|an|the)\s+/, '')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

const HOUR_UNIT = /^(h|hr|hrs|hour|hours)$/
const MIN_UNIT = /^(m|min|mins|minute|minutes)$/
const SEC_UNIT = /^(s|sec|secs|second|seconds)$/

const TIMER_PHRASE = new RegExp(
  // optional leading verb + article + "timer for/of"
  '^(?:(?:set|start|begin|make)\\s+)?(?:a\\s+|an\\s+)?(?:timer\\s+(?:for|of)\\s+)?' +
    // one or more "<number> <unit>" pairs, optionally separated by "and" / commas
    '((?:\\d+|\\w+)\\s*(?:hours?|hrs?|minutes?|mins?|seconds?|secs?)' +
    '(?:\\s*(?:and\\s+|,\\s*)?(?:\\d+|\\w+)\\s*(?:hours?|hrs?|minutes?|mins?|seconds?|secs?))*)' +
    // optional trailing "timer"
    '\\s*(?:timer)?$',
)

const PART_RE =
  /(\d+|[a-z]+)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/g

function parseTimerDuration(
  t: string,
): { ms: number; label: string } | null {
  if (!TIMER_PHRASE.test(t)) return null
  let ms = 0
  const parts: string[] = []
  for (const m of t.matchAll(PART_RE)) {
    const n = parseNumber(m[1])
    if (n === null || n <= 0) continue
    const unit = m[2]
    if (HOUR_UNIT.test(unit)) {
      ms += n * 3_600_000
      parts.push(`${n} hour${n === 1 ? '' : 's'}`)
    } else if (MIN_UNIT.test(unit)) {
      ms += n * 60_000
      parts.push(`${n} minute${n === 1 ? '' : 's'}`)
    } else if (SEC_UNIT.test(unit)) {
      ms += n * 1000
      parts.push(`${n} second${n === 1 ? '' : 's'}`)
    }
  }
  if (ms === 0) return null
  return { ms, label: parts.join(' ') }
}
