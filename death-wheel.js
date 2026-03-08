const SPIN_COST = 25;
const TRIPLE_UNLOCK_MONEY = 3000;
const TRIPLE_SPIN_COST_MULT = 2.5;
const MIN_RUN_MS = 7 * 60 * 1000;
const START_MONEY = 1200;
const START_LIVES = 3;
const PASSIVE_INCOME_PER_SPIN = 0;
const DEATH_LIFE_LOSS_CHANCE = 0.45;

const wheelOrder = ["28", "9", "26", "30", "11", "7", "20", "32", "17", "5", "22", "34", "15", "3", "24", "36", "13", "1", "27", "10", "25", "29", "12", "8", "19", "31", "18", "6", "21", "33", "16", "4", "23", "35", "14", "2"];

const SLOT_TYPES_BY_INDEX = [
  "normal", "multiplier", "lucky", "normal", "normal", "death",
  "normal", "shield", "lucky", "normal", "chaos", "normal",
  "normal", "multiplier", "lucky", "death", "normal", "curse",
  "normal", "normal", "lucky", "normal", "chaos", "normal",
  "death", "normal", "lucky", "shield", "normal", "multiplier",
  "chaos", "normal", "lucky", "shop", "normal", "death",
];

const SLOT_TYPE_META = {
  normal: { label: "Normal", purpose: "Small gain or loss", color: "#3a3a44" },
  lucky: { label: "Lucky", purpose: "Big reward", color: "#d7a717" },
  death: { label: "Death", purpose: "Heavy penalty", color: "#7e0f20" },
  chaos: { label: "Chaos", purpose: "Random event", color: "#6b3fa8" },
  multiplier: { label: "Multiplier", purpose: "Boost next reward", color: "#2f6fda" },
  shield: { label: "Shield", purpose: "Protection", color: "#27a8b4" },
  curse: { label: "Curse", purpose: "Permanent run debuff", color: "#2f8b43" },
  shop: { label: "Shop", purpose: "Buy upgrades", color: "#cc7b1a" },
};

const BASE_SLOT_TYPE_BY_NUMBER = Object.fromEntries(wheelOrder.map((n, i) => [n, SLOT_TYPES_BY_INDEX[i]]));

const state = {
  money: START_MONEY,
  lives: START_LIVES,
  spinCount: 0,
  wheelRotation: 0,
  spinAnimTimers: [],
  spinning: false,
  inTripleSpinSequence: false,
  active: false,
  runStartedAt: 0,

  luckyNumber: "7",
  deathNumber: "13",

  shields: 0,
  nextRewardMultiplier: 1,
  tempDoubleCashWins: 0,
  luckyCharmLevel: 0,
  riggedNoDeathNext: false,
  predictedNextResult: null,
  deathSwapSpins: 0,

  rewardScale: 1,
  penaltyScale: 1,
  addedDeathSlots: 0,

  curses: {
    greed: false,
    fragile: false,
    debt: false,
    chaosMagnet: false,
  },

  eventLines: [],
  slotTypeByNumber: { ...BASE_SLOT_TYPE_BY_NUMBER },
  queuedInstantSpins: 0,
  tripleSpinUnlocked: false,
  tripleUnlockAnnounced: false,
  activeShopOffers: [],
  purchasedShopItemKeys: [],
  shopGrantMode: false,
  pendingShopGrant: false,
  interestEngineLevel: 0,
  riskInvestorLevel: 0,
  emergencyCashCharges: 0,
  deathDefuseCharges: 0,
  jackpotTokenCharges: 0,
  luckyStormSpins: 0,
  gamblerCoinCharges: 0,
  rerollTokenCharges: 0,
  wheelNudgeCharges: 0,
  wheelGodSpins: 0,
  goldenWheelSpins: 0,
  deathReversalCharges: 0,
  forcedNextResult: null,
};

const el = {
  money: document.getElementById("dwMoney"),
  spinCount: document.getElementById("dwSpinCount"),
  risk: document.getElementById("dwRisk"),
  lives: document.getElementById("dwLives"),
  effectsList: document.getElementById("dwEffectsList"),
  eventList: document.getElementById("dwEventList"),
  center: document.getElementById("dwCenter"),
  wheel: document.getElementById("dwWheel"),
  numbers: document.getElementById("dwNumbers"),
  spinBtn: document.getElementById("dwSpinBtn"),
  tripleSpinBtn: document.getElementById("dwTripleSpinBtn"),
  openShopBtn: document.getElementById("dwOpenShopBtn"),
  restartBtn: document.getElementById("dwRestartBtn"),
  skipCheck: document.getElementById("dwSkipCheck"),
  skipShopPopupCheck: document.getElementById("dwSkipShopPopupCheck"),
  showKeybindsCheck: document.getElementById("dwShowKeybindsCheck"),
  showShopInfoCheck: document.getElementById("dwShowShopInfoCheck"),
  log: document.getElementById("dwLog"),
  loseModal: document.getElementById("dwLoseModal"),
  loseText: document.getElementById("dwLoseText"),
  loseRestart: document.getElementById("dwLoseRestart"),
  setupModal: document.getElementById("dwSetupModal"),
  shopModal: document.getElementById("dwShopModal"),
  luckySelect: document.getElementById("dwLuckySelect"),
  deathSelect: document.getElementById("dwDeathSelect"),
  setupNote: document.getElementById("dwSetupNote"),
  startRunBtn: document.getElementById("dwStartRunBtn"),
  shopOffers: document.getElementById("dwShopOffers"),
  shopSkipBtn: document.getElementById("dwShopSkipBtn"),
  shopNote: document.getElementById("dwShopNote"),
  balanceNote: document.getElementById("dwBalanceNote"),
  countNormal: document.getElementById("dwCountNormal"),
  countLucky: document.getElementById("dwCountLucky"),
  countDeath: document.getElementById("dwCountDeath"),
  countChaos: document.getElementById("dwCountChaos"),
  countMultiplier: document.getElementById("dwCountMultiplier"),
  countShield: document.getElementById("dwCountShield"),
  countCurse: document.getElementById("dwCountCurse"),
  countShop: document.getElementById("dwCountShop"),
};

function fmt(v) {
  return `$${Math.round(v).toLocaleString()}`;
}

function randomDistinctPair() {
  const a = Math.floor(Math.random() * wheelOrder.length);
  let b = Math.floor(Math.random() * wheelOrder.length);
  while (b === a) b = Math.floor(Math.random() * wheelOrder.length);
  return [wheelOrder[a], wheelOrder[b]];
}

function colorOfPocket(value) {
  const n = Number(value);
  const red = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  return red.has(n) ? "red" : "black";
}

function slotTypeOf(value) {
  return state.slotTypeByNumber[value] || "normal";
}

function takeFunds(amount) {
  if (amount <= 0) return;
  if (state.money >= amount) {
    state.money -= amount;
    return;
  }
  state.money = 0;
}

function addFunds(amount) {
  if (amount > 0) state.money += amount;
}

function pushEvent(line) {
  state.eventLines.unshift(line);
  state.eventLines = state.eventLines.slice(0, 8);
}

function renderEvents() {
  if (el.eventList) {
    el.eventList.innerHTML = state.eventLines.map((x) => `<li>${x}</li>`).join("");
  }
}

