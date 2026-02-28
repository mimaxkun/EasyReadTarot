/**
 * EasyReadTarot — Interpretation Engine
 *
 * Generates contextual readings by combining:
 *   1. Rank keyword (primary meaning)
 *   2. Suit flavor (context lens)
 *   3. Position context (past / present / future)
 *
 * Rule: Number > Suit — rank carries the meaning, suit adds flavor.
 * Court cards = energies, not literal people.
 */

const POSITION_INTROS = {
  Past: [
    'Looking back, this card suggests',
    'In your recent past,',
    'What brought you here:'
  ],
  Present: [
    'Right now, you are experiencing',
    'At this moment,',
    'The heart of your current situation:'
  ],
  Future: [
    'Looking ahead,',
    'What is unfolding before you:',
    'The path forward suggests'
  ]
};

/**
 * Templates for combining rank meaning with suit flavor.
 * Each returns a string fragment (no leading period).
 */
const MINOR_TEMPLATES = {
  swords: {
    ace: 'a new clarity is emerging — a fresh idea or decision calls for your attention',
    2: 'a mental crossroads awaits — weigh your options carefully before choosing',
    3: 'your mind is exploring new territory — ideas are forming and developing',
    4: 'a period of mental rest or stagnation — step back to regain clarity',
    5: 'a challenge to your thinking — old beliefs may need to shift',
    6: 'you are working through a difficult thought process — perseverance brings clarity',
    7: 'your convictions are being tested — trust what experience has taught you',
    8: 'mental progress is accelerating — breakthroughs in understanding lie ahead',
    9: 'difficult truths surface — honest reflection, though hard, brings wisdom',
    10: 'a mental cycle completes — release old thought patterns to make room for new ones'
  },
  cups: {
    ace: 'a new emotional beginning — an offering of love, connection, or creative feeling',
    2: 'a choice of the heart — relationships or feelings pull in two directions',
    3: 'emotional creativity blooms — celebrate, connect, and explore what moves you',
    4: 'emotional routine may feel stale — look for fresh sources of fulfillment',
    5: 'an emotional shift or loss — allow yourself to grieve, then adjust',
    6: 'you are getting through an emotional challenge — resilience carries you forward',
    7: 'emotional confidence grows — trust your feelings, they have been tested',
    8: 'emotional growth moves you forward — deeper connections and understanding await',
    9: 'emotional fulfillment is near — savor the warmth of what you have built',
    10: 'an emotional cycle comes full circle — deep contentment or readiness for a new chapter'
  },
  wands: {
    ace: 'a spark of inspiration ignites — a new passion, project, or drive is born',
    2: 'a crossroads of passion — choose which fire to follow',
    3: 'creative energy is expanding — explore, build, and let your vision take shape',
    4: 'a stable foundation for your passions — enjoy the structure, but watch for restlessness',
    5: 'your drive is being challenged — adapt and channel disruption into growth',
    6: 'you are pushing through a creative or spiritual challenge — keep the flame alive',
    7: 'your confidence in your vision is being tested — stand firm in what inspires you',
    8: 'momentum is building — your passion propels you to the next level',
    9: 'you are nearing the peak of an inspired journey — the summit is in sight',
    10: 'a passionate chapter closes — release and prepare for a new spark'
  },
  pentacles: {
    ace: 'a new opportunity in the material world — a career move, financial offer, or tangible start',
    2: 'a practical decision — juggle priorities and find your balance',
    3: 'building something real — skills develop and craftsmanship takes shape',
    4: 'material stability and structure — security is yours, but don\'t let it become rigidity',
    5: 'a material setback or shift — adjust your approach to career, health, or finances',
    6: 'you are working through a practical challenge — generosity and effort pay off',
    7: 'your practical skills are being tested — patience and persistence will prove their worth',
    8: 'career or financial progress — dedication is moving you to the next level',
    9: 'material attainment and comfort — enjoy the rewards of your effort',
    10: 'a material cycle completes — legacy, inheritance, or the fruits of long labor'
  }
};

