/**
 * EasyReadTarot — Interpretation Engine v2
 *
 * Built on Vince Petitia's keyword methodology (Bare Bones Tarot / Essential Tarot).
 *
 * Core principles:
 *   1. Number > Suit — rank carries the meaning, suit adds flavor
 *   2. Positional Influence — same card shifts meaning based on spread position
 *   3. Keywords are starting points — they drift into the reader's own words
 *   4. Court cards = energies/qualities, not literal people
 *   5. No reverse meanings — cards read upright only
 *   6. The querent brings the suit through their question
 *
 * Architecture:
 *   interpretCard(card, position, questionContext?)
 *     → rank keyword  (from RANK_KEYWORDS / COURT_KEYWORDS / MAJOR_KEYWORDS)
 *     → suit flavor    (from SUIT_FLAVORS)
 *     → positional shift (from CELTIC_CROSS_POSITIONS)
 *     → optional question context
 *     → returns { intro, body, alternative, actionable }
 */

// ─────────────────────────────────────────────
// 1. RANK KEYWORDS  (Minor Arcana Ace–10)
//    Core keyword + expansions for drift
// ─────────────────────────────────────────────

const RANK_KEYWORDS = {
  ace: {
    core: 'new beginning',
    expansions: ['fresh start', 'new idea', 'offer', 'opportunity', 'new direction', 'something new arriving']
  },
  2: {
    core: 'choice',
    expansions: ['decision', 'crossroads', 'duality', 'weighing options', 'being on the fence', 'selecting a path']
  },
  3: {
    core: 'creativity',
    expansions: ['creating', 'developing', 'exploration', 'getting creative', 'building something', 'expression']
  },
  4: {
    core: 'stability',
    expansions: ['routine', 'structure', 'predictable', 'established', 'solid ground', 'sometimes stagnant']
  },
  5: {
    core: 'change',
    expansions: ['disruption', 'challenge', 'transformation', 'adjustment needed', 'shift', 'winds of change']
  },
  6: {
    core: 'overcoming obstacles',
    expansions: ['perseverance', 'getting through it', 'adaptation', 'resilience', 'pushing past challenges']
  },
  7: {
    core: 'confidence',
    expansions: ['experience gained', 'belief in yourself', 'tested and strengthened', 'conviction', 'trust in the process']
  },
  8: {
    core: 'advancement',
    expansions: ['progress', 'moving forward', 'next level', 'development', 'momentum', 'breakthrough']
  },
  9: {
    core: 'attainment',
    expansions: ['achievement', 'reaching the peak', 'fulfillment', 'difficult truths realized', 'awareness', 'near completion']
  },
  10: {
    core: 'completion',
    expansions: ['end of cycle', 'closure', 'transition', 'graduation', 'retirement', 'ready for new beginning']
  }
};

// ─────────────────────────────────────────────
// 2. COURT CARD KEYWORDS
//    Energies/qualities, not people
// ─────────────────────────────────────────────

const COURT_KEYWORDS = {
  page: {
    core: 'new path',
    expansions: ['rookie energy', 'new situation', 'learning', 'fresh direction', 'feeling your way', 'beginner\'s mind']
  },
  knight: {
    core: 'action',
    expansions: ['taking initiative', 'movement', 'service', 'getting things done', 'charging ahead', 'bold steps']
  },
  queen: {
    core: 'patience and understanding',
    expansions: ['wisdom', 'influence', 'waiting for the right moment', 'comprehension', 'nurturing', 'perception']
  },
  king: {
    core: 'knowledge',
    expansions: ['information', 'expertise', 'authority', 'learned experience', 'leadership', 'mastery of the subject']
  }
};

// ─────────────────────────────────────────────
// 3. SUIT FLAVORS
//    Four functions of consciousness — context, not meaning
// ─────────────────────────────────────────────

