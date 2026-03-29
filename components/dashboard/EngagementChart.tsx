'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface DataPoint {
  date: string
  likes: number
  comments: number
  shares: number
  saves: number
}

interface EngagementChartProps {
  data: DataPoint[]
}

function formatYAxis(value: number) {
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

export function EngagementChart({ data }: EngagementChartProps) {
  const formatted = data.map(d => ({
    ...d,
    label: format(parseISO(d.date), 'dd MMM'),
  }))

  return (
    <Card className="border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground">Engagement Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={formatted} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [Number(value ?? 0).toLocaleString()]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }} />
            <Bar dataKey="likes" name="Likes" fill="#6366f1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="comments" name="Comments" fill="#2dd4bf" radius={[3, 3, 0, 0]} />
            <Bar dataKey="shares" name="Shares" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="saves" name="Saves" fill="#ec4899" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
