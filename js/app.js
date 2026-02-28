/**
 * EasyReadTarot — Main Application
 * Handles UI interactions, card flip animations, and reading display.
 */

(function () {
  'use strict';

  // --- DOM References ---
  const heroEl = document.getElementById('hero');
  const readingEl = document.getElementById('reading');
  const btnStart = document.getElementById('btn-start');
  const btnNew = document.getElementById('btn-new');
  const spreadInstruction = document.getElementById('spread-instruction');
  const cardSpreadEl = document.getElementById('card-spread');
  const interpretationEl = document.getElementById('interpretation');
  const readingCardsEl = document.getElementById('reading-cards');
  const readingSummaryEl = document.getElementById('reading-summary');

  // --- State ---
  let currentSpread = [];
  let flippedCount = 0;

  // --- Init ---
  btnStart.addEventListener('click', startReading);
  btnNew.addEventListener('click', newReading);

  function startReading() {
    heroEl.classList.add('hidden');
    readingEl.classList.remove('hidden');
    dealCards();
  }

  function newReading() {
    flippedCount = 0;
    interpretationEl.classList.add('hidden');
    btnNew.classList.add('hidden');
    readingCardsEl.innerHTML = '';
    readingSummaryEl.innerHTML = '';
    spreadInstruction.textContent = 'Tap each card to reveal its message';

    // Reset card flip state
    const cards = cardSpreadEl.querySelectorAll('.card');
    cards.forEach(card => card.classList.remove('flipped'));

    // Short delay then deal new cards
    setTimeout(dealCards, 300);
  }

  function dealCards() {
    currentSpread = drawThreeCardSpread();

    const cards = cardSpreadEl.querySelectorAll('.card');
    cards.forEach((cardEl, i) => {
      const drawn = currentSpread[i];
      setupCard(cardEl, drawn);
    });
  }

  function setupCard(cardEl, drawn) {
    const { card } = drawn;
    const front = cardEl.querySelector('.card-front');

    // Card image
    const img = front.querySelector('.card-image');
    const placeholder = front.querySelector('.card-placeholder');

    img.src = card.image;
    img.alt = card.name;
    img.classList.remove('loaded');

    // Set placeholder numeral
    let numeral = '';
    if (card.type === 'major') {
      numeral = romanize(parseInt(card.id.replace('major-', ''), 10));
    } else if (card.type === 'court') {
      const courtSymbols = { page: 'Pg', knight: 'Kn', queen: 'Qu', king: 'Ki' };
      numeral = courtSymbols[card.rank] || '';
    } else {
      numeral = card.rank === 'ace' ? 'A' : card.rank;
    }
    placeholder.setAttribute('data-numeral', numeral);

    // Try loading the image
    img.onload = function () {
      img.classList.add('loaded');
    };
    img.onerror = function () {
      img.classList.remove('loaded');
    };

    // Card info
    front.querySelector('.card-name').textContent = card.name;

    // Click to flip
    cardEl.onclick = function () {
      if (cardEl.classList.contains('flipped')) return;
      flipCard(cardEl);
    };
  }

  function flipCard(cardEl) {
    cardEl.classList.add('flipped');
    flippedCount++;

    if (flippedCount === 3) {
      spreadInstruction.textContent = '';
      setTimeout(showInterpretation, 800);
    } else {
      const remaining = 3 - flippedCount;
      spreadInstruction.textContent = remaining === 1
        ? 'Tap the last card to complete your reading'
        : `Tap the remaining ${remaining} cards`;
    }
  }

  function showInterpretation() {
    readingCardsEl.innerHTML = '';

    currentSpread.forEach(drawn => {
      const { intro, body } = interpretCard(drawn);
      const detail = document.createElement('div');
      detail.className = 'reading-card-detail';
      detail.innerHTML = `
        <img class="detail-card-image" src="${drawn.card.image}" alt="${drawn.card.name}">
        <div class="detail-text">
          <div class="detail-position">${drawn.position.name} &mdash; ${drawn.position.description}</div>
          <div class="detail-header">
            <span class="detail-name">${drawn.card.name}</span>
          </div>
          <p class="detail-meaning">${intro} ${body}.</p>
        </div>
      `;
      readingCardsEl.appendChild(detail);
    });

    const summary = generateSummary(currentSpread);
    readingSummaryEl.innerHTML = `
      <h3>Your Reading</h3>
      <p>${summary}</p>
    `;

    interpretationEl.classList.remove('hidden');
    btnNew.classList.remove('hidden');

    // Smooth scroll to interpretation
    setTimeout(() => {
      interpretationEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  /** Convert number to roman numeral (0-21 range). */
  function romanize(num) {
    if (num === 0) return '0';
    const lookup = [
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let result = '';
    for (const [value, symbol] of lookup) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  }
})();
