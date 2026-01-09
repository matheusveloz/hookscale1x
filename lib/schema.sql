-- Jobs de processamento
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  total_combinations INTEGER,
  processed_count INTEGER DEFAULT 0,
  aspect_ratio VARCHAR(10) DEFAULT '16:9',
  zip_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vídeos (hooks e bodies originais)
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL,
  filename VARCHAR(255),
  blob_url TEXT,
  duration FLOAT,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Combinações geradas
CREATE TABLE IF NOT EXISTS combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  hook_id UUID REFERENCES videos(id),
  body_id UUID REFERENCES videos(id),
  output_filename VARCHAR(255),
  blob_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_videos_job_id ON videos(job_id);
CREATE INDEX IF NOT EXISTS idx_videos_type ON videos(type);
CREATE INDEX IF NOT EXISTS idx_combinations_job_id ON combinations(job_id);
CREATE INDEX IF NOT EXISTS idx_combinations_status ON combinations(status);
