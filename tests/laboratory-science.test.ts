import { describe, expect, it } from "vitest";
import { collisionResults, labs, makePoints, projectileFlightTime, projectileStateAt, type Lab } from "../src/App";

function getLab(id: Lab["id"]): Lab {
  const lab = labs.find((item) => item.id === id);
  if (!lab) throw new Error(`Missing laboratory: ${id}`);
  return lab;
}

function points(id: Lab["id"], overrides: Record<string, number> = {}) {
  const lab = getLab(id);
  const values = Object.fromEntries(lab.params.map((parameter) => [parameter.key, parameter.initial]));
  return makePoints(lab, {
    gravity: 9.81,
    inclineAngle: 30,
    initialSpeed: 0,
    appliedWorkForce: 0,
    impactDuration: 0.05,
    dampingRatio: 0,
    phaseDegrees: 0,
    ...values,
    ...overrides,
  });
}

describe("mechanics laboratory models", () => {
  it("keeps all eight default laboratory simulations finite", () => {
    expect(labs).toHaveLength(8);
    for (const lab of labs) {
      const samples = points(lab.id);
      expect(samples.length, lab.id).toBeGreaterThan(1);
      for (const sample of samples) {
        for (const value of [sample.t, sample.x, sample.y, sample.vx, sample.vy, sample.speed, sample.kinetic, sample.potential]) {
          expect(Number.isFinite(value), `${lab.id} produced ${value}`).toBe(true);
        }
      }
    }
  });

  it("matches the analytical projectile range, apex, and flight time", () => {
    const values = { speed: 24, angle: 52, height: 0, mass: 1, gravity: 9.81, x0: 0 };
    const theta = (values.angle * Math.PI) / 180;
    const expectedTime = (2 * values.speed * Math.sin(theta)) / values.gravity;
    const expectedRange = values.speed * Math.cos(theta) * expectedTime;
    const expectedApex = (values.speed * Math.sin(theta)) ** 2 / (2 * values.gravity);
    const flightTime = projectileFlightTime(values);
    const finalState = projectileStateAt(flightTime, values);

    expect(flightTime).toBeCloseTo(expectedTime, 8);
    expect(finalState.y).toBeCloseTo(0, 7);
    expect(finalState.x).toBeCloseTo(expectedRange, 7);
    expect(projectileStateAt(expectedTime / 2, values).y).toBeCloseTo(expectedApex, 7);
    expect(points("projectile", values).at(-1)?.x).toBeCloseTo(expectedRange, 6);
  });

  it("uses the linear-drag solution consistently and returns a ground-crossing time", () => {
    const values = { speed: 20, angle: 40, height: 2, mass: 1, gravity: 9.81, dragBeta: 0.15 };
    const flightTime = projectileFlightTime(values);
    const early = projectileStateAt(0.5, values);
    const later = projectileStateAt(1.5, values);

    expect(flightTime).toBeGreaterThan(0);
    expect(early.vx).toBeLessThan(20 * Math.cos((40 * Math.PI) / 180));
    expect(later.vx).toBeLessThan(early.vx);
    expect(projectileStateAt(flightTime, values).y).toBeCloseTo(0, 7);
  });

  it("matches MRU and MRUA position and velocity equations", () => {
    const mru = points("mru", { x0: 0, speed: 8, mass: 1 });
    const mrua = points("mrua", { x0: 0, speed: 4, acceleration: 1.5, mass: 1 });

    expect(mru.at(-1)?.t).toBeCloseTo(10, 8);
    expect(mru.at(-1)?.x).toBeCloseTo(80, 8);
    expect(mru.at(-1)?.vx).toBeCloseTo(8, 8);
    expect(mrua.at(-1)?.t).toBeCloseTo(10, 8);
    expect(mrua.at(-1)?.x).toBeCloseTo(115, 8);
    expect(mrua.at(-1)?.vx).toBeCloseTo(19, 8);
  });

  it("preserves the circular-motion speed and one-period endpoint", () => {
    const samples = points("circular", { radius: 3, omega: 1.5, mass: 1, phaseDegrees: 0 });
    const first = samples[0];
    const last = samples.at(-1)!;

    expect(last.t).toBeCloseTo((2 * Math.PI) / 1.5, 8);
    expect(Math.hypot(first.vx, first.vy)).toBeCloseTo(4.5, 8);
    expect(Math.hypot(last.vx, last.vy)).toBeCloseTo(4.5, 6);
    expect(last.x).toBeCloseTo(first.x, 6);
    expect(last.y).toBeCloseTo(first.y, 6);
  });

  it("conserves mechanical energy on a frictionless incline", () => {
    const mass = 2;
    const height = 8;
    const gravity = 9.81;
    const samples = points("energy", {
      mass,
      height,
      gravity,
      friction: 0,
      staticFriction: 0.3,
      inclineAngle: 30,
      initialSpeed: 0,
      appliedWorkForce: 0,
    });
    const first = samples[0];
    const last = samples.at(-1)!;
    const initialMechanical = first.kinetic + first.potential;
    const finalMechanical = last.kinetic + last.potential;

    expect(initialMechanical).toBeCloseTo(mass * gravity * height, 7);
    expect(last.y).toBeCloseTo(0, 7);
    expect(finalMechanical).toBeCloseTo(initialMechanical, 6);
  });

  it("distinguishes static equilibrium from downhill sliding", () => {
    const held = points("incline", { mass: 5, gravity: 9.81, angle: 20, friction: 0.2, staticFriction: 0.5 });
    const sliding = points("incline", { mass: 5, gravity: 9.81, angle: 30, friction: 0.2, staticFriction: 0.3 });
    const expectedSlidingAcceleration = 9.81 * (Math.sin(Math.PI / 6) - 0.2 * Math.cos(Math.PI / 6));

    expect(held.every((sample) => Math.abs(sample.vx) < 1e-10 && Math.abs(sample.vy) < 1e-10)).toBe(true);
    expect(sliding.at(-1)!.speed).toBeGreaterThan(0);
    expect(sliding.at(-1)!.vx / sliding.at(-1)!.t).toBeCloseTo(expectedSlidingAcceleration * Math.cos(Math.PI / 6), 5);
  });

  it("conserves momentum and satisfies the restitution relation for collisions", () => {
    const values = { mass1: 3, mass2: 2, velocity1: 5, velocity2: -1, restitution: 0.45, separation: 6, impactDuration: 0.05 };
    const result = collisionResults(values);
    const finalMomentum = result.m1 * result.v1 + result.m2 * result.v2;
    const measuredRestitution = (result.v2 - result.v1) / (result.u1 - result.u2);

    expect(finalMomentum).toBeCloseTo(result.initialMomentum, 10);
    expect(measuredRestitution).toBeCloseTo(result.e, 10);
    expect(result.collisionTime).toBeGreaterThan(0);
    expect(result.impulseMagnitude).toBeGreaterThan(0);
  });

  it("does not invent a collision when the bodies are not closing", () => {
    const result = collisionResults({ mass1: 2, mass2: 2, velocity1: 1, velocity2: 2, restitution: 1, separation: 6 });
    expect(result.collisionTime).toBe(Number.POSITIVE_INFINITY);
  });

  it("conserves energy in an undamped ideal spring oscillator", () => {
    const samples = points("spring", { mass: 1, spring: 25, amplitude: 1.2, dampingRatio: 0, phaseDegrees: 0 });
    const expectedEnergy = 0.5 * 25 * 1.2 ** 2;

    expect(samples[0].x).toBeCloseTo(1.2, 8);
    for (const sample of samples) {
      expect(sample.kinetic + sample.potential).toBeCloseTo(expectedEnergy, 6);
    }
  });
});
