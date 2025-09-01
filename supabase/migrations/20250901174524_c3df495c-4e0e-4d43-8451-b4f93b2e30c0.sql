-- Just update the bucket to ensure it's public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';