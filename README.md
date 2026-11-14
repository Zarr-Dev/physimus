# Physimus

> **Physics Laboratory for Anyone.**  
> **Imagine. Experiment. Discover.**

Physimus is an open, web-based physics learning and experimentation environment. It is being designed to make physics more intuitive, visual, interactive, and accessible—from foundational school science to olympiad preparation and university-level exploration.

Inspired by the expressive, exploratory experience of tools such as Desmos, Physimus aims to bring mathematical models, physical simulations, measurements, and data analysis into one connected workspace.

**The ambition is not simply to explain how physics works. It is to give people the tools to investigate it for themselves.**

---

## Vision

To make high-quality physics exploration accessible to anyone with a web browser, regardless of location, educational level, or access to a physical laboratory.

Physimus seeks to connect three activities that are often separated:

1. **Learn** — understand physical phenomena, concepts, equations, and derivations.
2. **Experiment** — change conditions, run simulations, take measurements, and inspect results.
3. **Create** — construct and share custom experiments in an open physics sandbox.

The long-term goal is an approachable yet scientifically careful environment that can grow from school-level learning into computational and research-oriented physics.

## Mission

- Make abstract physical ideas easier to understand through interactive visualizations.
- Connect lessons directly to experiments that demonstrate the concepts being taught.
- Let learners create, modify, save, and reproduce their own experiments.
- Teach scientific reasoning: hypotheses, variables, measurements, uncertainty, and interpretation.
- Support a progression from foundational intuition to mathematical and computational depth.
- Keep the core experience accessible, browser-based, and local-first wherever practical.
- Build an extensible platform that can support contributions from educators, students, and developers.

## Product pillars

### 1. Physimus Academy — Learn

A structured physics library with bilingual learning content.

Planned content includes:

- Conceptual explanations and real-world phenomena.
- Mathematical equations and step-by-step derivations.
- Worked examples and practice problems.
- Learning paths at three depths:
  - **Foundation:** accessible introductions for middle- and early high-school learners.
  - **Advanced:** deeper mathematical treatment and olympiad-oriented problem solving.
  - **University:** calculus-based models, differential equations, and computational methods.

### 2. Physimus Laboratory — Experiment

A collection of guided, interactive experiments. Each experiment should connect a physical model to controls, visualizations, measurements, graphs, and analysis.

A laboratory activity may include:

- Initial conditions and adjustable parameters.
- A simulation view with play, pause, reset, and time controls.
- Observable quantities and measurement tools.
- Live graphs and data tables.
- Comparison between numerical results and theoretical predictions.
- Assumptions, limitations, and experiment notes.
- Exportable data for further analysis.

### 3. Physimus Sandbox — Create

A 2D-first environment where users can assemble and investigate their own physical systems.

The initial direction is a mechanics sandbox with components such as particles, rigid bodies, surfaces, springs, ropes, pulleys, inclined planes, and force vectors.

Planned capabilities include:

- Add, move, connect, and configure objects.
- Edit physical properties and initial conditions.
- Visualize forces, velocity, acceleration, and trajectories.
- Run, pause, reset, and replay simulations.
- Inspect equations, measurements, and graphs.
- Save and exchange experiment configurations.

The sandbox is intended to grow carefully: a reliable 2D mechanics foundation first, with 3D experiences considered later.

### 4. Physimus Research — Analyze

A workspace for interpreting experimental and simulated data.

Potential capabilities include:

- Graphing and data tables.
- Curve fitting and regression.
- Unit conversion and dimensional checks.
- Numerical-versus-analytical comparisons.
- Error and uncertainty analysis.
- CSV export and reproducible experiment records.

### 5. Community — Share

A future community space for sharing experiment configurations, learning resources, and classroom activities. Community features are not required for the first release.

---

## Initial subject roadmap

Physimus is intended to cover physics broadly, while developing each area to a useful level of quality rather than publishing many incomplete simulations.

| Area | Planned scope | Development priority |
|---|---|---|
| Mechanics | Kinematics, Newton's laws, energy, momentum, rotation, gravitation, oscillations, fluids, waves | **First** |
| Thermodynamics | Temperature, heat, ideal gases, thermodynamic laws, entropy, heat transfer | Later |
| Electromagnetism | Electric fields, circuits, magnetism, induction, Maxwell's equations | Later |
| Optics | Reflection, refraction, lenses, interference, diffraction, polarization | Later |
| Modern physics | Relativity, quantum concepts, atomic and nuclear physics | Later |
| Astrophysics and advanced topics | Celestial mechanics, stars, cosmology, plasma, computational physics | Long-term |

Supporting foundations will include measurement, experimental methods, mathematical tools for physics, numerical methods, and uncertainty analysis.

## Who is Physimus for?

Physimus is designed for a broad audience:

- **Middle-school learners** exploring physical phenomena for the first time.
- **High-school students** building conceptual and mathematical understanding.
- **Olympiad learners** investigating challenging mechanics and quantitative models.
- **University students** exploring calculus-based physics and numerical simulations.
- **Educators and lecturers** preparing demonstrations, activities, and laboratory exercises.
- **Independent learners and enthusiasts** who want to experiment out of curiosity.

The interface should be welcoming to beginners without imposing an artificial ceiling on advanced users.

---

## Design principles

### Visual, but scientifically meaningful

