import { calcMedian, calcAverage } from "./suggestion.service.js";

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