function activeCurseCount() {
  return Object.values(state.curses).filter(Boolean).length;
}

function getSlotTypeCounts() {
  const counts = { normal: 0, lucky: 0, death: 0, chaos: 0, multiplier: 0, shield: 0, curse: 0, shop: 0 };
  wheelOrder.forEach((v) => {
    const t = slotTypeOf(v);
    if (counts[t] !== undefined) counts[t] += 1;
  });
  return counts;
}

function renderBalanceCounts() {
  const counts = getSlotTypeCounts();
  if (el.countNormal) el.countNormal.textContent = `${counts.normal} slots`;
  if (el.countLucky) el.countLucky.textContent = `${counts.lucky} slots`;
  if (el.countDeath) el.countDeath.textContent = `${counts.death} slots`;
  if (el.countChaos) el.countChaos.textContent = `${counts.chaos} slots`;
  if (el.countMultiplier) el.countMultiplier.textContent = `${counts.multiplier} slots`;
  if (el.countShield) el.countShield.textContent = `${counts.shield} slots`;
  if (el.countCurse) el.countCurse.textContent = `${counts.curse} slots`;
  if (el.countShop) el.countShop.textContent = `${counts.shop} slots`;

  const isBase = counts.normal === 16 && counts.lucky === 6 && counts.death === 4 && counts.chaos === 3
    && counts.multiplier === 3 && counts.shield === 2 && counts.curse === 1 && counts.shop === 1;
  if (el.balanceNote) {
    el.balanceNote.textContent = isBase
      ? "Wheel is balanced like a roulette-style ring with fixed slot counts by type."
      : "Wheel has been modified by events/items. Counts below show the current live slot distribution.";
  }
}

function getRiskLevel() {
  const score = activeCurseCount() * 1.5 + state.addedDeathSlots + (state.penaltyScale - 1) * 5;
  if (score >= 5) return "High";
  if (score >= 2.5) return "Medium";
  return "Low";
}

function renderEffects() {
  if (!el.effectsList) return;
  const out = [];
  const showInfo = Boolean(el.showShopInfoCheck?.checked);
  if (state.shields > 0) out.push(showInfo ? `Shield: ${state.shields}x Death block` : `Shield x${state.shields}`);
  if (state.nextRewardMultiplier > 1) out.push(`x${state.nextRewardMultiplier} Next Reward`);
  if (state.tempDoubleCashWins > 0) out.push(showInfo ? `Gold Multiplier: x2 for ${state.tempDoubleCashWins} wins` : `Double Cash ${state.tempDoubleCashWins} wins left`);
  if (state.luckyCharmLevel > 0) out.push(showInfo ? `Lucky Charm: ${state.luckyCharmLevel}x5%=${state.luckyCharmLevel * 5}% Lucky chance` : `Lucky Charm +${state.luckyCharmLevel * 5}% Lucky chance`);
  if (state.interestEngineLevel > 0) out.push(showInfo ? `Interest Engine: ${state.interestEngineLevel}x$20=$${state.interestEngineLevel * 20} per spin` : `Interest Engine +${state.interestEngineLevel * 20} per spin`);
  if (state.riskInvestorLevel > 0) out.push(showInfo ? `Risk Investor: ${state.riskInvestorLevel}x50%=${state.riskInvestorLevel * 50}% Lucky rewards` : `Risk Investor +${state.riskInvestorLevel * 50}% Lucky`);
  if (state.emergencyCashCharges > 0) out.push(showInfo ? `Emergency Cash: ${state.emergencyCashCharges}x$200=$${state.emergencyCashCharges * 200} backup` : `Emergency Cash x${state.emergencyCashCharges}`);
  if (state.deathDefuseCharges > 0) out.push(showInfo ? `Death Defuse: ${state.deathDefuseCharges}x75%=${state.deathDefuseCharges * 75}% reduction pool` : `Death Defuse x${state.deathDefuseCharges}`);
  if (state.jackpotTokenCharges > 0) out.push(showInfo ? `Jackpot Token: ${state.jackpotTokenCharges}x next Lucky=max` : `Jackpot Token x${state.jackpotTokenCharges}`);
  if (state.luckyStormSpins > 0) out.push(showInfo ? `Lucky Storm: +33.3% Lucky chance (${state.luckyStormSpins} spins)` : `Lucky Storm ${state.luckyStormSpins} spins`);
  if (state.gamblerCoinCharges > 0) out.push(showInfo ? `Gambler's Coin: ${state.gamblerCoinCharges}x (50% double/50% zero)` : `Gambler's Coin x${state.gamblerCoinCharges}`);
  if (state.rerollTokenCharges > 0) out.push(showInfo ? `Reroll Token: ${state.rerollTokenCharges}x Death/Curse reroll` : `Reroll Token x${state.rerollTokenCharges}`);
  if (state.wheelNudgeCharges > 0) out.push(showInfo ? `Wheel Nudge: ${state.wheelNudgeCharges}x +/-1 slot on bad result` : `Wheel Nudge x${state.wheelNudgeCharges}`);
  if (state.wheelGodSpins > 0) out.push(showInfo ? `Wheel God: Death blocked (${state.wheelGodSpins} spins)` : `Wheel God ${state.wheelGodSpins} spins`);
  if (state.goldenWheelSpins > 0) out.push(showInfo ? `Golden Wheel: rewards x3 (${state.goldenWheelSpins} spins)` : `Golden Wheel ${state.goldenWheelSpins} spins`);
  if (state.deathReversalCharges > 0) out.push(showInfo ? `Death Reversal: ${state.deathReversalCharges}x Death->Lucky` : `Death Reversal x${state.deathReversalCharges}`);
  if (state.riggedNoDeathNext) out.push("Rigged Spin: no Death next spin");
  if (state.predictedNextResult) out.push(`Predictor: ${state.predictedNextResult}`);
  if (state.deathSwapSpins > 0) out.push("Death Swap active (Death -> Lucky)");
  if (state.curses.greed) out.push("Curse: Greed (Lucky -30%)");
  if (state.curses.fragile) out.push("Curse: Fragile (Death x2)");
  if (state.curses.debt) out.push("Curse: Bleed ($25 every 3 spins)");
  if (state.curses.chaosMagnet) out.push("Curse: Chaos Magnet");
  if (out.length === 0) out.push("No active effects");
  el.effectsList.innerHTML = out.map((x) => `<li>${x}</li>`).join("");
}

function calculateScore() {
  const pressurePenalty = Math.max(0, Math.floor(state.spinCount / 12) - 2) * 85;
  const economyPower = Math.round(Math.sqrt(Math.max(0, state.money)) * 22);
  const raw = (state.spinCount * 95)
    + economyPower
    + (state.lives * 320)
    + (state.shields * 130)
    + (state.riskInvestorLevel * 90)
    + (state.interestEngineLevel * 90)
    + (state.wheelGodSpins * 40)
    - (activeCurseCount() * 260)
    - (state.addedDeathSlots * 285)
    - pressurePenalty;
  return Math.max(0, Math.round(raw));
}

function clearSpinAnimTimers() {
  state.spinAnimTimers.forEach((id) => clearTimeout(id));
  state.spinAnimTimers = [];
}

