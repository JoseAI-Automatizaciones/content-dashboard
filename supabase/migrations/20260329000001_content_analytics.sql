CREATE TABLE IF NOT EXISTS content_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  post_id text NOT NULL,
  title text,
  thumbnail_url text,
  published_at timestamptz,
  views bigint DEFAULT 0,
  likes bigint DEFAULT 0,
  comments bigint DEFAULT 0,
  shares bigint DEFAULT 0,
  saves bigint DEFAULT 0,
  reach bigint DEFAULT 0,
  watch_time_minutes numeric DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  synced_at timestamptz DEFAULT now(),
  CONSTRAINT content_analytics_post_id_key UNIQUE (post_id)
);

ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON content_analytics
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon read" ON content_analytics
  FOR SELECT
  TO anon
  USING (true);
