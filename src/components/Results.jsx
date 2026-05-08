import { findStatsInYear, findComparables } from '../utils/nameData'
import NameSection from './NameSection'

const MODERN_CUTOFF = 1975

export default function Results({ query, girlsData, boysData, byYearGirls, byYearBoys, onNameClick }) {
  const { name, refYear, compareYear } = query
  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()

  const showFullRange = refYear <= MODERN_CUTOFF || compareYear <= MODERN_CUTOFF
  const displayYears = showFullRange
    ? girlsData.years
    : girlsData.years.filter(y => y >= MODERN_CUTOFF)

  const girlStats = findStatsInYear(normalized, girlsData.data, refYear)
  const boyStats = findStatsInYear(normalized, boysData.data, refYear)

  const sections = []
  if (girlStats) sections.push({
    gender: 'F',
    stats: girlStats,
    nameData: girlsData.data[normalized],
    allNameData: girlsData.data,
    comparables: findComparables(girlStats.pct, compareYear, byYearGirls, normalized),
    tableDescription: `Names this popular in ${compareYear}`,
  })
  if (boyStats) sections.push({
    gender: 'M',
    stats: boyStats,
    nameData: boysData.data[normalized],
    allNameData: boysData.data,
    comparables: findComparables(boyStats.pct, compareYear, byYearBoys, normalized),
    tableDescription: `Names this popular in ${compareYear}`,
  })
  sections.sort((a, b) => b.stats.pct - a.stats.pct)

  if (sections.length === 0) {
    return (
      <div className="results">
        <p className="not-found">
          "{normalized}" wasn't in the top 1,000 names in {refYear}.
        </p>
      </div>
    )
  }

  return (
    <div className={`results${sections.length === 2 ? ' two-up' : ''}`}>
      {sections.map(s => (
        <NameSection
          key={s.gender}
          name={normalized}
          gender={s.gender}
          stats={s.stats}
          nameData={s.nameData}
          allNameData={s.allNameData}
          comparables={s.comparables}
          tableDescription={s.tableDescription}
          birthYear={refYear}
          chartMarkerYear={refYear}
          sparklineMarkerYear={compareYear}
          comparisonYear={compareYear}
          allYears={displayYears}
          onNameClick={onNameClick}
        />
      ))}
    </div>
  )
}
