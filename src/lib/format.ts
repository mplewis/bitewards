import { groupsOf, padMod } from "./string";
import { Vocab } from "./vocab";

// BitString is a string of binary 0 and 1 bits.
export type BitString = {
  type: "BitString";
  bits: string;
};

// NumArray is an array of unsigned integers, scoped to a specific power of 2.
export type NumArray = {
  type: "NumArray";
  power: number;
  nums: number[];
};

// naToBs converts a NumArray to a BitString.
export function naToBs(na: NumArray): BitString {
  const chunks = na.nums.map((num) => {
    const bs: BitString = { type: "BitString", bits: num.toString(2) };
    return padMod("left", na.power, bs.bits);
  });
  return { type: "BitString", bits: chunks.join("") };
}

// bsToNa converts a BitString to a NumArray of the given power.
export function bsToNa(power: number, bs: BitString): NumArray {
  const padded = padMod("right", power, bs.bits);
  const grouped = groupsOf(power, padded);
  return { type: "NumArray", power, nums: grouped.map((g) => parseInt(g, 2)) };
}

// convertNa converts a NumArray to a NumArray of a different power.
export function convertNa(toPower: number, na: NumArray): NumArray {
  const bs = naToBs(na);
  return bsToNa(toPower, bs);
}

// stringToNa converts a string to a NumArray as UTF-8 bytes.
export function stringToNa(s: string): NumArray {
  const nums = Array.from(new TextEncoder().encode(s));
  return { type: "NumArray", power: 8, nums };
}

// naToString converts a NumArray to a string as UTF-8 bytes.
export function naToString(na: NumArray): string {
  const n8 = convertNa(8, na);
  return new TextDecoder().decode(new Uint8Array(n8.nums));
}

// naToWords converts a NumArray to a set of words using a given vocab.
export function naToWords(v: Vocab, na: NumArray): string[] {
  const vna = convertNa(v.power, na);
  return vna.nums.map(v.lookupNumber);
}

// wordsToNa converts a set of words to a NumArray using a given vocab.
export function wordsToNa(v: Vocab, w: string[]): NumArray {
  const nums = w.map(v.lookupWord);
  return { type: "NumArray", power: v.power, nums };
}

// stringToWords converts a string to a set of words via UTF-8 encoding using a given vocab.
export function stringToWords(v: Vocab, s: string): string[] {
  const na = stringToNa(s);
  return naToWords(v, na);
}

// wordsToString converts a set of words to a string using UTF-8 encoding using a given vocab.
export function wordsToString(v: Vocab, w: string[]): string {
  console.log(wordsToNa(v, w));
  return naToString(wordsToNa(v, w));
}
