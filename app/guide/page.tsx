import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Boxes,
  CheckCircle2,
  CircleHelp,
  CircleUserRound,
  Clock3,
  Filter,
  KeyRound,
  MailCheck,
  PackagePlus,
  PencilLine,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  Trash2,
  UserPlus,
  UsersRound,
} from "lucide-react";

import {
  GuideSearch,
  type GuideSearchEntry,
} from "@/components/guide/guide-search";

export const metadata: Metadata = {
  title: "How to Use Stockeyfy | User Guide",
  description:
    "A simple, step-by-step guide to creating an account, adding products, tracking inventory, receiving stock, recording sales, and managing Stockeyfy.",
  alternates: { canonical: "/guide" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/guide",
    siteName: "Stockeyfy",
    title: "How to Use Stockeyfy | User Guide",
    description:
      "Learn how to manage products, inventory, stock receipts, sales, settings, and your Stockeyfy account.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Stockeyfy Inventory Management System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Use Stockeyfy | User Guide",
    description:
      "A beginner-friendly guide to everyday inventory work in Stockeyfy.",
    images: ["/og.png"],
  },
};

const guideNavigation: GuideSearchEntry[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Create an account, verify your email, and sign in.",
    keywords: "open website register registration login remember me verification resend inbox",
  },
  {
    id: "dashboard",
    title: "Dashboard and navigation",
    description: "Understand the home screen, totals, charts, and main menu.",
    keywords: "home reports analytics totals sold received trend low stock menu navbar mobile",
  },
  {
    id: "products",
    title: "Managing products",
    description: "Add, edit, view, and safely delete or archive products.",
    keywords: "new item add stock sku price description category threshold opening quantity edit delete archive",
  },
  {
    id: "inventory",
    title: "Finding and understanding inventory",
    description: "Search, filter, sort, and read inventory details and status.",
    keywords: "search filter sort category status pagination value average cost history in stock out of stock",
  },
  {
    id: "receive-stock",
    title: "Receiving stock",
    description: "Increase the quantity of an existing product.",
    keywords: "stock in add stock receive purchase unit cost reference notes date quantity",
  },
  {
    id: "record-sale",
    title: "Recording a sale",
    description: "Reduce stock safely with Checkout / Sales.",
    keywords: "stock out checkout sell sale available quantity reference notes negative stock",
  },
  {
    id: "directories",
    title: "Categories and directories",
    description: "Organize products and keep supplier or customer contacts.",
    keywords: "categories suppliers customers contacts email phone organize",
  },
  {
    id: "settings",
    title: "Workspace settings",
    description: "Choose the company name, currency, and default stock threshold.",
    keywords: "business company currency usd pkr eur gbp aed sar low stock threshold preferences",
  },
  {
    id: "account",
    title: "Profile and account security",
    description: "Update your profile, password, and recovery options.",
    keywords: "profile name email change password forgot reset sign out logout session security",
  },
  {
    id: "help",
    title: "FAQ and troubleshooting",
    description: "Find quick answers when something does not work as expected.",
    keywords: "help error problem cannot sign in sku duplicate correction wrong movement guide public",
  },
];

