-- Fixa dubbla "GDF s GDF" till bara "s GDF"
UPDATE public.golf_courses 
SET location = REPLACE(location, 'GDF s GDF', 's GDF') 
WHERE location LIKE '%GDF s GDF%';