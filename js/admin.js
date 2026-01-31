/**
 * Admin Panel Logic - 10-Ball Betting Odds Calculator
 */

// ==================== UI RENDERER ====================

const UIRenderer = {
  renderMatchesList: () => {
    const container = DOM.get('matchesList');
    if (!container) return;

    if (!AppState.match) {
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No matches created. Create one to get started.</p>';
      return;
    }

    const match = AppState.match;
    const formatLabel = OddsCalculator.getFormatLabel(match.matchType, match.matchValue);
    const statusBadgeColor = match.status === 'completed' ? '#10b981' : match.status === 'no-contest' ? '#f59e0b' : '#3b82f6';
    const statusText = match.status.charAt(0).toUpperCase() + match.status.slice(1);

    container.innerHTML = `
      <div class="match-item active">
        <div class="match-info">
          <strong>${escapeHtml(match.playerA)} vs ${escapeHtml(match.playerB)}</strong>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
            ${formatLabel} • House: ${match.houseCut}%
          </div>
          <div style="font-size: 0.8rem; margin-top: 6px;">
            <span style="display: inline-block; background: ${statusBadgeColor}; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
              ${statusText}
            </span>
          </div>
        </div>
        <div class="match-actions">
          <button class="btn btn-small btn-info" onclick="loadMatchToDisplay()">📺 Display</button>
          <button class="btn btn-small btn-primary" onclick="loadMatchToAdmin()">⚙️ Admin</button>
        </div>
      </div>
    `;
  },

  renderCurrentMatch: () => {
    if (!AppState.match) {
      DOM.hide('activeMatchSection');
      DOM.hide('bettingSection');
      DOM.hide('bettorsListCard');
      DOM.hide('summaryCard');
      // Enable create match button when no active match
      const createBtn = DOM.get('createMatchBtn');
      if (createBtn) {
        createBtn.disabled = false;
        createBtn.style.opacity = '1';
        createBtn.style.cursor = 'pointer';
      }
      return;
    }

    const match = AppState.match;
    const formatLabel = OddsCalculator.getFormatLabel(match.matchType, match.matchValue);
    const isMatchEnded = match.status === 'completed' || match.status === 'no-contest';

    DOM.setText('matchTitle', `${match.playerA} vs ${match.playerB}`);
    DOM.setText('matchFormat', formatLabel);
    
    // Update match status badge
    const statusEl = DOM.get('matchStatus');
    if (statusEl) {
      if (match.status === 'completed') {
        statusEl.textContent = 'Completed';
        statusEl.className = 'value status-badge status-completed';
      } else if (match.status === 'no-contest') {
        statusEl.textContent = 'No Contest';
        statusEl.className = 'value status-badge status-no-contest';
      } else {
        statusEl.textContent = 'Active';
        statusEl.className = 'value status-badge status-active';
      }
    }

    DOM.setText('playerAScoreName', match.playerA);
    DOM.setText('playerBScoreName', match.playerB);

    const select = DOM.get('playerChoice');
    if (select) {
      select.innerHTML = `
        <option value="A">${match.playerA}</option>
        <option value="B">${match.playerB}</option>
      `;
    }

    // Disable create match button when there's an active match
    const createBtn = DOM.get('createMatchBtn');
    if (createBtn) {
      createBtn.disabled = true;
      createBtn.style.opacity = '0.5';
      createBtn.style.cursor = 'not-allowed';
    }

    // Handle button states
    const finishBtn = DOM.get('finishBtn');
    const noContestBtn = DOM.get('noContestBtn');
    const deleteBtn = DOM.get('deleteBtn');
    const addBetBtn = DOM.get('addBetBtn');
    const scoreAMinus = DOM.get('scoreAMinus');
    const scoreAPlus = DOM.get('scoreAPlus');
    const scoreBMinus = DOM.get('scoreBMinus');
    const scoreBPlus = DOM.get('scoreBPlus');

    // Check if there's a winner
    let hasWinner = false;
    if (!isMatchEnded && AppState.match) {
      const scoreA = AppState.scores.playerA;
      const scoreB = AppState.scores.playerB;
      let winsRequired = 0;

      if (AppState.match.matchType === 'best-of') {
        winsRequired = Math.floor(AppState.match.matchValue / 2) + 1;
      } else if (AppState.match.matchType === 'race-to') {
        winsRequired = AppState.match.matchValue;
      }

      hasWinner = scoreA >= winsRequired || scoreB >= winsRequired;
    }

    if (isMatchEnded) {
      // Disable match control and betting buttons
      if (finishBtn) { finishBtn.disabled = true; finishBtn.style.opacity = '0.5'; finishBtn.style.cursor = 'not-allowed'; }
      if (noContestBtn) { noContestBtn.disabled = true; noContestBtn.style.opacity = '0.5'; noContestBtn.style.cursor = 'not-allowed'; noContestBtn.title = 'Cannot mark No Contest - match already completed'; }
      if (addBetBtn) { addBetBtn.disabled = true; addBetBtn.style.opacity = '0.5'; addBetBtn.style.cursor = 'not-allowed'; }
      if (scoreAMinus) { scoreAMinus.disabled = true; scoreAMinus.style.opacity = '0.5'; scoreAMinus.style.cursor = 'not-allowed'; }
      if (scoreAPlus) { scoreAPlus.disabled = true; scoreAPlus.style.opacity = '0.5'; scoreAPlus.style.cursor = 'not-allowed'; }
      if (scoreBMinus) { scoreBMinus.disabled = true; scoreBMinus.style.opacity = '0.5'; scoreBMinus.style.cursor = 'not-allowed'; }
      if (scoreBPlus) { scoreBPlus.disabled = true; scoreBPlus.style.opacity = '0.5'; scoreBPlus.style.cursor = 'not-allowed'; }
      // Keep delete and load buttons enabled
      if (deleteBtn) { deleteBtn.disabled = false; deleteBtn.style.opacity = '1'; deleteBtn.style.cursor = 'pointer'; }
    } else {
      // Show Finish button and disable it if no winner
      if (finishBtn) { 
        finishBtn.style.display = 'block';
        finishBtn.disabled = !hasWinner; 
        finishBtn.style.opacity = hasWinner ? '1' : '0.5'; 
        finishBtn.style.cursor = hasWinner ? 'pointer' : 'not-allowed';
        finishBtn.title = hasWinner ? 'Click to finish match and declare winner' : 'Need a winner to finish the match';
      }
      
      // Disable No Contest if there's a winner
      if (noContestBtn) { 
        noContestBtn.disabled = hasWinner; 
        noContestBtn.style.opacity = hasWinner ? '0.5' : '1'; 
        noContestBtn.style.cursor = hasWinner ? 'not-allowed' : 'pointer';
        noContestBtn.title = hasWinner ? 'Winner detected - use Finish button to complete match' : 'Mark as No Contest';
      }
      
      // Enable all other buttons for active match
      if (addBetBtn) { addBetBtn.disabled = false; addBetBtn.style.opacity = '1'; addBetBtn.style.cursor = 'pointer'; }
      if (scoreAMinus) { scoreAMinus.disabled = false; scoreAMinus.style.opacity = '1'; scoreAMinus.style.cursor = 'pointer'; }
      if (scoreAPlus) { scoreAPlus.disabled = false; scoreAPlus.style.opacity = '1'; scoreAPlus.style.cursor = 'pointer'; }
      if (scoreBMinus) { scoreBMinus.disabled = false; scoreBMinus.style.opacity = '1'; scoreBMinus.style.cursor = 'pointer'; }
      if (scoreBPlus) { scoreBPlus.disabled = false; scoreBPlus.style.opacity = '1'; scoreBPlus.style.cursor = 'pointer'; }
      if (deleteBtn) { deleteBtn.disabled = false; deleteBtn.style.opacity = '1'; deleteBtn.style.cursor = 'pointer'; }
    }

    DOM.show('activeMatchSection');
    DOM.show('bettingSection');
    UIRenderer.updateScores();
    UIRenderer.updateBetsTable();
  },

  updateScores: () => {
    DOM.setText('scoreA', AppState.scores.playerA);
    DOM.setText('scoreB', AppState.scores.playerB);
  },

  updateBetsTable: () => {
    const bettorsContainer = DOM.get('bettorsListContent');
    if (!bettorsContainer) return;

    const totals = OddsCalculator.getTotals();
    const isMatchEnded = AppState.match && (AppState.match.status === 'completed' || AppState.match.status === 'no-contest');

    if (AppState.bets.length === 0) {
      DOM.hide('bettorsListCard');
      DOM.hide('summaryCard');
      return;
    }

    DOM.show('bettorsListCard');
    DOM.show('summaryCard');

    // Render bettors list
    let bettorsHTML = '';
    AppState.bets.forEach((bet, index) => {
      const playerName = bet.player === 'A' ? AppState.match.playerA : AppState.match.playerB;
      const odds = bet.player === 'A' ? totals.oddsA : totals.oddsB;
      const payout = bet.amount * odds;
      
      bettorsHTML += `
        <div class="bettor-row">
          <div class="bettor-name-action">
            <div class="bettor-name">${escapeHtml(bet.bettor)}</div>
            <button class="btn-delete-bettor" onclick="removeBet(${index})" title="Remove bet">✕</button>
          </div>
          <div class="bettor-details">
            <div class="bettor-detail-item">
              <span class="bettor-detail-label">Bet Value:</span>
              <span class="bettor-detail-value">$${bet.amount.toFixed(2)}</span>
            </div>
            <div class="bettor-detail-item">
              <span class="bettor-detail-label">Possible Payout:</span>
              <span class="bettor-detail-value">$${payout.toFixed(2)}</span>
            </div>
            <div class="bettor-detail-item">
              <span class="bettor-detail-label">Odds:</span>
              <span class="bettor-detail-value">${odds.toFixed(2)}</span>
            </div>
            <div class="bettor-detail-item">
              <span class="bettor-detail-label">Voted For:</span>
              <span class="bettor-detail-value">${escapeHtml(playerName)}</span>
            </div>
          </div>
        </div>
      `;
    });

    bettorsContainer.innerHTML = bettorsHTML;

    // Update summary cards
    DOM.setText('grossPool', `$${totals.gross.toFixed(2)}`);
    DOM.setText('houseCutPercent', `${AppState.match.houseCut}%`);
    DOM.setText('houseIncome', `$${totals.houseAmount.toFixed(2)}`);

    // Update payout scenarios
    const payoutA = OddsCalculator.getPayoutInfo('A');
    const payoutB = OddsCalculator.getPayoutInfo('B');
    
    const marginA = totals.gross > 0 ? (payoutA.housePayout / totals.gross * 100) : 0;
    DOM.setText('scenarioWinner1', `${AppState.match.playerA} Wins`);
    DOM.setText('scenario1Payout', `$${payoutA.totalPayout.toFixed(2)}`);
    DOM.setText('scenario1House', `$${payoutA.housePayout.toFixed(2)}`);
    DOM.setText('scenario1Margin', `${marginA.toFixed(1)}%`);

    const marginB = totals.gross > 0 ? (payoutB.housePayout / totals.gross * 100) : 0;
    DOM.setText('scenarioWinner2', `${AppState.match.playerB} Wins`);
    DOM.setText('scenario2Payout', `$${payoutB.totalPayout.toFixed(2)}`);
    DOM.setText('scenario2House', `$${payoutB.housePayout.toFixed(2)}`);
    DOM.setText('scenario2Margin', `${marginB.toFixed(1)}%`);
  },

  renderAll: () => {
    UIRenderer.renderCurrentMatch();
  }
};

