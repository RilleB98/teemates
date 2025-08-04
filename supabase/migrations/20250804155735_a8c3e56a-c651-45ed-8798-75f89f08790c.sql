-- Change handicap column from integer to decimal to support handicap values like 30.2
ALTER TABLE public.profiles 
ALTER COLUMN handicap TYPE DECIMAL(4,1);