const SPIN_COST = 115;
const GLOBAL_PAYOUT_EASE_MULTIPLIER = 2;
const HELL_PAYOUT_FACTOR = 0.7;
const BASE_WIN_SPINS = 100;
const BASE_REEL_SLOTS = 3;

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

function luckCost(s) { return getCost(60, s.luckLevel, 1.72, s); }
function multCost(s) { return getCost(90, s.multLevel, 1.85, s); }
function effectCost(s) { return getCost(140, s.effectLevel, 2.05, s); }
function shieldCost(s) { return getCost(220, s.shieldLevel, 2.1, s); }
function secondChanceCost(s) { return getCost(110, s.secondChanceLevel, 1.8, s); }
function restructureCost(s) { return getCost(180, s.debtRestructureLevel, 2.05, s); }
function isShieldUnlocked(s) { return s.peakDebt >= 400 || s.spins >= 18; }

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
  if (s.wildGeneratorLevel > 0 && Math.random() < Math.min(0.45, s.wildGeneratorLevel * 0.05)) {
    out[Math.floor(Math.random() * out.length)] = WILD_SYMBOL;
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

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function buildActionSet() {
  return [
    { key: "mult", capKey: "maxMult", cap: 8, cost: multCost, buy: (s) => { s.multLevel += 1; } },
    { key: "luck", capKey: "maxLuck", cap: 8, cost: luckCost, buy: (s) => { s.luckLevel += 1; } },
    { key: "effect", capKey: "maxEffect", cap: 3, cost: effectCost, buy: (s) => { s.effectLevel += 1; } },
    { key: "shield", capKey: "maxShield", cap: 4, cost: shieldCost, cond: (s, c) => isShieldUnlocked(s) && s.debt >= c.shieldDebtMin, buy: (s) => { s.shieldLevel += 1; } },
    { key: "secondChance", capKey: "maxSecondChance", cap: 3, cost: secondChanceCost, buy: (s) => { s.secondChanceLevel += 1; s.secondChanceTokens += 1; } },
    {
      key: "restructure",
      capKey: "maxRestructure",
      cap: 2,
      cost: restructureCost,
      cond: (s, c) => s.debt >= c.restructureDebtMin,
      buy: (s) => {
        s.debtRestructureLevel += 1;
        const debtCut = Math.round(s.debt * (0.12 + s.debtRestructureLevel * 0.03));
        s.debt = Math.max(0, s.debt - debtCut);
        s.restructureSpinsLeft += 3;
      },
    },
  ];
}

function maybeBuyWithConfig(s, cfg) {
  const actions = buildActionSet();
  let changed = true;
  while (changed) {
    changed = false;

    if (s.debt > cfg.repayDebtMin && s.money > cfg.repayReserve) {
      const repay = Math.min(cfg.repayChunk, s.debt, s.money - cfg.repayKeep);
      if (repay > 0) {
        s.money -= repay;
        s.debt -= repay;
        changed = true;
      }
    }

    for (const key of cfg.order) {
      const a = actions.find((x) => x.key === key);
      if (!a) continue;

      const currentLevel = s[`${a.key}Level`];
      const maxLevel = Math.min(cfg[a.capKey], a.cap);
      if (currentLevel >= maxLevel) continue;
      if (a.cond && !a.cond(s, cfg)) continue;

      const price = a.cost(s);
      if (s.money - cfg.reserveMoney < price) continue;
      s.money -= price;
      a.buy(s);
      changed = true;
      break;
    }
  }
}

function runOne(difficulty, cfg) {
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
    maybeBuyWithConfig(s, cfg);

    if (s.needsFeePayment) {
      const fee = getTableFee(s, difficulty);
      if (!borrowIfNeeded(s, fee) || s.debt >= 10000) return { win: false, spins: s.spins };
      s.money -= fee;
      if (s.debt >= 10000) return { win: false, spins: s.spins };
      s.needsFeePayment = false;
      maybeBuyWithConfig(s, cfg);
    }

    if (s.secondChanceTokens > 0) {
      s.secondChanceArmed = cfg.armSecondChanceAlways ? true : s.debt > cfg.armSecondChanceDebtMin;
    }

    s.spins += 1;
    if (!borrowIfNeeded(s, s.currentBet) || s.debt >= 10000) return { win: false, spins: s.spins };
    s.money -= s.currentBet;

    let payout = evaluateSpin(s, difficulty, buildSpinResult(s));
    if (payout <= 0 && s.secondChanceArmed && s.secondChanceTokens > 0) {
      s.secondChanceTokens -= 1;
      s.secondChanceArmed = false;
      payout = evaluateSpin(s, difficulty, buildSpinResult(s));
    }
    s.money += payout;

    if (s.debt > 0) {
      s.debt = Math.round(s.debt * (1 + getDebtInterestRate(s, difficulty)));
      s.peakDebt = Math.max(s.peakDebt, s.debt);
    }

    if (s.restructureSpinsLeft > 0) s.restructureSpinsLeft -= 1;
    if (s.debt >= 10000) return { win: false, spins: s.spins };

    s.spinsInBlock += 1;
    if (s.spinsInBlock >= 10) {
      s.spinsInBlock = 0;
      s.needsFeePayment = true;
      s.feeLevel += 1;
      if (s.secondChanceLevel > 0) s.secondChanceTokens += s.secondChanceLevel;
    }
  }
  return { win: true, spins: BASE_WIN_SPINS };
}

