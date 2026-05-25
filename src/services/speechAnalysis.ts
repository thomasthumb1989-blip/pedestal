const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'so', 'basically',
  'actually', 'right', 'er', 'ah',
];

const HEDGING_PHRASES = [
  'i think', 'maybe', 'sort of', 'kind of', 'probably',
  'i guess', 'i suppose', 'perhaps', 'might be', 'could be',
];

const MIN_WORDS_FOR_ANALYSIS = 10;

export type TipSeverity = 'critical' | 'improvement' | 'positive';

export type SpeechTip = {
  severity: TipSeverity;
  label: string;
  detail: string;
  fix: string;
  /** Lower = worse, shown first */
  priority: number;
};

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

// ── Detailed analysis for tips ─────────────────────

function getSentences(transcript: string): string[] {
  return transcript
    .split(/[.?!]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Detect hedging phrases and their counts */
function detectHedging(transcript: string): { phrase: string; count: number }[] {
  const lower = transcript.toLowerCase();
  const results: { phrase: string; count: number }[] = [];

  for (const phrase of HEDGING_PHRASES) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      results.push({ phrase, count: matches.length });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}

/** Detect repeated non-trivial words (3+ occurrences, 4+ chars) */
function detectRepetition(transcript: string): { word: string; count: number }[] {
  const words = transcript.toLowerCase().replace(/[^a-z\s'-]/g, '').split(/\s+/).filter(Boolean);
  const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'them', 'their', 'what', 'when', 'where', 'which', 'there', 'these', 'those', 'about', 'would', 'could', 'should', 'being', 'also', 'than', 'then', 'into', 'some', 'very', 'just', 'your', 'will', 'more']);
  const freq = new Map<string, number>();

  for (const w of words) {
    if (w.length < 4 || stopWords.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }

  return [...freq.entries()]
    .filter(([, count]) => count >= 3)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}

/** Calculate vocabulary variety: unique words / total words */
function calcVocabVariety(transcript: string): number {
  const words = transcript.toLowerCase().replace(/[^a-z\s'-]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const unique = new Set(words);
  return unique.size / words.length;
}

/** Get feedback header based on clarity score */
export function getFeedbackHeader(clarityScore: number): string {
  if (clarityScore >= 90) return 'Excellent delivery — minor polish needed';
  if (clarityScore >= 75) return 'Good foundation — focus on these areas';
  if (clarityScore >= 60) return 'Getting there — practice these specific fixes';
  return 'Keep practicing — here\'s exactly what to work on';
}

/** Generate 3-5 specific, actionable, severity-ranked tips */
export function generateDetailedTips(
  transcript: string,
  metrics: SpeechMetrics,
): SpeechTip[] {
  const tips: SpeechTip[] = [];
  const sentences = getSentences(transcript);

  // ── 1. Filler words ──
  if (metrics.fillerCount > 0) {
    const worstFiller = metrics.fillerPositions.reduce<Record<string, number>>((acc, p) => {
      acc[p.word] = (acc[p.word] ?? 0) + 1;
      return acc;
    }, {});
    const top = Object.entries(worstFiller).sort((a, b) => b[1] - a[1])[0];
    const severity: TipSeverity = metrics.fillerCount >= 5 ? 'critical' : 'improvement';

    tips.push({
      severity,
      label: 'Filler Words',
      detail: `You used '${top[0]}' ${top[1]} time${top[1] > 1 ? 's' : ''} (${metrics.fillerCount} total fillers).`,
      fix: 'Replace fillers with a brief pause. Silence sounds more confident than "um" or "like".',
      priority: metrics.fillerCount >= 5 ? 1 : 3,
    });
  }

  // ── 2. Hedging language ──
  const hedges = detectHedging(transcript);
  const totalHedges = hedges.reduce((sum, h) => sum + h.count, 0);
  if (totalHedges >= 2) {
    const top = hedges[0];
    tips.push({
      severity: totalHedges >= 5 ? 'critical' : 'improvement',
      label: 'Hedging Language',
      detail: `You used '${top.phrase}' ${top.count} time${top.count > 1 ? 's' : ''} (${totalHedges} hedges total).`,
      fix: 'Replace with direct statements. Instead of "I think we should", say "We should".',
      priority: totalHedges >= 5 ? 1 : 4,
    });
  }

  // ── 3. Rambling (30+ word sentences) ──
  const longSentences = sentences.filter((s) => wordCount(s) >= 30);
  if (longSentences.length > 0) {
    tips.push({
      severity: longSentences.length >= 3 ? 'critical' : 'improvement',
      label: 'Rambling',
      detail: `${longSentences.length} sentence${longSentences.length > 1 ? 's' : ''} exceeded 30 words.`,
      fix: 'Break long thoughts into shorter, punchy statements. One idea per sentence.',
      priority: 2,
    });
  }

  // ── 4. Choppy delivery (many sentences under 5 words) ──
  const shortSentences = sentences.filter((s) => wordCount(s) < 5);
  if (sentences.length >= 3 && shortSentences.length >= sentences.length * 0.4) {
    tips.push({
      severity: 'improvement',
      label: 'Choppy Delivery',
      detail: `${shortSentences.length} of ${sentences.length} sentences were very short (under 5 words).`,
      fix: 'Combine short fragments into fuller thoughts. Aim for 10-20 words per sentence.',
      priority: 5,
    });
  }

  // ── 5. Weak opening ──
  if (sentences.length > 0 && wordCount(sentences[0]) < 5) {
    tips.push({
      severity: 'improvement',
      label: 'Weak Opening',
      detail: `Your first sentence was only ${wordCount(sentences[0])} words.`,
      fix: 'Start with a strong declarative statement to grab attention immediately.',
      priority: 3,
    });
  }

  // ── 6. Weak close ──
  if (sentences.length >= 3) {
    const lastLen = wordCount(sentences[sentences.length - 1]);
    const avgLen = sentences.reduce((sum, s) => sum + wordCount(s), 0) / sentences.length;
    if (lastLen < avgLen * 0.4 && lastLen < 6) {
      tips.push({
        severity: 'improvement',
        label: 'Trailing Off',
        detail: `Your last sentence was only ${lastLen} words — much shorter than your average.`,
        fix: 'End with a clear, confident closing statement. Summarise your key point.',
        priority: 4,
      });
    }
  }

  // ── 7. Repetition ──
  const repeats = detectRepetition(transcript);
  if (repeats.length > 0) {
    const top = repeats[0];
    tips.push({
      severity: top.count >= 6 ? 'critical' : 'improvement',
      label: 'Repetition',
      detail: `You said '${top.word}' ${top.count} times.`,
      fix: `Vary your word choice. Use synonyms or restructure sentences to avoid repeating '${top.word}'.`,
      priority: top.count >= 6 ? 2 : 5,
    });
  }

  // ── 8. Low vocabulary variety ──
  const variety = calcVocabVariety(transcript);
  if (variety > 0 && variety < 0.6 && repeats.length === 0) {
    tips.push({
      severity: 'improvement',
      label: 'Limited Vocabulary',
      detail: `Your vocabulary variety is ${Math.round(variety * 100)}% (below 60% is repetitive).`,
      fix: 'Expand your word choices. Read more to naturally increase vocabulary range.',
      priority: 6,
    });
  }

  // ── 9. Pace feedback ──
  if (metrics.wordsPerMinute > 190) {
    tips.push({
      severity: metrics.wordsPerMinute > 220 ? 'critical' : 'improvement',
      label: 'Speaking Too Fast',
      detail: `${metrics.wordsPerMinute} WPM — ideal is 130-160.`,
      fix: 'Slow down. Pause between sentences. Your audience needs time to absorb your points.',
      priority: metrics.wordsPerMinute > 220 ? 1 : 3,
    });
  } else if (metrics.wordsPerMinute < 100) {
    tips.push({
      severity: 'improvement',
      label: 'Speaking Too Slowly',
      detail: `${metrics.wordsPerMinute} WPM — ideal is 130-160.`,
      fix: 'Increase energy and pace slightly. Practice reading aloud to build natural speed.',
      priority: 4,
    });
  }

  // ── Positive feedback (always include at least 1) ──
  const positives: SpeechTip[] = [];

  if (metrics.fillerCount === 0) {
    positives.push({
      severity: 'positive',
      label: 'Zero Fillers',
      detail: 'No filler words detected.',
      fix: 'Excellent discipline! Keep speaking with intention.',
      priority: 10,
    });
  }

  if (metrics.wordsPerMinute >= 130 && metrics.wordsPerMinute <= 160) {
    positives.push({
      severity: 'positive',
      label: 'Ideal Pace',
      detail: `${metrics.wordsPerMinute} WPM is in the ideal range (130-160).`,
      fix: 'Your pacing sounds natural and confident. Maintain this rhythm.',
      priority: 10,
    });
  }

  if (variety >= 0.7) {
    positives.push({
      severity: 'positive',
      label: 'Strong Vocabulary',
      detail: `${Math.round(variety * 100)}% vocabulary variety — well above average.`,
      fix: 'Your word choice is diverse and engaging. Great range.',
      priority: 10,
    });
  }

  if (sentences.length >= 3 && longSentences.length === 0 && shortSentences.length < sentences.length * 0.3) {
    positives.push({
      severity: 'positive',
      label: 'Good Sentence Structure',
      detail: 'Your sentences are well-balanced in length.',
      fix: 'Clear, structured delivery. Listeners can follow you easily.',
      priority: 10,
    });
  }

  // Guarantee at least 1 positive
  if (positives.length === 0) {
    positives.push({
      severity: 'positive',
      label: 'Keep Going',
      detail: `You spoke ${metrics.totalWords} words in this session.`,
      fix: 'Every practice session builds confidence. You\'re making progress.',
      priority: 10,
    });
  }

  // Sort negatives by priority (lower = worse = first), then append 1 positive
  const negatives = tips.sort((a, b) => a.priority - b.priority);
  const combined = [...negatives.slice(0, 4), positives[0]];

  // Cap at 5 tips total
  return combined.slice(0, 5);
}
