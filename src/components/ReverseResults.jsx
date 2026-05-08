import { findStatsInYear, findComparables } from '../utils/nameData'
import NameSection from './NameSection'

export default function ReverseResults({ query, girlsData, boysData, byYearGirls, byYearBoys }) {
  const { name, birthYear } = query
  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  const latestYear = Math.max(...girlsData.years)

  const girlStats = findStatsInYear(normalized, girlsData.data, birthYear)
  const boyStats = findStatsInYear(normalized, boysData.data, birthYear)

  const girlComparables = girlStats
    ? findComparables(girlStats.pct, latestYear, byYearGirls, normalized)
    : []
  const boyComparables = boyStats
    ? findComparables(boyStats.pct, latestYear, byYearBoys, normalized)
    : []

  if (!girlStats && !boyStats) {
    return (
      <div className="results">
        <p className="not-found">
          "{normalized}" wasn't in the top 1,000 names in {birthYear}.
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
          comparisonYear={latestYear}
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
          comparisonYear={latestYear}
          allYears={boysData.years}
        />
      )}
    </div>
  )
}
