const gameState = {
  money: 400,
  debt: 0,
  debtLimitBase: 1000,
  currentBet: 10,
  difficultyKey: "normal",
  luckLevel: 0,
  multLevel: 0,
  effectLevel: 0,
  contractLevel: 0,
  shieldLevel: 0,
  royalLevel: 0,
  secondChanceLevel: 0,
  secondChanceTokens: 0,
  secondChanceArmed: false,
  greedLevel: 0,
  symbolLockLevel: 0,
  symbolLockArmed: false,
  symbolLockReel: 0,
  wildGeneratorLevel: 0,
  debtRestructureLevel: 0,
  restructureSpinsLeft: 0,
  bloodDebtLevel: 0,
  spins: 0,
  peakDebt: 0,
  spinsInBlock: 0,
  feeLevel: 0,
  needsFeePayment: false,
  bestNetWorth: 400,
  isGameOver: false,
  isSpinning: false,
  skipSpinRequested: false,
  devilActive: false,
  runStarted: false,
  wonAt100: false,
};

const SYMBOLS = [
  { name: "Cherry", icon: "🍒", value: 1.3, weight: 25 },
  { name: "Lemon", icon: "🍋", value: 1.0, weight: 24 },
  { name: "Orange", icon: "🍊", value: 1.15, weight: 22 },
  { name: "Plum", icon: "🍇", value: 1.55, weight: 16 },
  { name: "Bell", icon: "🔔", value: 2.7, weight: 9 },
  { name: "BAR", icon: "🅱️", value: 4.4, weight: 6 },
  { name: "Seven", icon: "7️⃣", value: 7.6, weight: 3 },
];

const WILD_SYMBOL = { name: "Wild", icon: "🃏", value: 6.2, weight: 0, isWild: true };

const DIFFICULTIES = [
  { key: "noob", label: "Noob", startMoney: 1100, debtLimit: 2600, baseInterest: 0.04, feeBase: 28, feeGrowth: 1.16, payoutScale: 1.32, devilChance: 0.05 },
  { key: "easy", label: "Easy", startMoney: 900, debtLimit: 2200, baseInterest: 0.05, feeBase: 36, feeGrowth: 1.21, payoutScale: 1.22, devilChance: 0.06 },
  { key: "casual", label: "Casual", startMoney: 760, debtLimit: 1900, baseInterest: 0.065, feeBase: 48, feeGrowth: 1.27, payoutScale: 1.12, devilChance: 0.08 },
  { key: "normal", label: "Normal", startMoney: 620, debtLimit: 1550, baseInterest: 0.085, feeBase: 64, feeGrowth: 1.35, payoutScale: 1.03, devilChance: 0.1 },
  { key: "hard", label: "Hard", startMoney: 520, debtLimit: 1300, baseInterest: 0.1, feeBase: 80, feeGrowth: 1.45, payoutScale: 0.97, devilChance: 0.12 },
  { key: "expert", label: "Expert", startMoney: 450, debtLimit: 1120, baseInterest: 0.115, feeBase: 98, feeGrowth: 1.55, payoutScale: 0.92, devilChance: 0.14 },
  { key: "master", label: "Master", startMoney: 380, debtLimit: 980, baseInterest: 0.13, feeBase: 120, feeGrowth: 1.67, payoutScale: 0.87, devilChance: 0.16 },
  { key: "nightmare", label: "Nightmare", startMoney: 320, debtLimit: 840, baseInterest: 0.15, feeBase: 145, feeGrowth: 1.82, payoutScale: 0.81, devilChance: 0.18 },
  { key: "insane", label: "Insane", startMoney: 260, debtLimit: 700, baseInterest: 0.17, feeBase: 175, feeGrowth: 1.98, payoutScale: 0.74, devilChance: 0.2 },
  { key: "hell", label: "Hell", startMoney: 220, debtLimit: 560, baseInterest: 0.19, feeBase: 210, feeGrowth: 2.12, payoutScale: 0.68, devilChance: 0.22 },
];

const DIFFICULTY_MAP = Object.fromEntries(DIFFICULTIES.map((d) => [d.key, d]));

const reels = [document.getElementById("reel1"), document.getElementById("reel2"), document.getElementById("reel3")];

