-- Ta bort extra mellanrum före "s GDF"
UPDATE public.golf_courses 
SET location = REPLACE(location, ' s GDF', 's GDF') 
WHERE location LIKE '% s GDF%';