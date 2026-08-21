CREATE TABLE public.tutor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('komunikasi', 'dokumen', 'hybrid')),
    duration_minutes INTEGER NOT NULL,
    objective TEXT,
    instructions TEXT NOT NULL,
    actor_instructions TEXT,
    rubrics JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tutor stations" 
ON public.tutor_sessions FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert tutor stations" 
ON public.tutor_sessions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tutor stations" 
ON public.tutor_sessions FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tutor stations" 
ON public.tutor_sessions FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by OR public.is_admin());