const el = {
  money: document.getElementById("moneyValue"),
  debt: document.getElementById("debtValue"),
  debtLimit: document.getElementById("debtLimitValue"),
  interest: document.getElementById("interestValue"),
  best: document.getElementById("bestValue"),
  spinsLeft: document.getElementById("spinsLeftValue"),
  tableFee: document.getElementById("tableFeeValue"),
  log: document.getElementById("eventLog"),
  spinBtn: document.getElementById("spinBtn"),
  skipAnimBtn: document.getElementById("skipAnimBtn"),
  payFeeBtn: document.getElementById("payFeeBtn"),
  repayBtn: document.getElementById("repayBtn"),
  restartBtn: document.getElementById("restartBtn"),
  autoSkipCheck: document.getElementById("autoSkipCheck"),
  showKeybindsCheck: document.getElementById("showKeybindsCheck"),
  betInput: document.getElementById("betInput"),
  betRange: document.getElementById("betRange"),
  difficultyBadge: document.getElementById("difficultyBadge"),
  difficultyInfo: document.getElementById("difficultyInfo"),
  difficultyModal: document.getElementById("difficultyModal"),
  difficultySelectModal: document.getElementById("difficultySelectModal"),
  difficultyModalInfo: document.getElementById("difficultyModalInfo"),
  startRunBtn: document.getElementById("startRunBtn"),
  payoutBody: document.getElementById("payoutBody"),
  luckLevel: document.getElementById("luckLevel"),
  multLevel: document.getElementById("multLevel"),
  effectLevel: document.getElementById("effectLevel"),
  contractLevel: document.getElementById("contractLevel"),
  shieldLevel: document.getElementById("shieldLevel"),
  royalLevel: document.getElementById("royalLevel"),
  luckCost: document.getElementById("luckCost"),
  multCost: document.getElementById("multCost"),
  effectCost: document.getElementById("effectCost"),
  contractCost: document.getElementById("contractCost"),
  shieldCost: document.getElementById("shieldCost"),
  royalCost: document.getElementById("royalCost"),
  luckBonusValue: document.getElementById("luckBonusValue"),
  multBonusValue: document.getElementById("multBonusValue"),
  effectDoubleChance: document.getElementById("effectDoubleChance"),
  effectSurgeChance: document.getElementById("effectSurgeChance"),
  effectRefundChance: document.getElementById("effectRefundChance"),
  contractPowerBonus: document.getElementById("contractPowerBonus"),
  contractInterestPenalty: document.getElementById("contractInterestPenalty"),
  shieldLimitBonus: document.getElementById("shieldLimitBonus"),
  shieldInterestReduction: document.getElementById("shieldInterestReduction"),
  royalPayoutBonus: document.getElementById("royalPayoutBonus"),
  royalJackpotChance: document.getElementById("royalJackpotChance"),
  buyLuckBtn: document.getElementById("buyLuckBtn"),
  buyMultBtn: document.getElementById("buyMultBtn"),
  buyEffectBtn: document.getElementById("buyEffectBtn"),
  buyContractBtn: document.getElementById("buyContractBtn"),
  buyShieldBtn: document.getElementById("buyShieldBtn"),
  buyRoyalBtn: document.getElementById("buyRoyalBtn"),
  shieldReq: document.getElementById("shieldReq"),
  royalReq: document.getElementById("royalReq"),
  shieldCard: document.getElementById("shieldCard"),
  royalCard: document.getElementById("royalCard"),
  devilEvent: document.getElementById("devilEvent"),
  coinFlip: document.getElementById("coinFlip"),
  coinResult: document.getElementById("coinResult"),
  acceptDealBtn: document.getElementById("acceptDealBtn"),
  declineDealBtn: document.getElementById("declineDealBtn"),
  loseModal: document.getElementById("loseModal"),
  loseReason: document.getElementById("loseReason"),
  loseRestartBtn: document.getElementById("loseRestartBtn"),
  loseDifficultyBtn: document.getElementById("loseDifficultyBtn"),
  winModal: document.getElementById("winModal"),
  continueAfterWinBtn: document.getElementById("continueAfterWinBtn"),
  winDifficultyBtn: document.getElementById("winDifficultyBtn"),
  inventoryModal: document.getElementById("inventoryModal"),
  openInventoryBtn: document.getElementById("openInventoryBtn"),
  closeInventoryBtn: document.getElementById("closeInventoryBtn"),
  secondChanceLevel: document.getElementById("secondChanceLevel"),
  secondChanceCost: document.getElementById("secondChanceCost"),
  secondChanceTokens: document.getElementById("secondChanceTokens"),
  buySecondChanceBtn: document.getElementById("buySecondChanceBtn"),
  useSecondChanceBtn: document.getElementById("useSecondChanceBtn"),
  greedLevel: document.getElementById("greedLevel"),
  greedCost: document.getElementById("greedCost"),
  greedPayoutBonus: document.getElementById("greedPayoutBonus"),
  greedRiskPenalty: document.getElementById("greedRiskPenalty"),
  buyGreedBtn: document.getElementById("buyGreedBtn"),
  lockLevel: document.getElementById("lockLevel"),
  lockCost: document.getElementById("lockCost"),
  lockReelSelect: document.getElementById("lockReelSelect"),
  armLockBtn: document.getElementById("armLockBtn"),
  buyLockBtn: document.getElementById("buyLockBtn"),
  lockStatus: document.getElementById("lockStatus"),
  wildLevel: document.getElementById("wildLevel"),
  wildCost: document.getElementById("wildCost"),
  wildChanceValue: document.getElementById("wildChanceValue"),
  buyWildBtn: document.getElementById("buyWildBtn"),
  restructureLevel: document.getElementById("restructureLevel"),
  restructureCost: document.getElementById("restructureCost"),
  restructureActive: document.getElementById("restructureActive"),
  buyRestructureBtn: document.getElementById("buyRestructureBtn"),
  bloodLevel: document.getElementById("bloodLevel"),
  bloodCost: document.getElementById("bloodCost"),
  bloodLuckBonus: document.getElementById("bloodLuckBonus"),
  bloodDrainValue: document.getElementById("bloodDrainValue"),
  buyBloodBtn: document.getElementById("buyBloodBtn"),
};

function fmt(amount) {
  return `$${Math.max(0, Math.round(amount)).toLocaleString()}`;
}

function addKeybindChips() {
  document.querySelectorAll("[data-keybind]").forEach((btn) => {
    if (btn.querySelector(".keybind-chip")) {
      return;
    }
    const chip = document.createElement("span");
    chip.className = "keybind-chip";
    chip.textContent = btn.getAttribute("data-keybind");
    btn.appendChild(chip);
  });
}

function setShowKeybinds(show) {
  document.body.classList.toggle("show-keybinds", !!show);
}

function clickIfEnabled(button) {
  if (button && !button.disabled) {
    button.click();
  }
}

