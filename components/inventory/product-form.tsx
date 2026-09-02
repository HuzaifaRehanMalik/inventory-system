"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  FormField,
  FormSubmitButton,
  SelectField,
  TextAreaField,
} from "@/components/inventory/form-controls";
import { ApiClientError, apiRequest } from "@/lib/client-api";

type ProductFormValue = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  categoryId: string | null;
  unitPrice: number;
  minimumStock: number;
};

export function ProductForm({
  categories,
  defaultLowStockThreshold,
  product,
}: {
  categories: { id: string; name: string }[];
  defaultLowStockThreshold: number;
  product?: ProductFormValue;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      sku: String(formData.get("sku") ?? ""),
      categoryId: String(formData.get("categoryId") ?? ""),
      description: String(formData.get("description") ?? ""),
      unitPrice: Number(formData.get("unitPrice")),
      minimumStock: Number(formData.get("minimumStock")),
      ...(product
        ? {}
        : { initialQuantity: Number(formData.get("initialQuantity")) }),
    };

    try {
      const response = await apiRequest<{ id: string }>(
        product ? `/api/products/${product.id}` : "/api/products",
        payload,
        product ? "PATCH" : "POST",
      );
      toast.success(response.message);
      router.push(`/inventory/${response.data.id}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? Object.values(error.fieldErrors ?? {}).flat()[0] ?? error.message
          : "The product could not be saved. Please try again.";
      setErrorMessage(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {errorMessage}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <FormField
          label="Product name"
          name="name"
          required
          minLength={2}
          maxLength={160}
          defaultValue={product?.name}
          placeholder="e.g. Wireless Barcode Scanner"
        />
        <FormField
          label="SKU"
          name="sku"
          required
          maxLength={80}
          defaultValue={product?.sku}
          placeholder="e.g. SCAN-001"
          hint="Unique within your Stockeyfy workspace."
        />
        <SelectField
          label="Category"
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
        >
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>
        <FormField
          label="Unit price"
          name="unitPrice"
          type="number"
          required
          min="0"
          step="0.01"
          defaultValue={product?.unitPrice ?? 0}
        />
        <FormField
          label="Minimum stock level"
          name="minimumStock"
          type="number"
          required
          min="0"
          step="1"
          defaultValue={product?.minimumStock ?? defaultLowStockThreshold}
          hint="Low-stock warnings appear at or below this quantity."
        />
        {!product ? (
          <FormField
            label="Initial quantity"
            name="initialQuantity"
            type="number"
            required
            min="1"
            step="1"
            placeholder="1"
            hint="Opening stock is recorded as received inventory."
          />
        ) : null}
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <TextAreaField
          label="Description"
          name="description"
          maxLength={1000}
          defaultValue={product?.description ?? ""}
          placeholder="Optional product details"
        />
      </div>
      <div className="flex justify-end">
        <FormSubmitButton loading={loading}>
          {product ? "Save changes" : "Add stock item"}
        </FormSubmitButton>
      </div>
    </form>
  );
}
