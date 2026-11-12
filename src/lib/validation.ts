import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(10),
});

export const createOrderSchema = z.object({
  storeCode: z.string().trim().min(1).max(64),
  externalOrderId: z.string().trim().min(1).max(128).optional(),
  customer: z.object({
    fullName: z.string().trim().min(1).max(160),
    phone: z.string().trim().min(8).max(32),
    email: z.string().email().optional(),
    city: z.string().trim().min(1).max(100),
    region: z.string().trim().max(100).optional(),
    district: z.string().trim().max(100).optional(),
    address: z.string().trim().max(500).optional(),
    addressNotes: z.string().trim().max(500).optional(),
  }),
  items: z.array(z.object({
    productId: z.string().uuid().optional(),
    sku: z.string().trim().min(1).max(100),
    productName: z.string().trim().min(1).max(200),
    unitPrice: z.string().regex(/^\d{1,10}\.\d{2}$/),
    quantity: z.number().int().positive().max(999),
  })).min(1).max(100),
  deliveryFee: z.string().regex(/^\d{1,10}\.\d{2}$/),
  discount: z.string().regex(/^\d{1,10}\.\d{2}$/).default("0.00"),
  paymentMethod: z.enum(["COD", "PREPAID"]),
  deliveryCity: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(1000).optional(),
});