function isTextInputTarget(target) {
  if (!target) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function currentDifficulty() {
  return DIFFICULTY_MAP[gameState.difficultyKey] || DIFFICULTY_MAP.normal;
}

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function clampBet(value) {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(10000, Math.max(1, Math.round(value)));
}

function getContractPower() {
  return 1 + gameState.contractLevel * 0.25;
}

function getDebtInterestRate() {
  const greedPenalty = gameState.greedLevel * 0.008;
  const restructureReduction = gameState.restructureSpinsLeft > 0 ? 0.03 + gameState.debtRestructureLevel * 0.005 : 0;
  const rate = currentDifficulty().baseInterest + gameState.contractLevel * 0.03 + greedPenalty - gameState.shieldLevel * 0.015 - restructureReduction;
  return Math.max(0.03, rate);
}

function getDebtLimit() {
  const limit = gameState.debtLimitBase + gameState.effectLevel * 140 + gameState.shieldLevel * 240 - gameState.contractLevel * 25;
  return Math.max(200, Math.round(limit));
}

function getNetWorth() {
  return gameState.money - gameState.debt;
}

function getTableFee() {
  const d = currentDifficulty();
  const greedFeeGrowth = d.feeGrowth + gameState.greedLevel * 0.04;
  return Math.round(d.feeBase * Math.pow(greedFeeGrowth, gameState.feeLevel));
}

function spinsLeftInBlock() {
  return gameState.needsFeePayment ? 0 : 10 - gameState.spinsInBlock;
}

function getCost(base, level, growth) {
  return Math.round(base * Math.pow(growth, level) * (1 + gameState.contractLevel * 0.11));
}

function luckCost() {
  return getCost(60, gameState.luckLevel, 1.72);
}

function multCost() {
  return getCost(90, gameState.multLevel, 1.85);
}

function effectCost() {
  return getCost(140, gameState.effectLevel, 2.05);
}

function contractCost() {
  return Math.round(180 * Math.pow(2.2, gameState.contractLevel));
}

function shieldCost() {
  return getCost(220, gameState.shieldLevel, 2.1);
}

function royalCost() {
  return getCost(300, gameState.royalLevel, 2.35);
}

function secondChanceCost() {
  return getCost(110, gameState.secondChanceLevel, 1.8);
}

function greedCost() {
  return getCost(140, gameState.greedLevel, 1.95);
}

function symbolLockCost() {
  return getCost(120, gameState.symbolLockLevel, 1.85);
}

function wildCost() {
  return getCost(160, gameState.wildGeneratorLevel, 2.0);
}

function restructureCost() {
  return getCost(180, gameState.debtRestructureLevel, 2.05);
}

function bloodCost() {
  return getCost(170, gameState.bloodDebtLevel, 1.95);
}

function isShieldUnlocked() {
  return gameState.peakDebt >= 400 || gameState.spins >= 18;
}

function isRoyalUnlocked() {
  return gameState.bestNetWorth >= 2500 || (gameState.luckLevel >= 3 && gameState.multLevel >= 3);
}

function chooseSymbol() {
  const power = getContractPower();
  const adjusted = SYMBOLS.map((s) => {
    const bloodLuck = gameState.bloodDebtLevel * 0.07;
    const luckWeightBoost = s.value > 2 ? gameState.luckLevel * 0.1 * power + bloodLuck : -gameState.luckLevel * 0.03;
    return { ...s, w: Math.max(1, s.weight * (1 + luckWeightBoost)) };
  });
  const total = adjusted.reduce((sum, s) => sum + s.w, 0);
  let roll = Math.random() * total;
  for (const symbol of adjusted) {
    roll -= symbol.w;
    if (roll <= 0) {
      return symbol;
    }
  }
  return adjusted[adjusted.length - 1];
}

function setReels(result) {
  reels.forEach((reel, i) => {
    reel.textContent = result[i].icon;
    reel.setAttribute("title", result[i].name);
  });
}

function getBaseMultPower() {
  return 1 + gameState.multLevel * 0.2 * getContractPower();
}

function getDeterministicPayout(baseAmount) {
  const greedMult = 1 + gameState.greedLevel * 0.08;
  let payout = baseAmount * getBaseMultPower() * currentDifficulty().payoutScale * greedMult;
  if (gameState.royalLevel > 0 && payout > 0) {
    payout *= 1 + gameState.royalLevel * 0.18;
  }
  return Math.round(payout);
}

function renderPayoutTable() {
  if (!el.payoutBody) {
    return;
  }
  const rows = [];
  for (const sym of SYMBOLS) {
    const tripleBase = gameState.currentBet * sym.value * 5.2;
    const pairBase = gameState.currentBet * sym.value * 1.85;
    rows.push({ combo: `${sym.icon} ${sym.icon} ${sym.icon} (${sym.name} x3)`, payout: getDeterministicPayout(tripleBase) });
    rows.push({ combo: `${sym.icon} ${sym.icon} Any (${sym.name} pair)`, payout: getDeterministicPayout(pairBase) });
  }
  rows.push({ combo: "High-value mixed line bonus", payout: getDeterministicPayout(gameState.currentBet * 1.35) });
  el.payoutBody.innerHTML = rows.map((r) => `<tr><td>${r.combo}</td><td>${fmt(r.payout)}</td></tr>`).join("");
}

function animateSpin(result) {
  return new Promise((resolve) => {
    if (el.autoSkipCheck?.checked) {
      setReels(result);
      resolve();
      return;
    }
    let finished = false;
    gameState.isSpinning = true;
    gameState.skipSpinRequested = false;
    updateUI();

    const intervals = reels.map((reel, idx) => setInterval(() => {
      reel.textContent = randomSymbol().icon;
      reel.removeAttribute("title");
    }, 75 + idx * 20));

    const finish = () => {
      if (finished) {
        return;
      }
      finished = true;
      intervals.forEach((id) => clearInterval(id));
      setReels(result);
      gameState.isSpinning = false;
      gameState.skipSpinRequested = false;
      updateUI();
      resolve();
    };

    const timer = setTimeout(finish, 1200);
    const watcher = setInterval(() => {
      if (gameState.skipSpinRequested) {
        clearTimeout(timer);
        clearInterval(watcher);
        finish();
      }
    }, 30);
  });
}

function borrowIfNeeded(amount) {
  if (gameState.money >= amount) {
    return true;
  }
  const need = amount - gameState.money;
  gameState.debt += need;
  // Top up to exact amount so caller can subtract once without creating negative money.
  gameState.money = amount;
  gameState.peakDebt = Math.max(gameState.peakDebt, gameState.debt);
  return gameState.debt < 10000;
}

function applyDebtInterest() {
  if (gameState.debt <= 0) {
    return 0;
  }
  const before = gameState.debt;
  gameState.debt = Math.round(gameState.debt * (1 + getDebtInterestRate()));
  gameState.peakDebt = Math.max(gameState.peakDebt, gameState.debt);
  return gameState.debt - before;
}

function evaluateSpin(result) {
  const [a, b, c] = result;
  const bet = gameState.currentBet;
  let base = 0;
  let line = "No match.";
  const match = (x, y) => x.name === y.name || x.isWild || y.isWild;

  if (match(a, b) && match(b, c) && match(a, c)) {
    const best = [a, b, c].reduce((m, s) => (s.value > m.value ? s : m), a);
    base = bet * best.value * 5.2;
    line = `TRIPLE ${best.name}!`;
  } else if (match(a, b) || match(b, c) || match(a, c)) {
    const pair = match(a, b) ? (a.isWild ? b : a) : match(b, c) ? (b.isWild ? c : b) : (a.isWild ? c : a);
    base = bet * pair.value * 1.85;
    line = `Pair of ${pair.name}.`;
  } else if (a.value + b.value + c.value > 10.5) {
    base = bet * 1.35;
    line = "High-value mixed line bonus.";
  }

  let payout = getDeterministicPayout(base);
  let bonusLine = "";
  const effectPower = getContractPower();
  if (gameState.effectLevel >= 1 && payout > 0 && Math.random() < 0.09 * effectPower) {
    payout *= 2;
    bonusLine = " Chaos: Double payout.";
  }
  if (gameState.effectLevel >= 2 && Math.random() < 0.065 * effectPower) {
    payout += Math.max(100, Math.round(bet * 2));
    bonusLine += " Jackpot surge activated.";
  }
  if (gameState.effectLevel >= 3 && Math.random() < 0.12 * effectPower) {
    gameState.money += bet;
    bonusLine += " Free spin refund.";
  }
  if (gameState.royalLevel > 0 && payout > 0 && Math.random() < 0.035 * gameState.royalLevel) {
    payout += Math.max(200, bet * 5);
    bonusLine += " Royal jackpot burst.";
  }
  return { payout: Math.round(payout), line: `${line}${bonusLine}`.trim() };
}

function hideAllOverlays() {
  el.devilEvent.classList.add("hidden");
  el.difficultyModal.classList.add("hidden");
  el.loseModal.classList.add("hidden");
  el.winModal.classList.add("hidden");
  el.inventoryModal.classList.add("hidden");
}

function showDifficultyModal() {
  hideAllOverlays();
  el.difficultySelectModal.value = gameState.difficultyKey;
  const d = currentDifficulty();
  el.difficultyModalInfo.textContent = `${d.label}: Start ${fmt(d.startMoney)}, Interest ${Math.round(d.baseInterest * 100)}%, Payout x${d.payoutScale.toFixed(2)}`;
  el.difficultyModal.classList.remove("hidden");
}

function showLoseModal(reason) {
  hideAllOverlays();
  el.loseReason.textContent = reason;
  el.loseModal.classList.remove("hidden");
}

function showWinModal() {
  hideAllOverlays();
  el.winModal.classList.remove("hidden");
}

function updateDifficultyInfo() {
  const d = currentDifficulty();
  el.difficultyBadge.textContent = d.label;
  el.difficultyInfo.textContent = `${d.label}: Start ${fmt(d.startMoney)}, Base Interest ${Math.round(d.baseInterest * 100)}%, Payout x${d.payoutScale.toFixed(2)}`;
}

function setBet(value) {
  gameState.currentBet = clampBet(value);
  el.betInput.value = String(gameState.currentBet);
  el.betRange.value = String(gameState.currentBet);
  const key = el.spinBtn.getAttribute("data-keybind");
  el.spinBtn.innerHTML = `<span class="btn-label">Spin (${fmt(gameState.currentBet)})</span>`;
  if (key) {
    const chip = document.createElement("span");
    chip.className = "keybind-chip";
    chip.textContent = key;
    el.spinBtn.appendChild(chip);
  }
  renderPayoutTable();
}

function checkLossConditions(reason) {
  if (gameState.debt >= 10000) {
    endRun("Debt reached 10000.");
    return true;
  }
  return false;
}

function getDisplayedSymbolForReel(reelIndex) {
  const reel = reels[reelIndex];
  const title = reel.getAttribute("title");
  if (title) {
    if (title === WILD_SYMBOL.name) {
      return WILD_SYMBOL;
    }
    return SYMBOLS.find((s) => s.name === title) || chooseSymbol();
  }
  return chooseSymbol();
}

function buildSpinResult() {
  const result = [chooseSymbol(), chooseSymbol(), chooseSymbol()];
  if (gameState.symbolLockArmed && gameState.symbolLockLevel > 0) {
    const idx = Math.min(2, Math.max(0, gameState.symbolLockReel));
    result[idx] = getDisplayedSymbolForReel(idx);
    gameState.symbolLockArmed = false;
  }

  if (gameState.wildGeneratorLevel > 0) {
    const wildChance = Math.min(0.45, gameState.wildGeneratorLevel * 0.05);
    if (Math.random() < wildChance) {
      const idx = Math.floor(Math.random() * result.length);
      result[idx] = WILD_SYMBOL;
    }
  }
  return result;
}

function updateUI() {
  el.money.textContent = fmt(gameState.money);
  el.debt.textContent = fmt(gameState.debt);
  el.debtLimit.textContent = fmt(getDebtLimit());
  el.interest.textContent = `${Math.round(getDebtInterestRate() * 100)}%`;
  el.best.textContent = fmt(gameState.bestNetWorth);
  el.spinsLeft.textContent = String(spinsLeftInBlock());
  el.tableFee.textContent = gameState.needsFeePayment ? fmt(getTableFee()) : "$0";
  updateDifficultyInfo();

  el.luckLevel.textContent = String(gameState.luckLevel);
  el.multLevel.textContent = String(gameState.multLevel);
  el.effectLevel.textContent = String(gameState.effectLevel);
  el.contractLevel.textContent = String(gameState.contractLevel);
  el.shieldLevel.textContent = String(gameState.shieldLevel);
  el.royalLevel.textContent = String(gameState.royalLevel);
  el.luckCost.textContent = fmt(luckCost());
  el.multCost.textContent = fmt(multCost());
  el.effectCost.textContent = fmt(effectCost());
  el.contractCost.textContent = fmt(contractCost());
  el.shieldCost.textContent = fmt(shieldCost());
  el.royalCost.textContent = fmt(royalCost());
  el.luckBonusValue.textContent = String(Math.round(gameState.luckLevel * 10 * getContractPower()));
  el.multBonusValue.textContent = getBaseMultPower().toFixed(2);
  el.effectDoubleChance.textContent = `${(gameState.effectLevel >= 1 ? 9 * getContractPower() : 0).toFixed(1)}%`;
  el.effectSurgeChance.textContent = `${(gameState.effectLevel >= 2 ? 6.5 * getContractPower() : 0).toFixed(1)}%`;
  el.effectRefundChance.textContent = `${(gameState.effectLevel >= 3 ? 12 * getContractPower() : 0).toFixed(1)}%`;
  el.contractPowerBonus.textContent = String(Math.round(gameState.contractLevel * 25));
  el.contractInterestPenalty.textContent = String(Math.round(gameState.contractLevel * 3));
  el.shieldLimitBonus.textContent = String(gameState.shieldLevel * 240);
  el.shieldInterestReduction.textContent = String((gameState.shieldLevel * 1.5).toFixed(1));
  el.royalPayoutBonus.textContent = String(gameState.royalLevel * 18);
  el.royalJackpotChance.textContent = (gameState.royalLevel * 3.5).toFixed(1);
  el.secondChanceLevel.textContent = String(gameState.secondChanceLevel);
  el.secondChanceCost.textContent = fmt(secondChanceCost());
  el.secondChanceTokens.textContent = String(gameState.secondChanceTokens);
  el.greedLevel.textContent = String(gameState.greedLevel);
  el.greedCost.textContent = fmt(greedCost());
  el.greedPayoutBonus.textContent = String(gameState.greedLevel * 8);
  el.greedRiskPenalty.textContent = (gameState.greedLevel * 0.8).toFixed(1);
  el.lockLevel.textContent = String(gameState.symbolLockLevel);
  el.lockCost.textContent = fmt(symbolLockCost());
  el.lockStatus.textContent = gameState.symbolLockArmed ? `Armed on Slot ${gameState.symbolLockReel + 1}` : "Not armed";
  el.wildLevel.textContent = String(gameState.wildGeneratorLevel);
  el.wildCost.textContent = fmt(wildCost());
  el.wildChanceValue.textContent = (Math.min(45, gameState.wildGeneratorLevel * 5)).toFixed(1);
  el.restructureLevel.textContent = String(gameState.debtRestructureLevel);
  el.restructureCost.textContent = fmt(restructureCost());
  el.restructureActive.textContent = String(gameState.restructureSpinsLeft);
  el.bloodLevel.textContent = String(gameState.bloodDebtLevel);
  el.bloodCost.textContent = fmt(bloodCost());
  el.bloodLuckBonus.textContent = (gameState.bloodDebtLevel * 7).toFixed(1);
  el.bloodDrainValue.textContent = (gameState.bloodDebtLevel * 6).toFixed(1);

  const overlayActive = gameState.devilActive || !el.difficultyModal.classList.contains("hidden") || !el.loseModal.classList.contains("hidden") || !el.winModal.classList.contains("hidden");
  const lockedByState = !gameState.runStarted || gameState.isGameOver || gameState.isSpinning || overlayActive;
  el.repayBtn.disabled = !(gameState.money >= 50 && gameState.debt > 0) || lockedByState;
  el.spinBtn.disabled = lockedByState || gameState.needsFeePayment;
  el.skipAnimBtn.disabled = !gameState.isSpinning;
  el.payFeeBtn.disabled = lockedByState || !gameState.needsFeePayment;
  el.buyLuckBtn.disabled = lockedByState;
  el.buyMultBtn.disabled = lockedByState;
  el.buyEffectBtn.disabled = lockedByState;
  el.buyContractBtn.disabled = lockedByState;
  el.buySecondChanceBtn.disabled = lockedByState;
  el.useSecondChanceBtn.disabled = lockedByState || gameState.secondChanceTokens <= 0;
  el.buyGreedBtn.disabled = lockedByState;
  el.armLockBtn.disabled = lockedByState || gameState.symbolLockLevel <= 0;
  el.buyLockBtn.disabled = lockedByState;
  el.buyWildBtn.disabled = lockedByState;
  el.buyRestructureBtn.disabled = lockedByState;
  el.buyBloodBtn.disabled = lockedByState;
  el.openInventoryBtn.disabled = !gameState.runStarted || gameState.isSpinning || gameState.devilActive;

  const shieldUnlocked = isShieldUnlocked();
  const royalUnlocked = isRoyalUnlocked();
  el.buyShieldBtn.disabled = lockedByState || !shieldUnlocked;
  el.buyRoyalBtn.disabled = lockedByState || !royalUnlocked;
  el.shieldCard.classList.toggle("locked", !shieldUnlocked);
  el.royalCard.classList.toggle("locked", !royalUnlocked);
  el.shieldReq.textContent = shieldUnlocked ? "Unlocked" : `Locked: Need debt $400 or 18 spins. Peak debt: ${fmt(gameState.peakDebt)}, spins: ${gameState.spins}.`;
  el.royalReq.textContent = royalUnlocked ? "Unlocked" : `Locked: Need net worth $2500 or Luck 3 + Mult 3. Best: ${fmt(gameState.bestNetWorth)}.`;
}

function maybeTriggerDevilDeal() {
  if (gameState.isGameOver || gameState.devilActive || gameState.needsFeePayment || !gameState.runStarted) {
    return;
  }
  if (gameState.spins < 4) {
    return;
  }
  if (Math.random() < currentDifficulty().devilChance) {
    gameState.devilActive = true;
    hideAllOverlays();
    el.coinFlip.classList.remove("flipping");
    el.coinFlip.textContent = "🪙";
    el.coinResult.textContent = "Deal available: heads doubles your money, tails wipes it to $0.";
    el.devilEvent.classList.remove("hidden");
    el.log.textContent = "The devil appears with a 50/50 coin flip offer.";
    updateUI();
  }
}

async function takeDevilDeal() {
  if (!gameState.devilActive || gameState.isGameOver) {
    return;
  }
  el.acceptDealBtn.disabled = true;
  el.declineDealBtn.disabled = true;
  el.coinResult.textContent = "Flipping...";
  el.coinFlip.classList.add("flipping");
  await new Promise((r) => setTimeout(r, 1300));
  el.coinFlip.classList.remove("flipping");
  const win = Math.random() < 0.5;
  if (win) {
    gameState.money *= 2;
    el.coinFlip.textContent = "🟡";
    el.coinResult.textContent = `WIN: Money doubled to ${fmt(gameState.money)}.`;
    el.log.textContent = "Devil coin flip won. Money doubled.";
  } else {
    gameState.money = 0;
    el.coinFlip.textContent = "⚫";
    el.coinResult.textContent = "LOSE: Money dropped to $0.";
    el.log.textContent = "Devil coin flip lost. Money wiped.";
  }
  if (getNetWorth() > gameState.bestNetWorth) {
    gameState.bestNetWorth = Math.round(getNetWorth());
  }
  await new Promise((r) => setTimeout(r, 900));
  gameState.devilActive = false;
  el.acceptDealBtn.disabled = false;
  el.declineDealBtn.disabled = false;
  hideAllOverlays();
  if (!checkLossConditions("Devil deal pushed debt over limit.")) {
    updateUI();
  }
}

function declineDevilDeal() {
  if (!gameState.devilActive) {
    return;
  }
  gameState.devilActive = false;
  hideAllOverlays();
  el.log.textContent = "Devil deal declined.";
  updateUI();
}

function endRun(reason) {
  gameState.isGameOver = true;
  gameState.isSpinning = false;
  gameState.skipSpinRequested = false;
  gameState.devilActive = false;
  showLoseModal(reason);
  el.log.textContent = `Run ended: ${reason} Final best net worth: ${fmt(gameState.bestNetWorth)}.`;
  updateUI();
}

function applyDifficultyFromModal() {
  gameState.difficultyKey = el.difficultySelectModal.value;
}

function startRun(resetMessage) {
  const d = currentDifficulty();
  gameState.money = d.startMoney;
  gameState.debt = 0;
  gameState.debtLimitBase = d.debtLimit;
  gameState.currentBet = 10;
  gameState.luckLevel = 0;
  gameState.multLevel = 0;
  gameState.effectLevel = 0;
  gameState.contractLevel = 0;
  gameState.shieldLevel = 0;
  gameState.royalLevel = 0;
  gameState.secondChanceLevel = 0;
  gameState.secondChanceTokens = 0;
  gameState.secondChanceArmed = false;
  gameState.greedLevel = 0;
  gameState.symbolLockLevel = 0;
  gameState.symbolLockArmed = false;
  gameState.symbolLockReel = 0;
  gameState.wildGeneratorLevel = 0;
  gameState.debtRestructureLevel = 0;
  gameState.restructureSpinsLeft = 0;
  gameState.bloodDebtLevel = 0;
  gameState.spins = 0;
  gameState.peakDebt = 0;
  gameState.spinsInBlock = 0;
  gameState.feeLevel = 0;
  gameState.needsFeePayment = false;
  gameState.bestNetWorth = d.startMoney;
  gameState.isGameOver = false;
  gameState.isSpinning = false;
  gameState.skipSpinRequested = false;
  gameState.devilActive = false;
  gameState.runStarted = true;
  gameState.wonAt100 = false;

  reels.forEach((reel) => {
    reel.textContent = "?";
    reel.removeAttribute("title");
  });
  hideAllOverlays();
  setBet(10);
  renderPayoutTable();
  el.log.textContent = resetMessage || `Run started on ${d.label}.`;
  updateUI();
}

async function spin() {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive) {
    return;
  }
  if (gameState.needsFeePayment) {
    el.log.textContent = `You must pay the table fee ${fmt(getTableFee())} to unlock the next 10 spins.`;
    updateUI();
    return;
  }

  const bet = gameState.currentBet;
  gameState.spins += 1;
  const canFundSpin = borrowIfNeeded(bet);
  if (!canFundSpin) {
    checkLossConditions("Debt exceeded limits before spin.");
    updateUI();
    return;
  }
  if (checkLossConditions("Debt exceeded limits before spin.")) {
    updateUI();
    return;
  }
  gameState.money -= bet;

  let result = buildSpinResult();
  await animateSpin(result);
  if (gameState.isGameOver) {
    return;
  }

  let outcome = evaluateSpin(result);
  if (outcome.payout <= 0 && gameState.secondChanceArmed && gameState.secondChanceTokens > 0) {
    gameState.secondChanceTokens -= 1;
    gameState.secondChanceArmed = false;
    result = buildSpinResult();
    await animateSpin(result);
    outcome = evaluateSpin(result);
    el.log.textContent = "Second Chance triggered reroll.";
  }
  gameState.money += outcome.payout;
  const interestGain = applyDebtInterest();
  if (gameState.bloodDebtLevel > 0) {
    const bloodDrain = Math.round(gameState.currentBet * (gameState.bloodDebtLevel * 0.06));
    if (gameState.money >= bloodDrain) {
      gameState.money -= bloodDrain;
    } else {
      const need = bloodDrain - gameState.money;
      gameState.money = 0;
      gameState.debt += need;
      gameState.peakDebt = Math.max(gameState.peakDebt, gameState.debt);
    }
  }
  if (gameState.restructureSpinsLeft > 0) {
    gameState.restructureSpinsLeft -= 1;
  }
  if (getNetWorth() > gameState.bestNetWorth) {
    gameState.bestNetWorth = Math.round(getNetWorth());
  }
  if (checkLossConditions("Debt + interest crossed the limit.")) {
    updateUI();
    return;
  }

  gameState.spinsInBlock += 1;
  if (gameState.spinsInBlock >= 10) {
    gameState.spinsInBlock = 0;
    gameState.needsFeePayment = true;
    gameState.feeLevel += 1;
    if (gameState.secondChanceLevel > 0) {
      gameState.secondChanceTokens += gameState.secondChanceLevel;
    }
  }

  const resultText = result.map((s) => s.name).join(" | ");
  const payoutLine = outcome.payout > 0 ? `Payout ${fmt(outcome.payout)}.` : "No payout.";
  const interestLine = interestGain > 0 ? ` Interest charged: ${fmt(interestGain)}.` : "";
  const feeLine = gameState.needsFeePayment ? ` Table fee due: ${fmt(getTableFee())} before next 10 spins.` : "";
  el.log.textContent = `${resultText}. ${outcome.line} ${payoutLine}${interestLine}${feeLine}`;
  updateUI();

  if (!gameState.wonAt100 && gameState.spins >= 100) {
    gameState.wonAt100 = true;
    showWinModal();
    updateUI();
    return;
  }
  maybeTriggerDevilDeal();
}