function simulate(difficulty, cfg, runs) {
  let wins = 0;
  for (let i = 0; i < runs; i += 1) {
    const r = runOne(difficulty, cfg);
    if (r.win) wins += 1;
  }
  return (wins / runs) * 100;
}

function makeRandomConfig() {
  const order = ["mult", "luck", "effect", "shield", "secondChance", "restructure"];
  shuffle(order);
  return {
    order,
    reserveMoney: randomInt(50, 350),
    repayChunk: randomInt(30, 170),
    repayKeep: randomInt(60, 320),
    repayReserve: randomInt(120, 450),
    repayDebtMin: randomInt(1, 900),
    shieldDebtMin: randomInt(50, 2200),
    restructureDebtMin: randomInt(300, 3500),
    armSecondChanceAlways: Math.random() < 0.5,
    armSecondChanceDebtMin: randomInt(1, 2500),
    maxMult: randomInt(2, 8),
    maxLuck: randomInt(2, 8),
    maxEffect: randomInt(1, 3),
    maxShield: randomInt(0, 4),
    maxSecondChance: randomInt(0, 3),
    maxRestructure: randomInt(0, 2),
  };
}

function basePolicies() {
  return [
    {
      name: "baseline_auto_like",
      cfg: {
        order: ["mult", "luck", "effect", "shield", "secondChance", "restructure"],
        reserveMoney: 200,
        repayChunk: 50,
        repayKeep: 200,
        repayReserve: 300,
        repayDebtMin: 1,
        shieldDebtMin: 1,
        restructureDebtMin: 1500,
        armSecondChanceAlways: true,
        armSecondChanceDebtMin: 1,
        maxMult: 6,
        maxLuck: 6,
        maxEffect: 3,
        maxShield: 4,
        maxSecondChance: 2,
        maxRestructure: 2,
      },
    },
    {
      name: "aggressive_power",
      cfg: {
        order: ["effect", "mult", "luck", "secondChance", "shield", "restructure"],
        reserveMoney: 80,
        repayChunk: 40,
        repayKeep: 100,
        repayReserve: 180,
        repayDebtMin: 200,
        shieldDebtMin: 300,
        restructureDebtMin: 1200,
        armSecondChanceAlways: true,
        armSecondChanceDebtMin: 1,
        maxMult: 8,
        maxLuck: 8,
        maxEffect: 3,
        maxShield: 3,
        maxSecondChance: 3,
        maxRestructure: 2,
      },
    },
  ];
}

function optimizeDifficulty(difficulty, candidates, coarseRuns, finalRuns, topN) {
  const scored = [];
  for (const p of basePolicies()) scored.push({ name: p.name, cfg: p.cfg, coarse: simulate(difficulty, p.cfg, coarseRuns) });
  for (let i = 0; i < candidates; i += 1) {
    const cfg = makeRandomConfig();
    scored.push({ name: `rand_${i + 1}`, cfg, coarse: simulate(difficulty, cfg, coarseRuns) });
  }
  scored.sort((a, b) => b.coarse - a.coarse);
  const finalists = scored.slice(0, topN);
  for (const f of finalists) {
    f.final = simulate(difficulty, f.cfg, finalRuns);
  }
  finalists.sort((a, b) => b.final - a.final);
  return finalists;
}

function main() {
  const candidates = Number(process.argv[2] || 60);
  const coarseRuns = Number(process.argv[3] || 1200);
  const finalRuns = Number(process.argv[4] || 12000);
  const topN = Number(process.argv[5] || 6);
  const target = (process.argv[6] || "").toLowerCase();
  const reportTop = Number(process.argv[7] || 1);

  const set = target ? DIFFICULTIES.filter((d) => d.key === target || d.label.toLowerCase() === target) : DIFFICULTIES;
  if (set.length === 0) {
    console.error("Unknown difficulty key/label.");
    process.exit(1);
  }

  console.log(`Optimizing ${set.length} difficulty(ies) with candidates=${candidates}, coarseRuns=${coarseRuns}, finalRuns=${finalRuns}, topN=${topN}`);
  for (const d of set) {
    const ranked = optimizeDifficulty(d, candidates, coarseRuns, finalRuns, topN);
    const limit = Math.min(reportTop, ranked.length);
    console.log(`${d.label.padEnd(10)} | showing top ${limit} build(s)`);
    for (let i = 0; i < limit; i += 1) {
      const b = ranked[i];
      console.log(`  #${i + 1} clear ${b.final.toFixed(2).padStart(6)}% | source=${b.name}`);
      console.log(`    order=${b.cfg.order.join(">")}, reserve=${b.cfg.reserveMoney}, repayChunk=${b.cfg.repayChunk}, repayKeep=${b.cfg.repayKeep}, repayReserve=${b.cfg.repayReserve}`);
      console.log(`    caps mult/luck/effect/shield/sc/res=${b.cfg.maxMult}/${b.cfg.maxLuck}/${b.cfg.maxEffect}/${b.cfg.maxShield}/${b.cfg.maxSecondChance}/${b.cfg.maxRestructure}`);
      console.log(`    thresholds repayDebtMin=${b.cfg.repayDebtMin}, shieldDebtMin=${b.cfg.shieldDebtMin}, restructureDebtMin=${b.cfg.restructureDebtMin}, armAlways=${b.cfg.armSecondChanceAlways}`);
    }
  }
}

main();
