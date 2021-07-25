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