const SUIT_FLAVORS = {
  swords: {
    domain: 'thought',
    adjective: 'mental',
    description: 'thinking, logic, decisions, mental processes',
    examples: ['ideas', 'decisions', 'clarity', 'analysis', 'communication', 'beliefs'],
    framings: [
      'in the realm of your thoughts and decisions',
      'concerning your thinking and mental clarity',
      'in how you process and analyze this situation'
    ]
  },
  cups: {
    domain: 'emotions',
    adjective: 'emotional',
    description: 'feelings, heart matters, relationships, compassion',
    examples: ['feelings', 'relationships', 'love', 'connection', 'heart', 'intuition'],
    framings: [
      'in the realm of your emotions and relationships',
      'concerning matters of the heart',
      'in how you feel about this situation'
    ]
  },
  wands: {
    domain: 'spirit',
    adjective: 'passionate',
    description: 'passion, soul, inspiration, drive, what moves you',
    examples: ['passion', 'drive', 'inspiration', 'creativity', 'ambition', 'purpose'],
    framings: [
      'in the realm of your passions and inspirations',
      'concerning what drives and moves you',
      'in terms of your spirit and creative fire'
    ]
  },
  pentacles: {
    domain: 'physical world',
    adjective: 'practical',
    description: 'material matters, career, money, health, tangible reality',
    examples: ['career', 'finances', 'health', 'home', 'material security', 'practical matters'],
    framings: [
      'in the material and practical aspects of your life',
      'concerning career, finances, or tangible outcomes',
      'in the real-world, practical side of this situation'
    ]
  }
};

// ─────────────────────────────────────────────
// 4. MAJOR ARCANA KEYWORDS
//    Same drift structure as minors
// ─────────────────────────────────────────────

const MAJOR_KEYWORDS = {
  0:  { name: 'The Fool',            core: 'carefree',       expansions: ['believing', 'naive', 'trust', 'spontaneous', 'unpredictable', 'leap of faith', 'new beginnings'] },
  1:  { name: 'The Magician',        core: 'awareness',      expansions: ['articulate', 'mastery', 'focused', 'all tools available', 'influence', 'perfection', 'resourceful'] },
  2:  { name: 'The High Priestess',  core: 'mystery',        expansions: ['hidden knowledge', 'subconscious', 'secretive', 'unknown', 'look beneath the surface', 'intuition'] },
  3:  { name: 'The Empress',         core: 'creativity',     expansions: ['nurturing', 'abundance', 'growth', 'mother energy', 'fertility', 'flourishing'] },
  4:  { name: 'The Emperor',         core: 'leadership',     expansions: ['builder', 'manifesting', 'structure', 'authority', 'take charge', 'establish order'] },
  5:  { name: 'The Hierophant',      core: 'guidance',       expansions: ['conformity', 'tradition', 'teaching', 'orthodoxy', 'mentorship', 'shared wisdom'] },
  6:  { name: 'The Lovers',          core: 'attraction',     expansions: ['duality', 'choice', 'magnetism', 'partnership', 'passion', 'alignment of values'] },
  7:  { name: 'The Chariot',         core: 'victory',        expansions: ['triumph', 'control', 'finalization', 'confidence', 'willpower', 'focused drive'] },
  8:  { name: 'Justice',             core: 'consequences',   expansions: ['balance', 'truth', 'accountability', 'fair results', 'cause and effect', 'honesty'] },
  9:  { name: 'The Hermit',          core: 'self-reflection', expansions: ['withdrawal', 'soul searching', 'introspection', 'solitude', 'inner guidance', 'contemplation'] },
  10: { name: 'Wheel of Fortune',    core: 'destiny',        expansions: ['evolution', 'timing', 'karma', 'bigger forces', 'fate', 'cycles turning'] },
  11: { name: 'Strength',            core: 'endurance',      expansions: ['inner strength', 'perseverance', 'willpower', 'sustained effort', 'patience over force', 'gentle power'] },
  12: { name: 'The Hanged Man',      core: 'paradox',        expansions: ['sacrifice', 'unorthodox view', 'limbo', 'new perspective', 'surrender', 'seeing differently'] },
  13: { name: 'Death',               core: 'transformation', expansions: ['transition', 'cleansing', 'harvest', 'major change', 'release', 'endings that enable beginnings'] },
  14: { name: 'Temperance',          core: 'inspiration',    expansions: ['purpose', 'balance', 'guardianship', 'blending opposites', 'angelic guidance', 'moderation'] },
  15: { name: 'The Devil',           core: 'delusion',       expansions: ['false fears', 'self-doubt', 'procrastination', 'denial', 'inner obstacles', 'self-imposed chains'] },
  16: { name: 'The Tower',           core: 'disruption',     expansions: ['rude awakening', 'unexpected change', 'upheaval', 'truth revealed', 'false structures crumble'] },
  17: { name: 'The Star',            core: 'direction',      expansions: ['guidance', 'hope', 'knowing where to go', 'clarity after difficulty', 'navigation', 'light ahead'] },
  18: { name: 'The Moon',            core: 'hidden',         expansions: ['mysterious paths', 'intuition', 'unknown territory', 'illusion', 'subconscious forces', 'uncertainty'] },
  19: { name: 'The Sun',             core: 'nurturing',      expansions: ['growth', 'vitality', 'safe haven', 'healing', 'clarity', 'warmth', 'things coming to light'] },
  20: { name: 'Judgement',           core: 'awakening',      expansions: ['new awareness', 'revelation', 'uplifting', 'transformation', 'hearing the call', 'rising up'] },
  21: { name: 'The World',           core: 'fulfillment',    expansions: ['completion', 'peace', 'harmony', 'accomplishment', 'wholeness', 'integration', 'cycle complete'] }
};

