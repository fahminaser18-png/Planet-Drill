# Landing Page Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace only the existing homepage hero with an outcome-led UTBK SNBT hero containing approved copy, conversion-focused CTAs, and three optimized generated images.

**Architecture:** Keep the existing `HomePage` and `homepageCopy` boundaries. `HomePage` owns the responsive hero composition, `marketing-content.ts` owns hero strings and capability items, and three local WebP assets live under `public/images/landing/`. No route, global theme, API, state, or post-hero section changes are allowed.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS 4, Vitest/Testing Library, built-in image generation, Pillow for image optimization, Vite.

## Global Constraints

- Modify only the homepage hero, its hero-specific copy/test, three local image assets, and temporary visual-QA files that are deleted before completion.
- Do not modify the marketing header, features, simulation, pricing, footer, application routes, authentication, dashboard, database, or seed data.
- Use exactly three generated images; no text, logo, watermark, school emblem, readable question, or readable screen content inside them.
- Use the approved headline `Hadapi UTBK dengan strategi, bukan sekadar latihan.`
- Use the approved primary CTA `Mulai try out gratis` with destination `/auth/login`.
- Use the approved secondary CTA `Lihat alur belajar` with destination `#simulasi`.
- Use capability labels `Simulasi bertimer`, `Analitik kelemahan`, and `Belajar lebih terarah`.
- Do not invent user counts, ratings, institutional logos, testimonials, or result claims.
- Primary image target: less than 200 KB. Each supporting image target: less than 120 KB when visual quality permits.
- The responsive layout must remain usable at a minimum 320-pixel viewport width.
- Mobile CTA tap targets must be at least 48 pixels high and full width.
- The primary image must load eagerly with high fetch priority; supporting images decode asynchronously.
- Do not introduce hero animation. If a focused visual correction adds motion, it must respect `prefers-reduced-motion`.
- Perform visual inspection of every generated image and both desktop/mobile hero screenshots before completion.
- Preserve user changes and unrelated dirty-worktree files.

---

### Task 1: Lock the approved hero contract with a failing test

**Files:**
- Modify: `src/pages/home-page.test.tsx`

**Interfaces:**
- Consumes: existing `HomePage` component rendered inside `MemoryRouter`.
- Produces: assertions for approved copy, CTA destinations, three image paths, primary alt text, and unchanged downstream section anchors.

- [ ] **Step 1: Replace the old hero assertions with the approved contract**

Keep the existing downstream-section test. In the first homepage test, replace the old hero-title/description assertions and add the following assertions immediately after rendering:

```tsx
expect(
  screen.getByRole("heading", {
    level: 1,
    name: /hadapi UTBK dengan strategi, bukan sekadar latihan/i,
  }),
).toBeInTheDocument();
expect(
  screen.getByText(
    /simulasikan ujian, temukan topik yang menahan skor, lalu fokuskan belajar/i,
  ),
).toBeInTheDocument();

expect(screen.getByText("Simulasi bertimer")).toBeInTheDocument();
expect(screen.getByText("Analitik kelemahan")).toBeInTheDocument();
expect(screen.getByText("Belajar lebih terarah")).toBeInTheDocument();

const primaryCtas = screen.getAllByRole("link", {
  name: /mulai try out gratis/i,
});
expect(primaryCtas.length).toBeGreaterThan(0);
expect(
  primaryCtas.every((link) => link.getAttribute("href") === "/auth/login"),
).toBe(true);
expect(
  screen.getByRole("link", { name: /lihat alur belajar/i }),
).toHaveAttribute("href", "#simulasi");

expect(
  screen.getByRole("img", {
    name: /pelajar Indonesia mempersiapkan UTBK dengan latihan terarah/i,
  }),
).toHaveAttribute("src", "/images/landing/utbk-hero-primary-v1.webp");

const heroImages = container.querySelectorAll('[data-hero-image="true"]');
expect(heroImages).toHaveLength(3);
expect(heroImages[1]).toHaveAttribute("alt", "");
expect(heroImages[2]).toHaveAttribute("alt", "");
```

Change the render assignment in this test to:

```tsx
const { container } = render(
  <MemoryRouter>
    <HomePage />
  </MemoryRouter>,
);
```

