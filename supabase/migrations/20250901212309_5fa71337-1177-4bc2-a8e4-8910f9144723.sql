-- Fix double 'ss' at the end of location names to single 's'
UPDATE golf_courses 
SET location = REGEXP_REPLACE(location, 'ss GDF$', 's GDF', 'g')
WHERE location LIKE '%ss GDF';