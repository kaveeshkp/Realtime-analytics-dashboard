import { describe, it, expect } from "vitest";
import { formatCurrency, formatPrice } from "../formatCurrency";

describe("formatCurrency", () => {
  it("formats standard currency values", () => {
    expect(formatCurrency(100)).toBe("$100.00");
  });

  it("formats small values with extra precision", () => {
    expect(formatCurrency(0.5)).toBe("$0.5000");
  });

  it("abbreviates large values when requested", () => {
    expect(formatCurrency(2_500_000, "USD", { abbreviate: true })).toBe("$2.5M");
    expect(formatCurrency(1_000_000_000, "USD", { abbreviate: true })).toBe("$1.0B");
  });
});

describe("formatPrice", () => {
  it("formats large values with separators", () => {
    expect(formatPrice(1500)).toBe("$1,500");
  });

  it("formats medium and tiny values", () => {
    expect(formatPrice(500)).toBe("$500.00");
    expect(formatPrice(0.5)).toBe("$0.5000");
    expect(formatPrice(0.001)).toBe("$0.001000");
  });
});
