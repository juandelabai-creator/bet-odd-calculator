/**
 * Display Page Logic - 10-Ball Betting Odds Calculator (Simplified)
 */

// ==================== DISPLAY RENDERER ====================

const DisplayRenderer = {
  renderAll: () => {
    if (!AppState.match) {
      DOM.show('noMatchSection');
      DOM.hide('matchDisplaySection');
      return;
    }

    DOM.hide('noMatchSection');
    DOM.show('matchDisplaySection');

    DisplayRenderer.renderScoreboard();
    DisplayRenderer.renderHandicapInstructions();
    DisplayRenderer.renderBettingSummary();
    DisplayRenderer.renderOdds();
    DisplayRenderer.checkWinner();
  },

  renderScoreboard: () => {
    const match = AppState.match;
    const formatLabel = OddsCalculator.getFormatLabel(match.matchType, match.matchValue);

    DOM.setText('displayPlayerAName', match.playerA);
    DOM.setText('displayPlayerBName', match.playerB);
    DOM.setText('displayScoreA', AppState.scores.playerA);
    DOM.setText('displayScoreB', AppState.scores.playerB);
    DOM.setText('displayMatchFormatCompact', formatLabel);

    // Load player photos if available
    const playerAPhoto = DOM.get('playerAPhoto');
    const playerBPhoto = DOM.get('playerBPhoto');
    if (playerAPhoto && match.playerAPhoto) {
      playerAPhoto.src = match.playerAPhoto;
    }
    if (playerBPhoto && match.playerBPhoto) {
      playerBPhoto.src = match.playerBPhoto;
    }

    // Update player sections styling based on score
    DisplayRenderer.updatePlayerSectionStyles();
  },

  updatePlayerSectionStyles: () => {
    const scoreA = AppState.scores.playerA;
    const scoreB = AppState.scores.playerB;
    const sectionA = DOM.get('playerASection');
    const sectionB = DOM.get('playerBSection');

    // Add leading class if ahead
    if (scoreA > scoreB) {
      if (sectionA) sectionA.classList.add('leading');
      if (sectionB) sectionB.classList.remove('leading');
    } else if (scoreB > scoreA) {
      if (sectionB) sectionB.classList.add('leading');
      if (sectionA) sectionA.classList.remove('leading');
    } else {
      if (sectionA) sectionA.classList.remove('leading');
      if (sectionB) sectionB.classList.remove('leading');
    }
  },

  renderHandicapInstructions: () => {
    const match = AppState.match;
    const handicapSection = DOM.get('handicapInstructionsSection');
    const handicapContent = DOM.get('handicapDetailsContent');

    if (match.isHandicapped && match.handicapDetails) {
      DOM.show('handicapInstructionsSection');
      DOM.setText('handicapDetailsContent', match.handicapDetails);
    } else {
      DOM.hide('handicapInstructionsSection');
    }
  },

  renderBettingSummary: () => {
    const totals = OddsCalculator.getTotals();
    const match = AppState.match;

    const betsA = AppState.bets.filter(b => b.player === 'A');
    const betsB = AppState.bets.filter(b => b.player === 'B');

    // Player A
    DOM.setText('playerABetLabel', `Total Bets on ${match.playerA}`);
    DOM.setText('displayTotalBetA', `$${totals.betA.toFixed(2)}`);
    DOM.setText('displayCountA', betsA.length);

    // Player B
    DOM.setText('playerBBetLabel', `Total Bets on ${match.playerB}`);
    DOM.setText('displayTotalBetB', `$${totals.betB.toFixed(2)}`);
    DOM.setText('displayCountB', betsB.length);
  },

  renderOdds: () => {
    const totals = OddsCalculator.getTotals();
    const match = AppState.match;

    DOM.setText('displayPlayerAOdds', match.playerA);
    DOM.setText('displayPlayerBOdds', match.playerB);
    DOM.setText('displayOddsA', totals.oddsA.toFixed(2));
    DOM.setText('displayOddsB', totals.oddsB.toFixed(2));
  },

  checkWinner: () => {
    const match = AppState.match;
    const scoreA = AppState.scores.playerA;
    const scoreB = AppState.scores.playerB;

    // Determine win condition based on match type
    let winnerPlayer = null;
    let winsRequired = 0;

    if (match.matchType === 'best-of') {
      winsRequired = Math.floor(match.matchValue / 2) + 1;
    } else if (match.matchType === 'race-to') {
      winsRequired = match.matchValue;
    }

    if (scoreA >= winsRequired) {
      winnerPlayer = 'A';
    } else if (scoreB >= winsRequired) {
      winnerPlayer = 'B';
    }

    DisplayRenderer.updateWinnerDisplay(winnerPlayer);
  },

  updateWinnerDisplay: (winnerPlayer) => {
    const winnerBanner = DOM.get('winnerBanner');
    const winnerText = DOM.get('winnerText');
    const playerASection = DOM.get('playerASection');
    const playerBSection = DOM.get('playerBSection');

    if (winnerPlayer) {
      const winnerName = winnerPlayer === 'A' ? AppState.match.playerA : AppState.match.playerB;
      winnerText.innerHTML = `<span class="winner-crown">👑</span> ${escapeHtml(winnerName)} WINS! <span class="winner-crown">👑</span>`;
      DOM.show('winnerBanner');

      // Add winner styling
      if (winnerPlayer === 'A') {
        if (playerASection) playerASection.classList.add('winner');
        if (playerBSection) playerBSection.classList.remove('winner');
      } else {
        if (playerBSection) playerBSection.classList.add('winner');
        if (playerASection) playerASection.classList.remove('winner');
      }
    } else {
      DOM.hide('winnerBanner');
      if (playerASection) playerASection.classList.remove('winner');
      if (playerBSection) playerBSection.classList.remove('winner');
    }
  }
};

// ==================== AUTO-REFRESH ====================

let refreshInterval = null;

function startAutoRefresh() {
  // Refresh at configured interval when match is active
  refreshInterval = setInterval(() => {
    if (AppState.match) {
      DisplayRenderer.renderAll();
    }
  }, CONFIG.DISPLAY_REFRESH_INTERVAL);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  DisplayRenderer.renderAll();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    DisplayRenderer.renderAll();
    startAutoRefresh();
  }
});

window.addEventListener('beforeunload', () => {
  stopAutoRefresh();
});
