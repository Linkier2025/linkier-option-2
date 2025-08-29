-- Add missing columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS university VARCHAR(255),
ADD COLUMN IF NOT EXISTS distance_from_campus NUMERIC(5,2) DEFAULT 0;

-- Create index for university searches
CREATE INDEX IF NOT EXISTS idx_properties_university ON public.properties USING btree (university);

-- Create index for distance searches
CREATE INDEX IF NOT EXISTS idx_properties_distance ON public.properties USING btree (distance_from_campus);