Visualizations should clarify the underlying model—not merely decorate the page. Whenever possible, users should be able to inspect the quantities and equations behind an animation.

### One model, multiple views

A single experiment model should power its simulation, equations, measurements, graphs, and analysis. This avoids contradictory results between separate visual components.

### Experimentation over passive consumption

Users should be encouraged to change parameters, make predictions, compare outcomes, and explain what they observe.

### Scientific transparency

Every experiment should document its assumptions, units, applicable conditions, and known limitations. Idealized simulations must be clearly identified as idealized.

### Accessible and inclusive

The product should work across common browsers and screen sizes, support keyboard navigation, and provide both Indonesian and English interfaces.

### Local-first

The first version should not require an account or backend for its core learning and simulation experience. Local saving and import/export should be prioritized before cloud synchronization.

---

## Technical direction

The initial architecture is planned around a modular web application.

| Layer | Initial direction |
|---|---|
| Application | React + TypeScript |
| Development and build | Vite |
| UI state | Zustand or an equivalent lightweight state layer |
| 2D rendering | HTML Canvas and SVG |
| 3D rendering | Three.js in a later phase |
| Mathematics | Math.js for controlled expression evaluation |
| Equation typesetting | KaTeX |
| Graphs | Plotly.js or a carefully selected plotting library |
| Persistence | IndexedDB and downloadable project files |
| Background computation | Web Workers when simulation workloads require them |
| Hosting | Static web hosting for the initial release |

The **Physimus Core** is intended to keep physics models, numerical solvers, simulation runtime, rendering, and data analysis separate.

This separation is important: a physics model should not depend on React or a particular renderer. The same model should be reusable in a guided laboratory experiment and in the free-form sandbox.

### Numerical and scientific standards

The project will progressively introduce:

- Explicit and semi-implicit Euler methods.
- Runge–Kutta methods, including RK4.
- Controlled simulation timesteps.
- Unit-aware parameters and dimensional validation.
- Tests against analytical solutions where available.
- Conservation checks for appropriate physical systems.
- Numerical error, stability, and convergence tests.
- Reproducible initial conditions and experiment configurations.

No numerical method is universally best. Solver choice and timestep must be appropriate to the model and documented.

---

## Visual identity and typography

Physimus should feel modern, clear, and approachable while retaining a scientific character.

The initial typography system is:

| Use | Typeface / system | Role |
|---|---|---|
| Headings and display titles | **Space Grotesk** | Distinctive, geometric headings |
| Body text and interface | **Inter** | Highly readable paragraphs, labels, and controls |
| Mathematical notation and official equation numerals | **KaTeX math fonts** | Consistent mathematical typesetting through KaTeX |

**Typography note:** LaTeX is a mathematical typesetting system, not a single font family. Physimus will use KaTeX to render LaTeX-style equations. Its math font set will be the official visual system for equation symbols and numerals, rather than using ordinary UI text fonts inside equations.

Recommended font loading for the future website:

- Space Grotesk: headings, section titles, and prominent numeric display labels.
- Inter: body copy, navigation, buttons, form controls, and general interface text.
- KaTeX: equations, mathematical expressions, and equation-associated numerals.

The design system should also define spacing, color tokens, typography scales, light/dark themes, and accessible contrast ratios.

---

## Development roadmap

The roadmap is deliberately staged so that the scientific foundation is validated before the platform expands.

1. **Project foundation** — repository documentation, design tokens, application scaffold, coding standards, and continuous integration.
2. **Physimus Core v0.1** — physics model contracts, simulation state, clock, fixed-step runtime, basic solvers, and units.
3. **Physics Workspace** — 2D canvas, parameter controls, equation panel, graph panel, and simulation controls.
4. **Mechanics Laboratory** — validated experiments such as projectile motion, Newtonian dynamics, oscillations, and collisions.
5. **Mechanics Sandbox 2D** — object library, properties, forces, interactions, and custom experiment configurations.
6. **Academy and bilingual content** — structured lessons, derivations, examples, and exercises in Indonesian and English.
7. **Local-first workflows** — save/load, IndexedDB, project JSON import/export, and CSV data export.
8. **Advanced physics and community** — additional physics domains, optional accounts, collaboration, and 3D exploration.

Milestones should be accepted based on working demonstrations, automated tests, scientific validation, and usability—not feature counts alone.

## Project status

**Status: Planning and architecture.**

The repository is currently being prepared. The product vision, initial scope, and technical direction are being documented before the main website and simulation engine are implemented.

The first implementation target is a small but complete mechanics workspace: one validated projectile-motion model, synchronized simulation and graphs, editable parameters, and reproducible results.

## Contributing

Physimus is intended to become an open and collaborative educational project. Contribution guidelines, issue templates, and review standards will be added as the repository and implementation mature.

Potential contribution areas include:

- Physics models and numerical methods.
- Educational explanations and translations.
- Experiments and visualization design.
- Accessibility, performance, and testing.
- Documentation and examples.

Scientific contributions should include sources, assumptions, units, and tests whenever applicable.

## License

A project license has not yet been selected. Until a license is added, the repository should be treated as having no explicit open-source reuse grant. A license will be chosen before inviting external code contributions.

---

**Physimus — Imagine. Experiment. Discover.**  
*Making physics explorable for everyone.*