// ==================== CORE FUNCTIONS ====================

function updateMatchValueLabel() {
  const matchType = DOM.getValue('modalMatchType');
  const label = DOM.get('matchValueLabel');
  if (label) {
    label.innerText = matchType === 'best-of' ? 'Games/Wins' : 'Games to Win';
  }
}

// ==================== MODAL FUNCTIONS ====================

function openCreateMatchModal() {
  const modal = DOM.get('createMatchModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeCreateMatchModal() {
  const modal = DOM.get('createMatchModal');
  if (modal) {
    modal.style.display = 'none';
  }
  // Clear form
  DOM.clear('modalPlayerA');
  DOM.clear('modalPlayerB');
  DOM.clear('modalMatchValue');
  DOM.clear('modalHouseCut');
  DOM.clear('modalHandicapDetails');
  DOM.get('modalMatchType').value = 'best-of';
  DOM.get('modalIsHandicapped').checked = false;
  DOM.get('modalHandicapDetailsGroup').style.display = 'none';
  const playerAPhotoInput = DOM.get('modalPlayerAPhoto');
  const playerBPhotoInput = DOM.get('modalPlayerBPhoto');
  if (playerAPhotoInput) playerAPhotoInput.value = '';
  if (playerBPhotoInput) playerBPhotoInput.value = '';
}

function submitCreateMatch() {
  const playerA = DOM.getValue('modalPlayerA');
  const playerB = DOM.getValue('modalPlayerB');
  const houseCut = parseFloat(DOM.getValue('modalHouseCut')) || CONFIG.DEFAULT_HOUSE_CUT;
  const matchType = DOM.getValue('modalMatchType');
  const matchValue = parseInt(DOM.getValue('modalMatchValue')) || CONFIG.DEFAULT_MATCH_VALUE;
  const isHandicapped = DOM.get('modalIsHandicapped').checked;
  const handicapDetails = DOM.getValue('modalHandicapDetails');

  // Validation
  if (!playerA) {
    alert('Please enter Player A name');
    return;
  }

  if (!playerB) {
    alert('Please enter Player B name');
    return;
  }

  if (playerA.toLowerCase() === playerB.toLowerCase()) {
    alert('Players must have different names');
    return;
  }

  if (isNaN(houseCut) || houseCut < CONFIG.MIN_HOUSE_CUT || houseCut > CONFIG.MAX_HOUSE_CUT) {
    alert('House cut must be between 0 and 100');
    return;
  }

  if (matchValue < 1) {
    alert('Match value must be at least 1');
    return;
  }

  // Validate Best Of format - must be odd number greater than 1
  if (matchType === 'best-of') {
    if (matchValue <= 1 || matchValue % 2 === 0) {
      alert('Best Of format must use an odd number greater than 1 (3, 5, 7, 9, etc.)');
      return;
    }
  }

  // Read player photos asynchronously
  const playerAPhotoInput = DOM.get('modalPlayerAPhoto');
  const playerBPhotoInput = DOM.get('modalPlayerBPhoto');
  let playerAPhoto = null;
  let playerBPhoto = null;
  let photosLoaded = 0;
  let totalPhotos = 0;

  // Count photos to load
  if (playerAPhotoInput.files && playerAPhotoInput.files[0]) totalPhotos++;
  if (playerBPhotoInput.files && playerBPhotoInput.files[0]) totalPhotos++;

  // If no photos, create match immediately
  if (totalPhotos === 0) {
    createMatchWithPhotos(playerA, playerB, houseCut, matchType, matchValue, isHandicapped, handicapDetails, null, null);
    return;
  }

  // Read player A photo
  if (playerAPhotoInput.files && playerAPhotoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      playerAPhoto = e.target.result;
      photosLoaded++;
      if (photosLoaded === totalPhotos) {
        createMatchWithPhotos(playerA, playerB, houseCut, matchType, matchValue, isHandicapped, handicapDetails, playerAPhoto, playerBPhoto);
      }
    };
    reader.readAsDataURL(playerAPhotoInput.files[0]);
  }

  // Read player B photo
  if (playerBPhotoInput.files && playerBPhotoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      playerBPhoto = e.target.result;
      photosLoaded++;
      if (photosLoaded === totalPhotos) {
        createMatchWithPhotos(playerA, playerB, houseCut, matchType, matchValue, isHandicapped, handicapDetails, playerAPhoto, playerBPhoto);
      }
    };
    reader.readAsDataURL(playerBPhotoInput.files[0]);
  }
}

