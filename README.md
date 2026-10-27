# Tower Land Contracting L.L.C — Website

Static, bilingual (English / Arabic) website for Tower Land Contracting L.L.C.
Plain HTML, CSS and JavaScript — no build step, no dependencies. Upload the
folder to any static host (Netlify, Vercel, GitHub Pages, cPanel, S3…).

## Structure

```
index.html        Home
about.html        About us (story, mission/vision, values, office gallery, licence)
services.html     Six services with detailed scope lists
projects.html     Project grid with category filter
contact.html      Contact details, map and quote request form
assets/
  css/style.css   All styles (colour tokens at the top)
  js/i18n.js      Arabic translations
  js/main.js      Language switch, menu, animations, filter, form
  img/            Logo mark (SVG) and optimised office photos
external/         Original source photos (not used by the site directly)
```

## Run locally

```bash
python3 -m http.server 8137
```

Then open http://localhost:8137.

## How the language switch works

English text is written directly in the HTML. Any element with
`data-i18n="some.key"` is replaced by `TL_I18N.ar["some.key"]` from
`assets/js/i18n.js` when a visitor picks Arabic; the page switches to
right-to-left automatically. The choice is remembered, and `?lang=ar` in a URL
opens a page in Arabic.

To change text: edit the English in the HTML **and** the matching Arabic key
in `i18n.js`.

## Placeholders to replace before going live

| What | Where | Current value |
|------|-------|---------------|
| Phone number | all pages (header CTA, footer, contact) | `+971 4 XXX XXXX` / `tel:+9714XXXXXXX` |
| WhatsApp number | all pages (floating button, footer, contact) | `wa.me/971XXXXXXXXX` |
| Email | footer, contact page, form `data-email` | `info@towerland.ae` (please confirm) |
| Office address | footer, contact page, `i18n.js` → `contact.address` | `Office No. XXX, Dubai…` |
| Working hours | footer, contact page, `i18n.js` → `contact.hours` | `Mon – Sat: 8:00 AM – 6:00 PM` |
| Map | `contact.html` iframe `src` | generic "Dubai" map |
| Key figures (15+, 120+, 300+, 98%) | `index.html` stats + "15+" photo tag | sample numbers |
| Trade licence number | `about.html` licence strip | `XXXXXX` |
| Social media links | footer of every page | `href="#"` |
| Projects | `projects.html` (+ `i18n.js` → `projects.*`) | six sample projects with logo placeholders |

Quick check for anything left over:

```bash
grep -rn "XXX\|href=\"#\"" *.html assets/js/i18n.js
```

### Adding real project photos

Inside a `.project-card`, replace the placeholder block

```html
<div class="project-placeholder"><img src="assets/img/logo-mark.svg" alt=""></div>
```

with an image, e.g.

```html
<img src="assets/img/projects/villa-dubai-hills.jpg" alt="Private villa, Dubai Hills" loading="lazy">
```

Keep photos around 1200–1600px wide and compressed (JPEG quality ~80).

## Quote form

Because the site is static, the form opens the visitor's email app with the
details pre-filled (sent to the address in the form's `data-email`). To receive
submissions directly without relying on the visitor's mail app, use a form
service such as Formspree or Netlify Forms: set the form's `action` to the
service URL, `method="post"`, and remove the form handler at the bottom of
`assets/js/main.js`.