function currentSpeedScale(baseDivisor = 1) {
  const base = el.skipCheck.checked ? 0.5 : 1;
  return base / baseDivisor;
}

function triggerScreenShake() {
  document.body.classList.remove("shake");
  void document.body.offsetWidth;
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 380);
}

function endRun(reason) {
  if (!state.active) return;
  const elapsed = Date.now() - state.runStartedAt;
  const isLifeLossEnd = reason === "Lives reached 0.";
  const isNoMoneyEnd = reason === "Money reached $0.";
  if (elapsed < MIN_RUN_MS && !isLifeLossEnd && !isNoMoneyEnd) {
    const msLeft = Math.max(0, MIN_RUN_MS - elapsed);
    const secLeft = Math.ceil(msLeft / 1000);
    if (state.lives <= 0) state.lives = 1;
    const line = `Run protection active (${secLeft}s left): ${reason} blocked.`;
    el.log.textContent = line;
    pushEvent(line);
    renderEvents();
    updateUI();
    return false;
  }
  state.active = false;
  state.spinning = false;
  state.inTripleSpinSequence = false;
  clearSpinAnimTimers();
  const score = calculateScore();
  const line = `${reason} Final Score: ${score}.`;
  el.loseText.textContent = line;
  el.loseModal.classList.remove("hidden");
  el.log.textContent = line;
  pushEvent(line);
  renderEvents();
  renderEffects();
  updateUI();
  return true;
}

function updateUI() {
  if (!state.tripleSpinUnlocked && state.money >= TRIPLE_UNLOCK_MONEY) {
    state.tripleSpinUnlocked = true;
    if (!state.tripleUnlockAnnounced) {
      state.tripleUnlockAnnounced = true;
      const msg = `Triple Spin unlocked at ${fmt(TRIPLE_UNLOCK_MONEY)}: 3 spins for ${TRIPLE_SPIN_COST_MULT}x cost.`;
      pushEvent(msg);
      el.log.textContent = msg;
    }
  }

  if (el.money) el.money.textContent = fmt(state.money);
  if (el.spinCount) el.spinCount.textContent = String(state.spinCount);
  if (el.lives) el.lives.textContent = String(state.lives);
  if (el.risk) {
    const risk = getRiskLevel();
    el.risk.textContent = risk;
    el.risk.className = `stat-value risk-${risk.toLowerCase()}`;
    el.spinBtn.classList.remove("risk-low", "risk-medium", "risk-high");
    el.spinBtn.classList.add(`risk-${risk.toLowerCase()}`);
  }
  const setupOpen = !el.setupModal.classList.contains("hidden");
  const shopOpen = !el.shopModal.classList.contains("hidden");
  const blocked = !state.active || state.spinning || state.inTripleSpinSequence || setupOpen || shopOpen;
  el.spinBtn.disabled = blocked;
  if (el.tripleSpinBtn) {
    el.tripleSpinBtn.disabled = blocked || !state.tripleSpinUnlocked;
  }
  if (el.openShopBtn) {
    el.openShopBtn.disabled = !state.active
      || state.spinning
      || setupOpen
      || !el.shopModal.classList.contains("hidden")
      || state.activeShopOffers.length === 0;
  }
  renderEffects();
  renderEvents();
  renderBalanceCounts();

  if (state.active && state.money <= 0 && state.emergencyCashCharges > 0) {
    state.emergencyCashCharges -= 1;
    state.money = 200;
    const msg = "Emergency Cash triggered: restored $200.";
    el.log.textContent = msg;
    pushEvent(msg);
  }

  if (state.active && state.money <= 0) {
    endRun("Money reached $0.");
  } else if (state.active && state.lives <= 0) {
    endRun("Lives reached 0.");
  }
}

function chooseResult() {
  if (state.forcedNextResult) {
    const val = state.forcedNextResult;
    state.forcedNextResult = null;
    state.predictedNextResult = null;
    return val;
  }

  if (state.predictedNextResult) {
    const val = state.predictedNextResult;
    state.predictedNextResult = null;
    return val;
  }

  let luckyForceChance = state.luckyCharmLevel * 0.05;
  if (state.luckyStormSpins > 0) luckyForceChance += 0.333;
  luckyForceChance = Math.min(0.9, luckyForceChance);
  if (luckyForceChance > 0 && Math.random() < luckyForceChance) {
    const luckySlots = wheelOrder.filter((x) => slotTypeOf(x) === "lucky");
    return luckySlots[Math.floor(Math.random() * luckySlots.length)];
  }

  let pool = wheelOrder;
  if (state.wheelGodSpins > 0) {
    pool = pool.filter((x) => slotTypeOf(x) !== "death");
  }
  if (state.riggedNoDeathNext) {
    pool = pool.filter((x) => slotTypeOf(x) !== "death");
  }
  if (pool.length === 0) pool = wheelOrder;
  return pool[Math.floor(Math.random() * pool.length)];
}

function addDeathSlot() {
  const candidates = wheelOrder.filter((x) => slotTypeOf(x) !== "death");
  if (candidates.length === 0) return false;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  state.slotTypeByNumber[pick] = "death";
  state.addedDeathSlots += 1;
  initWheel();
  return true;
}

function removeDeathSlot() {
  const added = wheelOrder.filter((x) => slotTypeOf(x) === "death" && BASE_SLOT_TYPE_BY_NUMBER[x] !== "death");
  if (added.length > 0) {
    const pick = added[Math.floor(Math.random() * added.length)];
    state.slotTypeByNumber[pick] = BASE_SLOT_TYPE_BY_NUMBER[pick];
    state.addedDeathSlots = Math.max(0, state.addedDeathSlots - 1);
    initWheel();
    return `Wheel Hack removed added Death slot ${pick}`;
  }
  const baseDeaths = wheelOrder.filter((x) => slotTypeOf(x) === "death");
  if (baseDeaths.length > 0) {
    const pick = baseDeaths[Math.floor(Math.random() * baseDeaths.length)];
    state.slotTypeByNumber[pick] = "normal";
    initWheel();
    return `Wheel Hack converted Death slot ${pick} to Normal`;
  }
  return "Wheel Hack had no effect";
}

function shuffleSlotTypes() {
  const list = wheelOrder.map((x) => slotTypeOf(x));
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  wheelOrder.forEach((x, i) => {
    state.slotTypeByNumber[x] = list[i];
  });
  initWheel();
}

function addSlotType(targetType) {
  const candidates = wheelOrder.filter((x) => slotTypeOf(x) !== targetType);
  if (candidates.length === 0) return null;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  state.slotTypeByNumber[pick] = targetType;
  if (targetType === "death" && BASE_SLOT_TYPE_BY_NUMBER[pick] !== "death") {
    state.addedDeathSlots += 1;
  }
  initWheel();
  return pick;
}

