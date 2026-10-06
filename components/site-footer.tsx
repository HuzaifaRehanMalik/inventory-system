import { BrandMark } from "@/components/brand-logo";
import {
  AUTHOR_NAME,
  AUTHOR_URL,
  COMPANY_NAME,
  COMPANY_URL,
  PRODUCT_NAME,
} from "@/lib/brand";

const linkClassName =
  "font-medium text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 text-center text-xs text-zinc-500 sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <p className="flex items-center gap-2.5">
          <BrandMark size="sm" className="size-6 [&_svg]:size-3.5" />
          <span>
            <span className="font-medium text-zinc-300">{PRODUCT_NAME}</span> is a
            product of{" "}
            <a
              href={COMPANY_URL}
              target="_blank"
              rel="noreferrer"
              className={linkClassName}
            >
              {COMPANY_NAME}
            </a>
          </span>
        </p>
        <p>
          Made by{" "}
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noreferrer"
            className={linkClassName}
          >
            {AUTHOR_NAME}
          </a>
        </p>
      </div>
    </footer>
  );
}