export default function UserGuidePage() {
  return (
    <main id="guide-content" className="pb-20">
      <section className="border-b border-zinc-800">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] lg:px-8 lg:py-24">
          <div className="animate-enter">
            <div className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <BookOpen className="size-4" aria-hidden="true" />
              Public user guide — no account required
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Learn Stockeyfy,
              <span className="block text-zinc-400">one simple step at a time.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              This guide shows you how to use the website—from creating your
              account to adding products, receiving stock, recording sales, and
              checking what is running low.
            </p>
            <GuideSearch entries={guideNavigation} />
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#getting-started"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary hover:bg-primary-hover px-3.5 text-sm font-medium text-white transition"
              >
                Start the guide <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <Link
                href="/register"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white px-3.5 text-sm font-medium transition"
              >
                Create account
              </Link>
            </div>
          </div>

          <GuidePreview />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <GuideFact icon={Clock3} title="About 10 minutes" text="Read the full guide or jump to one task." />
          <GuideFact icon={CircleUserRound} title="Made for beginners" text="No inventory experience or technical knowledge needed." />
          <GuideFact icon={ShieldCheck} title="Public and safe" text="Learning is public. Your real workspace still requires sign-in." />
        </div>

        <details className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900 p-3.5 lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-white">
            Guide contents
          </summary>
          <nav className="mt-4 grid gap-1 sm:grid-cols-2" aria-label="Mobile guide contents">
            {guideNavigation.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-md px-2.5 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <span className="mr-2 font-mono text-emerald-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.title}
              </a>
            ))}
          </nav>
        </details>

        <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] xl:gap-12">
          <aside className="sticky top-24 hidden lg:block">
            <p className="px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              In this guide
            </p>
            <nav className="mt-3 grid gap-1" aria-label="Guide contents">
              {guideNavigation.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="group rounded-md px-2.5 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <span className="mr-2 font-mono text-emerald-400/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.title}
                </a>
              ))}
            </nav>
            <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-3.5">
              <p className="text-xs font-medium text-white">Ready to begin?</p>
              <p className="mt-1 text-xs text-zinc-500">
                You can read everything first, then create your account.
              </p>
              <Link
                href="/register"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                Create account <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>

          <div className="min-w-0 space-y-8">
            <GuideSection
              id="getting-started"
              number="01"
              eyebrow="First visit"
              title="Getting started"
              intro="You need a verified account before you can see or change inventory. Reading this guide does not require an account."
              icon={UserPlus}
            >
              <StepList
                steps={[
                  {
                    title: "Open the website",
                    text: "Choose Create account. If you already have an account, choose Sign in instead.",
                  },
                  {
                    title: "Enter your account details",
                    text: "Add your full name and work email. Create a password that completes the password checklist, then enter it again to confirm.",
                  },
                  {
                    title: "Check your email",
                    text: "After you submit the form, open the verification email and use its link. Check your spam folder if it is not in your inbox.",
                  },
                  {
                    title: "Sign in",
                    text: "Use your verified email and password. Select Remember me only on a trusted device if you want to stay signed in for up to 30 days.",
                  },
                  {
                    title: "Arrive at the dashboard",
                    text: "After sign-in, Stockeyfy opens your private dashboard. New accounts begin with no products or stock movements.",
                  },
                ]}
              />

              <Tip title="Did not receive the verification email?">
                Open the verification screen, enter the same email address, and
                choose <strong>Send verification link</strong>. Verification links
                expire after 24 hours.
              </Tip>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <RouteButton href="/register" label="Create account" />
                <RouteButton href="/login" label="Sign in" secondary />
                <RouteButton href="/verify-email" label="Resend verification" secondary />
              </div>
            </GuideSection>

            <GuideSection
              id="dashboard"
              number="02"
              eyebrow="Your home screen"
              title="Dashboard and navigation"
              intro="The dashboard is your quick health check. It combines current stock, lifetime movement totals, product performance, and the latest activity."
              icon={BarChart3}
            >
              <h3 className="text-sm font-semibold text-white">Use the main navigation</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FeatureCard title="Dashboard" text="Return to the overview and recent activity." />
                <FeatureCard title="Inventory" text="Search, filter, sort, and inspect every active product." />
                <FeatureCard title="New Item" text="Create a brand-new product with an opening quantity." />
                <FeatureCard title="Add Stock" text="Receive more units for a product that already exists." />
                <FeatureCard title="Checkout / Sales" text="Record units sold and reduce the available quantity." />
                <FeatureCard title="Settings" text="Choose business, currency, and stock-warning defaults." />
              </div>

              <Tip title="Two actions have similar names">
                <strong>New Item</strong> (and the dashboard&apos;s blue <strong>Add Stock</strong> button)
                creates a new product. <strong>Add Stock</strong> in the main menu (and
                the dashboard&apos;s <strong>Receive</strong> button) adds units to an existing product.
              </Tip>

              <h3 className="mt-7 text-sm font-semibold text-white">Read the dashboard</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoRow label="Inventory summary" text="Total active products, current units, units sold, units received, and low-stock products." />
                <InfoRow label="30-day movement" text="Daily units sold compared with units received during the last 30 days." />
                <InfoRow label="Product rankings" text="Best-selling and lowest-selling products based on recorded units sold." />
                <InfoRow label="Performance table" text="Sold, received, sell-through rate, current stock, and status for each active product." />
                <InfoRow label="Recent movement" text="The newest receipts and sales, including who recorded each change." />
                <InfoRow label="Low-stock panel" text="Products at or below their minimum stock level, ready for your attention." />
              </div>

              <Expected>
                Dashboard values update after you add a product, receive stock,
                or record a sale. The separate Reports address currently returns
                to this dashboard, where the working analytics are shown.
              </Expected>
            </GuideSection>

            <GuideSection
              id="products"
              number="03"
              eyebrow="Build your catalog"
              title="Managing products"
              intro="A product is the item you sell or store. Create it once, then use Receive Stock and Sell Stock to change its quantity."
              icon={PackagePlus}
            >
              <h3 className="text-sm font-semibold text-white">Add a product</h3>
              <StepList
                steps={[
                  {
                    title: "Open New Item",
                    text: "Choose New Item in the navigation, or choose Add Stock on the dashboard or Inventory page.",
                  },
                  {
                    title: "Enter the product name and SKU",
                    text: "The SKU is the product's unique code. It can use letters, numbers, dots, slashes, hyphens, and underscores.",
                  },
                  {
                    title: "Choose its catalog details",
                    text: "Select a category if you have one, enter the unit price, and add an optional description.",
                  },
                  {
                    title: "Set the stock warning",
                    text: "Enter the minimum stock level. Stockeyfy marks the item Low Stock when its quantity is at or below this number but above zero.",
                  },
                  {
                    title: "Enter the opening quantity and save",
                    text: "The initial quantity must be a whole number greater than zero. Choose Add stock item. Stockeyfy opens the new inventory detail page.",
                  },
                ]}
              />

              <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="text-sm font-semibold text-white">What each money field means</p>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-emerald-400">Unit price</dt>
                    <dd className="mt-1 text-sm leading-6 text-zinc-400">The product price you enter and can edit.</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-emerald-400">Average unit cost</dt>
                    <dd className="mt-1 text-sm leading-6 text-zinc-400">The average cost of received stock, used to calculate inventory value.</dd>
                  </div>
                </dl>
              </div>

              <h3 className="mt-7 text-sm font-semibold text-white">Edit or remove a product</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ActionCard
                  icon={PencilLine}
                  title="Edit"
                  text="From Products, Inventory, or the product detail page, choose Edit. You can change its name, SKU, category, price, description, and minimum stock level. Quantity is changed through stock movements, not this form."
                />
                <ActionCard
                  icon={Trash2}
                  title="Delete"
                  text="Choose Delete and confirm. A product with no history is removed. A product with stock or activity is archived so its past records remain safe; archived products leave active inventory."
                  danger
                />
              </div>

              <div className="mt-6">
                <RouteButton href="/products" label="Open products" />
              </div>
            </GuideSection>

            <GuideSection
              id="inventory"
              number="04"
              eyebrow="Find what you need"
              title="Finding and understanding inventory"
              intro="Inventory shows every active product, how many units are available, what those units cost, and whether the product needs attention."
              icon={Search}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <ActionCard icon={Search} title="Search" text="Enter a product name or SKU, then choose Apply." />
                <ActionCard icon={Filter} title="Filter" text="Narrow the list by category or stock status." />
                <ActionCard icon={BarChart3} title="Sort" text="Sort by last update, name, quantity, or unit price." />
              </div>

              <h3 className="mt-7 text-sm font-semibold text-white">Understand stock status</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StatusCard tone="success" label="In Stock" text="Quantity is above the product's minimum stock level." />
                <StatusCard tone="warning" label="Low Stock" text="Quantity is above zero but at or below the minimum." />
                <StatusCard tone="danger" label="Out of Stock" text="The available quantity is zero." />
              </div>

              <h3 className="mt-7 text-sm font-semibold text-white">Open a product for full details</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Choose a product name. You will see current quantity, average unit
                cost, inventory value, minimum stock, and status. The stock history
                lists up to 50 recent receipts and sales with their date, old and new
                quantities, reference, notes, and the person who recorded them.
              </p>
              <Expected>
                Inventory displays 20 products per page. Use Previous and Next below
                the list when there are more. On a phone, each product appears as a
                card instead of a wide table.
              </Expected>
              <div className="mt-6">
                <RouteButton href="/inventory" label="Open inventory" />
              </div>
            </GuideSection>

            <GuideSection
              id="receive-stock"
              number="05"
              eyebrow="Stock in"
              title="Receiving stock"
              intro="Use Receive Stock when an existing product arrives. This increases its available quantity and adds a permanent movement to its history."
              icon={ArrowDownToLine}
            >
              <StepList
                steps={[
                  {
                    title: "Open Add Stock",
                    text: "Choose Add Stock in the main navigation, Receive on the dashboard, or Receive Stock on a product detail page.",
                  },
                  {
                    title: "Choose the product",
                    text: "The list shows each product's current quantity. If you started from a product detail page, that product is already selected.",
                  },
                  {
                    title: "Enter quantity and unit cost",
                    text: "Quantity must be a whole number greater than zero. Unit cost is the cost for each newly received unit and cannot be negative.",
                  },
                  {
                    title: "Add the date and optional details",
                    text: "The current date is filled in. You can add a supplier invoice or other reference number and receiving notes.",
                  },
                  {
                    title: "Choose Receive Stock",
                    text: "Stockeyfy adds the units, updates average unit cost and inventory value, and opens the product's details and history.",
                  },
                ]}
              />
              <Expected>
                A success message shows the new quantity. The movement also appears
                in recent dashboard activity and the product&apos;s stock history.
              </Expected>
              <div className="mt-6">
                <RouteButton href="/stock-in" label="Receive stock" />
              </div>
            </GuideSection>

            <GuideSection
              id="record-sale"
              number="06"
              eyebrow="Checkout / sales"
              title="Recording a sale"
              intro="The current sales workflow is Sell Stock. It records how many units left inventory and prevents the quantity from dropping below zero."
              icon={ArrowUpFromLine}
            >
              <StepList
                steps={[
                  {
                    title: "Open Checkout / Sales",
                    text: "Choose Checkout / Sales in the main navigation, Sell on the dashboard, or Sell Stock on a product detail page.",
                  },
                  {
                    title: "Choose the product",
                    text: "Stockeyfy shows the quantity currently available to sell.",
                  },
                  {
                    title: "Enter the quantity",
                    text: "Use a whole number greater than zero. The quantity cannot be more than what is available.",
                  },
                  {
                    title: "Check the date and add details",
                    text: "The current date is filled in. Add an optional sale or order reference and notes if they help you identify the transaction later.",
                  },
                  {
                    title: "Choose Sell Stock",
                    text: "Stockeyfy reduces the quantity and opens the product detail page so you can confirm the remaining stock and history entry.",
                  },
                ]}
              />
              <Tip title="Stock cannot become negative">
                If you try to sell more units than are available, the sale is rejected.
                Check the selected product and quantity, then try again.
              </Tip>
              <div className="mt-6">
                <RouteButton href="/stock-out" label="Open Checkout / Sales" />
              </div>
            </GuideSection>

            <GuideSection
              id="directories"
              number="07"
              eyebrow="Organize your records"
              title="Categories and directories"
              intro="Stockeyfy includes simple pages for categories, suppliers, and customers. Each page belongs to your signed-in account."
              icon={Tags}
            >
              <div className="grid gap-3 md:grid-cols-3">
                <DirectoryCard
                  icon={Tags}
                  title="Categories"
                  text="Add category names such as Electronics or Office Supplies. You can select them when creating or editing products, then filter Inventory by category."
                  href="/categories"
                />
                <DirectoryCard
                  icon={UsersRound}
                  title="Suppliers"
                  text="Add a supplier name and optional email or phone number. The page shows the saved contacts and receipt usage count."
                  href="/suppliers"
                />
                <DirectoryCard
                  icon={CircleUserRound}
                  title="Customers"
                  text="Add a customer name and optional email or phone number. The page shows the saved contacts and stock-issue usage count."
                  href="/customers"
                />
              </div>
              <Tip title="Current directory limits">
                These pages currently let you add and review entries. They do not
                offer edit or delete controls, and supplier or customer selection is
                not currently shown in the Receive Stock or Sell Stock forms.
              </Tip>
            </GuideSection>

            <GuideSection
              id="settings"
              number="08"
              eyebrow="Your workspace"
              title="Workspace settings"
              intro="Settings control the labels and defaults used across your private workspace. Open Settings from the main navigation."
              icon={Settings}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow label="Business / company name" text="Enter the name you want saved for this workspace." />
                <InfoRow label="Currency" text="Choose USD, PKR, EUR, GBP, AED, or SAR for prices and inventory values." />
                <InfoRow label="Default low-stock threshold" text="Sets the starting minimum stock level for products you create later. Existing products keep their own threshold until you edit them." />
                <InfoRow label="Negative stock protection" text="Always enabled. Sell Stock is rejected when there are not enough units available." />
              </div>
              <StepList
                compact
                steps={[
                  { title: "Open Settings", text: "Review the current business and inventory preferences." },
                  { title: "Make your changes", text: "Update the company name, currency, or default low-stock threshold." },
                  { title: "Save settings", text: "A success message confirms the updated preferences." },
                ]}
              />
              <div className="mt-6">
                <RouteButton href="/settings" label="Open settings" />
              </div>
            </GuideSection>

            <GuideSection
              id="account"
              number="09"
              eyebrow="Your identity"
              title="Profile and account security"
              intro="Choose your name or initials in the top bar to open Profile. This is where you manage personal account details and password security."
              icon={CircleUserRound}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <ActionCard
                  icon={CircleUserRound}
                  title="Update name or email"
                  text="Edit your profile and choose Save profile. Changing your email signs you out and requires verification of the new address before you can sign in again."
                />
                <ActionCard
                  icon={KeyRound}
                  title="Change your password"
                  text="Enter the current password and a valid new password twice. After it changes, all existing sessions are ended and you sign in again."
                />
                <ActionCard
                  icon={MailCheck}
                  title="Recover access"
                  text="On Sign in, choose Forgot password? Enter your email, open the single-use reset link, and create a new password."
                />
                <ActionCard
                  icon={ShieldCheck}
                  title="Sign out"
                  text="Choose the sign-out button in the top bar when you finish, especially on a shared device."
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <RouteButton href="/profile" label="Open profile" />
                <RouteButton href="/forgot-password" label="Reset a forgotten password" secondary />
              </div>
            </GuideSection>

            <GuideSection
              id="help"
              number="10"
              eyebrow="Quick answers"
              title="FAQ and troubleshooting"
              intro="Use these answers when the result on screen is different from what you expected."
              icon={CircleHelp}
            >
              <div className="space-y-3">
                <Faq
                  question="Why can’t I sign in?"
                  answer="Confirm that you are using the same email address you registered, that you opened the verification link, and that your password is correct. Use Resend verification if needed, or Forgot password? to create a new password."
                />
                <Faq
                  question="Why can’t I add a product?"
                  answer="The name must have at least two characters, the SKU must be unique and use allowed characters, and the opening quantity must be a whole number greater than zero. Unit price and minimum stock cannot be negative."
                />
                <Faq
                  question="Why can’t I record a sale?"
                  answer="Check that you selected the correct product and entered a whole number greater than zero. You cannot sell more than the available quantity."
                />
                <Faq
                  question="Why does Inventory show no results?"
                  answer="Your search or filters may be hiding products. Clear the search, choose All categories and All statuses, then select Apply. You can also choose Clear filters from the empty result message."
                />
                <Faq
                  question="What happens if I delete a product?"
                  answer="A product with no history is permanently removed. A product that has stock or activity is archived instead, so its transaction and analytics history remain intact."
                />
                <Faq
                  question="Can I edit a stock receipt or sale after saving it?"
                  answer="There is no on-screen edit or delete action for saved stock movements. Check the entry before submitting. If you entered the wrong movement, record an opposite movement with a clear correction note only when that matches your real records."
                />
                <Faq
                  question="Do I need an account to read this guide?"
                  answer="No. The User Guide is public. An account and verified sign-in are required only when you open or change your actual inventory workspace."
                />
              </div>

              <div className="mt-7 rounded-lg border border-zinc-800 bg-zinc-900 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="font-semibold text-white">Ready to use Stockeyfy?</p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    Create your account, verify your email, and add your first product.
                  </p>
                </div>
                <Link
                  href="/register"
                  className="mt-4 inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary hover:bg-primary-hover px-3.5 text-sm font-medium text-white transition sm:mt-0"
                >
                  Create account <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </GuideSection>
          </div>
        </div>
      </div>
    </main>
  );
}

