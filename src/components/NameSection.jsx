import NameChart from './NameChart'
import ComparisonTable from './ComparisonTable'

const GENDER_LABEL = { F: 'girl', M: 'boy' }
const GENDER_CLASS = { F: 'girls', M: 'boys' }

export default function NameSection({
  name,
  gender,
  stats,
  nameData,
  allNameData,
  comparables,
  tableDescription,
  birthYear,
  comparisonYear,
  allYears,
  onNameClick,
}) {
  const label = GENDER_LABEL[gender]
  const cls = GENDER_CLASS[gender]

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
        birthYear={birthYear}
        gender={gender}
      />

      {comparables.length > 0 ? (
        <ComparisonTable
          tableDescription={tableDescription}
          comparables={comparables}
          comparisonYear={comparisonYear ?? birthYear}
          markerYear={birthYear}
          allYears={allYears}
          allNameData={allNameData}
          gender={gender}
          onNameClick={onNameClick}
        />
      ) : (
        <p className="no-comparables">
          No comparable {label} names found in {birthYear}.
        </p>
      )}
    </section>
  )
}