const COURT_TEMPLATES = {
  swords: {
    page: 'a fresh mental approach is emerging — be curious, ask questions, learn from new perspectives',
    knight: 'decisive mental action is called for — move swiftly on your ideas and communicate boldly',
    queen: 'draw on intellectual patience and perception — see through complexity with calm clarity',
    king: 'mental mastery and authority guide you — apply your knowledge with fairness and precision'
  },
  cups: {
    page: 'a new emotional path opens — approach feelings with openness and a beginner\'s heart',
    knight: 'emotional initiative — follow your heart and take action on what you feel',
    queen: 'emotional wisdom and patience — trust your intuition and nurture those around you',
    king: 'emotional expertise — lead with compassion and the depth of your experience'
  },
  wands: {
    page: 'a new direction for your passion — explore fresh inspiration with beginner\'s enthusiasm',
    knight: 'bold, passionate action — charge ahead with your vision and creative energy',
    queen: 'patient stewardship of your passions — guide your fire with wisdom and warmth',
    king: 'visionary leadership — your experience and drive inspire confidence in others'
  },
  pentacles: {
    page: 'a new practical path — study, learn a skill, or start small toward something tangible',
    knight: 'steady, methodical action — put in the work and progress will follow',
    queen: 'practical wisdom and abundance — nurture your resources and those who depend on you',
    king: 'material expertise and authority — your experience builds lasting security'
  }
};

const MAJOR_TEMPLATES = {
  0:  'the energy of freedom and fresh starts surrounds you — leap with trust, even without a plan',
  1:  'you have all the tools you need — awareness and focus turn potential into action',
  2:  'something remains hidden or not yet understood — trust the mystery and look beneath the surface',
  3:  'creative energy flows abundantly — nurture what is growing around you',
  4:  'structure and leadership are called for — take charge and build with authority',
  5:  'seek guidance or a deeper tradition — mentorship and shared wisdom light the way',
  6:  'attraction and meaningful connection draw you — align your choices with what your heart values',
  7:  'determination and willpower carry you forward — victory comes through focused drive',
  8:  'consequences of past actions are arriving — fairness and honesty guide the outcome',
  9:  'turn inward — solitude and self-reflection reveal what noise obscures',
  10: 'forces beyond your control are turning — trust the cycle and adapt to what comes',
  11: 'inner strength and gentle endurance sustain you — patience and courage over brute force',
  12: 'a shift in perspective changes everything — surrender to the paradox and see anew',
  13: 'deep transformation is at work — release what no longer serves you to make way for renewal',
  14: 'blend opposing forces — inspiration comes from finding balance and moderation',
  15: 'beware of illusions or attachments — what feels binding may be a construct you can release',
  16: 'sudden disruption clears away false structures — from the rubble, rebuild with truth',
  17: 'a guiding star appears — hope and direction emerge after difficulty',
  18: 'hidden influences are at play — trust your instincts through uncertainty and illusion',
  19: 'warmth, growth, and clarity surround you — nurturing energy brings things into the light',
  20: 'a powerful awakening is calling — hear the call and rise to your higher purpose',
  21: 'a cycle reaches its fullest expression — wholeness, integration, and fulfillment are here'
};

/** Pick a random item from an array. */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate an interpretation string for a single drawn card in context.
 * @param {{ card: object, position: object }} drawn
 * @returns {{ intro: string, body: string }}
 */
function interpretCard(drawn) {
  const { card, position } = drawn;
  const intro = pick(POSITION_INTROS[position.name]);

  let body;
  if (card.type === 'major') {
    body = MAJOR_TEMPLATES[card.id.replace('major-', '')] ||
           MAJOR_TEMPLATES[parseInt(card.id.replace('major-', ''), 10)];
  } else if (card.type === 'court') {
    body = COURT_TEMPLATES[card.suit]?.[card.rank] || card.meaning;
  } else {
    body = MINOR_TEMPLATES[card.suit]?.[card.rank] || card.meaning;
  }

  return { intro, body };
}

/**
 * Generate a brief narrative summary tying all three cards together.
 * @param {Array<{ card: object, position: object }>} spread
 * @returns {string}
 */
function generateSummary(spread) {
  const [past, present, future] = spread;

  const pastName = past.card.name;
  const presentName = present.card.name;
  const futureName = future.card.name;

  const summaries = [
    `Your reading traces a path from <strong>${pastName}</strong> through <strong>${presentName}</strong> toward <strong>${futureName}</strong>. The past has shaped your foundation, the present holds the energy you are working with, and the future shows the direction this energy is moving.`,
    `From <strong>${pastName}</strong> to <strong>${presentName}</strong> to <strong>${futureName}</strong> — your cards paint a clear arc. Let what came before inform, not define, where you are headed.`,
    `The thread connecting your cards runs from <strong>${pastName}</strong>, through the current energy of <strong>${presentName}</strong>, opening into <strong>${futureName}</strong>. Trust the progression and move with it.`
  ];

  return pick(summaries);
}
