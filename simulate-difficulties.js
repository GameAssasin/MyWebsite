const SPIN_COST = 115;
const GLOBAL_PAYOUT_EASE_MULTIPLIER = 2;
const HELL_PAYOUT_FACTOR = 0.7;
const BASE_WIN_SPINS = 100;
const BASE_REEL_SLOTS = 3;
const MAX_REEL_SLOTS = 8;

const SYMBOLS = [
  { name: "Cherry", value: 1.3, weight: 25 },
  { name: "Lemon", value: 1.0, weight: 24 },
  { name: "Orange", value: 1.15, weight: 22 },
  { name: "Plum", value: 1.55, weight: 16 },
  { name: "Bell", value: 2.7, weight: 9 },
  { name: "BAR", value: 4.4, weight: 6 },
  { name: "Seven", value: 7.6, weight: 3 },
];
const WILD_SYMBOL = { name: "Wild", value: 6.2, weight: 0, isWild: true };

const DIFFICULTIES = [
  { key: "noob", label: "Noob", startMoney: 1169, debtLimit: 2763, baseInterest: 0.0345, feeBase: 24, feeGrowth: 1.138, payoutScale: 1.4025, devilChance: 0.0437 },
  { key: "easy", label: "Easy", startMoney: 956, debtLimit: 2338, baseInterest: 0.0437, feeBase: 31, feeGrowth: 1.182, payoutScale: 1.2963, devilChance: 0.0518 },
  { key: "casual", label: "Casual", startMoney: 808, debtLimit: 2019, baseInterest: 0.0564, feeBase: 41, feeGrowth: 1.233, payoutScale: 1.19, devilChance: 0.069 },
  { key: "normal", label: "Normal", startMoney: 808, debtLimit: 2019, baseInterest: 0.0587, feeBase: 45, feeGrowth: 1.241, payoutScale: 1.1688, devilChance: 0.069 },
  { key: "hard", label: "Hard", startMoney: 760, debtLimit: 1600, baseInterest: 0.07, feeBase: 58, feeGrowth: 1.24, payoutScale: 1.2, devilChance: 0.1 },
  { key: "expert", label: "Expert", startMoney: 730, debtLimit: 1450, baseInterest: 0.074, feeBase: 62, feeGrowth: 1.25, payoutScale: 1.18, devilChance: 0.11 },
  { key: "master", label: "Master", startMoney: 700, debtLimit: 1300, baseInterest: 0.078, feeBase: 66, feeGrowth: 1.26, payoutScale: 1.16, devilChance: 0.12 },
  { key: "nightmare", label: "Nightmare", startMoney: 670, debtLimit: 1180, baseInterest: 0.082, feeBase: 70, feeGrowth: 1.27, payoutScale: 1.14, devilChance: 0.125 },
  { key: "insane", label: "Insane", startMoney: 640, debtLimit: 1060, baseInterest: 0.086, feeBase: 74, feeGrowth: 1.28, payoutScale: 1.12, devilChance: 0.13 },
  { key: "hell", label: "Hell", startMoney: 610, debtLimit: 428, baseInterest: 0.09, feeBase: 78, feeGrowth: 1.31, payoutScale: 1.1, devilChance: 0.12 },
];

function getContractPower(s) { return 1 + s.contractLevel * 0.25; }
function getDebtInterestRate(s, d) {
  const greedPenalty = s.greedLevel * 0.008;
  const restructureReduction = s.restructureSpinsLeft > 0 ? 0.03 + s.debtRestructureLevel * 0.005 : 0;
  const rate = d.baseInterest + s.contractLevel * 0.03 + greedPenalty - s.shieldLevel * 0.015 - restructureReduction;
  return Math.max(0.03, rate);
}
function getTableFee(s, d) {
  const greedFeeGrowth = d.feeGrowth + s.greedLevel * 0.04;
  return Math.round(d.feeBase * Math.pow(greedFeeGrowth, s.feeLevel));
}
function getCost(base, level, growth, s) {
  return Math.round(base * Math.pow(growth, level) * (1 + s.contractLevel * 0.11) * 1.15);
}

function luckCost(s){ return getCost(60, s.luckLevel, 1.72, s); }
function multCost(s){ return getCost(90, s.multLevel, 1.85, s); }
function effectCost(s){ return getCost(140, s.effectLevel, 2.05, s); }
function shieldCost(s){ return getCost(220, s.shieldLevel, 2.1, s); }
function secondChanceCost(s){ return getCost(110, s.secondChanceLevel, 1.8, s); }
function restructureCost(s){ return getCost(180, s.debtRestructureLevel, 2.05, s); }

function isShieldUnlocked(s){ return s.peakDebt >= 400 || s.spins >= 18; }

