"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  FormField,
  FormSubmitButton,
} from "@/components/inventory/form-controls";
import { ApiClientError, apiRequest } from "@/lib/client-api";

type DirectoryKind = "category" | "supplier" | "customer";

const directoryDetails = {
  category: {
    endpoint: "/api/categories",
    nameLabel: "Category name",
    namePlaceholder: "e.g. Electronics",
    submitLabel: "Add category",
  },
  supplier: {
    endpoint: "/api/suppliers",
    nameLabel: "Supplier name",
    namePlaceholder: "e.g. Acme Distribution",
    submitLabel: "Add supplier",
  },
  customer: {
    endpoint: "/api/customers",
    nameLabel: "Customer name",
    namePlaceholder: "e.g. Northwind Retail",
    submitLabel: "Add customer",
  },
} as const;

export function DirectoryCreateForm({ kind }: { kind: DirectoryKind }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const details = directoryDetails[kind];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      ...(kind !== "category"
        ? {
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? ""),
          }
        : {}),
    };

    try {
      const response = await apiRequest<{ id: string }>(
        details.endpoint,
        payload,
      );
      toast.success(response.message);
      form.reset();
      router.refresh();
      setLoading(false);
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? Object.values(error.fieldErrors ?? {}).flat()[0] ?? error.message
          : `The ${kind} could not be added. Please try again.`;
      setErrorMessage(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl shadow-slate-950/15 sm:p-6"
    >
      <h2 className="text-base font-bold text-white">
        {details.submitLabel}
      </h2>
      {errorMessage ? (
        <p className="mt-4 text-sm text-rose-300" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="mt-5 grid gap-4">
        <FormField
          label={details.nameLabel}
          name="name"
          required
          minLength={2}
          maxLength={kind === "category" ? 100 : 160}
          placeholder={details.namePlaceholder}
        />
        {kind !== "category" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Email"
              name="email"
              type="email"
              maxLength={320}
              placeholder="Optional"
            />
            <FormField
              label="Phone"
              name="phone"
              maxLength={40}
              placeholder="Optional"
            />
          </div>
        ) : null}
        <div>
          <FormSubmitButton loading={loading}>
            {details.submitLabel}
          </FormSubmitButton>
        </div>
      </div>
    </form>
  );
}
