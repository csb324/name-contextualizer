import Sparkline from './Sparkline'

const GENDER_LABEL = { F: 'girl', M: 'boy' }

export default function ComparisonTable({ tableDescription, comparables, comparisonYear, markerYear, allYears, allNameData, gender, onNameClick, hideHeading }) {
  return (
    <div className="comparison">
      {!hideHeading && <h3>{tableDescription}</h3>}
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>% in {comparisonYear}</th>
            <th>Popularity over time</th>
          </tr>
        </thead>
        <tbody>
          {comparables.map(comp => {
            const sparkData = allYears.map(y => ({
              year: y,
              pct: allNameData?.[comp.name]?.[String(y)]?.[2] ?? null,
            }))
            return (
              <tr key={comp.name}>
                <td className="comp-name">
                  {onNameClick
                    ? <button className="comp-name-btn" onClick={() => onNameClick(comp.name)}>{comp.name}</button>
                    : comp.name}
                </td>
                <td className="comp-pct">{comp.pct.toFixed(2)}%</td>
                <td className="comp-spark">
                  <Sparkline data={sparkData} gender={gender} birthYear={markerYear} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