function borrowIfNeeded(s, amount) {
  if (s.money >= amount) return true;
  const need = amount - s.money;
  s.debt += need;
  s.money = amount;
  s.peakDebt = Math.max(s.peakDebt, s.debt);
  return s.debt < 10000;
}

function chooseSymbol(s) {
  const power = getContractPower(s);
  const adjusted = SYMBOLS.map((sym) => {
    const bloodLuck = s.bloodDebtLevel * 0.07;
    const luckWeightBoost = sym.value > 2 ? s.luckLevel * 0.1 * power + bloodLuck : -s.luckLevel * 0.03;
    return { ...sym, w: Math.max(1, sym.weight * (1 + luckWeightBoost)) };
  });
  const total = adjusted.reduce((a, b) => a + b.w, 0);
  let roll = Math.random() * total;
  for (const sym of adjusted) {
    roll -= sym.w;
    if (roll <= 0) return sym;
  }
  return adjusted[adjusted.length - 1];
}

function buildSpinResult(s) {
  const out = Array.from({ length: s.reelSlots }, () => chooseSymbol(s));
  if (s.wildGeneratorLevel > 0) {
    const wildChance = Math.min(0.45, s.wildGeneratorLevel * 0.05);
    if (Math.random() < wildChance) {
      out[Math.floor(Math.random() * out.length)] = WILD_SYMBOL;
    }
  }
  return out;
}

function getComboMultiplier(matches) {
  if (matches >= 8) return 4.5;
  if (matches === 7) return 4.0;
  if (matches === 6) return 3.6;
  if (matches === 5) return 3.2;
  if (matches === 4) return 2.8;
  if (matches === 3) return 2.7;
  if (matches === 2) return 1.05;
  return 0;
}

function getBaseMultPower(s) {
  return 1 + s.multLevel * 0.2 * getContractPower(s);
}

function getDeterministicPayout(s, d, baseAmount) {
  const greedMult = 1 + s.greedLevel * 0.08;
  const extraSlots = Math.max(0, s.reelSlots - BASE_REEL_SLOTS);
  const slotPenalty = 1 / (1 + extraSlots * 0.3);
  const hellFactor = d.key === "hell" ? HELL_PAYOUT_FACTOR : 1;
  let payout = baseAmount * getBaseMultPower(s) * d.payoutScale * greedMult * 0.65 * slotPenalty * GLOBAL_PAYOUT_EASE_MULTIPLIER * hellFactor;
  if (s.royalLevel > 0 && payout > 0) payout *= 1 + s.royalLevel * 0.18;
  return Math.round(payout);
}

function evaluateSpin(s, d, result) {
  const bet = s.currentBet;
  let bestBase = 0;
  const wildCount = result.filter((x) => x.isWild).length;
  for (const sym of SYMBOLS) {
    const own = result.filter((x) => x.name === sym.name).length;
    const m = getComboMultiplier(own + wildCount);
    if (m <= 0) continue;
    const base = bet * sym.value * m;
    if (base > bestBase) bestBase = base;
  }
  if (bestBase <= 0) {
    const sum = result.reduce((a, x) => a + x.value, 0);
    if (sum > 10.5) bestBase = bet * 1.35;
  }
  let payout = getDeterministicPayout(s, d, bestBase);
  const effectPower = getContractPower(s);
  if (s.effectLevel >= 1 && payout > 0 && Math.random() < 0.09 * effectPower) payout *= 2;
  if (s.effectLevel >= 2 && Math.random() < 0.065 * effectPower) payout += Math.max(100, Math.round(bet * 2));
  if (s.effectLevel >= 3 && Math.random() < 0.12 * effectPower) s.money += bet;
  if (s.royalLevel > 0 && payout > 0 && Math.random() < 0.035 * s.royalLevel) payout += Math.max(200, bet * 5);
  return Math.round(payout);
}

function maybeBuy(s) {
  // conservative auto-policy for survivability
  let changed = true;
  while (changed) {
    changed = false;
    if (s.money >= 50 && s.debt > 0 && s.money > 300) {
      const repay = Math.min(50, s.debt, s.money - 200);
      if (repay > 0) {
        s.money -= repay;
        s.debt -= repay;
        changed = true;
      }
    }
    if (s.money >= multCost(s) && s.multLevel < 6) {
      s.money -= multCost(s);
      s.multLevel += 1;
      changed = true;
      continue;
    }
    if (s.money >= luckCost(s) && s.luckLevel < 6) {
      s.money -= luckCost(s);
      s.luckLevel += 1;
      changed = true;
      continue;
    }
    if (s.money >= effectCost(s) && s.effectLevel < 3) {
      s.money -= effectCost(s);
      s.effectLevel += 1;
      changed = true;
      continue;
    }
    if (isShieldUnlocked(s) && s.money >= shieldCost(s) && s.shieldLevel < 4 && s.debt > 0) {
      s.money -= shieldCost(s);
      s.shieldLevel += 1;
      changed = true;
      continue;
    }
    if (s.money >= secondChanceCost(s) && s.secondChanceLevel < 2) {
      s.money -= secondChanceCost(s);
      s.secondChanceLevel += 1;
      s.secondChanceTokens += 1;
      changed = true;
      continue;
    }
    if (s.debt > 1500 && s.money >= restructureCost(s) && s.debtRestructureLevel < 2) {
      s.money -= restructureCost(s);
      s.debtRestructureLevel += 1;
      const debtCut = Math.round(s.debt * (0.12 + s.debtRestructureLevel * 0.03));
      s.debt = Math.max(0, s.debt - debtCut);
      s.restructureSpinsLeft += 3;
      changed = true;
      continue;
    }
  }
}

