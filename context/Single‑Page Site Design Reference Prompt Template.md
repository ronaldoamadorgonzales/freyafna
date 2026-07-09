# Single‑Page Site Design Reference Template (For NextJS/Payload CMS Projects)

Use this design reference to define the visual system, layout structure, content model, and thematic guidelines for a single‑page website. This reference will later be applied to a bare Payload CMS installation or used to redesign an existing Payload CMS site.

Replace bracketed sections with your project‑specific details.

---

## Purpose of This Design Reference

This document describes the **design system**, **layout structure**, **content requirements**, and **theme guidelines** for a simple, modern single‑page website.  
It does **not** generate code — it defines the design that developers or AI models will implement within Payload CMS and Next.js.

---

## Theme & Visual Identity

### Color Palette
Primary theme: **cyan or teal + white**

Suggested palette:
- **Primary:** `cyan-600` or `teal-600`
- **Accent:** `cyan-400`, `teal-400`
- **Background:** `white`, `gray-50`
- **Text:** `gray-800`, `gray-600`
- **Optional dark mode:**
  - Background: `gray-900`
  - Text: `gray-100`

### Typography
- Clean, modern sans-serif (Tailwind default or custom).
- Styles:
  - Headings: bold, tight tracking
  - Body: relaxed leading
  - Buttons: medium weight, rounded

### Spacing & Layout Rhythm
- Use generous spacing (`py-16`, `px-8`) for section separation.
- Maintain consistent vertical rhythm across sections.

---

## Page Layout Structure

The single‑page site consists of the following major sections:

### 1. Header (Navigation Bar)
- Sticky top navigation.
- Contains:
  - Logo (text or image)
  - Navigation links: **[Home]**, **[About]**, **[Services]**, **[Contact]**
  - Optional CTA button (e.g., “Get Started”)
  - Optional dark mode toggle
- Style:
  - White background
  - Cyan/teal accents
  - Minimal shadow or border

### 2. Hero Section
- Full‑width introductory section.
- Contains:
  - Main headline
  - Sub‑headline
  - Primary CTA button
  - Optional background image or gradient
- Suggested gradient:
  - `bg-gradient-to-r from-teal-500 to-cyan-600`

### 3. About Section
- Short narrative about the organization.
- Optional image or illustration.
- Content sourced from Payload CMS fields:
  - `title`
  - `body`
  - `image`

### 4. Services Section
- Grid layout (2–3 columns on desktop).
- Each service card includes:
  - Icon
  - Title
  - Short description
- Data sourced from Payload CMS collection:
  - `services`
    - `name`
    - `description`
    - `icon`

### 5. Featured Content Section (Optional)
Possible uses:
- Testimonials
- Case studies
- Featured products
- Highlights

Payload CMS collection:
- `featuredItems`
  - `title`
  - `description`
  - `image`
  - `link`

### 6. Contact Section
- Contact form:
  - Name
  - Email
  - Message
- Optional:
  - Map
  - Address
  - Social links

### 7. Footer
- Minimal footer with:
  - Copyright
  - Social icons
  - Optional mini‑menu

---

## Content Model Requirements (Payload CMS)

Define the following collections to support the design:

### `pages`
- `title`
- `slug`
- `sections` (flexible blocks)
- `seo` metadata

### `services`
- `name`
- `description`
- `icon`
- `order`

### `featuredItems` (optional)
- `title`
- `description`
- `image`
- `link`

### `contactSubmissions`
- `name`
- `email`
- `message`
- `timestamp`

### Global Settings
- `siteName`
- `logo`
- `primaryColor`
- `accentColor`
- `footerLinks`
- `navigationLinks`

---

## Component & Layout Guidelines

### Reusable Components
Define reusable components for:
- Header
- Hero
- Section wrapper
- Service card
- Featured item card
- Contact form
- Footer

### Section Wrapper
A universal wrapper component should support:
- Background color
- Padding
- Title
- Optional description
- Optional image

### Responsiveness
- Mobile‑first design.
- Breakpoints:
  - `sm`, `md`, `lg`, `xl`
- Ensure:
  - Hero text scales gracefully
  - Service cards stack on mobile
  - Footer remains minimal and readable

---

## Optional Enhancements & Suggestions

These are design considerations you may want to include:

### Branding & Identity
- Custom illustration style
- Logo variants (light/dark)
- Brand voice guidelines

### Interaction & Motion
- Smooth scroll
- Subtle fade‑in animations
- Button hover states

### Accessibility
- High contrast mode
- ARIA labels
- Keyboard navigation

### SEO & Metadata
- CMS‑driven meta title & description
- Open Graph image
- Social preview fields

### Performance
- Optimized images
- Lazy loading for sections
- Preloaded fonts

### CMS‑Driven Flexibility
- CMS‑editable hero section
- CMS‑editable navigation menu
- CMS‑editable footer links
- CMS‑editable color theme (primary/accent)

---

## Output Expectations

This design reference should produce:
- A clear visual and structural guide for a single‑page site.
- A Payload CMS‑ready content model.
- A theme specification (cyan/teal + white).
- A layout blueprint that can be applied to:
  - A fresh Payload CMS installation
  - A redesign of an existing Payload CMS site