Remove assertions for `Lolos UTBK`, the old farmasi-era hero description, the old primary CTA label, and old hero metrics. Retain assertions that cover the feature, simulation, pricing, footer CTA, and navigation anchors, adjusting the footer CTA lookup to the new primary label.

- [ ] **Step 2: Run a source contract to verify RED without relying on the currently unstable Vitest worker**

Run:

```powershell
$page = Get-Content -Raw -LiteralPath 'src\pages\home-page.tsx'
if ($page -notmatch 'utbk-hero-primary-v1\.webp') {
  throw 'Expected RED: approved hero image is not implemented yet.'
}
```

Expected: exit code 1 with `Expected RED: approved hero image is not implemented yet.`

- [ ] **Step 3: Commit the failing contract**

```powershell
git add -- src/pages/home-page.test.tsx
git commit -m "test: define UTBK landing hero contract"
```

Expected: commit contains only `src/pages/home-page.test.tsx`.

---

### Task 2: Generate and optimize the three approved hero images

**Files:**
- Create: `public/images/landing/utbk-hero-primary-v1.webp`
- Create: `public/images/landing/utbk-hero-focus-v1.webp`
- Create: `public/images/landing/utbk-hero-review-v1.webp`

**Interfaces:**
- Consumes: built-in image generation output paths.
- Produces: three project-local WebP files with stable paths consumed by `HomePage`.

- [ ] **Step 1: Generate the primary outcome image with the built-in image tool**

Use one built-in image generation call with this complete prompt:

```text
Use case: photorealistic-natural
Asset type: landing page hero primary image
Primary request: an Indonesian high-school student at a tidy study desk just after completing a focused UTBK mock-test session, calm, capable, and quietly confident
Scene/backdrop: contemporary home study corner with books and a laptop, subtle indigo and teal environmental accents
Subject: realistic Indonesian teenager in everyday modest study clothes, natural expression and posture
Style/medium: premium editorial education photography, authentic and unstaged
Composition/framing: medium 4:5 portrait frame, subject clearly visible, generous crop-safe space around head and shoulders
Lighting/mood: clean natural daylight, focused, optimistic, credible
Constraints: realistic age and skin texture; laptop screen has no readable content; no text; no logo; no watermark; no school emblem; no branded device
Avoid: exaggerated celebration, corporate stock-photo pose, beauty retouching, readable questions, readable score, extra fingers, distorted hands
```

Inspect the output for subject, hands, screen content, lighting, and crop safety. If one issue is present, iterate once with only that issue named.

- [ ] **Step 2: Generate the focused-practice supporting image**

Use a separate built-in image generation call:

```text
Use case: photorealistic-natural
Asset type: landing page hero supporting image
Primary request: close editorial view of an Indonesian high-school student doing structured UTBK practice with a notebook and laptop
Scene/backdrop: clean study desk with restrained stationery and soft indigo accent
Subject: student's hands, upper body, notebook, and laptop arranged naturally
Style/medium: premium editorial education photography, realistic and unstaged
Composition/framing: horizontal 4:3 crop, clear focal point, suitable for a compact web tile
Lighting/mood: soft natural daylight, concentrated and calm
Constraints: notebook and screen contain no readable content; no personal data; no text; no logo; no watermark; no school emblem
Avoid: answer-key implication, clutter, distorted hands, floating objects, excessive props
```

Inspect the output and iterate once only if a specific constraint is violated.

- [ ] **Step 3: Generate the collaborative-review supporting image**

Use a third separate built-in image generation call:

```text
Use case: photorealistic-natural
Asset type: landing page hero supporting image
Primary request: two Indonesian high-school students calmly reviewing UTBK practice results together at a study table
Scene/backdrop: bright contemporary learning space with restrained indigo and teal accents
Subject: two realistic teenagers collaborating naturally, attentive expressions, clear undistorted faces
Style/medium: premium editorial education photography, candid and credible
Composition/framing: horizontal 4:3 crop suitable for a compact web tile
Lighting/mood: clean natural daylight, supportive and focused
Constraints: papers and screens have no readable content; no text; no logo; no watermark; no school emblem; no branded device
Avoid: exaggerated celebration, corporate meeting pose, beauty retouching, extra people, distorted hands
```