// ─────────────────────────────────────────────
// 5. CELTIC CROSS POSITIONS (Petitia's version)
//    Grouped into What / Why / How / When
// ─────────────────────────────────────────────

const CELTIC_CROSS_POSITIONS = {
  1: {
    name: 'Present Situation',
    group: 'what',
    description: 'The heart of the matter — what is really going on',
    intros: [
      'At the heart of your question,',
      'The core of your situation right now:',
      'What is really going on here —'
    ],
    positionalShift: (keyword) =>
      `This is showing up as the central theme: ${keyword} defines where you are right now.`,
    actionFrame: 'This is what you are dealing with.'
  },
  2: {
    name: 'Challenge / Crossing',
    group: 'what',
    description: 'What crosses or complicates the situation',
    intros: [
      'Crossing your situation,',
      'What complicates things:',
      'The influence acting on this:'
    ],
    positionalShift: (keyword) =>
      `${capitalize(keyword)} is the energy crossing your path — it either challenges or adds complexity to the situation.`,
    actionFrame: 'Be aware of this influence.'
  },
  3: {
    name: 'Currently Going Through',
    group: 'why',
    description: 'Actions being taken right now, conscious efforts',
    intros: [
      'What you are actively going through:',
      'The actions you are taking right now:',
      'Your current efforts show:'
    ],
    positionalShift: (keyword) =>
      `You are currently working through a phase of ${keyword} — these are the steps you are taking.`,
    actionFrame: 'This reflects your current approach.'
  },
  4: {
    name: 'Initial Goal',
    group: 'why',
    description: 'The immediate, short-term objective',
    intros: [
      'Your immediate aim:',
      'What you are trying to achieve first:',
      'The short-term goal here:'
    ],
    positionalShift: (keyword) =>
      `Your first priority involves ${keyword} — this is what you are reaching for in the near term.`,
    actionFrame: 'Focus on this as your next step.'
  },
  5: {
    name: 'Asset',
    group: 'how',
    description: 'Strengths, resources, or qualities the querent has going for them',
    intros: [
      'Working in your favor:',
      'A strength you should lean into:',
      'What you have going for you:'
    ],
    positionalShift: (keyword) =>
      `${capitalize(keyword)} is your asset here — this is a resource or strength you can actively use.`,
    actionFrame: 'Leverage this. It is already yours.'
  },
  6: {
    name: 'Opportunity',
    group: 'how',
    description: 'What is coming in the near future — watch for this',
    intros: [
      'An opportunity approaching:',
      'Watch for this coming your way:',
      'Something opening up ahead:'
    ],
    positionalShift: (keyword) =>
      `An opportunity involving ${keyword} is on the horizon — be ready to recognize and act on it.`,
    actionFrame: 'Keep your eyes open for this in the coming weeks.'
  },
  7: {
    name: 'Client Viewpoint',
    group: 'what',
    description: 'How the querent sees their own question',
    intros: [
      'How you see your own situation:',
      'Your perspective on this:',
      'The way you are framing this question:'
    ],
    positionalShift: (keyword) =>
      `You are viewing this situation through the lens of ${keyword} — this is how you perceive things, which may or may not match reality.`,
    actionFrame: 'Consider whether this perspective is serving you.'
  },
  8: {
    name: 'Timing',
    group: 'when',
    description: 'When to act — now or wait? The most opportune moment',
    intros: [
      'On timing:',
      'When to move on this:',
      'The question of when:'
    ],
    positionalShift: (keyword) =>
      `The timing suggests ${keyword} — this tells you something about whether to act now or wait for the right moment.`,
    actionFrame: 'Let this guide your timing.'
  },
  9: {
    name: 'Purpose',
    group: 'why',
    description: 'The bigger picture — the ultimate reason behind the question',
    intros: [
      'The bigger picture:',
      'What this is ultimately about:',
      'The deeper purpose here:'
    ],
    positionalShift: (keyword) =>
      `Underneath everything, this is really about ${keyword} — the deeper reason driving your question.`,
    actionFrame: 'Keep this bigger purpose in mind as you navigate.'
  },
  10: {
    name: 'Anticipation',
    group: 'how',
    description: 'What to expect — not fixed fate, but the likely trajectory',
    intros: [
      'What to anticipate:',
      'Looking at what to expect:',
      'As this unfolds, watch for:'
    ],
    positionalShift: (keyword) =>
      `Expect themes of ${keyword} as this situation develops — this is the trajectory, not a fixed fate.`,
    actionFrame: 'Prepare for this, and remember — your choices shape the outcome.'
  }
};

