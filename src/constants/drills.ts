export type DrillDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type DrillCategory = 'fillers' | 'pace' | 'clarity' | 'openings' | 'pauses';
export type DrillMetric = 'fillerPercentage' | 'wordsPerMinute' | 'clarityScore';

export type Drill = {
  id: string;
  category: DrillCategory;
  title: string;
  tip: string;
  prompt: string;
  difficulty: DrillDifficulty;
  targetMetric: DrillMetric;
  targetValue: number;
  targetDirection: 'below' | 'above' | 'between';
  targetMax?: number;
};

export type DrillCategoryInfo = {
  id: DrillCategory;
  title: string;
  description: string;
  icon: string;
  drillCount: number;
};

export const DRILL_CATEGORIES: DrillCategoryInfo[] = [
  {
    id: 'fillers',
    title: 'Eliminate Filler Words',
    description: 'Replace um and uh with confident pauses',
    icon: 'close-circle-outline',
    drillCount: 3,
  },
  {
    id: 'pace',
    title: 'Control Your Pace',
    description: 'Hit the sweet spot of 130-160 words per minute',
    icon: 'speedometer-outline',
    drillCount: 3,
  },
  {
    id: 'clarity',
    title: 'Speak with Clarity',
    description: 'Sharpen your articulation and diction',
    icon: 'diamond-outline',
    drillCount: 3,
  },
  {
    id: 'openings',
    title: 'Confident Openings',
    description: 'Start strong with powerful first lines',
    icon: 'flash-outline',
    drillCount: 3,
  },
  {
    id: 'pauses',
    title: 'Pause Power',
    description: 'Use strategic silence to command attention',
    icon: 'pause-outline',
    drillCount: 3,
  },
];

