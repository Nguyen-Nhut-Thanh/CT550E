import type { NavigationItemWithIcon as NavItem } from "shared";
import { NavigationPending } from "./NavigationPending";
/** Hiển thị biểu tượng và tên của một mục điều hướng. */
export default function NavItemLabel({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <Icon size={16} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
      {item.title}
      <NavigationPending />
    </span>
  );
}