function createMatchWithPhotos(playerA, playerB, houseCut, matchType, matchValue, isHandicapped, handicapDetails, playerAPhoto, playerBPhoto) {
  // Create match
  AppState.match = AppState.createMatch(playerA, playerB, houseCut, matchType, matchValue);
  AppState.match.isHandicapped = isHandicapped;
  AppState.match.handicapDetails = handicapDetails;
  AppState.match.playerAPhoto = playerAPhoto;
  AppState.match.playerBPhoto = playerBPhoto;
  
  AppState.bets = [];
  AppState.scores = { playerA: 0, playerB: 0 };

  // Save and render
  Storage.save();
  UIRenderer.renderAll();

  // Close modal
  closeCreateMatchModal();
}

function completeMatch() {
  if (!AppState.match) return;

  if (!confirm(`Are you sure you want to finish the match "${AppState.match.playerA} vs ${AppState.match.playerB}"?`)) {
    return;
  }

  // Mark match as completed
  AppState.match.status = 'completed';
  AppState.match.completedAt = new Date().toISOString();
  
  // Save match to history
  saveMatchToExcel();
  
  // Save state and refresh display (don't reset)
  Storage.save();
  UIRenderer.renderAll();

  alert('✓ Match completed and winner declared! Click "📥 Export" to download Excel file.');
}