function runOne(difficulty, policy) {
  const s = {
    money: difficulty.startMoney,
    debt: 0,
    debtLimitBase: difficulty.debtLimit,
    currentBet: SPIN_COST,
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
    wildGeneratorLevel: 0,
    debtRestructureLevel: 0,
    restructureSpinsLeft: 0,
    bloodDebtLevel: 0,
    reelExpansionLevel: 0,
    reelSlots: BASE_REEL_SLOTS,
    spins: 0,
    peakDebt: 0,
    spinsInBlock: 0,
    feeLevel: 0,
    needsFeePayment: false,
    bestNetWorth: difficulty.startMoney,
  };

  while (s.spins < BASE_WIN_SPINS) {
    if (policy === "auto") maybeBuy(s);

    if (s.needsFeePayment) {
      const fee = getTableFee(s, difficulty);
      if (!borrowIfNeeded(s, fee) || s.debt >= 10000) return { win: false, spins: s.spins };
      s.money -= fee;
      if (s.debt >= 10000) return { win: false, spins: s.spins };
      s.needsFeePayment = false;
      if (policy === "auto") maybeBuy(s);
    }

    if (policy === "auto" && s.secondChanceTokens > 0 && !s.secondChanceArmed) s.secondChanceArmed = true;

    s.spins += 1;

    if (!borrowIfNeeded(s, s.currentBet) || s.debt >= 10000) return { win: false, spins: s.spins };
    s.money -= s.currentBet;

    let result = buildSpinResult(s);
    let payout = evaluateSpin(s, difficulty, result);
    if (payout <= 0 && s.secondChanceArmed && s.secondChanceTokens > 0) {
      s.secondChanceTokens -= 1;
      s.secondChanceArmed = false;
      result = buildSpinResult(s);
      payout = evaluateSpin(s, difficulty, result);
    }

    s.money += payout;

    if (s.debt > 0) {
      s.debt = Math.round(s.debt * (1 + getDebtInterestRate(s, difficulty)));
      s.peakDebt = Math.max(s.peakDebt, s.debt);
    }

    if (s.bloodDebtLevel > 0) {
      const bloodDrain = Math.round(s.currentBet * (s.bloodDebtLevel * 0.06));
      if (s.money >= bloodDrain) {
        s.money -= bloodDrain;
      } else {
        const need = bloodDrain - s.money;
        s.money = 0;
        s.debt += need;
        s.peakDebt = Math.max(s.peakDebt, s.debt);
      }
    }

    if (s.restructureSpinsLeft > 0) s.restructureSpinsLeft -= 1;
    s.bestNetWorth = Math.max(s.bestNetWorth, Math.round(s.money - s.debt));

    if (s.debt >= 10000) return { win: false, spins: s.spins };

    s.spinsInBlock += 1;
    if (s.spinsInBlock >= 10) {
      s.spinsInBlock = 0;
      s.needsFeePayment = true;
      s.feeLevel += 1;
      if (s.secondChanceLevel > 0) s.secondChanceTokens += s.secondChanceLevel;
    }

    // Devil deal: assume player declines (no state change)
  }

  return { win: true, spins: BASE_WIN_SPINS };
}

function simulateAll(runs = 20000, policy = "auto") {
  for (const d of DIFFICULTIES) {
    let wins = 0;
    let totalSpins = 0;
    for (let i = 0; i < runs; i += 1) {
      const r = runOne(d, policy);
      if (r.win) wins += 1;
      totalSpins += r.spins;
    }
    const rate = (wins / runs) * 100;
    const avgSpins = totalSpins / runs;
    console.log(`${d.label.padEnd(10)} | clear ${rate.toFixed(2).padStart(6)}% | avg spins ${avgSpins.toFixed(2).padStart(6)}`);
  }
}

const runs = Number(process.argv[2] || 10000);
console.log(`Policy: no_buy, runs=${runs}`);
simulateAll(runs, "no_buy");
console.log("");
console.log(`Policy: auto, runs=${runs}`);
simulateAll(runs, "auto");