function getShopItemPool() {
  return [
    { key: "insurance", title: "Insurance", cost: 200, type: "safe", category: "protection", desc: "Ignore next Death.", info: "Adds +1 shield. Shields fully block one Death hit." },
    { key: "shieldBattery", title: "Shield Battery", cost: 120, type: "safe", category: "protection", desc: "Gain 2 shields.", info: "Instantly grants +2 protection charges." },
    { key: "emergencyCash", title: "Emergency Cash", cost: 150, type: "safe", category: "protection", desc: "If money hits 0, restore $200 once.", info: "Triggers automatically before run-end check." },
    { key: "deathDefuse", title: "Death Defuse", cost: 180, type: "safe", category: "protection", desc: "Next Death penalty -75%.", info: "After trigger, one charge is consumed." },
    { key: "wheelHack", title: "Wheel Hack", cost: 250, type: "safe", category: "wheel", desc: "Remove 1 Death slot.", info: "Removes added Death first, then base Death." },
    { key: "luckyInfusion", title: "Lucky Infusion", cost: 200, type: "safe", category: "wheel", desc: "Add 1 Lucky slot.", info: "Permanently changes one wheel slot to Lucky." },
    { key: "chaosInjection", title: "Chaos Injection", cost: 150, type: "risky", category: "wheel", desc: "Add 1 Chaos slot.", info: "Permanently changes one wheel slot to Chaos." },
    { key: "slotFreeze", title: "Slot Freeze", cost: 100, type: "safe", category: "wheel", desc: "Freeze one slot for next spin.", info: "Forces the exact next result to a random slot." },
    { key: "goldMultiplier", title: "Gold Multiplier", cost: 200, type: "safe", category: "economy", desc: "Next 3 wins x2.", info: "Stacks with other reward multipliers." },
    { key: "riskInvestor", title: "Risk Investor", cost: 150, type: "safe", category: "economy", desc: "Lucky rewards +50%.", info: "Permanent and stackable for the run." },
    { key: "interestEngine", title: "Interest Engine", cost: 120, type: "safe", category: "economy", desc: "Gain $20 every spin.", info: "Each level adds +$20 per completed spin." },
    { key: "jackpotToken", title: "Jackpot Token", cost: 300, type: "safe", category: "economy", desc: "Next Lucky becomes max payout.", info: "Forces the next Lucky payout to $200 base." },
    { key: "bloodPact", title: "Blood Pact", cost: 0, type: "risky", category: "chaos", desc: "Add 2 Death slots, gain $400.", info: "Immediate high-risk cash injection." },
    { key: "luckyStorm", title: "Lucky Storm", cost: 250, type: "risky", category: "chaos", desc: "Next 3 spins Lucky chance doubled.", info: "Adds a strong temporary Lucky bias." },
    { key: "spinFrenzy", title: "Spin Frenzy", cost: 180, type: "risky", category: "chaos", desc: "Spin 3 times instantly.", info: "Queues 3 extra instant spins." },
    { key: "gamblersCoin", title: "Gambler's Coin", cost: 100, type: "risky", category: "chaos", desc: "Next result doubled or zero.", info: "50/50: doubles monetary effect or nullifies it." },
    { key: "predictionChip", title: "Prediction Chip", cost: 180, type: "safe", category: "strategic", desc: "Reveal next spin result.", info: "Also locks that shown result as next spin." },
    { key: "rerollToken", title: "Reroll Token", cost: 120, type: "safe", category: "strategic", desc: "Reroll a bad result.", info: "Auto-rerolls next Death/Curse into a safer slot." },
    { key: "wheelNudge", title: "Wheel Nudge", cost: 90, type: "safe", category: "strategic", desc: "Move result +/-1 slot.", info: "Auto-nudges next Death/Curse by one slot." },
    { key: "slotLock", title: "Slot Lock", cost: 160, type: "safe", category: "strategic", desc: "Lock one slot for next spin.", info: "Forces next result to a non-Death/non-Curse slot." },
    { key: "wheelGod", title: "Wheel God", cost: 500, type: "legendary", category: "legendary", desc: "No Death for next 3 spins.", info: "Death slots are excluded from result pool." },
    { key: "goldenWheel", title: "Golden Wheel", cost: 450, type: "legendary", category: "legendary", desc: "All rewards x3 for 2 spins.", info: "Applies after other reward modifiers." },
    { key: "deathReversal", title: "Death Reversal", cost: 350, type: "legendary", category: "legendary", desc: "Next Death becomes Lucky.", info: "One charge, consumed on conversion." },
    { key: "realityBreak", title: "Reality Break", cost: 400, type: "legendary", category: "legendary", desc: "Shuffle entire wheel.", info: "Randomizes all slot types immediately." },
  ];
}

function chooseShopOffers(count = null, enforceCategoryVariety = false) {
  const all = getShopItemPool();
  if (enforceCategoryVariety) {
    const categories = ["protection", "wheel", "economy", "chaos", "strategic", "legendary"];
    const offers = [];
    categories.forEach((cat) => {
      const pool = all.filter((x) => x.category === cat);
      if (pool.length > 0) offers.push(pool[Math.floor(Math.random() * pool.length)]);
    });
    state.activeShopOffers = offers.slice(0, 6);
    state.purchasedShopItemKeys = [];
    return;
  }
  const cheap = all.filter((x) => x.cost <= 120);
  const safe = all.filter((x) => x.type === "safe" && x.cost > 120);
  const risky = all.filter((x) => x.type === "risky");
  const offers = [];
  const offerCount = count ?? (3 + Math.floor(Math.random() * 4)); // 3..6

  const addUnique = (item) => {
    if (!item) return;
    if (offers.some((x) => x.key === item.key)) return;
    offers.push(item);
  };

  addUnique(cheap[Math.floor(Math.random() * cheap.length)]);
  addUnique(safe[Math.floor(Math.random() * safe.length)]);
  addUnique(risky[Math.floor(Math.random() * risky.length)]);

  while (offers.length < offerCount) {
    const pick = all[Math.floor(Math.random() * all.length)];
    addUnique(pick);
  }

  state.activeShopOffers = offers;
  state.purchasedShopItemKeys = [];
}

function applyCriticalScaling(events) {
  if (state.spinCount > 0 && state.spinCount % 10 === 0) {
    addDeathSlot();
    state.rewardScale = Math.round((state.rewardScale * 1.1) * 1000) / 1000;
    state.penaltyScale = Math.round((state.penaltyScale * 1.1) * 1000) / 1000;
    events.push(`Critical Improvement: +1 Death slot, rewards x${state.rewardScale.toFixed(2)}, penalties x${state.penaltyScale.toFixed(2)}`);
  }
}

function luckyPayoutTier() {
  const r = Math.random();
  if (r < 0.5) return 75;
  if (r < 0.8) return 125;
  return 200;
}

function applyChaosEvent(events) {
  const chaosPool = ["cash_rain", "tax", "shuffle", "double_spin", "death_swap"];
  if (state.curses.chaosMagnet) {
    chaosPool.push("shuffle", "double_spin");
  }
  const pick = chaosPool[Math.floor(Math.random() * chaosPool.length)];

  if (pick === "cash_rain") {
    const gain = Math.round(100 * state.rewardScale);
    addFunds(gain);
    events.push(`Chaos: Cash Rain +${fmt(gain)}`);
    return;
  }
  if (pick === "tax") {
    const loss = Math.round(100 * state.penaltyScale);
    takeFunds(loss);
    events.push(`Chaos: Tax -${fmt(loss)}`);
    return;
  }
  if (pick === "shuffle") {
    shuffleSlotTypes();
    events.push("Chaos: Wheel Shuffle (all slots randomized)");
    return;
  }
  if (pick === "double_spin") {
    state.queuedInstantSpins += 2;
    events.push("Chaos: Double Spin (2 instant spins queued)");
    return;
  }
  state.deathSwapSpins = 1;
  events.push("Chaos: Death Swap (Death -> Lucky for 1 spin)");
}

