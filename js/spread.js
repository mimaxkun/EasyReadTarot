/**
 * EasyReadTarot — Spread Logic
 * Fisher-Yates shuffle + three-card draw.
 */

const POSITIONS = [
  {
    name: 'Past',
    description: 'What has led you here',
    prompt: 'In your past'
  },
  {
    name: 'Present',
    description: 'Where you stand now',
    prompt: 'Right now'
  },
  {
    name: 'Future',
    description: 'What is unfolding ahead',
    prompt: 'Moving forward'
  }
];

/** Fisher-Yates shuffle (does not mutate original). */
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Draw a three-card spread. Returns array of { card, position }. */
function drawThreeCardSpread() {
  const shuffled = shuffleDeck(DECK);
  return POSITIONS.map((position, i) => ({
    card: shuffled[i],
    position
  }));
}
