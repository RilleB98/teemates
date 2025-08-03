-- Reset coordinates for courses that have approximate Stockholm coordinates
-- These appear to be incorrectly geocoded courses that got default Stockholm coordinates
UPDATE golf_courses 
SET 
  latitude = 0,
  longitude = 0,
  updated_at = now()
WHERE 
  -- Reset courses with coordinates in Stockholm area that are not actually in Stockholm
  (latitude BETWEEN 59.2 AND 59.5 AND longitude BETWEEN 17.8 AND 18.2)
  AND location NOT ILIKE '%stockholm%'
  AND location NOT ILIKE '%södermalm%'
  AND location NOT ILIKE '%östermalm%'
  AND location NOT ILIKE '%norrmalm%'
  AND location NOT ILIKE '%vasastan%'
  AND location NOT ILIKE '%gamla stan%'
  AND location NOT ILIKE '%djurgården%'
  AND location NOT ILIKE '%kungsholmen%'
  AND location NOT ILIKE '%bromma%'
  AND location NOT ILIKE '%täby%'
  AND location NOT ILIKE '%solna%'
  AND location NOT ILIKE '%nacka%'
  AND location NOT ILIKE '%huddinge%'
  AND location NOT ILIKE '%järfälla%'
  AND location NOT ILIKE '%lidingö%'
  AND location NOT ILIKE '%danderyd%'
  AND location NOT ILIKE '%vallentuna%'
  AND location NOT ILIKE '%tyresö%'
  AND location NOT ILIKE '%värmdö%';