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
  feeBrokerLevel: 0,
  secondChanceLevel: 0,
  secondChanceTokens: 0,
  secondChanceArmed: false,
  greedLevel: 0,
  wildGeneratorLevel: 0,
  debtRestructureLevel: 0,
  restructureSpinsLeft: 0,
  bloodDebtLevel: 0,
  reelExpansionLevel: 0,
  safetyNetLevel: 0,
  houseBribeSpinsLeft: 0,
  overclockCharges: 0,
  vipPassCharges: 0,
  lastBuyoutRelief: 0,
  overclockActive: false,
  reelSlots: 3,
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
  showFullUpgradeInfo: false,
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
const BASE_REEL_SLOTS = 3;
const MAX_REEL_SLOTS = 8;
const SPIN_COST = 115;
const GLOBAL_PAYOUT_EASE_MULTIPLIER = 2;
const HELL_PAYOUT_FACTOR = 0.7;
const GODS_WILL_PAYOUT_FACTOR = 0.5;
const GODS_WILL_FEE_FACTOR = 1.18;
const GODS_WILL_INTEREST_BONUS = 0.018;
const GODS_WILL_WIN_SPINS = 135;
const GODS_WILL_DEBT_LIMIT_PENALTY = 250;
const GODS_WILL_WILD_FACTOR = 0.5;
const GODS_WILL_SLOT_PENALTY_PER_EXTRA = 0.45;
const HOUSE_BRIBE_FEE_FACTOR = 0.65;
const HOUSE_BRIBE_INTEREST_REDUCTION = 0.025;
const OVERCLOCK_PAYOUT_FACTOR = 1.65;
const OVERCLOCK_WILD_BONUS = 0.12;
const OVERCLOCK_PROC_BONUS = 0.1;
const VIP_PASS_FEE_FACTOR = 0.5;
const PURCHASE_CAPS = {
  luck: 6,
  mult: 6,
  effect: 4,
  contract: 4,
  shield: 4,
  royal: 3,
  feeBroker: 3,
  secondChance: 4,
  greed: 4,
  wild: 4,
  restructure: 3,
  blood: 3,
  safetyNet: 3,
  reelExpand: MAX_REEL_SLOTS - BASE_REEL_SLOTS,
};

const DIFFICULTIES = [
  { key: "noob", label: "Noob", startMoney: 1169, debtLimit: 2763, baseInterest: 0.0345, feeBase: 24, feeGrowth: 1.138, payoutScale: 1.4025, devilChance: 0.0437 },
  { key: "easy", label: "Easy", startMoney: 956, debtLimit: 2338, baseInterest: 0.0437, feeBase: 31, feeGrowth: 1.182, payoutScale: 1.2963, devilChance: 0.0518 },
  { key: "casual", label: "Casual", startMoney: 808, debtLimit: 2019, baseInterest: 0.0564, feeBase: 41, feeGrowth: 1.233, payoutScale: 1.19, devilChance: 0.069 },
  { key: "normal", label: "Normal", startMoney: 808, debtLimit: 2019, baseInterest: 0.0587, feeBase: 45, feeGrowth: 1.241, payoutScale: 1.1688, devilChance: 0.069 },
  { key: "hard", label: "Hard", startMoney: 670, debtLimit: 1080, baseInterest: 0.08, feeBase: 69, feeGrowth: 1.27, payoutScale: 1.12, devilChance: 0.114 },
  { key: "expert", label: "Expert", startMoney: 640, debtLimit: 900, baseInterest: 0.083, feeBase: 74, feeGrowth: 1.279, payoutScale: 1.1, devilChance: 0.121 },
  { key: "master", label: "Master", startMoney: 620, debtLimit: 820, baseInterest: 0.085, feeBase: 77, feeGrowth: 1.284, payoutScale: 1.09, devilChance: 0.124 },
  { key: "nightmare", label: "Nightmare", startMoney: 600, debtLimit: 760, baseInterest: 0.086, feeBase: 80, feeGrowth: 1.288, payoutScale: 1.08, devilChance: 0.126 },
  { key: "insane", label: "Insane", startMoney: 590, debtLimit: 700, baseInterest: 0.087, feeBase: 82, feeGrowth: 1.292, payoutScale: 1.07, devilChance: 0.127 },
  { key: "hell", label: "Hell", startMoney: 700, debtLimit: 860, baseInterest: 0.084, feeBase: 72, feeGrowth: 1.28, payoutScale: 1.13, devilChance: 0.128 },
  { key: "gods_will", label: "Gods Will", startMoney: 700, debtLimit: 860, baseInterest: 0.084, feeBase: 72, feeGrowth: 1.28, payoutScale: 1.13, devilChance: 0.128 },
];

const DIFFICULTY_MAP = Object.fromEntries(DIFFICULTIES.map((d) => [d.key, d]));
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
  "COLLATERAL MISMATCH"
];
const BASE_WIN_SPINS = 100;
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
const GK_ADVICE_LINES = [
  "Paying fees on time matters more than one greedy spin. Long runs die from debt snowball, not one miss.",
  "Fee Broker and Safety Net are defensive buys. They keep a stable run alive longer than one flashy high-roll.",
  "If debt is rising faster than payouts, stop forcing upgrades and protect the run first.",
  "More reels widen combos, but Gods Will punishes wide reels much harder than normal difficulties.",
  "Second Chance is strongest when used to survive a bad block, not to chase one lucky rescue spin.",
  "Luck helps premium symbols show up, but Mult decides whether good lines actually matter.",
  "Effect levels add spike potential. They are strongest after the run already has enough stability.",
  "Debt Shield buys time twice: higher debt limit and lower interest both matter in long runs.",
  "Royal Permit is not an early survival buy. It pays off after the economy is already working.",
  "If a fee payment would break the run, the problem started several spins earlier.",
  "Blood Debt can boost symbol odds, but it quietly punishes weak payout blocks.",
  "Wild Generator gets much stronger with more reel slots, but only if the run can afford the slot penalty.",
  "Repaying some debt before interest stacks is often stronger than buying one more greedy upgrade.",
  "Second Chance is wasted if it sits unarmed during the worst block of the run.",
  "High difficulties punish sloppy money buffers. Keep reserve cash before chasing luxury buys.",
  "When payout scale is tight, defensive stacking beats jackpot dreaming.",
  "Reel Expansion is a commitment. Wider reels are not free power in this game.",
  "Contract power buffs upgrades, but it also pushes the house harder against you.",
  "A stable run can survive low rolls. An overextended run dies to one fee cycle.",
  "Fee Broker gets better the longer a run lasts because late fees scale up fast.",
  "Safety Net is strongest in dead blocks where nothing else is paying out.",
  "If Best Net Worth is rising but cash is weak, the run may still be too fragile.",
  "Buying everything you can afford is not always correct. Money buffer is a stat too.",
  "Greed upgrades look efficient until fee growth and debt interest start stacking together.",
  "Shield unlock timing matters. Once it opens, it can stabilize runs that were starting to slip.",
  "If you are winning only through rare spikes, the run is weaker than it looks.",
  "Medium upgrades bought early usually beat one premium buy taken too late.",
  "Hell rewards discipline. Gods Will punishes overconfidence even harder.",
  "If the machine is surviving on borrowed money every block, it is already in danger.",
  "A run with less debt pressure can afford to scale later. A desperate run has no late game.",
  "Good slot runs are built on boring survival choices first, exciting payouts second.",
  "Late-run sinks should turn extra cash into control, not infinite scaling. Buy time or buy one powerful gamble.",
  "House Bribe and VIP Table Pass both fight fee pressure, but one is temporary tempo and the other is stored value.",
  "Overclock Spin is for rich runs that can afford a premium gamble, not for broke runs hoping for rescue.",
  "Emergency Buyout is expensive on purpose. If it saves the run, it should still hurt.",
  "VIP Table Pass is best bought before the next ugly fee cycle, not after the fee already landed.",
  "House Bribe lowers late pressure, but it still costs enough that weak runs should not rely on it every block.",
  "If all your money is trapped in capped upgrades, the late-run sink shop is where spare cash becomes survival.",
  "Gods Will rewards clean scaling. Overbuying reels or greed too early usually kills the run before the payoff matters.",
  "A rich block without fee answers is weaker than it looks. Late runs are usually decided by control, not raw net worth.",
];

