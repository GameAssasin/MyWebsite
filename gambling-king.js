const gameState = {
  money: 300,
  debt: 0,
  debtLimitBase: 600,
  currentBet: 10,
  luckLevel: 0,
  multLevel: 0,
  effectLevel: 0,
  contractLevel: 0,
  shieldLevel: 0,
  royalLevel: 0,
  spins: 0,
  peakDebt: 0,
  bestNetWorth: 300,
  isGameOver: false,
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

const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3"),
];

const el = {
  money: document.getElementById("moneyValue"),
  debt: document.getElementById("debtValue"),
  debtLimit: document.getElementById("debtLimitValue"),
  interest: document.getElementById("interestValue"),
  best: document.getElementById("bestValue"),
  log: document.getElementById("eventLog"),
  spinBtn: document.getElementById("spinBtn"),
  repayBtn: document.getElementById("repayBtn"),
  restartBtn: document.getElementById("restartBtn"),
  betInput: document.getElementById("betInput"),
  betRange: document.getElementById("betRange"),
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
};

function fmt(amount) {
  return `$${Math.max(0, Math.round(amount)).toLocaleString()}`;
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
  const rate = 0.1 + gameState.contractLevel * 0.04 - gameState.shieldLevel * 0.01;
  return Math.max(0.03, rate);
}

function getDebtLimit() {
  const limit = gameState.debtLimitBase + gameState.effectLevel * 120 + gameState.shieldLevel * 220 - gameState.contractLevel * 45;
  return Math.max(200, Math.round(limit));
}

