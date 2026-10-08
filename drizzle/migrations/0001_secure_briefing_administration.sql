CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role text NOT NULL CHECK (role = 'admin'),
 UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own administrative role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE FUNCTION public.is_briefing_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'); $$;
REVOKE ALL ON FUNCTION public.is_briefing_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_briefing_admin() TO authenticated;
GRANT SELECT ON public.briefings TO authenticated;
GRANT UPDATE (status) ON public.briefings TO authenticated;
CREATE POLICY "Administrators can read briefings" ON public.briefings FOR SELECT TO authenticated USING ((select public.is_briefing_admin()));
CREATE POLICY "Administrators can change briefing status" ON public.briefings FOR UPDATE TO authenticated USING ((select public.is_briefing_admin())) WITH CHECK ((select public.is_briefing_admin()));
CREATE POLICY "Administrators can view stored logos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'logos' AND (select public.is_briefing_admin()));