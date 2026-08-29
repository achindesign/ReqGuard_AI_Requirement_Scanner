/*
# Increase free-plan monthly analysis limit from 1 to 2

1. Changes
- `profiles.monthly_analysis_limit` default changed from 1 to 2.
- New users signing up will now get 2 analyses per month on the free plan.
- Existing free-plan users with the old default of 1 are bumped to 2 as well
  (only those still on the default; anyone manually set stays as-is).

2. Security
- No policy or RLS changes.
- No new tables or columns.
*/

ALTER TABLE profiles ALTER COLUMN monthly_analysis_limit SET DEFAULT 2;

-- Bring existing free-plan users up to the new default if they were on the old one.
UPDATE profiles
SET monthly_analysis_limit = 2
WHERE plan = 'free' AND monthly_analysis_limit = 1;
