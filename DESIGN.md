# DESIGN — AICoachLab
Source of truth: `agents/design-system` (MASTER.md). This file is the project pointer.

- Accent: `#ec13d6` on bg `#0c0714`
- Layout/palette/bg animation/GA4/flags: overridable by the hub via Edge Config `theme_aicoachlab` (loaded by `lib/theme-loader.ts`, applied in `app/layout.tsx`); hub values win over the defaults here.
- Background: `components/AnimatedBg.tsx` (hub `layout.bgAnimation`, reduced-motion safe, default `none` = unchanged look).
- Logo: `components/Logo.tsx` (used in the navbar/header); favicon is static `app/icon.svg` (no `app/icon.tsx`).

## AI platform (ai-core) status
Not on ai-core yet (honest gap): coaching chat uses the local free chain (`lib/ai.ts`). No document upload/RAG/memory in scope; exempt until such a feature exists.
