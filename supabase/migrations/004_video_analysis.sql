ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS video_analysis jsonb;