function applyRandomCurse(events) {
  const entries = ["greed", "fragile", "debt", "chaosMagnet"];
  const notActive = entries.filter((k) => !state.curses[k]);
  const key = notActive.length > 0 ? notActive[Math.floor(Math.random() * notActive.length)] : entries[Math.floor(Math.random() * entries.length)];
  state.curses[key] = true;
  const names = {
    greed: "Greed (Lucky rewards -30%)",
    fragile: "Fragile (Death damage x2)",
    debt: "Bleed (lose $25 every 3 spins)",
    chaosMagnet: "Chaos Magnet (chaos events more common)",
  };
  events.push(`Curse gained: ${names[key]}`);
}

function renderShopOffers() {
  if (!el.shopOffers) return;
  el.shopOffers.innerHTML = state.activeShopOffers.map((item) => {
    const alreadyBought = state.purchasedShopItemKeys.includes(item.key);
    const disabled = (!state.shopGrantMode && state.money < item.cost) || alreadyBought ? "disabled" : "";
    const tag = item.type === "legendary" ? "Legendary" : (item.type === "risky" ? "Risk" : "Safe");
    return `<article class="upgrade-card">
      <h3>${item.title}</h3>
      <p class="shop-meta">Type: ${tag}</p>
      <p class="shop-meta">Cost: ${state.shopGrantMode ? "FREE (Shop pickup)" : fmt(item.cost)}</p>
      <p class="shop-extra-info">${item.desc}</p>
      <p class="shop-extra-info">${item.info || ""}</p>
      <button class="btn btn-outline game-btn" data-shop-item="${item.key}" ${disabled}>${alreadyBought ? "Taken" : (state.shopGrantMode ? "Take" : "Buy")}</button>
    </article>`;
  }).join("");
  if (el.shopNote) {
    el.shopNote.textContent = state.shopGrantMode
      ? "Shop landing reward: choose 1 item from 6 options."
      : `Cash: ${fmt(state.money)}. Buy multiple items, then press Skip.`;
  }
}

function applyShopItem(itemKey) {
  if (itemKey === "insurance") {
    state.shields += 1;
    return "Shop: Insurance bought (ignore next Death).";
  }
  if (itemKey === "shieldBattery") {
    state.shields += 2;
    return "Shop: Shield Battery bought (+2 shields).";
  }
  if (itemKey === "emergencyCash") {
    state.emergencyCashCharges += 1;
    return "Shop: Emergency Cash armed.";
  }
  if (itemKey === "deathDefuse") {
    state.deathDefuseCharges += 1;
    return "Shop: Death Defuse armed.";
  }
  if (itemKey === "wheelHack") {
    return `Shop: ${removeDeathSlot()}.`;
  }
  if (itemKey === "luckyInfusion") {
    const slot = addSlotType("lucky");
    return slot ? `Shop: Lucky Infusion added Lucky slot ${slot}.` : "Shop: Lucky Infusion had no effect.";
  }
  if (itemKey === "chaosInjection") {
    const slot = addSlotType("chaos");
    return slot ? `Shop: Chaos Injection added Chaos slot ${slot}.` : "Shop: Chaos Injection had no effect.";
  }
  if (itemKey === "slotFreeze") {
    state.forcedNextResult = wheelOrder[Math.floor(Math.random() * wheelOrder.length)];
    state.predictedNextResult = state.forcedNextResult;
    return `Shop: Slot Freeze locked ${state.forcedNextResult} for next spin.`;
  }
  if (itemKey === "goldMultiplier") {
    state.tempDoubleCashWins += 3;
    return "Shop: Gold Multiplier bought (next 3 wins x2).";
  }
  if (itemKey === "riskInvestor") {
    state.riskInvestorLevel += 1;
    return "Shop: Risk Investor bought (Lucky rewards +50%).";
  }
  if (itemKey === "interestEngine") {
    state.interestEngineLevel += 1;
    return "Shop: Interest Engine online (+$20 each spin).";
  }
  if (itemKey === "jackpotToken") {
    state.jackpotTokenCharges += 1;
    return "Shop: Jackpot Token armed.";
  }
  if (itemKey === "bloodPact") {
    addSlotType("death");
    addSlotType("death");
    addFunds(400);
    return "Shop: Blood Pact used (+$400, +2 Death slots).";
  }
  if (itemKey === "luckyStorm") {
    state.luckyStormSpins += 3;
    return "Shop: Lucky Storm active for 3 spins.";
  }
  if (itemKey === "spinFrenzy") {
    state.queuedInstantSpins += 3;
    return "Shop: Spin Frenzy queued 3 instant spins.";
  }
  if (itemKey === "gamblersCoin") {
    state.gamblerCoinCharges += 1;
    return "Shop: Gambler's Coin armed.";
  }
  if (itemKey === "predictionChip") {
    state.predictedNextResult = chooseResult();
    state.forcedNextResult = state.predictedNextResult;
    return `Shop: Prediction Chip -> next spin is ${state.predictedNextResult}.`;
  }
  if (itemKey === "rerollToken") {
    state.rerollTokenCharges += 1;
    return "Shop: Reroll Token armed.";
  }
  if (itemKey === "wheelNudge") {
    state.wheelNudgeCharges += 1;
    return "Shop: Wheel Nudge armed.";
  }
  if (itemKey === "slotLock") {
    const safeSlots = wheelOrder.filter((x) => !["death", "curse"].includes(slotTypeOf(x)));
    state.forcedNextResult = safeSlots[Math.floor(Math.random() * safeSlots.length)];
    state.predictedNextResult = state.forcedNextResult;
    return `Shop: Slot Lock set next result to safe slot ${state.forcedNextResult}.`;
  }
  if (itemKey === "wheelGod") {
    state.wheelGodSpins += 3;
    return "Shop: Wheel God active (no Death for 3 spins).";
  }
  if (itemKey === "goldenWheel") {
    state.goldenWheelSpins += 2;
    return "Shop: Golden Wheel active (rewards x3 for 2 spins).";
  }
  if (itemKey === "deathReversal") {
    state.deathReversalCharges += 1;
    return "Shop: Death Reversal armed.";
  }
  if (itemKey === "realityBreak") {
    shuffleSlotTypes();
    return "Shop: Reality Break shuffled all slot types.";
  }
  return "Shop: Purchase failed.";
}

function openShopModal(reason = "", refreshOffers = true, grantMode = false) {
  state.shopGrantMode = grantMode;
  state.pendingShopGrant = grantMode;
  if (refreshOffers || state.activeShopOffers.length === 0 || grantMode) {
    chooseShopOffers(grantMode ? 6 : null, grantMode);
  }
  el.shopModal.classList.remove("hidden");
  renderShopOffers();
  if (reason) pushEvent(reason);
  updateUI();
}

function closeShopModal(msg) {
  el.shopModal.classList.add("hidden");
  state.shopGrantMode = false;
  if (msg) {
    el.log.textContent = msg;
    pushEvent(msg);
  }
  updateUI();
}

