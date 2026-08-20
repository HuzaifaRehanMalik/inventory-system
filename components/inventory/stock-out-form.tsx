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

export function StockOutForm({
  products,
  initialProductId = "",
}: {
  products: ProductOption[];
  initialProductId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [productId, setProductId] = useState(initialProductId);
  const selectedProduct = products.find((product) => product.id === productId);
  const available = selectedProduct?.inventory?.quantity ?? 0;
  const today = dateInputValue();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      productId: String(formData.get("productId") ?? ""),
      quantity: Number(formData.get("quantity")),
      occurredAt: String(formData.get("occurredAt") ?? ""),
      referenceNumber: String(formData.get("referenceNumber") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    };

    try {
      const response = await apiRequest<{
        productId: string;
        newQuantity: number;
      }>("/api/inventory/stock-out", payload);
      toast.success(
        `${response.message} Remaining quantity: ${response.data.newQuantity}.`,
      );
      router.push(`/inventory/${response.data.productId}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? Object.values(error.fieldErrors ?? {}).flat()[0] ?? error.message
          : "The sale could not be recorded. Please try again.";
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
          className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
        >
          {errorMessage}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <SelectField
            label="Product"
            name="productId"
            required
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            hint={productId ? `Available: ${available}` : undefined}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku}) — Available: {product.inventory?.quantity ?? 0}
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
          hint={productId ? `Available to sell: ${available}` : undefined}
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
            label="Sale reference"
            name="referenceNumber"
            maxLength={120}
            placeholder="e.g. ORD-2026-001"
          />
        </div>
      </div>
      <TextAreaField
        label="Notes"
        name="notes"
        maxLength={2000}
        placeholder="Optional sale notes"
      />
      <div className="flex justify-end">
        <FormSubmitButton loading={loading} tone="danger">
          Sell Stock
        </FormSubmitButton>
      </div>
    </form>
  );
}
