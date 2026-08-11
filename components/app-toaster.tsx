"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      theme="dark"
      toastOptions={{ className: "font-sans" }}
    />
  );
}
