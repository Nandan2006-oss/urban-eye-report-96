-- Fix the security definer view by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.most_reported_issues;

CREATE OR REPLACE VIEW public.most_reported_issues 
WITH (security_invoker = true) AS
SELECT 
  issue_type,
  COUNT(*) as report_count
FROM public.issues
WHERE issue_type IS NOT NULL
GROUP BY issue_type
ORDER BY report_count DESC
LIMIT 10;