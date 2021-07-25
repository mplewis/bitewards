import { describe, it, expect } from "@jest/globals";
import {
  BitString,
  bsToNa,
  convertNa,
  naToBs,
  naToString,
  naToWords,
  NumArray,
  stringToNa,
  stringToWords,
  wordsToNa,
  wordsToString,
} from "./format";
import { Vocab } from "./vocab";

const na8: NumArray = {
  type: "NumArray",
  power: 8,
  nums: [0xfe, 0xff, 0x00, 0x7f],
};
const bs8: BitString = {
  type: "BitString",
  bits: "11111110111111110000000001111111",
};

const words = Array(256)
  .fill(null)
  .map((_, i) => `word${i}`);
const vocab = new Vocab(words);

describe("NumArray <-> BitString", () => {
  describe("naToBs", () => {
    it("converts as expected", () => {
      expect(naToBs(na8)).toEqual(bs8);
    });
  });
  describe("bsToNa", () => {
    it("converts as expected", () => {
      expect(bsToNa(8, bs8)).toEqual(na8);
    });
  });
  describe("convertNa", () => {
    it("converts as expected", () => {
      expect(convertNa(16, na8).nums).toEqual([0xfeff, 0x007f]);
    });
  });
  describe("stringToNa", () => {
    it("converts as expected", () => {
      expect(stringToNa("foo")).toEqual({
        type: "NumArray",
        power: 8,
        nums: [102, 111, 111],
      });
    });
  });
  describe("naToString", () => {
    it("converts as expected", () => {
      expect(
        naToString({
          type: "NumArray",
          power: 8,
          nums: [102, 111, 111],
        })
      ).toEqual("foo");
    });
  });
  describe("naToWords", () => {
    it("converts as expected", () => {
      expect(naToWords(vocab, na8)).toEqual([
        "word254",
        "word255",
        "word0",
        "word127",
      ]);
    });
  });
  describe("wordsToNa", () => {
    it("converts as expected", () => {
      expect(
        wordsToNa(vocab, ["word254", "word255", "word0", "word127"])
      ).toEqual(na8);
    });
  });
  describe("stringToWords", () => {
    it("converts as expected", () => {
      expect(stringToWords(vocab, "Hello")).toEqual([
        "word72",
        "word101",
        "word108",
        "word108",
        "word111",
      ]);
    });
  });
  describe("wordsToString", () => {
    it("converts as expected", () => {
      expect(
        wordsToString(vocab, [
          "word72",
          "word101",
          "word108",
          "word108",
          "word111",
        ])
      ).toEqual("Hello");
    });
  });
});
