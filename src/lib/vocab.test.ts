import { describe, it, expect } from "@jest/globals";
import { omitPrefixes, squareShuffle, Vocab } from "./vocab";

describe("Vocab", () => {
  it("instantiates and looks up as expected", () => {
    const v = new Vocab(["foo", "bar", "baz", "quux"]);
    expect(v.power).toEqual(2);
    expect(v.lookupNumber(1)).toEqual("bar");
    expect(v.lookupWord("baz")).toEqual(2);
  });
});

describe("omitPrefixes", () => {
  it("drops words that are prefixed by others while maintaining the original order", () => {
    expect(
      omitPrefixes([
        "app",
        "apple",
        "appetizer",
        "api",
        "fun",
        "fungus",
        "frustrum",
      ])
    ).toEqual(["app", "api", "fun", "frustrum"]);
  });
});

describe("squareShuffle", () => {
  it("shuffles as expected", () => {
    expect(squareShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])).toEqual([
      1, 5, 9, 13, 2, 6, 10, 3, 7, 11, 4, 8, 12,
    ]);
    expect(squareShuffle([1, 2, 3, 4, 5, 6, 7, 8])).toEqual([
      1, 4, 7, 2, 5, 8, 3, 6,
    ]);
  });
});
