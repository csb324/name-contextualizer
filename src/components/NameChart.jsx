import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const COLORS = { F: '#ed625d', M: '#099fb7' }
const PREDICTION_COLORS = { F: '#f5b5b0', M: '#6cc8d8' }

function CustomTooltip({ active, payload, label, predictionColor }) {
  if (!active || !payload?.length) return null
  const real = payload.find(p => p.dataKey === 'pct')
  const pred = payload.find(p => p.dataKey === 'predicted')
  return (
    <div className="chart-tooltip">
      <p className="tooltip-year">{label}</p>
      {real?.value != null && <p className="tooltip-pct">{real.value.toFixed(2)}%</p>}
      {pred?.value != null && (
        <p className="tooltip-pct" style={{ color: predictionColor }}>
          {pred.value.toFixed(2)}% predicted
        </p>
      )}
    </div>
  )
}

export default function NameChart({ name, data, birthYear, gender, predictionData }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const color = COLORS[gender] || COLORS.F
  const predColor = PREDICTION_COLORS[gender] || PREDICTION_COLORS.F
  const hasData = data.some(d => d.pct !== null)
  if (!hasData) return null

  const mergedData = useMemo(() => {
    if (!predictionData?.length) return data
    const dataMap = new Map(data.map(d => [d.year, { ...d }]))
    for (const pd of predictionData) {
      if (!dataMap.has(pd.year)) dataMap.set(pd.year, { year: pd.year, pct: null })
    }
    const predMap = new Map(predictionData.map(p => [p.year, p.pct]))
    return [...dataMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => ({ ...v, predicted: predMap.get(v.year) ?? null }))
  }, [data, predictionData])

  const allPcts = [
    ...mergedData.filter(d => d.pct !== null).map(d => d.pct),
    ...mergedData.filter(d => d.predicted != null).map(d => d.predicted),
  ]
  const yMax = Math.max(...allPcts)
  const isMobile = windowWidth < 640
  const xInterval = mergedData.length > 60 ? (isMobile ? 19 : 9) : (isMobile ? 9 : 4)

  return (
    <div className="name-chart">
      <h3 className="chart-title">
        Popularity of {name} over time
        {predictionData?.length > 0 && (
          <span className="chart-prediction-legend" style={{ color: predColor }}>
            {' '}· · predicted
          </span>
        )}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={mergedData} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#AAA' }}
            tickLine={false}
            axisLine={false}
            interval={xInterval}
          />
          <YAxis
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: 11, fill: '#AAA' }}
            tickLine={false}
            axisLine={false}
            width={38}
            domain={[0, yMax * 1.15]}
          />
          <Tooltip content={<CustomTooltip predictionColor={predColor} />} cursor={{ stroke: '#ccc' }} />
          {birthYear && (
            <ReferenceLine
              x={birthYear}
              stroke="#CCC"
              strokeDasharray="4 3"
              label={{
                value: `'${String(birthYear).slice(2)}`,
                position: 'insideTopRight',
                fontSize: 10,
                fill: '#BBB',
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="pct"
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          {predictionData?.length > 0 && (
            <Line
              type="monotone"
              dataKey="predicted"
              stroke={predColor}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