function payTableFee() {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive) {
    return;
  }
  if (!gameState.needsFeePayment) {
    el.log.textContent = "No table fee is currently required.";
    return;
  }
  const fee = getTableFee();
  const canFundFee = borrowIfNeeded(fee);
  if (!canFundFee) {
    checkLossConditions("Could not cover the table fee.");
    updateUI();
    return;
  }
  if (checkLossConditions("Could not cover the table fee.")) {
    updateUI();
    return;
  }
  gameState.money -= fee;
  if (checkLossConditions("Table fee payment pushed debt too high.")) {
    updateUI();
    return;
  }
  gameState.needsFeePayment = false;
  el.log.textContent = `Table fee ${fmt(fee)} paid. Next 10 spins unlocked.`;
  updateUI();
}

function buyUpgrade(kind) {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive) {
    return;
  }
  let cost = 0;
  if (kind === "luck") {
    cost = luckCost();
  } else if (kind === "mult") {
    cost = multCost();
  } else if (kind === "effect") {
    cost = effectCost();
  } else if (kind === "shield") {
    if (!isShieldUnlocked()) {
      el.log.textContent = "Debt Shield is still locked.";
      return;
    }
    cost = shieldCost();
  } else if (kind === "royal") {
    if (!isRoyalUnlocked()) {
      el.log.textContent = "Royal Permit is still locked.";
      return;
    }
    cost = royalCost();
  } else {
    cost = contractCost();
  }
  if (gameState.money < cost) {
    el.log.textContent = "Not enough money for this upgrade.";
    return;
  }
  gameState.money -= cost;
  if (kind === "luck") {
    gameState.luckLevel += 1;
  } else if (kind === "mult") {
    gameState.multLevel += 1;
  } else if (kind === "effect") {
    gameState.effectLevel += 1;
  } else if (kind === "shield") {
    gameState.shieldLevel += 1;
  } else if (kind === "royal") {
    gameState.royalLevel += 1;
  } else {
    gameState.contractLevel += 1;
  }
  renderPayoutTable();
  el.log.textContent = "Upgrade purchased.";
  updateUI();
}

