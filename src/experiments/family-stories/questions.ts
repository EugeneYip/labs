/** Interview questions, written for Family Stories and grouped by topic. */
export const TOPICS: { id: string; label: string; questions: string[] }[] = [
  {
    id: 'early',
    label: 'Early years',
    questions: [
      'Where were you born, and what was the place like?',
      'What is your earliest memory?',
      'What was the house you grew up in like? Walk me through it.',
      'Who were your best friends as a child, and what did you get up to?',
      'What games did you play, and where?',
      'What were your parents like when you were small?',
      'Is there a smell, a song, or a food that takes you straight back to childhood?',
      'What did you get in trouble for?',
    ],
  },
  {
    id: 'growing',
    label: 'Growing up',
    questions: [
      'What was school like for you?',
      'Which teacher do you remember most, and why?',
      'What did you want to be when you grew up?',
      'What was your first job, and what did it pay?',
      'What did you do for fun as a teenager?',
      'What music were you listening to back then?',
      'When did you first feel grown up?',
      'What was something you were proud of at that age?',
    ],
  },
  {
    id: 'work',
    label: 'Work',
    questions: [
      'How did you end up doing the work you did?',
      'What was a typical working day like?',
      'Who taught you the most at work?',
      'What was the hardest job you ever had?',
      'What are you proudest of from your working life?',
      'Was there a time when things went badly wrong? How did you get through it?',
      'How was work different then from how it is now?',
      'If you could have done any other job, what would it have been?',
    ],
  },
  {
    id: 'family',
    label: 'Love and family',
    questions: [
      'How did you meet your partner? What was your first impression?',
      'What was your wedding, or your first home together, like?',
      'What do you remember about becoming a parent?',
      'What was a hard time for the family, and how did you get through it?',
      'What were family holidays like?',
      'Who in the family do you take after, and how?',
      'What family story always gets told, and is it true?',
      'What do you hope the family remembers about you?',
    ],
  },
  {
    id: 'places',
    label: 'Places and times',
    questions: [
      'What big events do you remember living through?',
      'Where have you lived, and which place felt most like home?',
      'What is the biggest change you have seen in your lifetime?',
      'What did everyday things cost when you were young?',
      'How did you get around, and what was your first car or bike?',
      'What place will you never forget?',
      'What was your neighborhood like, and who lived there?',
      'Is there news you remember exactly where you were when you heard it?',
    ],
  },
  {
    id: 'traditions',
    label: 'Traditions and recipes',
    questions: [
      'What dishes remind you of home, and how are they made?',
      'What traditions did your family keep?',
      'What did a celebration look like when you were young?',
      'Is there a recipe or a trick that only you know?',
      'What songs did your family sing together?',
      'What sayings did your parents or grandparents use?',
      'Which objects in your home have a story behind them?',
      'Which traditions would you like the family to carry on?',
    ],
  },
  {
    id: 'looking-back',
    label: 'Looking back',
    questions: [
      'What are you most grateful for?',
      'What is the best advice you ever got, and who gave it to you?',
      'What do you know now that you wish you had known at twenty?',
      'What was a turning point in your life?',
      'What has made you laugh the hardest?',
      'Who had the biggest influence on you?',
      'Is there anything you would do differently?',
      'What does a good life mean to you?',
    ],
  },
  {
    id: 'closing',
    label: 'To finish',
    questions: [
      'What makes you happy these days?',
      'What would you like to say to your grandchildren, or to family not born yet?',
      'How would you like to be remembered?',
      'Is there anything I haven’t asked that you would like to talk about?',
    ],
  },
]

/** Gentle ways to keep a story going, shown under each question. */
export const FOLLOW_UPS = ['Tell me more about that.', 'What happened next?', 'How did that feel?', 'Who else was there?', 'What did it look like?', 'Why do you think that stuck with you?']

/** The questions for an interview: the chosen topics in order, then any of your own. */
export function questionList(topics: readonly string[], own: readonly string[]): { text: string; topic: string }[] {
  const chosen = TOPICS.filter((t) => topics.includes(t.id)).flatMap((t) => t.questions.map((text) => ({ text, topic: t.label })))
  return [...chosen, ...own.map((text) => ({ text, topic: 'Your questions' }))]
}
