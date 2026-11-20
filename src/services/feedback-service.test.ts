import { beforeEach, describe, expect, it, vi } from "vitest";
import { err } from "@/i18n/errors";
import { signFeedbackToken } from "@/lib/feedback-token";

vi.mock("@/repositories/review-repository", () => ({
  submitReviewForEvent: vi.fn(),
  getFeedbackEventInfo: vi.fn(),
  getReview: vi.fn(),
  approveReview: vi.fn(),
  deleteReview: vi.fn(),
}));
vi.mock("@/repositories/user-repository", () => ({
  getUserContact: vi.fn(),
  disableFeedbackMails: vi.fn(async () => {}),
}));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => {}) }));

const service = await import("@/services/feedback-service");
const repo = await import("@/repositories/review-repository");
const users = await import("@/repositories/user-repository");
const { sendEmail } = await import("@/lib/email");

const SECRET = "test-secret";
const EVENT_ID = "11111111-1111-4111-8111-111111111111";
const REVIEW_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";
const TODAY = "2026-11-19";

const feedbackToken = signFeedbackToken({ kind: "feedback", id: EVENT_ID, exp: "2026-12-19" }, SECRET);
const moderateToken = signFeedbackToken({ kind: "moderate", id: REVIEW_ID }, SECRET);
const unsubscribeToken = signFeedbackToken({ kind: "unsubscribe", id: USER_ID }, SECRET);

const body = {
  token: feedbackToken,
  rating: 5,
  text: "Alle haben ganz einfach zugesagt!",
  showName: true,
  name: "Anna",
  consent: true,
};

const review = {
  id: REVIEW_ID,
  rating: 5,
  text: body.text,
  displayName: "Anna",
  language: "en",
  status: "pending",
  createdAt: new Date("2026-11-19T10:00:00Z"),
  approvedAt: null,
};

