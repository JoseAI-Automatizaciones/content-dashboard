'use client'

import { useState, useMemo } from 'react'
import { subDays, parseISO, isAfter } from 'date-fns'
import { KPICard } from './KPICard'
import { ViewsReachChart } from './ViewsReachChart'
import { EngagementChart } from './EngagementChart'
import { TopPostsGrid } from './TopPostsGrid'
import { PlatformFilter, TimeRangeFilter, Platform, TimeRange } from './Filters'
import { Eye, Radio, TrendingUp, Users, Share2, Bookmark } from 'lucide-react'

interface Post {
  post_id: string
  platform: 'instagram' | 'youtube'
  title: string
  thumbnail_url: string
  published_at: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  engagement_rate: number
}

interface DashboardClientProps {
  posts: Post[]
}

function calcChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function DashboardClient({ posts }: DashboardClientProps) {
  const [platform, setPlatform] = useState<Platform>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  const days = parseInt(timeRange)

  const filtered = useMemo(() => {
    const cutoff = subDays(new Date(), days)
    return posts.filter(p => {
      const matchPlatform = platform === 'all' || p.platform === platform
      const matchTime = isAfter(parseISO(p.published_at), cutoff)
      return matchPlatform && matchTime
    })
  }, [posts, platform, days])

  const previous = useMemo(() => {
    const cutoffNow = subDays(new Date(), days)
    const cutoffPrev = subDays(new Date(), days * 2)
    return posts.filter(p => {
      const matchPlatform = platform === 'all' || p.platform === platform
      const d = parseISO(p.published_at)
      return matchPlatform && isAfter(d, cutoffPrev) && !isAfter(d, cutoffNow)
    })
  }, [posts, platform, days])

  const sum = (arr: Post[], key: keyof Post) =>
    arr.reduce((s, p) => s + (p[key] as number), 0)

  const avg = (arr: Post[], key: keyof Post) =>
    arr.length > 0 ? sum(arr, key) / arr.length : 0

  // Current period totals
  const curViews = sum(filtered, 'views')
  const curReach = sum(filtered, 'reach')
  const curEngagement = avg(filtered, 'engagement_rate')
  const curShares = sum(filtered, 'shares')
  const curSaves = sum(filtered, 'saves')

  // Previous period totals
  const prevViews = sum(previous, 'views')
  const prevReach = sum(previous, 'reach')
  const prevEngagement = avg(previous, 'engagement_rate')
  const prevShares = sum(previous, 'shares')
  const prevSaves = sum(previous, 'saves')

  // Group by date for charts
  const byDate = useMemo(() => {
    const map: Record<string, { views: number; reach: number; likes: number; comments: number; shares: number; saves: number }> = {}
    for (const p of filtered) {
      const date = p.published_at.split('T')[0]
      if (!map[date]) map[date] = { views: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
      map[date].views += p.views
      map[date].reach += p.reach
      map[date].likes += p.likes
      map[date].comments += p.comments
      map[date].shares += p.shares
      map[date].saves += p.saves
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }))
  }, [filtered])

  const viewsSparkline = byDate.map(d => ({ value: d.views }))
  const reachSparkline = byDate.map(d => ({ value: d.reach }))
  const engagementSparkline = byDate.map(d => ({ value: d.views > 0 ? (d.likes + d.comments + d.shares + d.saves) / d.views * 100 : 0 }))
  const sharesSparkline = byDate.map(d => ({ value: d.shares }))
  const savesSparkline = byDate.map(d => ({ value: d.saves }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} posts · {platform === 'all' ? 'All platforms' : platform}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PlatformFilter value={platform} onChange={setPlatform} />
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          title="Views"
          value={curViews}
          change={calcChange(curViews, prevViews)}
          sparklineData={viewsSparkline}
          icon={<Eye className="h-4 w-4" />}
        />
        <KPICard
          title="Reach"
          value={curReach}
          change={calcChange(curReach, prevReach)}
          sparklineData={reachSparkline}
          icon={<Radio className="h-4 w-4" />}
        />
        <KPICard
          title="Engagement"
          value={curEngagement}
          change={calcChange(curEngagement, prevEngagement)}
          sparklineData={engagementSparkline}
          icon={<TrendingUp className="h-4 w-4" />}
          format="percent"
        />
        <KPICard
          title="Posts"
          value={filtered.length}
          change={calcChange(filtered.length, previous.length)}
          sparklineData={[{ value: filtered.length }]}
          icon={<Users className="h-4 w-4" />}
          format="number"
        />
        <KPICard
          title="Shares"
          value={curShares}
          change={calcChange(curShares, prevShares)}
          sparklineData={sharesSparkline}
          icon={<Share2 className="h-4 w-4" />}
        />
        <KPICard
          title="Saves"
          value={curSaves}
          change={calcChange(curSaves, prevSaves)}
          sparklineData={savesSparkline}
          icon={<Bookmark className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ViewsReachChart data={byDate} />
        <EngagementChart data={byDate} />
      </div>

      {/* Top Posts */}
      <TopPostsGrid posts={filtered} />
    </div>
  )
}
