import { supabaseAdmin } from '@/lib/supabase'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export const revalidate = 3600 // Revalidate every hour

async function getPosts() {
  const { data, error } = await supabaseAdmin
    .from('content_analytics')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return data || []
}

export default async function Home() {
  const posts = await getPosts()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardClient posts={posts} />
      </div>
    </main>
  )
}