beforeEach(() => {
  vi.stubEnv("FEEDBACK_SECRET", SECRET);
  vi.stubEnv("FEEDBACK_ADMIN_EMAIL", "");
  vi.mocked(repo.submitReviewForEvent).mockReset();
  vi.mocked(repo.submitReviewForEvent).mockResolvedValue({ status: "created", review });
  vi.mocked(repo.getFeedbackEventInfo).mockReset();
  vi.mocked(repo.getReview).mockReset();
  vi.mocked(repo.approveReview).mockReset();
  vi.mocked(repo.deleteReview).mockReset();
  vi.mocked(users.getUserContact).mockReset();
  vi.mocked(users.disableFeedbackMails).mockClear();
  vi.mocked(sendEmail).mockReset();
  vi.mocked(sendEmail).mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("submitFeedback", () => {
  it("stores the review and mails info@gastzilla.de", async () => {
    expect(await service.submitFeedback(body, "en", TODAY)).toEqual({ ok: true });
    expect(repo.submitReviewForEvent).toHaveBeenCalledWith(EVENT_ID, {
      rating: 5,
      text: body.text,
      displayName: "Anna",
      language: "en",
    });
    const mail = vi.mocked(sendEmail).mock.calls[0][0];
    expect(mail.to).toBe("info@gastzilla.de");
    expect(mail.text).toContain("/feedback/moderieren?t=");
    expect(mail.text).toContain("&a=approve");
    expect(mail.text).toContain("&a=delete");
  });

  it("mails FEEDBACK_ADMIN_EMAIL when set", async () => {
    vi.stubEnv("FEEDBACK_ADMIN_EMAIL", "a@b.de");
    await service.submitFeedback(body, "de", TODAY);
    expect(vi.mocked(sendEmail).mock.calls[0][0].to).toBe("a@b.de");
  });

  it("refuses a second submission with 409", async () => {
    vi.mocked(repo.submitReviewForEvent).mockResolvedValue({ status: "already" });
    expect(await service.submitFeedback(body, "de", TODAY)).toEqual({
      ok: false,
      status: 409,
      error: err("feedbackAlreadySent"),
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("answers 410 when the event is gone", async () => {
    vi.mocked(repo.submitReviewForEvent).mockResolvedValue({ status: "missing" });
    expect(await service.submitFeedback(body, "de", TODAY)).toEqual({
      ok: false,
      status: 410,
      error: err("feedbackEventGone"),
    });
  });

  it("refuses a wrong or expired token without touching the database", async () => {
    for (const token of [moderateToken, "garbage", undefined]) {
      expect(await service.submitFeedback({ ...body, token }, "de", TODAY)).toEqual({
        ok: false,
        status: 403,
        error: err("feedbackLinkInvalid"),
      });
    }
    expect(await service.submitFeedback(body, "de", "2026-12-20")).toMatchObject({ ok: false, status: 403 });
    expect(repo.submitReviewForEvent).not.toHaveBeenCalled();
  });

  it("refuses everything without FEEDBACK_SECRET", async () => {
    vi.stubEnv("FEEDBACK_SECRET", "");
    expect(await service.submitFeedback(body, "de", TODAY)).toMatchObject({ ok: false, status: 403 });
  });

  it("returns the validation error with 400", async () => {
    expect(await service.submitFeedback({ ...body, consent: false }, "de", TODAY)).toEqual({
      ok: false,
      status: 400,
      error: err("publishConsentRequired"),
    });
  });

  it("still succeeds when the admin mail fails", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("smtp"));
    expect(await service.submitFeedback(body, "de", TODAY)).toEqual({ ok: true });
    expect(console.error).toHaveBeenCalled();
  });
});

describe("getFeedbackPageState", () => {
  it("is invalid without or with a bad token", async () => {
    expect(await service.getFeedbackPageState(undefined, TODAY)).toEqual({ kind: "invalid" });
    expect(await service.getFeedbackPageState("x.y", TODAY)).toEqual({ kind: "invalid" });
  });

  it("is gone when the event no longer exists", async () => {
    vi.mocked(repo.getFeedbackEventInfo).mockResolvedValue(undefined);
    expect(await service.getFeedbackPageState(feedbackToken, TODAY)).toEqual({ kind: "gone" });
  });

  it("is done when feedback was already sent", async () => {
    vi.mocked(repo.getFeedbackEventInfo).mockResolvedValue({ title: "Fest", ownerId: USER_ID, submitted: true });
    expect(await service.getFeedbackPageState(feedbackToken, TODAY)).toEqual({ kind: "done" });
  });

  it("shows the form with title and the account name", async () => {
    vi.mocked(repo.getFeedbackEventInfo).mockResolvedValue({ title: "Fest", ownerId: USER_ID, submitted: false });
    vi.mocked(users.getUserContact).mockResolvedValue({ name: "Anna", email: "a@b.de", locale: "de", feedbackMails: true });
    expect(await service.getFeedbackPageState(feedbackToken, TODAY)).toEqual({ kind: "form", title: "Fest", ownerName: "Anna" });
  });
});

describe("moderateReview", () => {
  it("approves a pending review", async () => {
    vi.mocked(repo.getReview).mockResolvedValue(review);
    vi.mocked(repo.approveReview).mockResolvedValue(true);
    expect(await service.moderateReview({ token: moderateToken, action: "approve" })).toEqual({ ok: true, result: "approved" });
    expect(repo.approveReview).toHaveBeenCalledWith(REVIEW_ID);
  });

  it("says when it was already approved", async () => {
    vi.mocked(repo.getReview).mockResolvedValue({ ...review, status: "approved" });
    vi.mocked(repo.approveReview).mockResolvedValue(false);
    expect(await service.moderateReview({ token: moderateToken, action: "approve" })).toEqual({
      ok: true,
      result: "already_approved",
    });
  });

  it("deletes a review, also an approved one", async () => {
    vi.mocked(repo.getReview).mockResolvedValue({ ...review, status: "approved" });
    vi.mocked(repo.deleteReview).mockResolvedValue(true);
    expect(await service.moderateReview({ token: moderateToken, action: "delete" })).toEqual({ ok: true, result: "deleted" });
    expect(repo.deleteReview).toHaveBeenCalledWith(REVIEW_ID);
  });

  it("is gone when the review no longer exists", async () => {
    vi.mocked(repo.getReview).mockResolvedValue(undefined);
    expect(await service.moderateReview({ token: moderateToken, action: "approve" })).toEqual({ ok: true, result: "gone" });
    expect(repo.approveReview).not.toHaveBeenCalled();
  });

  it("refuses a token of another kind", async () => {
    expect(await service.moderateReview({ token: feedbackToken, action: "approve" })).toEqual({
      ok: false,
      status: 403,
      error: err("feedbackLinkInvalid"),
    });
  });

  it("refuses an unknown action", async () => {
    expect(await service.moderateReview({ token: moderateToken, action: "publish" })).toEqual({
      ok: false,
      status: 400,
      error: err("invalidRequest"),
    });
  });
});

describe("getModerationState", () => {
  it("only reads (a link scanner opening the page changes nothing)", async () => {
    vi.mocked(repo.getReview).mockResolvedValue(review);
    expect(await service.getModerationState(moderateToken)).toEqual({ kind: "review", review });
    expect(repo.approveReview).not.toHaveBeenCalled();
    expect(repo.deleteReview).not.toHaveBeenCalled();
  });

  it("is invalid with a bad token and gone without the review", async () => {
    expect(await service.getModerationState("nope")).toEqual({ kind: "invalid" });
    vi.mocked(repo.getReview).mockResolvedValue(undefined);
    expect(await service.getModerationState(moderateToken)).toEqual({ kind: "gone" });
  });
});

describe("unsubscribeFeedback", () => {
  it("turns feedback mails off for the account", async () => {
    expect(await service.unsubscribeFeedback({ token: unsubscribeToken })).toEqual({ ok: true });
    expect(users.disableFeedbackMails).toHaveBeenCalledWith(USER_ID);
  });

  it("refuses an invalid token", async () => {
    expect(await service.unsubscribeFeedback({ token: moderateToken })).toEqual({
      ok: false,
      status: 403,
      error: err("feedbackLinkInvalid"),
    });
    expect(users.disableFeedbackMails).not.toHaveBeenCalled();
  });

  it("tells whether an unsubscribe token is valid without changing anything", () => {
    expect(service.isValidUnsubscribeToken(unsubscribeToken)).toBe(true);
    expect(service.isValidUnsubscribeToken("x")).toBe(false);
    expect(users.disableFeedbackMails).not.toHaveBeenCalled();
  });
});
