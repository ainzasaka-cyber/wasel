import { Decimal } from "@prisma/client/runtime/library";

export const MAD = "MAD" as const;

export function money(value: string | Decimal): Decimal {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function addMoney(...values: Array<string | Decimal>): Decimal {
  return values.reduce((total, value) => total.plus(value), new Decimal(0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function multiplyMoney(value: string | Decimal, quantity: number): Decimal {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Quantity must be a non-negative integer");
  }
  return new Decimal(value).mul(quantity).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function calculateCollectionFee(collectedAmount: string | Decimal): Decimal {
  const amount = money(collectedAmount);
  if (amount.isZero()) return new Decimal(0).toDecimalPlaces(2);
  const percentage = amount.mul("0.02");
  return Decimal.max(percentage, new Decimal("3.00")).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function calculateReturnedFee(deliveryFee: string | Decimal): Decimal {
  return new Decimal(deliveryFee).mul("0.50").toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function formatMad(value: string | Decimal, locale: "fr-MA" | "ar-MA" = "fr-MA"): string {
  return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(money(value).toString()))} MAD`;
}
