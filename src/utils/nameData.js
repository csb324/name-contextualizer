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

export function findComparables(targetPct, birthYear, byYear, excludeName, limit = 5) {
  const names = byYear[String(birthYear)];
  if (!names) return [];
  return [...names]
    .filter(n => n.name !== excludeName)
    .sort((a, b) => Math.abs(a.pct - targetPct) - Math.abs(b.pct - targetPct))
    .slice(0, limit);
}
