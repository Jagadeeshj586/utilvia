import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { langToTranslateCode, pickEdgeVoice, pitchToEdgeString, rateToEdgeString, splitTextForTts } from "./speech";

describe("rateToEdgeString", () => {
  it("maps 1x to +0%", () => {
    assert.equal(rateToEdgeString(1), "+0%");
  });

  it("maps half speed to -50%", () => {
    assert.equal(rateToEdgeString(0.5), "-50%");
  });

  it("maps double speed to +100%", () => {
    assert.equal(rateToEdgeString(2), "+100%");
  });
});

describe("pitchToEdgeString", () => {
  it("maps default pitch to +0Hz", () => {
    assert.equal(pitchToEdgeString(1), "+0Hz");
  });
});

describe("pickEdgeVoice", () => {
  it("returns exact locale match", () => {
    assert.equal(pickEdgeVoice("en-GB"), "en-GB-SoniaNeural");
  });

  it("falls back by language prefix", () => {
    assert.match(pickEdgeVoice("en-CA"), /^en-/);
  });

  it("defaults to US English", () => {
    assert.equal(pickEdgeVoice("xx-YY"), "en-US-JennyNeural");
  });
});

describe("splitTextForTts", () => {
  it("returns one chunk for short text", () => {
    assert.deepEqual(splitTextForTts("hello world"), ["hello world"]);
  });

  it("splits on word boundaries", () => {
    const text = "word ".repeat(60).trim();
    const chunks = splitTextForTts(text, 50);
    assert.ok(chunks.length > 1);
    assert.ok(chunks.every((chunk) => chunk.length <= 50));
  });
});

describe("langToTranslateCode", () => {
  it("uses language prefix", () => {
    assert.equal(langToTranslateCode("hi-IN"), "hi");
  });
});
