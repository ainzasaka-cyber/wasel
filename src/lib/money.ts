import { Decimal } from "@prisma/client/runtime/library";

export const MAD = "MAD" as const;

export function money(value: string | Decimal): Decimal {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function addMoney(...values: Array<string | Decimal>): Decimal {
  return values.reduce((total, value) => total.plus(value), new Decimal(0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function multiplyMoney(value: string | Decimal, quantity: number): Decimal {
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error("Quantity must be a non-negative integer");
  return new Decimal(value).mul(quantity).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function calculateCollectionFee(collectedAmount: string | Decimal): Decimal {
  const amount = money(collectedAmount);
  if (amount.isZero()) return money("0");
  return Decimal.max(amount.mul("0.02"), new Decimal("3.00")).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function calculateReturnedFee(deliveryFee: string | Decimal): Decimal {
  return new Decimal(deliveryFee).mul("0.50").toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function formatMad(value: string | Decimal, locale: "fr-MA" | "ar-MA" = "fr-MA"): string {
  const [integer = "0", fraction = "00"] = money(value).toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, locale === "fr-MA" ? " " : "٬");
  return `${grouped}${locale === "fr-MA" ? "," : "٫"}${fraction} MAD`;
}
