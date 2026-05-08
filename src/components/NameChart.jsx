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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-year">{label}</p>
      <p className="tooltip-pct">{payload[0].value?.toFixed(2)}%</p>
    </div>
  )
}

export default function NameChart({ name, data, birthYear, gender }) {
  const color = COLORS[gender] || COLORS.F
  const hasData = data.some(d => d.pct !== null)
  if (!hasData) return null

  const yMax = Math.max(...data.filter(d => d.pct !== null).map(d => d.pct))

  return (
    <div className="name-chart">
      <h3 className="chart-title">Popularity of {name} over time</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#AAA' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: 11, fill: '#AAA' }}
            tickLine={false}
            axisLine={false}
            width={38}
            domain={[0, yMax * 1.15]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ccc' }} />
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