function buyShopItem(kind) {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive) {
    return;
  }
  let cost = 0;
  if (kind === "secondChance") {
    cost = secondChanceCost();
  } else if (kind === "greed") {
    cost = greedCost();
  } else if (kind === "lock") {
    cost = symbolLockCost();
  } else if (kind === "wild") {
    cost = wildCost();
  } else if (kind === "restructure") {
    cost = restructureCost();
  } else {
    cost = bloodCost();
  }
  if (gameState.money < cost) {
    el.log.textContent = "Not enough money for shop item.";
    return;
  }
  gameState.money -= cost;

  if (kind === "secondChance") {
    gameState.secondChanceLevel += 1;
    gameState.secondChanceTokens += 1;
    el.log.textContent = "Second Chance upgraded. You gained a reroll token.";
  } else if (kind === "greed") {
    gameState.greedLevel += 1;
    el.log.textContent = "Greed Engine upgraded. Payouts up, risk up.";
  } else if (kind === "lock") {
    gameState.symbolLockLevel += 1;
    el.log.textContent = "Symbol Lock upgraded. You can arm slot lock.";
  } else if (kind === "wild") {
    gameState.wildGeneratorLevel += 1;
    el.log.textContent = "Wild Generator upgraded.";
  } else if (kind === "restructure") {
    gameState.debtRestructureLevel += 1;
    const debtCut = Math.round(gameState.debt * (0.12 + gameState.debtRestructureLevel * 0.03));
    gameState.debt = Math.max(0, gameState.debt - debtCut);
    gameState.restructureSpinsLeft += 3;
    el.log.textContent = `Debt Restructuring activated. Debt reduced by ${fmt(debtCut)}.`;
  } else {
    gameState.bloodDebtLevel += 1;
    el.log.textContent = "Blood Debt upgraded. Luck rises, spin drain rises.";
  }

  renderPayoutTable();
  updateUI();
}

