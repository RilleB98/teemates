-- Update Rossöns Golf Club with correct coordinates for Rossön, Strömsund, Jämtland
UPDATE golf_courses 
SET 
  latitude = 63.933,
  longitude = 16.350,
  updated_at = now()
WHERE name ILIKE '%Rossön%' OR name ILIKE '%Rossöns%';