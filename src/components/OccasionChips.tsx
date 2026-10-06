import Link from "next/link";
import { type Occasion, occasionPath } from "@/lib/occasions";

// Occasion pages as round link chips (start page, "Weitere Anlässe").
export function OccasionChips({ occasions }: { occasions: Occasion[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {occasions.map((occasion) => (
        <li key={occasion.id}>
          <Link
            href={occasionPath(occasion)}
            className="inline-flex min-h-11 items-center rounded-full border border-leaf/30 bg-[var(--surface-solid)] px-4 font-bold text-leaf-dark transition hover:bg-leaf/10"
          >
            {occasion.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
