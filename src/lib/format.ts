type PadSide = "left" | "right";

// BitString is a string of binary 0 and 1 bits.
type BitString = {
  type: "BitString";
  bits: string;
};

// NumArray is an array of unsigned integers, scoped to a specific power of 2.
type NumArray = {
  type: "NumArray";
  power: number;
  nums: number[];
};

// Word is a word and its associated occurrence count in the corpus.
type Word = {
  word: string;
  count: number;
};

// Vocab is an ordered st of words used as a translation vocabulary.
export class Vocab {
  // The effective power of this vocab set.
  readonly power: number;
  // Word to number lookup.
  private wtn: { [k: string]: number } = {};
  // Number to word lookup.
  private ntw: { [k: number]: string } = {};

  // Instantiate a Vocab instance with its vocabulary.
  constructor(words: string[]) {
    this.power = Math.floor(Math.log2(words.length));
    words.forEach((w, n) => {
      this.wtn[w] = n;
      this.ntw[n] = w;
    });
  }

  // Look up a number for a word.
  lookupWord = (w: string): number => {
    return this.wtn[w];
  };

  // Look up a word for a number.
  lookupNumber = (n: number): string => {
    return this.ntw[n];
  };
}

// pad pads a bitstring on a given side with 0s to a given length.
function pad(side: PadSide, len: number, { bits }: BitString): BitString {
  let v = bits.slice();
  if (v.length > len)
    throw new Error(`Value ${v} is already longer than desired length ${len}`);
  while (v.length < len) {
    if (side == "left") v = "0" + v;
    else v = v + "0";
  }
  return { type: "BitString", bits: v };
}

// pad pads a bitstring on a given side with 0s until it matches the given modulo size.
function padMod(side: PadSide, mod: number, bs: BitString): BitString {
  const mul = Math.ceil(bs.bits.length / mod);
  return pad(side, mod * mul, bs);
}

// group splits a string into an array of strings of the given length.
function group(size: number, s: string): string[] {
  let g = [];
  for (let x = 0; x < s.length; x += size) g.push(s.slice(x, x + size));
  return g;
}

// naToBs converts a NumArray to a BitString.
function naToBs(na: NumArray): BitString {
  const chunks = na.nums.map((num) => {
    const bs: BitString = { type: "BitString", bits: num.toString(2) };
    return padMod("left", na.power, bs).bits;
  });
  return { type: "BitString", bits: chunks.join("") };
}

// bsToNa converts a BitString to a NumArray of the given power.
function bsToNa(power: number, bs: BitString): NumArray {
  const padded = padMod("right", power, bs);
  const grouped = group(power, padded.bits);
  return { type: "NumArray", power, nums: grouped.map((g) => parseInt(g, 2)) };
}

// convertNa converts a NumArray to a NumArray of a different power.
function convertNa(toPower: number, na: NumArray): NumArray {
  const bs = naToBs(na);
  return bsToNa(toPower, bs);
}

// stringToNa converts a string to a NumArray as UTF-8 bytes.
export function stringToNa(s: string): NumArray {
  const nums = Array.from(new TextEncoder().encode(s));
  return { type: "NumArray", power: 8, nums };
}

// stringToNa converts a string to a NumArray as UTF-8 bytes.
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
function wordsToNa(v: Vocab, w: string[]): NumArray {
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

// const data: NumArray = {
//   type: "NumArray",
//   power: 8,
//   nums: [0xff, 0x00, 0xfe, 0, 1],
// };
// const interm = convertNa(12, data);
// const result = convertNa(8, interm);
// console.log({ data, interm, result });
