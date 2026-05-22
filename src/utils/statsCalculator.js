export function getFrequency(draws) {
  const freq = new Map()
  for (let n = 1; n <= 42; n++) freq.set(n, 0)
  for (const draw of draws) {
    for (const n of draw.numbers) {
      freq.set(n, (freq.get(n) ?? 0) + 1)
    }
  }
  return freq
}

export function getHotNumbers(draws, topN = 10) {
  const freq = getFrequency(draws)
  return [...freq.entries()]
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
}

export function getColdNumbers(draws, topN = 10) {
  const freq = getFrequency(draws)
  return [...freq.entries()]
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => a.count - b.count)
    .slice(0, topN)
}

export function getGapSinceLastAppearance(draws) {
  const sorted = [...draws].sort(
    (a, b) => new Date(b.drawDate) - new Date(a.drawDate)
  )
  const gaps = new Map()
  for (let n = 1; n <= 42; n++) {
    let found = false
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].numbers.includes(n)) {
        gaps.set(n, i)
        found = true
        break
      }
    }
    if (!found) gaps.set(n, sorted.length)
  }
  return gaps
}

export function getPairFrequency(draws) {
  const pairs = new Map()
  for (const draw of draws) {
    const nums = draw.numbers
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${nums[i]}-${nums[j]}`
        pairs.set(key, (pairs.get(key) ?? 0) + 1)
      }
    }
  }
  return new Map(
    [...pairs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
  )
}

export function getOddEvenRatio(draws) {
  const buckets = new Array(7).fill(0)
  for (const draw of draws) {
    const evenCount = draw.numbers.filter(n => n % 2 === 0).length
    buckets[evenCount]++
  }
  return {
    labels: ['0E/6O', '1E/5O', '2E/4O', '3E/3O', '4E/2O', '5E/1O', '6E/0O'],
    counts: buckets,
  }
}

export function getLowHighRatio(draws) {
  const buckets = new Array(7).fill(0)
  for (const draw of draws) {
    const highCount = draw.numbers.filter(n => n >= 22).length
    buckets[highCount]++
  }
  return {
    labels: ['0H/6L', '1H/5L', '2H/4L', '3H/3L', '4H/2L', '5H/1L', '6H/0L'],
    counts: buckets,
  }
}

export function getSumDistribution(draws) {
  const BIN_SIZE = 20
  const MIN_SUM = 21
  const MAX_SUM = 237
  const numBins = Math.ceil((MAX_SUM - MIN_SUM) / BIN_SIZE) + 1
  const counts = new Array(numBins).fill(0)
  const labels = []

  for (let i = 0; i < numBins; i++) {
    const lo = MIN_SUM + i * BIN_SIZE
    const hi = Math.min(lo + BIN_SIZE - 1, MAX_SUM)
    labels.push(`${lo}-${hi}`)
  }

  for (const draw of draws) {
    const sum = draw.numbers.reduce((a, b) => a + b, 0)
    const idx = Math.floor((sum - MIN_SUM) / BIN_SIZE)
    if (idx >= 0 && idx < numBins) counts[idx]++
  }

  const totalSum = draws.reduce(
    (acc, d) => acc + d.numbers.reduce((a, b) => a + b, 0),
    0
  )
  const avgSum = draws.length > 0 ? Math.round(totalSum / draws.length) : 0

  return { labels, counts, avgSum }
}

export function getAdditionalFrequency(draws) {
  const freq = new Map()
  for (let n = 1; n <= 42; n++) freq.set(n, 0)
  for (const draw of draws) {
    freq.set(draw.additional, (freq.get(draw.additional) ?? 0) + 1)
  }
  return [...freq.entries()]
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => a.number - b.number)
}
