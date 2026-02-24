/**
 * EasyReadTarot — Card Data
 * Based on Marseille Tarot with custom keyword system.
 * Rule: Number > Suit — rank carries meaning, suit adds flavor.
 * No reversals — all cards read upright.
 */

const SUITS = {
  swords: { name: 'Swords', domain: 'Thought', flavor: 'Logic, decisions, mental clarity' },
  cups:   { name: 'Cups',   domain: 'Emotion', flavor: 'Feelings, heart, relationships' },
  wands:  { name: 'Wands',  domain: 'Spirit',  flavor: 'Passion, drive, inspiration' },
  pentacles: { name: 'Pentacles', domain: 'Physical', flavor: 'Career, money, material world' }
};

const RANKS = {
  ace:  { name: 'Ace',  keyword: 'Beginning',    meaning: 'New idea, offer, fresh start' },
  2:    { name: '2',    keyword: 'Choice',        meaning: 'Decision, duality, crossroads' },
  3:    { name: '3',    keyword: 'Creativity',    meaning: 'Developing, exploring, making something' },
  4:    { name: '4',    keyword: 'Stability',     meaning: 'Routine, structure, sometimes stagnant' },
  5:    { name: '5',    keyword: 'Change',         meaning: 'Disruption, challenge, adjustment' },
  6:    { name: '6',    keyword: 'Overcoming',    meaning: 'Perseverance, getting through it' },
  7:    { name: '7',    keyword: 'Confidence',    meaning: 'Tested, experienced, belief' },
  8:    { name: '8',    keyword: 'Advancement',   meaning: 'Progress, moving forward, next level' },
  9:    { name: '9',    keyword: 'Attainment',    meaning: 'Achievement, peak, difficult truths' },
  10:   { name: '10',   keyword: 'Completion',    meaning: 'End of cycle, closure, transition' }
};

const COURT = {
  page:   { name: 'Page',   keyword: 'New Path',   meaning: 'Rookie energy, learning, fresh direction' },
  knight: { name: 'Knight', keyword: 'Action',      meaning: 'Initiative, movement, doing' },
  queen:  { name: 'Queen',  keyword: 'Patience',    meaning: 'Wisdom, understanding, influence' },
  king:   { name: 'King',   keyword: 'Knowledge',   meaning: 'Expertise, authority, experience' }
};

const MAJOR_ARCANA = [
  { number: 0,  name: 'The Fool',            keyword: 'Carefree' },
  { number: 1,  name: 'The Magician',        keyword: 'Awareness' },
  { number: 2,  name: 'The High Priestess',  keyword: 'Mystery' },
  { number: 3,  name: 'The Empress',         keyword: 'Creativity' },
  { number: 4,  name: 'The Emperor',         keyword: 'Leadership' },
  { number: 5,  name: 'The Hierophant',      keyword: 'Guidance' },
  { number: 6,  name: 'The Lovers',          keyword: 'Attraction' },
  { number: 7,  name: 'The Chariot',         keyword: 'Victory' },
  { number: 8,  name: 'Strength',            keyword: 'Endurance' },
  { number: 9,  name: 'The Hermit',          keyword: 'Self-Reflection' },
  { number: 10, name: 'Wheel of Fortune',    keyword: 'Destiny' },
  { number: 11, name: 'Justice',             keyword: 'Consequences' },
  { number: 12, name: 'The Hanged Man',      keyword: 'Paradox' },
  { number: 13, name: 'Death',               keyword: 'Transformation' },
  { number: 14, name: 'Temperance',          keyword: 'Inspiration' },
  { number: 15, name: 'The Devil',           keyword: 'Delusion' },
  { number: 16, name: 'The Tower',           keyword: 'Disruption' },
  { number: 17, name: 'The Star',            keyword: 'Direction' },
  { number: 18, name: 'The Moon',            keyword: 'Hidden' },
  { number: 19, name: 'The Sun',             keyword: 'Nurturing' },
  { number: 20, name: 'Judgment',            keyword: 'Awakening' },
  { number: 21, name: 'The World',           keyword: 'Fulfillment' }
];

/**
 * Build the full 78-card deck.
 * Each card: { id, name, type, keyword, meaning, suit?, rank?, image }
 */
function buildDeck() {
  const deck = [];

  // Major Arcana (22 cards)
  for (const major of MAJOR_ARCANA) {
    const num = String(major.number).padStart(2, '0');
    deck.push({
      id: `major-${num}`,
      name: major.name,
      type: 'major',
      keyword: major.keyword,
      meaning: major.keyword,
      image: `images/cards/${num}-${major.name.toLowerCase().replace(/^the\s+/, '').replace(/\s+/g, '-')}.jpg`
    });
  }

  // Minor Arcana — pip cards (40 cards)
  for (const [suitKey, suit] of Object.entries(SUITS)) {
    for (const [rankKey, rank] of Object.entries(RANKS)) {
      const rankLabel = rankKey === 'ace' ? 'Ace' : rankKey;
      deck.push({
        id: `${suitKey}-${rankKey}`,
        name: `${rankLabel} of ${suit.name}`,
        type: 'minor',
        keyword: rank.keyword,
        meaning: rank.meaning,
        suit: suitKey,
        suitData: suit,
        rank: rankKey,
        image: `images/cards/${rankKey}-of-${suitKey}.jpg`
      });
    }

    // Court cards (16 cards)
    for (const [courtKey, court] of Object.entries(COURT)) {
      deck.push({
        id: `${suitKey}-${courtKey}`,
        name: `${court.name} of ${suit.name}`,
        type: 'court',
        keyword: court.keyword,
        meaning: court.meaning,
        suit: suitKey,
        suitData: suit,
        rank: courtKey,
        image: `images/cards/${courtKey}-of-${suitKey}.jpg`
      });
    }
  }

  return deck;
}

const DECK = buildDeck();
