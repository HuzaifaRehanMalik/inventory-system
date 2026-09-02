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
import { dateInputValue } from "@/lib/inventory/date";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  inventory: { quantity: number } | null;
};

export function StockInForm({
  products,
  initialProductId = "",
}: {
  products: ProductOption[];
  initialProductId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const today = dateInputValue();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      productId: String(formData.get("productId") ?? ""),
      quantity: Number(formData.get("quantity")),
      purchasePrice: Number(formData.get("purchasePrice")),
      occurredAt: String(formData.get("occurredAt") ?? ""),
      referenceNumber: String(formData.get("referenceNumber") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    };

    try {
      const response = await apiRequest<{
        productId: string;
        newQuantity: number;
      }>("/api/inventory/stock-in", payload);
      toast.success(
        `${response.message} New quantity: ${response.data.newQuantity}.`,
      );
      router.push(`/inventory/${response.data.productId}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? Object.values(error.fieldErrors ?? {}).flat()[0] ?? error.message
          : "Inventory could not be received. Please try again.";
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
        <div className="sm:col-span-2">
          <SelectField
            label="Product"
            name="productId"
            required
            defaultValue={initialProductId}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku}) — Current: {product.inventory?.quantity ?? 0}
              </option>
            ))}
          </SelectField>
        </div>
        <FormField
          label="Quantity"
          name="quantity"
          type="number"
          required
          min="1"
          step="1"
          placeholder="1"
        />
        <FormField
          label="Unit cost"
          name="purchasePrice"
          type="number"
          required
          min="0"
          step="0.01"
          placeholder="0.00"
        />
        <FormField
          label="Date"
          name="occurredAt"
          type="date"
          required
          defaultValue={today}
        />
        <div className="sm:col-span-2">
          <FormField
            label="Reference number"
            name="referenceNumber"
            maxLength={120}
            placeholder="e.g. INV-2026-001"
          />
        </div>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <TextAreaField
          label="Notes"
          name="notes"
          maxLength={2000}
          placeholder="Optional receiving notes"
        />
      </div>
      <div className="flex justify-end">
        <FormSubmitButton loading={loading}>Receive Stock</FormSubmitButton>
      </div>
    </form>
  );
}