export const DRILLS: Drill[] = [
  // ── Eliminate Filler Words ──────────────────────
  {
    id: 'fillers-1',
    category: 'fillers',
    title: 'The Pause Swap',
    tip: 'Every time you feel an "um" coming, stop and take a breath instead. Two seconds of silence sounds far more confident than any filler word.',
    prompt: 'Describe your morning routine from the moment you wake up. Include at least five steps. Focus on pausing between each step instead of using filler words.',
    difficulty: 'Beginner',
    targetMetric: 'fillerPercentage',
    targetValue: 3,
    targetDirection: 'below',
  },
  {
    id: 'fillers-2',
    category: 'fillers',
    title: 'The Story Challenge',
    tip: 'Filler words sneak in when we are thinking of what to say next. Plan your next sentence while finishing the current one.',
    prompt: 'Tell a story about the best meal you have ever had. Where were you? Who were you with? What made it special? Speak for at least thirty seconds without a single filler word.',
    difficulty: 'Intermediate',
    targetMetric: 'fillerPercentage',
    targetValue: 2,
    targetDirection: 'below',
  },
  {
    id: 'fillers-3',
    category: 'fillers',
    title: 'Pressure Cooker',
    tip: 'Under pressure, fillers multiply. This drill simulates that pressure. Embrace the silence when your mind goes blank.',
    prompt: 'You have sixty seconds to convince someone to visit your favourite city. Cover three reasons: food, culture, and one hidden gem. No filler words allowed.',
    difficulty: 'Advanced',
    targetMetric: 'fillerPercentage',
    targetValue: 1,
    targetDirection: 'below',
  },

  // ── Control Your Pace ───────────────────────────
  {
    id: 'pace-1',
    category: 'pace',
    title: 'The Metronome',
    tip: 'Ideal speaking pace is 130 to 160 words per minute. Slower sounds thoughtful. Faster sounds nervous. Find the middle.',
    prompt: 'Explain how to make a cup of tea or coffee, step by step. Speak at a steady, comfortable pace. Imagine you are teaching someone who has never done it before.',
    difficulty: 'Beginner',
    targetMetric: 'wordsPerMinute',
    targetValue: 130,
    targetDirection: 'between',
    targetMax: 160,
  },
  {
    id: 'pace-2',
    category: 'pace',
    title: 'Speed Control',
    tip: 'Vary your pace for emphasis. Slow down on important points, speed up slightly on transitions. Control is the goal.',
    prompt: 'Describe a hobby you enjoy and why it matters to you. Start slow with why you began, then build energy as you explain what excites you about it.',
    difficulty: 'Intermediate',
    targetMetric: 'wordsPerMinute',
    targetValue: 130,
    targetDirection: 'between',
    targetMax: 160,
  },
  {
    id: 'pace-3',
    category: 'pace',
    title: 'The Gear Shift',
    tip: 'Great speakers shift between slow and fast deliberately. Think of gears in a car. Each gear has a purpose.',
    prompt: 'Give a one-minute pitch for your dream business idea. Open slowly with the problem, accelerate through the solution, and slow down for the closing impact statement.',
    difficulty: 'Advanced',
    targetMetric: 'wordsPerMinute',
    targetValue: 120,
    targetDirection: 'between',
    targetMax: 170,
  },

  // ── Speak with Clarity ──────────────────────────
  {
    id: 'clarity-1',
    category: 'clarity',
    title: 'Tongue Twister Warm-Up',
    tip: 'Tongue twisters train your mouth muscles. Speak slowly first, then build speed. Clarity always beats speed.',
    prompt: 'Read this aloud three times, getting faster each time: She sells seashells by the seashore. The shells she sells are seashells for sure. Peter Piper picked a peck of pickled peppers.',
    difficulty: 'Beginner',
    targetMetric: 'clarityScore',
    targetValue: 70,
    targetDirection: 'above',
  },
  {
    id: 'clarity-2',
    category: 'clarity',
    title: 'The Enunciator',
    tip: 'Open your mouth wider than feels natural. Over-articulate each consonant. What feels exaggerated to you sounds perfectly clear to listeners.',
    prompt: 'Explain the rules of your favourite sport or game to someone who has never heard of it. Pronounce every word fully. No mumbling, no swallowing word endings.',
    difficulty: 'Intermediate',
    targetMetric: 'clarityScore',
    targetValue: 80,
    targetDirection: 'above',
  },
  {
    id: 'clarity-3',
    category: 'clarity',
    title: 'Complex Ideas Simply',
    tip: 'True clarity means making complex ideas simple. If a twelve-year-old cannot understand it, simplify further.',
    prompt: 'Explain how the internet works to a child. Use simple words, short sentences, and vivid comparisons. Make it interesting and accurate without any jargon.',
    difficulty: 'Advanced',
    targetMetric: 'clarityScore',
    targetValue: 85,
    targetDirection: 'above',
  },

  // ── Confident Openings ──────────────────────────
  {
    id: 'openings-1',
    category: 'openings',
    title: 'The Bold Statement',
    tip: 'Start with a bold claim or surprising fact. Never open with "So, today I am going to talk about..." That is the weakest opening possible.',
    prompt: 'You are giving a talk about climate change. Open with a bold, attention-grabbing first sentence. Then follow with two supporting sentences. Make your audience lean in.',
    difficulty: 'Beginner',
    targetMetric: 'clarityScore',
    targetValue: 75,
    targetDirection: 'above',
  },
  {
    id: 'openings-2',
    category: 'openings',
    title: 'The Story Hook',
    tip: 'Open with a short personal story. Humans are wired for narrative. Three sentences maximum: setting, conflict, hook.',
    prompt: 'Open a presentation about teamwork by telling a brief personal story about a time a team surprised you. Three sentences only. Make the audience want to hear more.',
    difficulty: 'Intermediate',
    targetMetric: 'clarityScore',
    targetValue: 80,
    targetDirection: 'above',
  },
  {
    id: 'openings-3',
    category: 'openings',
    title: 'The Question Open',
    tip: 'Ask a question that makes the audience think. Rhetorical questions are powerful but only if they are genuinely thought-provoking.',
    prompt: 'You are speaking to new graduates about career choices. Open with a powerful question, pause for two seconds, then deliver a surprising answer. Make it memorable.',
    difficulty: 'Advanced',
    targetMetric: 'clarityScore',
    targetValue: 85,
    targetDirection: 'above',
  },

  // ── Pause Power ─────────────────────────────────
  {
    id: 'pauses-1',
    category: 'pauses',
    title: 'The Three-Second Rule',
    tip: 'After every important point, pause for three full seconds. It feels eternal to you but powerful to your audience. Count in your head: one, two, three.',
    prompt: 'Share three things you are grateful for today. After each one, pause for a full three seconds before moving to the next. Let the silence do the work.',
    difficulty: 'Beginner',
    targetMetric: 'wordsPerMinute',
    targetValue: 100,
    targetDirection: 'between',
    targetMax: 140,
  },
  {
    id: 'pauses-2',
    category: 'pauses',
    title: 'Dramatic Pause',
    tip: 'Place a long pause before your most important word or phrase. The silence creates anticipation. The audience leans in.',
    prompt: 'Tell a short story about overcoming a challenge. Use at least three dramatic pauses before key moments. Let silence build tension before each reveal.',
    difficulty: 'Intermediate',
    targetMetric: 'wordsPerMinute',
    targetValue: 90,
    targetDirection: 'between',
    targetMax: 130,
  },
  {
    id: 'pauses-3',
    category: 'pauses',
    title: 'Silence is Power',
    tip: 'The most powerful speakers are comfortable with long silences. Your goal is zero filler words and at least four deliberate pauses in sixty seconds.',
    prompt: 'Deliver a one-minute motivational message about never giving up. Use at least four pauses of two seconds or more. Fill zero pauses with filler words. Own the silence.',
    difficulty: 'Advanced',
    targetMetric: 'fillerPercentage',
    targetValue: 1,
    targetDirection: 'below',
  },
];

export function getDrillsByCategory(category: DrillCategory): Drill[] {
  return DRILLS.filter((d) => d.category === category);
}

export function getDrillById(id: string): Drill | undefined {
  return DRILLS.find((d) => d.id === id);
}
