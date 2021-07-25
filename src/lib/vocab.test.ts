import { describe, it, expect } from "@jest/globals";
import { Vocab } from "./vocab";

describe("format", () => {
  describe("Vocab", () => {
    it("instantiates and looks up as expected", () => {
      const v = new Vocab(["foo", "bar", "baz", "quux"]);
      expect(v.power).toEqual(2);
      expect(v.lookupNumber(1)).toEqual("bar");
      expect(v.lookupWord("baz")).toEqual(2);
    });
  });
});
