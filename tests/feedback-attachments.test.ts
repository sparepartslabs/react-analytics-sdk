import { afterEach, describe, expect, it, vi } from "vitest";
import { effectiveScreenshotLimits, releaseScreenshot, selectScreenshots } from "../src/feedback/attachments";
import { FEEDBACK_ATTACHMENT_MAX_COUNT, FEEDBACK_ATTACHMENT_MAX_SIZE_BYTES } from "../src/feedback/types";
import { imageFile, installObjectUrlSpies } from "./feedback-test-utils";

afterEach(() => vi.restoreAllMocks());

describe("feedback screenshot selection", () => {
  it("accepts supported images, creates previews, rejects duplicates, and releases previews", () => {
    const urls = installObjectUrlSpies();
    const files = [imageFile("a.png", "image/png"), imageFile("b.jpg", "image/jpeg"), imageFile("c.webp", "image/webp")];
    const result = selectScreenshots(files, [], { enabled: true });
    expect(result.accepted).toHaveLength(3);
    expect(result.rejected).toHaveLength(0);
    expect(urls.create).toHaveBeenCalledTimes(3);
    expect(selectScreenshots([files[0]], result.accepted, { enabled: true }).rejected[0].error.kind).toBe("duplicate");
    releaseScreenshot(result.accepted[0]);
    expect(urls.revoke).toHaveBeenCalledWith(result.accepted[0].previewUrl);
  });

  it("keeps valid files from mixed selection and rejects invalid files before previews", () => {
    const urls = installObjectUrlSpies();
    const result = selectScreenshots([
      imageFile("ok.png"), imageFile("empty.png", "image/png", 0), imageFile("bad.gif", "image/gif"), imageFile("large.jpg", "image/jpeg", 1025),
    ], [], { enabled: true, maxSizeBytes: 1024 });
    expect(result.accepted.map((item) => item.name)).toEqual(["ok.png"]);
    expect(result.rejected.map((item) => item.error.kind)).toEqual(["empty_file", "unsupported_type", "too_large"]);
    expect(urls.create).toHaveBeenCalledTimes(1);
  });

  it("enforces count and stricter effective limits", () => {
    installObjectUrlSpies();
    expect(effectiveScreenshotLimits({ enabled: true, maxCount: 99, maxSizeBytes: 99_000_000 })).toMatchObject({ maxCount: FEEDBACK_ATTACHMENT_MAX_COUNT, maxSizeBytes: FEEDBACK_ATTACHMENT_MAX_SIZE_BYTES });
    expect(effectiveScreenshotLimits({ enabled: true, maxCount: 2, maxSizeBytes: 1000 })).toMatchObject({ maxCount: 2, maxSizeBytes: 1000 });
    expect(() => effectiveScreenshotLimits({ enabled: true, maxCount: 0 })).toThrow("positive integer");
    const result = selectScreenshots([imageFile("1.png"), imageFile("2.png"), imageFile("3.png")], [], { enabled: true, maxCount: 2 });
    expect(result.accepted).toHaveLength(2);
    expect(result.rejected[0].error.kind).toBe("too_many");
  });
});
