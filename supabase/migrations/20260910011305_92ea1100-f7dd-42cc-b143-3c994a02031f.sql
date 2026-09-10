CREATE TABLE public.briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  profession TEXT NOT NULL,
  main_whatsapp TEXT NOT NULL,
  other_phone TEXT,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  work_address TEXT,
  site_goal TEXT NOT NULL,
  services TEXT NOT NULL,
  has_site TEXT NOT NULL,
  site_url TEXT,
  has_domain TEXT NOT NULL,
  domain TEXT,
  hosting TEXT NOT NULL,
  has_logo TEXT NOT NULL,
  logo_file TEXT,
  colors TEXT NOT NULL,
  has_reference TEXT NOT NULL,
  reference_url TEXT,
  about TEXT NOT NULL,
  public_whatsapp TEXT NOT NULL,
  public_phone TEXT,
  instagram TEXT NOT NULL,
  facebook TEXT NOT NULL,
  linkedin TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Novo',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.briefings TO anon;
GRANT INSERT ON public.briefings TO authenticated;
GRANT ALL ON public.briefings TO service_role;

ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a briefing"
ON public.briefings FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_briefings_updated_at
BEFORE UPDATE ON public.briefings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();