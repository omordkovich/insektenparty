"use client";

import dynamic from "next/dynamic";

// The start page's signed-in-only parts, split off so the public start page
// (what search engines and most visitors get) doesn't ship their code and
// the Supabase client with it. This has to live in a client module:
// next/dynamic called from the (server) page itself does not code-split -
// the components would still be bundled into the page for every visitor.
export const AccountButton = dynamic(() => import("./AccountButton").then((m) => m.AccountButton));
export const ConsentDialog = dynamic(() => import("./ConsentDialog").then((m) => m.ConsentDialog));
export const EventList = dynamic(() => import("./EventList").then((m) => m.EventList));
