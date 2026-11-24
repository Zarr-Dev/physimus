import { describe, expect, it } from "vitest";
import {
  calc,
  compile,
  equationDimensionStatus,
  parse,
  type Compiled,
} from "../src/PhysicsSandbox";

function compileEquation(text: string): Compiled {
  const result = compile([{ id: 1, text, enabled: true }])[0];
  if (!result) throw new Error("Equation was not compiled");
  return result;
}

describe("Sandbox equation parser and evaluator", () => {
  it("respects arithmetic precedence and exponentiation", () => {
    expect(calc(parse("2 + 3 * 4"), {})).toBe(14);
    expect(calc(parse("2^3^2"), {})).toBe(512);
    expect(calc(parse("-2^2"), {})).toBe(-4);
  });

  it("supports implicit multiplication and equation compilation", () => {
    const equation = compileEquation("F=ma");
    expect(equation.error).toBeUndefined();
    expect(calc(equation.root, { m: 2, a: 3 })).toBe(6);
  });

  it("supports Greek symbols, constants, and LaTeX fractions", () => {
    expect(calc(parse("cos(θ)"), { theta: 0 })).toBeCloseTo(1, 12);
    expect(calc(parse("sin(pi/2)"), {})).toBeCloseTo(1, 12);
    expect(calc(parse(String.raw`\\frac{1}{2}mv^2`), { m: 2, v: 3 })).toBeCloseTo(9, 12);
  });

  it("evaluates a polynomial integral with Simpson's rule", () => {
    expect(calc(parse("int(x^2,x,0,3)"), {})).toBeCloseTo(9, 10);
  });

  it("evaluates a numerical derivative", () => {
    expect(calc(parse("diff(sin(x),x)"), { x: 0 })).toBeCloseTo(1, 7);
  });

  it("returns a non-finite value for a division-by-zero expression", () => {
    expect(Number.isFinite(calc(parse("1/0"), {}))).toBe(false);
  });

  it("rejects incomplete expressions without throwing out of compile()", () => {
    const result = compileEquation("x(t)=sin(");
    expect(result.error).toBeTruthy();
  });
});

describe("Sandbox SI dimensional validation", () => {
  it("certifies Newton's second law and a parametric position equation", () => {
    expect(equationDimensionStatus(compileEquation("F=ma"))).toBe("valid");
    expect(equationDimensionStatus(compileEquation("x(t)=v0*t"))).toBe("valid");
  });

  it("treats a literal zero as a valid value for a dimensional quantity", () => {
    expect(equationDimensionStatus(compileEquation("y(t)=0"))).toBe("valid");
  });

  it("flags addition of incompatible dimensions", () => {
    expect(equationDimensionStatus(compileEquation("F=m+v"))).toBe("invalid");
  });

  it("flags dimensioned arguments passed to trigonometric functions", () => {
    expect(equationDimensionStatus(compileEquation("y=sin(x)"))).toBe("invalid");
  });

  it("does not certify an equation that contains unknown variable dimensions", () => {
    expect(equationDimensionStatus(compileEquation("x(t)=mystery*t"))).toBe("unverified");
    expect(equationDimensionStatus(compileEquation("Q=5"))).toBe("unverified");
  });
});
