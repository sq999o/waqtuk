# Dev 4 shared components

StatCard, EmptyState and DonutChart now replace their Phase 0 placeholders. Import
them through the existing ui/charts barrels. No export, prop name or dependency changes.

- StatCard: label, value (including zero), optional hint; neutral/success/warning/danger/info
  colour the hint only. The page can supply its own className/style for card variants.
- EmptyState: optional title, message and action node. Text and the action handler belong
  to the page, so the component never invents prototype messages or navigation.
- DonutChart: segments [{ id, label, minutes, color }], centerValue, centerLabel,
  showLegend=true. Geometry uses actual minute ratios. The legend uses the shared
  percentages() largest-remainder helper and formatDuration(), in the supplied order.
  Zero values stay in the legend but draw no arc; empty data shows a neutral track.
  Invalid/negative/noninteger minute values are treated as zero. Supply unique segment IDs.

All components forward className and root HTML/event props. Only category colours
come from data; all other colours use theme tokens. Cards use 16px radii and 24px
padding. DonutChart wraps naturally in narrow containers without a private breakpoint.
SVG title/description IDs use React useId, including multiple charts on the same page.
The accessible description remains present when the legend is hidden.

Run node scripts/check-shared-components.mjs (7 groups), npm run check:contracts,
and npm run build. The test uses the existing Vite/React tools, with no added package.
These are reusable components; their appearance on product pages depends on those
pages importing them. ComponentsPreview remains owned by Dev 2 and is unchanged.