const el = {
  reelsContainer: document.querySelector(".reels"),
  money: document.getElementById("moneyValue"),
  debt: document.getElementById("debtValue"),
  debtLimit: document.getElementById("debtLimitValue"),
  interest: document.getElementById("interestValue"),
  best: document.getElementById("bestValue"),
  spinsLeft: document.getElementById("spinsLeftValue"),
  reelSlots: document.getElementById("reelSlotsValue"),
  tableFee: document.getElementById("tableFeeValue"),
  log: document.getElementById("eventLog"),
  spinBtn: document.getElementById("spinBtn"),
  skipAnimBtn: document.getElementById("skipAnimBtn"),
  payFeeBtn: document.getElementById("payFeeBtn"),
  repayBtn: document.getElementById("repayBtn"),
  restartBtn: document.getElementById("restartBtn"),
  autoSkipCheck: document.getElementById("autoSkipCheck"),
  showKeybindsCheck: document.getElementById("showKeybindsCheck"),
  showFullInfoCheck: document.getElementById("showFullInfoCheck"),
  difficultyBadge: document.getElementById("difficultyBadge"),
  difficultyInfo: document.getElementById("difficultyInfo"),
  objectiveSummary: document.getElementById("objectiveSummary"),
  objectiveWinLine: document.getElementById("objectiveWinLine"),
  objectiveDebtLine: document.getElementById("objectiveDebtLine"),
  difficultyModal: document.getElementById("difficultyModal"),
  difficultySelectModal: document.getElementById("difficultySelectModal"),
  difficultyModalInfo: document.getElementById("difficultyModalInfo"),
  difficultyMoreBtn: document.getElementById("difficultyMoreBtn"),
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
  feeBrokerLevel: document.getElementById("feeBrokerLevel"),
  feeBrokerCost: document.getElementById("feeBrokerCost"),
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
  feeBrokerReduction: document.getElementById("feeBrokerReduction"),
  buyLuckBtn: document.getElementById("buyLuckBtn"),
  buyMultBtn: document.getElementById("buyMultBtn"),
  buyEffectBtn: document.getElementById("buyEffectBtn"),
  buyContractBtn: document.getElementById("buyContractBtn"),
  buyShieldBtn: document.getElementById("buyShieldBtn"),
  buyRoyalBtn: document.getElementById("buyRoyalBtn"),
  buyFeeBrokerBtn: document.getElementById("buyFeeBrokerBtn"),
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
  loseAccount: document.getElementById("gkLoseAccount"),
  loseDebt: document.getElementById("gkLoseDebt"),
  loseHand: document.getElementById("gkLoseHand"),
  loseLuck: document.getElementById("gkLoseLuck"),
  loseSentence: document.getElementById("gkLoseSentence"),
  loseMoney: document.getElementById("gkLoseMoney"),
  loseSpins: document.getElementById("gkLoseSpins"),
  loseDifficulty: document.getElementById("gkLoseDifficulty"),
  loseErrors: document.getElementById("gkLoseErrors"),
  loseFlash: document.getElementById("gkLoseFlash"),
  loseGlitchA: document.getElementById("gkLoseGlitchA"),
  loseGlitchB: document.getElementById("gkLoseGlitchB"),
  loseGlitchC: document.getElementById("gkLoseGlitchC"),
  loseRestartBtn: document.getElementById("loseRestartBtn"),
  loseDifficultyBtn: document.getElementById("loseDifficultyBtn"),
  winModal: document.getElementById("winModal"),
  winModalHead: document.getElementById("winModalHead"),
  winModalBody: document.getElementById("winModalBody"),
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
  reelExpandLevel: document.getElementById("reelExpandLevel"),
  reelExpandCost: document.getElementById("reelExpandCost"),
  buyReelBtn: document.getElementById("buyReelBtn"),
  safetyNetLevel: document.getElementById("safetyNetLevel"),
  safetyNetCost: document.getElementById("safetyNetCost"),
  safetyNetRefund: document.getElementById("safetyNetRefund"),
  buySafetyNetBtn: document.getElementById("buySafetyNetBtn"),
  lateRunSinkUnlockNote: document.getElementById("lateRunSinkUnlockNote"),
  houseBribeCost: document.getElementById("houseBribeCost"),
  houseBribeStatus: document.getElementById("houseBribeStatus"),
  buyHouseBribeBtn: document.getElementById("buyHouseBribeBtn"),
  overclockCost: document.getElementById("overclockCost"),
  overclockStatus: document.getElementById("overclockStatus"),
  buyOverclockBtn: document.getElementById("buyOverclockBtn"),
  emergencyBuyoutCost: document.getElementById("emergencyBuyoutCost"),
  emergencyBuyoutStatus: document.getElementById("emergencyBuyoutStatus"),
  buyEmergencyBuyoutBtn: document.getElementById("buyEmergencyBuyoutBtn"),
  vipPassCost: document.getElementById("vipPassCost"),
  vipPassStatus: document.getElementById("vipPassStatus"),
  buyVipPassBtn: document.getElementById("buyVipPassBtn"),
  adviceText: document.getElementById("gkAdviceText"),
};

let gkAdviceIndex = 0;
let gkAdviceTimer = null;
let gkAdviceSwapTimer = null;
let showDifficultyDetails = false;

function getReels() {
  return Array.from(document.querySelectorAll(".reel"));
}

function ensureReelSlots() {
  if (!el.reelsContainer) {
    return;
  }
  const current = el.reelsContainer.querySelectorAll(".reel-slot").length;
  if (current < gameState.reelSlots) {
    for (let i = current; i < gameState.reelSlots; i += 1) {
      const slot = document.createElement("div");
      slot.className = "reel-slot";
      const label = document.createElement("div");
      label.className = "reel-label";
      label.textContent = `Slot ${i + 1}`;
      const reel = document.createElement("div");
      reel.className = "reel";
      reel.id = `reel${i + 1}`;
      reel.textContent = "?";
      slot.appendChild(label);
      slot.appendChild(reel);
      el.reelsContainer.appendChild(slot);
    }
  } else if (current > gameState.reelSlots) {
    const slots = Array.from(el.reelsContainer.querySelectorAll(".reel-slot"));
    slots.slice(gameState.reelSlots).forEach((slot) => slot.remove());
  }
}

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

