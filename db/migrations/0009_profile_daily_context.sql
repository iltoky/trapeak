ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_profile_version_check;

-- statement-breakpoint
ALTER TABLE user_profiles
  ALTER COLUMN profile_version SET DEFAULT 3;

-- statement-breakpoint
UPDATE user_profiles
   SET profile = (
         profile
         - 'sleepSchedule'
         - 'dailyActivityLevel'
         - 'workPattern'
         - 'stressLevel'
         - 'caffeineUse'
         - 'alcoholUse'
       ) || CASE
         WHEN profile ? 'workActivityContext'
           THEN jsonb_build_object('workActivityContext', profile -> 'workActivityContext')
         WHEN profile ? 'workPattern'
           THEN jsonb_build_object('workActivityContext', profile -> 'workPattern')
         ELSE '{}'::jsonb
       END,
       field_statuses = (
         field_statuses
         - 'sleepSchedule'
         - 'dailyActivityLevel'
         - 'workPattern'
         - 'stressLevel'
         - 'caffeineUse'
         - 'alcoholUse'
       ) || CASE
         WHEN field_statuses ? 'workActivityContext'
           THEN jsonb_build_object(
             'workActivityContext', field_statuses -> 'workActivityContext'
           )
         WHEN field_statuses ? 'workPattern'
           THEN jsonb_build_object('workActivityContext', field_statuses -> 'workPattern')
         ELSE '{}'::jsonb
       END,
       profile_version = 3,
       updated_at = NOW();

-- statement-breakpoint
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_profile_version_check CHECK (profile_version = 3);