function GuidePreview() {
  return (
    <div className="animate-enter rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
            <Boxes className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Your dashboard</p>
            <p className="text-[10px] text-zinc-500">Everything important at a glance</p>
          </div>
        </div>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
          Live inventory
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <PreviewMetric label="Products" value="24" />
        <PreviewMetric label="In stock" value="1,280" />
        <PreviewMetric label="Low stock" value="3" warning />
      </div>
      <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950 p-2.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-zinc-400">Recent movement</span>
          <span className="text-zinc-500">Today</span>
        </div>
        <PreviewMovement icon={ArrowDownToLine} text="Received 20 units" tone="success" />
        <PreviewMovement icon={ArrowUpFromLine} text="Sold 4 units" tone="primary" />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5">
        <span className="size-2 rounded-full bg-amber-400" />
        <p className="text-[11px] font-medium text-amber-300">Low-stock items are easy to spot</p>
      </div>
    </div>
  );
}

function PreviewMetric({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-2.5">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${warning ? "text-amber-300" : "text-white"}`}>{value}</p>
    </div>
  );
}

function PreviewMovement({ icon: Icon, text, tone }: { icon: LucideIcon; text: string; tone: "success" | "primary" }) {
  return (
    <div className="mt-2 flex items-center gap-2 rounded-md bg-zinc-900 p-2">
      <span className={`grid size-6 place-items-center rounded-md ${tone === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-300"}`}>
        <Icon className="size-3" aria-hidden="true" />
      </span>
      <span className="text-[10px] font-medium text-zinc-300">{text}</span>
      <CheckCircle2 className="ml-auto size-3 text-zinc-600" aria-hidden="true" />
    </div>
  );
}

