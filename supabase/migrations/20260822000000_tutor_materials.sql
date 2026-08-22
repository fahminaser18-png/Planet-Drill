CREATE TABLE tutor_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tutor_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of tutor_materials"
    ON tutor_materials FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert to tutor_materials"
    ON tutor_materials FOR INSERT
    WITH CHECK ((exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'mentor'))));
