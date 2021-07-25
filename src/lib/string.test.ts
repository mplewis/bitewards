import { describe, it, expect } from "@jest/globals";
import { groupsOf, pad, padMod } from "./string";

describe("pad", () => {
  it("pads strings with 0s on the proper side to the given length", () => {
    expect(pad("left", 8, "1111")).toEqual("00001111");
    expect(pad("right", 8, "1111")).toEqual("11110000");
  });
});

describe("padMod", () => {
  it("pads strings with 0s on the proper side to the given modulo", () => {
    expect(padMod("left", 4, "1111")).toEqual("1111");
    expect(padMod("left", 8, "1111")).toEqual("00001111");
    expect(padMod("left", 5, "123456")).toEqual("0000123456");
  });
});

describe("groupsOf", () => {
  it("splits a string into groups of the given length", () => {
    expect(groupsOf(4, "12345678")).toEqual(["1234", "5678"]);
  });
});
