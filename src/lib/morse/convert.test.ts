import assert from "node:assert/strict";
import test from "node:test";
import { convertMorse, morseToText, textToMorse } from "./convert";

test("encodes HELLO like WorkUtilities", () => {
  assert.equal(textToMorse("HELLO"), ".... . .-.. .-.. ---");
});

test("encodes spaces as slash word separators", () => {
  assert.equal(textToMorse("HI THERE"), ".... .. / - .... . .-. .");
});

test("decodes Morse back to text", () => {
  assert.equal(morseToText(".... . .-.. .-.. ---"), "HELLO");
  assert.equal(morseToText("... --- ..."), "SOS");
  assert.equal(morseToText(".... .. / - .... . .-. ."), "HI THERE");
});

test("convertMorse switches by mode", () => {
  assert.equal(convertMorse("sos", "encode"), "... --- ...");
  assert.equal(convertMorse("... --- ...", "decode"), "SOS");
});

test("drops unsupported characters on encode", () => {
  assert.equal(textToMorse("HI😊"), ".... ..");
});

test("returns empty string for empty input", () => {
  assert.equal(textToMorse(""), "");
  assert.equal(morseToText("   "), "");
});