function triggerShop(reason, grantMode = false) {
  if (el.skipShopPopupCheck?.checked) {
    chooseShopOffers(grantMode ? 6 : null, grantMode);
    state.pendingShopGrant = grantMode;
    const line = grantMode
      ? "Shop popup skipped: free 1-of-6 pickup ready in Open Shop."
      : "Shop popup skipped: stock refreshed.";
    el.log.textContent = line;
    pushEvent(line);
    updateUI();
    return;
  }
  openShopModal(reason, true, grantMode);
}

function buyFromShop(itemKey) {
  if (!state.active) return;
  const item = state.activeShopOffers.find((x) => x.key === itemKey);
  if (!item) return;
  if (state.purchasedShopItemKeys.includes(itemKey)) return;
  if (!state.shopGrantMode && state.money < item.cost) return;
  if (!state.shopGrantMode) takeFunds(item.cost);
  const msg = applyShopItem(itemKey);
  state.purchasedShopItemKeys.push(itemKey);
  if (state.shopGrantMode) {
    state.pendingShopGrant = false;
    state.activeShopOffers = [];
    closeShopModal(`Shop pickup: ${msg}`);
    return;
  }
  el.log.textContent = msg;
  pushEvent(msg);
  renderShopOffers();
  updateUI();
}

function resolveSlotEffect(result, stakeAmount, events) {
  let type = slotTypeOf(result);
  const idx = wheelOrder.indexOf(result);
  let gamblerCoinMode = 1;
  if (state.gamblerCoinCharges > 0) {
    state.gamblerCoinCharges -= 1;
    gamblerCoinMode = Math.random() < 0.5 ? 2 : 0;
    events.push(gamblerCoinMode === 2 ? "Gambler's Coin: doubled result" : "Gambler's Coin: zeroed result");
  }

  if ((type === "death" || type === "curse") && state.rerollTokenCharges > 0) {
    state.rerollTokenCharges -= 1;
    const safePool = wheelOrder.filter((x) => !["death", "curse"].includes(slotTypeOf(x)));
    result = safePool[Math.floor(Math.random() * safePool.length)];
    type = slotTypeOf(result);
    events.push(`Reroll Token used: rerolled to ${result} (${SLOT_TYPE_META[type].label})`);
  } else if ((type === "death" || type === "curse") && state.wheelNudgeCharges > 0) {
    state.wheelNudgeCharges -= 1;
    const move = Math.random() < 0.5 ? -1 : 1;
    const nudgeIdx = (idx + move + wheelOrder.length) % wheelOrder.length;
    result = wheelOrder[nudgeIdx];
    type = slotTypeOf(result);
    events.push(`Wheel Nudge used: moved to ${result} (${SLOT_TYPE_META[type].label})`);
  }

  if (type === "death" && state.deathReversalCharges > 0) {
    state.deathReversalCharges -= 1;
    type = "lucky";
    events.push("Death Reversal converted Death to Lucky");
  }

  if (state.deathSwapSpins > 0 && type === "death") {
    type = "lucky";
    events.push("Death Swap converted Death to Lucky");
  }

  let gain = 0;
  let loss = 0;

  if (type === "normal") {
    gain = Math.random() < 0.5 ? 25 : 0;
    gain *= gamblerCoinMode;
    if (gain > 0) events.push(`Normal: +${fmt(gain)}`);
    else events.push("Normal: +$0");
  }

  if (type === "lucky") {
    gain = state.jackpotTokenCharges > 0 ? 200 : luckyPayoutTier();
    if (state.jackpotTokenCharges > 0) {
      state.jackpotTokenCharges -= 1;
      events.push("Jackpot Token triggered");
    }
    if (state.riskInvestorLevel > 0) gain = Math.round(gain * (1 + (state.riskInvestorLevel * 0.5)));
    if (state.curses.greed) gain = Math.round(gain * 0.7);
    gain = Math.round(gain * state.rewardScale);
    gain *= gamblerCoinMode;
    events.push(`Lucky: +${fmt(gain)}`);
  }

  if (type === "death") {
    if (Math.random() < 0.05) {
      const ended = endRun("Instant death event triggered.");
      if (ended) return { ended: true, type };
      events.push("Run protection blocked instant death");
    }
    if (state.shields > 0) {
      state.shields -= 1;
      events.push("Death: shield blocked penalty");
    } else {
      const byFlat = 150;
      const byPercent = Math.round((state.money + stakeAmount) * 0.25);
      loss = Math.max(byFlat, byPercent);
      if (state.curses.fragile) loss *= 2;
      if (state.deathDefuseCharges > 0) {
        state.deathDefuseCharges -= 1;
        loss = Math.round(loss * 0.25);
        events.push("Death Defuse triggered");
      }
      loss = Math.round(loss * state.penaltyScale);
      loss *= gamblerCoinMode;
      takeFunds(loss);
      let lostLife = false;
      if (Math.random() < DEATH_LIFE_LOSS_CHANCE) {
        state.lives -= 1;
        lostLife = true;
      } else {
        events.push("Death: life spared");
      }
      triggerScreenShake();
      events.push(lostLife ? `Death: -${fmt(loss)} and -1 life` : `Death: -${fmt(loss)}`);
    }
  }

  if (type === "chaos") applyChaosEvent(events);
  if (type === "multiplier") {
    state.nextRewardMultiplier = 2;
    events.push("Multiplier: next reward x2");
  }
  if (type === "shield") {
    state.shields += 1;
    events.push("Shield: +1 protection");
  }
  if (type === "curse") applyRandomCurse(events);
  if (type === "shop") {
    events.push("Shop landed: choose an upgrade.");
    triggerShop("Shop landed: choose 1 of 6.", true);
  }

  if (gain > 0 && state.nextRewardMultiplier > 1) {
    gain *= state.nextRewardMultiplier;
    events.push(`Multiplier applied -> ${fmt(gain)}`);
    state.nextRewardMultiplier = 1;
  }

  if (gain > 0 && state.tempDoubleCashWins > 0) {
    gain *= 2;
    state.tempDoubleCashWins -= 1;
    events.push(`Double Cash applied -> ${fmt(gain)}`);
  }

  if (gain > 0 && state.goldenWheelSpins > 0) {
    gain *= 3;
    events.push(`Golden Wheel applied -> ${fmt(gain)}`);
  }

  if (gain > 0) addFunds(gain);

  if (state.curses.debt && state.spinCount > 0 && state.spinCount % 3 === 0) {
    const tax = Math.round(25 * state.penaltyScale);
    takeFunds(tax);
    events.push(`Bleed Curse: -${fmt(tax)}`);
  }

  if (PASSIVE_INCOME_PER_SPIN > 0) {
    addFunds(PASSIVE_INCOME_PER_SPIN);
    events.push(`Survival income: +${fmt(PASSIVE_INCOME_PER_SPIN)}`);
  }

  return { ended: false, type, gain, loss, result };
}

function highlightWinningPocket(result) {
  const labels = el.numbers.querySelectorAll(".wheel-number");
  labels.forEach((label) => label.classList.toggle("hit", label.dataset.value === result));
}

