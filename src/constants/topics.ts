export type TopicCategory = 'Work' | 'Social' | 'Opinion' | 'Storytelling' | 'Interview';

export type Topic = {
  id: string;
  category: TopicCategory;
  prompt: string;
};

export const TOPICS: Topic[] = [
  // ── Work (10) ───────────────────────────────────
  { id: 'w1', category: 'Work', prompt: 'Describe your ideal work environment and why it helps you perform best.' },
  { id: 'w2', category: 'Work', prompt: 'Explain a project you are proud of and what made it successful.' },
  { id: 'w3', category: 'Work', prompt: 'How would you handle a disagreement with a colleague about the direction of a project?' },
  { id: 'w4', category: 'Work', prompt: 'Pitch a new idea to your team that would improve how you work together.' },
  { id: 'w5', category: 'Work', prompt: 'Describe the most valuable lesson you have learned in your career so far.' },
  { id: 'w6', category: 'Work', prompt: 'Explain a complex process from your job to someone with no background in your field.' },
  { id: 'w7', category: 'Work', prompt: 'What skill do you think every professional should develop and why?' },
  { id: 'w8', category: 'Work', prompt: 'Describe how you manage your time when you have too many tasks and not enough hours.' },
  { id: 'w9', category: 'Work', prompt: 'Give a two-minute update on a project as if you were presenting to your manager.' },
  { id: 'w10', category: 'Work', prompt: 'What would you change about your industry if you had the power to change one thing?' },

  // ── Social (10) ─────────────────────────────────
  { id: 's1', category: 'Social', prompt: 'Convince someone to visit your hometown or city. What makes it special?' },
  { id: 's2', category: 'Social', prompt: 'Describe your favourite meal and explain why it means so much to you.' },
  { id: 's3', category: 'Social', prompt: 'If you could have dinner with anyone in history, who would it be and what would you ask?' },
  { id: 's4', category: 'Social', prompt: 'Describe your perfect weekend from morning to night.' },
  { id: 's5', category: 'Social', prompt: 'Recommend a book, film, or show and explain why everyone should experience it.' },
  { id: 's6', category: 'Social', prompt: 'Describe a tradition from your culture or family that you value.' },
  { id: 's7', category: 'Social', prompt: 'What hobby would you recommend to someone who is feeling stressed and why?' },
  { id: 's8', category: 'Social', prompt: 'Describe the best trip you have ever taken and what made it unforgettable.' },
  { id: 's9', category: 'Social', prompt: 'If you could live anywhere in the world for one year, where would you go and why?' },
  { id: 's10', category: 'Social', prompt: 'Describe someone who has had a big impact on your life and explain how.' },

  // ── Opinion (10) ────────────────────────────────
  { id: 'o1', category: 'Opinion', prompt: 'Should social media have age restrictions? Argue your position.' },
  { id: 'o2', category: 'Opinion', prompt: 'Is it better to be a specialist in one thing or a generalist who knows a bit of everything?' },
  { id: 'o3', category: 'Opinion', prompt: 'Do you think remote work is better than working in an office? Defend your view.' },
  { id: 'o4', category: 'Opinion', prompt: 'Should university education be free for everyone? Make your case.' },
  { id: 'o5', category: 'Opinion', prompt: 'Is failure necessary for success? Explain why or why not.' },
  { id: 'o6', category: 'Opinion', prompt: 'Do you think technology makes us more connected or more isolated?' },
  { id: 'o7', category: 'Opinion', prompt: 'Should people prioritise experiences over material possessions? Argue your view.' },
  { id: 'o8', category: 'Opinion', prompt: 'Is it more important to be kind or to be honest? Defend your answer.' },
  { id: 'o9', category: 'Opinion', prompt: 'Do you think artificial intelligence will create more jobs than it destroys?' },
  { id: 'o10', category: 'Opinion', prompt: 'Should voting be compulsory? Make a case for or against.' },

  // ── Storytelling (10) ───────────────────────────
  { id: 'st1', category: 'Storytelling', prompt: 'Tell a story about a time you tried something completely new and what happened.' },
  { id: 'st2', category: 'Storytelling', prompt: 'Describe a moment when you were completely out of your comfort zone.' },
  { id: 'st3', category: 'Storytelling', prompt: 'Tell the story of the funniest thing that has ever happened to you.' },
  { id: 'st4', category: 'Storytelling', prompt: 'Describe a time you helped someone and it changed how you see the world.' },
  { id: 'st5', category: 'Storytelling', prompt: 'Tell a story about a time things went completely wrong but turned out fine.' },
  { id: 'st6', category: 'Storytelling', prompt: 'Describe the most challenging day you have ever had and how you got through it.' },
  { id: 'st7', category: 'Storytelling', prompt: 'Tell a story about a stranger who made a lasting impression on you.' },
  { id: 'st8', category: 'Storytelling', prompt: 'Describe a moment when you realised something important about yourself.' },
  { id: 'st9', category: 'Storytelling', prompt: 'Tell the story of your biggest adventure, big or small.' },
  { id: 'st10', category: 'Storytelling', prompt: 'Describe a time when you had to make a difficult decision under pressure.' },

  // ── Interview (10) ──────────────────────────────
  { id: 'i1', category: 'Interview', prompt: 'Tell me about yourself. Give a confident, structured answer in sixty seconds.' },
  { id: 'i2', category: 'Interview', prompt: 'What is your greatest strength and how has it helped you achieve results?' },
  { id: 'i3', category: 'Interview', prompt: 'Describe a time you showed leadership, even if you were not in a leadership role.' },
  { id: 'i4', category: 'Interview', prompt: 'Why should we hire you? Give three compelling reasons.' },
  { id: 'i5', category: 'Interview', prompt: 'Describe a time you received critical feedback and how you responded to it.' },
  { id: 'i6', category: 'Interview', prompt: 'Where do you see yourself in five years? Be specific and confident.' },
  { id: 'i7', category: 'Interview', prompt: 'Tell me about a time you failed at something and what you learned from it.' },
  { id: 'i8', category: 'Interview', prompt: 'What motivates you to do your best work? Give a real example.' },
  { id: 'i9', category: 'Interview', prompt: 'Describe a situation where you had to work with someone difficult. How did you handle it?' },
  { id: 'i10', category: 'Interview', prompt: 'What questions would you ask if you were interviewing your interviewer?' },
];

export function getRandomTopic(excludeId?: string): Topic {
  const available = excludeId ? TOPICS.filter((t) => t.id !== excludeId) : TOPICS;
  return available[Math.floor(Math.random() * available.length)];
}

export function getTopicsByCategory(category: TopicCategory): Topic[] {
  return TOPICS.filter((t) => t.category === category);
}
