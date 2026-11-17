# Physimus Scientific Validation

## Purpose

This document defines the scientific checks used by Physimus. A rendered equation or a plausible animation is not, by itself, evidence that a model is physically correct.

## Automated checks in the Sandbox

The Sandbox performs dimensional consistency checks when it has known SI dimensions for the symbols involved.

- Addition and subtraction require equal dimensions. The literal zero is treated as dimension-polymorphic, so an initial condition such as `x(t)=0` remains valid.
- Multiplication adds dimension exponents; division subtracts them.
- Powers require a dimensionless numeric exponent.
- Trigonometric, inverse-trigonometric, hyperbolic, exponential, and logarithmic functions require dimensionless arguments.
- Known left-hand-side quantities are compared with the dimensions of their right-hand-side expressions. For example, `F=ma` must have dimensions of force, while `x(t)=v_0t` must have dimensions of length.
- Unknown symbols are not silently assigned a physical unit. If their dimensions are unknown, the checker cannot certify the equation.

The dimensional checker is a consistency filter, not a proof of a physical law. It does not infer every unit, verify every conservation law, or establish that the assumptions of a model match a real experiment.

## Reference models and assumptions

| Model | Reference equations | Required assumptions |
|---|---|---|
| Uniform motion | `x=x_0+vt`, `a=0` | One-dimensional motion; constant velocity |
| Constant acceleration | `x=x_0+v_0t+at^2/2`, `v=v_0+at` | One-dimensional motion; constant acceleration |
| Projectile motion | `x=x_0+v_0 cos(theta)t`; `y=h_0+v_0 sin(theta)t-gt^2/2` | Uniform gravitational field; no air resistance; angle measured from horizontal |
| Uniform circular motion | `v=omega r`, `a_c=omega^2 r` | Fixed radius and constant angular speed |
| Inclined plane | `N=mg cos(theta)`; `a=g(sin(theta)-mu_k cos(theta))` | Straight incline; sliding downhill; kinetic friction; no other applied forces |
| Mechanical energy | `E_m=K+U_g`; `Delta E_m=W_nc` | Include non-conservative work when friction or other dissipative forces act |
| 1D collision | Momentum conservation and coefficient of restitution | Isolated two-body system during impact; signed velocities; coefficient of restitution in [0,1] for ordinary passive impacts |
| Ideal spring | `omega=sqrt(k/m)`; `T=2 pi sqrt(m/k)` | Linear Hooke spring; no damping; small/ideal oscillation about equilibrium |

## Important interpretation rules

- Static friction is a self-adjusting force bounded by `0 <= f_s <= mu_s N`; it is not always equal to `mu_s N`.
- Kinetic friction is `f_k=mu_k N` while surfaces slide.
- Mechanical energy is conserved only when net non-conservative work is zero. With friction, use `E_{m,f}=E_{m,i}+W_{nc}` and account for thermal energy if tracking total energy.
- Momentum is conserved for an isolated system. Kinetic energy is conserved only for an elastic collision.
- A simulation that uses closed-form equations is an idealized model. It should not be described as a full real-world model when drag, deformation, rolling resistance, nonuniform fields, or other effects are omitted.

## Manual scientific review checklist

1. Check the equation's derivation and sign convention.
2. Check dimensions on both sides.
3. Test limiting cases (zero speed, zero acceleration, zero friction, zero angle, and equal masses where applicable).
4. Compare numerical outputs with an independently calculated reference case.
5. Check conservation residuals over the full simulated interval, not only at the start or end.
6. State the assumptions and the range in which the model is valid.

## Current validation boundary

The automated Sandbox dimensional checker covers known dimensions and reports detectable inconsistencies. The laboratory simulations still require independent regression tests for conservation residuals and parameter-boundary cases before they can be certified as fully scientifically validated.