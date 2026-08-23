# AI Tutor UTBK Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the rigid tutor simulation into a RAG-based AI Tutor with document uploads and Google Search Grounding.

**Architecture:** We will add a `tutor_materials` table to store reference materials. We will update the `use-gemini-live` hook to enable the `googleSearch` tool and inject materials into the system instruction. Finally, we will replace the `SessionBuilderForm` with a `MaterialUploaderForm`.

**Tech Stack:** React, Tailwind, Supabase, Gemini Multimodal Live API.

## Global Constraints

- Must use existing Gemini Live WebRTC setup for voice.
- Database is Supabase.
- Framework is React + Vite + Tailwind.
- TypeScript strictly typed.

---

### Task 1: Database Schema for Materials

**Files:**
- Create: `supabase/migrations/20260822000000_tutor_materials.sql`

**Interfaces:**
- Produces: `tutor_materials` table with columns (id, title, content_text, created_at).

- [ ] **Step 1: Write the migration**

```sql
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
    WITH CHECK (auth.role() = 'authenticated');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260822000000_tutor_materials.sql
git commit -m "feat: add tutor_materials table"
```

### Task 2: Enable Google Search Grounding in Gemini Hook

**Files:**
- Modify: `src/hooks/use-gemini-live.ts`

**Interfaces:**
- Consumes: The Gemini Multimodal Live API via WebRTC setup.
- Produces: WebRTC connection that includes the Google Search tool configuration.

- [ ] **Step 1: Update the setup message in useGeminiLive**

Modify `src/hooks/use-gemini-live.ts` to include the `googleSearch` tool in the `setup` message sent to the Gemini API. Look for the `clientContent` message sent over the data channel during initialization.

```typescript
// Add this inside the setup message tools array
{ googleSearch: {} }
```

- [ ] **Step 2: Verify changes compile**

Run: `npx tsc -b`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-gemini-live.ts
git commit -m "feat: enable Google Search Grounding for AI Tutor"
```

### Task 3: Material Uploader UI

**Files:**
- Create: `src/features/tutor/components/MaterialUploaderForm.tsx`

**Interfaces:**
- Consumes: Supabase browser client to insert into `tutor_materials`.
- Produces: `<MaterialUploaderForm />` component.

- [ ] **Step 1: Create the component**

```tsx
import { useState } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase/browser-client';
import { toast } from 'sonner';

export function MaterialUploaderForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('tutor_materials').insert({ title, content_text: content });
    
    if (error) {
      toast.error('Gagal mengunggah materi');
    } else {
      toast.success('Materi berhasil diunggah');
      setTitle('');
      setContent('');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 border rounded-xl bg-white space-y-4">
      <h3 className="font-bold text-lg">Upload Materi Knowledge Base</h3>
      <input 
        className="w-full p-2 border rounded" 
        placeholder="Judul Materi (Misal: Rumus Cepat Kuantitatif)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea 
        className="w-full p-2 border rounded h-32" 
        placeholder="Isi Materi / Teks Referensi"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button 
        onClick={handleUpload}
        disabled={isLoading || !title || !content}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isLoading ? 'Mengunggah...' : 'Unggah Materi'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/tutor/components/MaterialUploaderForm.tsx
git commit -m "feat: add material uploader form for RAG"
```

### Task 4: Integrate Material Uploader into Builder Page

**Files:**
- Modify: `src/pages/app/tutor-builder-page.tsx`

**Interfaces:**
- Consumes: `<MaterialUploaderForm />`

- [ ] **Step 1: Replace SessionBuilderForm**

In `tutor-builder-page.tsx`, import `MaterialUploaderForm` and replace references to `SessionBuilderForm` with it in the UI.

- [ ] **Step 2: Verify changes compile**

Run: `npx tsc -b`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/tutor-builder-page.tsx
git commit -m "feat: replace builder page with material uploader"
```
