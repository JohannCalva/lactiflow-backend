import { calcMedian, calcAverage, calculatePrediction, classifyClient } from "./suggestion.engine.js";

describe("calcMedian", () => {
  test("odd-length array returns middle element", () => {
    expect(calcMedian([1, 3, 5])).toBe(3);
  });

  test("even-length array returns average of two middle elements", () => {
    expect(calcMedian([1, 3, 5, 7])).toBe(4);
  });

  test("single-element array returns that element", () => {
    expect(calcMedian([42])).toBe(42);
  });

  test("works with unsorted input", () => {
    expect(calcMedian([5, 1, 3])).toBe(3);
  });
});

describe("calcAverage", () => {
  test("calculates average of positive numbers", () => {
    expect(calcAverage([2, 4, 6])).toBe(4);
  });

  test("single-element array returns that element", () => {
    expect(calcAverage([5])).toBe(5);
  });

  test("handles zeros correctly", () => {
    expect(calcAverage([0, 10, 0])).toBeCloseTo(3.33, 1);
  });
});

describe("calculatePrediction", () => {
  test("Fallback when spread > 0.35", () => {
    const deliveries = [
      { delivered_at: "2026-07-01", quantity: 10 },
      { delivered_at: "2026-07-06", quantity: 10 },
      { delivered_at: "2026-07-07", quantity: 10 },
      { delivered_at: "2026-07-12", quantity: 10 },
    ];
    const result = calculatePrediction({ deliveries });
    expect(result.method).toBe("Fallback");
    expect(result.confidence).toBe("baja");
    expect(result.suggested_qty).toBe(10);
  });

  test("Baseline with baja confidence when less than 3 deliveries", () => {
    const deliveries = [
      { delivered_at: "2026-07-01", quantity: 8 },
      { delivered_at: "2026-07-04", quantity: 12 },
    ];
    const result = calculatePrediction({ deliveries });
    expect(result.method).toBe("Baseline");
    expect(result.confidence).toBe("baja");
    expect(result.suggested_qty).toBe(10);
  });

  test("Baseline with media confidence when 3 to 7 deliveries", () => {
    const deliveries = [
      { delivered_at: "2026-07-01", quantity: 10 },
      { delivered_at: "2026-07-04", quantity: 12 },
      { delivered_at: "2026-07-07", quantity: 10 },
      { delivered_at: "2026-07-10", quantity: 12 },
      { delivered_at: "2026-07-13", quantity: 10 },
    ];
    const result = calculatePrediction({ deliveries });
    expect(result.method).toBe("Baseline");
    expect(result.confidence).toBe("media");
    expect(result.suggested_qty).toBe(10);
  });

  test("Baseline with alta confidence when 8+ deliveries and no deviation", () => {
    const deliveries = Array.from({ length: 8 }, (_, i) => ({
      delivered_at: `2026-07-${String(1 + i * 3).padStart(2, "0")}`,
      quantity: 10,
    }));
    const result = calculatePrediction({ deliveries });
    expect(result.method).toBe("Baseline");
    expect(result.confidence).toBe("alta");
    expect(result.suggested_qty).toBe(10);
  });

  test("Trend with alta confidence when 8+ deliveries and rising pattern", () => {
    const deliveries = [
      { delivered_at: "2026-07-01", quantity: 5 },
      { delivered_at: "2026-07-04", quantity: 6 },
      { delivered_at: "2026-07-07", quantity: 5 },
      { delivered_at: "2026-07-10", quantity: 6 },
      { delivered_at: "2026-07-13", quantity: 5 },
      { delivered_at: "2026-07-16", quantity: 10 },
      { delivered_at: "2026-07-19", quantity: 10 },
      { delivered_at: "2026-07-22", quantity: 15 },
      { delivered_at: "2026-07-25", quantity: 15 },
    ];
    const result = calculatePrediction({ deliveries });
    expect(result.method).toBe("Trend");
    expect(result.confidence).toBe("alta");
    expect(result.suggested_qty).toBe(13);
  });

  test("Baseline with alta confidence when 8+ deliveries and stable pattern", () => {
    const deliveries = Array.from({ length: 8 }, (_, i) => ({
      delivered_at: `2026-07-${String(1 + i * 3).padStart(2, "0")}`,
      quantity: i % 2 === 0 ? 10 : 12,
    }));
    const result = calculatePrediction({ deliveries });
    expect(result.method).toBe("Baseline");
    expect(result.confidence).toBe("alta");
    expect(result.suggested_qty).toBe(11);
  });
});

describe("classifyClient", () => {
  test("returns A when 70% or more are regular", () => {
    const behaviour = [
      ...Array.from({ length: 7 }, () => ({ spread: 0.2 })),
      ...Array.from({ length: 3 }, () => ({ spread: 0.5 })),
    ];
    expect(classifyClient(behaviour)).toBe("A");
  });

  test("returns C when 70% or more are irregular", () => {
    const behaviour = [
      ...Array.from({ length: 3 }, () => ({ spread: 0.2 })),
      ...Array.from({ length: 7 }, () => ({ spread: 0.5 })),
    ];
    expect(classifyClient(behaviour)).toBe("C");
  });

  test("returns B when mixed pattern", () => {
    const behaviour = [
      ...Array.from({ length: 5 }, () => ({ spread: 0.2 })),
      ...Array.from({ length: 5 }, () => ({ spread: 0.5 })),
    ];
    expect(classifyClient(behaviour)).toBe("B");
  });

  test("returns null for empty array", () => {
    expect(classifyClient([])).toBeNull();
  });
});
