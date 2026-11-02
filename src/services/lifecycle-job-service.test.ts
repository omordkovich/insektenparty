import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LifecycleMailRow } from "@/lib/lifecycle-mails";

type Row = LifecycleMailRow & { id: string; ownerId: string | null; title: string; slug: string };

let rows: Row[] = [];

vi.mock("@/repositories/event-repository", () => ({
  getAllLifecycleRows: vi.fn(async () => rows),
  deleteEventById: vi.fn(async (id: string) => {
    rows = rows.filter((r) => r.id !== id);
  }),
  markMailSent: vi.fn(async (id: string, kind: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    if (kind === "deletion_notice") row.deletionNoticeSentAt = new Date();
    else row.dateReminderSentAt = new Date();
  }),
}));
vi.mock("@/services/notification-service", () => ({
  sendLifecycleMail: vi.fn(async () => true),
}));

const { runLifecycleJob } = await import("@/services/lifecycle-job-service");
const repo = await import("@/repositories/event-repository");
const { sendLifecycleMail } = await import("@/services/notification-service");

function row(id: string, overrides: Partial<Row> = {}): Row {
  return {
    id,
    ownerId: `owner-${id}`,
    title: `Event ${id}`,
    slug: `event-${id}`,
    dateMode: "fixed",
    eventDate: "2026-12-01",
    eventEndDate: null,
    createdOn: "2026-01-01",
    latestPollDate: null,
    pollStartedOn: null,
    deletionNoticeSentAt: null,
    dateReminderSentAt: null,
    ...overrides,
  };
}

describe("runLifecycleJob", () => {
  beforeEach(() => {
    rows = [];
    vi.mocked(repo.deleteEventById).mockClear();
    vi.mocked(repo.markMailSent).mockClear();
    vi.mocked(sendLifecycleMail).mockReset();
    vi.mocked(sendLifecycleMail).mockResolvedValue(true);
    vi.spyOn(console, "error").mockImplementation(() => {}).mockClear();
  });

  it("deletes an event whose Stichtag is 100 days past", async () => {
    rows = [row("a", { eventDate: "2026-01-01" })];
    const result = await runLifecycleJob("2026-04-11");
    expect(result).toEqual({ mailed: 0, deleted: 1 });
    expect(repo.deleteEventById).toHaveBeenCalledWith("a");
    expect(sendLifecycleMail).not.toHaveBeenCalled();
  });

  it("keeps an event 89 days past its Stichtag and deletes it on day 90", async () => {
    rows = [row("a", { eventDate: "2026-01-01", deletionNoticeSentAt: new Date() })];
    expect(await runLifecycleJob("2026-03-31")).toEqual({ mailed: 0, deleted: 0 });
    expect(await runLifecycleJob("2026-04-01")).toEqual({ mailed: 0, deleted: 1 });
  });

  it("does not mail an event it deletes", async () => {
    rows = [row("a", { eventDate: "2026-01-01" })];
    await runLifecycleJob("2026-04-11");
    expect(sendLifecycleMail).not.toHaveBeenCalled();
  });

  it("sends a due mail and marks it", async () => {
    // Stichtag 2026-12-01: deletion notice window opens 2027-02-22.
    rows = [row("a")];
    const result = await runLifecycleJob("2027-02-22");
    expect(result).toEqual({ mailed: 1, deleted: 0 });
    expect(sendLifecycleMail).toHaveBeenCalledWith(
      "deletion_notice",
      expect.objectContaining({ ownerId: "owner-a", title: "Event a", slug: "event-a" }),
      "2027-03-01",
    );
    expect(repo.markMailSent).toHaveBeenCalledWith("a", "deletion_notice");
  });

  it("passes the Stichtag to the date reminder", async () => {
    rows = [row("a", { dateMode: "unknown", eventDate: null, createdOn: "2026-01-01" })];
    await runLifecycleJob("2026-06-01");
    expect(sendLifecycleMail).toHaveBeenCalledWith("date_reminder", expect.anything(), "2026-07-01");
    expect(repo.markMailSent).toHaveBeenCalledWith("a", "date_reminder");
  });

  it("passes the latest proposal date to the poll reminder", async () => {
    rows = [row("a", { dateMode: "poll", eventDate: null, latestPollDate: "2026-03-10", createdOn: "2026-02-01", pollStartedOn: "2026-02-01" })];
    await runLifecycleJob("2026-03-07");
    expect(sendLifecycleMail).toHaveBeenCalledWith("poll_reminder", expect.anything(), "2026-03-10");
    expect(repo.markMailSent).toHaveBeenCalledWith("a", "poll_reminder");
  });

  it("sends each mail only once across two runs", async () => {
    rows = [row("a"), row("b", { dateMode: "unknown", eventDate: null, createdOn: "2026-12-01" })];
    // Day when a's notice is due and b (Stichtag 2027-06-01) is not yet.
    const first = await runLifecycleJob("2027-02-22");
    const second = await runLifecycleJob("2027-02-22");
    expect(first).toEqual({ mailed: 1, deleted: 0 });
    expect(second).toEqual({ mailed: 0, deleted: 0 });
    expect(sendLifecycleMail).toHaveBeenCalledTimes(1);
  });

  it("does not mark a mail when sending fails and retries next run", async () => {
    rows = [row("a")];
    vi.mocked(sendLifecycleMail).mockRejectedValueOnce(new Error("smtp down"));
    expect(await runLifecycleJob("2027-02-22")).toEqual({ mailed: 0, deleted: 0 });
    expect(repo.markMailSent).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(await runLifecycleJob("2027-02-23")).toEqual({ mailed: 1, deleted: 0 });
    expect(repo.markMailSent).toHaveBeenCalledWith("a", "deletion_notice");
  });

  it("keeps going after a failing mail", async () => {
    rows = [row("a"), row("b")];
    vi.mocked(sendLifecycleMail).mockRejectedValueOnce(new Error("smtp down"));
    const result = await runLifecycleJob("2027-02-22");
    expect(result).toEqual({ mailed: 1, deleted: 0 });
    expect(repo.markMailSent).toHaveBeenCalledTimes(1);
    expect(repo.markMailSent).toHaveBeenCalledWith("b", "deletion_notice");
  });

  it("does not mark or count a mail that could not be delivered (no address)", async () => {
    rows = [row("a")];
    vi.mocked(sendLifecycleMail).mockResolvedValue(false);
    expect(await runLifecycleJob("2027-02-22")).toEqual({ mailed: 0, deleted: 0 });
    expect(repo.markMailSent).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("keeps deleting after a failing deletion", async () => {
    rows = [row("a", { eventDate: "2026-01-01" }), row("b", { eventDate: "2026-01-01" })];
    vi.mocked(repo.deleteEventById).mockRejectedValueOnce(new Error("db down"));
    expect(await runLifecycleJob("2026-04-11")).toEqual({ mailed: 0, deleted: 1 });
    expect(console.error).toHaveBeenCalled();
  });
});
