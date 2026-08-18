import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  STATUS_COPY,
  extensionFromMime,
  formatElapsed,
  isWebmMime,
  permissionErrorMessage,
  pickRecorderMime,
  recordingFilename,
} from "./recorder";

describe("formatElapsed", () => {
  it("formats minutes and seconds like 00:00", () => {
    assert.equal(formatElapsed(0), "00:00");
    assert.equal(formatElapsed(1_500), "00:01");
    assert.equal(formatElapsed(65_000), "01:05");
  });

  it("includes hours after 60 minutes", () => {
    assert.equal(formatElapsed(3_661_000), "01:01:01");
  });
});

describe("mime helpers", () => {
  it("picks the first supported type", () => {
    assert.equal(
      pickRecorderMime((type) => type === "audio/webm"),
      "audio/webm",
    );
    assert.equal(pickRecorderMime(() => false), "");
  });

  it("maps mime types to download extensions", () => {
    assert.equal(extensionFromMime("audio/webm;codecs=opus"), "webm");
    assert.equal(extensionFromMime("audio/mp4"), "m4a");
    assert.equal(extensionFromMime("audio/ogg"), "ogg");
    assert.equal(recordingFilename(2, "audio/webm"), "recording-2.webm");
    assert.equal(isWebmMime("audio/webm;codecs=opus"), true);
    assert.equal(isWebmMime("audio/mp4"), false);
  });
});

describe("copy", () => {
  it("has a ready status and maps permission errors", () => {
    assert.equal(STATUS_COPY.idle, "Ready to record");
    assert.match(permissionErrorMessage({ name: "NotAllowedError" }), /denied/i);
    assert.match(permissionErrorMessage({ name: "NotFoundError" }), /No microphone/i);
  });
});
