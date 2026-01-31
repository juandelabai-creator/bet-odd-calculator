/**
 * 10-Ball Betting Odds Calculator
 * A professional application for calculating and managing betting odds for 10-ball pool matches
 */

// ==================== APPLICATION STATE ====================

const AppState = {
  match: null,
  bets: [],
  
  createMatch: (playerA, playerB, houseCut, matchFormat) => {
    return {
      playerA,
      playerB,
      houseCut,
      matchFormat,
      createdAt: new Date().toISOString()
    };
  },

  addBet: (bettor, player, amount) => {
    return {
      bettor,
      player,
      amount,
      addedAt: new Date().toISOString()
    };
  },

  reset: () => {
    AppState.match = null;
    AppState.bets = [];
  }
};

// ==================== ODDS CALCULATOR ====================

const OddsCalculator = {
  /**
   * Calculate total amounts for each player
   */
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

  /**
   * Get payout information for a specific winning player
   */
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

  /**
   * Get format label
   */
  getFormatLabel: (format) => {
    const labels = {
      'first-to-5': 'First to 5',
      'first-to-7': 'First to 7',
      'first-to-9': 'First to 9',
      'best-of-11': 'Best of 11'
    };
    return labels[format] || format;
  }
};

// ==================== DOM UTILITIES ====================

const DOM = {
  /**
   * Get element by ID
   */
  get: (id) => document.getElementById(id),

  /**
   * Safe element access with default
   */
  getOrNull: (id) => {
    const el = document.getElementById(id);
    return el || { innerText: '0', textContent: '0' };
  },

  /**
   * Set text content
   */
  setText: (id, text) => {
    const el = DOM.get(id);
    if (el) el.innerText = text;
  },

  /**
   * Set HTML content
   */
  setHTML: (id, html) => {
    const el = DOM.get(id);
    if (el) el.innerHTML = html;
  },

  /**
   * Show element
   */
  show: (id) => {
    const el = DOM.get(id);
    if (el) el.style.display = 'block';
  },

  /**
   * Hide element
   */
  hide: (id) => {
    const el = DOM.get(id);
    if (el) el.style.display = 'none';
  },

  /**
   * Get input value
   */
  getValue: (id) => {
    const el = DOM.get(id);
    return el ? el.value.trim() : '';
  },

  /**
   * Clear input value
   */
  clear: (id) => {
    const el = DOM.get(id);
    if (el) el.value = '';
  }
};

// ==================== UI RENDERER ====================