function layoutWheelNumbers() {
  const sector = 360 / wheelOrder.length;
  const wheelSize = el.wheel.clientWidth || 320;
  const radiusPx = Math.round(wheelSize * 0.42);
  const labels = el.numbers.querySelectorAll(".wheel-number");
  const counter = ((state.wheelRotation % 360) + 360) % 360;

  labels.forEach((label) => {
    const idx = Number(label.dataset.index);
    const theta = -90 + ((idx + 0.5) * sector);
    label.style.transform = `translate(-50%, -50%) rotate(${theta}deg) translateY(${-radiusPx}px) rotate(${-theta - counter}deg)`;
  });
}

function spinAnimationTo(result, speedScale = 1) {
  const idx = wheelOrder.indexOf(result);
  const sector = 360 / wheelOrder.length;
  const targetCenter = (idx + 0.5) * sector;
  const current = ((state.wheelRotation % 360) + 360) % 360;
  const desired = ((450 - targetCenter) % 360 + 360) % 360;
  const delta = (desired - current + 360) % 360;

  state.wheelRotation += 2160 + delta;
  const finalRotation = state.wheelRotation;
  const tickCount = 7;
  const baseTickDurations = [150, 190, 240, 300, 380, 480, 620];
  const tickDurations = baseTickDurations.map((ms) => Math.max(60, Math.round(ms * speedScale)));
  const preTickMs = Math.max(600, Math.round(1950 * speedScale));
  const tickLeadMs = Math.max(40, Math.round(80 * speedScale));
  const preTickRotation = finalRotation - sector * tickCount;

  clearSpinAnimTimers();
  el.wheel.style.transition = `transform ${preTickMs}ms cubic-bezier(.08,.72,.2,1)`;
  el.wheel.style.transform = `rotate(${preTickRotation}deg)`;

  const phase2 = setTimeout(() => {
    let step = 0;
    const runTick = () => {
      if (step >= tickCount) return;
      const nextRot = preTickRotation + sector * (step + 1);
      el.wheel.style.transition = `transform ${tickDurations[step]}ms cubic-bezier(.2,.85,.25,1)`;
      el.wheel.style.transform = `rotate(${nextRot}deg)`;
      const id = setTimeout(() => {
        step += 1;
        runTick();
      }, tickDurations[step]);
      state.spinAnimTimers.push(id);
    };
    runTick();
  }, preTickMs - tickLeadMs);

  state.spinAnimTimers.push(phase2);
  layoutWheelNumbers();
  return preTickMs + tickDurations.reduce((a, b) => a + b, 0);
}

function setResultVisual(result) {
  const color = colorOfPocket(result);
  el.center.textContent = result;
  el.center.classList.remove("red", "black", "green");
  el.center.classList.add(color);
  highlightWinningPocket(result);
}

function settleSpin(result, stakeAmount, countSpin = true) {
  const events = [];
  const outcome = resolveSlotEffect(result, stakeAmount, events);
  if (outcome.ended) return;
  setResultVisual(outcome.result || result);

  if (countSpin) state.spinCount += 1;
  if (state.deathSwapSpins > 0) state.deathSwapSpins -= 1;
  if (state.luckyStormSpins > 0) state.luckyStormSpins -= 1;
  if (state.wheelGodSpins > 0) state.wheelGodSpins -= 1;
  if (state.goldenWheelSpins > 0) state.goldenWheelSpins -= 1;
  if (state.interestEngineLevel > 0) {
    const interestGain = state.interestEngineLevel * 20;
    addFunds(interestGain);
    events.push(`Interest Engine: +${fmt(interestGain)}`);
  }
  if (countSpin) applyCriticalScaling(events);

  const isForcedShopSpin = countSpin && state.spinCount > 0 && state.spinCount % 6 === 0;
  if (isForcedShopSpin && state.active) {
    events.push(`Scheduled Shop at spin ${state.spinCount}`);
  }

  const shownResult = outcome.result || result;
  const summary = `Spin ${state.spinCount}: ${shownResult} (${SLOT_TYPE_META[outcome.type].label}) | Stake ${fmt(stakeAmount)} | Money ${fmt(state.money)}.`;
  el.log.textContent = `${summary} ${events.join("; ")}`;
  pushEvent(summary);
  events.forEach((e) => pushEvent(e));

  if (!state.inTripleSpinSequence) {
    state.spinning = false;
  }
  updateUI();

  if (state.active && isForcedShopSpin && el.shopModal.classList.contains("hidden")) {
    triggerShop(`Shop opened at spin ${state.spinCount}.`, false);
  }

  if (state.active && state.queuedInstantSpins > 0) {
    const next = Math.min(state.queuedInstantSpins, 2);
    state.queuedInstantSpins -= next;
    for (let i = 0; i < next; i += 1) {
      if (!state.active) break;
      const instantStake = SPIN_COST;
      takeFunds(instantStake);
      const instantResult = chooseResult();
      setResultVisual(instantResult);
      settleSpin(instantResult, instantStake);
    }
  }
}

function spin() {
  if (!state.active || state.spinning) return;
  state.spinning = true;

  const stake = SPIN_COST;
  takeFunds(stake);
  const result = chooseResult();

  const delay = spinAnimationTo(result, currentSpeedScale(1));
  const id = setTimeout(() => settleSpin(result, stake), delay);
  state.spinAnimTimers.push(id);
  updateUI();
}

function spinTriple() {
  if (!state.active || state.spinning || !state.tripleSpinUnlocked) return;
  state.spinning = true;
  state.inTripleSpinSequence = true;

  const totalCost = Math.round(SPIN_COST * TRIPLE_SPIN_COST_MULT);
  takeFunds(totalCost);
  updateUI();

  let left = 3;
  const perSpinStake = SPIN_COST;
  const speedScale = currentSpeedScale(3);

  const runNext = () => {
    if (!state.active || left <= 0) {
      state.inTripleSpinSequence = false;
      state.spinning = false;
      updateUI();
      return;
    }
    if (!el.shopModal.classList.contains("hidden")) {
      const waitId = setTimeout(runNext, 120);
      state.spinAnimTimers.push(waitId);
      return;
    }

    const result = chooseResult();
    const delay = spinAnimationTo(result, speedScale);
    const id = setTimeout(() => {
      settleSpin(result, perSpinStake, left === 3);
      left -= 1;
      runNext();
    }, delay);
    state.spinAnimTimers.push(id);
  };

  runNext();
}

function resetWheelVisual() {
  clearSpinAnimTimers();
  el.wheel.style.transition = "none";
  el.wheel.style.transform = "rotate(0deg)";
  state.wheelRotation = 0;
  setTimeout(() => {
    el.wheel.style.transition = "transform 2.9s cubic-bezier(.08,.7,.15,1)";
  }, 0);
  el.center.textContent = "-";
  el.center.classList.remove("red", "black", "green");
  highlightWinningPocket("__none__");
  layoutWheelNumbers();
}

function populateSetupSelects() {
  const vals = Array.from({ length: 36 }, (_, i) => String(i + 1));
  el.luckySelect.innerHTML = "";
  el.deathSelect.innerHTML = "";
  vals.forEach((v) => {
    const l = document.createElement("option");
    l.value = v;
    l.textContent = v;
    el.luckySelect.appendChild(l);

    const d = document.createElement("option");
    d.value = v;
    d.textContent = v;
    el.deathSelect.appendChild(d);
  });
}

