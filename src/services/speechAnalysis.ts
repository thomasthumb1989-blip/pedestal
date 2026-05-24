const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'so', 'basically',
  'actually', 'right', 'er', 'ah',
];

export type SpeechMetrics = {
  clarityScore: number;
  wordsPerMinute: number;
  totalWords: number;
  fillerCount: number;
  fillerPercentage: number;
  fillerPositions: { word: string; index: number }[];
};

export function analyzeSpeech(transcript: string, durationSeconds: number): SpeechMetrics {
  const words = transcript.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const durationMinutes = durationSeconds / 60;
  const wordsPerMinute = durationMinutes > 0 ? Math.round(totalWords / durationMinutes) : 0;

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
  const clarityScore = Math.max(0, Math.min(100, Math.round(100 - fillerPercentage * 2)));

  return {
    clarityScore,
    wordsPerMinute,
    totalWords,
    fillerCount,
    fillerPercentage: Math.round(fillerPercentage * 10) / 10,
    fillerPositions: fillerPositions.sort((a, b) => a.index - b.index),
  };
}
