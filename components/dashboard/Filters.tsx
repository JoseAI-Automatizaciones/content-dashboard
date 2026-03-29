'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type Platform = 'all' | 'instagram' | 'youtube'
export type TimeRange = '7d' | '14d' | '30d' | '90d'

interface PlatformFilterProps {
  value: Platform
  onChange: (v: Platform) => void
}

interface TimeRangeFilterProps {
  value: TimeRange
  onChange: (v: TimeRange) => void
}

export function PlatformFilter({ value, onChange }: PlatformFilterProps) {
  const options: { label: string; value: Platform }[] = [
    { label: 'All', value: 'all' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'YouTube', value: 'youtube' },
  ]

  return (
    <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1">
      {options.map(opt => (
        <Button
          key={opt.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-7 px-3 text-xs font-medium rounded-md transition-all',
            value === opt.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  const options: { label: string; value: TimeRange }[] = [
    { label: '7d', value: '7d' },
    { label: '14d', value: '14d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
  ]

  return (
    <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1">
      {options.map(opt => (
        <Button
          key={opt.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-7 px-3 text-xs font-medium rounded-md transition-all',
            value === opt.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
