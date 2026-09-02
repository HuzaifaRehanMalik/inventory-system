"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { ApiClientError, apiRequest } from "@/lib/client-api";

type DeleteProductResult = {
  id: string;
  disposition: "deleted" | "archived";
  hadHistory: boolean;
};

export function DeleteProductButton({
  productId,
  productName,
  hasHistory,
  redirectTo,
  compact = false,
}: {
  productId: string;
  productName: string;
  hasHistory: boolean;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const requestInFlight = useRef(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();
  }, [open]);

  function closeModal() {
    if (loading) return;

    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    const first = cancelRef.current;
    const last = confirmRef.current;
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function deleteProduct() {
    if (requestInFlight.current) return;

    requestInFlight.current = true;
    setLoading(true);

    try {
      const response = await apiRequest<DeleteProductResult>(
        `/api/products/${productId}`,
        undefined,
        "DELETE",
      );
      toast.success(
        response.data.disposition === "archived"
          ? "Product archived successfully."
          : "Product deleted successfully.",
        response.data.disposition === "archived"
          ? { description: response.message, duration: 7000 }
          : undefined,
      );
      setOpen(false);

      if (redirectTo) {
        router.replace(redirectTo);
      }
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "The product could not be deleted. Please try again.";
      toast.error(message);
      setLoading(false);
      requestInFlight.current = false;
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Delete ${productName}`}
        title={`Delete ${productName}`}
        className={`inline-flex items-center gap-1.5 rounded-md font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500/20 ${
          compact ? "p-2 text-xs" : "px-3 py-2 text-xs"
        }`}
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        <span className={compact ? "sr-only" : undefined}>Delete</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onKeyDown={handleDialogKeyDown}
            className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-left shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-white">
                  Delete Product?
                </h2>
                <p id={descriptionId} className="mt-3 text-sm leading-6 text-zinc-300">
                  Are you sure you want to delete &quot;{productName}&quot;?
                  <span className="mt-2 block text-zinc-400">
                    {hasHistory
                      ? "This product has inventory history and will be archived so analytics and transaction records remain intact."
                      : "This product will be permanently removed."}
                  </span>
                </p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={closeModal}
                aria-label="Close delete confirmation"
                className="-mr-2 -mt-2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                disabled={loading}
                onClick={closeModal}
                className="border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded-md font-medium text-sm h-9 px-3 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                ref={confirmRef}
                type="button"
                disabled={loading}
                onClick={deleteProduct}
                className="bg-red-600 hover:bg-red-500 text-white rounded-md font-medium text-sm h-9 px-3 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
