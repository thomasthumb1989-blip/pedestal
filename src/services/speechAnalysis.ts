const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'so', 'basically',
  'actually', 'right', 'er', 'ah',
];

const MIN_WORDS_FOR_ANALYSIS = 20;

export type SpeechMetrics = {
  clarityScore: number;
  wordsPerMinute: number;
  totalWords: number;
  fillerCount: number;
  fillerPercentage: number;
  fillerPositions: { word: string; index: number }[];
  tooShort: boolean;
};

// ── Sub-scores ──────────────────────────────────────

/** Filler word penalty: 40% of total. Lose 4 pts per filler, min 0. */
function calcFillerScore(fillerCount: number): number {
  return Math.max(0, 40 - fillerCount * 4);
}

/** Pace score: 30% of total. Ideal 130-160 WPM. */
function calcPaceScore(wpm: number): number {
  if (wpm >= 130 && wpm <= 160) return 30;
  if ((wpm >= 100 && wpm < 130) || (wpm > 160 && wpm <= 190)) return 20;
  if ((wpm >= 60 && wpm < 100) || (wpm > 190 && wpm <= 220)) return 10;
  return 5;
}

/** Sentence structure: 30% of total. Ideal 10-20 words/sentence. */
function calcStructureScore(transcript: string, totalWords: number): number {
  const sentences = transcript
    .split(/[.?!]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) return 5; // no sentence breaks = rambling

  const avgWordsPerSentence = totalWords / sentences.length;

  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) return 30;
  if ((avgWordsPerSentence >= 5 && avgWordsPerSentence < 10) ||
      (avgWordsPerSentence > 20 && avgWordsPerSentence <= 30)) return 20;
  return 10;
}

// ── Main analysis ───────────────────────────────────

export function analyzeSpeech(transcript: string, durationSeconds: number): SpeechMetrics {
  const words = transcript.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const durationMinutes = durationSeconds / 60;
  const wordsPerMinute = durationMinutes > 0 ? Math.round(totalWords / durationMinutes) : 0;

  // Detect fillers
  const lowerTranscript = transcript.toLowerCase();
  const fillerPositions: { word: string; index: number }[] = [];
  const sortedFillers = [...FILLER_WORDS].sort((a, b) => b.length - a.length);

  for (const filler of sortedFillers) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    let match;
    while ((match = regex.exec(lowerTranscript)) !== null) {
      const alreadyCovered = fillerPositions.some(
        (p) => match!.index >= p.index && match!.index < p.index + p.word.length,
      );
      if (!alreadyCovered) {
        fillerPositions.push({ word: filler, index: match.index });
      }
    }
  }

  const fillerCount = fillerPositions.length;
  const fillerPercentage = totalWords > 0 ? (fillerCount / totalWords) * 100 : 0;
  const tooShort = totalWords < MIN_WORDS_FOR_ANALYSIS;

  // Multi-factor clarity score
  const clarityScore = tooShort
    ? 0
    : Math.min(100, calcFillerScore(fillerCount) + calcPaceScore(wordsPerMinute) + calcStructureScore(transcript, totalWords));

  return {
    clarityScore,
    wordsPerMinute,
    totalWords,
    fillerCount,
    fillerPercentage: Math.round(fillerPercentage * 10) / 10,
    fillerPositions: fillerPositions.sort((a, b) => a.index - b.index),
    tooShort,
  };
}
