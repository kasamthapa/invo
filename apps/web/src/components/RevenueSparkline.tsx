import type { DailySales } from '../types/dashboard'

interface SparklineProps {
  data: DailySales[]
  height?: number
}

export default function RevenueSparkline({ data, height = 48 }: SparklineProps) {
  const width = 280
  const barCount = data.length
  const gap = 4
  const barWidth = (width - gap * (barCount - 1)) / barCount
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const minBarHeight = 2

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      {data.map((day, i) => {
        const barHeight = Math.max(minBarHeight, (day.revenue / maxRevenue) * height)
        const x = i * (barWidth + gap)
        const y = height - barHeight
        const isToday = i === data.length - 1
        return (
          <rect
            key={day.date}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx="2"
            fill={isToday ? '#10b981' : '#52525b'}
          />
        )
      })}
    </svg>
  )
}
