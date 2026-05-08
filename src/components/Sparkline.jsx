const COLORS = { F: '#C96B85', M: '#4A86B8' }

export default function Sparkline({ data, gender = 'F', width = 88, height = 28, birthYear }) {
  const values = data.filter(d => d.pct !== null).map(d => d.pct)
  if (values.length < 2) return <svg width={width} height={height} />

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 0.01
  const color = COLORS[gender] || COLORS.F
  const PAD = 2

  const allPoints = data.map((d, i) => {
    if (d.pct === null) return null
    const x = (i / (data.length - 1)) * width
    const y = height - PAD - ((d.pct - min) / range) * (height - PAD * 2)
    return { x, y }
  })

  // Split into continuous segments around nulls
  const segments = []
  let seg = []
  for (const pt of allPoints) {
    if (pt === null) {
      if (seg.length > 1) segments.push(seg)
      seg = []
    } else {
      seg.push(pt)
    }
  }
  if (seg.length > 1) segments.push(seg)

  const birthYearIndex = birthYear != null ? data.findIndex(d => d.year === birthYear) : -1
  const markerX = birthYearIndex !== -1
    ? (birthYearIndex / (data.length - 1)) * width
    : null

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {markerX !== null && (
        <line
          x1={markerX.toFixed(1)}
          y1={0}
          x2={markerX.toFixed(1)}
          y2={height}
          stroke="#CCC"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      )}
      {segments.map((s, i) => (
        <polyline
          key={i}
          points={s.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
