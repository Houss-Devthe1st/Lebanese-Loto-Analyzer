import {
  getFrequency,
  getGapSinceLastAppearance,
} from './statsCalculator'

function pickWeighted(pool, weights) {
  const total = pool.reduce((s, n) => s + weights[n], 0)
  let r = Math.random() * total
  for (const n of pool) {
    r -= weights[n]
    if (r <= 0) return n
  }
  return pool[pool.length - 1]
}

function pickSix(pool, weights) {
  const chosen = []
  let remaining = [...pool]
  while (chosen.length < 6 && remaining.length > 0) {
    const pick = pickWeighted(remaining, weights)
    chosen.push(pick)
    remaining = remaining.filter(n => n !== pick)
  }
  return chosen.sort((a, b) => a - b)
}

function pickAdditional(excluded) {
  const pool = []
  for (let n = 1; n <= 42; n++) {
    if (!excluded.includes(n)) pool.push(n)
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export function generateRandom() {
  const pool = Array.from({ length: 42 }, (_, i) => i + 1)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const numbers = pool.slice(0, 6).sort((a, b) => a - b)
  const additional = pickAdditional(numbers)
  return { numbers, additional }
}

export function generateFrequencyWeighted(draws) {
  const freq = getFrequency(draws)
  const weights = {}
  for (let n = 1; n <= 42; n++) weights[n] = (freq.get(n) ?? 0) + 1
  const pool = Array.from({ length: 42 }, (_, i) => i + 1)
  const numbers = pickSix(pool, weights)
  const additional = pickAdditional(numbers)
  return { numbers, additional }
}

export function generateGapWeighted(draws) {
  const gaps = getGapSinceLastAppearance(draws)
  const weights = {}
  for (let n = 1; n <= 42; n++) weights[n] = (gaps.get(n) ?? 0) + 1
  const pool = Array.from({ length: 42 }, (_, i) => i + 1)
  const numbers = pickSix(pool, weights)
  const additional = pickAdditional(numbers)
  return { numbers, additional }
}

export function generateBalanced() {
  const MAX_TRIES = 1000
  for (let i = 0; i < MAX_TRIES; i++) {
    const { numbers } = generateRandom()
    const oddCount = numbers.filter(n => n % 2 !== 0).length
    const lowCount = numbers.filter(n => n <= 21).length
    const sum = numbers.reduce((a, b) => a + b, 0)
    if (oddCount >= 2 && oddCount <= 4 && lowCount >= 2 && lowCount <= 4 && sum >= 100 && sum <= 180) {
      const additional = pickAdditional(numbers)
      return { numbers, additional }
    }
  }
  return generateRandom()
}

export function generateWithPinnedNumbers(draws, pinned) {
  const validPinned = [...new Set(pinned.filter(n => n >= 1 && n <= 42))].slice(0, 5)
  const freq = getFrequency(draws)
  const weights = {}
  for (let n = 1; n <= 42; n++) weights[n] = (freq.get(n) ?? 0) + 1

  const pool = Array.from({ length: 42 }, (_, i) => i + 1).filter(
    n => !validPinned.includes(n)
  )
  const needed = 6 - validPinned.length
  const filled = pickSix(pool, weights).slice(0, needed)
  const numbers = [...validPinned, ...filled].sort((a, b) => a - b)
  const additional = pickAdditional(numbers)
  return { numbers, additional }
}