// ─────────────────────────────────────────────
// 6. QUESTION CONTEXT (optional)
//    The querent brings the suit through their question
// ─────────────────────────────────────────────

const QUESTION_CONTEXTS = {
  relationship: {
    domain: 'cups',
    label: 'relationship',
    framings: ['in your relationship', 'between you and this person', 'in how you connect emotionally']
  },
  career: {
    domain: 'pentacles',
    label: 'career',
    framings: ['in your career', 'at work', 'in your professional life']
  },
  decision: {
    domain: 'swords',
    label: 'decision',
    framings: ['regarding this decision', 'as you weigh your options', 'in how you think through this']
  },
  personal_growth: {
    domain: 'wands',
    label: 'personal growth',
    framings: ['on your personal journey', 'in your growth', 'in what drives you forward']
  },
  finances: {
    domain: 'pentacles',
    label: 'financial',
    framings: ['regarding your finances', 'in your material situation', 'with money matters']
  },
  health: {
    domain: 'pentacles',
    label: 'health',
    framings: ['concerning your health', 'in your physical wellbeing', 'for your body and wellness']
  },
  general: {
    domain: null,
    label: 'general',
    framings: ['in your life right now', 'as things stand', 'in your current situation']
  }
};

// ─────────────────────────────────────────────
// 7. SIMPLE 3-CARD SPREAD (Past / Present / Future)
//    Kept for backwards compatibility
// ─────────────────────────────────────────────

const THREE_CARD_POSITIONS = {
  Past: {
    name: 'Past',
    group: 'time',
    description: 'What has led to the current situation',
    intros: [
      'Looking back, this card suggests',
      'In your recent past,',
      'What brought you here:'
    ],
    positionalShift: (keyword) =>
      `In the past, ${keyword} played a significant role — this is the energy that shaped where you are now.`,
    actionFrame: 'This is behind you, but its influence remains.'
  },
  Present: {
    name: 'Present',
    group: 'time',
    description: 'The current energy and situation',
    intros: [
      'Right now, you are experiencing',
      'At this moment,',
      'The heart of your current situation:'
    ],
    positionalShift: (keyword) =>
      `Right now, ${keyword} is the energy you are working with — this is where you stand.`,
    actionFrame: 'This is your present reality.'
  },
  Future: {
    name: 'Future',
    group: 'time',
    description: 'The direction things are heading',
    intros: [
      'Looking ahead,',
      'What is unfolding before you:',
      'The path forward suggests'
    ],
    positionalShift: (keyword) =>
      `Moving forward, ${keyword} is emerging — this is the direction the energy is heading.`,
    actionFrame: 'This is a possibility, not a certainty — your choices matter.'
  }
};

