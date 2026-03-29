'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'
import { Eye, Heart, Share2, Bookmark, MessageCircle } from 'lucide-react'

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
  engagement_rate: number
}

type SortKey = 'views' | 'likes' | 'shares' | 'engagement_rate'

interface TopPostsGridProps {
  posts: Post[]
}

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export function TopPostsGrid({ posts }: TopPostsGridProps) {
  const [sortBy, setSortBy] = useState<SortKey>('views')

  const sorted = [...posts].sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <Card className="border border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Top Performing Posts</CardTitle>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="views">Sort: Views</SelectItem>
            <SelectItem value="likes">Sort: Likes</SelectItem>
            <SelectItem value="shares">Sort: Shares</SelectItem>
            <SelectItem value="engagement_rate">Sort: Engagement</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {sorted.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No posts yet. Run the sync to pull data.
            </div>
          )}
          {sorted.map((post, i) => (
            <div key={post.post_id} className="flex items-center gap-4 px-6 py-3 hover:bg-accent/30 transition-colors">
              <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">{i + 1}</span>
              <div className="relative h-12 w-20 shrink-0 rounded overflow-hidden bg-muted">
                {post.thumbnail_url ? (
                  <Image
                    src={post.thumbnail_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{post.title || '(no caption)'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-4 ${post.platform === 'instagram' ? 'border-pink-500/50 text-pink-400' : 'border-red-500/50 text-red-400'}`}
                  >
                    {post.platform === 'instagram' ? 'IG' : 'YT'}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {format(parseISO(post.published_at), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNum(post.views)}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNum(post.likes)}</span>
                <span className="flex items-center gap-1 hidden sm:flex"><MessageCircle className="h-3 w-3" />{formatNum(post.comments)}</span>
                <span className="flex items-center gap-1 hidden md:flex"><Share2 className="h-3 w-3" />{formatNum(post.shares)}</span>
                <span className="flex items-center gap-1 hidden md:flex"><Bookmark className="h-3 w-3" />{formatNum(post.saves)}</span>
                <span className="font-medium text-primary">{post.engagement_rate.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
