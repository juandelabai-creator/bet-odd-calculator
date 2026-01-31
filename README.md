# 🎱 10-Ball Betting Odds Calculator

A professional, responsive web application designed for calculating and managing real-time betting odds for 10-ball pool tournaments. This tool helps organizers track bets, calculate payouts, and manage house profits with ease.

## 📋 Table of Contents

- [Features](#features)
- [How to Run](#how-to-run)
- [File Structure](#file-structure)
- [How to Use](#how-to-use)
- [Technical Details](#technical-details)
- [Browser Compatibility](#browser-compatibility)

---

## ✨ Features

### Core Functionality
- **Real-time Odds Calculation** - Odds update instantly as bets are placed
- **Multi-player Support** - Manage 1-on-1 matches with dynamic player selection
- **Flexible House Cut** - Configure house percentage (0-100%)
- **Match Format Options** - Support for various 10-ball formats:
  - First to 5
  - First to 7
  - First to 9
  - Best of 11

### Betting Management
- **Add Unlimited Bets** - No limit on number of bets per match
- **Remove Bets** - Delete individual bets to correct mistakes
- **Real-time Payout Preview** - See potential payouts before match ends

### House Dashboard
- **Pool Analytics** - Track gross pool, net pool, and house profit
- **Payout Distribution** - View payouts for both possible match outcomes
- **House Profit Calculation** - Automatic calculation of house earnings
- **Export to Excel** - Download all betting data and analytics

### User Experience
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Intuitive Interface** - Clean, modern UI with clear sections
- **Form Validation** - Input validation to prevent errors
- **XSS Protection** - Escaped HTML to prevent security vulnerabilities

---

## 🚀 How to Run

### Method 1: Direct File Opening (Simplest)
1. Navigate to the project folder: `Jakebet_odd_cal`
2. Double-click `index.html` to open in your default browser
3. The app will load and be ready to use immediately

### Method 2: Local Server (Recommended)
For better compatibility and no potential security warnings:

#### Using Python 3
```bash
cd Jakebet_odd_cal
python -m http.server 8000
```
Then open http://localhost:8000 in your browser

#### Using Python 2
```bash
cd Jakebet_odd_cal
python -m SimpleHTTPServer 8000
```
Then open http://localhost:8000 in your browser

#### Using Node.js (http-server)
```bash
cd Jakebet_odd_cal
npx http-server
```
Then open the URL shown in terminal (usually http://localhost:8080)

---

## 📁 File Structure

```
Jakebet_odd_cal/
├── index.html          # Main HTML file with semantic structure
├── README.md           # This documentation file
├── css/
│   └── style.css       # Complete styling with responsive design
├── js/
│   └── app.js          # Main application logic and state management
└── assets/             # Folder for future images/icons
```

### Why This Structure?
- **Separation of Concerns**: HTML, CSS, and JS are separated for maintainability
- **Scalability**: Easy to add more CSS/JS files as app grows
- **Professional Organization**: Follows industry-standard web app structure
- **Easy Maintenance**: Clear file purposes and locations

---

## 📖 How to Use

### Step 1: Create a Match
1. Fill in **Player A Name** (e.g., "John")
2. Fill in **Player B Name** (e.g., "Mike")
3. Set **House Cut %** (default is 10%)
4. Select **Match Format** (e.g., "First to 7")
5. Click **Create / Reset Match**

The betting section will appear after match creation.

### Step 2: Place Bets
Once a match is created:

1. Enter **Bettor Name** (person placing the bet)
2. **Choose Player** - Select which player they're betting on
3. Enter **Bet Amount** (numeric value)
4. Click **Add Bet**

The odds update automatically as bets are added.

### Step 3: Monitor Odds
- **Real-time Odds Display** shows current payout odds for each player
- **Active Bets Table** shows all current bets with individual potential payouts
- Each bet can be removed by clicking the **✕ Remove** button

### Step 4: View House Dashboard
The dashboard shows:
- **Gross Pool**: Total amount bet
- **House Cut %**: Configured house percentage
- **House Profit**: Amount house keeps
- **Net Pool**: Amount paid back to winners
- **Payout Distribution**: Specific payouts for each possible outcome

### Step 5: Export Data (Optional)
Click **📥 Export to Excel** to download:
- Match information
- All placed bets with odds and payouts
- Summary analytics

### Step 6: Reset (Optional)
Click **🔄 Reset All** to clear all data and start a new match

---

## 🔧 Technical Details

### Architecture
The application uses a **modular state-based architecture**:

- **AppState**: Central state management (match info, bets array)
- **OddsCalculator**: Pure functions for odds and payout calculations
- **DOM**: Utility functions for DOM manipulation
- **UIRenderer**: Functions for rendering/updating UI elements

### Key Technologies
- **HTML5**: Semantic markup with proper accessibility
- **CSS3**: Modern CSS with CSS Grid, Flexbox, and CSS Variables
- **Vanilla JavaScript**: No dependencies (except SheetJS for Excel export)
- **SheetJS**: For Excel export functionality

### Calculations
1. **Gross Pool** = Sum of all bets
2. **House Amount** = Gross Pool × (House Cut % / 100)
3. **Net Pool** = Gross Pool - House Amount
4. **Individual Odds** = Net Pool / (Bets for that player)
5. **Potential Payout** = Bet Amount × Odds (rounded down)

### Security Features
- HTML escaping to prevent XSS attacks
- Input validation for all user inputs
- Type checking for numeric inputs

---

## 💻 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Fully Supported |
| Firefox | Latest | ✅ Fully Supported |
| Safari | Latest | ✅ Fully Supported |
| Edge | Latest | ✅ Fully Supported |
| IE 11 | - | ⚠️ Not Supported |

### Requirements
- Modern browser with ES6 support
- JavaScript enabled
- Local file access or HTTP server

---

## 📱 Responsive Design

The app is fully responsive and optimized for:
- 📱 **Mobile**: 320px - 480px
- 📱 **Tablet**: 480px - 768px
- 💻 **Desktop**: 768px+

---

## 🐛 Troubleshooting

### Excel Export Not Working
- Ensure JavaScript is enabled
- Check browser console for errors (F12)
- Try using a different browser

### Odds Showing as 0.00
- Ensure you've entered at least one bet
- Check that house cut is less than 100%

### Styling Not Applying
- Check that you're accessing the file correctly (not via file:// if possible)
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Use a local server instead of direct file opening

### Values Not Updating
- Ensure JavaScript is enabled
- Reload the page
- Try a different browser

---

## 🎯 Example Workflow

### Scenario: 10-Ball Tournament Match

**Setup:**
- Player A: "John Smith"
- Player B: "Maria Garcia"
- House Cut: 15%
- Format: First to 7

**Bets Placed:**
- Bettor 1 places $100 on John
- Bettor 2 places $80 on Maria
- Bettor 3 places $50 on John

**Calculations:**
- Gross Pool: $230
- House Profit: $34.50 (15% of $230)
- Net Pool: $195.50
- John's Odds: $195.50 / $150 = 1.30x
- Maria's Odds: $195.50 / $80 = 2.44x

**If John Wins:**
- Bettor 1: $100 × 1.30 = $130
- Bettor 3: $50 × 1.30 = $65
- Total Payout: $195
- House Profit: $35

---

## 📝 Notes

- All amounts are in your local currency (configure as needed)
- Payouts are rounded down to nearest cent
- Bets can be modified only by removal and re-entry
- Data is not saved between sessions (consider adding localStorage if needed)

---

## 🤝 Contributing

To improve this calculator:
1. Test with various bet combinations
2. Report any calculation discrepancies
3. Suggest new features

---

## 📄 License

This application is provided as-is for personal and professional use.

---

## 🎱 About

Created for 10-ball pool tournament organizers to streamline betting management and payout calculations.

**Last Updated:** January 2026
