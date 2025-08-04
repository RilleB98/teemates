-- Update golf courses with real images
UPDATE golf_courses SET image = 
  CASE (RANDOM() * 8)::integer
    WHEN 0 THEN '/src/assets/golf-course-1.jpg'
    WHEN 1 THEN '/src/assets/golf-course-2.jpg'
    WHEN 2 THEN '/src/assets/golf-course-3.jpg'
    WHEN 3 THEN '/src/assets/golf-course-4.jpg'
    WHEN 4 THEN '/src/assets/golf-course-5.jpg'
    WHEN 5 THEN '/src/assets/golf-course-6.jpg'
    WHEN 6 THEN '/src/assets/golf-course-7.jpg'
    ELSE '/src/assets/golf-course-8.jpg'
  END
WHERE image = '/placeholder.svg';