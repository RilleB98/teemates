UPDATE public.golf_courses 
SET name = REPLACE(name, 's GDF', '') 
WHERE name LIKE '%s GDF%';