function getNetWorth() {
  return gameState.money - gameState.debt;
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

function isShieldUnlocked() {
  return gameState.peakDebt >= 400 || gameState.spins >= 18;
}

function isRoyalUnlocked() {
  return gameState.bestNetWorth >= 2500 || (gameState.luckLevel >= 3 && gameState.multLevel >= 3);
}

function chooseSymbol() {
  const power = getContractPower();
  const adjusted = SYMBOLS.map((s) => {
    const luckWeightBoost = s.value > 2 ? gameState.luckLevel * 0.1 * power : -gameState.luckLevel * 0.03;
    return {
      ...s,
      w: Math.max(1, s.weight * (1 + luckWeightBoost)),
    };
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

function borrowIfNeeded(amount) {
  if (gameState.money >= amount) {
    return true;
  }
  const need = amount - gameState.money;
  gameState.debt += need;
  gameState.money = 0;
  return gameState.debt <= getDebtLimit();
}

function applyDebtInterest() {
  if (gameState.debt <= 0) {
    return 0;
  }
  const before = gameState.debt;
  gameState.debt = Math.round(gameState.debt * (1 + getDebtInterestRate()));
  return gameState.debt - before;
}

function evaluateSpin(result) {
  const [a, b, c] = result;
  const bet = gameState.currentBet;
  let base = 0;
  let line = "No match.";

  if (a.name === b.name && b.name === c.name) {
    base = bet * a.value * 4.8;
    line = `TRIPLE ${a.name}!`;
  } else if (a.name === b.name || b.name === c.name || a.name === c.name) {
    const pair = a.name === b.name ? a : b.name === c.name ? b : a;
    base = bet * pair.value * 1.65;
    line = `Pair of ${pair.name}.`;
  } else if (a.value + b.value + c.value > 10.5) {
    base = bet * 1.25;
    line = "High-value mixed line bonus.";
  }

  const contractPower = getContractPower();
  const multPower = 1 + gameState.multLevel * 0.2 * contractPower;
  let payout = base * multPower;
  let bonusLine = "";

  const effectPower = contractPower;
  if (gameState.effectLevel >= 1 && payout > 0 && Math.random() < 0.08 * effectPower) {
    payout *= 2;
    bonusLine = " Chaos: Double payout.";
  }
  if (gameState.effectLevel >= 2 && Math.random() < 0.055 * effectPower) {
    payout += Math.max(100, Math.round(bet * 2));
    bonusLine += " Jackpot surge activated.";
  }
  if (gameState.effectLevel >= 3 && Math.random() < 0.1 * effectPower) {
    gameState.money += bet;
    bonusLine += " Free spin refund.";
  }
  if (gameState.royalLevel > 0 && payout > 0) {
    payout *= 1 + gameState.royalLevel * 0.18;
    if (Math.random() < 0.03 * gameState.royalLevel) {
      payout += Math.max(200, bet * 5);
      bonusLine += " Royal jackpot burst.";
    }
  }

  return {
    payout: Math.round(payout),
    line: `${line}${bonusLine}`.trim(),
  };
}

function endRun(reason) {
  gameState.isGameOver = true;
  el.log.textContent = `Run ended: ${reason} Final best net worth: ${fmt(gameState.bestNetWorth)}.`;
  el.spinBtn.disabled = true;
  el.buyLuckBtn.disabled = true;
  el.buyMultBtn.disabled = true;
  el.buyEffectBtn.disabled = true;
  el.buyContractBtn.disabled = true;
  el.buyShieldBtn.disabled = true;
  el.buyRoyalBtn.disabled = true;
}

function setBet(value) {
  gameState.currentBet = clampBet(value);
  el.betInput.value = String(gameState.currentBet);
  el.betRange.value = String(gameState.currentBet);
  el.spinBtn.textContent = `Spin (${fmt(gameState.currentBet)})`;
}

function updateUI() {
  if (!el.money) {
    return;
  }
  el.money.textContent = fmt(gameState.money);
  el.debt.textContent = fmt(gameState.debt);
  el.debtLimit.textContent = fmt(getDebtLimit());
  el.interest.textContent = `${Math.round(getDebtInterestRate() * 100)}%`;
  el.best.textContent = fmt(gameState.bestNetWorth);
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

  const canRepay = gameState.money >= 50 && gameState.debt > 0 && !gameState.isGameOver;
  el.repayBtn.disabled = !canRepay;
  el.spinBtn.disabled = gameState.isGameOver;

  const shieldUnlocked = isShieldUnlocked();
  const royalUnlocked = isRoyalUnlocked();
  const shieldLocked = !shieldUnlocked;
  const royalLocked = !royalUnlocked;
  el.buyShieldBtn.disabled = gameState.isGameOver || shieldLocked;
  el.buyRoyalBtn.disabled = gameState.isGameOver || royalLocked;
  el.shieldCard.classList.toggle("locked", shieldLocked);
  el.royalCard.classList.toggle("locked", royalLocked);
  el.shieldReq.textContent = shieldLocked ? `Locked: Need debt $400 or 18 spins. Current debt peak: ${fmt(gameState.peakDebt)}, spins: ${gameState.spins}.` : "Unlocked";
  el.royalReq.textContent = royalLocked ? `Locked: Need net worth $2500 or Luck 3 + Mult 3. Current best: ${fmt(gameState.bestNetWorth)}.` : "Unlocked";
}

function spin() {
  if (gameState.isGameOver) {
    return;
  }

  const bet = gameState.currentBet;
  gameState.spins += 1;
  const canPay = borrowIfNeeded(bet);
  if (!canPay) {
    endRun("Debt exceeded the maximum limit before the spin.");
    updateUI();
    return;
  }
  gameState.money -= bet;

  const result = [chooseSymbol(), chooseSymbol(), chooseSymbol()];
  reels.forEach((reel, i) => {
    reel.textContent = result[i].icon;
    reel.setAttribute("title", result[i].name);
  });

  const outcome = evaluateSpin(result);
  gameState.money += outcome.payout;
  const interestGain = applyDebtInterest();
  gameState.peakDebt = Math.max(gameState.peakDebt, gameState.debt);
  const netWorth = getNetWorth();
  if (netWorth > gameState.bestNetWorth) {
    gameState.bestNetWorth = Math.round(netWorth);
  }

  if (gameState.debt > getDebtLimit()) {
    endRun("Debt + interest crossed the limit.");
  } else {
    const resultText = result.map((s) => s.name).join(" | ");
    const payoutLine = outcome.payout > 0 ? `Payout ${fmt(outcome.payout)}.` : "No payout.";
    const interestLine = interestGain > 0 ? ` Interest charged: ${fmt(interestGain)}.` : "";
    el.log.textContent = `${resultText}. ${outcome.line} ${payoutLine}${interestLine}`;
  }
  updateUI();
}

function buyUpgrade(kind) {
  if (gameState.isGameOver) {
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
    el.log.textContent = "Lucky Charm upgraded. Better high-symbol odds.";
  } else if (kind === "mult") {
    gameState.multLevel += 1;
    el.log.textContent = "High Roller upgraded. Payout multiplier increased.";
  } else if (kind === "effect") {
    gameState.effectLevel += 1;
    el.log.textContent = "Chaos Engine upgraded. Stronger special effects unlocked.";
  } else if (kind === "shield") {
    gameState.shieldLevel += 1;
    el.log.textContent = "Debt Shield upgraded. Debt limit higher and interest lower.";
  } else if (kind === "royal") {
    gameState.royalLevel += 1;
    el.log.textContent = "Royal Permit upgraded. Premium payout power increased.";
  } else {
    gameState.contractLevel += 1;
    el.log.textContent = "Devil's Contract signed. Upgrades stronger, but debt pressure is worse.";
  }

  updateUI();
}

function repayDebt() {
  if (gameState.isGameOver || gameState.debt <= 0 || gameState.money < 50) {
    return;
  }
  const repay = Math.min(50, gameState.debt, gameState.money);
  gameState.money -= repay;
  gameState.debt -= repay;
  el.log.textContent = `Repaid ${fmt(repay)} debt.`;
  updateUI();
}

function restartRun() {
  gameState.money = 300;
  gameState.debt = 0;
  gameState.currentBet = 10;
  gameState.luckLevel = 0;
  gameState.multLevel = 0;
  gameState.effectLevel = 0;
  gameState.contractLevel = 0;
  gameState.shieldLevel = 0;
  gameState.royalLevel = 0;
  gameState.spins = 0;
  gameState.peakDebt = 0;
  gameState.bestNetWorth = 300;
  gameState.isGameOver = false;
  reels.forEach((reel) => {
    reel.textContent = "?";
    reel.removeAttribute("title");
  });
  el.log.textContent = "New run started. No save data. Fresh luck.";
  el.buyLuckBtn.disabled = false;
  el.buyMultBtn.disabled = false;
  el.buyEffectBtn.disabled = false;
  el.buyContractBtn.disabled = false;
  el.buyShieldBtn.disabled = true;
  el.buyRoyalBtn.disabled = true;
  setBet(10);
  updateUI();
}

if (el.spinBtn) {
  el.spinBtn.addEventListener("click", spin);
  el.repayBtn.addEventListener("click", repayDebt);
  el.restartBtn.addEventListener("click", restartRun);
  el.buyLuckBtn.addEventListener("click", () => buyUpgrade("luck"));
  el.buyMultBtn.addEventListener("click", () => buyUpgrade("mult"));
  el.buyEffectBtn.addEventListener("click", () => buyUpgrade("effect"));
  el.buyContractBtn.addEventListener("click", () => buyUpgrade("contract"));
  el.buyShieldBtn.addEventListener("click", () => buyUpgrade("shield"));
  el.buyRoyalBtn.addEventListener("click", () => buyUpgrade("royal"));
  el.betInput.addEventListener("input", () => setBet(Number(el.betInput.value)));
  el.betRange.addEventListener("input", () => setBet(Number(el.betRange.value)));
  setBet(10);
  updateUI();
}