function markNoContest() {
  if (!AppState.match) return;

  if (!confirm(`Mark "${AppState.match.playerA} vs ${AppState.match.playerB}" as No Contest?`)) {
    return;
  }

  // Mark as no contest
  AppState.match.status = 'no-contest';
  AppState.match.completedAt = new Date().toISOString();
  
  // Save match to history
  saveMatchToExcel();
  
  // Save state and refresh display (don't reset)
  Storage.save();
  UIRenderer.renderAll();

  alert('✓ Match marked as No Contest! Click "📥 Export" to download Excel file.');
}

function loadMatchToDisplay() {
  if (!AppState.match) return;
  goToDisplay();
}

function loadMatchToAdmin() {
  if (!AppState.match) return;
  // Match is already loaded in admin, just refresh rendering
  UIRenderer.renderAll();
}

function loadMatch(matchId) {
  // Load match by ID (in this case, since we only support one active match)
  UIRenderer.renderAll();
}

function deleteMatch() {
  if (!AppState.match) return;

  if (!confirm(`Are you sure you want to delete the match "${AppState.match.playerA} vs ${AppState.match.playerB}"? This cannot be undone.`)) {
    return;
  }

  AppState.reset();
  Storage.clear();
  UIRenderer.renderAll();
}

function updateScore(player, change) {
  if (!AppState.match) return;

  const newScore = Math.max(0, AppState.scores[player === 'A' ? 'playerA' : 'playerB'] + change);
  AppState.scores[player === 'A' ? 'playerA' : 'playerB'] = newScore;

  Storage.save();
  UIRenderer.updateScores();
}

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

  if (bettorName.length < CONFIG.MIN_BETTOR_NAME_LENGTH) {
    alert(`Bettor name must be at least ${CONFIG.MIN_BETTOR_NAME_LENGTH} characters`);
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert('Bet amount must be a positive number');
    return;
  }

  // Add bet
  AppState.bets.push(AppState.addBet(bettorName, player, amount));

  // Clear inputs
  DOM.clear('bettorName');
  DOM.clear('betAmount');

  // Save and render
  Storage.save();
  UIRenderer.updateBetsTable();
}