function setUpgradeInfoMode(showFull) {
  gameState.showFullUpgradeInfo = !!showFull;
  document.body.classList.toggle("full-upgrade-info", gameState.showFullUpgradeInfo);
  document.querySelectorAll(".upgrade-desc").forEach((desc) => {
    const shortText = desc.dataset.short || desc.textContent.trim();
    const fullText = desc.dataset.full || shortText;
    desc.textContent = gameState.showFullUpgradeInfo ? fullText : shortText;
  });
  if (el.showFullInfoCheck) {
    el.showFullInfoCheck.checked = gameState.showFullUpgradeInfo;
  }
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

function getWinSpinTarget() {
  return currentDifficulty().key === "gods_will" ? GODS_WILL_WIN_SPINS : BASE_WIN_SPINS;
}

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function getContractPower() {
  return 1 + gameState.contractLevel * 0.25;
}

function getDebtInterestRate() {
  const greedPenalty = gameState.greedLevel * 0.008;
  const restructureReduction = gameState.restructureSpinsLeft > 0 ? 0.03 + gameState.debtRestructureLevel * 0.005 : 0;
  const godsWillPenalty = currentDifficulty().key === "gods_will" ? GODS_WILL_INTEREST_BONUS : 0;
  const bribeReduction = gameState.houseBribeSpinsLeft > 0 ? HOUSE_BRIBE_INTEREST_REDUCTION : 0;
  const rate = currentDifficulty().baseInterest + godsWillPenalty + gameState.contractLevel * 0.03 + greedPenalty - gameState.shieldLevel * 0.015 - restructureReduction - bribeReduction;
  return Math.max(0.03, rate);
}

function getDebtLimit() {
  const godsWillPenalty = currentDifficulty().key === "gods_will" ? GODS_WILL_DEBT_LIMIT_PENALTY : 0;
  const limit = gameState.debtLimitBase + gameState.effectLevel * 140 + gameState.shieldLevel * 240 - gameState.contractLevel * 25 - godsWillPenalty;
  return Math.max(200, Math.round(limit));
}

function getNetWorth() {
  return gameState.money - gameState.debt;
}

function getTableFee() {
  const d = currentDifficulty();
  const greedFeeGrowth = d.feeGrowth + gameState.greedLevel * 0.04;
  const brokerReduction = Math.max(0.55, 1 - gameState.feeBrokerLevel * 0.12);
  const godsWillFee = d.key === "gods_will" ? GODS_WILL_FEE_FACTOR : 1;
  const bribeFactor = gameState.houseBribeSpinsLeft > 0 ? HOUSE_BRIBE_FEE_FACTOR : 1;
  const vipFactor = gameState.vipPassCharges > 0 ? VIP_PASS_FEE_FACTOR : 1;
  return Math.round(d.feeBase * Math.pow(greedFeeGrowth, gameState.feeLevel) * brokerReduction * godsWillFee * bribeFactor * vipFactor);
}

function difficultySignature(d) {
  if (d.key === "gods_will") {
    return "Hell base plus 7 harsher rules.";
  }
  if (d.key === "hell") {
    return "Hardest core mode. Lower real payout layer.";
  }
  if (d.key === "insane") {
    return "Very tight economy and harsh fee growth.";
  }
  if (d.key === "nightmare") {
    return "Late-run pressure ramps fast.";
  }
  if (d.key === "master") {
    return "High pressure with less recovery room.";
  }
  if (d.key === "expert") {
    return "Mistakes start snowballing quickly.";
  }
  if (d.key === "hard") {
    return "Less forgiving once fees start stacking.";
  }
  if (d.key === "normal") {
    return "Baseline intended balance.";
  }
  if (d.key === "casual") {
    return "Relaxed pressure with real failure still possible.";
  }
  if (d.key === "easy") {
    return "Extra room to recover from bad blocks.";
  }
  return "Most forgiving mode.";
}

function difficultySuggestion(d) {
  if (d.key === "gods_will") {
    return "Suggested for players who already understand fee timing, debt control, and why wide-reel greed gets punished.";
  }
  if (d.key === "hell") {
    return "Suggested for experienced players who want a brutal but still learnable endgame difficulty.";
  }
  if (d.key === "insane") {
    return "Suggested if you already beat Nightmare consistently and want much less recovery room.";
  }
  if (d.key === "nightmare") {
    return "Suggested for players comfortable with recovery play and late-run fee pressure.";
  }
  if (d.key === "master") {
    return "Suggested once Normal, Hard, and Expert feel controlled rather than lucky.";
  }
  if (d.key === "expert") {
    return "Suggested for players who know when to stabilize instead of buying every upgrade they can afford.";
  }
  if (d.key === "hard") {
    return "Suggested if Normal feels too safe and you want fee mistakes to matter more.";
  }
  if (d.key === "normal") {
    return "Suggested starting point for most players.";
  }
  if (d.key === "casual") {
    return "Suggested if you want room to experiment while still learning the economy.";
  }
  if (d.key === "easy") {
    return "Suggested for first runs if you mainly want to learn what upgrades do.";
  }
  return "Suggested if you want the softest learning curve.";
}

function difficultyWarning(d) {
  if (d.key === "gods_will") {
    return "Warning: this mode adds hidden pressure through multiple exclusive rules at once. It is meant to be barely survivable with strong play.";
  }
  if (d.key === "hell") {
    return "Warning: rewards are lower than the visible payout scale suggests because Hell has its own harsher payout layer.";
  }
  if (d.key === "insane" || d.key === "nightmare") {
    return "Warning: one weak fee cycle can start a debt spiral quickly.";
  }
  if (d.key === "master" || d.key === "expert") {
    return "Warning: greedy upgrade paths get punished harder here than on lower modes.";
  }
  if (d.key === "hard") {
    return "Warning: this is usually where players first notice fee timing matters as much as payouts.";
  }
  if (d.key === "normal") {
    return "Warning: balanced does not mean easy. Debt can still snowball if you ignore defense.";
  }
  return "Warning: lower difficulty gives more recovery room, but bad debt habits still carry upward.";
}

function difficultyCompactInfo(d) {
  return `${d.label}: ${difficultySignature(d)} Good for: ${difficultySuggestion(d).replace(/^Suggested /, "").replace(/\.$/, "")}.`;
}

function difficultyModalSummary(d) {
  return [
    `${d.label}: ${difficultySignature(d)}`,
    `Start ${fmt(d.startMoney)}. Goal: survive ${d.key === "gods_will" ? GODS_WILL_WIN_SPINS : BASE_WIN_SPINS} spins.`,
    `Good for: ${difficultySuggestion(d)}`,
  ].join("<br>");
}

function updateObjectiveInfo() {
  const d = currentDifficulty();
  const winTarget = getWinSpinTarget();
  const debtLimit = getDebtLimit();
  if (el.objectiveSummary) {
    el.objectiveSummary.textContent = `Survive ${winTarget} spins on ${d.label} and avoid debt collapse.`;
  }
  if (el.objectiveWinLine) {
    el.objectiveWinLine.innerHTML = `You win the run after surviving <strong>${winTarget} spins</strong> on <strong>${d.label}</strong>.`;
  }
  if (el.objectiveDebtLine) {
    el.objectiveDebtLine.innerHTML = `Debt can keep you alive, but reaching your current <strong>Debt Limit of ${fmt(debtLimit)}</strong> ends the run instantly.`;
  }
}

function difficultyDetailHtml(d) {
  const lines = [
    `${d.label}: Start ${fmt(d.startMoney)}, debt limit ${fmt(d.debtLimit)}, base interest ${Math.round(d.baseInterest * 1000) / 10}%, fee base ${fmt(d.feeBase)}, fee growth x${d.feeGrowth.toFixed(3)}, payout scale x${d.payoutScale.toFixed(2)}.`,
    `Goal: survive ${d.key === "gods_will" ? GODS_WILL_WIN_SPINS : BASE_WIN_SPINS} spins.`,
    `Identity: ${difficultySignature(d)}`,
    `Good for: ${difficultySuggestion(d)}`,
    difficultyWarning(d),
  ];
  if (d.key === "hell") {
    lines.push(`Exclusive rule: real payout layer uses x${HELL_PAYOUT_FACTOR.toFixed(2)} rewards.`);
  }
  if (d.key === "gods_will") {
    lines.push(`Exclusive rules: payout x${GODS_WILL_PAYOUT_FACTOR.toFixed(2)}, fees x${GODS_WILL_FEE_FACTOR.toFixed(2)}, debt interest +${(GODS_WILL_INTEREST_BONUS * 100).toFixed(1)}%.`);
    lines.push(`More rules: effective debt limit -${GODS_WILL_DEBT_LIMIT_PENALTY}, wild rate x${GODS_WILL_WILD_FACTOR.toFixed(2)}, extra-slot penalty ${GODS_WILL_SLOT_PENALTY_PER_EXTRA.toFixed(2)} each.`);
  }
  return lines.join("<br>");
}

function renderDifficultyModalInfo() {
  if (!el.difficultyModalInfo) {
    return;
  }
  const d = currentDifficulty();
  el.difficultyModalInfo.innerHTML = showDifficultyDetails ? difficultyDetailHtml(d) : difficultyModalSummary(d);
  if (el.difficultyMoreBtn) {
    el.difficultyMoreBtn.textContent = showDifficultyDetails ? "Less Info" : "More Info";
  }
}

function spinsLeftInBlock() {
  return gameState.needsFeePayment ? 0 : 10 - gameState.spinsInBlock;
}

function getCost(base, level, growth) {
  return Math.round(base * Math.pow(growth, level) * (1 + gameState.contractLevel * 0.11) * 1.15);
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
  return Math.round(180 * Math.pow(2.2, gameState.contractLevel) * 1.15);
}

function shieldCost() {
  return getCost(220, gameState.shieldLevel, 2.1);
}

function royalCost() {
  return getCost(300, gameState.royalLevel, 2.35);
}

function feeBrokerCost() {
  return getCost(150, gameState.feeBrokerLevel, 2.0);
}

function secondChanceCost() {
  return getCost(110, gameState.secondChanceLevel, 1.8);
}

function greedCost() {
  return getCost(140, gameState.greedLevel, 1.95);
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

function reelExpandCost() {
  const base = getCost(320, gameState.reelExpansionLevel, 2.45);
  const slotPressure = 1 + Math.max(0, gameState.reelSlots - BASE_REEL_SLOTS) * 0.35;
  return Math.round(base * slotPressure);
}

function safetyNetCost() {
  return getCost(130, gameState.safetyNetLevel, 1.9);
}

function houseBribeCost() {
  return Math.round(700 + gameState.feeLevel * 90 + Math.max(0, gameState.spins - 30) * 4);
}

function overclockSpinCost() {
  return Math.round(320 + gameState.spins * 8 + Math.max(0, gameState.reelSlots - BASE_REEL_SLOTS) * 60);
}

function emergencyBuyoutCost() {
  return Math.round(900 + gameState.debt * 0.22 + (gameState.needsFeePayment ? getTableFee() * 1.5 : 0));
}

function vipPassCost() {
  return Math.round(650 + gameState.feeLevel * 70 + gameState.vipPassCharges * 60);
}

function purchaseLevel(kind) {
  const levels = {
    luck: gameState.luckLevel,
    mult: gameState.multLevel,
    effect: gameState.effectLevel,
    contract: gameState.contractLevel,
    shield: gameState.shieldLevel,
    royal: gameState.royalLevel,
    feeBroker: gameState.feeBrokerLevel,
    secondChance: gameState.secondChanceLevel,
    greed: gameState.greedLevel,
    wild: gameState.wildGeneratorLevel,
    restructure: gameState.debtRestructureLevel,
    blood: gameState.bloodDebtLevel,
    safetyNet: gameState.safetyNetLevel,
    reelExpand: gameState.reelExpansionLevel,
  };
  return levels[kind] || 0;
}

function formatLevelProgress(kind, level) {
  const cap = PURCHASE_CAPS[kind];
  if (cap === undefined || cap === null || !Number.isFinite(cap)) {
    return String(level);
  }
  return level >= cap ? `${level}/${cap} MAX` : `${level}/${cap}`;
}

function isPurchaseCapped(kind) {
  return purchaseLevel(kind) >= (PURCHASE_CAPS[kind] ?? Infinity);
}

function completedCapCount() {
  return Object.keys(PURCHASE_CAPS).reduce((count, key) => count + (isPurchaseCapped(key) ? 1 : 0), 0);
}

function lateRunSinksUnlocked() {
  return completedCapCount() >= 4 || gameState.bestNetWorth >= 4500 || (gameState.spins >= 60 && gameState.reelSlots >= 5);
}

function lateRunSinkUnlockText() {
  if (lateRunSinksUnlocked()) {
    return `Unlocked: ${completedCapCount()} capped buys maxed, best net worth ${fmt(gameState.bestNetWorth)}.`;
  }
  return `Locked: max 4 capped buys, reach ${fmt(4500)} best net worth, or survive 60 spins with 5+ reels. Current maxed: ${completedCapCount()}.`;
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
  const reels = getReels();
  reels.forEach((reel, i) => {
    const symbol = result[i];
    if (!symbol) {
      reel.textContent = "?";
      reel.removeAttribute("title");
      return;
    }
    reel.textContent = symbol.icon;
    reel.setAttribute("title", symbol.name);
  });
}

function getBaseMultPower() {
  return 1 + gameState.multLevel * 0.2 * getContractPower();
}

function getDeterministicPayout(baseAmount) {
  const greedMult = 1 + gameState.greedLevel * 0.08;
  const extraSlots = Math.max(0, gameState.reelSlots - BASE_REEL_SLOTS);
  const slotPenaltyPerExtra = currentDifficulty().key === "gods_will" ? GODS_WILL_SLOT_PENALTY_PER_EXTRA : 0.3;
  const slotPenalty = 1 / (1 + extraSlots * slotPenaltyPerExtra);
  const exclusiveFactor = currentDifficulty().key === "hell"
    ? HELL_PAYOUT_FACTOR
    : (currentDifficulty().key === "gods_will" ? GODS_WILL_PAYOUT_FACTOR : 1);
  let payout = baseAmount * getBaseMultPower() * currentDifficulty().payoutScale * greedMult * 0.65 * slotPenalty * GLOBAL_PAYOUT_EASE_MULTIPLIER * exclusiveFactor;
  if (gameState.royalLevel > 0 && payout > 0) {
    payout *= 1 + gameState.royalLevel * 0.18;
  }
  return Math.round(payout);
}

function getComboMultiplier(matches) {
  if (matches >= 8) {
    return 4.5;
  }
  if (matches === 7) {
    return 4.0;
  }
  if (matches === 6) {
    return 3.6;
  }
  if (matches === 5) {
    return 3.2;
  }
  if (matches === 4) {
    return 2.8;
  }
  if (matches === 3) {
    return 2.7;
  }
  if (matches === 2) {
    return 1.05;
  }
  return 0;
}

function renderPayoutTable() {
  if (!el.payoutBody) {
    return;
  }
  const rows = [];
  const maxMatches = Math.min(MAX_REEL_SLOTS, gameState.reelSlots);
  for (const sym of SYMBOLS) {
    for (let count = maxMatches; count >= 2; count -= 1) {
      const mult = getComboMultiplier(count);
      if (mult <= 0) {
        continue;
      }
      const base = gameState.currentBet * sym.value * mult;
      const label = count === 2 ? `${sym.name} pair` : `${sym.name} x${count}`;
      rows.push({ combo: `${sym.icon} ${label}`, payout: getDeterministicPayout(base) });
    }
  }
  rows.push({ combo: "High-value mixed line bonus", payout: getDeterministicPayout(gameState.currentBet * 1.35) });
  el.payoutBody.innerHTML = rows.map((r) => `<tr><td>${r.combo}</td><td>${fmt(r.payout)}</td></tr>`).join("");
}

function animateSpin(result) {
  return new Promise((resolve) => {
    const reels = getReels();
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
  return gameState.debt < getDebtLimit();
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
  const bet = gameState.currentBet;
  let bestBase = 0;
  let line = "No match.";
  const wildCount = result.filter((s) => s.isWild).length;

  for (const sym of SYMBOLS) {
    const ownCount = result.filter((s) => s.name === sym.name).length;
    const matches = ownCount + wildCount;
    const mult = getComboMultiplier(matches);
    if (mult <= 0) {
      continue;
    }
    const base = bet * sym.value * mult;
    if (base > bestBase) {
      bestBase = base;
      if (matches >= 4) {
        line = `MEGA ${sym.name} x${matches}!`;
      } else if (matches === 3) {
        line = `TRIPLE ${sym.name}!`;
      } else {
        line = `Pair of ${sym.name}.`;
      }
    }
  }
  if (bestBase <= 0) {
    const sum = result.reduce((acc, s) => acc + s.value, 0);
    if (sum > 10.5) {
      bestBase = bet * 1.35;
      line = "High-value mixed line bonus.";
    }
  }

  let payout = getDeterministicPayout(bestBase);
  if (gameState.overclockActive && payout > 0) {
    payout = Math.round(payout * OVERCLOCK_PAYOUT_FACTOR);
  }
  let bonusLine = "";
  const effectPower = getContractPower();
  const procBonus = gameState.overclockActive ? OVERCLOCK_PROC_BONUS : 0;
  if (gameState.effectLevel >= 1 && payout > 0 && Math.random() < (0.09 * effectPower + procBonus)) {
    payout *= 2;
    bonusLine = " Chaos: Double payout.";
  }
  if (gameState.effectLevel >= 2 && Math.random() < (0.065 * effectPower + procBonus * 0.7)) {
    payout += Math.max(100, Math.round(bet * 2));
    bonusLine += " Jackpot surge activated.";
  }
  if (gameState.effectLevel >= 3 && Math.random() < (0.12 * effectPower + procBonus)) {
    gameState.money += bet;
    bonusLine += " Free spin refund.";
  }
  if (gameState.overclockActive && payout > 0) {
    bonusLine += " Overclock spin charged the machine.";
  }
  if (gameState.royalLevel > 0 && payout > 0 && Math.random() < 0.035 * gameState.royalLevel) {
    payout += Math.max(200, bet * 5);
    bonusLine += " Royal jackpot burst.";
  }
  return { payout: Math.round(payout), line: `${line}${bonusLine}`.trim() };
}

function hideAllOverlays() {
  stopLoseExecutionEffects();
  el.devilEvent.classList.add("hidden");
  el.difficultyModal.classList.add("hidden");
  el.loseModal.classList.add("hidden");
  el.winModal.classList.add("hidden");
  el.inventoryModal.classList.add("hidden");
}

function setExecutionGlitchLine(node, text) {
  if (!node) return;
  node.textContent = text;
  node.setAttribute("data-text", text);
}

function setExecutionInfoLine(node, text) {
  if (!node) return;
  node.textContent = text;
  node.setAttribute("data-text", text);
}

function stopLoseExecutionEffects() {
  if (loseCorruptionTimer) {
    window.clearTimeout(loseCorruptionTimer);
    loseCorruptionTimer = null;
  }
  if (loseErrorMutationTimer) {
    window.clearTimeout(loseErrorMutationTimer);
    loseErrorMutationTimer = null;
  }
  if (loseTextCorruptionTimer) {
    window.clearTimeout(loseTextCorruptionTimer);
    loseTextCorruptionTimer = null;
  }
  if (el.loseModal) {
    el.loseModal.style.filter = "none";
    el.loseModal.style.transform = "translate(0, 0)";
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
    el.loseReason,
    el.loseMoney,
    el.loseSpins,
    el.loseDifficulty,
  ].forEach((node) => {
    if (!node) return;
    node.classList.remove("execution-corrupt");
    const stable = node.getAttribute("data-text");
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
    el.loseReason,
    el.loseMoney,
    el.loseSpins,
    el.loseDifficulty,
  ].filter(Boolean);
  if (nodes.length) {
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    const stable = node.getAttribute("data-text") || node.textContent;
    node.classList.add("execution-corrupt");
    node.textContent = corruptExecutionText(stable);
    window.setTimeout(() => {
      node.textContent = stable;
      node.classList.remove("execution-corrupt");
    }, 140 + Math.random() * 220);
  }
  loseTextCorruptionTimer = window.setTimeout(pulseLoseExecutionText, 850 + Math.random() * 1700);
}

function mutateLoseExecutionErrors() {
  if (!el.loseErrors || el.loseModal.classList.contains("hidden")) {
    return;
  }
  const items = el.loseErrors.querySelectorAll("span");
  items.forEach((item) => {
    if (Math.random() < 0.28) item.textContent = EXECUTION_ERROR_POOL[Math.floor(Math.random() * EXECUTION_ERROR_POOL.length)];
    if (Math.random() < 0.18) {
      item.style.top = `${Math.random() * 100}%`;
      item.style.left = `${Math.random() * 100}%`;
    }
  });
  loseErrorMutationTimer = window.setTimeout(mutateLoseExecutionErrors, 700 + Math.random() * 1400);
}

function triggerLoseExecutionCorruption() {
  if (!el.loseModal || !el.loseFlash || el.loseModal.classList.contains("hidden")) {
    return;
  }
  const intensity = 118 + Math.floor(Math.random() * 34);
  const hue = -8 + Math.floor(Math.random() * 16);
  const x = -2 + Math.random() * 4;
  const y = -2 + Math.random() * 4;
  el.loseModal.style.filter = `contrast(${intensity}%) hue-rotate(${hue}deg) brightness(1.15)`;
  el.loseModal.style.transform = `translate(${x}px, ${y}px)`;
  el.loseFlash.style.background = "rgba(255, 40, 40, 0.12)";
  window.setTimeout(() => {
    if (el.loseModal.classList.contains("hidden")) return;
    el.loseModal.style.filter = "none";
    el.loseModal.style.transform = "translate(0, 0)";
    el.loseFlash.style.background = "rgba(255, 40, 40, 0)";
  }, 70 + Math.random() * 60);
  loseCorruptionTimer = window.setTimeout(triggerLoseExecutionCorruption, 2500 + Math.random() * 4000);
}

function initLoseExecutionEffects() {
  if (!el.loseErrors) return;
  stopLoseExecutionEffects();
  el.loseErrors.innerHTML = "";
  for (let i = 0; i < 26; i += 1) {
    const node = document.createElement("span");
    node.textContent = EXECUTION_ERROR_POOL[Math.floor(Math.random() * EXECUTION_ERROR_POOL.length)];
    node.style.top = `${Math.random() * 100}%`;
    node.style.left = `${Math.random() * 100}%`;
    node.style.animationDuration = `${8 + Math.random() * 8}s`;
    node.style.animationDelay = `${-Math.random() * 10}s`;
    el.loseErrors.appendChild(node);
  }
  mutateLoseExecutionErrors();
  loseCorruptionTimer = window.setTimeout(triggerLoseExecutionCorruption, 1800);
  loseTextCorruptionTimer = window.setTimeout(pulseLoseExecutionText, 900);
}

function showDifficultyModal() {
  hideAllOverlays();
  el.difficultySelectModal.value = gameState.difficultyKey;
  showDifficultyDetails = false;
  renderDifficultyModalInfo();
  el.difficultyModal.classList.remove("hidden");
}

function showLoseModal(reason) {
  hideAllOverlays();
  const accountCode = `${Math.abs((gameState.money * 17) + (gameState.debt * 13) + (gameState.spins * 29)).toString(16).toUpperCase().slice(0, 6) || "6479A7"}`;
  setExecutionInfoLine(el.loseAccount, `ACCOUNT: ${accountCode}`);
  setExecutionInfoLine(el.loseDebt, gameState.debt > 0 ? `DEBT: ${Math.round(gameState.debt)} UNPAID` : "DEBT: UNPAID");
  setExecutionInfoLine(el.loseHand, "RUN: BANKRUPT");
  setExecutionInfoLine(el.loseLuck, "LUCK: EXHAUSTED");
  setExecutionInfoLine(el.loseSentence, "SENTENCE: EXECUTION");
  setExecutionInfoLine(el.loseReason, reason.toUpperCase());
  setExecutionInfoLine(el.loseMoney, `ASSETS: ${Math.round(gameState.money)}$`);
  setExecutionInfoLine(el.loseSpins, `SPINS: ${gameState.spins}`);
  setExecutionInfoLine(el.loseDifficulty, `MODE: ${currentDifficulty().label.toUpperCase()}`);
  setExecutionGlitchLine(el.loseGlitchA, "ACCOUNT RECORD: PURGED");
  setExecutionGlitchLine(el.loseGlitchB, currentDifficulty().key === "gods_will" ? "ARCHIVE ERROR: 0xDEAD" : "ARCHIVE ERROR: 0xC0FFIN");
  setExecutionGlitchLine(el.loseGlitchC, "DATA INTEGRITY: FAILED");
  el.loseModal.classList.remove("hidden");
  initLoseExecutionEffects();
}

function showWinModal() {
  const targetSpins = getWinSpinTarget();
  if (el.winModalHead) {
    el.winModalHead.textContent = `${targetSpins} Spins Cleared`;
  }
  if (el.winModalBody) {
    el.winModalBody.textContent = `You survived ${targetSpins} spins on ${currentDifficulty().label}. This run is considered a win.`;
  }
  if (el.continueAfterWinBtn) {
    el.continueAfterWinBtn.textContent = `Continue Beyond ${targetSpins}`;
  }
  hideAllOverlays();
  el.winModal.classList.remove("hidden");
}

function updateDifficultyInfo() {
  const d = currentDifficulty();
  if (el.difficultyBadge) {
    el.difficultyBadge.textContent = d.label;
  }
  el.difficultyInfo.textContent = difficultyCompactInfo(d);
  updateObjectiveInfo();
}

function gamblingKingAdviceLine() {
  if (!gameState.runStarted) {
    return "Pick a difficulty, then plan for fees before you plan for greed. The house wins long wars through pressure.";
  }
  if (gameState.isGameOver) {
    return "Look at what ended the run: debt cap, unpaid fee pressure, or weak payouts. That usually tells you the next fix.";
  }
  if (gameState.needsFeePayment) {
    return `A fee is due now. Protect ${fmt(getTableFee())} before buying more upgrades.`;
  }
  if (!el.inventoryModal.classList.contains("hidden")) {
    return "Defensive upgrades smooth bad blocks. Payout upgrades only matter if the run survives long enough to use them.";
  }
  if (gameState.houseBribeSpinsLeft > 0) {
    return `House Bribe active for ${gameState.houseBribeSpinsLeft} more spins. Use the cheaper pressure window well.`;
  }
  if (gameState.overclockCharges > 0) {
    return `Overclock Spin charge ready: ${gameState.overclockCharges}. Spend it when one premium spin matters.`;
  }
  if (gameState.vipPassCharges > 0 && gameState.needsFeePayment) {
    return `VIP Table Pass will cut this fee in half. Stored passes: ${gameState.vipPassCharges}.`;
  }
  if (gameState.debt > gameState.money) {
    return "Debt is above cash. This is recovery mode, not greed mode.";
  }
  if (gameState.secondChanceTokens > 0 && !gameState.secondChanceArmed) {
    return "A Second Chance token is idle. Arm it before a dangerous block wastes it.";
  }
  if (currentDifficulty().key === "gods_will") {
    return "Gods Will is not won by scaling wide and hoping. Tight economy and controlled losses matter more.";
  }
  return GK_ADVICE_LINES[gkAdviceIndex % GK_ADVICE_LINES.length];
}

function updateGamblingKingAdvice(advance = false) {
  if (!el.adviceText) {
    return;
  }
  if (advance) {
    gkAdviceIndex = (gkAdviceIndex + 1) % GK_ADVICE_LINES.length;
  }
  const nextText = gamblingKingAdviceLine();
  if (el.adviceText.textContent === nextText) {
    return;
  }
  if (gkAdviceSwapTimer) {
    window.clearTimeout(gkAdviceSwapTimer);
  }
  el.adviceText.classList.remove("tip-entered");
  void el.adviceText.offsetWidth;
  el.adviceText.classList.add("tip-switching");
  gkAdviceSwapTimer = window.setTimeout(() => {
    el.adviceText.textContent = nextText;
    el.adviceText.classList.remove("tip-switching");
    el.adviceText.classList.add("tip-entered");
  }, 130);
}

function startGamblingKingAdviceRotation() {
  if (!el.adviceText || gkAdviceTimer) {
    return;
  }
  updateGamblingKingAdvice(false);
  gkAdviceTimer = window.setInterval(() => updateGamblingKingAdvice(true), 7000);
}

function applyFixedSpinCost() {
  gameState.currentBet = SPIN_COST;
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
  if (gameState.debt >= getDebtLimit()) {
    endRun(`Debt reached the limit of ${fmt(getDebtLimit())}.`);
    return true;
  }
  return false;
}

function buildSpinResult() {
  const result = Array.from({ length: gameState.reelSlots }, () => chooseSymbol());
  if (gameState.wildGeneratorLevel > 0 || gameState.overclockActive) {
    const wildFactor = currentDifficulty().key === "gods_will" ? GODS_WILL_WILD_FACTOR : 1;
    const overclockBonus = gameState.overclockActive ? OVERCLOCK_WILD_BONUS : 0;
    const wildChance = Math.min(0.75, gameState.wildGeneratorLevel * 0.05 * wildFactor + overclockBonus);
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
  el.reelSlots.textContent = String(gameState.reelSlots);
  el.tableFee.textContent = gameState.needsFeePayment ? fmt(getTableFee()) : "$0";
  updateDifficultyInfo();

  el.luckLevel.textContent = formatLevelProgress("luck", gameState.luckLevel);
  el.multLevel.textContent = formatLevelProgress("mult", gameState.multLevel);
  el.effectLevel.textContent = formatLevelProgress("effect", gameState.effectLevel);
  el.contractLevel.textContent = formatLevelProgress("contract", gameState.contractLevel);
  el.shieldLevel.textContent = formatLevelProgress("shield", gameState.shieldLevel);
  el.royalLevel.textContent = formatLevelProgress("royal", gameState.royalLevel);
  if (el.feeBrokerLevel) {
    el.feeBrokerLevel.textContent = formatLevelProgress("feeBroker", gameState.feeBrokerLevel);
  }
  el.luckCost.textContent = isPurchaseCapped("luck") ? "MAX" : fmt(luckCost());
  el.multCost.textContent = isPurchaseCapped("mult") ? "MAX" : fmt(multCost());
  el.effectCost.textContent = isPurchaseCapped("effect") ? "MAX" : fmt(effectCost());
  el.contractCost.textContent = isPurchaseCapped("contract") ? "MAX" : fmt(contractCost());
  el.shieldCost.textContent = isPurchaseCapped("shield") ? "MAX" : fmt(shieldCost());
  el.royalCost.textContent = isPurchaseCapped("royal") ? "MAX" : fmt(royalCost());
  if (el.feeBrokerCost) {
    el.feeBrokerCost.textContent = isPurchaseCapped("feeBroker") ? "MAX" : fmt(feeBrokerCost());
  }
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
  if (el.feeBrokerReduction) {
    el.feeBrokerReduction.textContent = String(gameState.feeBrokerLevel * 12);
  }
  el.secondChanceLevel.textContent = formatLevelProgress("secondChance", gameState.secondChanceLevel);
  el.secondChanceCost.textContent = isPurchaseCapped("secondChance") ? "MAX" : fmt(secondChanceCost());
  el.secondChanceTokens.textContent = String(gameState.secondChanceTokens);
  el.greedLevel.textContent = formatLevelProgress("greed", gameState.greedLevel);
  el.greedCost.textContent = isPurchaseCapped("greed") ? "MAX" : fmt(greedCost());
  el.greedPayoutBonus.textContent = String(gameState.greedLevel * 8);
  el.greedRiskPenalty.textContent = (gameState.greedLevel * 0.8).toFixed(1);
  el.wildLevel.textContent = formatLevelProgress("wild", gameState.wildGeneratorLevel);
  el.wildCost.textContent = isPurchaseCapped("wild") ? "MAX" : fmt(wildCost());
  const wildFactor = currentDifficulty().key === "gods_will" ? GODS_WILL_WILD_FACTOR : 1;
  el.wildChanceValue.textContent = (Math.min(45, gameState.wildGeneratorLevel * 5 * wildFactor)).toFixed(1);
  el.restructureLevel.textContent = formatLevelProgress("restructure", gameState.debtRestructureLevel);
  el.restructureCost.textContent = isPurchaseCapped("restructure") ? "MAX" : fmt(restructureCost());
  el.restructureActive.textContent = String(gameState.restructureSpinsLeft);
  el.bloodLevel.textContent = formatLevelProgress("blood", gameState.bloodDebtLevel);
  el.bloodCost.textContent = isPurchaseCapped("blood") ? "MAX" : fmt(bloodCost());
  el.bloodLuckBonus.textContent = (gameState.bloodDebtLevel * 7).toFixed(1);
  el.bloodDrainValue.textContent = (gameState.bloodDebtLevel * 6).toFixed(1);
  if (el.safetyNetLevel) {
    el.safetyNetLevel.textContent = formatLevelProgress("safetyNet", gameState.safetyNetLevel);
  }
  if (el.safetyNetCost) {
    el.safetyNetCost.textContent = isPurchaseCapped("safetyNet") ? "MAX" : fmt(safetyNetCost());
  }
  if (el.safetyNetRefund) {
    el.safetyNetRefund.textContent = String(gameState.safetyNetLevel * 12);
  }
  if (el.reelExpandLevel) {
    el.reelExpandLevel.textContent = formatLevelProgress("reelExpand", gameState.reelExpansionLevel);
  }
  if (el.reelExpandCost) {
    el.reelExpandCost.textContent = isPurchaseCapped("reelExpand") || gameState.reelSlots >= MAX_REEL_SLOTS ? "MAX" : fmt(reelExpandCost());
  }
  if (el.lateRunSinkUnlockNote) {
    el.lateRunSinkUnlockNote.textContent = lateRunSinkUnlockText();
  }
  if (el.houseBribeCost) {
    el.houseBribeCost.textContent = fmt(houseBribeCost());
  }
  if (el.houseBribeStatus) {
    el.houseBribeStatus.textContent = gameState.houseBribeSpinsLeft > 0 ? `${gameState.houseBribeSpinsLeft} spins left` : "Inactive";
  }
  if (el.overclockCost) {
    el.overclockCost.textContent = fmt(overclockSpinCost());
  }
  if (el.overclockStatus) {
    el.overclockStatus.textContent = String(gameState.overclockCharges);
  }
  if (el.emergencyBuyoutCost) {
    el.emergencyBuyoutCost.textContent = fmt(emergencyBuyoutCost());
  }
  if (el.emergencyBuyoutStatus) {
    el.emergencyBuyoutStatus.textContent = gameState.lastBuyoutRelief > 0 ? `Last relief ${fmt(gameState.lastBuyoutRelief)}` : "No bailout used";
  }
  if (el.vipPassCost) {
    el.vipPassCost.textContent = fmt(vipPassCost());
  }
  if (el.vipPassStatus) {
    el.vipPassStatus.textContent = String(gameState.vipPassCharges);
  }
  updateGamblingKingAdvice(false);

  const overlayActive = gameState.devilActive || !el.difficultyModal.classList.contains("hidden") || !el.loseModal.classList.contains("hidden") || !el.winModal.classList.contains("hidden");
  const lockedByState = !gameState.runStarted || gameState.isGameOver || gameState.isSpinning || overlayActive;
  const lateRunLocked = !lateRunSinksUnlocked();
  el.repayBtn.disabled = !(gameState.money >= 50 && gameState.debt > 0) || lockedByState;
  el.spinBtn.disabled = lockedByState || gameState.needsFeePayment;
  el.skipAnimBtn.disabled = !gameState.isSpinning;
  el.payFeeBtn.disabled = lockedByState || !gameState.needsFeePayment;
  el.buyLuckBtn.disabled = lockedByState || isPurchaseCapped("luck");
  el.buyMultBtn.disabled = lockedByState || isPurchaseCapped("mult");
  el.buyEffectBtn.disabled = lockedByState || isPurchaseCapped("effect");
  el.buyContractBtn.disabled = lockedByState || isPurchaseCapped("contract");
  el.buySecondChanceBtn.disabled = lockedByState || isPurchaseCapped("secondChance");
  el.useSecondChanceBtn.disabled = lockedByState || gameState.secondChanceTokens <= 0;
  el.buyGreedBtn.disabled = lockedByState || isPurchaseCapped("greed");
  el.buyWildBtn.disabled = lockedByState || isPurchaseCapped("wild");
  el.buyRestructureBtn.disabled = lockedByState || isPurchaseCapped("restructure");
  el.buyBloodBtn.disabled = lockedByState || isPurchaseCapped("blood");
  if (el.buyFeeBrokerBtn) {
    el.buyFeeBrokerBtn.disabled = lockedByState || isPurchaseCapped("feeBroker");
  }
  if (el.buySafetyNetBtn) {
    el.buySafetyNetBtn.disabled = lockedByState || isPurchaseCapped("safetyNet");
  }
  if (el.buyReelBtn) {
    el.buyReelBtn.disabled = lockedByState || isPurchaseCapped("reelExpand") || gameState.reelSlots >= MAX_REEL_SLOTS;
  }
  if (el.buyHouseBribeBtn) {
    el.buyHouseBribeBtn.disabled = lockedByState || lateRunLocked;
  }
  if (el.buyOverclockBtn) {
    el.buyOverclockBtn.disabled = lockedByState || lateRunLocked;
  }
  if (el.buyEmergencyBuyoutBtn) {
    el.buyEmergencyBuyoutBtn.disabled = lockedByState || lateRunLocked;
  }
  if (el.buyVipPassBtn) {
    el.buyVipPassBtn.disabled = lockedByState || lateRunLocked;
  }
  el.openInventoryBtn.disabled = !gameState.runStarted || gameState.isSpinning || gameState.devilActive;

  const shieldUnlocked = isShieldUnlocked();
  const royalUnlocked = isRoyalUnlocked();
  el.buyShieldBtn.disabled = lockedByState || !shieldUnlocked || isPurchaseCapped("shield");
  el.buyRoyalBtn.disabled = lockedByState || !royalUnlocked || isPurchaseCapped("royal");
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
  gameState.currentBet = SPIN_COST;
  gameState.luckLevel = 0;
  gameState.multLevel = 0;
  gameState.effectLevel = 0;
  gameState.contractLevel = 0;
  gameState.shieldLevel = 0;
  gameState.royalLevel = 0;
  gameState.feeBrokerLevel = 0;
  gameState.secondChanceLevel = 0;
  gameState.secondChanceTokens = 0;
  gameState.secondChanceArmed = false;
  gameState.greedLevel = 0;
  gameState.wildGeneratorLevel = 0;
  gameState.debtRestructureLevel = 0;
  gameState.restructureSpinsLeft = 0;
  gameState.bloodDebtLevel = 0;
  gameState.reelExpansionLevel = 0;
  gameState.safetyNetLevel = 0;
  gameState.houseBribeSpinsLeft = 0;
  gameState.overclockCharges = 0;
  gameState.vipPassCharges = 0;
  gameState.lastBuyoutRelief = 0;
  gameState.overclockActive = false;
  gameState.reelSlots = BASE_REEL_SLOTS;
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

  ensureReelSlots();
  getReels().forEach((reel) => {
    reel.textContent = "?";
    reel.removeAttribute("title");
  });
  hideAllOverlays();
  applyFixedSpinCost();
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
  gameState.overclockActive = gameState.overclockCharges > 0;
  if (gameState.overclockActive) {
    gameState.overclockCharges -= 1;
  }

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
  let safetyRefund = 0;
  if (outcome.payout <= 0 && gameState.safetyNetLevel > 0) {
    safetyRefund = Math.round(gameState.currentBet * (gameState.safetyNetLevel * 0.12));
    gameState.money += safetyRefund;
  }
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
  if (gameState.houseBribeSpinsLeft > 0) {
    gameState.houseBribeSpinsLeft -= 1;
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
  const safetyLine = safetyRefund > 0 ? ` Safety Net refunded ${fmt(safetyRefund)}.` : "";
  const interestLine = interestGain > 0 ? ` Interest charged: ${fmt(interestGain)}.` : "";
  const overclockLine = gameState.overclockActive ? " Overclock Spin was consumed." : "";
  const feeLine = gameState.needsFeePayment ? ` Table fee due: ${fmt(getTableFee())} before next 10 spins.` : "";
  el.log.textContent = `${resultText}. ${outcome.line} ${payoutLine}${safetyLine}${interestLine}${overclockLine}${feeLine}`;
  gameState.overclockActive = false;
  updateUI();

  const targetSpins = getWinSpinTarget();
  if (!gameState.wonAt100 && gameState.spins >= targetSpins) {
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
  if (gameState.vipPassCharges > 0) {
    gameState.vipPassCharges -= 1;
  }
  gameState.needsFeePayment = false;
  el.log.textContent = `Table fee ${fmt(fee)} paid. Next 10 spins unlocked.`;
  updateUI();
}

function buyUpgrade(kind) {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive) {
    return;
  }
  if (isPurchaseCapped(kind)) {
    el.log.textContent = "That upgrade is already at its cap.";
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
  } else if (kind === "feeBroker") {
    cost = feeBrokerCost();
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
  } else if (kind === "feeBroker") {
    gameState.feeBrokerLevel += 1;
  } else {
    gameState.contractLevel += 1;
  }
  renderPayoutTable();
  el.log.textContent = kind === "feeBroker" ? "Fee Broker upgraded. Table fees reduced." : "Upgrade purchased.";
  updateUI();
}

function buyLateRunSink(kind) {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive) {
    return;
  }
  if (!lateRunSinksUnlocked()) {
    el.log.textContent = lateRunSinkUnlockText();
    return;
  }
  if (kind === "buyout" && gameState.debt <= 0 && !gameState.needsFeePayment) {
    el.log.textContent = "Emergency Buyout needs debt or a due fee to matter.";
    return;
  }

  let cost = 0;
  if (kind === "houseBribe") {
    cost = houseBribeCost();
  } else if (kind === "overclock") {
    cost = overclockSpinCost();
  } else if (kind === "buyout") {
    cost = emergencyBuyoutCost();
  } else if (kind === "vipPass") {
    cost = vipPassCost();
  }

  if (gameState.money < cost) {
    el.log.textContent = "Not enough money for this late-run cash sink.";
    return;
  }

  gameState.money -= cost;

  if (kind === "houseBribe") {
    gameState.houseBribeSpinsLeft += 10;
    el.log.textContent = `House Bribe bought. House pressure eased for ${gameState.houseBribeSpinsLeft} spins.`;
  } else if (kind === "overclock") {
    gameState.overclockCharges += 1;
    el.log.textContent = `Overclock Spin charged. Stored charges: ${gameState.overclockCharges}.`;
  } else if (kind === "buyout") {
    const debtCut = Math.max(250, Math.round(gameState.debt * 0.22));
    const actualDebtCut = Math.min(gameState.debt, debtCut);
    gameState.debt = Math.max(0, gameState.debt - actualDebtCut);
    let feeText = "";
    if (gameState.needsFeePayment) {
      gameState.needsFeePayment = false;
      feeText = " Current table fee erased.";
    }
    gameState.lastBuyoutRelief = actualDebtCut;
    el.log.textContent = `Emergency Buyout cut ${fmt(actualDebtCut)} debt.${feeText}`;
  } else if (kind === "vipPass") {
    gameState.vipPassCharges += 1;
    el.log.textContent = `VIP Table Pass bought. Stored fee discounts: ${gameState.vipPassCharges}.`;
  }

  updateUI();
}

function buyShopItem(kind) {
  if (!gameState.runStarted || gameState.isGameOver || gameState.isSpinning || gameState.devilActive) {
    return;
  }
  if (isPurchaseCapped(kind)) {
    el.log.textContent = "That item is already at its cap.";
    return;
  }
  let cost = 0;
  if (kind === "secondChance") {
    cost = secondChanceCost();
  } else if (kind === "greed") {
    cost = greedCost();
  } else if (kind === "wild") {
    cost = wildCost();
  } else if (kind === "restructure") {
    cost = restructureCost();
  } else if (kind === "reelExpand") {
    if (gameState.reelSlots >= MAX_REEL_SLOTS) {
      el.log.textContent = "Reel slots are already maxed.";
      return;
    }
    cost = reelExpandCost();
  } else if (kind === "safetyNet") {
    cost = safetyNetCost();
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
  } else if (kind === "wild") {
    gameState.wildGeneratorLevel += 1;
    el.log.textContent = "Wild Generator upgraded.";
  } else if (kind === "restructure") {
    gameState.debtRestructureLevel += 1;
    const debtCut = Math.round(gameState.debt * (0.12 + gameState.debtRestructureLevel * 0.03));
    gameState.debt = Math.max(0, gameState.debt - debtCut);
    gameState.restructureSpinsLeft += 3;
    el.log.textContent = `Debt Restructuring activated. Debt reduced by ${fmt(debtCut)}.`;
  } else if (kind === "reelExpand") {
    gameState.reelExpansionLevel += 1;
    gameState.reelSlots = Math.min(MAX_REEL_SLOTS, BASE_REEL_SLOTS + gameState.reelExpansionLevel);
    ensureReelSlots();
    el.log.textContent = `Reel Expansion purchased. You now have ${gameState.reelSlots} slots.`;
  } else if (kind === "safetyNet") {
    gameState.safetyNetLevel += 1;
    el.log.textContent = "Safety Net upgraded. Dead spins now refund part of the spin cost.";
  } else {
    gameState.bloodDebtLevel += 1;
    el.log.textContent = "Blood Debt upgraded. Luck rises, spin drain rises.";
  }

  renderPayoutTable();
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
  el.buyFeeBrokerBtn?.addEventListener("click", () => buyUpgrade("feeBroker"));
  el.buySecondChanceBtn.addEventListener("click", () => buyShopItem("secondChance"));
  el.useSecondChanceBtn.addEventListener("click", useSecondChanceToken);
  el.buyGreedBtn.addEventListener("click", () => buyShopItem("greed"));
  el.buyWildBtn.addEventListener("click", () => buyShopItem("wild"));
  el.buyRestructureBtn.addEventListener("click", () => buyShopItem("restructure"));
  el.buyBloodBtn.addEventListener("click", () => buyShopItem("blood"));
  el.buyReelBtn?.addEventListener("click", () => buyShopItem("reelExpand"));
  el.buySafetyNetBtn?.addEventListener("click", () => buyShopItem("safetyNet"));
  el.buyHouseBribeBtn?.addEventListener("click", () => buyLateRunSink("houseBribe"));
  el.buyOverclockBtn?.addEventListener("click", () => buyLateRunSink("overclock"));
  el.buyEmergencyBuyoutBtn?.addEventListener("click", () => buyLateRunSink("buyout"));
  el.buyVipPassBtn?.addEventListener("click", () => buyLateRunSink("vipPass"));
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
  el.difficultyMoreBtn?.addEventListener("click", () => {
    showDifficultyDetails = !showDifficultyDetails;
    renderDifficultyModalInfo();
  });
  el.difficultySelectModal.addEventListener("change", () => {
    gameState.difficultyKey = el.difficultySelectModal.value;
    renderDifficultyModalInfo();
  });

  el.loseRestartBtn.addEventListener("click", () => startRun(`Run restarted on ${currentDifficulty().label}.`));
  el.loseDifficultyBtn.addEventListener("click", () => showDifficultyModal());
  el.continueAfterWinBtn.addEventListener("click", () => {
    hideAllOverlays();
    el.log.textContent = `You chose to continue beyond ${getWinSpinTarget()} spins.`;
    updateUI();
  });
  el.winDifficultyBtn.addEventListener("click", () => showDifficultyModal());

  el.showKeybindsCheck.addEventListener("change", () => setShowKeybinds(el.showKeybindsCheck.checked));
  el.showFullInfoCheck?.addEventListener("change", () => setUpgradeInfoMode(el.showFullInfoCheck.checked));
  document.addEventListener("keydown", (event) => {
    const key = event.key;
    const upper = key.length === 1 ? key.toUpperCase() : key;

    if (!el.inventoryModal.classList.contains("hidden") && (upper === "ESCAPE" || upper === "I")) {
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
        "9": el.buyFeeBrokerBtn,
        "7": el.buySecondChanceBtn,
        "8": el.buyGreedBtn,
        "0": el.buyWildBtn,
        "-": el.buyRestructureBtn,
        "=": el.buyBloodBtn,
        "[": el.buySafetyNetBtn,
        "]": el.buyReelBtn,
        "H": el.buyHouseBribeBtn,
        "O": el.buyOverclockBtn,
        "B": el.buyEmergencyBuyoutBtn,
        "V": el.buyVipPassBtn,
        "C": el.useSecondChanceBtn,
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
  setUpgradeInfoMode(false);
  ensureReelSlots();
  applyFixedSpinCost();
  renderPayoutTable();
  startGamblingKingAdviceRotation();
  showDifficultyModal();
  updateUI();
}
