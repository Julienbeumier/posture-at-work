CREATE TABLE IF NOT EXISTS feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  nps integer CHECK (nps >= 0 AND nps <= 10),
  score_questionnaire integer CHECK (score_questionnaire >= 1 AND score_questionnaire <= 5),
  score_recommandations integer CHECK (score_recommandations >= 1 AND score_recommandations <= 5),
  score_video integer CHECK (score_video >= 1 AND score_video <= 5),
  score_exercices integer CHECK (score_exercices >= 1 AND score_exercices <= 5),
  commentaire text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);