function GuideFact({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p>
      </div>
    </div>
  );
}

function GuideSection({
  id,
  number,
  eyebrow,
  title,
  intro,
  icon: Icon,
  children,
}: {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  intro: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-500">
            {number} · {eyebrow}
          </p>
          <h2 id={`${id}-heading`} className="mt-1 text-xl font-semibold tracking-tight text-white">
            {title}
          </h2>
        </div>
      </div>
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-zinc-400">{intro}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function StepList({ steps, compact = false }: { steps: { title: string; text: string }[]; compact?: boolean }) {
  return (
    <ol className={`${compact ? "mt-6" : "mt-4"} space-y-3`}>
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3.5 sm:p-4">
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-700">
            {index + 1}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white">Step {index + 1}: {step.title}</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-400">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="mt-6 flex gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
      <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-emerald-300">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">{children}</p>
      </div>
    </aside>
  );
}

function Expected({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 border-l-2 border-emerald-500 pl-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">What to expect</p>
      <p className="mt-1 text-sm leading-6 text-zinc-400">{children}</p>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3.5">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{text}</p>
    </div>
  );
}

function InfoRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3.5">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs text-zinc-500">{text}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, text, danger = false }: { icon: LucideIcon; title: string; text: string; danger?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3.5">
      <span className={`grid size-8 place-items-center rounded-md ${danger ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-300"}`}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{text}</p>
    </div>
  );
}

