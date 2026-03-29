import { supabaseAdmin } from './supabase'
import { getInstagramToken, refreshInstagramTokenIfNeeded, fetchInstagramPosts, exchangeShortToken } from './instagram'
import { fetchYouTubeVideos } from './youtube'

export interface SyncResult {
  instagram: { synced: number; errors: string[] }
  youtube: { synced: number; errors: string[] }
}

export async function runSync(): Promise<SyncResult> {
  const result: SyncResult = {
    instagram: { synced: 0, errors: [] },
    youtube: { synced: 0, errors: [] },
  }

  // --- Instagram ---
  try {
    let token = await getInstagramToken()

    if (!token) {
      // First time: exchange short token from env
      const shortToken = process.env.INSTAGRAM_SHORT_TOKEN
      if (!shortToken) throw new Error('No Instagram token in meta_tokens and no INSTAGRAM_SHORT_TOKEN in env')

      const longToken = await exchangeShortToken(shortToken)
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days

      await supabaseAdmin.from('meta_tokens').upsert({
        platform: 'instagram',
        access_token: longToken,
        token_expires_at: expiresAt.toISOString(),
      }, { onConflict: 'platform' })

      token = { access_token: longToken, ig_user_id: '', token_expires_at: expiresAt.toISOString() }
    }

    const accessToken = await refreshInstagramTokenIfNeeded(token)
    const posts = await fetchInstagramPosts(accessToken)

    if (posts.length > 0) {
      const { error } = await supabaseAdmin
        .from('content_analytics')
        .upsert(posts, { onConflict: 'post_id' })

      if (error) throw error
      result.instagram.synced = posts.length
    }
  } catch (err) {
    result.instagram.errors.push(err instanceof Error ? err.message : String(err))
  }

  // --- YouTube ---
  try {
    const videos = await fetchYouTubeVideos()

    if (videos.length > 0) {
      const { error } = await supabaseAdmin
        .from('content_analytics')
        .upsert(videos, { onConflict: 'post_id' })

      if (error) throw error
      result.youtube.synced = videos.length
    }
  } catch (err) {
    result.youtube.errors.push(err instanceof Error ? err.message : String(err))
  }

  return result
}
