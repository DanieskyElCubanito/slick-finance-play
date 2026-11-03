CREATE POLICY "Service manages admin roles" ON public.telegram_admin_roles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages admin sessions" ON public.admin_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manages economy proposals" ON public.economy_proposals FOR ALL TO service_role USING (true) WITH CHECK (true);