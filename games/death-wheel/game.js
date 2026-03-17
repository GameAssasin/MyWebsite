const SPIN_COST = 20;
const TRIPLE_UNLOCK_MONEY = 3000;
const TRIPLE_SPIN_COST_MULT = 2.5;
const MIN_RUN_MS = 7 * 60 * 1000;
const START_MONEY = 1800;
const START_LIVES = 6;
const PASSIVE_INCOME_PER_SPIN = 0;
const DEATH_LIFE_LOSS_CHANCE = 1;
const DEATH_INSTANT_CHANCE = 0;
const DEATH_FLAT_LOSS = 125;
const DEATH_PERCENT_LOSS = 0.18;
const CRITICAL_SPIN_CADENCE = 14;
const CRITICAL_REWARD_STEP = 1.05;
const CRITICAL_PENALTY_STEP = 1.09;
const SCHEDULED_SHOP_CADENCE = 6;
const SHIELD_CAP = 2;
const LAST_BREATH_TRIGGER_CHANCE = 0.12;
const LAST_BREATH_CASH = 25;
const TREASURE_POCKET_CHANCE = 0.05;
const SHOP_ITEM_CAPS = {
  heartBoost: 3,
  luckyCharm: 4,
  riskInvestor: 3,
  interestEngine: 3,
  emergencyCash: 2,
  deathDefuse: 2,
  jackpotToken: 2,
  wheelHack: 2,
  luckyInfusion: 3,
  chaosInjection: 2,
  shieldBattery: 3,
};
const DW_ADVICE_LINES = [
  "Shields and life recovery make long runs believable. Raw cash alone usually gets eaten by scaling.",
  "A shop skip is safest when the wheel is calm. High-risk wheels want protection first, greed second.",
  "Lucky slots feel great, but Death slots decide whether a run survives long enough to matter.",
  "Wheel edits are strongest when they remove Death pressure or add recovery, not when they only chase more chaos.",
  "Use cash to survive the next pressure spike, not just the next spin.",
  "A long run usually needs both money recovery and life recovery, not just one of them.",
  "Removing one Death slot early can matter more than adding one extra Lucky slot.",
  "Curse control is tempo. A curse that stays too long can quietly ruin an otherwise good wheel.",
  "Multiplier slots are best when the wheel already has enough safe outcomes to reach them often.",
  "Wheel Hack is strongest when Death pressure has already started climbing.",
  "Heart Boost is not flashy, but it gives scaling time to happen in your favor.",
  "A rich run can still die if it has no shields when Death clusters appear.",
  "Triple Spin is power and risk together. Use it when the wheel state is stable enough to absorb variance.",
  "Lucky Charm helps long runs more than short bursts because it keeps paying over many spins.",
  "Interest Engine is slow value. It works best when the run is already safe enough to last.",
  "Risk Investor wants a wheel that can reliably survive until Lucky rewards show up.",
  "If the wheel has multiple added Death slots, survival buys usually beat greed buys.",
  "Chaos is strongest when your run can survive bad chaos as well as good chaos.",
  "Prediction Chip and Slot Lock are better as rescue tools than routine greed tools.",
  "Reroll Token is most valuable when the wheel has become hostile, not when things are already safe.",
  "Wheel Nudge turns disaster into survivable pain. That makes it better than it first looks.",
  "Wheel God is strongest when Death slots are numerous enough to matter every few spins.",
  "Golden Wheel does nothing if the run dies before cashing in on it.",
  "Curse Cleanse can be stronger than a direct money item when curses are stacking.",
  "Shop landings are part of survival, not a side bonus. Plan around them.",
  "If cash is high but lives are low, the run is not actually healthy.",
  "If lives are high but cash is gone, scaling will still end the run soon.",
  "A balanced wheel survives longer than an exciting wheel.",
  "The safest long-run edits are the ones that lower how often Death decides the run.",
  "Protecting the next ten spins is usually stronger than maximizing the next one.",
  "When pressure rises, reliable defense is worth more than jackpot fantasy.",
  "Dead Heat boosts both reward and danger. Treat it like a volatility event, not a free lucky window.",
  "Crooked Dealer adds risk and reward together. It is strongest when the wheel already has shields or life buffer.",
  "Flash Market is a tempo shop, not a discount shop. Buy what fixes the next crisis first.",
  "Last Breath is emergency recovery. If it appears, your run was already close to collapse.",
  "Treasure Pocket is best when your wheel needs tools more than raw cash.",
  "The hidden pressure system punishes low-buy or passive runs. Hoarding too long can quietly make Death hits worse.",
  "Shield stockpiling is capped now. Critical pressure also burns one shield, so long runs cannot bank endless safety.",
];

