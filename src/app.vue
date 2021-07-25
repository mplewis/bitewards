<template>
  <div class="container">
    <label class="label" for="min-word-len">
      Minimum Word Length: {{ minWordLen }}
    </label>
    <input
      id="min-word-len"
      type="range"
      min="3"
      max="9"
      v-model="minWordLen"
    />
    <p>
      <input
        id="shuffle"
        class="checkbox mr-1"
        type="checkbox"
        v-model="shuffle"
      />
      <label for="shuffle">Shuffle?</label>
    </p>

    <p>Corpus size: {{ corpus.length }}</p>
    <p>Vocabulary size: {{ vocab.length }}</p>

    <label for="input-data">Input data (bytes)</label>
    <input id="input-data" type="text" class="input" v-model="inputData" />
    <p>{{ outputWords }}</p>

    <label for="input-words">Input words</label>
    <input id="input-words" type="text" class="input" v-model="inputWords" />
    <p>{{ outputData }}</p>
  </div>
</template>


<script lang="ts">
import { defineComponent } from "vue";
import { memoize } from "decko";
import corpus from "./assets/unigram_freq.json";

import "bulma/bulma.sass";

const corpusLimit = 50000;
const bitsPerWord = 12;
const vocabSize = 2 ** bitsPerWord;

interface Word {
  word: string;
  count: number;
}

function sortAlph(words: Word[]): Word[] {
  return words.sort((a: Word, b: Word) => {
    if (a.word == b.word) return 0;
    if (a.word < b.word) return -1;
    return 1;
  });
}

function omitPrefixes(cands: Word[]): Word[] {
  const ok: Word[] = [];
  let last: Word | null = null;
  sortAlph(cands).forEach((cand) => {
    if (!last || !cand.word.startsWith(last.word)) {
      ok.push(cand);
      last = cand;
    }
  });
  ok.sort((a: Word, b: Word) => b.count - a.count);
  return ok;
}

function concat(bytes: number[]): BigInt {
  if (bytes.length === 0) return 0n;
  let s = "0b";
  bytes.forEach((byte) => (s += leftPad("0", 8, byte.toString(2))));
  console.log({ s });
  return BigInt(s);
}

function group(n: number, i: string): string[] {
  let g = [];
  for (let x = 0; x < i.length; x += n) g.push(i.slice(x, x + n));
  return g;
}

function leftPad(pad: string, len: number, val: string) {
  let v = val;
  while (v.length < len) {
    v = pad + v;
  }
  return v;
}

function leftPadMod(pad: string, mod: number, val: string) {
  let v = val;
  while (v.length % mod !== 0) {
    v = pad + v;
  }
  return v;
}

function encode(vocab: string[], bytes: number[]): string[] {
  const rawBin = leftPadMod("0", bitsPerWord, concat(bytes).toString(2)); // HACK
  const chunks = group(bitsPerWord, rawBin);
  let lastChunk = chunks.pop();
  if (!lastChunk) throw new Error("No chunk data");
  lastChunk = leftPad("0", bitsPerWord, lastChunk);
  chunks.push(lastChunk);
  console.log({ bytes, rawBin, chunks });
  const nums = chunks.map((c) => parseInt(c, 2));
  return nums.map((n) => vocab[n]);
}

function revLookup(vocab: string[]): { [k: string]: number } {
  const l: { [k: string]: number } = {};
  vocab.forEach((word, i) => {
    l[word] = i;
  });
  return l;
}

function decode(vocab: string[], words: string[]): string {
  if (words.length === 0) return "";
  let bin = "";
  const l = revLookup(vocab);
  console.log({ vocab, l });
  words.forEach((word) => {
    const num = l[word];
    if (!num) throw new Error(`Unknown word: ${word}`);
    bin += leftPad("0", bitsPerWord, num.toString(2));
  });
  const bytes = group(8, bin).map((ns) => parseInt(ns, 2));
  console.log({ bin, bytes });
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function shuffle(words: string[]): string[] {
  // TODO: Fix
  const bucketCount = Math.ceil(Math.sqrt(words.length));
  const subLists: string[][] = [];
  for (let i = 0; i < bucketCount; i++) {
    subLists.push([]);
  }
  for (let i = 0; i < bucketCount; i++) {
    let j = 0;
    while (j < words.length) {
      subLists[i].push(words[j]);
      j += bucketCount;
    }
  }
  return subLists.flat();
}

class Provider {
  @memoize
  static withMinLen(minWordLen: number): Word[] {
    return corpus
      .slice(0, corpusLimit)
      .filter(({ word }) => word.length >= minWordLen);
  }

  @memoize
  static withoutPrefixes(minWordLen: number): Word[] {
    return omitPrefixes(Provider.withMinLen(minWordLen));
  }

  static vocab(minWordLen: number, shuf: boolean): string[] {
    const words = Provider.withoutPrefixes(minWordLen)
      .slice(0, vocabSize)
      .map(({ word }) => word);
    if (shuf) return shuffle(words);
    return words;
  }
}

export default defineComponent({
  name: "App",
  data: () => ({
    corpus,
    minWordLen: 6,
    shuffle: false,
    inputData: "Hi!",
    inputWords: "",
  }),
  computed: {
    vocab(): string[] {
      return Provider.vocab(this.minWordLen, this.shuffle);
    },
    outputWords(): string {
      return encode(
        this.vocab,
        Array.from(new TextEncoder().encode(this.inputData))
      ).join(" ");
    },
    outputData(): string {
      const words = this.inputWords.match(/\w+/g);
      if (!words) return "";
      return decode(this.vocab, words);
    },
  },
});
</script>

<style>
body {
  margin: 40px 20px;
}
</style>
