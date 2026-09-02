export type NavigationItem = {
  label: string;
  href: string;
  aliases?: string[];
  emphasis?: "primary";
};

const publicNavigationItems: NavigationItem[] = [
  { label: "Guide", href: "/guide" },
  { label: "Login", href: "/login" },
  {
    label: "Create account",
    href: "/register",
    emphasis: "primary",
  },
];

const authenticatedNavigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/", aliases: ["/home", "/dashboard"] },
  { label: "Inventory", href: "/inventory" },
  { label: "Products", href: "/products" },
  { label: "Stock In", href: "/stock-in" },
  { label: "Sales", href: "/stock-out", aliases: ["/sales"] },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
  { label: "Guide", href: "/guide" },
];

export function getNavigationItems(authenticated: boolean) {
  return authenticated
    ? authenticatedNavigationItems
    : publicNavigationItems;
}
