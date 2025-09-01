UPDATE public.golf_courses 
SET name = name || ' s GDF' 
WHERE name NOT LIKE '% s GDF';