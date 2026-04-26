# English Content Refresh Design

## Goal

Refresh the public site so it reads as a current English-language personal site instead of a migrated legacy archive.

## Homepage

- Replace the current homepage hero with a split layout.
- Keep the left side focused on the primary positioning and calls to action.
- Replace the right-side `Signal` card with a short biography block.
- Remove text that frames the site as the old Rustyroboz site, a legacy archive, or a migrated portfolio.

## Site Language

- Translate visible UI copy from Spanish to English across navigation, buttons, list pages, detail pages, chat, lab, notes, footer, and RSS description.
- Set document language and locale-oriented labels to English where the UI renders them.

## Content

- Translate Spanish MDX pages and articles into English.
- Fix mojibake and corrupted characters in visible content.
- Keep external links unchanged.
- Rewrite old internal article-to-article references so they point to the current-site routes when an equivalent local route exists.

## Constraints

- Preserve the existing site structure, routes, and editorial style.
- Avoid unrelated visual redesign beyond the approved homepage hero cleanup.
- Do not remove external social or publication links that remain valid.

## Testing

- Update route/component tests to assert the new English UI and homepage hero.
- Verify content loading still resolves translated entries and local cross-links.
