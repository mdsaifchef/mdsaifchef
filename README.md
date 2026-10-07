# saif

Jekyll landing site for **Saif's Grill & Rolls**, an upcoming Indian fast food
restaurant (mostly non-veg). All names, prices, dates and contact details are
**placeholders**.

## Pages

| Page | Path | Print output |
| --- | --- | --- |
| Landing page | `/` | Screen-first |
| Tentative menu | `/menu/` | 2 x A4, veg / non-veg / egg marks, warm background |
| Advertisement flyer | `/flyer/` | 1 x A4 with tear-off contact strips |
| Print media | `/media/` | 3 x A4: table tent, 6 coupons, 10 business cards (85 x 55 mm) |
| Coming soon printable | `/coming-soon/` | A4 poster, A5 handout, social post/story |
| UPI payment signs | `/upi/` | Minimal and branded A4/A5 displays, social post/story |
| Restaurant print kit | `/print-kit/` | 14 selectable templates; A4/A5 and social formats |

Each printable page has a **Print** button. For the best results, print at
100% scale with "Background graphics" enabled (Chrome or Edge recommended).

## Editing content

- Restaurant name, tagline, address, phone, hours: `_config.yml`
- Menu items: `_data/menu.yml` (`type`: `veg` / `nonveg` / `egg`, `spice`: 0-3, optional `tag`; optional `sizes` list with `name` and `price` for size options)
- Combo deals: `_data/combos.yml`
- Header links, print-page cards and print-media coupon offers: `_data/navigation.yml`, `_data/print_pages.yml`, `_data/media.yml`
- Styles (screen and print): `assets/css/style.css`
- Print kit dates, template guidance and merchant payment details: `_data/print_kit.yml`
- Print kit copy and layouts: `_includes/print-artwork/` (one include per template ID, plus shared artwork partials), `assets/css/print-kit.css`
- Alternate theme: `assets/css/themes/variant.css`
- Theme defaults, palettes and URL settings: `assets/js/theme.js`
- Styling panel: `_includes/theme-controls.html`, `assets/css/theme-controls.css`

## Themes and decoration

**Original** remains the default cream/chilli/saffron design. Select **Charcoal
Glow** in the header for dark charcoal, ivory text and gold accents with a subtle
top-centre radial light. The same selection applies to the website, printed PDFs
and existing print-kit PNG downloads; switching themes does not change content.

Open **Customize theme** from the left-hand **Page controls** sidebar to choose
Charcoal & Gold, Midnight & Copper or Forest & Ivory, then adjust the
solid/radial background, base and glow colours, glow strength (0-60%) and position.
Border and outline have independent on/off,
solid/dashed/dotted/double styles, widths (0.25-2 mm) and colours. The outline gap
is 1-4 mm. Settings apply only to the variant; Original stays unchanged.

Both selectors also offer **Ornate** (curved corner flourishes) and **Geometric**
(stepped corners and diamond accents), which can be mixed independently. Each
has a **Motif size** control (2-8 mm), enabled only for an active decorative
style. These sizes are saved in shared links as `style-borderMotifSize` and
`style-outlineMotifSize`. Decorations use original, locally generated SVG images
and are included in printed PDFs and PNG downloads.

Motifs are automatically reduced to available padding and frame separation;
small-card motifs are capped at 2 mm. Ornamental strokes are capped at one tenth
of the effective motif size to keep the detail readable. Thus the requested
size/width may render smaller on tight layouts; no content or paper sizes change.

Frames are drawn inside designated artwork and website surfaces, not outside the
export crop. Small cards cap line widths at 0.6 mm and the gap at 1 mm to protect
text. Double lines may merge at small widths; use solid lines for the smallest
cards. Changing decoration never changes paper/card sizes. Cut/fold guides, diet
marks, white QR areas, the minimal payment sign and kids' sheet are excluded from
customization. Custom colours can reduce readability; the panel warns about low
text/accent contrast rather than overriding your choice.

**Copy styled link** shares the full appearance; the print kit's **Copy template
link** additionally includes its selected template and format. Theme settings
travel with internal page links and are kept in the URL, not browser storage.
For example, `/menu/?theme=glow` selects the default dark variant;
`/menu/?theme=glow&style-background=solid&style-border=off` disables its glow and
decorative border. Custom settings use `style-` query parameters defined in
`theme.js`. Invalid values display a warning and use the corresponding default.
**Reset variant** restores Charcoal Glow defaults. With JavaScript disabled,
Original is used and existing printing still works.

