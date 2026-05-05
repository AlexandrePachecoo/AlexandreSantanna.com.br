# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Presente de Dia das Mães com IA** is a landing page for WLG Distribuidora that enables customers to create personalized Mother's Day gifts powered by AI. The product flow:

1. Upload up to 10 photos
2. Enter recipient info (name, age) and a personal message
3. AI generates exclusive artwork with title and harmonious composition
4. AI generates an emotional video with smooth transitions
5. AI narrates the message or applies instrumental music

The site is entirely static (no build tools needed) and emphasizes emotional design with Mother's Day theming (rose/cream palette).

## Stack

- **HTML**: Semantic structure with form handling for the gift creation flow
- **CSS**: Custom design system using CSS variables, responsive (mobile-first)
- **JavaScript**: Vanilla ES6 (IIFE), no dependencies
  - Countdown timer (calculates next Mother's Day: 2nd Sunday of May in Brazil)
  - Character counter for message textarea
  - Drag-and-drop + click file upload with preview
  - Form validation and submission
  - Scroll-triggered animations using Intersection Observer

## Running Locally

```bash
# Simple HTTP server (no build step needed)
python3 -m http.server 8000
# or
npx http-server

# Then open http://localhost:8000 in your browser
```

## File Structure

- **index.html** (358 lines): Main template with hero, countdown, steps, examples, form, FAQ, footer
- **styles.css** (21KB): Complete design system; organized by sections (header, hero, sections, forms, buttons, animations)
- **script.js** (194 lines): Vanilla JS in IIFE pattern, covering countdown, file upload, form interaction, scroll reveals
- **README.md**: Product description and usage

## Key Patterns

### JavaScript
- Encapsulation via IIFE to avoid global scope pollution
- Null-safe DOM queries: all event listeners check element existence before attaching
- Event delegation where appropriate (file upload uses input change, not file object tracking)
- Intersection Observer for progressive enhancement (fallback if not supported)

### CSS
- Design tokens (color, spacing, shadows, radius) in `:root` as custom properties
- Typography: serif (Playfair) for headings, sans (Inter) for body
- Responsive scales: `clamp()` for fluid typography
- Responsive grid: flex + mobile-first media queries
- Backdrop blur for sticky header with fallback filter

### Form Validation
- HTML5 validation attributes (`required`, `type="email"`, `maxlength`, `min/max`)
- Client-side `form.checkValidity()` before submission
- Character counter updates live in textarea
- Photo upload limited to 10 files; filters only image/* types

## Next Steps (From README)

The frontend is complete. Integration tasks:

1. **Backend endpoint**: Connect form submit to API that triggers the AI pipeline
2. **Image generation**: Integrate GPT-4 Vision / DALL·E for art generation
3. **Video generation**: Implement AI video composition + smooth transitions
4. **Text-to-speech**: Integrate TTS service for message narration
5. **Payment & delivery**: Add payment gateway and email delivery system

Form submission currently shows a success state after 900ms demo delay. Replace the setTimeout mock in `script.js:160` with actual API call.

## Design Notes

- Color palette intentionally warm (roses, creams, golds) for emotional connection
- All interactive elements have hover/focus states
- Animations use `reveal` class with scroll intersection for progressive disclosure
- Form has success confirmation card that scrolls into view after submission
- Details/summary elements for FAQ (accessible without JavaScript)
