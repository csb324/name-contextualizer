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

// Finds names that had a similar popularity trajectory to the target name around a specific
// comparison year (±maxOffset years). Used for the "Similarly Trending" display table — the
// compareYear is chosen by the user for cultural context ("this name feels like the 1990s"),
// so we deliberately stay close to that year rather than searching the whole dataset.
//
// Similarity is measured by RMS distance after normalizing both windows by the TARGET's mean
// popularity — so a name at 0.1% won't match a name at 1.0% even if their shapes are identical.
// Score = 1 / (1 + RMS_distance), ranging from 0 (no match) to 1 (perfect match).
export function findSimilarTrajectory(targetYearData, refYear, allNameData, compareYear, excludeName, windowSize = 15, maxOffset = 5, limit = 5) {
  // Build the target's trailing window: windowSize years of popularity % ending at refYear.
  // Null means the name wasn't in the top 1000 that year.
  const targetRaw = []
  for (let i = windowSize - 1; i >= 0; i--) {
    const entry = targetYearData?.[String(refYear - i)]
    targetRaw.push(entry ? entry[2] : null)
  }
  // Require at least 60% of the window to have real data — otherwise the target itself
  // is too obscure to find meaningful matches.
  if (targetRaw.filter(v => v !== null).length < Math.ceil(windowSize * 0.6)) return []

  const targetFilled = interpolateNulls(targetRaw)
  // The mean popularity becomes our shared scale reference. Dividing both windows by this
  // number means we compare shape AND relative magnitude — a name twice as popular will
  // have values twice as large and score worse, not just look like a different shape.
  const targetMean = targetFilled.reduce((a, b) => a + b, 0) / windowSize
  if (targetMean === 0) return []
  const targetNorm = targetFilled.map(v => v / targetMean)

  const results = []
  for (const [name, yearData] of Object.entries(allNameData)) {
    if (name === excludeName) continue
    let bestScore = -1, bestMatchYear = compareYear, bestMatchPct = null

    // Try each year within ±maxOffset of compareYear and keep the best-scoring one.
    // This allows a small amount of temporal wiggle — "Ashley in 1990" can match if
    // compareYear is 1992 and it scores better than "Ashley in 1992" exactly.
    for (let offset = -maxOffset; offset <= maxOffset; offset++) {
      const anchorYear = compareYear + offset
      const candidateRaw = []
      for (let i = windowSize - 1; i >= 0; i--) {
        const entry = yearData?.[String(anchorYear - i)]
        candidateRaw.push(entry ? entry[2] : null)
      }
      if (candidateRaw.filter(v => v !== null).length < Math.ceil(windowSize * 0.6)) continue

      // Normalize candidate by the TARGET's mean, not its own — this preserves the
      // magnitude comparison described above.
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

// Like findSimilarTrajectory, but searches the ENTIRE historical dataset (1940–maxAnchor)
// instead of staying near a user-chosen comparison year. Used exclusively for prediction —
// the goal here is finding the best historical analogues regardless of era, not for
// cultural context. maxAnchor defaults to 2015 so every analogue has at least 10 years
// of real future data available for computePrediction to use.
//
// For each name in the dataset, we try every possible anchor year and keep only the
// single best-scoring year for that name. So the output is still one entry per name,
// just with its historically optimal match point rather than one near compareYear.
export function findBestAnalogues(targetYearData, refYear, allNameData, excludeName, windowSize = 10, maxAnchor = 2015, limit = 15) {
  // Same window + normalization setup as findSimilarTrajectory.
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

    // Sweep every year from 1940 to maxAnchor. Most iterations fail the coverage check
    // quickly (name wasn't in the top 1000 that window), so this is faster than it looks.
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

      // Keep only this name's single best anchor year.
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

// Uses the analogues from findBestAnalogues to project the target name's popularity
// forward by horizonYears. The core idea: for each analogue, look at how its popularity
// changed in the years after its match point (e.g. if Lauren matched at 1983, look at
// Lauren 1984, 1985, ... as ratios of Lauren 1983). Average those ratios across all
// analogues, weighted by each analogue's similarity score, then apply the averaged ratio
// to the target's current popularity to get a predicted value.
//
// If an analogue has no data for a given future year (it dropped out of the top 1000),
// that analogue simply doesn't contribute to that year's weighted average — it doesn't
// get treated as zero, which would unfairly drag predictions down.
//
// Capped at 5 years based on MAPE testing: predictions degrade sharply after year 4-5,
// and the COVID disruption (2020+) made years 6-10 essentially noise.
export function computePrediction(targetYearData, refYear, allNameData, matches, horizonYears = 5) {
  const baseTargetPct = targetYearData?.[String(refYear)]?.[2]
  if (!baseTargetPct || !matches?.length) return null

  const predictions = []
  console.log(targetYearData);
  // predictions.push({ year: refYear, pct: allNameData[]?.[String(refYear)]?.[2]});
  for (let k = 0; k <= horizonYears; k++) {
    let weightedSum = 0, totalWeight = 0
    for (const match of matches) {
      const anchorPct = allNameData[match.name]?.[String(match.matchYear)]?.[2]
      if (!anchorPct) continue
      const futurePct = allNameData[match.name]?.[String(match.matchYear + k)]?.[2]
      // Skip this analogue for this year if it has no data — don't assume zero.
      if (futurePct === undefined) continue
      // ratio = how much the analogue changed k years after its match point
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
