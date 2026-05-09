import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { findBestAnalogues, computePrediction } from '../src/utils/nameData.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const girlsData = JSON.parse(readFileSync(join(root, 'public/data/girls.json'), 'utf8'))
const boysData = JSON.parse(readFileSync(join(root, 'public/data/boys.json'), 'utf8'))

const REF_YEAR = 2015
const N_NAMES = 25
const WINDOW_SIZES = [5, 10, 15, 20, 25]

// Seeded PRNG (mulberry32) — same seed as window.runPredictionEval so both pick the same names.
const rand = (() => {
  let s = 0xDEADBEEF
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = Math.imul(s ^ s >>> 15, s | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
})()

const results = []

for (const [gender, data] of [['F', girlsData.data], ['M', boysData.data]]) {
  const top500 = Object.entries(data).filter(([, yd]) => yd['2015']?.[0] <= 500)
  const picked = [...top500].sort(() => rand() - 0.5).slice(0, N_NAMES)

  for (let i = 0; i < picked.length; i++) {
    const [name, yearData] = picked[i]
    process.stderr.write(`[${gender}] ${i + 1}/${N_NAMES}: ${name}\n`)

    for (const windowSize of WINDOW_SIZES) {
      const analogues = findBestAnalogues(yearData, REF_YEAR, data, name, windowSize)
      const preds = computePrediction(yearData, REF_YEAR, data, analogues)
      if (!preds) continue

      for (const { year, pct } of preds) {
        const actual = yearData[String(year)]?.[2]
        if (actual == null || pct == null) continue
        results.push({ gender, windowSize, year, actual, predicted: pct })
      }
    }
  }
}

const mape = pts =>
  pts.reduce((acc, r) => acc + Math.abs(r.predicted - r.actual) / r.actual * 100, 0) / pts.length

const years = [...new Set(results.map(r => r.year))].sort()
const rows = [`year,${WINDOW_SIZES.join(',')}`]

for (const year of years) {
  const cols = WINDOW_SIZES.map(w =>
    mape(results.filter(r => r.year === year && r.windowSize === w)).toFixed(1)
  )
  rows.push(`${year},${cols.join(',')}`)
}

rows.push(`overall,${WINDOW_SIZES.map(w => mape(results.filter(r => r.windowSize === w)).toFixed(1)).join(',')}`)

console.log(rows.join('\n'))
