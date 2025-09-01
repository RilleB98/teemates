-- Ta bort s GDF från name-fältet
UPDATE public.golf_courses 
SET name = REPLACE(name, ' s GDF', '') 
WHERE name LIKE '% s GDF';

-- Lägg till s GDF i location-fältet
UPDATE public.golf_courses 
SET location = location || ' s GDF' 
WHERE location NOT LIKE '% s GDF';