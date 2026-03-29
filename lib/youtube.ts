interface YouTubeVideo {
  post_id: string
  platform: 'youtube'
  title: string
  thumbnail_url: string
  published_at: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  watch_time_minutes: number
  engagement_rate: number
}

export async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY!

  // Get channel ID first
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=id,statistics&mine=true&key=${apiKey}`
  )

  let channelId: string | null = null
  let channelData = await channelRes.json()

  // If mine=true fails (API key doesn't support it), try to get from env
  if (!channelData.items?.[0]) {
    const channelEnv = process.env.YOUTUBE_CHANNEL_ID
    if (channelEnv) {
      channelId = channelEnv
    } else {
      // Try fetching own channel via search
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key=${apiKey}`
      )
      const searchData = await searchRes.json()
      channelId = searchData.items?.[0]?.id
    }
  } else {
    channelId = channelData.items[0].id
  }

  if (!channelId) {
    console.error('No YouTube channel ID found. Set YOUTUBE_CHANNEL_ID in env.')
    return []
  }

  // Get uploads playlist
  const channelInfoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
  )
  const channelInfo = await channelInfoRes.json()
  const uploadsPlaylistId = channelInfo.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

  if (!uploadsPlaylistId) {
    console.error('No uploads playlist found for channel:', channelId)
    return []
  }

  // Get 25 most recent videos
  const playlistRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=25&key=${apiKey}`
  )
  const playlistData = await playlistRes.json()

  if (!playlistData.items) return []

  const videoIds = playlistData.items.map((item: { contentDetails: { videoId: string } }) => item.contentDetails.videoId)

  // Get stats for all videos in one call
  const statsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`
  )
  const statsData = await statsRes.json()

  if (!statsData.items) return []

  return statsData.items.map((video: {
    id: string
    snippet: { title: string; thumbnails: { high?: { url: string }; medium?: { url: string } }; publishedAt: string }
    statistics: { viewCount?: string; likeCount?: string; commentCount?: string; favoriteCount?: string }
  }) => {
    const views = parseInt(video.statistics.viewCount || '0')
    const likes = parseInt(video.statistics.likeCount || '0')
    const comments = parseInt(video.statistics.commentCount || '0')
    const totalInteractions = likes + comments
    const engagementRate = views > 0 ? (totalInteractions / views) * 100 : 0

    return {
      post_id: video.id,
      platform: 'youtube' as const,
      title: video.snippet.title,
      thumbnail_url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || '',
      published_at: video.snippet.publishedAt,
      views,
      likes,
      comments,
      shares: 0, // YouTube API doesn't expose share count
      saves: parseInt(video.statistics.favoriteCount || '0'),
      reach: views,
      watch_time_minutes: 0, // Requires Analytics API (OAuth)
      engagement_rate: Math.round(engagementRate * 100) / 100,
    }
  })
}
