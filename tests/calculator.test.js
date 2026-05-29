const Calculator = require("../src/calculator.js");

describe("Calculator", () => {
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe("add", () => {
    it.each`
      a     | b     | expected
      ${2}  | ${3}  | ${5}
      ${-5} | ${-3} | ${-8}
      ${-5} | ${3}  | ${-2}
      ${7}  | ${0}  | ${7}
    `("Devrait retourner $a + $b = $expected", ({ a, b, expected }) => {
      expect(calculator.add(a, b)).toBe(expected);
    });

    it("Devrait retourner 0.1 + 0.2 ≈ 0.3", () => {
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });

  describe("subtract", () => {
    it.each`
      a     | b     | expected
      ${10} | ${4}  | ${6}
      ${3}  | ${10} | ${-7}
      ${5}  | ${0}  | ${5}
      ${-5} | ${-3} | ${-2}
    `("Devrait retourner $a - $b = $expected", ({ a, b, expected }) => {
      expect(calculator.subtract(a, b)).toBe(expected);
    });

    it("Devrait retourner 0.3 - 0.1 ≈ 0.2", () => {
      expect(calculator.subtract(0.3, 0.1)).toBeCloseTo(0.2);
    });
  });

  describe("multiply", () => {
    it.each`
      a     | b      | expected
      ${6}  | ${7}   | ${42}
      ${0}  | ${999} | ${0}
      ${-3} | ${-4}  | ${12}
      ${3}  | ${-4}  | ${-12}
    `("Devrait retourner $a * $b = $expected", ({ a, b, expected }) => {
      expect(calculator.multiply(a, b)).toBe(expected);
    });

    it("Devrait retourner 0.1 * 0.2 ≈ 0.02", () => {
      expect(calculator.multiply(0.1, 0.2)).toBeCloseTo(0.02);
    });
  });

  describe("divide", () => {
    it.each`
      a      | b     | expected
      ${20}  | ${5}  | ${4}
      ${0}   | ${5}  | ${0}
      ${-10} | ${-2} | ${5}
      ${-7}  | ${2}  | ${-3.5}
    `("Devrait retourner $a / $b = $expected", ({ a, b, expected }) => {
      expect(calculator.divide(a, b)).toBe(expected);
    });

    it("Devrait retourner 10 / 3 ≈ 3.333", () => {
      expect(calculator.divide(10, 3)).toBeCloseTo(3.333);
    });

    it("Devrait retourner 10 / 0 = 'Division par zéro impossible'", () => {
      expect(() => calculator.divide(10, 0)).toThrow(
        "Division par zéro impossible",
      );
    });
  });
});
