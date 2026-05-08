import { findLatestStats, findComparables } from '../utils/nameData'
import NameSection from './NameSection'

export default function Results({ query, girlsData, boysData, byYearGirls, byYearBoys, onNameClick }) {
  const { name, birthYear } = query
  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  const latestYear = Math.max(...girlsData.years)

  const girlStats = findLatestStats(normalized, girlsData.data, latestYear)
  const boyStats = findLatestStats(normalized, boysData.data, latestYear)

  const sections = []
  if (girlStats) sections.push({
    gender: 'F',
    stats: girlStats,
    nameData: girlsData.data[normalized],
    allNameData: girlsData.data,
    comparables: findComparables(girlStats.pct, birthYear, byYearGirls, normalized),
    tableDescription: `Names that were this popular in ${birthYear}`,
    allYears: girlsData.years,
  })
  if (boyStats) sections.push({
    gender: 'M',
    stats: boyStats,
    nameData: boysData.data[normalized],
    allNameData: boysData.data,
    comparables: findComparables(boyStats.pct, birthYear, byYearBoys, normalized),
    tableDescription: `Names that were this popular in ${birthYear}`,
    allYears: boysData.years,
  })
  sections.sort((a, b) => b.stats.pct - a.stats.pct)

  if (sections.length === 0) {
    return (
      <div className="results">
        <p className="not-found">
          "{normalized}" wasn't found in the top 1,000 names in recent years.
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
          allYears={s.allYears}
          onNameClick={onNameClick}
        />
      ))}
    </div>
  )
}