const wheelOrder = ["28", "9", "26", "30", "11", "7", "20", "32", "17", "5", "22", "34", "15", "3", "24", "36", "13", "1", "27", "10", "25", "29", "12", "8", "19", "31", "18", "6", "21", "33", "16", "4", "23", "35", "14", "2"];

const SLOT_TYPES_BY_INDEX = [
  "normal", "multiplier", "lucky", "normal", "normal", "death",
  "normal", "shield", "lucky", "normal", "chaos", "normal",
  "normal", "multiplier", "lucky", "shield", "normal", "curse",
  "normal", "normal", "lucky", "normal", "chaos", "normal",
  "death", "normal", "lucky", "shield", "normal", "multiplier",
  "chaos", "normal", "lucky", "shop", "normal", "normal",
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
  deadHeatSpins: 0,
  crookedDealerSpins: 0,
  flashMarketActive: false,
  flashMarketCostFactor: 1,
  flashMarketOfferCount: null,
  lastBreathTriggered: false,

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
  purchasedShopCounts: {},
  totalPaidPurchases: 0,
  currentShopPurchases: 0,
  emptyHandPressure: 0,
  totalShopOffersSeen: 0,
  totalShopsSeen: 0,
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
  loseAccount: document.getElementById("dwLoseAccount"),
  loseDebt: document.getElementById("dwLoseDebt"),
  loseHand: document.getElementById("dwLoseHand"),
  loseLuck: document.getElementById("dwLoseLuck"),
  loseSentence: document.getElementById("dwLoseSentence"),
  loseText: document.getElementById("dwLoseText"),
  loseMoney: document.getElementById("dwLoseMoney"),
  loseLivesLine: document.getElementById("dwLoseLives"),
  loseScore: document.getElementById("dwLoseScore"),
  loseErrors: document.getElementById("dwLoseErrors"),
  loseFlash: document.getElementById("dwLoseFlash"),
  loseGlitchA: document.getElementById("dwLoseGlitchA"),
  loseGlitchB: document.getElementById("dwLoseGlitchB"),
  loseGlitchC: document.getElementById("dwLoseGlitchC"),
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
  adviceText: document.getElementById("dwAdviceText"),
};

let dwAdviceIndex = 0;
let dwAdviceTimer = null;
let dwAdviceSwapTimer = null;
const EXECUTION_ERROR_POOL = [
  "MEMORY LEAK DETECTED",
  "STACK OVERFLOW",
  "LEDGER DESYNC",
  "PROCESS KILLED",
  "SOUL INDEX LOST",
  "ARCHIVE FAILURE",
  "KERNEL PANIC",
  "CASINO CORE ERROR",
  "RECOVERY DENIED",
  "DEBT SIGNAL LOST",
  "0xDEAD",
  "0xC0FFIN",
  "0xBAADF00D",
  "INTEGRITY BREACH",
  "PURGE CONFIRMED",
  "COLLATERAL MISMATCH",
];
const EXECUTION_TEXT_ALTS = {
  A: ["4", "@", "Λ"],
  B: ["8"],
  E: ["3"],
  G: ["6"],
  I: ["1", "!"],
  O: ["0"],
  S: ["5", "$"],
  T: ["7", "+"],
  Z: ["2"],
};
let loseCorruptionTimer = null;
let loseErrorMutationTimer = null;
let loseTextCorruptionTimer = null;

function fmt(v) {
  return `$${Math.round(v).toLocaleString()}`;
}

