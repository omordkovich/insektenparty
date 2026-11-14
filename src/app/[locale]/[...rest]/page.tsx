import { notFound } from "next/navigation";

// Unknown paths below /[locale] get the localized not-found page.
export default function CatchAll() {
  notFound();
}