Inspect the output and iterate once only if a specific constraint is violated.

- [ ] **Step 4: Copy generated files into a project staging folder**

Create `public/images/landing/` if needed with `New-Item -ItemType Directory -Force`. Copy each selected built-in output into that folder with temporary PNG names:

```text
utbk-hero-primary-v1-source.png
utbk-hero-focus-v1-source.png
utbk-hero-review-v1-source.png
```

Do not overwrite any pre-existing project asset. If a target exists before this task, use the next version suffix and update all later plan paths consistently.

- [ ] **Step 5: Optimize and crop the selected images to WebP**

Use the bundled workspace Python executable with Pillow. Run the following logic, substituting the exact bundled Python path returned by the workspace-dependency loader:

```python
from pathlib import Path
from PIL import Image, ImageOps

root = Path("public/images/landing")
jobs = [
    ("utbk-hero-primary-v1-source.png", "utbk-hero-primary-v1.webp", (960, 1200), 82),
    ("utbk-hero-focus-v1-source.png", "utbk-hero-focus-v1.webp", (720, 540), 80),
    ("utbk-hero-review-v1-source.png", "utbk-hero-review-v1.webp", (720, 540), 80),
]

for source_name, output_name, size, quality in jobs:
    with Image.open(root / source_name) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS)
        image.save(root / output_name, "WEBP", quality=quality, method=6)
```

After the WebP files are verified, remove only the three `*-source.png` staging files with explicit `Remove-Item -LiteralPath` calls.

- [ ] **Step 6: Verify dimensions, formats, and file sizes**

Use Pillow to print filename, dimensions, format, and byte count for all three assets. Expected dimensions:

- Primary: `960x1200`.
- Supporting: `720x540` each.

Expected format: `WEBP` for all files. If a target size is exceeded, reduce WebP quality in increments of 4 and re-check visually; do not reduce below quality 70 without reporting the tradeoff.

- [ ] **Step 7: Commit the optimized assets**

```powershell
git add -- public/images/landing/utbk-hero-primary-v1.webp public/images/landing/utbk-hero-focus-v1.webp public/images/landing/utbk-hero-review-v1.webp
git commit -m "feat: add UTBK landing hero imagery"
```

Expected: commit contains exactly three WebP assets.

---

### Task 3: Implement the approved copy and responsive hero composition

**Files:**
- Modify: `src/mocks/marketing-content.ts`
- Modify: `src/pages/home-page.tsx`

**Interfaces:**
- Consumes: the three WebP paths from Task 2 and existing `getButtonStyleProps`/`Link` APIs.
- Produces: `homepageCopy.heroEyebrow`, approved hero strings, `heroSignals`, and the new responsive hero markup.

- [ ] **Step 1: Add approved hero copy and capability data**

In `src/mocks/marketing-content.ts`, add `Compass` to the existing Phosphor icon import and export this data near the current hero metrics:

```tsx
export const heroSignals = [
  {
    icon: ClockCountdown,
    label: "Simulasi bertimer",
  },
  {
    icon: ChartLineUp,
    label: "Analitik kelemahan",
  },
  {
    icon: Compass,
    label: "Belajar lebih terarah",
  },
] as const;
```

Replace only the hero-specific fields in `homepageCopy`:

```tsx
heroEyebrow: "Platform latihan UTBK SNBT",
heroTitle: "Hadapi UTBK dengan strategi, bukan sekadar latihan.",
heroDescription:
  "Simulasikan ujian, temukan topik yang menahan skor, lalu fokuskan belajar pada bagian yang paling perlu diperbaiki.",
heroPrimaryCta: "Mulai try out gratis",
heroSecondaryCta: "Lihat alur belajar",
```

Delete `heroLead` only after confirming it has no remaining consumer. Keep post-hero copy unchanged.

- [ ] **Step 2: Update imports for the new hero**

In `src/pages/home-page.tsx`:

- Remove `Stethoscope` from the `lucide-react` import.
- Add `Sparkles` to the `lucide-react` import.
- Replace the `heroMetrics` import with `heroSignals`.

The resulting relevant imports should be:

```tsx
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react";
```

and:

```tsx
import {
  heroSignals,
  homepageCopy,
  marketingFeatures,
  pricingPreview,
  simulationSteps,
} from "../mocks/marketing-content";
```

- [ ] **Step 3: Replace only the first hero section**

Replace the existing first grid section and its nested aside, stopping before `<section id="fitur"`, with this composition:

```tsx
<section className="pt-6 lg:pt-8">
  <div className="relative overflow-hidden rounded-[2rem] border bg-[linear-gradient(135deg,#ffffff_0%,#f3f4ff_54%,#e8f7f7_100%)] shadow-[0_28px_80px_rgba(41,46,109,0.12)]">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-28 top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl"
    />

    <div className="relative grid gap-10 px-5 py-7 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] lg:items-center lg:px-10 lg:py-12 xl:gap-14 xl:px-14">
      <div className="max-w-3xl">
        <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {homepageCopy.heroEyebrow}
        </div>

        <h1 className="mt-6 max-w-[12ch] text-[clamp(2.7rem,5.4vw,5.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-foreground">
          {homepageCopy.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {homepageCopy.heroDescription}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            {...getButtonStyleProps({
              className: "min-h-12 w-full justify-center px-6 shadow-lg shadow-primary/20 sm:w-auto",
              size: "lg",
              variant: "primary",
            })}
            to="/auth/login"
          >
            {homepageCopy.heroPrimaryCta}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            {...getButtonStyleProps({
              className: "min-h-12 w-full justify-center border-primary/15 bg-white/70 px-6 sm:w-auto",
              size: "lg",
              variant: "outline",
            })}
            href="#simulasi"
          >
            {homepageCopy.heroSecondaryCta}
          </a>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Keunggulan utama">
          {heroSignals.map((signal) => {
            const Icon = signal.icon;

            return (
              <li
                key={signal.label}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {signal.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className="grid grid-cols-2 gap-3 lg:min-h-[34rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(9rem,0.85fr)] lg:grid-rows-2"
        data-testid="hero-collage"
      >
        <div className="relative col-span-2 min-h-[20rem] overflow-hidden rounded-[1.75rem] border-4 border-white bg-muted shadow-2xl shadow-slate-900/15 lg:col-span-1 lg:row-span-2 lg:min-h-0">
          <img
            alt="Pelajar Indonesia mempersiapkan UTBK dengan latihan terarah"
            className="h-full w-full object-cover"
            data-hero-image="true"
            decoding="async"
            fetchPriority="high"
            height="1200"
            loading="eager"
            src="/images/landing/utbk-hero-primary-v1.webp"
            width="960"
          />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/50 bg-slate-950/70 px-4 py-3 text-white shadow-lg backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              Ritme belajar
            </p>
            <p className="mt-1 text-sm font-semibold">
              Latihan → analisis → fokus ulang
            </p>
          </div>
        </div>

        <div className="relative min-h-36 overflow-hidden rounded-[1.4rem] border-4 border-white bg-muted shadow-xl shadow-slate-900/10 lg:min-h-0">
          <img
            alt=""
            className="h-full w-full object-cover"
            data-hero-image="true"
            decoding="async"
            height="540"
            src="/images/landing/utbk-hero-focus-v1.webp"
            width="720"
          />
        </div>
        <div className="relative min-h-36 overflow-hidden rounded-[1.4rem] border-4 border-white bg-muted shadow-xl shadow-slate-900/10 lg:min-h-0">
          <img
            alt=""
            className="h-full w-full object-cover"
            data-hero-image="true"
            decoding="async"
            height="540"
            src="/images/landing/utbk-hero-review-v1.webp"
            width="720"
          />
        </div>
      </div>
    </div>
  </div>
</section>
```

Do not edit anything beginning with `<section id="fitur"` or below.

- [ ] **Step 4: Run the source contract to verify GREEN**

Run:

```powershell
$page = Get-Content -Raw -LiteralPath 'src\pages\home-page.tsx'
$required = @(
  'utbk-hero-primary-v1.webp',
  'utbk-hero-focus-v1.webp',
  'utbk-hero-review-v1.webp',
  'data-hero-image="true"',
  'fetchPriority="high"'
)
foreach ($item in $required) {
  if ($page -notmatch [regex]::Escape($item)) {
    throw "Missing hero contract item: $item"
  }
}
if (($page | Select-String -Pattern 'data-hero-image="true"' -AllMatches).Matches.Count -ne 3) {
  throw 'Hero must contain exactly three image elements.'
}
```

Expected: exit code 0.

- [ ] **Step 5: Run targeted and bundle verification**

Run:

```powershell
npm test -- --run src/pages/home-page.test.tsx --project=src --reporter=dot
```

Expected: homepage tests pass. If the already-documented Vitest worker-startup timeout recurs before any test is collected, record it as an environment blocker and continue only with the source contract plus the production Vite build below; do not modify test infrastructure within this task.

Run:

```powershell
npx vite build
```

Expected: production bundle succeeds.

- [ ] **Step 6: Verify that post-hero source remains unchanged**

Compare `src/pages/home-page.tsx` from the line containing `<section id="fitur"` through end-of-file against the pre-task version. Expected: no diff in that range.

- [ ] **Step 7: Commit the hero implementation**

```powershell
git add -- src/mocks/marketing-content.ts src/pages/home-page.tsx
git commit -m "feat: redesign UTBK landing hero"
```

Expected: commit contains only hero copy/data and hero component changes.

---

### Task 4: Perform desktop and mobile visual QA

**Files:**
- Temporary create: `hero-preview.html`
- Temporary create: `src/hero-preview.tsx`
- Verify: `src/pages/home-page.tsx`
- Verify: `public/images/landing/*.webp`

**Interfaces:**
- Consumes: completed `HomePage`, existing global stylesheet, and local hero assets.
- Produces: visual evidence at desktop and mobile widths; no persistent preview files.

- [ ] **Step 1: Create a temporary Vite preview entry without touching application routes**

Create `hero-preview.html`:

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hero Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/hero-preview.tsx"></script>
  </body>
</html>
```

Create `src/hero-preview.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter } from "react-router";
import HomePage from "./pages/home-page";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  </React.StrictMode>,
);
```

- [ ] **Step 2: Start a bounded Vite dev server**

Run `npx vite --host 127.0.0.1 --port 4174` and keep the returned session ID. Open `http://127.0.0.1:4174/hero-preview.html` only for visual QA.

- [ ] **Step 3: Capture and inspect desktop and mobile screenshots**

Capture the hero at:

- Desktop: `1440x1000`.
- Mobile: `390x844`.

Inspect both screenshots for:

- Headline visible without clipping.
- Primary CTA visually dominant.
- No horizontal overflow.
- All three images visible and faces/hands acceptably cropped.
- Main image remains meaningful on mobile.
- No visual collision with the unchanged marketing header or the next section.

Make at most one focused CSS correction per detected issue, then repeat the affected screenshot.

- [ ] **Step 4: Stop the dev server and delete preview-only files**

Stop only the Vite session started in Step 2. Delete `hero-preview.html` and `src/hero-preview.tsx` with an explicit patch. Confirm neither file remains in `git status`.

- [ ] **Step 5: Run final verification**

Run:

```powershell
git diff --check
npx vite build
```

Run the image metadata/size check from Task 2 again. Run the source contract from Task 3 again. Expected: all available checks pass; any repository-wide pre-existing blocker is reported with its exact output.

- [ ] **Step 6: Commit any focused visual correction**

If visual QA required a correction:

```powershell
git add -- src/pages/home-page.tsx
git commit -m "fix: refine responsive landing hero"
```

If no correction was needed, do not create an empty commit.

---

## Completion Gate

- [ ] Exactly three optimized project-local WebP images exist and are referenced by the hero.
- [ ] Approved copy and CTA destinations match the design spec verbatim.
- [ ] Primary image has descriptive alt text; supporting images have empty alt text.
- [ ] Header and every section beginning at `#fitur` remain unchanged.
- [ ] Temporary preview files and staging PNGs are absent.
- [ ] Targeted test result, source contract, Vite bundle, image metadata, diff check, and visual QA results are recorded accurately.
- [ ] Use `finishing-a-development-branch` to present integration choices after verification.