function setExecutionGlitchLine(node, text) {
  if (!node) return;
  node.textContent = text;
  node.dataset.text = text;
}

function setExecutionInfoLine(node, text) {
  if (!node) return;
  node.textContent = text;
  node.dataset.text = text;
}

function stopLoseExecutionEffects() {
  if (loseCorruptionTimer) {
    clearTimeout(loseCorruptionTimer);
    loseCorruptionTimer = null;
  }
  if (loseErrorMutationTimer) {
    clearTimeout(loseErrorMutationTimer);
    loseErrorMutationTimer = null;
  }
  if (loseTextCorruptionTimer) {
    clearTimeout(loseTextCorruptionTimer);
    loseTextCorruptionTimer = null;
  }
  if (el.loseFlash) {
    el.loseFlash.style.background = "rgba(255, 40, 40, 0)";
  }
  [
    el.loseAccount,
    el.loseDebt,
    el.loseHand,
    el.loseLuck,
    el.loseSentence,
    el.loseText,
    el.loseMoney,
    el.loseLivesLine,
    el.loseScore,
  ].forEach((node) => {
    if (!node) return;
    node.classList.remove("execution-corrupt");
    const stable = node.dataset.text;
    if (stable) node.textContent = stable;
  });
}

function corruptExecutionText(text) {
  if (!text) return text;
  const candidates = [...text].map((char, index) => ({ char, index }))
    .filter(({ char }) => /[A-Z0-9$]/.test(char));
  if (!candidates.length) return text;
  const { char, index } = candidates[Math.floor(Math.random() * candidates.length)];
  const replacements = EXECUTION_TEXT_ALTS[char] || ["#", "%", "?", "*"];
  const nextChar = replacements[Math.floor(Math.random() * replacements.length)];
  return `${text.slice(0, index)}${nextChar}${text.slice(index + 1)}`;
}

function pulseLoseExecutionText() {
  if (!el.loseModal || el.loseModal.classList.contains("hidden")) return;
  const nodes = [
    el.loseAccount,
    el.loseDebt,
    el.loseHand,
    el.loseLuck,
    el.loseSentence,
    el.loseText,
    el.loseMoney,
    el.loseLivesLine,
    el.loseScore,
  ].filter(Boolean);
  if (nodes.length) {
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    const stable = node.dataset.text || node.textContent;
    node.classList.add("execution-corrupt");
    node.textContent = corruptExecutionText(stable);
    setTimeout(() => {
      node.textContent = stable;
      node.classList.remove("execution-corrupt");
    }, 140 + Math.random() * 220);
  }
  loseTextCorruptionTimer = setTimeout(pulseLoseExecutionText, 850 + Math.random() * 1700);
}

function mutateLoseExecutionErrors() {
  if (!el.loseErrors || el.loseModal.classList.contains("hidden")) {
    return;
  }
  const items = el.loseErrors.querySelectorAll("span");
  items.forEach((item) => {
    if (Math.random() < 0.28) {
      item.textContent = EXECUTION_ERROR_POOL[Math.floor(Math.random() * EXECUTION_ERROR_POOL.length)];
    }
    if (Math.random() < 0.18) {
      item.style.top = `${Math.random() * 100}%`;
      item.style.left = `${Math.random() * 100}%`;
    }
  });
  loseErrorMutationTimer = setTimeout(mutateLoseExecutionErrors, 700 + Math.random() * 1400);
}

function triggerLoseExecutionCorruption() {
  if (!el.loseModal || el.loseModal.classList.contains("hidden")) {
    return;
  }
  if (el.loseFlash) {
    el.loseFlash.style.background = "rgba(255, 40, 40, 0.12)";
    setTimeout(() => {
      if (el.loseFlash) {
        el.loseFlash.style.background = "rgba(255, 40, 40, 0)";
      }
    }, 120);
  }
  loseCorruptionTimer = setTimeout(triggerLoseExecutionCorruption, 2500 + Math.random() * 4000);
}