function removeBet(index) {
  if (index >= 0 && index < AppState.bets.length) {
    AppState.bets.splice(index, 1);
    Storage.save();
    UIRenderer.updateBetsTable();
  }
}

function resetAllBets() {
  if (!confirm('Are you sure you want to clear all bets? This cannot be undone.')) {
    return;
  }

  AppState.bets = [];
  Storage.save();
  UIRenderer.updateBetsTable();
}

function saveMatchToExcel() {
  if (!AppState.match) return;

  const match = AppState.match;
  const totals = OddsCalculator.getTotals();
  const formatLabel = OddsCalculator.getFormatLabel(match.matchType, match.matchValue);

  // Only save completed matches to gross total (exclude no-contest)
  const shouldIncludeInGross = match.status === 'completed';

  // Detailed bets data with UID
  const matchDetailData = AppState.bets.map((bet, index) => {
    const odds = bet.player === 'A' ? totals.oddsA : totals.oddsB;
    const payout = bet.amount * odds;
    
    return {
      'UID': `${match.id}-${index + 1}`,
      'Bettor': bet.bettor,
      'Player': bet.player === 'A' ? match.playerA : match.playerB,
      'Bet Amount': `$${bet.amount.toFixed(2)}`,
      'Odds': odds.toFixed(2),
      'Potential Payout': `$${payout.toFixed(2)}`,
      'House Cut %': `${match.houseCut}%`,
      'Status': match.status,
      'Handicapped': match.isHandicapped ? 'Yes' : 'No'
    };
  });

  // Create workbook or open existing
  let wb;

  try {
    // Try to load existing workbook from localStorage
    const existingData = localStorage.getItem('oddCalculatorHistoryFile');
    if (existingData) {
      const binaryString = atob(existingData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      wb = XLSX.read(bytes, { type: 'array' });
    } else {
      wb = XLSX.utils.book_new();
    }
  } catch (e) {
    wb = XLSX.utils.book_new();
  }

  // Calculate totals from all existing match sheets
  let totalGrossIncome = 0;
  let completedMatchCount = 0;
  let noContestCount = 0;

  if (wb.SheetNames) {
    wb.SheetNames.forEach(sheetName => {
      if (sheetName !== 'Summary') {
        try {
          const sheetData = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
          // Get first row which contains match summary
          if (sheetData && sheetData.length > 0) {
            const firstRow = sheetData[0];
            if (firstRow['Status'] === 'completed') {
              completedMatchCount++;
              // Extract gross amount from first row or calculate
              if (firstRow['Total Amount of Bet']) {
                const amount = parseFloat(firstRow['Total Amount of Bet'].replace(/[$,]/g, ''));
                if (!isNaN(amount)) totalGrossIncome += amount;
              }
            } else if (firstRow['Status'] === 'no-contest') {
              noContestCount++;
            }
          }
        } catch (e) {
          console.log('Error reading sheet:', sheetName);
        }
      }
    });
  }

  // If this is a completed match, add its gross to total
  if (shouldIncludeInGross) {
    totalGrossIncome += totals.gross;
    completedMatchCount += 1;
  } else if (match.status === 'no-contest') {
    noContestCount += 1;
  }

  // Create or update summary sheet
  const summaryData = [{
    'Total Gross Income': `$${totalGrossIncome.toFixed(2)}`,
    'Completed Matches': completedMatchCount,
    'No Contest Matches': noContestCount,
    'Date Updated': new Date().toLocaleString()
  }];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  
  // Remove existing Summary sheet if present
  const summaryIndex = wb.SheetNames.indexOf('Summary');
  if (summaryIndex > -1) {
    wb.SheetNames.splice(summaryIndex, 1);
    delete wb.Sheets['Summary'];
  }

  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary', 0);

  // Add new match sheet if it has bets
  if (AppState.bets.length > 0) {
    const sheetName = `${match.playerA.substring(0, 3)} vs ${match.playerB.substring(0, 3)} - ${new Date().toLocaleDateString()}`;
    const matchSheet = XLSX.utils.json_to_sheet(matchDetailData);
    
    // Remove existing sheet if present to avoid duplicates
    const existingIndex = wb.SheetNames.indexOf(sheetName);
    if (existingIndex > -1) {
      wb.SheetNames.splice(existingIndex, 1);
      delete wb.Sheets[sheetName];
    }

    XLSX.utils.book_append_sheet(wb, matchSheet, sheetName);
  }

  // Save file
  const filename = `10ball_betting_history_${new Date().getFullYear()}.xlsx`;
  XLSX.writeFile(wb, filename);

  // Also save to localStorage for persistence
  try {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const binaryString = '';
    for (let i = 0; i < wbout.length; i++) {
      binaryString += String.fromCharCode(wbout.charCodeAt(i) & 0xff);
    }
    localStorage.setItem('oddCalculatorHistoryFile', btoa(binaryString));
  } catch (e) {
    console.log('Could not save to localStorage:', e);
  }
}

// ==================== FILE SYSTEM MANAGEMENT ====================

// Global variable to store the matches folder handle
let matchesFolderHandle = null;
let folderInitialized = false;

// Try to restore folder handle from IndexedDB
async function restoreMatchesFolderHandle() {
  try {
    if (typeof window.getMatchesFolderHandle === 'function') {
      const handle = await window.getMatchesFolderHandle();
      if (handle) {
        matchesFolderHandle = handle;
        return true;
      }
    }
  } catch (error) {
    console.log('Could not restore folder handle:', error);
  }
  return false;
}

// Initialize matches folder (request permission once on first export)
async function initializeMatchesFolder() {
  if (folderInitialized) return matchesFolderHandle ? true : false;
  if (matchesFolderHandle) return true;

  // Try to restore previously granted access
  const restored = await restoreMatchesFolderHandle();
  if (restored) {
    folderInitialized = true;
    return true;
  }

  try {
    // Request folder access - start in documents
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      id: 'odd-calculator-matches',
      startIn: 'documents'
    });
    
    matchesFolderHandle = handle;
    folderInitialized = true;
    
    // Store folder name for reference
    try {
      const name = handle.name;
      localStorage.setItem('matchesFolderName', name);
      console.log(`✓ Folder "${name}" selected for exports`);
    } catch (e) {
      console.log('Folder handle stored in memory');
    }
    
    return true;
  } catch (error) {
    console.error('Folder access denied or cancelled:', error);
    folderInitialized = true;
    return false;
  }
}

