# English Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the public-facing site to English, remove old-site framing, replace the homepage signal card with a split hero plus bio block, and repair visible mojibake.

**Architecture:** Keep the existing Next.js + MDX structure intact. Update route/component copy first, then translate MDX content and repair internal local links without changing route slugs.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, MDX content files

---

### Task 1: Lock the new homepage and UI expectations in tests

**Files:**
- Modify: `apps/web/tests/routes.test.tsx`
- Modify: `apps/web/tests/chat-experience.test.tsx`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run the targeted test command and verify failure**
- [ ] **Step 3: Update route and chat copy to match the new English UI**
- [ ] **Step 4: Re-run the targeted tests and verify they pass**

### Task 2: Implement the homepage split hero and English UI copy

**Files:**
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/components/content-hero.tsx`
- Modify: `apps/web/components/content-card.tsx`
- Modify: `apps/web/components/content-detail-page.tsx`
- Modify: `apps/web/components/site-header.tsx`
- Modify: `apps/web/components/site-footer.tsx`
- Modify: `apps/web/lib/site-config.ts`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/app/projects/page.tsx`
- Modify: `apps/web/app/articles/page.tsx`
- Modify: `apps/web/app/notes/page.tsx`
- Modify: `apps/web/app/lab/page.tsx`
- Modify: `apps/web/app/chat/page.tsx`
- Modify: `apps/web/app/rss.xml/route.ts`

- [ ] **Step 1: Implement the split hero with bio panel**
- [ ] **Step 2: Translate visible route/component labels to English**
- [ ] **Step 3: Remove old-site/legacy framing copy**
- [ ] **Step 4: Re-run route and chat tests**

### Task 3: Translate MDX pages and articles and repair local links

**Files:**
- Modify: `content/pages/about.mdx`
- Modify: `content/pages/contact.mdx`
- Modify: `content/articles/12-testers-14-dias-y-un-subreddit-asi-publique-mi-primera-app-en-google-play.mdx`
- Modify: `content/articles/de-mvp-cogiendo-polvo-a-google-play-la-resurreccion-de-cartastrofe.mdx`
- Modify: `content/articles/descubriendo-los-perfiles-profesionales-del-mundo-de-los-datos.mdx`
- Modify: `content/articles/genera-imagenes-de-tu-cara-con-stable-diffusion-y-dreambooth.mdx`
- Modify: `content/articles/guia-rapida-para-usar-entornos-virtuales-en-python.mdx`

- [ ] **Step 1: Translate frontmatter and body copy to English**
- [ ] **Step 2: Repair mojibake and punctuation in visible text**
- [ ] **Step 3: Retarget local internal links to current-site routes**
- [ ] **Step 4: Re-run content-focused tests**

### Task 4: Final verification

**Files:**
- Modify: `apps/web/tests/content.test.ts`

- [ ] **Step 1: Update content expectations if translated titles changed**
- [ ] **Step 2: Run `npm.cmd test -- --run src/lib/api.test.ts` only if related files changed**
- [ ] **Step 3: Run the relevant web Vitest suite**
- [ ] **Step 4: Review the diff for leftover Spanish UI or old-site framing**
