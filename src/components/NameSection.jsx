import { useState } from 'react'
import NameChart from './NameChart'
import ComparisonTable from './ComparisonTable'
import TrajectoryTable from './TrajectoryTable'

const GENDER_LABEL = { F: 'girl', M: 'boy' }
const GENDER_CLASS = { F: 'girls', M: 'boys' }

export default function NameSection({
  name,
  gender,
  stats,
  nameData,
  allNameData,
  comparables,
  trajectoryMatches,
  predictionData,
  tableDescription,
  birthYear,
  chartMarkerYear,
  sparklineMarkerYear,
  comparisonYear,
  allYears,
  onNameClick,
}) {
  const [activeTab, setActiveTab] = useState('common')
  const [trendingTooltip, setTrendingTooltip] = useState(false)
  const label = GENDER_LABEL[gender]
  const cls = GENDER_CLASS[gender]
  const effectiveYear = comparisonYear ?? birthYear
  const hasTrending = trajectoryMatches?.length > 0

  const chartData = allYears.map(y => ({
    year: y,
    pct: nameData?.[String(y)]?.[2] ?? null,
  }))

  return (
    <section className={`name-section ${cls}`}>
      <h2 className="section-title">
        {name} <span className="gender-badge">{label}</span>
      </h2>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-label">Rank in {stats.year}</span>
          <span className="stat-value">#{stats.rank}</span>
        </div>
        <div className="stat">
          <span className="stat-label">% of {label} babies</span>
          <span className="stat-value">{stats.pct.toFixed(2)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Births in {stats.year}</span>
          <span className="stat-value">{stats.count.toLocaleString()}</span>
        </div>
        {!stats.isLatest && (
          <p className="stat-note">Last in top 1,000 in {stats.year}</p>
        )}
      </div>

      <NameChart
        name={name}
        data={chartData}
        birthYear={chartMarkerYear ?? birthYear}
        gender={gender}
        predictionData={predictionData}
      />

      {comparables.length > 0 ? (
        <>
          <div className="tab-buttons">
            <button
              className={`tab-btn${activeTab === 'common' ? ' active' : ''}`}
              onClick={() => setActiveTab('common')}
            >
              Similarly Common in {effectiveYear}
            </button>
            {hasTrending ? (
              <button
                className={`tab-btn${activeTab === 'trending' ? ' active' : ''}`}
                onClick={() => setActiveTab('trending')}
              >
                Similarly Trending in {effectiveYear}
              </button>
            ) : (
              <span
                className="tab-btn-wrapper"
                onMouseEnter={() => setTrendingTooltip(true)}
                onMouseLeave={() => setTrendingTooltip(false)}
                onClick={() => setTrendingTooltip(v => !v)}
              >
                <button className="tab-btn" disabled>
                  Similarly Trending in {effectiveYear}
                </button>
                {trendingTooltip && (
                  <div className="tab-tooltip">
                    Not enough data to find similarly trending names
                  </div>
                )}
              </span>
            )}
          </div>
          {activeTab === 'common' && (
            <ComparisonTable
              tableDescription={tableDescription}
              comparables={comparables}
              comparisonYear={effectiveYear}
              markerYear={sparklineMarkerYear ?? birthYear}
              allYears={allYears}
              allNameData={allNameData}
              gender={gender}
              onNameClick={onNameClick}
              hideHeading
            />
          )}
          {activeTab === 'trending' && hasTrending && (
            <TrajectoryTable
              compareYear={effectiveYear}
              matches={trajectoryMatches}
              allYears={allYears}
              allNameData={allNameData}
              gender={gender}
              onNameClick={onNameClick}
              hideHeading
            />
          )}
        </>
      ) : (
        <p className="no-comparables">
          No comparable {label} names found in {birthYear}.
        </p>
      )}
    </section>
  )
}
