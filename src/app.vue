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
import {
  Vocab,
  stringToWords,
  wordsToString,
  wordsToString,
} from "./lib/format";
import corpus from "./assets/unigram_freq.json";
// const corpus: Word[] = [];

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

  static vocab(minWordLen: number, shuf: boolean): Vocab {
    let words = Provider.withoutPrefixes(minWordLen)
      .slice(0, vocabSize)
      .map(({ word }) => word);
    if (shuf) words = shuffle(words);
    return new Vocab(words);
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
    vocab(): Vocab {
      return Provider.vocab(this.minWordLen, this.shuffle);
    },
    outputWords(): string {
      return stringToWords(this.vocab, this.inputData).join(" ");
    },
    outputData(): string {
      const matches = this.inputWords.match(/\w+/g);
      if (!matches) return "";
      return wordsToString(this.vocab, matches);
    },
  },
});
</script>

<style>
body {
  margin: 40px 20px;
}
</style>
