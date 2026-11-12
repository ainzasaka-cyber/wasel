import { describe, expect, it } from "vitest";
import { addMoney, calculateCollectionFee, calculateReturnedFee, money, multiplyMoney } from "./money";

describe("money", () => {
  it("rounds half up to two decimal places", () => {
    expect(money("1.005").toFixed(2)).toBe("1.01");
  });

  it("calculates order arithmetic without binary floating point", () => {
    expect(addMoney(multiplyMoney("0.10", 2), "0.20").toFixed(2)).toBe("0.40");
  });

  it("applies the three MAD collection fee floor", () => {
    expect(calculateCollectionFee("100").toFixed(2)).toBe("3.00");
    expect(calculateCollectionFee("200").toFixed(2)).toBe("4.00");
  });

  it("calculates returned parcels at half the delivery fee", () => {
    expect(calculateReturnedFee("30.00").toFixed(2)).toBe("15.00");
  });
});
