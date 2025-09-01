-- Remove all Ingarö golf courses
DELETE FROM public.golf_courses 
WHERE name ILIKE '%ingarö%' OR name ILIKE '%ingaro%';