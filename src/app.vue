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
    <p>Corpus size: {{ corpus.length }}</p>
    <p>Vocabulary size: {{ vocab.length }}</p>
    <pre><code>
      {{vocab}}
    </code></pre>
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

  @memoize
  static vocab(minWordLen: number): string[] {
    return Provider.withoutPrefixes(minWordLen)
      .slice(0, vocabSize)
      .map(({ word }) => word);
  }
}

export default defineComponent({
  name: "App",
  data: () => ({
    corpus,
    minWordLen: 6,
  }),
  computed: {
    vocab(): string[] {
      return Provider.vocab(this.minWordLen);
    },
  },
});
</script>

<style>
body {
  margin: 40px 20px;
}
</style>