const UIRenderer = {
  /**
   * Update odds display
   */
  updateOdds: () => {
    const totals = OddsCalculator.getTotals();
    DOM.setText('oddsA', totals.oddsA.toFixed(2));
    DOM.setText('oddsB', totals.oddsB.toFixed(2));
  },

  /**
   * Update bets table
   */
  updateBetsTable: () => {
    const totals = OddsCalculator.getTotals();
    const tbody = DOM.get('betsTable');
    tbody.innerHTML = '';

    AppState.bets.forEach((bet, index) => {
      const odds = bet.player === 'A' ? totals.oddsA : totals.oddsB;
      const payout = Math.floor(bet.amount * odds * 100) / 100;
      const playerName = bet.player === 'A' ? AppState.match.playerA : AppState.match.playerB;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(bet.bettor)}</td>
        <td>${escapeHtml(playerName)}</td>
        <td>${bet.amount.toFixed(2)}</td>
        <td>${odds.toFixed(2)}</td>
        <td>${payout.toFixed(2)}</td>
        <td><button class="btn btn-danger" onclick="removeBet(${index})">✕ Remove</button></td>
      `;
      tbody.appendChild(row);
    });
  },

  /**
   * Update dashboard
   */
  updateDashboard: () => {
    const totals = OddsCalculator.getTotals();
    const payoutA = OddsCalculator.getPayoutInfo('A');
    const payoutB = OddsCalculator.getPayoutInfo('B');

    DOM.setText('grossPool', totals.gross.toFixed(2));
    DOM.setText('netPool', totals.net.toFixed(2));
    DOM.setText('houseProfit', totals.houseAmount.toFixed(2));
    DOM.setText('dashCut', `${AppState.match.houseCut}%`);
    DOM.setText('totalBets', AppState.bets.length);

    // Payout distribution
    DOM.setText('payoutPlayerA', AppState.match.playerA);
    DOM.setText('payoutTotalA', payoutA.totalPayout.toFixed(2));
    DOM.setText('houseProfitA', payoutA.housePayout.toFixed(2));

    DOM.setText('payoutPlayerB', AppState.match.playerB);
    DOM.setText('payoutTotalB', payoutB.totalPayout.toFixed(2));
    DOM.setText('houseProfitB', payoutB.housePayout.toFixed(2));
  },

  /**
   * Render all UI elements
   */
  renderAll: () => {
    if (!AppState.match) return;
    UIRenderer.updateOdds();
    UIRenderer.updateBetsTable();
    UIRenderer.updateDashboard();
  }
};

// ==================== CORE FUNCTIONS ====================

/**
 * Create or reset a match
 */
function createMatch() {
  const playerA = DOM.getValue('playerA');
  const playerB = DOM.getValue('playerB');
  const houseCut = parseFloat(DOM.getValue('houseCut')) || 0;
  const matchFormat = DOM.getValue('matchRounds');

  // Validation
  if (!playerA || !playerB) {
    alert('Please enter both player names');
    return;
  }

  if (houseCut < 0 || houseCut > 100) {
    alert('House cut must be between 0 and 100');
    return;
  }

  // Create match
  AppState.match = AppState.createMatch(playerA, playerB, houseCut, matchFormat);
  AppState.bets = [];

  // Update UI
  DOM.setText('matchTitle', `${playerA} vs ${playerB}`);
  DOM.setText('matchFormat', OddsCalculator.getFormatLabel(matchFormat));
  DOM.setText('playerALabel', playerA);
  DOM.setText('playerBLabel', playerB);

  // Update player choice select
  const select = DOM.get('playerChoice');
  select.innerHTML = `
    <option value="A">${playerA}</option>
    <option value="B">${playerB}</option>
  `;

  // Show sections
  DOM.show('betSection');
  DOM.show('betsCard');
  DOM.show('dashboard');

  // Initial render
  UIRenderer.renderAll();
}

/**
 * Add a bet
 */
function addBet() {
  if (!AppState.match) {
    alert('Please create a match first');
    return;
  }

  const bettorName = DOM.getValue('bettorName');
  const player = DOM.getValue('playerChoice');
  const amount = parseFloat(DOM.getValue('betAmount')) || 0;

  // Validation
  if (!bettorName) {
    alert('Please enter bettor name');
    return;
  }

  if (amount <= 0) {
    alert('Bet amount must be greater than 0');
    return;
  }

  // Add bet
  AppState.bets.push(AppState.addBet(bettorName, player, amount));

  // Clear inputs
  DOM.clear('bettorName');
  DOM.clear('betAmount');

  // Re-render
  UIRenderer.renderAll();
}

/**
 * Remove a bet by index
 */
function removeBet(index) {
  if (index >= 0 && index < AppState.bets.length) {
    AppState.bets.splice(index, 1);
    UIRenderer.renderAll();
  }
}

/**
 * Reset all data
 */
function resetAll() {
  if (!confirm('Are you sure you want to reset everything?')) {
    return;
  }

  AppState.reset();
  DOM.clear('playerA');
  DOM.clear('playerB');
  DOM.clear('houseCut');
  DOM.get('houseCut').value = '10';
  DOM.clear('bettorName');
  DOM.clear('betAmount');
  DOM.hide('betSection');
  DOM.hide('betsCard');
  DOM.hide('dashboard');
  DOM.setHTML('betsTable', '');
}

/**
 * Export data to Excel
 */
function exportToExcel() {
  if (!AppState.match) {
    alert('No match data to export');
    return;
  }

  const totals = OddsCalculator.getTotals();
  const payoutA = OddsCalculator.getPayoutInfo('A');
  const payoutB = OddsCalculator.getPayoutInfo('B');

  // Match Info Sheet
  const matchData = [{
    'Player A': AppState.match.playerA,
    'Player B': AppState.match.playerB,
    'Match Format': OddsCalculator.getFormatLabel(AppState.match.matchFormat),
    'House Cut (%)': AppState.match.houseCut,
    'Created': new Date().toLocaleString()
  }];

  // Bets Sheet
  const betsData = AppState.bets.map(bet => {
    const odds = bet.player === 'A' ? totals.oddsA : totals.oddsB;
    const payout = bet.amount * odds;
    return {
      'Bettor': bet.bettor,
      'Player': bet.player === 'A' ? AppState.match.playerA : AppState.match.playerB,
      'Bet Amount': bet.amount,
      'Odds': odds.toFixed(2),
      'Potential Payout': payout.toFixed(2)
    };
  });

  // Summary Sheet
  const summaryData = [{
    'Metric': 'Gross Pool',
    'Amount': totals.gross.toFixed(2)
  }, {
    'Metric': 'House Cut',
    'Amount': totals.houseAmount.toFixed(2)
  }, {
    'Metric': 'Net Pool',
    'Amount': totals.net.toFixed(2)
  }, {
    'Metric': 'Total Bets',
    'Amount': AppState.bets.length
  }, {
    'Metric': 'Payout if ' + AppState.match.playerA + ' wins',
    'Amount': payoutA.totalPayout.toFixed(2)
  }, {
    'Metric': 'House Profit if ' + AppState.match.playerA + ' wins',
    'Amount': payoutA.housePayout.toFixed(2)
  }, {
    'Metric': 'Payout if ' + AppState.match.playerB + ' wins',
    'Amount': payoutB.totalPayout.toFixed(2)
  }, {
    'Metric': 'House Profit if ' + AppState.match.playerB + ' wins',
    'Amount': payoutB.housePayout.toFixed(2)
  }];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matchData), 'MATCH INFO');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(betsData), 'BETS');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'SUMMARY');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `10ball_betting_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(wb, filename);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== INITIALIZATION ====================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('10-Ball Betting Odds Calculator initialized');
  // Focus on first input
  DOM.get('playerA').focus();
});
