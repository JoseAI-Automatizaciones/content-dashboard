import { supabaseAdmin } from './supabase'

interface InstagramPost {
  post_id: string
  platform: 'instagram'
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

interface MetaToken {
  access_token: string
  ig_user_id: string
  token_expires_at: string | null
}

export async function getInstagramToken(): Promise<MetaToken | null> {
  const { data, error } = await supabaseAdmin
    .from('meta_tokens')
    .select('access_token, ig_user_id, token_expires_at')
    .eq('platform', 'instagram')
    .single()

  if (error || !data) return null
  return data as MetaToken
}

export async function refreshInstagramTokenIfNeeded(token: MetaToken): Promise<string> {
  const appId = process.env.INSTAGRAM_APP_ID!
  const appSecret = process.env.INSTAGRAM_APP_SECRET!

  // Check if token expires in < 10 days
  if (token.token_expires_at) {
    const expiresAt = new Date(token.token_expires_at)
    const daysLeft = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)

    if (daysLeft > 10) return token.access_token
  }

  // Refresh long-lived token
  const res = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${token.access_token}`
  )
  const data = await res.json()

  if (data.access_token) {
    const expiresAt = new Date(Date.now() + (data.expires_in || 5184000) * 1000)
    await supabaseAdmin
      .from('meta_tokens')
      .update({ access_token: data.access_token, token_expires_at: expiresAt.toISOString() })
      .eq('platform', 'instagram')
    return data.access_token
  }

  return token.access_token
}

export async function exchangeShortToken(shortToken: string): Promise<string> {
  const appId = process.env.INSTAGRAM_APP_ID!
  const appSecret = process.env.INSTAGRAM_APP_SECRET!

  const res = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
  )
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to exchange token: ' + JSON.stringify(data))
  return data.access_token
}

export async function fetchInstagramPosts(accessToken: string): Promise<InstagramPost[]> {
  // Get IG business account ID
  const meRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
  )
  const meData = await meRes.json()

  let igUserId: string | null = null
  if (meData.data?.[0]?.instagram_business_account?.id) {
    igUserId = meData.data[0].instagram_business_account.id
  }

  if (!igUserId) {
    // Try getting from meta_tokens
    const { data } = await supabaseAdmin
      .from('meta_tokens')
      .select('ig_user_id')
      .eq('platform', 'instagram')
      .single()
    igUserId = data?.ig_user_id
  }

  if (!igUserId) throw new Error('No Instagram user ID found')

  const fields = 'id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count'
  const mediaRes = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media?fields=${fields}&limit=25&access_token=${accessToken}`
  )
  const mediaData = await mediaRes.json()

  if (!mediaData.data) {
    console.error('Instagram media error:', mediaData)
    return []
  }

  const posts: InstagramPost[] = []

  for (const post of mediaData.data) {
    // Get insights
    let views = 0, reach = 0, shares = 0, saves = 0
    try {
      const insightsRes = await fetch(
        `https://graph.facebook.com/v19.0/${post.id}/insights?metric=impressions,reach,shares,saved&access_token=${accessToken}`
      )
      const insightsData = await insightsRes.json()
      if (insightsData.data) {
        for (const m of insightsData.data) {
          if (m.name === 'impressions') views = m.values?.[0]?.value || 0
          if (m.name === 'reach') reach = m.values?.[0]?.value || 0
          if (m.name === 'shares') shares = m.values?.[0]?.value || 0
          if (m.name === 'saved') saves = m.values?.[0]?.value || 0
        }
      }
    } catch (_) {}

    const likes = post.like_count || 0
    const comments = post.comments_count || 0
    const totalInteractions = likes + comments + shares + saves
    const engagementRate = reach > 0 ? (totalInteractions / reach) * 100 : 0

    posts.push({
      post_id: post.id,
      platform: 'instagram',
      title: post.caption ? post.caption.substring(0, 200) : '',
      thumbnail_url: post.thumbnail_url || post.media_url || '',
      published_at: post.timestamp,
      views,
      likes,
      comments,
      shares,
      saves,
      reach,
      engagement_rate: Math.round(engagementRate * 100) / 100,
    })
  }

  return posts
}
