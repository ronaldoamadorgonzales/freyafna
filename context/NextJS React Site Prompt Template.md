# Next.js React Website Prompt Template (Next.js + Tailwind + Framer Motion + Shadcn UI)

Use this template as a base and fill in the bracketed sections to suit your project.

---

## High-level instruction

Create a fully responsive, visually stunning, and modern Next.js/React website using Tailwind CSS and Framer Motion, designed with premium aesthetics (dark/light mode support, smooth scroll-driven animations, custom typography, and micro-interactions).

This website will be used for: **[describe your use case: e.g., SaaS landing page, professional portfolio, digital agency site, mobile app showcase, e-commerce landing page]**.

---

## Layout & Navigation requirements

- **Global Navigation Bar (Header)**
  - Sticky/glassmorphic header (using backdrop-blur) that shrinks or changes shadow on scroll.
  - Logo placeholder (supports text and SVG icon).
  - Animated navigation links with hover slide-lines or background highlights.
  - Mobile drawer menu (slide-out or full-screen) with toggle animation.
  - Theme Toggle (Light/Dark mode) with smooth icon transition (Sun/Moon).
  - Call to Action (CTA) button in the header (e.g., "**[Header CTA Text: e.g., Get Started, Contact Us]**").

- **Responsive Footer**
  - Multi-column footer layout:
    - Column 1: Brand description and social media icons with hover animations.
    - Column 2: Product / Service links.
    - Column 3: Company / Resource links.
    - Column 4: Newsletter subscription input (with client-side email validation and interactive submit states).
  - Bottom row with copyright notice, privacy policy, and terms of service links.

---

## Section components

### 1. Hero Section
Create an high-impact Hero section at the top of the home page:
- **Visuals**:
  - **[Theme/Visual Style: e.g., abstract dynamic gradients, isometric grid lines, interactive particle effects, product mockups/screenshots]**.
  - Animated entrance for headings, subheadings, and CTAs (e.g., staggered slide-ups).
- **Content**:
  - Main Heading (H1) with a gradient text highlight: "**[Hero Heading: e.g., Supercharge Your Workflow in Minutes]**".
  - Subtitle: "**[Hero Subtitle: e.g., The ultimate collaboration platform for modern development teams.]**".
  - Two CTA Buttons:
    - Primary button (solid color, shadow, hover scales up).
    - Secondary button (outline or ghost, hover background shift).

### 2. Feature Grid / Showcase
A grid displaying the core features or benefits of the product/service:
- Responsive grid (1 column on mobile, 2 columns on tablet, 3 columns on desktop).
- Cards should have:
  - Custom SVG icons matching the theme.
  - Heading and short text description.
  - Hover effects: subtle card lift, color shift, or glowing borders.
- Provide content/placeholders for 6 features related to: **[Describe key features: e.g., speed, collaboration, analytics, security, integrations, scalability]**.

### 3. Interactive Pricing Section
A pricing table component supporting subscription cycles:
- **Interactive Toggle**: Switch between Monthly and Yearly pricing (with a discount label, e.g., "Save 20%").
- **Pricing Cards** (e.g., Starter, Pro, Enterprise):
  - Pro card should be visually highlighted (e.g., "Most Popular" badge, gradient borders, shadow-lg).
  - Pricing details: Plan name, price, description, feature list with checkmark icons.
  - Dynamic pricing animation when toggling between monthly and yearly cycles.

### 4. Testimonial / Review Slider
A clean, trustworthy slider or grid of user testimonials:
- Slider navigation (previous/next arrows) or auto-sliding masonry layout.
- Individual cards with:
  - Star rating.
  - Testimonial text.
  - User avatar, name, and title/company.
- Provide placeholders for 3–4 testimonials.

### 5. Accordion FAQ Section
An interactive accordion component for frequently asked questions:
- Smooth expand/collapse animations (preferably using Framer Motion heights or Tailwind transitions).
- Icon rotation (e.g., plus icon rotating 45 degrees into close cross, or chevron flip).
- Provide content for 4–5 sample FAQs related to: **[FAQ topics: e.g., pricing, onboarding, integrations, support]**.

---

## Form & Form Submission requirements

Include a reusable Contact / Inquiry section with:
- **Contact Form**:
  - Input fields for: Name, Email, Subject (dropdown), and Message.
  - Real-time client-side validation (e.g., email format check, empty fields validation).
  - Clear error states (red borders, helper text) and success state (confetti or custom success message card upon submission).
- **Backend / Integration readiness**:
  - Form submitted via Next.js Server Actions or a route handler endpoint.
  - Standardized JSON request structure mapping fields to a helper function `lib/formHandler.ts`.
  - Configurable destination API endpoint or Webhook URL via `.env` variables.

---

## Styling & Animations

- **Color Palette & Theme**
  - Base Theme: **[Theme Palette: e.g., dark slate background with neon violet accents, warm beige with terracotta accents, clean minimal white with emerald green accents]**.
  - Implement dynamic theme values (Primary, Secondary, Accent, Background, Text) using Tailwind's CSS variable mapping.
  - Define custom Tailwind configurations if necessary (e.g., extended animations, custom shadows).

- **Animations & Micro-interactions (Framer Motion / CSS)**
  - Hover state transitions on all links, buttons, and card components.
  - Scroll-triggered animations: Fade-in and slide-up components as they enter the viewport (`whileInView` with `viewport: { once: true }`).
  - Staggered layout animations for list components (e.g., feature grids, pricing features).

- **Typography**
  - Use custom modern Google Fonts: **[Google Font name: e.g., Inter, Plus Jakarta Sans, Outfit, DM Sans]**.
  - Proper typographic scale from H1 down to small caption sizes.

---

## Technical requirements

- **Next.js & React Structure**
  - Built for **Next.js App Router** (`app/` directory).
  - Proper separation of React Server Components (RSC) for page static parts and Client Components (`"use client"`) for interactive elements (pricing toggle, accordion, mobile drawer, contact form).
  - Type-safe components using **TypeScript**.

- **SEO & Performance**
  - Built-in metadata generation (e.g., custom Page titles, description, keywords, Open Graph image definitions).
  - Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`).
  - Next.js `<Image />` optimization with correct widths, heights, and alt text.

- **Component Organization**
  - Maintain a clean, modular project structure:
  ```
  components/
    ui/          # Low-level reusable components (Button, Input, Accordion)
    layout/      # Site structure components (Header, Footer, MobileNav)
    sections/    # Page-specific sections (Hero, Features, Pricing, Testimonials, FAQ, Contact)
  hooks/         # Custom React hooks (e.g., useTheme, useForm)
  lib/           # Utilities (Tailwind merge helpers, analytics, form handlers)
  types/         # TypeScript definitions
  app/           # Next.js App Router layout and pages
  ```

---

## Output expectations

Deliver:
- Complete component code structured inside the modular layout.
- A fully styled Tailwind CSS configuration (`tailwind.config.js` or standard configurations) including theme variables.
- An example index page (`app/page.tsx`) rendering all defined sections in order.
- Clear code comments explaining state management (e.g., how the light/dark mode transitions, how monthly/yearly pricing values toggle).
- No placeholder libraries or broken imports; use standard inline SVG icons or lucide-react if icon packages are configured.
