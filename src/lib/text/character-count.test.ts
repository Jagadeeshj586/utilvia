import assert from "node:assert/strict";
import test from "node:test";
import { countCharacters, countParagraphs, countSentences } from "./character-count";

test("counts characters with and without spaces", () => {
  const stats = countCharacters("Hello world! This is a test.\n\nSecond paragraph here.");
  assert.equal(stats.characters, 52);
  assert.equal(stats.noSpaces, 43);
  assert.equal(stats.words, 9);
  assert.equal(stats.sentences, 3);
  assert.equal(stats.paragraphs, 2);
});

test("returns zeros for empty text", () => {
  assert.deepEqual(countCharacters(""), {
    characters: 0,
    noSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
  });
});

test("counts sentences and paragraphs", () => {
  assert.equal(countSentences("One. Two! Three?"), 3);
  assert.equal(countParagraphs("Para one.\n\nPara two."), 2);
});
