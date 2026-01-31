/**
 * Shared State & Utilities for 10-Ball Betting Odds Calculator
 */

// ==================== LOCAL STORAGE ====================

const Storage = {
  KEY: CONFIG.STORAGE_KEY,

  save: () => {
    const data = {
      match: AppState.match,
      bets: AppState.bets,
      scores: AppState.scores
    };
    localStorage.setItem(Storage.KEY, JSON.stringify(data));
  },

  load: () => {
    const data = localStorage.getItem(Storage.KEY);
    if (data) {
      const parsed = JSON.parse(data);
      AppState.match = parsed.match;
      AppState.bets = parsed.bets || [];
      AppState.scores = parsed.scores || { playerA: 0, playerB: 0 };
    }
  },

  clear: () => {
    localStorage.removeItem(Storage.KEY);
  }
};

// ==================== APPLICATION STATE ====================

const AppState = {
  match: null,
  bets: [],
  scores: { playerA: 0, playerB: 0 },

  createMatch: (playerA, playerB, houseCut, matchType, matchValue) => {
    return {
      id: Date.now(),
      playerA,
      playerB,
      houseCut,
      matchType, // 'best-of' or 'race-to'
      matchValue, // number of games
      createdAt: new Date().toISOString(),
      status: 'active'
    };
  },

  addBet: (bettor, player, amount) => {
    return {
      id: Date.now() + Math.random(),
      bettor,
      player,
      amount,
      addedAt: new Date().toISOString()
    };
  },

  reset: () => {
    AppState.match = null;
    AppState.bets = [];
    AppState.scores = { playerA: 0, playerB: 0 };
  }
};

// ==================== ODDS CALCULATOR ====================

const OddsCalculator = {
  getTotals: () => {
    if (!AppState.match) return { betA: 0, betB: 0, gross: 0, net: 0, oddsA: 0, oddsB: 0 };

    let betA = 0;
    let betB = 0;

    AppState.bets.forEach(bet => {
      if (bet.player === 'A') betA += bet.amount;
      else betB += bet.amount;
    });

    const gross = betA + betB;
    const net = gross * (1 - AppState.match.houseCut / 100);
    const houseAmount = gross - net;

    return {
      betA,
      betB,
      gross,
      net,
      houseAmount,
      oddsA: betA > 0 ? net / betA : 0,
      oddsB: betB > 0 ? net / betB : 0
    };
  },

  getPayoutInfo: (winnerPlayer) => {
    const totals = OddsCalculator.getTotals();
    const odds = winnerPlayer === 'A' ? totals.oddsA : totals.oddsB;
    const winningBets = AppState.bets.filter(b => b.player === winnerPlayer);
    
    const totalPayout = winningBets.reduce((sum, bet) => sum + (bet.amount * odds), 0);
    const housePayout = totals.gross - totalPayout;

    return {
      totalPayout: Math.floor(totalPayout * 100) / 100,
      housePayout: Math.floor(housePayout * 100) / 100,
      individualPayouts: winningBets.map(bet => ({
        ...bet,
        payout: Math.floor(bet.amount * odds * 100) / 100
      }))
    };
  },

  getFormatLabel: (matchType, matchValue) => {
    if (matchType === 'best-of') {
      return `Best of ${matchValue}`;
    } else if (matchType === 'race-to') {
      return `Race to ${matchValue}`;
    }
    return 'Unknown Format';
  }
};

// ==================== DOM UTILITIES ====================

const DOM = {
  get: (id) => document.getElementById(id),

  getValue: (id) => {
    const el = DOM.get(id);
    return el ? el.value.trim() : '';
  },

  setText: (id, text) => {
    const el = DOM.get(id);
    if (el) el.innerText = text;
  },

  setHTML: (id, html) => {
    const el = DOM.get(id);
    if (el) el.innerHTML = html;
  },

  show: (id) => {
    const el = DOM.get(id);
    if (el) el.style.display = 'block';
  },

  hide: (id) => {
    const el = DOM.get(id);
    if (el) el.style.display = 'none';
  },

  clear: (id) => {
    const el = DOM.get(id);
    if (el) el.value = '';
  },

  addClass: (id, className) => {
    const el = DOM.get(id);
    if (el) el.classList.add(className);
  },

  removeClass: (id, className) => {
    const el = DOM.get(id);
    if (el) el.classList.remove(className);
  }
};

// ==================== UTILITIES ====================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function goToAdmin() {
  window.location.href = 'admin.html';
}

function goToDisplay() {
  window.location.href = 'index.html';
}

// Load state on page load
document.addEventListener('DOMContentLoaded', () => {
  Storage.load();
});