// ─────────────────────────────────────────────
// 8. UTILITY FUNCTIONS
// ─────────────────────────────────────────────

/** Pick a random item from an array. */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Capitalize first letter. */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get the keyword data for any card.
 * @param {object} card - { type, rank, suit, id, name }
 * @returns {{ core: string, expansions: string[], name?: string }}
 */
function getCardKeywords(card) {
  if (card.type === 'major') {
    const num = typeof card.rank === 'number'
      ? card.rank
      : parseInt(card.id?.replace('major-', ''), 10);
    return MAJOR_KEYWORDS[num] || { core: 'unknown', expansions: [] };
  }

  if (card.type === 'court') {
    return COURT_KEYWORDS[card.rank] || { core: 'unknown', expansions: [] };
  }

  // Minor arcana (ace–10)
  const rank = card.rank === 1 ? 'ace' : (card.rank || card.id?.split('-')[1]);
  return RANK_KEYWORDS[rank] || RANK_KEYWORDS[card.rank] || { core: 'unknown', expansions: [] };
}

/**
 * Get suit flavor for a card. Returns null for majors.
 * @param {object} card
 * @returns {object|null}
 */
function getSuitFlavor(card) {
  if (card.type === 'major') return null;
  return SUIT_FLAVORS[card.suit] || null;
}

/**
 * Resolve position data from either Celtic Cross (number) or 3-card (name string).
 * @param {object|number|string} position
 * @returns {object}
 */
function resolvePosition(position) {
  // Celtic Cross: position is a number 1–10 or object with .number
  if (typeof position === 'number') {
    return CELTIC_CROSS_POSITIONS[position];
  }
  if (position?.number) {
    return CELTIC_CROSS_POSITIONS[position.number];
  }

  // 3-card spread: position is a string or object with .name
  const name = typeof position === 'string' ? position : position?.name;
  return THREE_CARD_POSITIONS[name] || null;
}

// ─────────────────────────────────────────────
// 9. INTERPRETATION ENGINE
// ─────────────────────────────────────────────

/**
 * Build a suit-flavored body string for minor/court cards.
 * Combines the rank keyword with the suit's domain.
 */
function buildSuitBody(keywords, suit, position) {
  const expansion = pick(keywords.expansions);
  const framing = pick(suit.framings);

  const templates = [
    `${expansion} ${framing} — ${suit.adjective} energy shapes this ${keywords.core}`,
    `a time of ${keywords.core} ${framing} — ${expansion}`,
    `${framing}, the theme is ${keywords.core} — think ${expansion}`,
    `${keywords.core} is playing out ${framing} — specifically, ${expansion}`
  ];

  return pick(templates);
}

/**
 * Build a body string for major arcana.
 */
function buildMajorBody(keywords) {
  const expansion = pick(keywords.expansions);

  const templates = [
    `the energy of ${keywords.core} is present — ${expansion}`,
    `${keywords.name || 'this card'} brings ${keywords.core} — think about ${expansion}`,
    `${keywords.core} defines this moment — ${expansion}`,
    `you are in a phase of ${keywords.core} — ${expansion}`
  ];

  return pick(templates);
}

/**
 * Generate an alternative interpretation (the "could also mean" piece).
 */
function buildAlternative(keywords, suit) {
  // Pick a different expansion than what might have been used
  const alt = pick(keywords.expansions);
  if (suit) {
    return `This could also point to ${alt} ${pick(suit.framings)}.`;
  }
  return `This could also suggest ${alt}.`;
}

