# Physimus Design System

**Status:** Initial UI direction, implemented in the first web prototype.

## Product character

Physimus should feel like a focused scientific tool: calm, precise, open, and approachable. The interface takes inspiration from the expression-list and coordinate-plane workflow of graphing tools such as Desmos, while making physical models, time-based simulation, vectors, and measurements first-class concepts.

The interface should reduce decoration, not capability. Keep the workspace visually quiet so equations, plotted results, and experiment controls carry the attention.

## Visual principles

1. **One dominant task per screen.** The homepage introduces the product; the laboratory gives most of its space to the experiment.
2. **Information hierarchy over card density.** Prefer whitespace, dividers, labels, and compact panels over many nested cards.
3. **The graph is the hero of the workspace.** The coordinate plane should occupy the largest area.
4. **Equations are editable concepts, not decoration.** Expressions, parameter controls, graph visibility, and measurements should remain connected.
5. **Use color semantically.** Blue identifies the primary motion/position series, green identifies the vertical component, and amber is reserved for time cursors or vector emphasis.
6. **Responsive without shrinking into clutter.** On narrow screens, the graph appears before the expression and parameter panel.

## Typography

| Purpose | Typeface | Usage |
|---|---|---|
| Headings | Space Grotesk | Page titles, section headings, important labels |
| Body and interface | Inter | Paragraphs, controls, navigation, measurements |
| Equations and mathematical numerals | KaTeX math fonts | LaTeX-rendered equations and mathematical notation |

LaTeX is a notation and typesetting language, not a typeface. Physimus uses KaTeX to render LaTeX expressions using its mathematical font set. Do not approximate equation typography with Inter or Space Grotesk.

## Color tokens

| Token | Value | Purpose |
|---|---|---|
| Ink | #1B2B40 | Main text |
| Muted | #78889B | Supporting text |
| Border | #E8EDF3 | Dividers and outlines |
| Blue | #347FD5 | Primary action and horizontal position |
| Blue soft | #EDF5FE | Selected state |
| Green | #4DA786 | Vertical component and positive state |
| Amber | #D99A46 | Vector/time emphasis |
| Surface | #FFFFFF | Main surfaces |
| Subtle | #F8FAFC | Quiet background areas |

The first release uses a light-first visual system. Dark mode may be added later as an alternative theme, but should not compromise contrast or graph readability.

## Homepage composition

- Minimal top navigation with Discover, Laboratory, Learn, and Sandbox.
- One hero message, one explanatory paragraph, one primary action.
- Language selection (English / Bahasa Indonesia) visible directly in the hero.
- One restrained scientific illustration, based on a trajectory and coordinate grid.
- A compact three-part explanation: learn, experiment, create.
- One featured experiment preview.
- Avoid overfilling the landing page with topic cards, badges, counters, or decorative panels.

## Laboratory workspace

The workspace uses a two-column composition:

- **Left expression panel:** model equations, visibility controls, and parameter sliders.
- **Main graph workspace:** graph mode selector, plot tools, coordinate plane, playback controls, and compact live readouts.

The main workspace should support:

- Trajectory view (x against y).
- Position-versus-time view (x(t) and y(t)).
- Grid visibility.
- Velocity component vectors.
- Motion trail.
- Play, pause, reset, timeline scrubbing, and playback speed.
- Current position and speed measurements.
- Project JSON import/export and CSV data export.

Avoid a permanent third sidebar in the initial experience. Additional analysis can be shown through tabs or collapsible panels when it becomes necessary.

## Interaction principles

- Every visible control must perform its labeled action.
- Changing a model parameter resets the current run and updates all dependent views.
- The same model parameters drive the graph, simulation marker, equations, and data export.
- Imported project files must be schema-checked and numeric parameters clamped to supported ranges.
- Graph toggles must have visible effects.
- Provide keyboard focus styles, accessible labels, and sufficient contrast.
- On small screens, preserve readable controls and make the graph usable without horizontal page scrolling.

## Scientific presentation

The current projectile-motion demonstration represents an ideal model with equal launch and landing heights, uniform gravitational acceleration, and no air resistance. The interface must disclose these assumptions. Theoretical results should not be described as measured experimental data.

## Implementation notes

The current prototype uses React and TypeScript, Canvas 2D for graph rendering, KaTeX for equations, and browser file APIs for project/CSV export. The coordinate plane is redrawn when model state changes and resized through a persistent ResizeObserver.

This document describes the current design direction. As the workspace grows, changes to layout, typography, tokens, and interactions should be recorded here before being implemented.
