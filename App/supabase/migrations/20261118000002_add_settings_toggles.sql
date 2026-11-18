-- Migration: Add enable/disable toggles for GSTIN, FSSAI, and Tax in restaurant_settings
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS enable_gstin BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS enable_fssai BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS enable_tax BOOLEAN DEFAULT TRUE;

-- Update the default row if it exists
UPDATE public.restaurant_settings 
SET 
    enable_gstin = COALESCE(enable_gstin, TRUE),
    enable_fssai = COALESCE(enable_fssai, TRUE),
    enable_tax = COALESCE(enable_tax, TRUE)
WHERE id = 'default';
