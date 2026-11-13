import { ardResponse } from "@/lib/ard";

// ARD manifest for AI agents (see src/lib/ard.ts).
export const dynamic = "force-static";

export function GET() {
  return ardResponse();
}
