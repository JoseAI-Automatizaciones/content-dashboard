'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  change: number // percentage change vs previous period
  sparklineData: { value: number }[]
  icon?: React.ReactNode
  format?: 'number' | 'percent' | 'compact'
}

function formatValue(value: string | number, format: string) {
  if (typeof value === 'string') return value
  if (format === 'percent') return `${value.toFixed(2)}%`
  if (format === 'compact') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
  }
  return value.toLocaleString()
}

export function KPICard({ title, value, change, sparklineData, icon, format = 'compact' }: KPICardProps) {
  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <Card className="relative overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-2xl font-bold tracking-tight">
          {formatValue(value, format)}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {isNeutral ? (
            <Minus className="h-3 w-3 text-muted-foreground" />
          ) : isPositive ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-400" />
          )}
          <span className={`text-xs font-medium ${isNeutral ? 'text-muted-foreground' : isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isNeutral ? '—' : `${isPositive ? '+' : ''}${change.toFixed(1)}%`}
          </span>
          <span className="text-xs text-muted-foreground">vs período anterior</span>
        </div>
        {sparklineData.length > 1 && (
          <div className="h-10 mt-2 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? '#34d399' : isNeutral ? '#6366f1' : '#f87171'}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
