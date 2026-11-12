import { addMoney, money, multiplyMoney } from "@/lib/money";

export type OrderLineInput = { unitPrice: string; quantity: number };

export function calculateOrderTotals(input: { items: OrderLineInput[]; deliveryFee: string; discount: string }) {
  const itemSubtotals = input.items.map((item) => multiplyMoney(item.unitPrice, item.quantity));
  const subtotal = addMoney(...itemSubtotals);
  const deliveryFee = money(input.deliveryFee);
  const discount = money(input.discount);
  const totalAmount = addMoney(subtotal, deliveryFee, discount.negated());
  if (totalAmount.isNegative()) throw new Error("ORDER_TOTAL_NEGATIVE");
  return { subtotal, deliveryFee, discount, totalAmount, codAmount: totalAmount };
}