function openSetupModal() {
  el.setupModal.classList.remove("hidden");
  el.setupNote.textContent = "";
  const a = Math.floor(Math.random() * wheelOrder.length);
  let b = Math.floor(Math.random() * wheelOrder.length);
  while (b === a) b = Math.floor(Math.random() * wheelOrder.length);
  el.luckySelect.value = wheelOrder[a];
  el.deathSelect.value = wheelOrder[b];
  updateUI();
}

function startRunFromSetup() {
  const lucky = el.luckySelect.value;
  const death = el.deathSelect.value;
  if (lucky === death) {
    el.setupNote.textContent = "Lucky and Death must be different.";
    return;
  }
  state.luckyNumber = lucky;
  state.deathNumber = death;
  state.runStartedAt = Date.now();
  state.active = true;
  el.setupModal.classList.add("hidden");
  const line = `Run started. Lucky: ${lucky}. Death: ${death}.`;
  el.log.textContent = line;
  pushEvent(line);
  updateUI();
}

function restart() {
  state.money = START_MONEY;
  state.lives = START_LIVES;
  state.spinCount = 0;
  state.wheelRotation = 0;
  state.spinning = false;
  state.inTripleSpinSequence = false;
  state.active = false;
  state.runStartedAt = 0;

  state.shields = 0;
  state.nextRewardMultiplier = 1;
  state.tempDoubleCashWins = 0;
  state.luckyCharmLevel = 0;
  state.riggedNoDeathNext = false;
  state.predictedNextResult = null;
  state.deathSwapSpins = 0;

  state.rewardScale = 1;
  state.penaltyScale = 1;
  state.addedDeathSlots = 0;
  state.curses = { greed: false, fragile: false, debt: false, chaosMagnet: false };

  state.eventLines = [];
  state.slotTypeByNumber = { ...BASE_SLOT_TYPE_BY_NUMBER };
  state.queuedInstantSpins = 0;
  state.tripleSpinUnlocked = false;
  state.tripleUnlockAnnounced = false;
  state.activeShopOffers = [];
  state.purchasedShopItemKeys = [];
  state.shopGrantMode = false;
  state.pendingShopGrant = false;
  state.interestEngineLevel = 0;
  state.riskInvestorLevel = 0;
  state.emergencyCashCharges = 0;
  state.deathDefuseCharges = 0;
  state.jackpotTokenCharges = 0;
  state.luckyStormSpins = 0;
  state.gamblerCoinCharges = 0;
  state.rerollTokenCharges = 0;
  state.wheelNudgeCharges = 0;
  state.wheelGodSpins = 0;
  state.goldenWheelSpins = 0;
  state.deathReversalCharges = 0;
  state.forcedNextResult = null;

  el.loseModal.classList.add("hidden");
  el.shopModal.classList.add("hidden");
  el.setupModal.classList.add("hidden");
  resetWheelVisual();
  initWheel();
  const [lucky, death] = randomDistinctPair();
  state.luckyNumber = lucky;
  state.deathNumber = death;
  state.runStartedAt = Date.now();
  state.active = true;
  const line = `Run started. Lucky: ${lucky}. Death: ${death}.`;
  el.log.textContent = line;
  pushEvent(line);
  updateUI();
}

function initWheel() {
  const sector = 360 / wheelOrder.length;
  const gradientParts = [];
  el.numbers.innerHTML = "";

  wheelOrder.forEach((value, idx) => {
    const type = slotTypeOf(value);
    const start = idx * sector;
    const end = (idx + 1) * sector;
    gradientParts.push(`${SLOT_TYPE_META[type].color} ${start}deg ${end}deg`);

    const label = document.createElement("span");
    label.className = `wheel-number ${colorOfPocket(value)}`;
    label.dataset.index = String(idx);
    label.dataset.value = value;
    label.innerHTML = `<span class="wheel-num-value">${value}</span><span class="wheel-num-type">${SLOT_TYPE_META[type].label}</span>`;
    label.style.left = "50%";
    label.style.top = "50%";
    el.numbers.appendChild(label);
  });

  el.wheel.style.background = `conic-gradient(from -90deg, ${gradientParts.join(",")})`;
  layoutWheelNumbers();
}

function initKeybindHints() {
  document.querySelectorAll("[data-keybind]").forEach((btn) => {
    if (btn.querySelector(".keybind-chip")) return;
    const chip = document.createElement("span");
    chip.className = "keybind-chip";
    chip.textContent = btn.dataset.keybind;
    btn.appendChild(chip);
  });

  const apply = () => {
    document.body.classList.toggle("show-keybinds", Boolean(el.showKeybindsCheck.checked));
    document.body.classList.toggle("dw-show-shop-info", Boolean(el.showShopInfoCheck?.checked));
    renderEffects();
  };
  el.showKeybindsCheck.addEventListener("change", apply);
  el.showShopInfoCheck?.addEventListener("change", apply);
  apply();
}

el.spinBtn.addEventListener("click", spin);
el.tripleSpinBtn?.addEventListener("click", spinTriple);
el.openShopBtn?.addEventListener("click", () => {
  if (!state.active || state.spinning) return;
  if (state.activeShopOffers.length === 0) {
    const msg = "Shop has no stock yet. Wait for a Shop popup first.";
    el.log.textContent = msg;
    pushEvent(msg);
    updateUI();
    return;
  }
  openShopModal("Shop opened manually.", false, state.pendingShopGrant);
});
el.restartBtn.addEventListener("click", restart);
el.loseRestart.addEventListener("click", restart);
el.startRunBtn.addEventListener("click", startRunFromSetup);
el.shopOffers?.addEventListener("click", (event) => {
  const target = event.target.closest("[data-shop-item]");
  if (!target) return;
  const itemKey = target.getAttribute("data-shop-item");
  buyFromShop(itemKey);
});
el.shopSkipBtn?.addEventListener("click", () => closeShopModal("Shop skipped."));

document.addEventListener("keydown", (event) => {
  const key = event.key;
  const upper = key.toUpperCase();

  if (!el.setupModal.classList.contains("hidden")) {
    if (key === "Enter") {
      event.preventDefault();
      startRunFromSetup();
    }
    return;
  }
  if (!el.shopModal.classList.contains("hidden")) {
    if (key === "Escape") {
      event.preventDefault();
      closeShopModal("Shop skipped.");
    }
    return;
  }

  if (upper === "S") {
    event.preventDefault();
    spin();
    return;
  }
  if (upper === "A") {
    event.preventDefault();
    spinTriple();
    return;
  }
  if (upper === "T") {
    event.preventDefault();
    restart();
    return;
  }
  if (key === "Enter" && !el.loseModal.classList.contains("hidden")) {
    event.preventDefault();
    restart();
  }
});

populateSetupSelects();
initWheel();
initKeybindHints();
restart();
window.addEventListener("resize", layoutWheelNumbers);
window.addEventListener("beforeunload", () => {
  if (state.active) {
    sessionStorage.setItem("dw_run_ended_by_leave", "1");
  }
});

if (sessionStorage.getItem("dw_run_ended_by_leave") === "1") {
  sessionStorage.removeItem("dw_run_ended_by_leave");
  el.log.textContent = "Previous run ended because you left the page.";
}
