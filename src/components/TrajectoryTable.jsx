import Sparkline from './Sparkline'

export default function TrajectoryTable({ compareYear, matches, allYears, allNameData, gender, onNameClick, hideHeading }) {
  return (
    <div className="comparison">
      {!hideHeading && <h3>Names on a similar trajectory in {compareYear}</h3>}
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Popularity</th>
            <th>Trend over time</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(match => {
            const sparkData = allYears.map(y => ({
              year: y,
              pct: allNameData?.[match.name]?.[String(y)]?.[2] ?? null,
            }))
            return (
              <tr key={match.name}>
                <td className="comp-name">
                  {onNameClick
                    ? <button className="comp-name-btn" onClick={() => onNameClick(match.name)}>{match.name}</button>
                    : match.name}
                </td>
                <td className="comp-pct">
                  {match.pct != null ? `${match.pct.toFixed(2)}%` : '—'}
                  {(match.matchYear !== compareYear || match.matchYear === allYears.at(-1)) && (
                    <span className="match-year"> ({match.matchYear})</span>
                  )}
                </td>
                <td className="comp-spark">
                  <Sparkline data={sparkData} gender={gender} birthYear={match.matchYear} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