function armSymbolLock() {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive) {
    return;
  }
  if (gameState.symbolLockLevel <= 0) {
    el.log.textContent = "Buy Symbol Lock first.";
    return;
  }
  gameState.symbolLockReel = Number(el.lockReelSelect.value);
  gameState.symbolLockArmed = true;
  el.log.textContent = `Symbol Lock armed on Slot ${gameState.symbolLockReel + 1}.`;
  updateUI();
}

function useSecondChanceToken() {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive) {
    return;
  }
  if (gameState.secondChanceTokens <= 0) {
    el.log.textContent = "No Second Chance tokens available.";
    return;
  }
  gameState.secondChanceArmed = true;
  el.log.textContent = "Second Chance armed. Next no-win spin will reroll once.";
  updateUI();
}

function repayDebt() {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive || gameState.debt <= 0 || gameState.money < 50) {
    return;
  }
  const repay = Math.min(50, gameState.debt, gameState.money);
  gameState.money -= repay;
  gameState.debt -= repay;
  el.log.textContent = `Repaid ${fmt(repay)} debt.`;
  updateUI();
}

if (el.spinBtn) {
  el.spinBtn.addEventListener("click", spin);
  el.skipAnimBtn.addEventListener("click", () => {
    if (gameState.isSpinning) {
      gameState.skipSpinRequested = true;
    }
  });
  el.payFeeBtn.addEventListener("click", payTableFee);
  el.repayBtn.addEventListener("click", repayDebt);
  el.restartBtn.addEventListener("click", () => {
    if (gameState.isGameOver) {
      startRun(`Run restarted on ${currentDifficulty().label}.`);
    } else {
      el.log.textContent = "Restart is only available after losing. Difficulty is locked during runs.";
    }
  });

  el.buyLuckBtn.addEventListener("click", () => buyUpgrade("luck"));
  el.buyMultBtn.addEventListener("click", () => buyUpgrade("mult"));
  el.buyEffectBtn.addEventListener("click", () => buyUpgrade("effect"));
  el.buyContractBtn.addEventListener("click", () => buyUpgrade("contract"));
  el.buyShieldBtn.addEventListener("click", () => buyUpgrade("shield"));
  el.buyRoyalBtn.addEventListener("click", () => buyUpgrade("royal"));
  el.buySecondChanceBtn.addEventListener("click", () => buyShopItem("secondChance"));
  el.useSecondChanceBtn.addEventListener("click", useSecondChanceToken);
  el.buyGreedBtn.addEventListener("click", () => buyShopItem("greed"));
  el.buyLockBtn.addEventListener("click", () => buyShopItem("lock"));
  el.armLockBtn.addEventListener("click", armSymbolLock);
  el.buyWildBtn.addEventListener("click", () => buyShopItem("wild"));
  el.buyRestructureBtn.addEventListener("click", () => buyShopItem("restructure"));
  el.buyBloodBtn.addEventListener("click", () => buyShopItem("blood"));
  el.openInventoryBtn.addEventListener("click", () => {
    if (!gameState.runStarted || gameState.isSpinning || gameState.devilActive) {
      return;
    }
    hideAllOverlays();
    el.inventoryModal.classList.remove("hidden");
    updateUI();
  });
  el.closeInventoryBtn.addEventListener("click", () => {
    el.inventoryModal.classList.add("hidden");
    updateUI();
  });

  el.acceptDealBtn.addEventListener("click", takeDevilDeal);
  el.declineDealBtn.addEventListener("click", declineDevilDeal);

  el.startRunBtn.addEventListener("click", () => {
    applyDifficultyFromModal();
    startRun(`Run started on ${currentDifficulty().label}.`);
  });
  el.difficultySelectModal.addEventListener("change", () => {
    gameState.difficultyKey = el.difficultySelectModal.value;
    const d = currentDifficulty();
    el.difficultyModalInfo.textContent = `${d.label}: Start ${fmt(d.startMoney)}, Interest ${Math.round(d.baseInterest * 100)}%, Payout x${d.payoutScale.toFixed(2)}`;
  });

  el.loseRestartBtn.addEventListener("click", () => startRun(`Run restarted on ${currentDifficulty().label}.`));
  el.loseDifficultyBtn.addEventListener("click", () => showDifficultyModal());
  el.continueAfterWinBtn.addEventListener("click", () => {
    hideAllOverlays();
    el.log.textContent = "You chose to continue beyond 100 spins.";
    updateUI();
  });
  el.winDifficultyBtn.addEventListener("click", () => showDifficultyModal());

  el.betInput.addEventListener("input", () => setBet(Number(el.betInput.value)));
  el.betRange.addEventListener("input", () => setBet(Number(el.betRange.value)));
  el.showKeybindsCheck.addEventListener("change", () => setShowKeybinds(el.showKeybindsCheck.checked));
  document.addEventListener("keydown", (event) => {
    const key = event.key;
    const upper = key.length === 1 ? key.toUpperCase() : key;

    if (upper === "ESCAPE" && !el.inventoryModal.classList.contains("hidden")) {
      event.preventDefault();
      el.closeInventoryBtn.click();
      return;
    }

    if (isTextInputTarget(event.target)) {
      return;
    }

    if (!el.difficultyModal.classList.contains("hidden")) {
      if (upper === "ENTER") {
        event.preventDefault();
        clickIfEnabled(el.startRunBtn);
      }
      return;
    }
    if (!el.devilEvent.classList.contains("hidden")) {
      if (upper === "A") {
        event.preventDefault();
        clickIfEnabled(el.acceptDealBtn);
      } else if (upper === "D") {
        event.preventDefault();
        clickIfEnabled(el.declineDealBtn);
      }
      return;
    }
    if (!el.loseModal.classList.contains("hidden")) {
      if (upper === "R") {
        event.preventDefault();
        clickIfEnabled(el.loseRestartBtn);
      } else if (upper === "N") {
        event.preventDefault();
        clickIfEnabled(el.loseDifficultyBtn);
      }
      return;
    }
    if (!el.winModal.classList.contains("hidden")) {
      if (upper === "C") {
        event.preventDefault();
        clickIfEnabled(el.continueAfterWinBtn);
      } else if (upper === "N") {
        event.preventDefault();
        clickIfEnabled(el.winDifficultyBtn);
      }
      return;
    }

    if (!el.inventoryModal.classList.contains("hidden")) {
      const invMap = {
        "1": el.buyLuckBtn,
        "2": el.buyMultBtn,
        "3": el.buyEffectBtn,
        "4": el.buyContractBtn,
        "5": el.buyShieldBtn,
        "6": el.buyRoyalBtn,
        "7": el.buySecondChanceBtn,
        "8": el.buyGreedBtn,
        "9": el.buyLockBtn,
        "0": el.buyWildBtn,
        "-": el.buyRestructureBtn,
        "=": el.buyBloodBtn,
        "C": el.useSecondChanceBtn,
        "L": el.armLockBtn,
        "I": el.closeInventoryBtn,
      };
      const btn = invMap[upper];
      if (btn) {
        event.preventDefault();
        clickIfEnabled(btn);
      }
      return;
    }

    if (!gameState.runStarted || gameState.isGameOver) {
      return;
    }
    const runMap = {
      "S": el.spinBtn,
      "I": el.openInventoryBtn,
      "K": el.skipAnimBtn,
      "F": el.payFeeBtn,
      "P": el.repayBtn,
      "T": el.restartBtn,
    };
    const runBtn = runMap[upper];
    if (runBtn) {
      event.preventDefault();
      clickIfEnabled(runBtn);
    }
  });

  addKeybindChips();
  setShowKeybinds(false);
  setBet(10);
  renderPayoutTable();
  showDifficultyModal();
  updateUI();
}