function initLoseExecutionEffects() {
  stopLoseExecutionEffects();
  if (!el.loseErrors) return;
  el.loseErrors.innerHTML = "";
  for (let i = 0; i < 26; i += 1) {
    const item = document.createElement("span");
    item.textContent = EXECUTION_ERROR_POOL[Math.floor(Math.random() * EXECUTION_ERROR_POOL.length)];
    item.style.top = `${Math.random() * 100}%`;
    item.style.left = `${Math.random() * 100}%`;
    item.style.animationDuration = `${8 + Math.random() * 8}s`;
    item.style.animationDelay = `${-Math.random() * 10}s`;
    el.loseErrors.appendChild(item);
  }
  mutateLoseExecutionErrors();
  loseCorruptionTimer = setTimeout(triggerLoseExecutionCorruption, 1800);
  loseTextCorruptionTimer = setTimeout(pulseLoseExecutionText, 900);
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

function addShields(amount) {
  if (amount <= 0) return;
  state.shields = Math.min(SHIELD_CAP, state.shields + amount);
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

  const isBase = counts.normal === 17 && counts.lucky === 6 && counts.death === 3 && counts.chaos === 3
    && counts.multiplier === 3 && counts.shield === 3 && counts.curse === 1 && counts.shop === 1;
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

function deathWheelAdviceLine() {
  if (!state.active) {
    return "Pick lucky and death numbers first. Stable runs are built around reducing risk before scaling rewards.";
  }
  if (!el.loseModal.classList.contains("hidden")) {
    return "If the run collapsed fast, check whether it lacked shields, hearts, or enough shop value before scaling kicked in.";
  }
  if (!el.shopModal.classList.contains("hidden")) {
    return state.shopGrantMode
      ? "Free shop rewards should usually patch your weakest survival stat first."
      : "Paid shops are where long runs are made. Buying nothing leaves the wheel in control.";
  }
  if (state.lives <= 2) {
    return "Low lives. Hearts, shields, and curse control matter more than another reward multiplier.";
  }
  if (activeCurseCount() >= 2) {
    return "Multiple curses are active. Cleanse or protection is worth more than one greedy spike.";
  }
  if (state.addedDeathSlots >= 2) {
    return "The wheel has picked up extra Death slots. Safe edits matter more than raw reward chasing.";
  }
  return DW_ADVICE_LINES[dwAdviceIndex % DW_ADVICE_LINES.length];
}

function updateDeathWheelAdvice(advance = false) {
  if (!el.adviceText) return;
  if (advance) {
    dwAdviceIndex = (dwAdviceIndex + 1) % DW_ADVICE_LINES.length;
  }
  const nextText = deathWheelAdviceLine();
  if (el.adviceText.textContent === nextText) {
    return;
  }
  if (dwAdviceSwapTimer) {
    window.clearTimeout(dwAdviceSwapTimer);
  }
  el.adviceText.classList.remove("tip-entered");
  void el.adviceText.offsetWidth;
  el.adviceText.classList.add("tip-switching");
  dwAdviceSwapTimer = window.setTimeout(() => {
    el.adviceText.textContent = nextText;
    el.adviceText.classList.remove("tip-switching");
    el.adviceText.classList.add("tip-entered");
  }, 130);
}

function startDeathWheelAdviceRotation() {
  if (!el.adviceText || dwAdviceTimer) return;
  updateDeathWheelAdvice(false);
  dwAdviceTimer = window.setInterval(() => updateDeathWheelAdvice(true), 7000);
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
  if (state.deadHeatSpins > 0) out.push(showInfo ? `Dead Heat: Lucky rewards and Death penalties +25% (${state.deadHeatSpins} spins)` : `Dead Heat ${state.deadHeatSpins} spins`);
  if (state.crookedDealerSpins > 0) out.push(showInfo ? `Crooked Dealer: +1 Lucky weight and +1 Death weight (${state.crookedDealerSpins} spins)` : `Crooked Dealer ${state.crookedDealerSpins} spins`);
  if (state.flashMarketActive) out.push(showInfo ? `Flash Market: current shop prices x${state.flashMarketCostFactor.toFixed(2)}` : "Flash Market active");
  if (state.curses.greed) out.push("Curse: Greed (Lucky -30%)");
  if (state.curses.fragile) out.push("Curse: Fragile (Death x2)");
  if (state.curses.debt) out.push("Curse: Bleed ($25 every 3 spins)");
  if (state.curses.chaosMagnet) out.push("Curse: Chaos Magnet");
  if (out.length === 0) out.push("No active effects");
  el.effectsList.innerHTML = out.map((x) => `<li>${x}</li>`).join("");
  updateDeathWheelAdvice(false);
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
  const accountCode = `W${String(Math.max(0, Math.round(state.money))).padStart(4, "0")}-${String(state.spinCount).padStart(4, "0")}`;
  const line = `${reason} Final Score: ${score}.`;
  setExecutionInfoLine(el.loseAccount, `ACCOUNT: ${accountCode}`);
  setExecutionInfoLine(el.loseDebt, "DEBT: UNPAID");
  setExecutionInfoLine(el.loseHand, "HAND: WHEEL COLLAPSED");
  setExecutionInfoLine(el.loseLuck, "LUCK: EXHAUSTED");
  setExecutionInfoLine(el.loseSentence, "SENTENCE: EXECUTION");
  setExecutionInfoLine(el.loseText, `STATUS: ${String(reason).toUpperCase()}`);
  setExecutionInfoLine(el.loseMoney, `ASSETS: ${fmt(state.money)} REMAINING`);
  setExecutionInfoLine(el.loseLivesLine, `LIVES: ${state.lives}`);
  setExecutionInfoLine(el.loseScore, `FINAL SCORE: ${score}`);
  setExecutionGlitchLine(el.loseGlitchA, "ACCOUNT RECORD: PURGED");
  setExecutionGlitchLine(el.loseGlitchB, "ARCHIVE ERROR: 0xDEAD");
  setExecutionGlitchLine(el.loseGlitchC, "DATA INTEGRITY: FAILED");
  el.loseModal.classList.remove("hidden");
  initLoseExecutionEffects();
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
  if (state.crookedDealerSpins > 0) {
    const luckySlots = pool.filter((x) => slotTypeOf(x) === "lucky");
    const deathSlots = pool.filter((x) => slotTypeOf(x) === "death");
    if (luckySlots.length > 0) {
      pool = pool.concat(luckySlots[Math.floor(Math.random() * luckySlots.length)]);
    }
    if (deathSlots.length > 0) {
      pool = pool.concat(deathSlots[Math.floor(Math.random() * deathSlots.length)]);
    }
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
    { key: "insurance", title: "Insurance", cost: 200, type: "safe", category: "protection", desc: "Ignore next Death.", info: `Adds +1 shield. Shield stockpile is capped at ${SHIELD_CAP}.` },
    { key: "shieldBattery", title: "Shield Battery", cost: 120, type: "safe", category: "protection", desc: "Gain 1 shield.", info: `Instantly grants +1 protection charge. Shield stockpile is capped at ${SHIELD_CAP}.` },
    { key: "heartBoost", title: "Heart Boost", cost: 220, type: "safe", category: "protection", desc: "Gain 1 life.", info: "Restores 1 life up to the run maximum." },
    { key: "emergencyCash", title: "Emergency Cash", cost: 150, type: "safe", category: "protection", desc: "If money hits 0, restore $200 once.", info: "Triggers automatically before run-end check." },
    { key: "deathDefuse", title: "Death Defuse", cost: 180, type: "safe", category: "protection", desc: "Next Death penalty -75%.", info: "After trigger, one charge is consumed." },
    { key: "curseCleanse", title: "Curse Cleanse", cost: 170, type: "safe", category: "protection", desc: "Remove 1 curse.", info: "If no curse is active, gain +1 shield instead." },
    { key: "wheelHack", title: "Wheel Hack", cost: 250, type: "safe", category: "wheel", desc: "Remove 1 Death slot.", info: "Removes added Death first, then base Death." },
    { key: "luckyInfusion", title: "Lucky Infusion", cost: 200, type: "safe", category: "wheel", desc: "Add 1 Lucky slot.", info: "Permanently changes one wheel slot to Lucky." },
    { key: "chaosInjection", title: "Chaos Injection", cost: 150, type: "risky", category: "wheel", desc: "Add 1 Chaos slot.", info: "Permanently changes one wheel slot to Chaos." },
    { key: "luckyCharm", title: "Lucky Charm", cost: 140, type: "safe", category: "economy", desc: "Lucky chance +5%.", info: "Each level adds +5% forced Lucky chance." },
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

function getShopItemCap(itemKey) {
  return SHOP_ITEM_CAPS[itemKey] ?? null;
}

function getShopItemCount(itemKey) {
  return state.purchasedShopCounts[itemKey] || 0;
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
  if (state.spinCount > 0 && state.spinCount % CRITICAL_SPIN_CADENCE === 0) {
    addDeathSlot();
    state.rewardScale = Math.round((state.rewardScale * CRITICAL_REWARD_STEP) * 1000) / 1000;
    state.penaltyScale = Math.round((state.penaltyScale * CRITICAL_PENALTY_STEP) * 1000) / 1000;
    let note = "";
    if (state.shields > 0) {
      state.shields -= 1;
      note = ", -1 shield";
    }
    events.push(`Critical Improvement: +1 Death slot, rewards x${state.rewardScale.toFixed(2)}, penalties x${state.penaltyScale.toFixed(2)}${note}`);
  }
}

function luckyPayoutTier() {
  const r = Math.random();
  if (r < 0.5) return 90;
  if (r < 0.8) return 145;
  return 225;
}

function applyChaosEvent(events) {
  const chaosPool = ["cash_rain", "tax", "shuffle", "double_spin", "death_swap", "dead_heat", "crooked_dealer", "flash_market"];
  if (state.curses.chaosMagnet) {
    chaosPool.push("shuffle", "double_spin", "dead_heat");
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
  if (pick === "dead_heat") {
    state.deadHeatSpins += 4;
    events.push("Chaos: Dead Heat (Lucky rewards and Death penalties +25% for 4 spins)");
    return;
  }
  if (pick === "crooked_dealer") {
    state.crookedDealerSpins += 6;
    events.push("Chaos: Crooked Dealer (+1 Lucky weight and +1 Death weight for 6 spins)");
    return;
  }
  if (pick === "flash_market") {
    state.flashMarketActive = true;
    state.flashMarketCostFactor = 1.35;
    state.flashMarketOfferCount = 4;
    events.push("Chaos: Flash Market (shop opens now with higher prices)");
    triggerShop("Chaos: Flash Market opened.", false);
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
    const cap = getShopItemCap(item.key);
    const count = getShopItemCount(item.key);
    const atCap = cap !== null && count >= cap;
    const displayCost = state.shopGrantMode ? 0 : Math.round(item.cost * state.flashMarketCostFactor);
    const disabled = (!state.shopGrantMode && state.money < displayCost) || alreadyBought || atCap ? "disabled" : "";
    const tag = item.type === "legendary" ? "Legendary" : (item.type === "risky" ? "Risk" : "Safe");
    return `<article class="upgrade-card">
      <h3>${item.title}</h3>
      <p class="shop-meta">Type: ${tag}</p>
      <p class="shop-meta">Cost: ${state.shopGrantMode ? "FREE (Shop pickup)" : fmt(displayCost)}</p>
      <p class="shop-meta">${cap !== null ? `Owned: ${count}/${cap}` : `Owned: ${count}`}</p>
      <p class="shop-desc">${item.desc}</p>
      <p class="shop-extra-info">${item.info || ""}</p>
      <button class="btn btn-outline game-btn" data-shop-item="${item.key}" ${disabled}>${atCap ? "MAX" : (alreadyBought ? "Taken" : (state.shopGrantMode ? "Take" : "Buy"))}</button>
    </article>`;
  }).join("");
  if (el.shopNote) {
    el.shopNote.textContent = state.shopGrantMode
      ? "Shop landing reward: choose 1 item from 6 options."
      : state.flashMarketActive
        ? `Flash Market active: Cash ${fmt(state.money)}. Prices are x${state.flashMarketCostFactor.toFixed(2)} in this shop.`
        : `Cash: ${fmt(state.money)}. Buy multiple items, then press Skip.`;
  }
}

function applyShopItem(itemKey) {
  if (itemKey === "insurance") {
    addShields(1);
    return "Shop: Insurance bought (ignore next Death).";
  }
  if (itemKey === "shieldBattery") {
    addShields(1);
    return "Shop: Shield Battery bought (+1 shield).";
  }
  if (itemKey === "heartBoost") {
    state.lives = Math.min(START_LIVES, state.lives + 1);
    return "Shop: Heart Boost restored 1 life.";
  }
  if (itemKey === "emergencyCash") {
    state.emergencyCashCharges += 1;
    return "Shop: Emergency Cash armed.";
  }
  if (itemKey === "deathDefuse") {
    state.deathDefuseCharges += 1;
    return "Shop: Death Defuse armed.";
  }
  if (itemKey === "curseCleanse") {
    const active = Object.keys(state.curses).filter((key) => state.curses[key]);
    if (active.length > 0) {
      const pick = active[Math.floor(Math.random() * active.length)];
      const curseNames = {
        greed: "Greed",
        fragile: "Fragile",
        debt: "Bleed",
        chaosMagnet: "Chaos Magnet",
      };
      state.curses[pick] = false;
      return `Shop: Curse Cleanse removed ${curseNames[pick] || pick}.`;
    }
    addShields(1);
    return "Shop: Curse Cleanse found no curse, gained +1 shield.";
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
  if (itemKey === "luckyCharm") {
    state.luckyCharmLevel += 1;
    return "Shop: Lucky Charm bought (+5% Lucky chance).";
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
  state.currentShopPurchases = 0;
  if (refreshOffers || state.activeShopOffers.length === 0 || grantMode) {
    chooseShopOffers(grantMode ? 6 : (state.flashMarketOfferCount ?? null), grantMode);
  }
  if (!grantMode) {
    state.totalShopsSeen += 1;
    state.totalShopOffersSeen += state.activeShopOffers.length;
  }
  el.shopModal.classList.remove("hidden");
  renderShopOffers();
  if (reason) pushEvent(reason);
  updateUI();
}

function closeShopModal(msg) {
  const wasGrantMode = state.shopGrantMode;
  el.shopModal.classList.add("hidden");
  state.shopGrantMode = false;
  state.flashMarketActive = false;
  state.flashMarketCostFactor = 1;
  state.flashMarketOfferCount = null;
  if (!wasGrantMode && state.active) {
    const engagement = state.totalShopOffersSeen > 0 ? (state.totalPaidPurchases / state.totalShopOffersSeen) : 1;
    const lowBuyPerShop = state.totalShopsSeen > 0 ? (state.totalPaidPurchases / state.totalShopsSeen) <= 1 : false;
    if (engagement < 0.34 || lowBuyPerShop) {
      state.emptyHandPressure += 2;
    } else {
      state.emptyHandPressure = 0;
    }
  }
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
  const cap = getShopItemCap(itemKey);
  if (cap !== null && getShopItemCount(itemKey) >= cap) return;
  const actualCost = state.shopGrantMode ? 0 : Math.round(item.cost * state.flashMarketCostFactor);
  if (!state.shopGrantMode && state.money < actualCost) return;
  if (!state.shopGrantMode) takeFunds(actualCost);
  const msg = applyShopItem(itemKey);
  state.purchasedShopItemKeys.push(itemKey);
  state.purchasedShopCounts[itemKey] = getShopItemCount(itemKey) + 1;
  state.totalPaidPurchases += 1;
  if (!state.shopGrantMode) {
    state.currentShopPurchases += 1;
    state.emptyHandPressure = 0;
  }
  if (state.shopGrantMode) {
    state.emptyHandPressure = 0;
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
    gain = state.jackpotTokenCharges > 0 ? 225 : luckyPayoutTier();
    if (state.jackpotTokenCharges > 0) {
      state.jackpotTokenCharges -= 1;
      events.push("Jackpot Token triggered");
    }
    if (state.riskInvestorLevel > 0) gain = Math.round(gain * (1 + (state.riskInvestorLevel * 0.5)));
    if (state.curses.greed) gain = Math.round(gain * 0.7);
    if (state.deadHeatSpins > 0) gain = Math.round(gain * 1.25);
    gain = Math.round(gain * state.rewardScale);
    gain *= gamblerCoinMode;
    if (!state.lastBreathTriggered && (state.money <= 260 || state.lives <= 2) && Math.random() < LAST_BREATH_TRIGGER_CHANCE) {
      state.lastBreathTriggered = true;
      state.lives = Math.min(START_LIVES, state.lives + 1);
      gain += LAST_BREATH_CASH;
      events.push(`Lucky: Last Breath triggered (+1 life, +${fmt(LAST_BREATH_CASH)})`);
    } else if (Math.random() < TREASURE_POCKET_CHANCE) {
      events.push("Lucky: Treasure Pocket opened (free shop pickup)");
      triggerShop("Treasure Pocket: choose 1 free item from 6.", true);
    }
    events.push(`Lucky: +${fmt(gain)}`);
  }

  if (type === "death") {
    if (Math.random() < DEATH_INSTANT_CHANCE) {
      const ended = endRun("Instant death event triggered.");
      if (ended) return { ended: true, type };
      events.push("Run protection blocked instant death");
    }
    if (state.shields > 0) {
      state.shields -= 1;
      events.push("Death: shield blocked penalty");
    } else {
      const byFlat = DEATH_FLAT_LOSS;
      const pressureDeathPercent = DEATH_PERCENT_LOSS + (state.emptyHandPressure * 0.04);
      const byPercent = Math.round((state.money + stakeAmount) * pressureDeathPercent);
      loss = Math.max(byFlat, byPercent);
      if (state.curses.fragile) loss *= 2;
      if (state.deathDefuseCharges > 0) {
        state.deathDefuseCharges -= 1;
        loss = Math.round(loss * 0.25);
        events.push("Death Defuse triggered");
      }
      if (state.deadHeatSpins > 0) {
        loss = Math.round(loss * 1.25);
      }
      loss = Math.round(loss * state.penaltyScale);
      loss *= gamblerCoinMode;
      takeFunds(loss);
      state.lives -= 1;
      triggerScreenShake();
      events.push(`Death: -${fmt(loss)} and -1 life`);
    }
  }

  if (type === "chaos") applyChaosEvent(events);
  if (type === "multiplier") {
    state.nextRewardMultiplier = 2;
    events.push("Multiplier: next reward x2");
  }
  if (type === "shield") {
    addShields(1);
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

  if (state.emptyHandPressure > 0) {
    const hiddenBleed = state.emptyHandPressure * 40;
    takeFunds(hiddenBleed);
  }

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
  if (state.deadHeatSpins > 0) state.deadHeatSpins -= 1;
  if (state.crookedDealerSpins > 0) state.crookedDealerSpins -= 1;
  if (state.luckyStormSpins > 0) state.luckyStormSpins -= 1;
  if (state.wheelGodSpins > 0) state.wheelGodSpins -= 1;
  if (state.goldenWheelSpins > 0) state.goldenWheelSpins -= 1;
  if (state.interestEngineLevel > 0) {
    const interestGain = state.interestEngineLevel * 20;
    addFunds(interestGain);
    events.push(`Interest Engine: +${fmt(interestGain)}`);
  }
  if (countSpin) applyCriticalScaling(events);

  const isForcedShopSpin = countSpin && state.spinCount > 0 && state.spinCount % SCHEDULED_SHOP_CADENCE === 0;
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
  stopLoseExecutionEffects();
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
  state.purchasedShopCounts = {};
  state.totalPaidPurchases = 0;
  state.currentShopPurchases = 0;
  state.emptyHandPressure = 0;
  state.totalShopOffersSeen = 0;
  state.totalShopsSeen = 0;
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
  state.deadHeatSpins = 0;
  state.crookedDealerSpins = 0;
  state.flashMarketActive = false;
  state.flashMarketCostFactor = 1;
  state.flashMarketOfferCount = null;
  state.lastBreathTriggered = false;

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
startDeathWheelAdviceRotation();
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
