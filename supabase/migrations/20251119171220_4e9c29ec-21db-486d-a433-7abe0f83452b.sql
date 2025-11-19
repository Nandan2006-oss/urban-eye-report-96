-- Add issue_type column to issues table
ALTER TABLE public.issues 
ADD COLUMN issue_type TEXT;

-- Create index for faster queries on issue_type
CREATE INDEX idx_issues_issue_type ON public.issues(issue_type);

-- Add a view for most reported issues
CREATE OR REPLACE VIEW public.most_reported_issues AS
SELECT 
  issue_type,
  COUNT(*) as report_count
FROM public.issues
WHERE issue_type IS NOT NULL
GROUP BY issue_type
ORDER BY report_count DESC
LIMIT 10;