For PDFs, enable **Background graphics** and use actual size with browser headers
and footers off. Dark backgrounds use considerably more ink. PNG exports retain
the chosen background and frames; theme controls are never included. The theme
ID appears in downloaded filenames, and appearance controls are disabled while
an export is running. PNG downloads remain available on print-kit pages only;
menu, flyer and media pages retain their existing print/PDF workflow.

## Restaurant print kit

The kit extends the existing menu, flyer, coupons, business cards and specials
table tent with coming-soon and grand-opening posters, a soft-opening invitation,
two UPI payment signs, hours signage, specials cards, loyalty cards, takeout
thank-you inserts, a catering sheet, gift certificates, kids’ placemats, reserved
table tents and hiring posters. Shared fonts and cream/chilli/saffron colours
match the original site; the minimal payment sign and kids’ activity sheet use
an ink-saving white background.

Select a template and format, then use **Print** to print only that artwork.
Selections are stored in the page URL; **Copy template link** shares that version.
Without JavaScript all templates on the page print on A4.
On smaller screens, open **Page controls** to access the theme and print-kit settings.

### Paper and finishing

- **A4 (210 × 297 mm):** posters, hours signs, catering sheets, kids’ placemats.
- **A5 (148 × 210 mm):** invitations, handouts, specials cards, thank-you inserts,
  gift certificates and payment signs. Load A5 paper or export an A5 PDF.
- Use 100% / actual size, no browser headers/footers and background graphics on.
  Allow at least 10 mm safe space; these layouts do not require edge-to-edge printing.
  Preview the PDF after editing copy to check for overflow.
- Use 80–120 gsm paper for inserts and handouts; 200–300 gsm for cards and displays.
- The loyalty card is **85 × 55 mm**, one per A4 sheet; cut along its dashed border.
  The reserved tent uses A4: fold at the center line with text facing outward,
  then place in a tent holder. Both lock to A4 to preserve their dimensions.
- Gift certificates and offers are samples, not live promotions. Replace terms,
  dates and prices; use unique tracked certificate numbers before issuing gifts.

### Social images

Square posts are **1080 × 1080 px**; stories are **1080 × 1920 px**, with larger
top/bottom safe areas. Cards and folded tents are paper-only.

Choose a template and format, then **Download PNG**. Image quality controls the
render scale: **1×** gives the stated social dimensions, **2×** (default) doubles
each dimension for sharper output, and **3×** increases them further. Paper
formats can also be exported. Mobile preview scaling does not affect the image.
Only visible artwork is captured, without navigation, controls or preview shadows;
each logical sheet downloads separately as `template-format-theme-page-1.png`, etc.
Allow multiple downloads in your browser if prompted. If export fails or memory
is limited, try a lower quality or use Print to save a PDF.

Rendering runs locally in modern Chromium and Firefox using the bundled
[html2canvas 1.4.1](https://html2canvas.hertzen.com/) (MIT license, included under
`assets/js/lib/`); no image is uploaded and no frontend build step is needed.
The canvas uses a white background while preserving artwork colours. Fonts are
loaded before capture; custom cross-origin images/fonts require the host's CORS
permission. Prefer site-local images, and check exported QR codes before sharing.
html2canvas reproduces supported CSS rather than taking a native screenshot, so
preview exported files after changing artwork styles.

Copy template link shares a layout, not an image. Choose A4/A5 again before
printing; printing from a social preview automatically uses A4 and restores the
preview afterward.

### UPI QR setup

No fake or live payment QR is shipped. The empty QR area is explicitly marked
**not scannable**. Obtain the original square merchant QR from your payment
provider, save it under `assets/`, and set `payment.qr_image` in
`_data/print_kit.yml` to its site-relative path (for example,
`/assets/merchant-upi.png`). Set `merchant`, `upi_id` and `phone` to verified
details. Do not put credentials or private payment information in this public site.

The QR image is 62 mm square on paper, surrounded by 8 mm extra white padding
(320 px with 40 px padding on social artwork). Keep a quiet zone of at least four
QR modules; preserve the original image’s own quiet zone too. Use sharp black
modules on white, never crop or distort the image, and keep logos, cut/fold
lines and text outside the quiet zone. Use a counter stand or table holder,
avoiding glare from lamination. Check the final printed sign with multiple UPI
apps, confirm the merchant name and ID, and make a small test payment before
displaying or sharing. A social QR needs gallery scanning support or another
device. Template presence is not proof of payment; verify transactions separately.

## Run locally

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.
