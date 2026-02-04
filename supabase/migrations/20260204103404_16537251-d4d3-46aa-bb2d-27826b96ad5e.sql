-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create website_links table
CREATE TABLE public.website_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('website', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create apps table
CREATE TABLE public.apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  apk_file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table for simple admin management
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Companies policies (public read, admin write)
CREATE POLICY "Anyone can view active companies" 
  ON public.companies FOR SELECT 
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert companies" 
  ON public.companies FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update companies" 
  ON public.companies FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete companies" 
  ON public.companies FOR DELETE 
  USING (public.is_admin());

-- Website links policies
CREATE POLICY "Anyone can view website links" 
  ON public.website_links FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert website links" 
  ON public.website_links FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update website links" 
  ON public.website_links FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete website links" 
  ON public.website_links FOR DELETE 
  USING (public.is_admin());

-- Apps policies
CREATE POLICY "Anyone can view apps" 
  ON public.apps FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert apps" 
  ON public.apps FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update apps" 
  ON public.apps FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete apps" 
  ON public.apps FOR DELETE 
  USING (public.is_admin());

-- Admin users policies
CREATE POLICY "Admins can view admin users" 
  ON public.admin_users FOR SELECT 
  USING (public.is_admin());

-- Create storage buckets for logos and APK files
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('apk-files', 'apk-files', true);

-- Storage policies for company logos
CREATE POLICY "Anyone can view company logos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'company-logos');

CREATE POLICY "Admins can upload company logos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'company-logos' AND public.is_admin());

CREATE POLICY "Admins can update company logos" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'company-logos' AND public.is_admin());

CREATE POLICY "Admins can delete company logos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'company-logos' AND public.is_admin());

-- Storage policies for APK files
CREATE POLICY "Anyone can view APK files" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'apk-files');

CREATE POLICY "Admins can upload APK files" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'apk-files' AND public.is_admin());

CREATE POLICY "Admins can update APK files" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'apk-files' AND public.is_admin());

CREATE POLICY "Admins can delete APK files" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'apk-files' AND public.is_admin());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for companies
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();