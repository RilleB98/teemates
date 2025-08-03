-- Create golf_courses table
CREATE TABLE public.golf_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '/placeholder.svg',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.golf_courses ENABLE ROW LEVEL SECURITY;

-- Create policies - Anyone can read golf courses (public data)
CREATE POLICY "Anyone can view golf courses" 
ON public.golf_courses 
FOR SELECT 
USING (true);

-- Only admins can insert golf courses
CREATE POLICY "Admins can insert golf courses" 
ON public.golf_courses 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Only admins can update golf courses
CREATE POLICY "Admins can update golf courses" 
ON public.golf_courses 
FOR UPDATE 
USING (public.is_admin());

-- Only admins can delete golf courses
CREATE POLICY "Admins can delete golf courses" 
ON public.golf_courses 
FOR DELETE 
USING (public.is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_golf_courses_updated_at
BEFORE UPDATE ON public.golf_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing golf courses data
INSERT INTO public.golf_courses (name, location, image, latitude, longitude) VALUES
('Bro Hof Slott Golf Club', 'Stockholm', '/placeholder.svg', 59.4839, 17.6903),
('Drottningholm Golf Club', 'Stockholm', '/placeholder.svg', 59.3218, 17.8868),
('Frösåker Golf Club', 'Stockholm', '/placeholder.svg', 59.6423, 18.3515),
('Saltsjöbadens Golf Club', 'Stockholm', '/placeholder.svg', 59.2729, 18.3061),
('Stockholms Golf Club', 'Stockholm', '/placeholder.svg', 59.2804, 18.1038),
('Woxnerud Golf Club', 'Stockholm', '/placeholder.svg', 59.2951, 17.6419),
('Ängsö Golf Club', 'Stockholm', '/placeholder.svg', 59.5327, 17.8794),
('Falsterbo Golf Club', 'Skåne', '/placeholder.svg', 55.3847, 12.8286),
('Ljunghusen Golf Club', 'Skåne', '/placeholder.svg', 55.4203, 12.9043),
('Malmö Burlöv Golf Club', 'Skåne', '/placeholder.svg', 55.6503, 13.0813),
('PGA Sweden National', 'Skåne', '/placeholder.svg', 55.5389, 13.3728),
('Romeleåsen Golf Club', 'Skåne', '/placeholder.svg', 55.6187, 13.4536),
('Barsebäck Golf & Country Club', 'Skåne', '/placeholder.svg', 55.7662, 12.9583),
('Hills Golf Club', 'Gothenburg', '/placeholder.svg', 57.6348, 12.0443),
('Göteborgs Golf Club', 'Gothenburg', '/placeholder.svg', 57.6792, 11.8664),
('Kungsbacka Golf Club', 'Gothenburg', '/placeholder.svg', 57.4887, 12.0759),
('Lysegårdens Golf Club', 'Gothenburg', '/placeholder.svg', 57.7089, 11.9746),
('Stenungsund Golf Club', 'Gothenburg', '/placeholder.svg', 58.0708, 11.8264),
('Ullna Golf Club', 'Gothenburg', '/placeholder.svg', 57.6348, 12.0443),
('Björkbacken Golf Club', 'Halland', '/placeholder.svg', 56.6634, 12.8572),
('Falkenberg Golf Club', 'Halland', '/placeholder.svg', 56.9059, 12.4908),
('Halmstad Golf Club', 'Halland', '/placeholder.svg', 56.6745, 12.8572),
('Laholm Golf Club', 'Halland', '/placeholder.svg', 56.5119, 13.0443),
('Tylösand Golf Club', 'Halland', '/placeholder.svg', 56.6889, 12.7194),
('Edenhof Golf Club', 'Uppsala', '/placeholder.svg', 59.8586, 17.6389),
('Gävle Golf Club', 'Uppsala', '/placeholder.svg', 60.6749, 17.1413),
('Uppsala Golf Club', 'Uppsala', '/placeholder.svg', 59.8586, 17.6389),
('Västerås Golf Club', 'Västmanland', '/placeholder.svg', 59.6099, 16.5448),
('Sala Golf Club', 'Västmanland', '/placeholder.svg', 59.9248, 16.6046),
('Örebro Golf Club', 'Örebro', '/placeholder.svg', 59.2741, 15.2066);