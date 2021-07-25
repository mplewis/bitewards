// Vocab is an ordered st of words used as a translation vocabulary.
export class Vocab {
  // The effective power of this vocab set.
  readonly power: number;
  // The number of words in this set.
  readonly length: number;
  // Word to number lookup.
  private wtn: { [k: string]: number } = {};
  // Number to word lookup.
  private ntw: { [k: number]: string } = {};

  // Instantiate a Vocab instance with its vocabulary.
  constructor(words: string[]) {
    this.length = words.length;
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

// omitPrefixes filters a list of words by dropping any words that are prefixed with another word in the set.
export function omitPrefixes(cands: string[]): string[] {
  const withIndex = cands.map((c, i) => ({ word: c, index: i }));
  const ok: { word: string; index: number }[] = [];
  let last: string | null = null;
  const c = withIndex.sort((a, b) => {
    if (a.word > b.word) return 1;
    if (a.word < b.word) return -1;
    return 0;
  });
  c.forEach((cand) => {
    if (!last || !cand.word.startsWith(last)) {
      ok.push(cand);
      last = cand.word;
    }
  });
  return ok.sort((a, b) => a.index - b.index).map(({ word }) => word);
}

// squareShuffle shuffles a list of N items deterministically by splitting items into sqrt(N) buckets, round-robin.
export function squareShuffle<T>(items: T[]): T[] {
  const s = Math.sqrt(items.length);
  const a = Math.ceil(s);
  const out: T[] = [];
  for (let i = 0; i < a; i++) {
    for (let j = 0; j < a; j++) {
      let item = items[j * a + i];
      if (item != undefined) {
        out.push(item);
      }
    }
  }
  return out;
}
