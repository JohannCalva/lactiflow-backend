import { getDayOfWeek, addDays } from "./date.utils.js";

describe("getDayOfWeek", () => {
  test("returns correct day for a Monday", () => {
    expect(getDayOfWeek("2026-07-06")).toBe("Lunes");
  });

  test("returns correct day for a Saturday", () => {
    expect(getDayOfWeek("2026-07-04")).toBe("Sabado");
  });

  test("returns correct day for a Sunday", () => {
    expect(getDayOfWeek("2026-07-05")).toBe("Domingo");
  });
});

describe("addDays", () => {
  test("adds positive days", () => {
    expect(addDays("2026-07-04", 3)).toBe("2026-07-07");
  });

  test("subtracts days", () => {
    expect(addDays("2026-07-04", -2)).toBe("2026-07-02");
  });

  test("returns same date when adding zero days", () => {
    expect(addDays("2026-07-04", 0)).toBe("2026-07-04");
  });

  test("wraps to next month correctly", () => {
    expect(addDays("2026-07-30", 5)).toBe("2026-08-04");
  });
});
