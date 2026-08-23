# Landing Page Hero Design

Date: 2026-08-24
Status: Awaiting written-spec review

## Objective

Replace only the current landing-page hero with a clearer, outcome-led hero for UTBK SNBT participants. The hero must explain the product's value within five seconds, lead visitors toward a free tryout, and use generated imagery that feels relevant to Indonesian students.

## Scope

### In scope

- The first hero section rendered by `src/pages/home-page.tsx`.
- Hero-specific copy stored in `src/mocks/marketing-content.ts`.
- Three generated raster images used by the hero.
- Responsive, accessible layout behavior for the hero.
- Tests covering the hero's copy, CTA destinations, and image presence.

### Out of scope

- Marketing navigation and header.
- Feature, simulation, pricing, and footer sections.
- Application routes, including the current `/` redirect.
- Authentication, registration, subscription, or dashboard behavior.
- Global theme changes or unrelated component refactors.
- Database, seed, and academic-content changes.

## Approved Direction

Use an outcome-focused editorial collage rather than a dashboard screenshot or a generic campus image. The visual should show the confidence and focus produced by a structured UTBK preparation routine.

The hero uses one unified rounded surface with a two-column desktop layout:

- Left column: value proposition, CTA pair, and three concise capability signals.
- Right column: a three-image collage with one dominant image and two supporting images.

On mobile, the content stacks in reading order: copy, CTAs, capability signals, then imagery.

## Copy

Eyebrow:

> Platform latihan UTBK SNBT

Headline:

> Hadapi UTBK dengan strategi, bukan sekadar latihan.

Subheadline:

> Simulasikan ujian, temukan topik yang menahan skor, lalu fokuskan belajar pada bagian yang paling perlu diperbaiki.

Primary CTA:

> Mulai try out gratis

Primary CTA destination: `/auth/login`.

Secondary CTA:

> Lihat alur belajar

Secondary CTA destination: `#simulasi`.

Capability signals:

- Simulasi bertimer
- Analitik kelemahan
- Belajar lebih terarah

No user count, rating, institutional logo, or result claim will be invented. Capability signals provide concrete product evidence without presenting unsupported social proof.

## Visual System

The hero should align with the current product identity rather than the older pharmacy-era visual language.

- Primary colors: indigo and deep navy.
- Supporting colors: teal, white, and a restrained warm yellow accent derived from the existing logo.
- Surface: soft white-to-indigo gradient with controlled glow and subtle depth.
- Typography: current project type system; strong display headline and readable body copy.
- Shape language: large rounded container, restrained borders, layered editorial crops.
- Motion: subtle hover or entrance treatment only if it respects `prefers-reduced-motion` and does not delay content.

The primary CTA must remain the highest-contrast interactive element. Both CTA controls must meet a minimum 48-pixel mobile tap target.

## Generated Image Assets

Use the built-in image generation tool in three separate generation calls. Images are project-bound assets and must be copied into `public/images/landing/` before code references them.

### Asset 1: Primary outcome image

- Use case: `photorealistic-natural`.
- Subject: Indonesian high-school student at a study desk after completing a focused mock-test session, calm and confident rather than celebrating theatrically.
- Composition: medium editorial frame with room around the subject for responsive cropping.
- Lighting: clean natural daylight with subtle indigo and teal environmental accents.
- Constraints: realistic age and skin texture; no readable screen content; no text, logo, watermark, school emblem, or branded device.

### Asset 2: Focused practice detail

- Use case: `photorealistic-natural`.
- Subject: close editorial view of a student working through structured practice notes and a laptop.
- Composition: tighter crop that works as a supporting landscape tile.
- Constraints: no readable questions or personal data; no text, logo, watermark, or answer-key implication.

### Asset 3: Collaborative review

- Use case: `photorealistic-natural`.
- Subject: two Indonesian students calmly reviewing practice results together.
- Composition: compact supporting tile with natural interaction and clear faces.
- Constraints: authentic study setting; no exaggerated celebration; no readable text, logo, or watermark.

The final image prompts will preserve these constraints. Selected outputs will be visually inspected before use and iterated with one targeted change when necessary.

## Asset Delivery and Performance

- Preserve the original generated files in the project only when needed for traceability.
- Deliver optimized WebP variants for the page.
- Use descriptive versioned filenames; do not overwrite existing assets.
- Target less than 200 KB for the primary image and less than 120 KB for each supporting image when visual quality permits.
- Declare image dimensions to prevent layout shift.
- Load the primary image eagerly with high fetch priority because it is the likely LCP element.
- Decode supporting images asynchronously; avoid loading any additional hero imagery outside the approved three assets.

## Responsive Behavior

### Desktop

- Two-column layout with approximately 55% width for copy and 45% for the collage.
- Headline constrained to a readable measure and kept visually dominant.
- CTAs appear side by side when space allows.
- The primary image occupies most of the visual column; supporting tiles overlap or sit beneath it without obscuring faces.

### Tablet

- Maintain two columns only while both copy and imagery remain readable.
- Reduce overlaps and decorative offsets before reducing text size.

### Mobile

- Stack content in semantic reading order.
- Make both CTA controls full width.
- Keep the primary image visible; arrange supporting tiles in a compact two-column row.
- Prevent horizontal overflow and preserve at least 16-pixel side padding.

## Accessibility

- Use one descriptive Indonesian alt text for the primary image.
- Treat supporting images as decorative with empty alt text if their information is already conveyed by the primary image and copy.
- Preserve semantic heading order with a single hero `h1`.
- Maintain visible keyboard focus and sufficient text/CTA contrast.
- Do not place essential copy inside generated images.
- Respect reduced-motion preferences for any animation.

## Component and Data Boundaries

The change remains inside the existing homepage architecture:

- `HomePage` owns the hero composition.
- `homepageCopy` owns hero strings.
- Static assets live under `public/images/landing/`.
- Existing button style helpers and React Router links remain in use.

No new global state, API request, data flow, or runtime error state is introduced. A missing image is prevented through build-time/static-path verification rather than a new application-level error-handling system.

## Testing and Verification

Update the homepage test before implementation so it fails against the old hero and checks:

- Approved headline and subheadline are visible.
- Primary CTA label and `/auth/login` destination are correct.
- Secondary CTA label and `#simulasi` destination are correct.
- Three image elements are present with the intended accessible treatment.
- Existing `#fitur`, `#simulasi`, and `#harga` sections remain present and unchanged.

Final verification includes:

- Targeted homepage test.
- Production Vite bundle.
- Source audit proving no non-hero landing sections changed.
- Desktop and mobile visual inspection.
- Image file-size and dimension inspection.
- Diff check for whitespace errors.

Known repository-wide TypeScript and Vitest-worker issues will be reported separately if they still block the full verification commands; they do not authorize unrelated fixes within this hero task.

## Acceptance Criteria

- A visitor can identify the UTBK SNBT audience, product outcome, and next action within five seconds.
- Only the landing-page hero and its hero-specific copy/tests/assets change.
- The hero contains exactly three generated images and no unsupported claims.
- The primary CTA is visually dominant and starts the existing login/registration journey.
- The layout is usable from 320-pixel mobile width through large desktop screens.
- Generated images are stored inside the workspace, optimized, referenced locally, and contain no text, logos, or watermarks.
