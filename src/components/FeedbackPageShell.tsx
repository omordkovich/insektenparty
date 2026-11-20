import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClassName } from "./Button";
import { MadeWithBadge } from "./MadeWithBadge";
import { SiteHeader } from "./SiteHeader";

// Frame of the one-off feedback pages (feedback, unsubscribe, moderation).
export function FeedbackPageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-leaf/20 bg-[var(--surface)] p-5 shadow-(--shadow) sm:p-8">
          <h1 className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">{title}</h1>
          <div className="mt-6">{children}</div>
        </div>
        <MadeWithBadge />
      </main>
    </>
  );
}

// A short message with a link back to the start page.
export async function FeedbackNotice({ text }: { text: string }) {
  const t = await getTranslations("feedback");
  return (
    <div className="space-y-4 text-center">
      <p>{text}</p>
      <Link href="/" className={buttonClassName("primary")}>
        {t("homeLink")}
      </Link>
    </div>
  );
}
