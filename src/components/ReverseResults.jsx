import { findStatsInYear, findComparables } from '../utils/nameData'
import NameSection from './NameSection'

export default function ReverseResults({ query, girlsData, boysData, byYearGirls, byYearBoys }) {
  const { name, birthYear } = query
  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  const latestYear = Math.max(...girlsData.years)

  const girlStats = findStatsInYear(normalized, girlsData.data, birthYear)
  const boyStats = findStatsInYear(normalized, boysData.data, birthYear)

  const sections = []
  if (girlStats) sections.push({
    tableDescription: `Names this popular today`,
    gender: 'F',
    stats: girlStats,
    nameData: girlsData.data[normalized],
    allNameData: girlsData.data,
    comparables: findComparables(girlStats.pct, latestYear, byYearGirls, normalized),
    allYears: girlsData.years,
  })
  if (boyStats) sections.push({
    tableDescription: `Names this popular today`,
    gender: 'M',
    stats: boyStats,
    nameData: boysData.data[normalized],
    allNameData: boysData.data,
    comparables: findComparables(boyStats.pct, latestYear, byYearBoys, normalized),
    allYears: boysData.years,
  })

  sections.sort((a, b) => b.stats.pct - a.stats.pct)

  if (sections.length === 0) {
    return (
      <div className="results">
        <p className="not-found">
          "{normalized}" wasn't in the top 1,000 names in {birthYear}.
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
          latestYear={latestYear}
          nameData={s.nameData}
          allNameData={s.allNameData}
          comparables={s.comparables}
          tableDescription={s.tableDescription}
          birthYear={birthYear}
          comparisonYear={latestYear}
          allYears={s.allYears}
        />
      ))}
    </div>
  )
}
