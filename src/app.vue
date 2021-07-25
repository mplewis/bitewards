<template>
  <div class="container">
    <label class="label" for="min-word-len">
      Minimum word length: {{ minWordLen }}
    </label>
    <input
      id="min-word-len"
      type="range"
      min="3"
      max="9"
      v-model="minWordLen"
    />
    <label class="label" for="min-word-len">
      Bits per word: {{ bitsPerWord }}
    </label>
    <input
      id="bits-per-word"
      type="range"
      min="8"
      max="16"
      v-model="bitsPerWord"
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

    <div v-if="corpus">
      <p>Corpus size: {{ corpus.length }}</p>
      <p>Vocabulary size: {{ vocab.length }}</p>
    </div>

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
import { omitPrefixes, squareShuffle, Vocab } from "./lib/vocab";
import { stringToWords, wordsToString } from "./lib/format";

import "bulma/bulma.sass";

interface Data {
  corpus: string[] | null;
  minWordLen: number;
  bitsPerWord: number;
  shuffle: boolean;
  inputData: string;
  inputWords: string;
}

export default defineComponent({
  name: "App",
  data(): Data {
    return {
      corpus: null,
      minWordLen: 6,
      bitsPerWord: 12,
      shuffle: true,
      inputData: "Hi!",
      inputWords: "",
    };
  },
  async mounted() {
    const resp = await fetch("/unigrams.txt");
    const r = resp.body?.getReader();
    if (!r) throw new Error("Could not fetch unigrams: empty body");
    const raw = (await r.read()).value;
    if (!raw) throw new Error("Could not fetch unigrams: reading body failed");
    this.corpus = new TextDecoder()
      .decode(raw)
      .split("\n")
      .map((s) => s.trim())
      .filter((w) => w.length > 0);
  },
  computed: {
    vocab(): Vocab | undefined {
      if (!this.corpus) return;
      let words = this.corpus.slice();
      words = words.filter((w) => w.length >= this.minWordLen);
      words = omitPrefixes(words);
      words = words.slice(0, 2 ** this.bitsPerWord);
      if (this.shuffle) words = squareShuffle(words);
      return new Vocab(words);
    },
    outputWords(): string | undefined {
      if (!this.vocab) return;
      return stringToWords(this.vocab, this.inputData).join(" ");
    },
    outputData(): string | undefined {
      if (!this.vocab) return;
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