// Request permission to access matches folder (manual button)
async function setupMatchesFolder() {
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      id: 'odd-calculator-matches',
      startIn: 'documents'
    });
    
    matchesFolderHandle = handle;
    folderInitialized = true;
    
    // Store folder name for reference
    try {
      const name = handle.name;
      localStorage.setItem('matchesFolderName', name);
      alert(`✓ Folder "${name}" selected!\nExcel files will save here automatically.`);
    } catch (e) {
      alert(`✓ Matches folder selected!\nExcel files will save here automatically.`);
    }
    
    return true;
  } catch (error) {
    console.error('Error selecting folder:', error);
    alert('Folder selection cancelled.');
    return false;
  }
}

// Save file to matches folder
async function saveFileToMatchesFolder(filename, blob) {
  if (!matchesFolderHandle) {
    return false;
  }

  try {
    const fileHandle = await matchesFolderHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    
    console.log(`✓ File saved to matches folder: ${filename}`);
    return true;
  } catch (error) {
    console.error('Error saving to matches folder:', error);
    return false;
  }
}

// ==================== EXPORT FUNCTIONS ====================

function exportCurrentMatch() {
  if (!AppState.match || AppState.bets.length === 0) {
    alert('No data to export');
    return;
  }

  const match = AppState.match;
  const totals = OddsCalculator.getTotals();
  const formatLabel = OddsCalculator.getFormatLabel(match.matchType, match.matchValue);

  // Create workbook for individual match export
  const wb = XLSX.utils.book_new();

  // Determine winner if match is completed
  let winner = null;
  let statusDisplay = 'Active';
  
  if (match.status === 'completed') {
    statusDisplay = 'Completed';
    const scoreA = AppState.scores.playerA;
    const scoreB = AppState.scores.playerB;
    if (scoreA > scoreB) {
      winner = match.playerA;
    } else if (scoreB > scoreA) {
      winner = match.playerB;
    }
  } else if (match.status === 'no-contest') {
    statusDisplay = 'No Contest';
  }

  // 1. Match Details Sheet
  const matchDetails = [{
    'Player A': match.playerA,
    'Player B': match.playerB,
    'Format': formatLabel,
    'House Cut': `${match.houseCut}%`,
    'Handicapped': match.isHandicapped ? 'Yes' : 'No',
    'Match ID': match.id,
    'Date': new Date().toLocaleString(),
    'Status': statusDisplay,
    'Winner': winner || 'N/A',
    'Final Score A': AppState.scores.playerA,
    'Final Score B': AppState.scores.playerB
  }];
  const detailsSheet = XLSX.utils.json_to_sheet(matchDetails);
  XLSX.utils.book_append_sheet(wb, detailsSheet, 'Match Details');

  // 2. Betting Summary Sheet (Totals separated)
  const summaryData = [
    { 'Category': 'Total Amount of Bets', 'Amount': `$${totals.gross.toFixed(2)}` },
    { 'Category': `Total Bets on ${match.playerA}`, 'Amount': `$${totals.betA.toFixed(2)}` },
    { 'Category': `Total Bets on ${match.playerB}`, 'Amount': `$${totals.betB.toFixed(2)}` },
    { 'Category': 'House Cut %', 'Amount': `${match.houseCut}%` },
    { 'Category': 'House Cut Amount', 'Amount': `$${totals.houseAmount.toFixed(2)}` },
    { 'Category': 'Status', 'Amount': statusDisplay },
    { 'Category': 'Winner', 'Amount': winner || 'Pending' }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Betting Summary');

  // 3. Detailed Bets Sheet (Separate sheet with just the bets)
  const betsData = AppState.bets.map((bet, index) => {
    const odds = bet.player === 'A' ? totals.oddsA : totals.oddsB;
    const payout = bet.amount * odds;
    return {
      '#': index + 1,
      'Bettor': bet.bettor,
      'Bet On': bet.player === 'A' ? match.playerA : match.playerB,
      'Bet Amount': `$${bet.amount.toFixed(2)}`,
      'Odds': odds.toFixed(2),
      'Possible Payout': `$${payout.toFixed(2)}`,
      'House Cut %': `${match.houseCut}%`,
      'Match Status': statusDisplay,
      'Winner': winner || 'Pending'
    };
  });

  const betsSheet = XLSX.utils.json_to_sheet(betsData);
  XLSX.utils.book_append_sheet(wb, betsSheet, 'Bets');

  // Create descriptive filename: PlayerA_vs_PlayerB_MMDDYYYY.xlsx
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const sanitizedPlayerA = match.playerA.replace(/[^a-zA-Z0-9]/g, '');
  const sanitizedPlayerB = match.playerB.replace(/[^a-zA-Z0-9]/g, '');
  const filename = `${sanitizedPlayerA}_vs_${sanitizedPlayerB}_${month}${day}${year}.xlsx`;

  // Convert workbook to blob
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };
  const blob = new Blob([s2ab(wbout)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Try to save to matches folder, fallback to browser download
  if (matchesFolderHandle) {
    saveFileToMatchesFolder(filename, blob)
      .then(success => {
        if (success) {
          alert(`✓ Match exported!\nFile: ${filename}\nLocation: matches folder`);
        } else {
          // Fallback to browser download
          XLSX.writeFile(wb, filename);
          alert(`File downloaded: ${filename}`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        XLSX.writeFile(wb, filename);
        alert(`File downloaded: ${filename}`);
      });
  } else {
    // No folder selected, use browser download
    XLSX.writeFile(wb, filename);
    alert(`File downloaded: ${filename}\n\nTo save to matches folder:\n1. Click "Select Matches Folder" button\n2. Choose/create "matches" folder\n3. Export again`);
  }
}

function exportToExcel() {
  if (!AppState.match || AppState.bets.length === 0) {
    alert('No data to export');
    return;
  }

  const match = AppState.match;
  const totals = OddsCalculator.getTotals();
  const formatLabel = OddsCalculator.getFormatLabel(match.matchType, match.matchValue);

  // Bets data
  const betsData = AppState.bets.map((bet, index) => {
    const odds = bet.player === 'A' ? totals.oddsA : totals.oddsB;
    const payout = bet.amount * odds;
    return {
      'UID': `${match.id}-${index + 1}`,
      'Bettor': bet.bettor,
      'Player': bet.player === 'A' ? match.playerA : match.playerB,
      'Bet Amount': `$${bet.amount.toFixed(2)}`,
      'Odds': odds.toFixed(2),
      'Potential Payout': `$${payout.toFixed(2)}`,
      'House Cut %': `${match.houseCut}%`,
      'Handicapped': match.isHandicapped ? 'Yes' : 'No'
    };
  });

  // Summary data
  const summaryData = [
    { 'Metric': 'Total Amount of Bet', 'Amount': `$${totals.gross.toFixed(2)}` },
    { 'Metric': 'Total on Player A', 'Amount': `$${totals.betA.toFixed(2)}` },
    { 'Metric': 'Total on Player B', 'Amount': `$${totals.betB.toFixed(2)}` },
    { 'Metric': 'House Cut %', 'Amount': `${match.houseCut}%` },
    { 'Metric': 'House Cut Amount', 'Amount': `$${totals.houseAmount.toFixed(2)}` }
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'SUMMARY');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(betsData), 'BETS');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `10ball_betting_${timestamp}.xlsx`;

  XLSX.writeFile(wb, filename);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  UIRenderer.renderAll();
});
