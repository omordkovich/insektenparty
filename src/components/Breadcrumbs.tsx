import Link from "next/link";
import type { Breadcrumb } from "@/lib/occasions";

// Visible breadcrumb trail; the same items go into the BreadcrumbList
// schema. The last item is the current page and is not a link.
export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Brotkrumen" className="text-sm text-muted">
      <ol className="flex flex-wrap justify-center gap-x-1">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-x-1">
              {index > 0 ? <span aria-hidden="true">›</span> : null}
              {isCurrent ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path} className="underline underline-offset-2 hover:text-leaf-dark">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
