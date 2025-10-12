# Color Scale Configurator

<!-- Reason: Project README to document new structure and usage. -->

This project upgrades an OKLCH-based color scale generator into a real-time Configurator UI with export options and tests.

- Tech: Next.js, TypeScript, Tailwind CSS v4, Vitest
- Goals: Input space switcher, global lightness shift, naming patterns, WCAG badges, multiple exports, URL share, a11y, web worker performance, tests.

## Scripts

- dev: Start development server
- build: Production build
- test: Run unit tests

## New Structure Highlights

- src/components: Configurator UI components (picker, controls, swatches, export tabs, preview, toast)
- src/lib/color: Conversion, scale, contrast, serializer
- src/lib/a11y: WCAG helpers
- src/lib/worker: Palette web worker
- src/store: Palette state (can be swapped to Zustand later)
- src/tests: Vitest suites

## Next Steps

- Wire components into the page and add state sync via URL
- Replace local store with Zustand
- Implement export payloads and clipboard toasts