/**
 * Generate an interpretation for a single card in a spread position.
 *
 * @param {object} params
 * @param {object} params.card - { type, rank, suit, id, name, meaning? }
 * @param {object|number|string} params.position - Position in spread
 * @param {string} [params.questionContext] - Key from QUESTION_CONTEXTS
 * @returns {{ intro, body, positional, alternative, actionable, meta }}
 */
function interpretCard({ card, position, questionContext = 'general' }) {
  const pos = resolvePosition(position);
  const keywords = getCardKeywords(card);
  const suit = getSuitFlavor(card);
  const qContext = QUESTION_CONTEXTS[questionContext] || QUESTION_CONTEXTS.general;

  // --- Intro (position-specific) ---
  const intro = pos ? pick(pos.intros) : '';

  // --- Body (keyword + suit flavor) ---
  let body;
  if (card.type === 'major') {
    body = buildMajorBody(keywords);
  } else if (suit) {
    body = buildSuitBody(keywords, suit, pos);
  } else {
    body = `a time of ${keywords.core} — ${pick(keywords.expansions)}`;
  }

  // --- Positional influence (how position reshapes meaning) ---
  const positional = pos?.positionalShift
    ? pos.positionalShift(keywords.core)
    : '';

  // --- Alternative reading ---
  const alternative = buildAlternative(keywords, suit);

  // --- Actionable guidance (position-aware) ---
  let actionable = pos?.actionFrame || '';
  // Add question-context framing if available
  if (qContext.domain && qContext.label !== 'general') {
    actionable += ` Consider this especially ${pick(qContext.framings)}.`;
  }

  return {
    intro,
    body,
    positional,
    alternative,
    actionable,
    meta: {
      cardName: card.name || keywords.name || 'Unknown',
      keyword: keywords.core,
      suit: suit?.domain || null,
      positionName: pos?.name || 'Unknown',
      positionGroup: pos?.group || null
    }
  };
}

// ─────────────────────────────────────────────
// 10. SPREAD-LEVEL SYNTHESIS
// ─────────────────────────────────────────────

/**
 * Group Celtic Cross positions into What / Why / How / When.
 * @param {Array<{ card, position }>} spread - 10 cards with positions 1–10
 * @returns {{ what: array, why: array, how: array, when: object }}
 */
function groupByAspect(spread) {
  const groups = { what: [], why: [], how: [], when: null };

  for (const drawn of spread) {
    const pos = resolvePosition(drawn.position);
    if (!pos) continue;

    if (pos.group === 'when') {
      groups.when = drawn;
    } else if (groups[pos.group]) {
      groups[pos.group].push(drawn);
    }
  }

  return groups;
}

/**
 * Synthesize a What/Why/How/When narrative from a full Celtic Cross.
 * @param {Array<{ card, position }>} spread - 10 drawn cards
 * @param {string} [questionContext]
 * @returns {{ what, why, how, when, overall }}
 */
