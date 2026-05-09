import { useMemo } from 'react'
import { findStatsInYear, findComparables, findSimilarTrajectory, findBestAnalogues, computePrediction } from '../utils/nameData'
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

  const sections = useMemo(() => {
    const result = []

    if (girlStats) {
      const girlNameData = girlsData.data[normalized]
      const girlTrajectoryMatches = findSimilarTrajectory(girlNameData, refYear, girlsData.data, compareYear, normalized, 15, 5, 5)
      const girlAnalogues = findBestAnalogues(girlNameData, refYear, girlsData.data, normalized)
      result.push({
        gender: 'F',
        stats: girlStats,
        nameData: girlNameData,
        allNameData: girlsData.data,
        comparables: findComparables(girlStats.pct, compareYear, byYearGirls, normalized),
        trajectoryMatches: girlTrajectoryMatches,
        predictionData: computePrediction(girlNameData, refYear, girlsData.data, girlAnalogues),
        tableDescription: `Names this popular in ${compareYear}`,
      })
    }
    if (boyStats) {
      const boyNameData = boysData.data[normalized]
      const boyTrajectoryMatches = findSimilarTrajectory(boyNameData, refYear, boysData.data, compareYear, normalized, 15, 5, 5)
      const boyAnalogues = findBestAnalogues(boyNameData, refYear, boysData.data, normalized)
      result.push({
        gender: 'M',
        stats: boyStats,
        nameData: boyNameData,
        allNameData: boysData.data,
        comparables: findComparables(boyStats.pct, compareYear, byYearBoys, normalized),
        trajectoryMatches: boyTrajectoryMatches,
        predictionData: computePrediction(boyNameData, refYear, boysData.data, boyAnalogues),
        tableDescription: `Names this popular in ${compareYear}`,
      })
    }
    return result.sort((a, b) => b.stats.pct - a.stats.pct)
  }, [normalized, refYear, compareYear, girlsData, boysData, byYearGirls, byYearBoys])

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
          trajectoryMatches={s.trajectoryMatches}
          predictionData={s.predictionData}
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