function StatusCard({ tone, label, text }: { tone: "success" | "warning" | "danger"; label: string; text: string }) {
  const tones = {
    success: "bg-emerald-500/10 text-emerald-400",
    warning: "bg-amber-500/10 text-amber-400",
    danger: "bg-red-500/10 text-red-400",
  };
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3.5">
      <span className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{label}</span>
      <p className="mt-3 text-xs leading-5 text-zinc-400">{text}</p>
    </div>
  );
}

function DirectoryCard({ icon: Icon, title, text, href }: { icon: LucideIcon; title: string; text: string; href: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-950/50 p-3.5">
      <span className="grid size-8 place-items-center rounded-md bg-zinc-800 text-zinc-300">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 flex-1 text-xs leading-5 text-zinc-400">{text}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300">
        Open {title.toLowerCase()} <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

function RouteButton({ href, label, secondary = false }: { href: string; label: string; secondary?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium transition ${secondary ? "border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white" : "bg-primary text-white hover:bg-primary-hover"}`}
    >
      {label} <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-lg border border-zinc-800 bg-zinc-950/50 p-3.5 open:border-zinc-700">
      <summary className="cursor-pointer list-none pr-8 text-sm font-medium text-white marker:hidden">
        <span className="relative block">
          {question}
          <span className="absolute -right-6 top-0 text-lg leading-none text-zinc-500 transition group-open:rotate-45" aria-hidden="true">+</span>
        </span>
      </summary>
      <p className="mt-3 border-t border-zinc-800 pt-3 text-xs leading-relaxed text-zinc-400">{answer}</p>
    </details>
  );
}
