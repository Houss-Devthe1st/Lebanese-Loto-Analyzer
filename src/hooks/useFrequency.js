import { useMemo } from 'react'
import {
  getFrequency,
  getHotNumbers,
  getColdNumbers,
  getGapSinceLastAppearance,
  getPairFrequency,
  getOddEvenRatio,
  getLowHighRatio,
  getSumDistribution,
  getAdditionalFrequency,
} from '../utils/statsCalculator'

export function useFrequency(draws) {
  return useMemo(() => {
    if (!draws || draws.length === 0) {
      return {
        frequency: new Map(),
        hotNumbers: [],
        coldNumbers: [],
        gaps: new Map(),
        pairFrequency: new Map(),
        oddEvenRatio: { labels: [], counts: [] },
        lowHighRatio: { labels: [], counts: [] },
        sumDistribution: { labels: [], counts: [], avgSum: 0 },
        additionalFrequency: [],
      }
    }
    return {
      frequency: getFrequency(draws),
      hotNumbers: getHotNumbers(draws, 10),
      coldNumbers: getColdNumbers(draws, 10),
      gaps: getGapSinceLastAppearance(draws),
      pairFrequency: getPairFrequency(draws),
      oddEvenRatio: getOddEvenRatio(draws),
      lowHighRatio: getLowHighRatio(draws),
      sumDistribution: getSumDistribution(draws),
      additionalFrequency: getAdditionalFrequency(draws),
    }
  }, [draws])
}
