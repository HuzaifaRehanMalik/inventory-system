import { z } from "zod";

import { DATABASE_QUANTITY_MAX } from "../lib/inventory/quantity-constraints.mjs";

const optionalId = z
  .string()
  .trim()
  .max(191)
  .optional()
  .transform((value) => value || undefined);

export const productIdSchema = z
  .string()
  .trim()
  .min(1, "Product ID is required.")
  .max(191, "Product ID is invalid.")
  .regex(/^c[a-z0-9]{20,}$/, "Product ID is invalid.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const nonNegativeMoney = z.coerce
  .number()
  .finite()
  .min(0, "Amount cannot be negative.")
  .max(999_999_999_999, "Amount is too large.")
  .transform((value) => Math.round(value * 100) / 100);

const positiveWholeQuantity = (label: string) =>
  z.coerce
    .number()
    .int(`${label} must be a whole number.`)
    .positive(`${label} must be greater than 0.`)
    .max(
      DATABASE_QUANTITY_MAX,
      `${label} exceeds the database's supported whole-number range.`,
    );

const productFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters.")
    .max(160),
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required.")
    .max(80)
    .regex(/^[A-Za-z0-9._/-]+$/, "Use letters, numbers, dots, slashes, hyphens, or underscores.")
    .transform((value) => value.toUpperCase()),
  categoryId: optionalId,
  description: optionalText(1000),
  unitPrice: nonNegativeMoney,
  minimumStock: z.coerce
    .number()
    .int()
    .min(0, "Minimum stock cannot be negative.")
    .max(DATABASE_QUANTITY_MAX),
});

export const createProductSchema = productFieldsSchema.extend({
  initialQuantity: positiveWholeQuantity("Initial quantity"),
});

export const updateProductSchema = productFieldsSchema;

const transactionBaseSchema = z.object({
  productId: productIdSchema,
  quantity: positiveWholeQuantity("Quantity"),
  occurredAt: z.coerce.date(),
  referenceNumber: optionalText(120),
  notes: optionalText(2000),
});

export const stockInSchema = transactionBaseSchema.extend({
  purchasePrice: nonNegativeMoney,
});

export const stockOutSchema = transactionBaseSchema;

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required.").max(100),
});

const emailField = z
  .string()
  .trim()
  .max(320)
  .email("Enter a valid email address.")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

export const createSupplierSchema = z.object({
  name: z.string().trim().min(2, "Supplier name is required.").max(160),
  email: emailField,
  phone: optionalText(40),
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required.").max(160),
  email: emailField,
  phone: optionalText(40),
});

export const updateBusinessSettingsSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Business name is required.")
    .max(160),
  currency: z
    .string()
    .trim()
    .length(3, "Use a three-letter currency code.")
    .regex(/^[A-Za-z]{3}$/, "Use a valid currency code.")
    .transform((value) => value.toUpperCase()),
  defaultLowStockThreshold: z.coerce
    .number()
    .int()
    .min(0, "Threshold cannot be negative.")
    .max(DATABASE_QUANTITY_MAX),
  preventNegativeStock: z.boolean().refine((value) => value, {
    message: "Negative stock protection must remain enabled.",
  }),
});

export const inventorySearchSchema = z.object({
  query: z.string().trim().max(160).catch(""),
  category: z.string().trim().max(191).catch(""),
  status: z
    .enum(["ALL", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"])
    .catch("ALL"),
  sort: z.enum(["updated", "name", "quantity", "price"]).catch("updated"),
  direction: z.enum(["asc", "desc"]).catch("desc"),
  page: z.coerce.number().int().positive().catch(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockInInput = z.infer<typeof stockInSchema>;
export type StockOutInput = z.infer<typeof stockOutSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateBusinessSettingsInput = z.infer<
  typeof updateBusinessSettingsSchema
>;
export type InventorySearchInput = z.infer<typeof inventorySearchSchema>;
