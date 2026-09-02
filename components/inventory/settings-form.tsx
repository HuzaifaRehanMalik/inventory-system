"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  FormField,
  FormSubmitButton,
  SelectField,
} from "@/components/inventory/form-controls";
import { ApiClientError, apiRequest } from "@/lib/client-api";

type SettingsValue = {
  companyName: string;
  currency: string;
  defaultLowStockThreshold: number;
  preventNegativeStock: boolean;
};

export function SettingsForm({ settings }: { settings: SettingsValue }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      companyName: String(formData.get("companyName") ?? ""),
      currency: String(formData.get("currency") ?? ""),
      defaultLowStockThreshold: Number(
        formData.get("defaultLowStockThreshold"),
      ),
      preventNegativeStock: true,
    };

    try {
      const response = await apiRequest<SettingsValue>(
        "/api/settings/inventory",
        payload,
        "PATCH",
      );
      toast.success(response.message);
      router.refresh();
      setLoading(false);
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? Object.values(error.fieldErrors ?? {}).flat()[0] ?? error.message
          : "Settings could not be updated. Please try again.";
      setErrorMessage(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {errorMessage}
        </p>
      ) : null}
      <section aria-labelledby="general-settings-heading">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
          General
        </p>
        <h2 id="general-settings-heading" className="mt-1 text-lg font-bold text-white">
          Business preferences
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Business / company name"
            name="companyName"
            required
            minLength={2}
            maxLength={160}
            defaultValue={settings.companyName}
          />
          <SelectField
            label="Currency"
            name="currency"
            defaultValue={settings.currency}
          >
            {[
              ["USD", "USD — US Dollar"],
              ["PKR", "PKR — Pakistani Rupee"],
              ["EUR", "EUR — Euro"],
              ["GBP", "GBP — British Pound"],
              ["AED", "AED — UAE Dirham"],
              ["SAR", "SAR — Saudi Riyal"],
            ].map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </SelectField>
        </div>
      </section>

      <section
        className="border-t border-zinc-800 pt-8"
        aria-labelledby="inventory-settings-heading"
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
          Inventory
        </p>
        <h2 id="inventory-settings-heading" className="mt-1 text-lg font-bold text-white">
          Stock behavior
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Default low-stock threshold"
            name="defaultLowStockThreshold"
            type="number"
            required
            min="0"
            step="1"
            defaultValue={settings.defaultLowStockThreshold}
            hint="Used as the starting threshold for new products."
          />
          <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-4 place-items-center rounded-full bg-emerald-500 text-[10px] font-black text-white"
            >
              ✓
            </span>
            <span>
              <span className="block font-bold text-white">
                Negative stock protection enabled
              </span>
              <span className="mt-1 block text-xs leading-5 text-zinc-400">
                Stock Out is always rejected when the requested quantity is not
                available.
              </span>
            </span>
          </div>
        </div>
      </section>

      <div className="flex justify-end border-t border-zinc-800 pt-6">
        <FormSubmitButton loading={loading}>Save settings</FormSubmitButton>
      </div>
    </form>
  );
}
