export function buildByYear(nameData) {
  if (!nameData) return {};
  const byYear = {};
  for (const [name, yearData] of Object.entries(nameData)) {
    for (const [year, [rank, count, pct]] of Object.entries(yearData)) {
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push({ name, rank, count, pct });
    }
  }
  return byYear;
}

// Find the most recent year the name appeared, going back from latestYear
export function findLatestStats(name, nameData, latestYear) {
  if (!nameData || !nameData[name]) return null;
  const yearData = nameData[name];
  for (let y = latestYear; y >= latestYear - 50; y--) {
    const entry = yearData[String(y)];
    if (entry) {
      const [rank, count, pct] = entry;
      return { year: y, rank, count, pct, isLatest: y === latestYear };
    }
  }
  return null;
}

// Look up a name's stats for a specific year (used for reverse lookup)
export function findStatsInYear(name, nameData, year) {
  const entry = nameData?.[name]?.[String(year)]
  if (!entry) return null
  const [rank, count, pct] = entry
  return { year, rank, count, pct, isLatest: true }
}

function interpolateNulls(values) {
  const result = [...values]
  let first = -1, last = -1
  for (let i = 0; i < result.length; i++) {
    if (result[i] !== null) { if (first === -1) first = i; last = i }
  }
  if (first === -1) return result.map(() => 0)
  for (let i = 0; i < first; i++) result[i] = result[first]
  for (let i = last + 1; i < result.length; i++) result[i] = result[last]
  for (let i = first; i <= last; i++) {
    if (result[i] === null) {
      let j = i + 1
      while (j <= last && result[j] === null) j++
      const startVal = result[i - 1], endVal = result[j], steps = j - (i - 1)
      for (let k = i; k < j; k++) result[k] = startVal + (endVal - startVal) * (k - (i - 1)) / steps
    }
  }
  return result
}

export function findSimilarTrajectory(targetYearData, refYear, allNameData, compareYear, excludeName, windowSize = 15, maxOffset = 5, limit = 5) {
  const targetRaw = []
  for (let i = windowSize - 1; i >= 0; i--) {
    const entry = targetYearData?.[String(refYear - i)]
    targetRaw.push(entry ? entry[2] : null)
  }
  if (targetRaw.filter(v => v !== null).length < Math.ceil(windowSize * 0.6)) return []

  const targetFilled = interpolateNulls(targetRaw)
  const targetMean = targetFilled.reduce((a, b) => a + b, 0) / windowSize
  if (targetMean === 0) return []
  const targetNorm = targetFilled.map(v => v / targetMean)

  const results = []
  for (const [name, yearData] of Object.entries(allNameData)) {
    if (name === excludeName) continue
    let bestScore = -1, bestMatchYear = compareYear, bestMatchPct = null

    for (let offset = -maxOffset; offset <= maxOffset; offset++) {
      const anchorYear = compareYear + offset
      const candidateRaw = []
      for (let i = windowSize - 1; i >= 0; i--) {
        const entry = yearData?.[String(anchorYear - i)]
        candidateRaw.push(entry ? entry[2] : null)
      }
      if (candidateRaw.filter(v => v !== null).length < Math.ceil(windowSize * 0.6)) continue

      const candidateNorm = interpolateNulls(candidateRaw).map(v => v / targetMean)
      let sumSq = 0
      for (let i = 0; i < windowSize; i++) sumSq += (targetNorm[i] - candidateNorm[i]) ** 2
      const score = 1 / (1 + Math.sqrt(sumSq / windowSize))

      if (score > bestScore) {
        bestScore = score
        bestMatchYear = anchorYear
        bestMatchPct = yearData[String(anchorYear)]?.[2] ?? null
      }
    }
    if (bestScore >= 0) results.push({ name, matchYear: bestMatchYear, score: bestScore, pct: bestMatchPct })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

export function findBestAnalogues(targetYearData, refYear, allNameData, excludeName, windowSize = 15, maxAnchor = 2015, limit = 15) {
  const targetRaw = []
  for (let i = windowSize - 1; i >= 0; i--) {
    const entry = targetYearData?.[String(refYear - i)]
    targetRaw.push(entry ? entry[2] : null)
  }
  if (targetRaw.filter(v => v !== null).length < Math.ceil(windowSize * 0.6)) return []

  const targetFilled = interpolateNulls(targetRaw)
  const targetMean = targetFilled.reduce((a, b) => a + b, 0) / windowSize
  if (targetMean === 0) return []
  const targetNorm = targetFilled.map(v => v / targetMean)
  const minRequired = Math.ceil(windowSize * 0.6)

  const results = []
  for (const [name, yearData] of Object.entries(allNameData)) {
    if (name === excludeName) continue
    let bestScore = -1, bestMatchYear = 0, bestMatchPct = null

    for (let anchorYear = 1940; anchorYear <= maxAnchor; anchorYear++) {
      const candidateRaw = []
      let nonNull = 0
      for (let i = windowSize - 1; i >= 0; i--) {
        const entry = yearData?.[String(anchorYear - i)]
        const v = entry ? entry[2] : null
        candidateRaw.push(v)
        if (v !== null) nonNull++
      }
      if (nonNull < minRequired) continue

      const candidateNorm = interpolateNulls(candidateRaw).map(v => v / targetMean)
      let sumSq = 0
      for (let i = 0; i < windowSize; i++) sumSq += (targetNorm[i] - candidateNorm[i]) ** 2
      const score = 1 / (1 + Math.sqrt(sumSq / windowSize))

      if (score > bestScore) {
        bestScore = score
        bestMatchYear = anchorYear
        bestMatchPct = yearData[String(anchorYear)]?.[2] ?? null
      }
    }
    if (bestScore >= 0) results.push({ name, matchYear: bestMatchYear, score: bestScore, pct: bestMatchPct })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

export function computePrediction(targetYearData, refYear, allNameData, matches, horizonYears = 10) {
  const baseTargetPct = targetYearData?.[String(refYear)]?.[2]
  if (!baseTargetPct || !matches?.length) return null

  const predictions = []
  for (let k = 1; k <= horizonYears; k++) {
    let weightedSum = 0, totalWeight = 0
    for (const match of matches) {
      const anchorPct = allNameData[match.name]?.[String(match.matchYear)]?.[2]
      if (!anchorPct) continue
      const futurePct = allNameData[match.name]?.[String(match.matchYear + k)]?.[2]
      if (futurePct === undefined) continue
      weightedSum += (futurePct / anchorPct) * match.score
      totalWeight += match.score
    }
    predictions.push({
      year: refYear + k,
      pct: totalWeight > 0 ? baseTargetPct * (weightedSum / totalWeight) : null,
    })
  }
  return predictions
}

export function findComparables(targetPct, birthYear, byYear, excludeName, limit = 5) {
  const names = byYear[String(birthYear)];
  if (!names) return [];
  return [...names]
    .filter(n => n.name !== excludeName)
    .sort((a, b) => Math.abs(a.pct - targetPct) - Math.abs(b.pct - targetPct))
    .slice(0, limit);
}