function generateCelticCrossSummary(spread, questionContext = 'general') {
  const groups = groupByAspect(spread);
  const qContext = QUESTION_CONTEXTS[questionContext] || QUESTION_CONTEXTS.general;

  function getNames(cards) {
    return cards.map(d => d.card.name || getCardKeywords(d.card).name || '?');
  }

  function getCores(cards) {
    return cards.map(d => getCardKeywords(d.card).core);
  }

  // --- WHAT (Positions 1, 2, 7) ---
  const whatCores = getCores(groups.what);
  const whatNames = getNames(groups.what);
  const whatSummaries = [
    `<strong>What is this about?</strong> Your question centers on themes of ${whatCores.join(', ')}. The cards ${whatNames.join(', ')} together paint a picture of what you are truly dealing with — and how you see it may differ from what is actually happening.`,
    `<strong>The Question:</strong> At the core, this is about ${whatCores[0]} complicated by ${whatCores[1] || 'outside influences'}, and you perceive it through the lens of ${whatCores[2] || 'your own viewpoint'}. The cards ${whatNames.join(' and ')} frame the real question here.`
  ];

  // --- WHY (Positions 3, 4, 9) ---
  const whyCores = getCores(groups.why);
  const whyNames = getNames(groups.why);
  const whySummaries = [
    `<strong>Why?</strong> You are currently going through ${whyCores[0] || '—'}, aiming for ${whyCores[1] || '—'} in the short term, but the ultimate purpose runs deeper: ${whyCores[2] || '—'}. The thread from ${whyNames.join(' to ')} shows your motivation and direction.`,
    `<strong>The Motivation:</strong> Your actions (${whyCores[0]}) point toward an immediate goal of ${whyCores[1]}, but the bigger picture is about ${whyCores[2]}. ${whyNames.join(', ')} trace the arc of why you are here.`
  ];

  // --- HOW (Positions 5, 6, 10) ---
  const howCores = getCores(groups.how);
  const howNames = getNames(groups.how);
  const howSummaries = [
    `<strong>How?</strong> Your asset is ${howCores[0] || '—'} — lean into it. An opportunity involving ${howCores[1] || '—'} is approaching. As things progress, expect themes of ${howCores[2] || '—'}. ${howNames.join(', ')} show the path forward.`,
    `<strong>The Path Forward:</strong> You have ${howCores[0]} working for you. Watch for ${howCores[1]} as an opening. The trajectory points toward ${howCores[2]}. Use ${howNames[0]} as your foundation and stay alert for ${howNames[1]}.`
  ];

  // --- WHEN (Position 8) ---
  let whenSummary = '';
  if (groups.when) {
    const whenCore = getCardKeywords(groups.when.card).core;
    const whenName = groups.when.card.name || getCardKeywords(groups.when.card).name;
    const whenOptions = [
      `<strong>When?</strong> ${whenName} in the timing position suggests ${whenCore}. Consider whether this calls for immediate action or patient waiting — the energy of ${whenCore} should guide your sense of timing.`,
      `<strong>Timing:</strong> The card ${whenName} points to ${whenCore} as the key timing signal. When ${whenCore} shows up in your situation, that is your moment to move.`
    ];
    whenSummary = pick(whenOptions);
  }

  // --- Overall ---
  const contextLabel = qContext.label !== 'general'
    ? ` regarding your ${qContext.label}`
    : '';

  const overallOptions = [
    `Your reading${contextLabel} traces a journey through what you face, why it matters, how to navigate it, and when to act. The cards suggest possibilities, not certainties — your choices shape the outcome.`,
    `Taken together${contextLabel}, this spread offers a map: understand the question clearly, recognize your motivations, use your assets, seize the opportunity, and trust your timing. These are ideas for solutions — the decisions are yours.`
  ];

  return {
    what: pick(whatSummaries),
    why: pick(whySummaries),
    how: pick(howSummaries),
    when: whenSummary,
    overall: pick(overallOptions)
  };
}

/**
 * Generate a summary for a simple 3-card spread (backwards compatible).
 * @param {Array<{ card, position }>} spread - 3 cards: Past, Present, Future
 * @returns {string}
 */
function generateSummary(spread) {
  const cards = spread.map(d => ({
    name: d.card.name || getCardKeywords(d.card).name || '?',
    core: getCardKeywords(d.card).core
  }));

  const [past, present, future] = cards;

  const summaries = [
    `Your reading traces a path from <strong>${past.name}</strong> (${past.core}) through <strong>${present.name}</strong> (${present.core}) toward <strong>${future.name}</strong> (${future.core}). The past shaped your foundation, the present holds the energy you are working with, and the future shows where this energy is heading.`,
    `From ${past.core} to ${present.core} to ${future.core} — your cards <strong>${past.name}</strong>, <strong>${present.name}</strong>, and <strong>${future.name}</strong> paint a clear arc. Let what came before inform, not define, where you are headed.`,
    `The thread runs from <strong>${past.name}</strong> (${past.core}), through <strong>${present.name}</strong> (${present.core}), opening into <strong>${future.name}</strong> (${future.core}). Trust the progression and move with it — these are suggestions, not fixed outcomes.`
  ];

  return pick(summaries);
}
