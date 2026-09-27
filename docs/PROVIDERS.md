# Language providers

The app looks words up in two public services. Each request carries one search term; the scoring and the training plan are local code in `src/core/`. This page lists what each service supplies, which words leave the browser, and what happens when a lookup fails. The lookup code is `src/services/linguistic.ts`.

## Datamuse

Datamuse is the primary provider. The app sends two kinds of query to `https://api.datamuse.com/words`:

| Used for             | Query                                                                                                 | What comes back                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Rhyme lab search     | `rel_rhy` (exact rhymes), `rel_nry` (near rhymes), `ml` (related meanings), `sl` (sound-alikes), `rel_syn` (synonyms) | Word lists, shown as chips you can copy                                                                      |
| Pronunciation lookup | `sp=<word>&qe=sp&md=rpsd`                                                                             | The pronunciation in Arpabet (a plain-text phonetic alphabet), parts of speech, the syllable count and definitions |

The app asks for no word frequencies (`md` has no `f`) and no IPA pronunciations (it never sends `ipa=1`), so every pronunciation it gets from Datamuse is Arpabet.

The Datamuse API page (https://www.datamuse.com/api/, read on 2026-09-27) says the service needs no key for up to 100,000 requests a day until January 1, 2027. From that date every request needs a key, and each key gets 100,000 requests a day. Settings therefore has an optional Datamuse key field. The app keeps the key in `localStorage` and sends it as a `token` query parameter. The Datamuse page does not yet say which parameter it will read, so whether it accepts the key this way is unknown.

## Free Dictionary API

The Free Dictionary API (`https://api.dictionaryapi.dev/api/v2/entries/en/<word>`) is the fallback. The app asks it when the Datamuse lookup fails or returns no pronunciation, and it takes an IPA transcription (International Phonetic Alphabet), a definition and a link to a recording of the word. The Rhyme lab shows all three. Rhyme scoring reads only Datamuse's Arpabet, so a word that only the dictionary could pronounce is scored by the spelling rules.

## Caching and failure

Answers are cached in `localStorage` under the key `freestyle-engine-api-cache-v1` for 30 days, and Settings has a button that clears the cache. When a lookup fails, the Rhyme lab shows an error, and rhyme scoring falls back to the local rules that estimate how a word sounds from its spelling. A take is still scored when every lookup fails.

## What leaves the browser

The app sends these services one search term per request and does not send them recordings or whole transcripts. Two things trigger a lookup: a search in the Rhyme lab, which sends what you typed, and the end of every take, when each distinct word of the transcript that is at least two letters long is looked up for its pronunciation, five requests at a time, unless the answer is already cached. Each request carries one word, but together the requests carry the take's vocabulary.

Speech recognition is separate. In Chrome, the Web Speech API sends the audio of a take to a Google service to transcribe it, as the README's [Limitations](../README.md#limitations) section explains.

## Citations

- Datamuse API: https://www.datamuse.com/api/
- Free Dictionary API: https://dictionaryapi.dev/
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
