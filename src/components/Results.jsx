import { findLatestStats, findComparables } from '../utils/nameData'
import NameSection from './NameSection'

export default function Results({ query, girlsData, boysData, byYearGirls, byYearBoys }) {
  const { name, birthYear } = query
  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  const latestYear = Math.max(...girlsData.years)

  const girlStats = findLatestStats(normalized, girlsData.data, latestYear)
  const boyStats = findLatestStats(normalized, boysData.data, latestYear)

  const girlComparables = girlStats
    ? findComparables(girlStats.pct, birthYear, byYearGirls, normalized)
    : []
  const boyComparables = boyStats
    ? findComparables(boyStats.pct, birthYear, byYearBoys, normalized)
    : []

  if (!girlStats && !boyStats) {
    return (
      <div className="results">
        <p className="not-found">
          "{normalized}" wasn't found in the top 1000 names in recent years.
        </p>
      </div>
    )
  }

  return (
    <div className="results">
      {girlStats && (
        <NameSection
          name={normalized}
          gender="F"
          stats={girlStats}
          latestYear={latestYear}
          nameData={girlsData.data[normalized]}
          allNameData={girlsData.data}
          comparables={girlComparables}
          birthYear={birthYear}
          allYears={girlsData.years}
        />
      )}
      {boyStats && (
        <NameSection
          name={normalized}
          gender="M"
          stats={boyStats}
          latestYear={latestYear}
          nameData={boysData.data[normalized]}
          allNameData={boysData.data}
          comparables={boyComparables}
          birthYear={birthYear}
          allYears={boysData.years}
        />
      )}
    </div>
  )
}
