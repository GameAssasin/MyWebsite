const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const sitePage = document.querySelector(".site-page");
if (sitePage) {
  (() => {
    const textTargets = Array.from(sitePage.querySelectorAll(
      "main p, main li, main a, main span, .hero p, .hero h2, .hero h3, .hero strong, .hero span, .warning-banner strong, .warning-banner span"
    )).filter((element) => {
      if (!element || element.closest(".site-nav") || element.closest("footer")) {
        return false;
      }
      if (element.classList.contains("glitch-title")) {
        return false;
      }
      if (element.children.length > 0 && !element.matches("a, li, p, span, strong, h2, h3")) {
        return false;
      }
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      return text.length >= 8;
    });

    const leetMap = {
      a: "4",
      b: "8",
      e: "3",
      g: "6",
      i: "1",
      o: "0",
      s: "5",
      t: "7",
      z: "2"
    };
    const activeGlitches = new WeakMap();
    const statusPhrases = [
      () => `ERROR ${Math.floor(1000 + Math.random() * 9000)}`,
      () => `ERR 0x${Math.floor(4096 + Math.random() * 61439).toString(16).toUpperCase()}`,
      () => "RELOADING",
      () => "SIGNAL LOST",
      () => "DESYNC",
      () => "RECOVERING",
      () => "CACHE MISS",
      () => "PATCHING"
    ];

    function randomLogStamp() {
      const hours = String(Math.floor(Math.random() * 2)).padStart(2, "0");
      const minutes = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      const seconds = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    }

    function horrorLogLine() {
      const stamp = randomLogStamp();
      const logs = [
        `LOG ${stamp} — Invitation packet addressed to Paul arrived from a casino no city grid contains.`,
        `LOG ${stamp} — Entry contract states all debt may be resolved through three approved games.`,
        `LOG ${stamp} — Trial one designated GAMBLING KING. Purpose: teach the subject to protect the debt instead of paying it.`,
        `LOG ${stamp} — Trial two designated DEATH WHEEL. Purpose: confirm the subject will keep spinning after the warning is understood.`,
        `LOG ${stamp} — Trial three designated DEATH BLACKJACK. Purpose: determine whether the subject will challenge the dealer after seeing his real face.`,
        `LOG ${stamp} — Subject reported the games looked beatable before the first balance update.`,
        `LOG ${stamp} — First winners were not released. They were promoted deeper into the House.`,
        `LOG ${stamp} — Titles are not rewards. Titles are seating assignments for returned players.`,
        `LOG ${stamp} — Home screen provided to reduce panic between table recalls.`,
        `LOG ${stamp} — Balance notes match handwriting recovered from prior contestants who reached the exit door.`,
        `LOG ${stamp} — Update feed now classified as confession archive.`,
        `LOG ${stamp} — Save transfer permitted because the House follows the player between devices.`,
        `LOG ${stamp} — Gambling King account continued earning after the owner stopped touching the reels.`,
        `LOG ${stamp} — Death Wheel camera captured one extra segment facing inward toward the viewer.`,
        `LOG ${stamp} — Death Blackjack dealer requested another hand after the table had already been cleared.`,
        `LOG ${stamp} — Route preview briefly displayed a node labeled RETURN WITH LESS.`,
        `LOG ${stamp} — Neural sync indicates the subject now calls the intake procedure a game.`,
        `LOG ${stamp} — No verified record exists of a player leaving after clearing all three.`
      ];
      return pickOne(logs);
    }

    function pickOne(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    function randomWordIndex(words) {
      const candidates = words
        .map((word, index) => ({ word, index }))
        .filter(({ word }) => /[A-Za-z]/.test(word) && word.length >= 3);
      return candidates.length ? pickOne(candidates).index : -1;
    }

    function leetifyWord(word) {
      return word
        .split("")
        .map((char) => {
          const lower = char.toLowerCase();
          if (leetMap[lower] && Math.random() < 0.45) {
            return leetMap[lower];
          }
          return Math.random() < 0.12 && /[A-Za-z]/.test(char)
            ? String.fromCharCode(65 + Math.floor(Math.random() * 26))
            : char;
        })
        .join("");
    }

    function scrambleWord(word) {
      if (word.length < 4) {
        return leetifyWord(word);
      }
      const middle = word.slice(1, -1).split("");
      for (let i = middle.length - 1; i > 0; i -= 1) {
        const swapIndex = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[swapIndex]] = [middle[swapIndex], middle[i]];
      }
      return `${word[0]}${middle.join("")}${word[word.length - 1]}`;
    }

    function mutateText(text) {
      const words = text.split(/(\s+)/);
      if (!words.length) {
        return text;
      }
      const modeRoll = Math.random();
      if (modeRoll < 0.28) {
        return pickOne(statusPhrases)();
      }
      const index = randomWordIndex(words);
      if (index < 0) {
        return text;
      }
      if (modeRoll < 0.64) {
        words[index] = leetifyWord(words[index]);
      } else {
        words[index] = scrambleWord(words[index]);
      }
      if (Math.random() < 0.22) {
        const secondIndex = randomWordIndex(words);
        if (secondIndex >= 0 && secondIndex !== index) {
          words[secondIndex] = pickOne(["ERROR", "RELOADING", "DESYNC", "PATCH"]);
        }
      }
      return words.join("");
    }

    function shuffled(list) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const swapIndex = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[swapIndex]] = [copy[swapIndex], copy[i]];
      }
      return copy;
    }

    function clearTargetGlitch(target, fallbackText) {
      target.textContent = target.dataset.glitchOriginal || fallbackText;
      target.classList.remove("word-glitch-active", "word-glitch-horror");
      delete target.dataset.glitchOriginal;
      delete target.dataset.horrorEcho;
      activeGlitches.delete(target);
    }

    function triggerTextGlitch() {
      if (!textTargets.length) {
        return;
      }
      const availableTargets = textTargets.filter((target) => target && !activeGlitches.get(target));
      if (!availableTargets.length) {
        scheduleNextGlitch();
        return;
      }
      const horrorEligibleTargets = availableTargets.filter((target) => target.matches("p, li, span, strong"));
      if (horrorEligibleTargets.length && Math.random() < 0.08) {
        const horrorCount = Math.min(Math.random() < 0.35 ? 2 : 1, horrorEligibleTargets.length);
        const horrorTargets = shuffled(horrorEligibleTargets).slice(0, horrorCount);
        horrorTargets.forEach((target) => {
          const original = target.textContent || "";
          const replacement = horrorLogLine();
          activeGlitches.set(target, true);
          target.dataset.glitchOriginal = original;
          target.dataset.horrorEcho = replacement;
          target.classList.add("word-glitch-horror");
          target.textContent = replacement;
          const holdMs = 6800 + Math.floor(Math.random() * 900);
          window.setTimeout(() => {
            clearTargetGlitch(target, original);
          }, holdMs);
        });
        sitePage.classList.add("page-horror-burst");
        window.setTimeout(() => {
          sitePage.classList.remove("page-horror-burst");
        }, 880);
        scheduleNextGlitch();
        return;
      }
      const burstRoll = Math.random();
      const burstCount = burstRoll < 0.18
        ? Math.min(4, availableTargets.length)
        : burstRoll < 0.56
          ? Math.min(3, availableTargets.length)
          : Math.min(2, availableTargets.length);
      const burstTargets = shuffled(availableTargets).slice(0, burstCount);
      let appliedCount = 0;

      burstTargets.forEach((target) => {
        const original = target.textContent || "";
        const mutated = mutateText(original);
        if (!mutated || mutated === original) {
          return;
        }
        appliedCount += 1;
        activeGlitches.set(target, true);
        target.dataset.glitchOriginal = original;
        target.classList.add("word-glitch-active");
        target.textContent = mutated;

        const holdMs = 700 + Math.floor(Math.random() * 550);
        window.setTimeout(() => {
          clearTargetGlitch(target, original);
        }, holdMs);
      });

      if (appliedCount > 0 && (appliedCount > 1 || Math.random() < 0.18)) {
        sitePage.classList.add("page-glitch-burst");
        window.setTimeout(() => {
          sitePage.classList.remove("page-glitch-burst");
        }, 240);
      }
      scheduleNextGlitch();
    }

    function scheduleNextGlitch() {
      const delay = 1100 + Math.floor(Math.random() * 2600);
      window.setTimeout(triggerTextGlitch, delay);
    }

    scheduleNextGlitch();
  })();
}

const SECRET_TITLE_ERROR_TEXT = "ERROR: DATA NOT FOUND";
const SECRET_TITLE_LOCKED_EFFECT_TEXT = "ERROR: ACCESS DENIED";
const SECRET_TITLE_PROGRESS_TEXT = "ERROR: SIGNAL NOT CLASSIFIED";
const SECRET_TITLE_STREAK_TARGETS = {
  "null-signature": 2,
  "uncut-exit": 2,
  "straight-teeth": 2,
  "ash-sleeper": 2,
  "unforged-witness": 2,
  "fivefold-omen": 2,
  "closed-ledger": 3,
  "full-circuit": 2,
  "house-reserve": 2
};
const TITLE_CURSED_CARD_KEYS = ["debt-card", "burn-card", "heavy-card", "mirror-curse"];

const SECRET_TITLE_DEFS = {
  "null-signature": {
    label: "Null Signature",
    rarity: 5,
    desc: "Crossed the floor with bare cards, no marks, no shelter, and no tricks left to lean on.",
    effect: "Adds 1 Ace and 1 ten, removes 1 two, 1 three, and 1 four.",
    unlockText: "Clear World 1 this way in 2 runs in a row: no owned special cards, no passives, no titles equipped, no Camp or Forge visits, and no Double Down or Split.",
    deckPlan: {
      add: { A: 1, 10: 1 },
      remove: { "2": 1, "3": 1, "4": 1 }
    }
  },
  "last-spark": {
    label: "Last Spark",
    rarity: 5,
    desc: "Reached the exit as a dying ember after the House had already taken most of the run.",
    effect: "Adds 1 Ace and 1 King, removes 1 two, 1 three, and 1 five.",
    unlockText: "Clear World 1 with exactly 1 life remaining after losing at least 5 lives in the run, without visiting Camp.",
    deckPlan: {
      add: { A: 1, K: 1 },
      remove: { "2": 1, "3": 1, "5": 1 }
    }
  },
  "uncut-exit": {
    label: "Uncut Exit",
    rarity: 5,
    desc: "Walked through the whole floor clean while still touching the route's recovery tools.",
    effect: "Adds 1 Ace and 1 Queen, removes 1 two, 1 three, 1 four, and 1 five.",
    unlockText: "Clear World 1 this way in 2 runs in a row: no life loss, visit both Camp and Forge, and take no Risk Table or Casino Vault.",
    deckPlan: {
      add: { A: 1, Q: 1 },
      remove: { "2": 1, "3": 1, "4": 1, "5": 1 }
    }
  },
  "straight-teeth": {
    label: "Straight Teeth",
    rarity: 5,
    desc: "Refused the greedy cuts and cleared the route with only clean table play.",
    effect: "Adds 1 King and 2 nines, removes 1 three, 1 four, and 1 six.",
    unlockText: "Clear World 1 this way in 2 runs in a row: no Double Down or Split, visit both Camp and Forge, plus at least 1 Risk Table and 1 Casino Vault.",
    deckPlan: {
      add: { K: 1, "9": 2 },
      remove: { "3": 1, "4": 1, "6": 1 }
    }
  },
  "ash-sleeper": {
    label: "Ash Sleeper",
    rarity: 5,
    desc: "Skipped every campfire, but still trusted the forge once and kept moving.",
    effect: "Adds 1 Ace and 1 Jack, removes 1 two, 1 four, and 1 six.",
    unlockText: "Clear World 1 this way in 2 runs in a row: no Camp, at least 2 Forge visits, lose no more than 1 life, and win at least 2 hands containing Burn Card.",
    deckPlan: {
      add: { A: 1, J: 1 },
      remove: { "2": 1, "4": 1, "6": 1 }
    }
  },
  "unforged-witness": {
    label: "Unforged Witness",
    rarity: 5,
    desc: "Rejected the forge, took shelter once, and still beat the floor with untouched steel.",
    effect: "Adds 1 King and 1 Jack, removes 1 three, 1 five, and 1 six.",
    unlockText: "Clear World 1 this way in 2 runs in a row: no Forge, at least 2 Camp visits, open at least 1 Casino Vault, and win at least 2 hands containing Debt Card.",
    deckPlan: {
      add: { K: 1, J: 1 },
      remove: { "3": 1, "5": 1, "6": 1 }
    }
  },
  "fivefold-omen": {
    label: "Fivefold Omen",
    rarity: 5,
    desc: "Hit enough naturals in one run that the House started counting backward.",
    effect: "Adds 2 Aces and 1 ten, removes 1 two, 1 three, 1 four, and 1 five.",
    unlockText: "Clear World 1 this way in 2 runs in a row: win 7 natural blackjacks in the run and lose no boss round.",
    deckPlan: {
      add: { A: 2, "10": 1 },
      remove: { "2": 1, "3": 1, "4": 1, "5": 1 }
    }
  },
  "closed-ledger": {
    label: "Closed Ledger",
    rarity: 5,
    desc: "Never gave a boss a round back, even after the rest of the floor tried to bleed the run dry.",
    effect: "Adds 1 Ace, 1 King, and 1 Queen, removes 1 two, 1 three, 1 four, and 1 five.",
    unlockText: "Clear World 1 this way in 3 runs in a row: lose no boss round, lose at least 3 lives elsewhere, and still visit both Camp and Forge.",
    deckPlan: {
      add: { A: 1, K: 1, Q: 1 },
      remove: { "2": 1, "3": 1, "4": 1, "5": 1 }
    }
  },
  "full-circuit": {
    label: "Full Circuit",
    rarity: 5,
    desc: "Touched every wire in the House and still came back carrying the current.",
    effect: "Adds 1 Ace, 1 Jack, and 1 ten, removes 1 two, 1 three, 1 four, and 1 five.",
    unlockText: "Clear World 1 this way in 2 runs in a row: visit Camp, Forge, Risk Table, Casino Vault, clear a Skill Trial, open 2 Vaults, take 2 Risk Tables, never lose a boss round, and win with both Heavy Card and Mirror Curse in the run.",
    deckPlan: {
      add: { A: 1, J: 1, "10": 1 },
      remove: { "2": 1, "3": 1, "4": 1, "5": 1 }
    }
  },
  "house-reserve": {
    label: "House Reserve",
    rarity: 5,
    desc: "Left the floor rich enough that the House should have noticed the missing weight in its vaults.",
    effect: "Adds 1 Ace, 1 King, 1 ten, and 1 nine, removes 1 two, 1 three, 1 four, 1 five, and 1 six.",
    unlockText: "Clear World 1 this way in 2 runs in a row: finish with at least $9000 and 5 lives, after opening 2 Vaults, taking 2 Risk Tables, never visiting Camp, and winning at least 3 cursed-card hands total.",
    deckPlan: {
      add: { A: 1, K: 1, "10": 1, "9": 1 },
      remove: { "2": 1, "3": 1, "4": 1, "5": 1, "6": 1 }
    }
  }
};

function defaultRareTitleMarks() {
  return Object.fromEntries(Object.keys(SECRET_TITLE_DEFS).map((key) => [key, 0]));
}

function sanitizeRareTitleMarks(source = {}) {
  const defaults = defaultRareTitleMarks();
  return Object.keys(defaults).reduce((acc, key) => {
    acc[key] = Math.max(0, Number(source?.[key]) || 0);
    return acc;
  }, {});
}

function defaultRareTitleStreaks() {
  return Object.fromEntries(Object.keys(SECRET_TITLE_DEFS).map((key) => [key, 0]));
}

function sanitizeRareTitleStreaks(source = {}) {
  const defaults = defaultRareTitleStreaks();
  return Object.keys(defaults).reduce((acc, key) => {
    acc[key] = Math.max(0, Number(source?.[key]) || 0);
    return acc;
  }, {});
}

function defaultCursedWinMarks() {
  return Object.fromEntries(TITLE_CURSED_CARD_KEYS.map((key) => [key, 0]));
}

function sanitizeCursedWinMarks(source = {}) {
  const defaults = defaultCursedWinMarks();
  return Object.keys(defaults).reduce((acc, key) => {
    acc[key] = Math.max(0, Number(source?.[key]) || 0);
    return acc;
  }, {});
}

function countUnlockedRareTitles(progress) {
  const marks = sanitizeRareTitleMarks(progress?.rareTitleMarks);
  return Object.keys(marks).reduce((sum, key) => sum + (marks[key] > 0 ? 1 : 0), 0);
}

function isSecretTitleMeta(meta) {
  return !!meta?.hidden;
}

function applyDeckPlan(cards, deckPlan) {
  if (!deckPlan) {
    return;
  }
  const suitPool = ["spades", "hearts", "diamonds", "clubs"];
  Object.entries(deckPlan.add || {}).forEach(([rank, count]) => {
    for (let i = 0; i < count; i += 1) {
      cards.push({ suit: suitPool[(cards.length + i) % suitPool.length], rank });
    }
  });
  Object.entries(deckPlan.remove || {}).forEach(([rank, count]) => {
    for (let i = 0; i < count; i += 1) {
      const idx = cards.findIndex((card) => card.rank === rank);
      if (idx >= 0) {
        cards.splice(idx, 1);
      }
    }
  });
}

function buildHomeSecretTitleMeta() {
  return Object.fromEntries(Object.entries(SECRET_TITLE_DEFS).map(([key, meta]) => [
    key,
    {
      label: meta.label,
      rarity: meta.rarity,
      effect: meta.effect,
      hidden: true,
      unlockText: meta.unlockText,
      unlock: (progress) => (progress?.rareTitleMarks?.[key] || 0) > 0
    }
  ]));
}

function buildBlackjackSecretTitleMeta() {
  return Object.fromEntries(Object.entries(SECRET_TITLE_DEFS).map(([key, meta]) => [
    key,
    {
      label: meta.label,
      rarity: meta.rarity,
      desc: meta.desc,
      effect: meta.effect,
      hidden: true,
      unlockText: meta.unlockText,
      unlock: (progress) => (progress?.rareTitleMarks?.[key] || 0) > 0,
      applyDeck: (cards) => applyDeckPlan(cards, meta.deckPlan)
    }
  ]));
}

const RUN_CURSE_DEFS = {
  "ragged-purse": {
    label: "Ragged Purse",
    desc: "Start each fresh run with $160 less cash.",
    xpBonus: 18
  },
  "soul-leak": {
    label: "Soul Leak",
    desc: "Start each fresh run with 2 fewer lives.",
    xpBonus: 22
  },
  "crooked-shops": {
    label: "Crooked Shops",
    desc: "All shop prices increase by 35%.",
    xpBonus: 18
  },
  "loaded-house": {
    label: "Loaded House",
    desc: "Enemies begin each run with +5 Intelligence.",
    xpBonus: 20
  },
  "blood-stakes": {
    label: "Blood Stakes",
    desc: "Base table stakes increase by 25%.",
    xpBonus: 22
  },
  "withered-shoe": {
    label: "Withered Shoe",
    desc: "Each fresh deck loses 1 Ace and 2 ten-value cards.",
    xpBonus: 24
  },
  "collectors-tithe": {
    label: "Collector's Tithe",
    desc: "Positive table payouts are reduced by 12%.",
    xpBonus: 18
  }
};

function sanitizeCurseKeys(keys) {
  if (!Array.isArray(keys)) {
    return [];
  }
  return [...new Set(keys.filter((key) => RUN_CURSE_DEFS[key]))];
}

function curseLoadoutUnlocked(progress) {
  return (Number(progress?.worldOneClears) || 0) >= 1;
}

function configuredCurseKeys(progress) {
  return curseLoadoutUnlocked(progress) ? sanitizeCurseKeys(progress?.equippedCurses) : [];
}

function curseXpBonusPercent(keys) {
  return sanitizeCurseKeys(keys).reduce((total, key) => total + (RUN_CURSE_DEFS[key]?.xpBonus || 0), 0);
}

const bjHomePage = document.querySelector(".death-blackjack-home-page");
if (bjHomePage && !document.querySelector(".blackjack-screen")) {
  (() => {
  const HOME_PROGRESS_KEY = "death_blackjack_progress_v1";
  const HOME_RUN_KEY = "death_blackjack_run_save_v2";
  const HOME_KEYBINDS_KEY = "death_blackjack_keybinds_v1";
  const HOME_SAVE_CODE_PREFIX = "DBJ1";
  const HOME_ACCOUNT_CODE_PREFIX = "DBJA1";
  const HOME_CURRENT_SAVE_VERSION = 2;
  const HOME_DEV_ACCOUNT_ID = "dev-house";
  const HOME_DEV_ACCOUNT_LABEL = "House Developer";
  const homeStatusEl = document.getElementById("bjHomeStatus");
  const homeEquippedTitlesEl = document.getElementById("bjHomeEquippedTitles");
  const homeTitleCollectionEl = document.getElementById("bjHomeTitleCollection");
  const homeProgressStatsEl = document.getElementById("bjHomeProgressStats");
  const homeLevelTrackEl = document.getElementById("bjHomeLevelTrack");
  const homeRunLogEl = document.getElementById("bjHomeRunLog");
  const homeAchievementsEl = document.getElementById("bjHomeAchievements");
  const curseStatusEl = document.getElementById("bjCurseStatus");
  const curseSettingsEl = document.getElementById("bjCurseSettings");
  const continueRunLink = document.getElementById("bjContinueRunLink");
  const freshRunLink = document.getElementById("bjFreshRunLink");
  const titleSettingsEl = document.getElementById("bjTitleSettings");
  const titleStatusEl = document.getElementById("bjTitleStatus");
  const keybindSettingsEl = document.getElementById("bjKeybindSettings");
  const keybindStatusEl = document.getElementById("bjKeybindStatus");
  const resetKeybindsBtn = document.getElementById("bjResetKeybindsBtn");
  const accountStatusEl = document.getElementById("bjAccountStatus");
  const exportAccountBtn = document.getElementById("bjExportAccountBtn");
  const joinAccountBtn = document.getElementById("bjJoinAccountBtn");
  const leaveAccountBtn = document.getElementById("bjLeaveAccountBtn");
  const accountCodePanelEl = document.getElementById("bjAccountCodePanel");
  const accountCodeInputEl = document.getElementById("bjAccountCodeInput");
  const copyAccountBtn = document.getElementById("bjCopyAccountBtn");
  const applyAccountBtn = document.getElementById("bjApplyAccountBtn");
  const homeDevToolsCardEl = document.getElementById("bjHomeDevToolsCard");
  const homeDevToolsStatusEl = document.getElementById("bjHomeDevToolsStatus");
  const homeDevUnlockTitlesBtn = document.getElementById("bjHomeDevUnlockTitlesBtn");
  const homeDevMaxProgressBtn = document.getElementById("bjHomeDevMaxProgressBtn");
  const homeDevClearRunBtn = document.getElementById("bjHomeDevClearRunBtn");
  const exportSaveBtn = document.getElementById("bjExportSaveBtn");
  const importSaveBtn = document.getElementById("bjImportSaveBtn");
  const deleteSaveBtn = document.getElementById("bjDeleteSaveBtn");
  const saveCodePanelEl = document.getElementById("bjSaveCodePanel");
  const saveCodeStatusEl = document.getElementById("bjSaveCodeStatus");
  const saveCodeInputEl = document.getElementById("bjSaveCodeInput");
  const copySaveBtn = document.getElementById("bjCopySaveBtn");
  const applySaveBtn = document.getElementById("bjApplySaveBtn");
  let waitingForKeybindAction = "";
  let homeProgress = null;
  let customKeybinds = null;

  const HOME_RANK_LABELS = {
    1: "Ashbound (Common)",
    2: "Cinder (Uncommon)",
    3: "Hellforged (Rare)",
    4: "Dreadmarked (Epic)",
    5: "Abyssal (Legendary)"
  };

  const HOME_MAX_LEVEL = 100;
  const HOME_MAX_RUN_LOGS = 8;

  function buildHomeLevelThresholds(maxLevel = HOME_MAX_LEVEL) {
    const thresholds = [0];
    let total = 0;
    for (let level = 2; level <= maxLevel; level += 1) {
      let increment = 50 + ((level - 2) * 8);
      if (level > 10 && level <= 30) {
        increment = 115 + ((level - 11) * 5);
      } else if (level > 30 && level <= 60) {
        increment = 215 + ((level - 31) * 6);
      } else if (level > 60) {
        increment = 395 + ((level - 61) * 7);
      }
      total += increment;
      thresholds.push(total);
    }
    return thresholds;
  }

  function buildHomeRouteLevels(maxLevel = HOME_MAX_LEVEL) {
    const levels = [];
    for (let level = 2; level <= Math.min(10, maxLevel); level += 1) {
      levels.push(level);
    }
    for (let level = 12; level <= Math.min(30, maxLevel); level += 2) {
      levels.push(level);
    }
    for (let level = 33; level <= Math.min(60, maxLevel); level += 3) {
      levels.push(level);
    }
    for (let level = 65; level <= maxLevel; level += 5) {
      levels.push(level);
    }
    return levels;
  }

  const HOME_LEVEL_THRESHOLDS = buildHomeLevelThresholds();

  function sanitizeRecentRuns(entries) {
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        summary: typeof entry.summary === "string" ? entry.summary.slice(0, 72) : "Unknown result",
        detail: typeof entry.detail === "string" ? entry.detail.slice(0, 160) : "",
        map: Math.max(1, Math.min(5, Number(entry.map) || 1)),
        cash: Math.max(0, Number(entry.cash) || 0),
        lives: Math.max(0, Number(entry.lives) || 0)
      }))
      .slice(0, HOME_MAX_RUN_LOGS);
  }

  function homeProgressScore(progress) {
    return (
      ((Number(progress.totalBossesDefeated) || 0) * 100) +
      ((Number(progress.highestMapReached) || 0) * 35) +
      ((Number(progress.worldOneClears) || 0) * 320) +
      ((Number(progress.vaultsOpened) || 0) * 16) +
      ((Number(progress.forgesUsed) || 0) * 18) +
      ((Number(progress.blackjacksWon) || 0) * 14) +
      ((Number(progress.skillTrialsCleared) || 0) * 55) +
      ((Number(progress.runsCompleted) || 0) * 22) +
      ((Number(progress.curseXpEarned) || 0)) +
      (countUnlockedRareTitles(progress) * 180) +
      (sanitizeRecentRuns(progress.recentRuns).length * 6)
    );
  }

  function homeProgressLevel(progress) {
    const score = homeProgressScore(progress);
    let level = 1;
    for (let i = 0; i < HOME_LEVEL_THRESHOLDS.length; i += 1) {
      if (score >= HOME_LEVEL_THRESHOLDS[i]) {
        level = i + 1;
      }
    }
    return level;
  }

  function homeNextLevelTarget(progress) {
    const level = homeProgressLevel(progress);
    const nextThreshold = HOME_LEVEL_THRESHOLDS[level];
    return Number.isFinite(nextThreshold) ? nextThreshold : null;
  }

  const HOME_TITLE_META = {
    newcomer: { label: "Newcomer", rarity: 1, effect: "Adds 1 extra 8 to each fresh deck.", unlock: () => true, unlockText: "Unlocked by default." },
    ashwalker: { label: "Ashwalker", rarity: 1, effect: "Adds 1 Ace and removes 1 two.", unlock: (p) => p.highestMapReached >= 2, unlockText: "Reach Map 2 in a run." },
    "pit-counter": { label: "Pit Counter", rarity: 2, effect: "Removes 1 three and 1 four.", unlock: (p) => p.totalBossesDefeated >= 1, unlockText: "Defeat 1 boss." },
    "chip-keeper": { label: "Chip Keeper", rarity: 2, effect: "Adds 1 ten and 1 six.", unlock: (p) => p.vaultsOpened >= 3, unlockText: "Open 3 Casino Vaults." },
    "cinder-counter": { label: "Cinder Counter", rarity: 2, effect: "Adds 1 Jack and removes 1 two.", unlock: (p) => p.forgesUsed >= 3, unlockText: "Use the Card Forge 3 times." },
    "house-burned": { label: "House Burned", rarity: 3, effect: "Adds 1 ten and removes 1 two, 1 three, and 1 four.", unlock: (p) => p.totalBossesDefeated >= 3, unlockText: "Defeat 3 bosses." },
    "house-reader": { label: "House Reader", rarity: 3, effect: "Adds 1 Ace and 1 nine, removes 1 two and 1 five.", unlock: (p) => p.blackjacksWon >= 5, unlockText: "Win 5 natural blackjacks." },
    "ledger-breaker": { label: "Ledger Breaker", rarity: 3, effect: "Adds 2 face cards, removes 1 two, 1 three, and 1 four.", unlock: (p) => p.skillTrialsCleared >= 3, unlockText: "Clear 3 Skill Trials." },
    "devils-favorite": { label: "Devil's Favorite", rarity: 4, effect: "Adds 1 Ace and 1 King, removes 1 two, 1 three, and 1 four.", unlock: (p) => p.worldOneClears >= 1, unlockText: "Clear World 1 once." },
    "abyss-witness": { label: "Abyss Witness", rarity: 5, effect: "Adds 1 Ace, 1 King, and 1 Queen, removes 1 two, 1 three, 1 four, and 1 five.", unlock: (p) => p.worldOneClears >= 3, unlockText: "Clear World 1 three times." },
    "seat-of-cinders": { label: "Seat of Cinders", rarity: 4, effect: "Adds 1 Ace and 1 Queen, removes 1 two, 1 three, 1 four, and 1 five.", unlock: (p) => homeProgressLevel(p) >= 12 && p.worldOneClears >= 2, unlockText: "Reach level 12 and clear World 1 twice." },
    "debt-eclipse": { label: "Debt Eclipse", rarity: 4, effect: "Adds 2 tens and removes 1 two, 1 three, 1 four, and 1 six.", unlock: (p) => homeProgressLevel(p) >= 18 && p.totalBossesDefeated >= 8, unlockText: "Reach level 18 and defeat 8 bosses." },
    "table-revenant": { label: "Table Revenant", rarity: 5, effect: "Adds 1 Ace, 1 King, and 1 ten, removes 1 two, 1 three, 1 four, and 1 five.", unlock: (p) => homeProgressLevel(p) >= 24 && p.blackjacksWon >= 12, unlockText: "Reach level 24 and win 12 natural blackjacks." },
    "house-mirage": { label: "House Mirage", rarity: 5, effect: "Adds 1 Ace, 1 Queen, and 1 Jack, removes 1 two, 1 three, 1 four, 1 five, and 1 six.", unlock: (p) => homeProgressLevel(p) >= 28 && p.skillTrialsCleared >= 8 && p.vaultsOpened >= 8, unlockText: "Reach level 28, clear 8 trials, and open 8 vaults." },
    "crowned-return": { label: "Crowned Return", rarity: 5, effect: "Adds 1 Ace, 1 King, 1 Queen, and 1 ten, removes 1 two, 1 three, 1 four, 1 five, and 1 six.", unlock: (p) => homeProgressLevel(p) >= 33 && p.worldOneClears >= 5 && p.totalBossesDefeated >= 12, unlockText: "Reach level 33, clear World 1 five times, and defeat 12 bosses." },
    "pit-sovereign": { label: "Pit Sovereign", rarity: 4, effect: "Adds 1 Ace, 1 King, 1 Jack, and 1 nine, removes 1 two, 1 three, 1 four, and 1 five.", unlock: (p) => homeProgressLevel(p) >= 45 && p.totalBossesDefeated >= 24 && p.worldOneClears >= 8, unlockText: "Reach level 45, defeat 24 bosses, and clear World 1 eight times." },
    "ledger-null": { label: "Ledger Null", rarity: 5, effect: "Adds 2 Aces and 1 Queen, removes 1 two, 1 three, 1 four, 1 five, and 1 six.", unlock: (p) => homeProgressLevel(p) >= 60 && p.skillTrialsCleared >= 15 && p.vaultsOpened >= 15, unlockText: "Reach level 60, clear 15 trials, and open 15 vaults." },
    "house-blackout": { label: "House Blackout", rarity: 5, effect: "Adds 1 Ace, 1 King, 1 Queen, 1 Jack, and 1 ten, removes 1 two, 1 three, 1 four, 1 five, 1 six, and 1 seven.", unlock: (p) => homeProgressLevel(p) >= 75 && p.blackjacksWon >= 30 && p.totalBossesDefeated >= 40 && p.worldOneClears >= 12, unlockText: "Reach level 75, win 30 natural blackjacks, defeat 40 bosses, and clear World 1 twelve times." },
    "final-seat": { label: "Final Seat", rarity: 5, effect: "Adds 2 Aces, 1 King, 1 Queen, 1 Jack, and 1 ten, removes 1 two, 1 three, 1 four, 1 five, 1 six, 1 seven, and 1 eight.", unlock: (p) => homeProgressLevel(p) >= 100 && p.worldOneClears >= 20 && p.totalBossesDefeated >= 60 && p.blackjacksWon >= 50, unlockText: "Reach level 100, clear World 1 twenty times, defeat 60 bosses, and win 50 natural blackjacks." }
  };
  Object.assign(HOME_TITLE_META, buildHomeSecretTitleMeta());

  function normalizeHomeZeroStart(progress) {
    const hasActivity = progress.totalBossesDefeated > 0
      || progress.worldOneClears > 0
      || progress.vaultsOpened > 0
      || progress.forgesUsed > 0
      || progress.blackjacksWon > 0
      || progress.skillTrialsCleared > 0
      || progress.runsCompleted > 0
      || progress.curseXpEarned > 0
      || countUnlockedRareTitles(progress) > 0
      || sanitizeRecentRuns(progress.recentRuns).length > 0;
    if (!hasActivity && progress.highestMapReached <= 1) {
      progress.highestMapReached = 0;
    }
    return progress;
  }

  const HOME_DEFAULT_KEYBINDS = {
    hit: ["h", "enter"],
    stand: ["s"],
    double: ["d"],
    split: ["p"],
    map: ["m"],
    nextHand: ["e"],
    prevHand: ["q"]
  };

  const HOME_KEYBIND_LABELS = {
    hit: { label: "Hit / Start Next Table", desc: "Primary action and round start." },
    stand: { label: "Stand", desc: "Stand on the active hand." },
    double: { label: "Double Down", desc: "Double the current hand." },
    split: { label: "Split", desc: "Split a valid opening pair." },
    map: { label: "Map", desc: "Open or close the battle map." },
    nextHand: { label: "Next Hand", desc: "Select the next playable hand." },
    prevHand: { label: "Previous Hand", desc: "Select the previous playable hand." }
  };

  function defaultHomeProgress() {
    return {
      accountId: HOME_DEV_ACCOUNT_ID,
      accountLabel: HOME_DEV_ACCOUNT_LABEL,
      accountRole: "dev",
      accountProtected: true,
      devToolsUnlocked: true,
      totalBossesDefeated: 0,
      highestMapReached: 0,
      worldOneClears: 0,
      vaultsOpened: 0,
      forgesUsed: 0,
      blackjacksWon: 0,
      skillTrialsCleared: 0,
      runsCompleted: 0,
      curseXpEarned: 0,
      rareTitleMarks: defaultRareTitleMarks(),
      rareTitleStreaks: defaultRareTitleStreaks(),
      equippedCurses: [],
      equippedTitles: [],
      recentRuns: []
    };
  }

  function createGuestHomeProgress() {
    return {
      ...defaultHomeProgress(),
      accountId: `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      accountLabel: "Pit Guest",
      accountRole: "guest",
      accountProtected: false,
      devToolsUnlocked: false
    };
  }

  function normalizedKeyName(key) {
    const value = String(key || "").toLowerCase().trim();
    if (value === " ") return "space";
    if (value === "escape") return "esc";
    return value;
  }

  function keybindsWithDefaults(source = {}) {
    return Object.keys(HOME_DEFAULT_KEYBINDS).reduce((acc, action) => {
      const value = Array.isArray(source[action]) ? source[action].map((entry) => normalizedKeyName(entry)).filter(Boolean) : HOME_DEFAULT_KEYBINDS[action];
      acc[action] = [...new Set(value.length ? value : HOME_DEFAULT_KEYBINDS[action])];
      return acc;
    }, {});
  }

  function loadHomeProgress() {
    try {
      const raw = window.localStorage.getItem(HOME_PROGRESS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const fallback = defaultHomeProgress();
      const equippedTitles = Array.isArray(parsed.equippedTitles)
        ? [...new Set(parsed.equippedTitles.filter((key) => HOME_TITLE_META[key]).slice(0, 3))]
        : HOME_TITLE_META[parsed.selectedTitle]
          ? [parsed.selectedTitle]
          : [];
      return normalizeHomeZeroStart({
        accountId: typeof parsed.accountId === "string" ? parsed.accountId : fallback.accountId,
        accountLabel: typeof parsed.accountLabel === "string" ? parsed.accountLabel : fallback.accountLabel,
        accountRole: typeof parsed.accountRole === "string" ? parsed.accountRole : fallback.accountRole,
        accountProtected: parsed.accountProtected !== false,
        devToolsUnlocked: parsed.devToolsUnlocked !== false,
        totalBossesDefeated: Math.max(0, Number(parsed.totalBossesDefeated) || 0),
        highestMapReached: Math.max(0, Math.min(5, Number(parsed.highestMapReached) || 0)),
        worldOneClears: Math.max(0, Number(parsed.worldOneClears) || 0),
        vaultsOpened: Math.max(0, Number(parsed.vaultsOpened) || 0),
        forgesUsed: Math.max(0, Number(parsed.forgesUsed) || 0),
        blackjacksWon: Math.max(0, Number(parsed.blackjacksWon) || 0),
        skillTrialsCleared: Math.max(0, Number(parsed.skillTrialsCleared) || 0),
        runsCompleted: Math.max(0, Number(parsed.runsCompleted) || 0),
        curseXpEarned: Math.max(0, Number(parsed.curseXpEarned) || 0),
        rareTitleMarks: sanitizeRareTitleMarks(parsed.rareTitleMarks),
        rareTitleStreaks: sanitizeRareTitleStreaks(parsed.rareTitleStreaks),
        equippedCurses: configuredCurseKeys(parsed),
        equippedTitles,
        recentRuns: sanitizeRecentRuns(parsed.recentRuns)
      });
    } catch {
      return defaultHomeProgress();
    }
  }

  function saveHomeProgress() {
    try {
      window.localStorage.setItem(HOME_PROGRESS_KEY, JSON.stringify(homeProgress));
    } catch {}
  }

  function loadHomeKeybinds() {
    try {
      const raw = window.localStorage.getItem(HOME_KEYBINDS_KEY);
      if (!raw) {
        return keybindsWithDefaults();
      }
      return keybindsWithDefaults(JSON.parse(raw));
    } catch {
      return keybindsWithDefaults();
    }
  }

  function saveHomeKeybinds() {
    try {
      window.localStorage.setItem(HOME_KEYBINDS_KEY, JSON.stringify(customKeybinds));
    } catch {}
  }

  function formatKeybind(keys = []) {
    return keys.map((key) => key === "enter" ? "Enter" : key === "esc" ? "Esc" : key === "space" ? "Space" : key.length === 1 ? key.toUpperCase() : key).join(" / ");
  }

  function stableSerialize(value) {
    if (Array.isArray(value)) {
      return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
    }
    if (value && typeof value === "object") {
      const entries = Object.keys(value)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`);
      return `{${entries.join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function encodedSaveCode(payload) {
    const json = stableSerialize(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return `${HOME_SAVE_CODE_PREFIX}-${encoded}`;
  }

  function encodedAccountCode(payload) {
    const json = stableSerialize(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return `${HOME_ACCOUNT_CODE_PREFIX}-${encoded}`;
  }

  function migrateHomeSavePayload(payload) {
    const parsed = payload && typeof payload === "object" ? payload : {};
    const progress = {
      ...defaultHomeProgress(),
      ...(parsed.progress || {})
    };
    const equippedTitles = Array.isArray(progress.equippedTitles)
      ? [...new Set(progress.equippedTitles.filter((key) => HOME_TITLE_META[key]).slice(0, 3))]
      : HOME_TITLE_META[progress.selectedTitle]
        ? [progress.selectedTitle]
        : [];
    return {
      version: HOME_CURRENT_SAVE_VERSION,
      progress: normalizeHomeZeroStart({
        accountId: typeof progress.accountId === "string" ? progress.accountId : HOME_DEV_ACCOUNT_ID,
        accountLabel: typeof progress.accountLabel === "string" ? progress.accountLabel : HOME_DEV_ACCOUNT_LABEL,
        accountRole: typeof progress.accountRole === "string" ? progress.accountRole : "dev",
        accountProtected: progress.accountProtected !== false,
        devToolsUnlocked: progress.devToolsUnlocked !== false,
        totalBossesDefeated: Math.max(0, Number(progress.totalBossesDefeated) || 0),
        highestMapReached: Math.max(0, Math.min(5, Number(progress.highestMapReached) || 0)),
        worldOneClears: Math.max(0, Number(progress.worldOneClears) || 0),
        vaultsOpened: Math.max(0, Number(progress.vaultsOpened) || 0),
        forgesUsed: Math.max(0, Number(progress.forgesUsed) || 0),
        blackjacksWon: Math.max(0, Number(progress.blackjacksWon) || 0),
        skillTrialsCleared: Math.max(0, Number(progress.skillTrialsCleared) || 0),
        runsCompleted: Math.max(0, Number(progress.runsCompleted) || 0),
        curseXpEarned: Math.max(0, Number(progress.curseXpEarned) || 0),
        rareTitleMarks: sanitizeRareTitleMarks(progress.rareTitleMarks),
        rareTitleStreaks: sanitizeRareTitleStreaks(progress.rareTitleStreaks),
        equippedCurses: configuredCurseKeys(progress),
        equippedTitles,
        recentRuns: sanitizeRecentRuns(progress.recentRuns)
      }),
      run: parsed.run && typeof parsed.run === "object" ? parsed.run : null
    };
  }

  function decodeSaveCode(saveCode) {
    const normalized = String(saveCode || "").trim().replace(/\s+/g, "");
    if (!normalized.startsWith(`${HOME_SAVE_CODE_PREFIX}-`)) {
      throw new Error("Save code prefix is invalid.");
    }
    const payload = normalized.slice(HOME_SAVE_CODE_PREFIX.length + 1);
    const json = decodeURIComponent(escape(atob(payload)));
    return migrateHomeSavePayload(JSON.parse(json));
  }

  function decodeAccountCode(accountCode) {
    const normalized = String(accountCode || "").trim().replace(/\s+/g, "");
    if (!normalized.startsWith(`${HOME_ACCOUNT_CODE_PREFIX}-`)) {
      throw new Error("Account code prefix is invalid.");
    }
    const payload = normalized.slice(HOME_ACCOUNT_CODE_PREFIX.length + 1);
    const json = decodeURIComponent(escape(atob(payload)));
    const parsed = JSON.parse(json);
    const progress = migrateHomeSavePayload({ progress: parsed.progress || parsed }).progress;
    return {
      progress,
      keybinds: keybindsWithDefaults(parsed.keybinds || {})
    };
  }

  function setSaveCodePanelOpen(show) {
    if (!saveCodePanelEl) {
      return;
    }
    saveCodePanelEl.classList.toggle("hidden", !show);
  }

  function setAccountCodePanelOpen(show) {
    if (!accountCodePanelEl) {
      return;
    }
    accountCodePanelEl.classList.toggle("hidden", !show);
  }

  function updateSaveCodeStatus(message = "Export, import, or wipe Death Blackjack data from here.") {
    if (saveCodeStatusEl) {
      saveCodeStatusEl.textContent = message;
    }
  }

  function updateTitleStatus(message = "Titles stay between runs, unlock from feats, and slightly reshape the deck.") {
    if (titleStatusEl) {
      titleStatusEl.textContent = message;
    }
  }

  function updateKeybindStatus(message = "Click a bind, then press a key.") {
    if (keybindStatusEl) {
      keybindStatusEl.textContent = message;
    }
  }

  function updateAccountStatus(message = "Manage your current account, leave it safely, or rejoin with an account code later.") {
    if (accountStatusEl) {
      accountStatusEl.textContent = message;
    }
  }

  function updateHomeDevToolsStatus(message = "Dev-only testing tools appear here on the protected developer account.") {
    if (homeDevToolsStatusEl) {
      homeDevToolsStatusEl.textContent = message;
    }
  }

  function renderHomeDevTools() {
    if (!homeDevToolsCardEl) {
      return;
    }
    const show = !!homeProgress?.devToolsUnlocked;
    homeDevToolsCardEl.classList.toggle("hidden", !show);
    if (!show) {
      return;
    }
    updateHomeDevToolsStatus("Developer account active. Use these tools to unlock content, max progression, or clear a stuck run save.");
  }

  const HOME_ROUTE_REWARD_MAP = {
    2: { title: "Lucky Seven Packet", detail: "The House gives your first real deck prize.", rewards: ["Card: Lucky Seven", "Passive: Chip Stash"] },
    3: { title: "Dealer Read Kit", detail: "You start reading the table instead of only surviving it.", rewards: ["Card: Marked Card", "Passive: Steel Nerves"] },
    4: { title: "Cinder Shop Pool", detail: "Rank II items enter the live route.", rewards: ["Rank II shop pool"] },
    5: { title: "Ace Ledger", detail: "Your deck starts leaning toward cleaner value lines.", rewards: ["Card: Ace Anchor", "Passive: Profit Margin"] },
    6: { title: "Grim Table Tools", detail: "The route starts paying out harsher but stronger pieces.", rewards: ["Card: Grim Chip", "Passive: Dealer Tell"] },
    7: { title: "Trap Line", detail: "You gain table punish tools and better side-event value.", rewards: ["Card: Dealer Trap", "Passive: Vault Interest"] },
    8: { title: "Trial Packet", detail: "The route finally pays out for cleaner high-end finishes.", rewards: ["Card: Finisher Card", "Passive: Trial Script"] },
    9: { title: "First Dreadmarked Trail", detail: "The first epic title chase appears in the ledger.", rewards: ["Achievement: Seat of Cinders"] },
    10: { title: "Hellforged Shop Pool", detail: "Rank III items enter the live route.", rewards: ["Rank III shop pool"] },
    12: { title: "Seat of Cinders", detail: "Your first epic title prize can now be claimed.", rewards: ["Title hunt: Seat of Cinders"] },
    14: { title: "Boss Dividend Line", detail: "Boss rooms start paying your run back harder.", rewards: ["Passive: Ace Credit", "Passive: Boss Dividend"] },
    16: { title: "Croupier Cache", detail: "The House starts handing out stronger opening table tools.", rewards: ["Passive: Croupier Stash"] },
    18: { title: "Debt Eclipse", detail: "The second epic title chase joins the road.", rewards: ["Title hunt: Debt Eclipse"] },
    20: { title: "Expanded Card Shop", detail: "Your card market gets wider.", rewards: ["+1 card offer"] },
    22: { title: "Perfect Focus", detail: "A late passive enters the route once you have a clear.", rewards: ["Passive unlock: Perfect Focus"] },
    24: { title: "Table Revenant", detail: "The first late legendary title joins the road.", rewards: ["Title hunt: Table Revenant"] },
    26: { title: "Expanded Support Shop", detail: "Support rows get wider too.", rewards: ["+1 support offer"] },
    28: { title: "House Mirage", detail: "Another legendary title joins the road.", rewards: ["Title hunt: House Mirage"] },
    30: { title: "House Discount I", detail: "The route starts discounting your whole economy.", rewards: ["Shop prices -5%"] },
    33: { title: "Crowned Return", detail: "Abyss-leaning title chase added.", rewards: ["Title hunt: Crowned Return"] },
    36: { title: "Camp Recovery II", detail: "Camps become meaningfully stronger.", rewards: ["Camp heal +1"] },
    39: { title: "Run Bankroll I", detail: "Fresh runs start with a larger stack.", rewards: ["Start +$80"] },
    42: { title: "Extra Life I", detail: "Fresh runs gain more room for mistakes.", rewards: ["Start +1 life"] },
    45: { title: "Pit Sovereign", detail: "A deep late-game title joins the road.", rewards: ["Title hunt: Pit Sovereign"] },
    48: { title: "Vault Bonus I", detail: "Vault routes become richer.", rewards: ["Vaults +$40"] },
    51: { title: "Trial Bonus I", detail: "Skill Trial clears pay better.", rewards: ["Trials +$25"] },
    54: { title: "Opening Toolkit", detail: "Fresh runs open with a seeded tool.", rewards: ["Start +1 Lucky Draw"] },
    57: { title: "Expanded Card Shop II", detail: "The market widens again.", rewards: ["+1 more card offer"] },
    60: { title: "Ledger Null", detail: "Abyssal title chase added.", rewards: ["Title hunt: Ledger Null"] },
    65: { title: "Camp Recovery III", detail: "Camps become full recovery stops for World 1.", rewards: ["Camp heal +1 more"] },
    70: { title: "Expanded Support Shop II", detail: "Support market widens again.", rewards: ["+1 more support offer"] },
    75: { title: "House Blackout", detail: "A deeper legendary title joins the road.", rewards: ["Title hunt: House Blackout"] },
    80: { title: "Run Bankroll II", detail: "Fresh runs start much richer.", rewards: ["Start +$140 more"] },
    85: { title: "Extra Life II", detail: "Fresh runs gain another survival buffer.", rewards: ["Start +1 more life"] },
    90: { title: "House Discount II", detail: "The House gives up even more shop margin.", rewards: ["Another -5% shop prices"] },
    95: { title: "Deep Table Bonus", detail: "Late economy nodes become more worth taking.", rewards: ["Vaults +$60", "Trials +$35"] },
    100: { title: "Final Seat", detail: "The road ends with a final opening package.", rewards: ["Start +1 Chip Shield", "Start +1 Lucky Draw"] }
  };

  const HOME_ROUTE_MILESTONES = buildHomeRouteLevels().map((level) => ({
    level,
    eyebrow: `Level ${level}`,
    ...(HOME_ROUTE_REWARD_MAP[level] || {
      title: "House Route",
      detail: "The ledger deepens and the House opens another progression node."
    })
  }));

  function currentHomeRankCap(progress) {
    const level = homeProgressLevel(progress);
    if (level >= 10) {
      return 3;
    }
    if (level >= 4) {
      return 2;
    }
    return 1;
  }

  function currentHomeCardOfferCount(progress) {
    const level = homeProgressLevel(progress);
    return 4 + (level >= 20 ? 1 : 0) + (level >= 57 ? 1 : 0);
  }

  function currentHomeSupportOfferCount(progress) {
    const level = homeProgressLevel(progress);
    return 4 + (level >= 26 ? 1 : 0) + (level >= 70 ? 1 : 0);
  }

  function currentHomeCampRecoveryAmount(progress) {
    const level = homeProgressLevel(progress);
    return 1 + (level >= 36 ? 1 : 0) + (level >= 65 ? 1 : 0);
  }

  function currentHomeCurseKeys(progress = homeProgress) {
    return configuredCurseKeys(progress);
  }

  function currentHomeCurseXpBonus(progress = homeProgress) {
    return curseXpBonusPercent(currentHomeCurseKeys(progress));
  }

  function updateCurseStatus(message = "") {
    if (!curseStatusEl) {
      return;
    }
    if (message) {
      curseStatusEl.textContent = message;
      return;
    }
    if (!curseLoadoutUnlocked(homeProgress)) {
      curseStatusEl.textContent = "Clear World 1 once to unlock House Curses.";
      return;
    }
    const curseKeys = currentHomeCurseKeys(homeProgress);
    curseStatusEl.textContent = curseKeys.length
      ? `${curseKeys.length} curse${curseKeys.length === 1 ? "" : "s"} equipped. Next run earns +${currentHomeCurseXpBonus(homeProgress)}% bonus XP.`
      : "No curses equipped. Add any number of curses to make the next run harder for bonus XP.";
  }

  function renderCurseSettings() {
    if (!curseSettingsEl) {
      return;
    }
    if (!curseLoadoutUnlocked(homeProgress)) {
      curseSettingsEl.innerHTML = '<div class="home-run-log-empty">House Curses stay sealed until World 1 has been cleared once.</div>';
      updateCurseStatus();
      return;
    }
    const equipped = new Set(currentHomeCurseKeys(homeProgress));
    curseSettingsEl.innerHTML = Object.entries(RUN_CURSE_DEFS).map(([key, meta]) => `
      <article class="title-option${equipped.has(key) ? " active" : ""}" data-rarity="4">
        <strong>${meta.label}</strong>
        <span class="title-option-meta">+${meta.xpBonus}% XP</span>
        <small>${meta.desc}</small>
        <button class="btn btn-outline game-btn" type="button" data-curse-key="${key}">${equipped.has(key) ? "Remove Curse" : "Equip Curse"}</button>
      </article>
    `).join("");
    updateCurseStatus();
  }

  function homeUpcomingRouteMilestones(progress) {
    const items = [];
    const level = homeProgressLevel(progress);
    HOME_ROUTE_MILESTONES
      .filter((item) => level < item.level)
      .slice(0, 12)
      .forEach((item) => {
        items.push(item);
      });
    return items.slice(0, 12);
  }

  function homeAchievementTargets(progress) {
    return Object.entries(HOME_TITLE_META)
      .filter(([key, meta]) => key !== "newcomer" && !meta.unlock(progress))
      .map(([key, meta]) => ({
        key,
        label: meta.label,
        rarity: meta.rarity || 1,
        detail: meta.hidden ? SECRET_TITLE_ERROR_TEXT : (meta.unlockText || key)
      }));
  }

  function clampProgressPart(current, target) {
    const safeTarget = Math.max(1, Number(target) || 1);
    const safeCurrent = Math.max(0, Number(current) || 0);
    return Math.max(0, Math.min(1, safeCurrent / safeTarget));
  }

  function homeAchievementProgress(progress, key) {
    const meta = HOME_TITLE_META[key];
    if (meta?.hidden) {
      const unlocked = (progress?.rareTitleMarks?.[key] || 0) > 0;
      return {
        parts: [],
        percent: unlocked ? 100 : 0,
        label: unlocked ? "ARCHIVE RESTORED" : SECRET_TITLE_PROGRESS_TEXT
      };
    }
    const level = homeProgressLevel(progress);
    const partMap = {
      "ashwalker": [
        { label: "Map", current: progress.highestMapReached, target: 2 }
      ],
      "pit-counter": [
        { label: "Bosses", current: progress.totalBossesDefeated, target: 1 }
      ],
      "chip-keeper": [
        { label: "Vaults", current: progress.vaultsOpened, target: 3 }
      ],
      "cinder-counter": [
        { label: "Forge", current: progress.forgesUsed, target: 3 }
      ],
      "house-burned": [
        { label: "Bosses", current: progress.totalBossesDefeated, target: 3 }
      ],
      "house-reader": [
        { label: "Blackjacks", current: progress.blackjacksWon, target: 5 }
      ],
      "ledger-breaker": [
        { label: "Trials", current: progress.skillTrialsCleared, target: 3 }
      ],
      "devils-favorite": [
        { label: "Clears", current: progress.worldOneClears, target: 1 }
      ],
      "abyss-witness": [
        { label: "Clears", current: progress.worldOneClears, target: 3 }
      ],
      "seat-of-cinders": [
        { label: "Level", current: level, target: 12 },
        { label: "Clears", current: progress.worldOneClears, target: 2 }
      ],
      "debt-eclipse": [
        { label: "Level", current: level, target: 18 },
        { label: "Bosses", current: progress.totalBossesDefeated, target: 8 }
      ],
      "table-revenant": [
        { label: "Level", current: level, target: 24 },
        { label: "Blackjacks", current: progress.blackjacksWon, target: 12 }
      ],
      "house-mirage": [
        { label: "Level", current: level, target: 28 },
        { label: "Trials", current: progress.skillTrialsCleared, target: 8 },
        { label: "Vaults", current: progress.vaultsOpened, target: 8 }
      ],
      "crowned-return": [
        { label: "Level", current: level, target: 33 },
        { label: "Clears", current: progress.worldOneClears, target: 5 },
        { label: "Bosses", current: progress.totalBossesDefeated, target: 12 }
      ],
      "pit-sovereign": [
        { label: "Level", current: level, target: 45 },
        { label: "Bosses", current: progress.totalBossesDefeated, target: 24 },
        { label: "Clears", current: progress.worldOneClears, target: 8 }
      ],
      "ledger-null": [
        { label: "Level", current: level, target: 60 },
        { label: "Trials", current: progress.skillTrialsCleared, target: 15 },
        { label: "Vaults", current: progress.vaultsOpened, target: 15 }
      ],
      "house-blackout": [
        { label: "Level", current: level, target: 75 },
        { label: "Blackjacks", current: progress.blackjacksWon, target: 30 },
        { label: "Bosses", current: progress.totalBossesDefeated, target: 40 },
        { label: "Clears", current: progress.worldOneClears, target: 12 }
      ],
      "final-seat": [
        { label: "Level", current: level, target: 100 },
        { label: "Clears", current: progress.worldOneClears, target: 20 },
        { label: "Bosses", current: progress.totalBossesDefeated, target: 60 },
        { label: "Blackjacks", current: progress.blackjacksWon, target: 50 }
      ]
    };
    const parts = partMap[key] || [];
    const percent = parts.length
      ? Math.round((parts.reduce((sum, part) => sum + clampProgressPart(part.current, part.target), 0) / parts.length) * 100)
      : 0;
    return {
      parts,
      percent,
      label: parts.map((part) => `${part.label} ${Math.min(part.current, part.target)}/${part.target}`).join(" · ")
    };
  }

  function unlockedTitleKeys(progress = homeProgress) {
    return Object.keys(HOME_TITLE_META).filter((key) => HOME_TITLE_META[key].unlock(progress));
  }

  function renderTitleSettings() {
    if (!titleSettingsEl) {
      return;
    }
    const unlocked = new Set(unlockedTitleKeys());
    const equipped = new Set(homeProgress.equippedTitles);
    titleSettingsEl.innerHTML = Object.entries(HOME_TITLE_META).filter(([key]) => unlocked.has(key)).map(([key, meta]) => `
      <article class="title-option${equipped.has(key) ? " active" : ""}" data-rarity="${meta.rarity || 1}">
        <strong>${meta.label}</strong>
        <span class="title-option-meta">${HOME_RANK_LABELS[meta.rarity || 1]}</span>
        <small>${meta.effect}</small>
        <span class="title-option-meta">Unlocked</span>
        <button class="btn btn-outline game-btn" type="button" data-title-key="${key}">${equipped.has(key) ? "Unequip" : "Equip"}</button>
      </article>
    `).join("");
    const equippedTitles = homeProgress.equippedTitles.map((key) => HOME_TITLE_META[key]?.label || key).join(", ") || "No titles equipped";
    updateTitleStatus(`Unlocked ${unlocked.size} · Equipped ${homeProgress.equippedTitles.length}/3 · ${equippedTitles}`);
  }

  function renderKeybindSettings() {
    if (!keybindSettingsEl) {
      return;
    }
    keybindSettingsEl.innerHTML = Object.entries(HOME_KEYBIND_LABELS).map(([action, meta]) => `
      <article class="keybind-setting">
        <div class="keybind-setting-head">
          <strong>${meta.label}</strong>
          <button class="btn btn-outline game-btn keybind-bind-btn${waitingForKeybindAction === action ? " waiting" : ""}" type="button" data-keybind-action="${action}">${formatKeybind(customKeybinds[action])}</button>
        </div>
        <small>${meta.desc}</small>
      </article>
    `).join("");
  }

  function exportHomeSaveCode() {
    const runRaw = (() => {
      try {
        const raw = window.localStorage.getItem(HOME_RUN_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();
    const code = encodedSaveCode({
      version: HOME_CURRENT_SAVE_VERSION,
      progress: homeProgress,
      run: runRaw
    });
    setSaveCodePanelOpen(true);
    if (saveCodeInputEl) {
      saveCodeInputEl.value = code;
      saveCodeInputEl.focus();
      saveCodeInputEl.select();
    }
    updateSaveCodeStatus("Save code generated. Copy it to move this run and progression to another device.");
    return code;
  }

  async function copyHomeSaveCode() {
    const code = saveCodeInputEl?.value?.trim() || exportHomeSaveCode();
    try {
      await navigator.clipboard.writeText(code);
      updateSaveCodeStatus("Save code copied.");
    } catch {
      if (saveCodeInputEl) {
        saveCodeInputEl.focus();
        saveCodeInputEl.select();
      }
      updateSaveCodeStatus("Copy failed here. The code is selected so you can copy it manually.");
    }
  }

  function importHomeSaveCode() {
    const code = saveCodeInputEl?.value?.trim();
    if (!code) {
      updateSaveCodeStatus("Paste a Death Blackjack save code first.");
      return;
    }
    try {
      const payload = decodeSaveCode(code);
      homeProgress = payload.progress;
      saveHomeProgress();
      if (payload.run) {
        window.localStorage.setItem(HOME_RUN_KEY, JSON.stringify(payload.run));
      } else {
        window.localStorage.removeItem(HOME_RUN_KEY);
      }
      setSaveCodePanelOpen(false);
      renderHomeMeta();
      renderTitleSettings();
      updateSaveCodeStatus("Save code imported.");
    } catch (error) {
      updateSaveCodeStatus(error?.message || "That save code could not be loaded.");
    }
  }

  function exportHomeAccountCode() {
    const code = encodedAccountCode({
      version: HOME_CURRENT_SAVE_VERSION,
      progress: homeProgress,
      keybinds: customKeybinds
    });
    setAccountCodePanelOpen(true);
    if (accountCodeInputEl) {
      accountCodeInputEl.value = code;
      accountCodeInputEl.focus();
      accountCodeInputEl.select();
    }
    updateAccountStatus(`${homeProgress.accountLabel} account code generated. Keep it if you want to rejoin this account later.`);
    return code;
  }

  async function copyHomeAccountCode() {
    const code = accountCodeInputEl?.value?.trim() || exportHomeAccountCode();
    try {
      await navigator.clipboard.writeText(code);
      updateAccountStatus("Account code copied.");
    } catch {
      if (accountCodeInputEl) {
        accountCodeInputEl.focus();
        accountCodeInputEl.select();
      }
      updateAccountStatus("Copy failed here. The account code is selected so you can copy it manually.");
    }
  }

  function joinHomeAccountCode() {
    const code = accountCodeInputEl?.value?.trim();
    if (!code) {
      updateAccountStatus("Paste a Death Blackjack account code first.");
      return;
    }
    try {
      const payload = decodeAccountCode(code);
      homeProgress = payload.progress;
      customKeybinds = payload.keybinds;
      saveHomeProgress();
      saveHomeKeybinds();
      try {
        window.localStorage.removeItem(HOME_RUN_KEY);
      } catch {}
      setAccountCodePanelOpen(false);
      renderHomeMeta();
      renderTitleSettings();
      renderKeybindSettings();
      updateAccountStatus(`Joined ${homeProgress.accountLabel}. Old run state was cleared so this account starts clean.`);
      updateKeybindStatus("Keybinds loaded from the joined account.");
    } catch (error) {
      updateAccountStatus(error?.message || "That account code could not be loaded.");
    }
  }

  function leaveCurrentHomeAccount() {
    const currentLabel = homeProgress.accountLabel || HOME_DEV_ACCOUNT_LABEL;
    const confirmed = window.confirm(`Leave ${currentLabel} and switch to a fresh guest account? Export the account code first if you want to come back to this exact account later.`);
    if (!confirmed) {
      return;
    }
    homeProgress = createGuestHomeProgress();
    customKeybinds = keybindsWithDefaults();
    waitingForKeybindAction = "";
    saveHomeProgress();
    saveHomeKeybinds();
    try {
      window.localStorage.removeItem(HOME_RUN_KEY);
    } catch {}
    setAccountCodePanelOpen(false);
    setSaveCodePanelOpen(false);
    renderHomeMeta();
    renderTitleSettings();
    renderKeybindSettings();
    updateAccountStatus(`Left ${currentLabel}. You are now on a fresh ${homeProgress.accountLabel} account.`);
    updateKeybindStatus("Keybinds reset for the new account.");
  }

  function unlockAllHomeTitles() {
    if (!homeProgress?.devToolsUnlocked) {
      return;
    }
    homeProgress = {
      ...homeProgress,
      totalBossesDefeated: Math.max(homeProgress.totalBossesDefeated, 3),
      highestMapReached: Math.max(homeProgress.highestMapReached, 5),
      worldOneClears: Math.max(homeProgress.worldOneClears, 3),
      vaultsOpened: Math.max(homeProgress.vaultsOpened, 3),
      forgesUsed: Math.max(homeProgress.forgesUsed, 3),
      blackjacksWon: Math.max(homeProgress.blackjacksWon, 5),
      skillTrialsCleared: Math.max(homeProgress.skillTrialsCleared, 3),
      runsCompleted: Math.max(homeProgress.runsCompleted, 6),
      curseXpEarned: Math.max(homeProgress.curseXpEarned || 0, 600),
      rareTitleMarks: Object.fromEntries(Object.keys(SECRET_TITLE_DEFS).map((key) => [key, 1])),
      rareTitleStreaks: Object.fromEntries(Object.keys(SECRET_TITLE_DEFS).map((key) => [key, 3]))
    };
    saveHomeProgress();
    renderHomeMeta();
    renderTitleSettings();
    renderHomeDevTools();
    updateHomeDevToolsStatus("All title requirements are now met on this developer account.");
  }

  function maxHomeProgressMarks() {
    if (!homeProgress?.devToolsUnlocked) {
      return;
    }
    homeProgress = {
      ...homeProgress,
      totalBossesDefeated: 99,
      highestMapReached: 5,
      worldOneClears: 25,
      vaultsOpened: 50,
      forgesUsed: 50,
      blackjacksWon: 99,
      skillTrialsCleared: 50,
      runsCompleted: 99,
      curseXpEarned: 6000,
      rareTitleMarks: Object.fromEntries(Object.keys(SECRET_TITLE_DEFS).map((key) => [key, 3])),
      rareTitleStreaks: Object.fromEntries(Object.keys(SECRET_TITLE_DEFS).map((key) => [key, 9]))
    };
    saveHomeProgress();
    renderHomeMeta();
    renderTitleSettings();
    renderHomeDevTools();
    updateHomeDevToolsStatus("Progress marks maxed for testing.");
  }

  function clearHomeRunSave() {
    if (!homeProgress?.devToolsUnlocked) {
      return;
    }
    try {
      window.localStorage.removeItem(HOME_RUN_KEY);
    } catch {}
    renderHomeMeta();
    renderHomeDevTools();
    updateHomeDevToolsStatus("Stored run save cleared. New Run will boot from a clean state.");
  }

  function deleteHomeSaveData() {
    if (homeProgress.accountProtected) {
      const label = homeProgress.accountLabel || HOME_DEV_ACCOUNT_LABEL;
      const confirmedDevReset = window.confirm(`${label} is protected. Reset this account back to a clean dev baseline instead?`);
      if (!confirmedDevReset) {
        return;
      }
      try {
        window.localStorage.removeItem(HOME_PROGRESS_KEY);
        window.localStorage.removeItem(HOME_RUN_KEY);
      } catch {}
      homeProgress = defaultHomeProgress();
      saveHomeProgress();
      saveHomeKeybinds();
      setAccountCodePanelOpen(false);
      setSaveCodePanelOpen(false);
      renderHomeMeta();
      renderTitleSettings();
      renderKeybindSettings();
      updateSaveCodeStatus(`${label} was reset to a clean dev baseline. Dev tools stayed available.`);
      updateTitleStatus("Protected dev account reset to a fresh baseline.");
      updateAccountStatus(`${label} was reset to a clean dev baseline. You can still export or rejoin this dev account with an account code.`);
      return;
    }
    const confirmed = window.confirm("Delete all Death Blackjack save data, including progression, autosave, and transfer-save state?");
    if (!confirmed) {
      return;
    }
    try {
      window.localStorage.removeItem(HOME_PROGRESS_KEY);
      window.localStorage.removeItem(HOME_RUN_KEY);
      window.localStorage.removeItem(HOME_KEYBINDS_KEY);
    } catch {}
    homeProgress = createGuestHomeProgress();
    customKeybinds = keybindsWithDefaults();
    waitingForKeybindAction = "";
    saveHomeProgress();
    saveHomeKeybinds();
    setAccountCodePanelOpen(false);
    setSaveCodePanelOpen(false);
    renderHomeMeta();
    renderTitleSettings();
    renderKeybindSettings();
    updateSaveCodeStatus("Save data deleted. New progress will only save after the next checkpoint.");
    updateTitleStatus("Save data deleted. Titles reset to the default.");
    updateKeybindStatus("Keybinds reset to defaults.");
    updateAccountStatus("Save data deleted. You are now on a fresh guest account.");
  }

  function hasRunSave() {
    try {
      return !!window.localStorage.getItem(HOME_RUN_KEY);
    } catch {
      return false;
    }
  }

  function renderHomeMeta() {
    const progress = homeProgress;
    const unlocked = new Set(Object.keys(HOME_TITLE_META).filter((key) => HOME_TITLE_META[key].unlock(progress)));
    const equipped = new Set(progress.equippedTitles);
    const score = homeProgressScore(progress);
    const level = homeProgressLevel(progress);
    const nextLevelTarget = homeNextLevelTarget(progress);
    const previousLevelFloor = HOME_LEVEL_THRESHOLDS[Math.max(0, level - 1)] || 0;
    const levelSpan = nextLevelTarget ? Math.max(1, nextLevelTarget - previousLevelFloor) : 1;
    const levelProgress = nextLevelTarget
      ? Math.max(0, Math.min(100, ((score - previousLevelFloor) / levelSpan) * 100))
      : 100;
    if (homeStatusEl) {
      const modeLabel = progress.devToolsUnlocked ? "Dev" : "Standard";
      homeStatusEl.textContent = hasRunSave()
        ? `${progress.accountLabel} (${modeLabel}) account active. A run save is waiting on the play page, and all settings can be managed here.`
        : `${progress.accountLabel} (${modeLabel}) account active. Titles, keybinds, save tools, and account switching now live here between runs.`;
    }
    if (homeEquippedTitlesEl) {
      homeEquippedTitlesEl.innerHTML = progress.equippedTitles.length ? progress.equippedTitles.map((key, index) => {
        const meta = HOME_TITLE_META[key] || HOME_TITLE_META.newcomer;
        return `
          <article class="title-option active" data-rarity="${meta.rarity}">
            <strong>Slot ${index + 1}: ${meta.label}</strong>
            <span class="title-option-meta">${HOME_RANK_LABELS[meta.rarity]}</span>
            <small>${meta.effect}</small>
          </article>
        `;
      }).join("") : '<div class="home-run-log-empty">No titles equipped. The next run starts without a title deck modifier.</div>';
    }
    if (homeProgressStatsEl) {
      const stats = [
        ["Runs Completed", progress.runsCompleted],
        ["Bosses Defeated", progress.totalBossesDefeated],
        ["Highest Map", `${progress.highestMapReached}/5`],
        ["World 1 Clears", progress.worldOneClears],
        ["Vaults Opened", progress.vaultsOpened],
        ["Forge Uses", progress.forgesUsed],
        ["Natural Blackjacks", progress.blackjacksWon],
        ["Skill Trials Cleared", progress.skillTrialsCleared],
        ["Curse XP", progress.curseXpEarned]
      ];
      homeProgressStatsEl.innerHTML = stats.map(([label, value]) => `
        <article class="home-progress-stat">
          <strong>${value}</strong>
          <span>${label}</span>
        </article>
      `).join("");
    }
    if (homeTitleCollectionEl) {
      homeTitleCollectionEl.innerHTML = "";
    }
    if (homeRunLogEl) {
      const recentRuns = sanitizeRecentRuns(progress.recentRuns);
      homeRunLogEl.innerHTML = recentRuns.length
        ? recentRuns.map((entry) => `
          <article class="home-run-log-entry">
            <strong>${entry.summary}</strong>
            <span>${entry.detail || "No extra detail saved for this run."}</span>
            <small>Map ${entry.map}/5 · Cash ${entry.cash} · Lives ${entry.lives}</small>
          </article>
        `).join("")
        : '<div class="home-run-log-empty">Finished runs will appear here once the House has something worth recording.</div>';
    }
    if (homeLevelTrackEl) {
      const unlocks = homeUpcomingRouteMilestones(progress);
      homeLevelTrackEl.innerHTML = `
        <div class="home-level-summary">
          <div>
            <p class="home-level-kicker">House Level</p>
            <strong>Level ${level}</strong>
            <span>${score} score${nextLevelTarget ? ` · next at ${nextLevelTarget}` : " · level cap reached"}</span>
          </div>
          <div class="home-level-rank">
            <strong>${HOME_RANK_LABELS[currentHomeRankCap(progress)]}</strong>
            <span>Cards ${currentHomeCardOfferCount(progress)} · Support ${currentHomeSupportOfferCount(progress)} · Camp +${currentHomeCampRecoveryAmount(progress)}${currentHomeCurseKeys(progress).length ? ` · Curses +${currentHomeCurseXpBonus(progress)}% XP` : ""}</span>
          </div>
        </div>
        <div class="home-level-bar" aria-hidden="true">
          <span style="width:${levelProgress.toFixed(1)}%"></span>
        </div>
        <div class="home-level-unlocks">
          ${unlocks.map((item) => `
            <article class="home-unlock-chip">
              <span>${item.eyebrow}</span>
              <strong>${item.title}</strong>
              <small>${item.detail}</small>
              ${Array.isArray(item.rewards) && item.rewards.length ? `
                <div class="home-unlock-rewards">
                  ${item.rewards.map((reward) => `<em>${reward}</em>`).join("")}
                </div>
              ` : ""}
            </article>
          `).join("")}
        </div>
      `;
    }
    if (homeAchievementsEl) {
      const achievements = homeAchievementTargets(progress);
      homeAchievementsEl.innerHTML = achievements.length
        ? achievements.map((item) => {
          const achievementProgress = homeAchievementProgress(progress, item.key);
          return `
          <article class="home-title-chip locked">
            <strong>${item.label}</strong>
            <span>${HOME_RANK_LABELS[item.rarity]}</span>
            <small>${item.detail}</small>
            <div class="achievement-progress">
              <div class="achievement-progress-bar" aria-hidden="true">
                <span style="width:${achievementProgress.percent}%"></span>
              </div>
              <small>${achievementProgress.label || `${achievementProgress.percent}% complete`}</small>
            </div>
          </article>
        `;
        }).join("")
        : '<div class="home-run-log-empty">All current title achievements are unlocked. The House has nothing else to withhold here.</div>';
    }
    if (continueRunLink) {
      continueRunLink.textContent = hasRunSave() ? "Continue" : "Open Table";
      continueRunLink.setAttribute("href", hasRunSave() ? "./play.html?resume=1" : "./play.html?fresh=1");
    }
    renderCurseSettings();
    renderHomeDevTools();
  }

  homeProgress = loadHomeProgress();
  customKeybinds = loadHomeKeybinds();

  if (freshRunLink) {
    freshRunLink.addEventListener("click", () => {
      try {
        window.localStorage.removeItem(HOME_RUN_KEY);
      } catch {}
      window.location.href = "./play.html?fresh=1";
    });
  }

  if (titleSettingsEl) {
    titleSettingsEl.addEventListener("click", (event) => {
      const target = event.target.closest("[data-title-key]");
      if (!target) {
        return;
      }
      const key = target.getAttribute("data-title-key");
      const meta = HOME_TITLE_META[key];
      if (!meta || !meta.unlock(homeProgress)) {
        return;
      }
      const equipped = new Set(homeProgress.equippedTitles);
      if (equipped.has(key)) {
        homeProgress.equippedTitles = homeProgress.equippedTitles.filter((entry) => entry !== key);
        updateTitleStatus(`${meta.label} unequipped.`);
      } else if (homeProgress.equippedTitles.length >= 3) {
        updateTitleStatus("You can only equip 3 titles at a time.");
      } else {
        homeProgress.equippedTitles.push(key);
        updateTitleStatus(`${meta.label} equipped.`);
      }
      homeProgress.equippedTitles = [...new Set(homeProgress.equippedTitles.filter((entry) => HOME_TITLE_META[entry]).slice(0, 3))];
      saveHomeProgress();
      renderHomeMeta();
      renderTitleSettings();
    });
  }

  if (curseSettingsEl) {
    curseSettingsEl.addEventListener("click", (event) => {
      const target = event.target.closest("[data-curse-key]");
      if (!target || !curseLoadoutUnlocked(homeProgress)) {
        return;
      }
      const key = target.getAttribute("data-curse-key");
      if (!RUN_CURSE_DEFS[key]) {
        return;
      }
      const equipped = new Set(currentHomeCurseKeys(homeProgress));
      if (equipped.has(key)) {
        equipped.delete(key);
      } else {
        equipped.add(key);
      }
      homeProgress = {
        ...homeProgress,
        equippedCurses: sanitizeCurseKeys([...equipped])
      };
      saveHomeProgress();
      renderHomeMeta();
      updateCurseStatus(
        equipped.has(key)
          ? `${RUN_CURSE_DEFS[key].label} equipped. Next run earns +${currentHomeCurseXpBonus(homeProgress)}% bonus XP.`
          : `${RUN_CURSE_DEFS[key].label} removed.`
      );
    });
  }

  if (keybindSettingsEl) {
    keybindSettingsEl.addEventListener("click", (event) => {
      const target = event.target.closest("[data-keybind-action]");
      if (!target) {
        return;
      }
      waitingForKeybindAction = target.getAttribute("data-keybind-action") || "";
      renderKeybindSettings();
      updateKeybindStatus(waitingForKeybindAction ? `Press a key for ${HOME_KEYBIND_LABELS[waitingForKeybindAction]?.label || waitingForKeybindAction}.` : "Click a bind, then press a key.");
    });
  }

  window.addEventListener("keydown", (event) => {
    if (!waitingForKeybindAction) {
      return;
    }
    event.preventDefault();
    const normalized = normalizedKeyName(event.key);
    if (!normalized) {
      return;
    }
    customKeybinds[waitingForKeybindAction] = [normalized];
    waitingForKeybindAction = "";
    saveHomeKeybinds();
    renderKeybindSettings();
    updateKeybindStatus("Keybind updated.");
  });

  if (resetKeybindsBtn) {
    resetKeybindsBtn.addEventListener("click", () => {
      customKeybinds = keybindsWithDefaults();
      waitingForKeybindAction = "";
      saveHomeKeybinds();
      renderKeybindSettings();
      updateKeybindStatus("Keybinds reset to defaults.");
    });
  }

  if (exportAccountBtn) {
    exportAccountBtn.addEventListener("click", () => {
      exportHomeAccountCode();
    });
  }

  if (joinAccountBtn) {
    joinAccountBtn.addEventListener("click", () => {
      setAccountCodePanelOpen(true);
      updateAccountStatus("Paste a Death Blackjack account code, then join it.");
      if (accountCodeInputEl) {
        accountCodeInputEl.focus();
      }
    });
  }

  if (copyAccountBtn) {
    copyAccountBtn.addEventListener("click", () => {
      copyHomeAccountCode();
    });
  }

  if (applyAccountBtn) {
    applyAccountBtn.addEventListener("click", () => {
      joinHomeAccountCode();
    });
  }

  if (leaveAccountBtn) {
    leaveAccountBtn.addEventListener("click", () => {
      leaveCurrentHomeAccount();
    });
  }

  if (homeDevUnlockTitlesBtn) {
    homeDevUnlockTitlesBtn.addEventListener("click", () => {
      unlockAllHomeTitles();
    });
  }

  if (homeDevMaxProgressBtn) {
    homeDevMaxProgressBtn.addEventListener("click", () => {
      maxHomeProgressMarks();
    });
  }

  if (homeDevClearRunBtn) {
    homeDevClearRunBtn.addEventListener("click", () => {
      clearHomeRunSave();
    });
  }

  if (exportSaveBtn) {
    exportSaveBtn.addEventListener("click", () => {
      exportHomeSaveCode();
    });
  }

  if (importSaveBtn) {
    importSaveBtn.addEventListener("click", () => {
      setSaveCodePanelOpen(true);
      updateSaveCodeStatus("Paste a Death Blackjack save code, then apply it.");
      if (saveCodeInputEl) {
        saveCodeInputEl.focus();
      }
    });
  }

  if (copySaveBtn) {
    copySaveBtn.addEventListener("click", () => {
      copyHomeSaveCode();
    });
  }

  if (applySaveBtn) {
    applySaveBtn.addEventListener("click", () => {
      importHomeSaveCode();
    });
  }

  if (deleteSaveBtn) {
    deleteSaveBtn.addEventListener("click", () => {
      deleteHomeSaveData();
    });
  }

  renderHomeMeta();
  renderTitleSettings();
  renderCurseSettings();
  renderKeybindSettings();
  updateAccountStatus();
  })();
}

const bjScreen = document.querySelector(".blackjack-screen");
if (bjScreen) {
  const dealerCardsEl = document.getElementById("bjDealerCards");
  const dealerPoolEl = document.getElementById("bjDealerPool");
  const deckBoxEl = document.getElementById("bjDeckBox");
  const dealerImpactEl = document.getElementById("bjDealerImpact");
  const playerCardsEl = document.getElementById("bjPlayerCards");
  const dealerTotalEl = document.getElementById("bjDealerTotal");
  const playerTotalEl = document.getElementById("bjPlayerTotal");
  const eventBadgeEl = document.getElementById("bjEventBadge");
  const dealerFaceEl = document.getElementById("bjDealerFace");
  const chipStackEl = document.getElementById("bjChipStack");
  const statusEl = document.getElementById("bjStatus");
  const streakStatusEl = document.getElementById("bjStreakStatus");
  const tableStatusEl = document.getElementById("bjTableStatus");
  const summaryRunEl = document.getElementById("bjSummaryRun");
  const summaryDealerEl = document.getElementById("bjSummaryDealer");
  const summaryProgressEl = document.getElementById("bjSummaryProgress");
  const summaryStakeEl = document.getElementById("bjSummaryStake");
  const lossOverlayEl = document.getElementById("bjLossOverlay");
  const lossTitleEl = document.getElementById("bjLossTitle");
  const lossReasonEl = document.getElementById("bjLossReason");
  const lossCashEl = document.getElementById("bjLossCash");
  const lossLivesEl = document.getElementById("bjLossLives");
  const lossMapEl = document.getElementById("bjLossMap");
  const lossAccountEl = document.getElementById("bjLossAccount");
  const lossStatusEl = document.getElementById("bjLossStatus");
  const lossDebtEl = document.getElementById("bjLossDebt");
  const lossHandEl = document.getElementById("bjLossHand");
  const lossLuckEl = document.getElementById("bjLossLuck");
  const lossGlitchAEl = document.getElementById("bjLossGlitchA");
  const lossGlitchBEl = document.getElementById("bjLossGlitchB");
  const lossGlitchCEl = document.getElementById("bjLossGlitchC");
  const lossErrorsEl = document.getElementById("bjLossErrors");
  const lossFlashEl = document.getElementById("bjLossFlash");
  const restartRunBtn = document.getElementById("bjRestartRunBtn");
  const deckUpgradeEl = document.getElementById("bjDeckUpgrade");
  const deckStatusEl = document.getElementById("bjDeckStatus");
  const deckUpgradeTitleEl = deckUpgradeEl ? deckUpgradeEl.querySelector("h3") : null;
  const shopMarketEl = deckUpgradeEl ? deckUpgradeEl.querySelector(".shop-market") : null;
  const startNextTableBtn = document.getElementById("bjStartNextTableBtn");
  const campUpgradePanelEl = document.getElementById("bjCampUpgradePanel");
  const campUpgradeStatusEl = document.getElementById("bjCampUpgradeStatus");
  const trainingBtn = document.getElementById("bjTrainingBtn");
  const fusionBtn = document.getElementById("bjFusionBtn");
  const forgeTargetListEl = document.getElementById("bjForgeTargetList");
  const forgeActionHintEl = document.getElementById("bjForgeActionHint");
  const forgeApplyBtn = document.getElementById("bjForgeApplyBtn");
  const freeOfferEl = document.getElementById("bjFreeOffer");
  const cardOfferGridEl = document.getElementById("bjCardOfferGrid");
  const otherOfferGridEl = document.getElementById("bjOtherOfferGrid");
  const battleMapEl = document.getElementById("bjBattleMap");
  const routeChoicesEl = document.getElementById("bjRouteChoices");
  const routeStatusEl = document.getElementById("bjRouteStatus");
  const futurePreviewEl = document.getElementById("bjFuturePreview");
  const confirmRouteBtn = document.getElementById("bjConfirmRouteBtn");
  const closeMapBtn = document.getElementById("bjCloseMapBtn");
  const mapBtn = document.getElementById("bjMapBtn");
  const originalModeBtn = document.getElementById("bjOriginalModeBtn");
  const countHelperBtn = document.getElementById("bjCountHelperBtn");
  const homeBtn = document.getElementById("bjHomeBtn");
  const settingsBtn = document.getElementById("bjSettingsBtn");
  const showKeybindsCheck = document.getElementById("bjShowKeybindsCheck");
  const countHelperPanelEl = document.getElementById("bjCountHelperPanel");
  const runningCountEl = document.getElementById("bjRunningCount");
  const adviceTextEl = document.getElementById("bjAdviceText");
  const combatLogEl = document.getElementById("bjCombatLog");
  const dealerIntelEl = document.getElementById("bjDealerIntel");
  const ownedCardsListEl = document.getElementById("bjOwnedCardsList");
  const passiveListEl = document.getElementById("bjPassiveList");
  const explainToggleBtn = document.getElementById("bjExplainToggleBtn");
  const settingsPanelEl = document.getElementById("bjSettingsPanel");
  const keybindSettingsEl = document.getElementById("bjKeybindSettings");
  const keybindStatusEl = document.getElementById("bjKeybindStatus");
  const resetKeybindsBtn = document.getElementById("bjResetKeybindsBtn");
  const titleSettingsEl = document.getElementById("bjTitleSettings");
  const titleStatusEl = document.getElementById("bjTitleStatus");
  const homePanelEl = document.getElementById("bjHomePanel");
  const homeStatusEl = document.getElementById("bjHomeStatus");
  const homeEquippedTitlesEl = document.getElementById("bjHomeEquippedTitles");
  const homeTitleCollectionEl = document.getElementById("bjHomeTitleCollection");
  const homeProgressStatsEl = document.getElementById("bjHomeProgressStats");
  const continueRunBtn = document.getElementById("bjContinueRunBtn");
  const freshRunBtn = document.getElementById("bjFreshRunBtn");
  const exportSaveBtn = document.getElementById("bjExportSaveBtn");
  const importSaveBtn = document.getElementById("bjImportSaveBtn");
  const deleteSaveBtn = document.getElementById("bjDeleteSaveBtn");
  const saveCodePanelEl = document.getElementById("bjSaveCodePanel");
  const saveCodeStatusEl = document.getElementById("bjSaveCodeStatus");
  const saveCodeInputEl = document.getElementById("bjSaveCodeInput");
  const copySaveBtn = document.getElementById("bjCopySaveBtn");
  const applySaveBtn = document.getElementById("bjApplySaveBtn");
  const runDevToolsCardEl = document.getElementById("bjRunDevToolsCard");
  const runDevToolsStatusEl = document.getElementById("bjRunDevToolsStatus");
  const devAddCashBtn = document.getElementById("bjDevAddCashBtn");
  const devAddLivesBtn = document.getElementById("bjDevAddLivesBtn");
  const devOpenCampBtn = document.getElementById("bjDevOpenCampBtn");
  const devOpenForgeBtn = document.getElementById("bjDevOpenForgeBtn");
  const devOpenVaultBtn = document.getElementById("bjDevOpenVaultBtn");
  const devGrantLoadoutBtn = document.getElementById("bjDevGrantLoadoutBtn");
  const runInfoPanelEl = bjScreen.querySelector(".run-info-panel");
  const shopCardChecks = bjScreen.querySelectorAll("[data-shop-card]");
  const passiveChecks = bjScreen.querySelectorAll("[data-passive-upgrade]");
  const tacticalItemChecks = bjScreen.querySelectorAll("[data-tactical-item]");
  const choicePopupEl = document.getElementById("bjChoicePopup");
  const choiceTitleEl = document.getElementById("bjChoiceTitle");
  const choiceTextEl = document.getElementById("bjChoiceText");
  const choiceOptionsEl = document.getElementById("bjChoiceOptions");
  const handBoardEl = document.getElementById("bjHandBoard");
  const actionButtons = bjScreen.querySelectorAll("[data-bj-action]");
  const ACTION_LABELS = {
    hit: "Hit",
    stand: "Stand",
    double: "Double Down",
    split: "Split"
  };
  const suits = ["spades", "hearts", "diamonds", "clubs"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const TABLE_HANDS = 5;
  const DECK_COUNT = 2;
  const RESHUFFLE_AT = 52;
  const BASE_MAX_TOTAL = 21;
  const BJ_AUTO_WIN_PAYOUT = 1.5; // 3:2
  const suitSymbols = {
    spades: "&spades;",
    hearts: "&hearts;",
    diamonds: "&diams;",
    clubs: "&clubs;"
  };

  let deck = [];
  let dealerHand = [];
  let dealerHandsPool = [];
  let playerHand = [];
  let dealerHoleHidden = true;
  let roundOver = false;
  let firstMove = true;
  let betMultiplier = 1;
  let roundCount = 0;
  let currentEvent = "double-table";
  let winStreak = 0;
  let jackpotRoundArmed = false;
  let jackpotRoundActive = false;
  let playerAnimateIndex = -1;
  let dealerAnimateIndex = -1;
  let animateAllDeal = true;
  let lastChipCount = 0;
  let tableActive = false;
  let activeHandIndex = 0;
  let tableBetLocked = 100;
  let tableNet = 0;
  let tableDealerName = "Crimson Dealer";
  let tableDealerProfile = "aggressive";
  let tableHands = [];
  let tablesPlayed = 0;
  let waitingForShopChoice = false;
  let firstShopShown = false;
  let waitingForMapChoice = false;
  let nextDealerChoiceKey = null;
  let offeredRoutes = [];
  let currentMapNodeId = "s1_1";
  let pendingMapNodeId = null;
  let completedMapNodeIds = ["s1_1"];
  let mapPreviewOpen = false;
  let dealAnimationLock = false;
  let dealerRevealPulse = false;
  let originalMode = false;
  let countHelperVisible = false;
  let runningCount = 0;
  let dealerHoleCounted = false;
  let choiceResolver = null;
  let activeTools = {
    "rigged-shuffle": 0,
    "dealer-distract": 0,
    "chip-shield": 0,
    "lucky-draw": 0
  };
  let passiveState = {
    "deck-polish-used": 0,
    "sharp-eye-used": 0,
    "steel-nerves-used": false,
    "smoke-mirror-used": 0,
    "split-fund-used": 0,
    "grit-teeth-used": 0
  };
  let cardTraining = {};
  let megaStackUnlocked = false;
  let cardFusion = {};
  let forgeMode = "training";
  let forgeTargetCardKey = "";
  let forgeFusionSecondCardKey = "";
  let forgeActionSpent = false;
  let activeRunCurses = [];
  let runRareTracker = defaultRunRareTracker();
  let identityUpgrades = {
    "wild-card": false,
    "golden-ace": false,
    "peek-card": false,
    "pressure-card": false
  };
  let currentSpecialNodeType = "";
  let pendingVaultCredit = 0;
  let skillTrialActive = false;
  let skillTrialRewardPending = false;
  let currentTrialType = "";
  let skillTrialFailed = false;
  let currentShopOffers = {
    free: null,
    cards: [],
    others: []
  };
  let shopOffersDirty = true;
  let freeOfferClaimed = false;
  let runCash = 500;
  let runLives = 6;
  let runFailed = false;
  let currentMaxTotal = BASE_MAX_TOTAL;
  let earnedMaxBonusNodeIds = new Set();
  let ownedShopCards = new Set();
  let ownedShopCardCounts = {};
  let ownedPassiveCounts = {};
  let adviceIndex = 0;
  let adviceTimer = null;
  let adviceSwapTimer = null;
  let showLongRunInfo = false;
  let saveCodePanelOpen = false;
  let savePersistTimer = null;
  let combatLog = [];
  let runFailReason = "";
  let currentEncounterRule = null;
  let currentEncounterCleared = false;
  let currentNormalMonster = null;
  let dealerSignatureCardsRemaining = 0;
  let dealerEliteSignatureQueue = [];
  let dealerBossSignatureQueue = [];
  let currentBossNodeId = null;
  let currentBossRoundsCleared = 0;
  let currentBossSplitCullRound = 0;
  let currentEliteNodeId = null;
  let currentEliteRoundsPlayed = 0;
  let bossesDefeatedThisRun = 0;
  let worldOneMiddleBossOrder = [];
  let currentWorldMapNumber = 1;
  let blackjackProgress = null;
  let enemyIntelligencePoints = 0;
  let customKeybinds = null;
  let waitingForKeybindAction = "";
  const BOSS_FACE_KEYS = new Set(["lord-asmodeus", "jack-of-lies", "mammon", "mortis", "lilith", "belial"]);
  const DEALER_SLAM_FRAME_URLS = [
    "./animations/table-hit/frame-1.png",
    "./animations/table-hit/frame-2.png",
    "./animations/table-hit/frame-3.png",
    "./animations/table-hit/frame-4.png",
    "./animations/table-hit/frame-5.png",
    "./animations/table-hit/frame-6.png"
  ];
  const DEALER_SLAM_FRAME_MS = 140;
  const DEALER_SLAM_END_HOLD_MS = 520;
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
  let dealerImpactPlayId = 0;
  let lossCorruptionTimer = null;
  let lossErrorMutationTimer = null;
  let lossTextCorruptionTimer = null;
  let homePanelOpen = false;
  const CHARACTER_FACE_META = {
    "crooked-dealer": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_00_29 PM.png", position: "0% 10%", size: "360% 320%" },
    "card-shark": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_00_29 PM.png", position: "50% 10%", size: "360% 320%" },
    "pit-runner": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_00_29 PM.png", position: "100% 10%", size: "360% 320%" },
    "debt-collector": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_00_29 PM.png", position: "0% 74%", size: "360% 320%" },
    "smile-dealer": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_00_29 PM.png", position: "50% 74%", size: "360% 320%" },
    "false-angel": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_00_29 PM.png", position: "100% 74%", size: "360% 320%" },
    "velvet-snake": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_04_37 PM.png", position: "0% 10%", size: "360% 320%" },
    "ash-croupier": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_04_37 PM.png", position: "50% 10%", size: "360% 320%" },
    "chip-vulture": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_04_37 PM.png", position: "100% 10%", size: "360% 320%" },
    "red-glove": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_04_37 PM.png", position: "0% 74%", size: "360% 320%" },
    "silk-cheat": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_04_37 PM.png", position: "50% 74%", size: "360% 320%" },
    "house-hound": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_04_37 PM.png", position: "100% 74%", size: "360% 320%" },
    "brass-smile": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_00_29 PM.png", position: "50% 74%", size: "360% 320%" },
    "lucky-butcher": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_06_53 PM.png", position: "0% 28%", size: "245% 205%" },
    "floor-whisper": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_06_53 PM.png", position: "100% 28%", size: "245% 205%" },
    "pit-boss": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_09_39 PM.png", position: "0% 10%", size: "360% 320%" },
    "loaded-sleeve": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_09_39 PM.png", position: "50% 10%", size: "360% 320%" },
    "split-punisher": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_09_39 PM.png", position: "100% 10%", size: "360% 320%" },
    "ash-magistrate": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_09_39 PM.png", position: "0% 74%", size: "360% 320%" },
    "velvet-auditor": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_09_39 PM.png", position: "50% 74%", size: "360% 320%" },
    "riot-dealer": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_09_39 PM.png", position: "100% 74%", size: "360% 320%" },
    "glass-saint": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_12_05 PM.png", position: "0% 10%", size: "360% 320%" },
    "red-notary": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_12_05 PM.png", position: "50% 10%", size: "360% 320%" },
    "house-fang": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_12_05 PM.png", position: "100% 10%", size: "360% 320%" },
    "lucky-executioner": { image: "./games/death-blackjack/charecters/ChatGPT Image Mar 13, 2026, 01_12_05 PM.png", position: "84% 76%", size: "305% 320%" }
  };

  function addKeybindChips() {
    applyKeybindLabels();
    bjScreen.querySelectorAll("[data-keybind]").forEach((btn) => {
      const existing = btn.querySelector(".keybind-chip");
      if (existing) {
        existing.textContent = btn.getAttribute("data-keybind");
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
    if (showKeybindsCheck) {
      showKeybindsCheck.checked = !!show;
    }
  }

  function resetBlackjackKeybinds() {
    customKeybinds = keybindsWithDefaults();
    waitingForKeybindAction = "";
    saveBlackjackKeybinds();
    renderKeybindSettings();
    addKeybindChips();
    updateKeybindStatus("Keybinds reset to defaults.");
  }

  function renderCombatLog() {
    if (!combatLogEl) {
      return;
    }
    if (!combatLog.length) {
      combatLogEl.innerHTML = '<div class="table-panel-empty">Log will fill as the table deals cards, triggers abilities, and resolves hands.</div>';
      return;
    }
    combatLogEl.innerHTML = combatLog.map((entry, index) => `
      <div class="combat-log-entry${index === 0 ? " is-latest" : ""}">${entry}</div>
    `).join("");
  }

  function pushCombatLog(message) {
    if (!message) {
      return;
    }
    if (combatLog[0] === message) {
      renderCombatLog();
      return;
    }
    combatLog.unshift(message);
    combatLog = combatLog.slice(0, 10);
    renderCombatLog();
  }

  function clearCombatLog(seedMessage = "") {
    combatLog = [];
    if (seedMessage) {
      combatLog.push(seedMessage);
    }
    renderCombatLog();
  }

  function setGlitchLine(element, text) {
    if (!element) {
      return;
    }
    element.textContent = text;
    element.setAttribute("data-text", text);
  }

  function setLossInfoLine(element, text) {
    if (!element) {
      return;
    }
    element.textContent = text;
    element.setAttribute("data-text", text);
  }

  function stopLossEffects() {
    if (lossCorruptionTimer) {
      window.clearTimeout(lossCorruptionTimer);
      lossCorruptionTimer = null;
    }
    if (lossErrorMutationTimer) {
      window.clearTimeout(lossErrorMutationTimer);
      lossErrorMutationTimer = null;
    }
    if (lossTextCorruptionTimer) {
      window.clearTimeout(lossTextCorruptionTimer);
      lossTextCorruptionTimer = null;
    }
    if (lossOverlayEl) {
      lossOverlayEl.style.filter = "none";
      lossOverlayEl.style.transform = "translate(0, 0)";
    }
    if (lossFlashEl) {
      lossFlashEl.style.background = "rgba(255, 40, 40, 0)";
    }
    [
      lossAccountEl,
      lossStatusEl,
      lossDebtEl,
      lossHandEl,
      lossLuckEl,
      lossTitleEl,
      lossReasonEl,
      lossCashEl,
      lossLivesEl,
      lossMapEl,
    ].forEach((element) => {
      if (!element) return;
      element.classList.remove("execution-corrupt");
      const stable = element.getAttribute("data-text");
      if (stable) element.textContent = stable;
    });
  }

  function corruptExecutionText(text) {
    if (!text) {
      return text;
    }
    const candidates = [...text].map((char, index) => ({ char, index }))
      .filter(({ char }) => /[A-Z0-9$]/.test(char));
    if (!candidates.length) {
      return text;
    }
    const { char, index } = candidates[Math.floor(Math.random() * candidates.length)];
    const replacements = EXECUTION_TEXT_ALTS[char] || ["#", "%", "?", "*"];
    const nextChar = replacements[Math.floor(Math.random() * replacements.length)];
    return `${text.slice(0, index)}${nextChar}${text.slice(index + 1)}`;
  }

  function pulseLossInfoText() {
    if (!runFailed || !lossOverlayEl || lossOverlayEl.classList.contains("hidden")) {
      return;
    }
    const nodes = [
      lossAccountEl,
      lossStatusEl,
      lossDebtEl,
      lossHandEl,
      lossLuckEl,
      lossTitleEl,
      lossReasonEl,
      lossCashEl,
      lossLivesEl,
      lossMapEl,
    ].filter(Boolean);
    if (nodes.length) {
      const element = nodes[Math.floor(Math.random() * nodes.length)];
      const stable = element.getAttribute("data-text") || element.textContent;
      element.classList.add("execution-corrupt");
      element.textContent = corruptExecutionText(stable);
      window.setTimeout(() => {
        element.textContent = stable;
        element.classList.remove("execution-corrupt");
      }, 140 + Math.random() * 220);
    }
    lossTextCorruptionTimer = window.setTimeout(pulseLossInfoText, 850 + Math.random() * 1700);
  }

  function mutateLossErrors(errorPool) {
    if (!lossErrorsEl || !runFailed) {
      return;
    }
    const items = lossErrorsEl.querySelectorAll("span");
    items.forEach((el) => {
      if (Math.random() < 0.28) {
        el.textContent = pickOne(errorPool);
      }
      if (Math.random() < 0.18) {
        el.style.top = `${Math.random() * 100}%`;
        el.style.left = `${Math.random() * 100}%`;
      }
    });
    lossErrorMutationTimer = window.setTimeout(() => mutateLossErrors(errorPool), 700 + Math.random() * 1400);
  }

  function triggerLossCorruption() {
    if (!lossOverlayEl || !lossFlashEl || !runFailed) {
      return;
    }
    const intensity = 118 + Math.floor(Math.random() * 34);
    const hue = -8 + Math.floor(Math.random() * 16);
    const x = -2 + Math.random() * 4;
    const y = -2 + Math.random() * 4;
    lossOverlayEl.style.filter = `contrast(${intensity}%) hue-rotate(${hue}deg) brightness(1.15)`;
    lossOverlayEl.style.transform = `translate(${x}px, ${y}px)`;
    lossFlashEl.style.background = "rgba(255, 40, 40, 0.12)";
    window.setTimeout(() => {
      if (!runFailed || !lossOverlayEl || !lossFlashEl) {
        return;
      }
      lossOverlayEl.style.filter = "none";
      lossOverlayEl.style.transform = "translate(0, 0)";
      lossFlashEl.style.background = "rgba(255, 40, 40, 0)";
    }, 70 + Math.random() * 60);
    lossCorruptionTimer = window.setTimeout(triggerLossCorruption, 2500 + Math.random() * 4000);
  }

  function initLossOverlayEffects() {
    if (!lossErrorsEl) {
      return;
    }
    stopLossEffects();
    const errorPool = [
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
    lossErrorsEl.innerHTML = "";
    for (let i = 0; i < 26; i += 1) {
      const el = document.createElement("span");
      el.textContent = pickOne(errorPool);
      el.style.top = `${Math.random() * 100}%`;
      el.style.left = `${Math.random() * 100}%`;
      el.style.animationDuration = `${8 + Math.random() * 8}s`;
      el.style.animationDelay = `${-Math.random() * 10}s`;
      lossErrorsEl.appendChild(el);
    }
    mutateLossErrors(errorPool);
    lossCorruptionTimer = window.setTimeout(triggerLossCorruption, 1800);
    lossTextCorruptionTimer = window.setTimeout(pulseLossInfoText, 900);
  }

  function updateLossOverlay() {
    if (!lossOverlayEl) {
      return;
    }
    if (!runFailed) {
      lossOverlayEl.classList.add("hidden");
      stopLossEffects();
      return;
    }
    const accountCode = `${Math.abs((runCash * 17) + (runLives * 31) + (currentWorldMapNumber * 97)).toString(16).toUpperCase().slice(0, 6) || "6479A7"}`;
    const handStateLine = currentSpecialNodeType === "boss" ? "HAND: EXECUTED" : "HAND: BUST";
    const debtState = runCash <= 0 ? "DEBT: UNPAID" : `DEBT: ${fmtMoney(runCash)} FORFEITED`;
    const reasonLine = runFailReason || (runLives <= 0
      ? "SOUL COLLATERAL: CLAIMED"
      : "ACCOUNT ACCESS: REVOKED");
    setLossInfoLine(lossAccountEl, `ACCOUNT: ${accountCode}`);
    setLossInfoLine(lossStatusEl, "STATUS: TERMINATED");
    setLossInfoLine(lossDebtEl, debtState);
    setLossInfoLine(lossHandEl, handStateLine);
    setLossInfoLine(lossLuckEl, "LUCK: EXHAUSTED");
    setLossInfoLine(lossTitleEl, runLives <= 0 ? "SENTENCE: EXECUTION" : "SENTENCE: SEIZURE");
    setLossInfoLine(lossReasonEl, reasonLine.toUpperCase());
    setLossInfoLine(lossCashEl, `ASSETS: ${fmtMoney(runCash)}`);
    setLossInfoLine(lossLivesEl, `LIVES: ${runLives}`);
    setLossInfoLine(lossMapEl, `MAP: ${currentWorldMapNumber}/5`);
    setGlitchLine(lossGlitchAEl, "ACCOUNT RECORD: PURGED");
    setGlitchLine(lossGlitchBEl, currentSpecialNodeType === "boss" ? "ARCHIVE ERROR: 0xDEAD" : "ARCHIVE ERROR: 0xC0FFIN");
    setGlitchLine(lossGlitchCEl, "DATA INTEGRITY: FAILED");
    lossOverlayEl.classList.remove("hidden");
    if (!lossErrorsEl?.children.length) {
      initLossOverlayEffects();
    }
  }

  function resetCurrentRun(options = {}) {
    const skipSave = !!options.skipSave;
    const startImmediately = options.startImmediately !== false;
    activeRunCurses = currentConfiguredCurseKeys();
    runCash = Math.max(0, RUN_STARTING_CASH - runCurseStartCashPenalty());
    runLives = Math.max(1, RUN_STARTING_LIVES - runCurseStartLifePenalty());
    runFailed = false;
    runFailReason = "";
    waitingForShopChoice = false;
    waitingForMapChoice = false;
    offeredRoutes = [];
    nextDealerChoiceKey = null;
    pendingMapNodeId = null;
    currentMapNodeId = "s1_1";
    completedMapNodeIds = ["s1_1"];
    mapPreviewOpen = false;
    currentSpecialNodeType = "";
    pendingVaultCredit = 0;
    skillTrialActive = false;
    skillTrialRewardPending = false;
    currentBossNodeId = null;
    currentBossRoundsCleared = 0;
    currentBossSplitCullRound = 0;
    currentEliteNodeId = null;
    currentEliteRoundsPlayed = 0;
    bossesDefeatedThisRun = 0;
    enemyIntelligencePoints = runCurseEnemyIntelligenceBonus();
    worldOneMiddleBossOrder = shuffleList(["jack-of-lies", "mammon", "mortis", "lilith"]).slice(0, 3);
    currentWorldMapNumber = 1;
    cardTraining = {};
    megaStackUnlocked = false;
    cardFusion = {};
    forgeMode = "training";
    forgeTargetCardKey = "";
    forgeFusionSecondCardKey = "";
    forgeActionSpent = false;
    runRareTracker = defaultRunRareTracker();
    currentMaxTotal = BASE_MAX_TOTAL;
    earnedMaxBonusNodeIds = new Set();
    ownedShopCards = new Set();
    ownedShopCardCounts = {};
    ownedPassiveCounts = {};
    deck = buildDeck();
    dealerHand = [];
    dealerHandsPool = [];
    playerHand = [];
    tableHands = [];
    tableNet = 0;
    activeHandIndex = 0;
    tableActive = false;
    roundOver = true;
    dealAnimationLock = false;
    runningCount = 0;
    currentEncounterRule = null;
    currentNormalMonster = null;
    dealerSignatureCardsRemaining = 0;
    dealerEliteSignatureQueue = [];
    dealerBossSignatureQueue = [];
    shopOffersDirty = true;
    updateLossOverlay();
    renderRouteChoices();
    updateShopUI();
    updateMapPopupUI();
    updateAbilityStatus();
    renderRunInfo();
    renderTable();
    renderHandBoard();
    updateTableStatus("Home ready");
    updateCountHelperUI();
    clearCombatLog();
    if (!skipSave) {
      saveBlackjackCheckpoint();
    }
    if (startImmediately) {
      startTable();
    }
  }

  const RUN_STARTING_CASH = 360;
  const RUN_STARTING_LIVES = 8;
  const ELITE_PAYOUT_MULTIPLIER = 1.5;
  const BOSS_PAYOUT_MULTIPLIER = 0.12;
  const BLACKJACK_PROGRESS_KEY = "death_blackjack_progress_v1";
  const BLACKJACK_RUN_SAVE_KEY = "death_blackjack_run_save_v2";
  const BLACKJACK_SAVE_CODE_PREFIX = "DBJ1";
  const CURRENT_BLACKJACK_SAVE_VERSION = 2;
  const BLACKJACK_KEYBINDS_KEY = "death_blackjack_keybinds_v1";
  const DEV_ACCOUNT_ID = "dev-house";
  const DEV_ACCOUNT_LABEL = "House Developer";
  const FRESH_RUN_MODE = new URLSearchParams(window.location.search).get("fresh") === "1";
  const RESUME_RUN_MODE = new URLSearchParams(window.location.search).get("resume") === "1";
  const DEFAULT_KEYBINDS = {
    hit: ["h", "enter"],
    stand: ["s"],
    double: ["d"],
    split: ["p"],
    map: ["m"],
    nextHand: ["e"],
    prevHand: ["q"]
  };
  const KEYBIND_LABELS = {
    hit: { label: "Hit / Start Next Table", desc: "Primary action and round start." },
    stand: { label: "Stand", desc: "Stand on the active hand." },
    double: { label: "Double Down", desc: "Double the current hand." },
    split: { label: "Split", desc: "Split a valid opening pair." },
    map: { label: "Map", desc: "Open or close the battle map." },
    nextHand: { label: "Next Hand", desc: "Select the next playable hand." },
    prevHand: { label: "Previous Hand", desc: "Select the previous playable hand." }
  };
  const TITLE_META = {
    newcomer: {
      label: "Newcomer",
      rarity: 1,
      desc: "The first fool to sit at the Devil's table.",
      effect: "Adds 1 extra 8 to each fresh deck.",
      unlock: () => true,
      applyDeck: (cards) => addDeckRank(cards, "8", 1)
    },
    ashwalker: {
      label: "Ashwalker",
      rarity: 1,
      desc: "Touched the floor and came back breathing.",
      effect: "Adds 1 Ace and removes 1 two.",
      unlockText: "Reach Map 2 in a run.",
      unlock: (progress) => progress.highestMapReached >= 2,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        removeDeckRank(cards, "2", 1);
      }
    },
    "pit-counter": {
      label: "Pit Counter",
      rarity: 2,
      desc: "Read the heat of the table and kept moving.",
      effect: "Removes 1 three and 1 four.",
      unlockText: "Defeat 1 boss.",
      unlock: (progress) => progress.totalBossesDefeated >= 1,
      applyDeck: (cards) => {
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
      }
    },
    "chip-keeper": {
      label: "Chip Keeper",
      rarity: 2,
      desc: "Knows how to hide profit before the House notices.",
      effect: "Adds 1 ten and 1 six.",
      unlockText: "Open 3 Casino Vaults.",
      unlock: (progress) => progress.vaultsOpened >= 3,
      applyDeck: (cards) => {
        addDeckRank(cards, "10", 1);
        addDeckRank(cards, "6", 1);
      }
    },
    "cinder-counter": {
      label: "Cinder Counter",
      rarity: 2,
      desc: "Feels the infernal heat shift before the card lands.",
      effect: "Adds 1 Jack and removes 1 two.",
      unlockText: "Use the Card Forge 3 times.",
      unlock: (progress) => progress.forgesUsed >= 3,
      applyDeck: (cards) => {
        addDeckRank(cards, "J", 1);
        removeDeckRank(cards, "2", 1);
      }
    },
    "house-burned": {
      label: "House Burned",
      rarity: 3,
      desc: "Beat enough bosses to scar the casino.",
      effect: "Adds 1 ten and removes 1 two, 1 three, and 1 four.",
      unlockText: "Defeat 3 bosses.",
      unlock: (progress) => progress.totalBossesDefeated >= 3,
      applyDeck: (cards) => {
        addDeckRank(cards, "10", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
      }
    },
    "house-reader": {
      label: "House Reader",
      rarity: 3,
      desc: "Spots where the crooked floor leaves seams in the deck.",
      effect: "Adds 1 Ace and 1 nine, removes 1 two and 1 five.",
      unlockText: "Win 5 natural blackjacks.",
      unlock: (progress) => progress.blackjacksWon >= 5,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        addDeckRank(cards, "9", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "5", 1);
      }
    },
    "ledger-breaker": {
      label: "Ledger Breaker",
      rarity: 3,
      desc: "Refuses to let the casino keep perfect books on a live run.",
      effect: "Adds 2 face cards, removes 1 two, 1 three, and 1 four.",
      unlockText: "Clear 3 Skill Trials.",
      unlock: (progress) => progress.skillTrialsCleared >= 3,
      applyDeck: (cards) => {
        addDeckRank(cards, "Q", 1);
        addDeckRank(cards, "K", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
      }
    },
    "devils-favorite": {
      label: "Devil's Favorite",
      rarity: 4,
      desc: "Cleared World 1 and earned a cursed nameplate.",
      effect: "Adds 1 Ace and 1 King, removes 1 two, 1 three, and 1 four.",
      unlockText: "Clear World 1 once.",
      unlock: (progress) => progress.worldOneClears >= 1,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        addDeckRank(cards, "K", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
      }
    },
    "abyss-witness": {
      label: "Abyss Witness",
      rarity: 5,
      desc: "Sat at the deepest tables and came back branded by them.",
      effect: "Adds 1 Ace, 1 King, and 1 Queen, removes 1 two, 1 three, 1 four, and 1 five.",
      unlockText: "Clear World 1 three times.",
      unlock: (progress) => progress.worldOneClears >= 3,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        addDeckRank(cards, "K", 1);
        addDeckRank(cards, "Q", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "5", 1);
      }
    },
    "seat-of-cinders": {
      label: "Seat of Cinders",
      rarity: 4,
      desc: "Returned to the same burning seat until the felt remembered the shape.",
      effect: "Adds 1 Ace and 1 Queen, removes 1 two, 1 three, 1 four, and 1 five.",
      unlockText: "Reach level 12 and clear World 1 twice.",
      unlock: (progress) => blackjackProgressLevel(progress) >= 12 && progress.worldOneClears >= 2,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        addDeckRank(cards, "Q", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "5", 1);
      }
    },
    "debt-eclipse": {
      label: "Debt Eclipse",
      rarity: 4,
      desc: "Learned how to cover the ledger with bigger shadows.",
      effect: "Adds 2 tens and removes 1 two, 1 three, 1 four, and 1 six.",
      unlockText: "Reach level 18 and defeat 8 bosses.",
      unlock: (progress) => blackjackProgressLevel(progress) >= 18 && progress.totalBossesDefeated >= 8,
      applyDeck: (cards) => {
        addDeckRank(cards, "10", 2);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "6", 1);
      }
    },
    "table-revenant": {
      label: "Table Revenant",
      rarity: 5,
      desc: "Won enough naturals that the House kept seating the same ghost.",
      effect: "Adds 1 Ace, 1 King, and 1 ten, removes 1 two, 1 three, 1 four, and 1 five.",
      unlockText: "Reach level 24 and win 12 natural blackjacks.",
      unlock: (progress) => blackjackProgressLevel(progress) >= 24 && progress.blackjacksWon >= 12,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        addDeckRank(cards, "K", 1);
        addDeckRank(cards, "10", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "5", 1);
      }
    },
    "house-mirage": {
      label: "House Mirage",
      rarity: 5,
      desc: "Saw enough fake exits that the real ones started looking fake too.",
      effect: "Adds 1 Ace, 1 Queen, and 1 Jack, removes 1 two, 1 three, 1 four, 1 five, and 1 six.",
      unlockText: "Reach level 28, clear 8 trials, and open 8 vaults.",
      unlock: (progress) => blackjackProgressLevel(progress) >= 28 && progress.skillTrialsCleared >= 8 && progress.vaultsOpened >= 8,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        addDeckRank(cards, "Q", 1);
        addDeckRank(cards, "J", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "5", 1);
        removeDeckRank(cards, "6", 1);
      }
    },
    "crowned-return": {
      label: "Crowned Return",
      rarity: 5,
      desc: "Came back too many times for the House to pretend it had never seen you.",
      effect: "Adds 1 Ace, 1 King, 1 Queen, and 1 ten, removes 1 two, 1 three, 1 four, 1 five, and 1 six.",
      unlockText: "Reach level 33, clear World 1 five times, and defeat 12 bosses.",
      unlock: (progress) => blackjackProgressLevel(progress) >= 33 && progress.worldOneClears >= 5 && progress.totalBossesDefeated >= 12,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        addDeckRank(cards, "K", 1);
        addDeckRank(cards, "Q", 1);
        addDeckRank(cards, "10", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "5", 1);
        removeDeckRank(cards, "6", 1);
      }
    },
    "pit-sovereign": {
      label: "Pit Sovereign",
      rarity: 4,
      desc: "Stayed seated long enough for the pit to start recognizing you as part of the furniture.",
      effect: "Adds 1 Ace, 1 King, 1 Jack, and 1 nine, removes 1 two, 1 three, 1 four, and 1 five.",
      unlockText: "Reach level 45, defeat 24 bosses, and clear World 1 eight times.",
      unlock: (progress) => blackjackProgressLevel(progress) >= 45 && progress.totalBossesDefeated >= 24 && progress.worldOneClears >= 8,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        addDeckRank(cards, "K", 1);
        addDeckRank(cards, "J", 1);
        addDeckRank(cards, "9", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "5", 1);
      }
    },
    "ledger-null": {
      label: "Ledger Null",
      rarity: 5,
      desc: "Learned how to leave a debt mark and then erase the record before the House could close the line.",
      effect: "Adds 2 Aces and 1 Queen, removes 1 two, 1 three, 1 four, 1 five, and 1 six.",
      unlockText: "Reach level 60, clear 15 trials, and open 15 vaults.",
      unlock: (progress) => blackjackProgressLevel(progress) >= 60 && progress.skillTrialsCleared >= 15 && progress.vaultsOpened >= 15,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 2);
        addDeckRank(cards, "Q", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "5", 1);
        removeDeckRank(cards, "6", 1);
      }
    },
    "house-blackout": {
      label: "House Blackout",
      rarity: 5,
      desc: "Played long enough for the lights to dim whenever your account name crossed the table.",
      effect: "Adds 1 Ace, 1 King, 1 Queen, 1 Jack, and 1 ten, removes 1 two, 1 three, 1 four, 1 five, 1 six, and 1 seven.",
      unlockText: "Reach level 75, win 30 natural blackjacks, defeat 40 bosses, and clear World 1 twelve times.",
      unlock: (progress) => blackjackProgressLevel(progress) >= 75 && progress.blackjacksWon >= 30 && progress.totalBossesDefeated >= 40 && progress.worldOneClears >= 12,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 1);
        addDeckRank(cards, "K", 1);
        addDeckRank(cards, "Q", 1);
        addDeckRank(cards, "J", 1);
        addDeckRank(cards, "10", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "5", 1);
        removeDeckRank(cards, "6", 1);
        removeDeckRank(cards, "7", 1);
      }
    },
    "final-seat": {
      label: "Final Seat",
      rarity: 5,
      desc: "There is no invitation left to send after this one. The House already knows you will come back.",
      effect: "Adds 2 Aces, 1 King, 1 Queen, 1 Jack, and 1 ten, removes 1 two, 1 three, 1 four, 1 five, 1 six, 1 seven, and 1 eight.",
      unlockText: "Reach level 100, clear World 1 twenty times, defeat 60 bosses, and win 50 natural blackjacks.",
      unlock: (progress) => blackjackProgressLevel(progress) >= 100 && progress.worldOneClears >= 20 && progress.totalBossesDefeated >= 60 && progress.blackjacksWon >= 50,
      applyDeck: (cards) => {
        addDeckRank(cards, "A", 2);
        addDeckRank(cards, "K", 1);
        addDeckRank(cards, "Q", 1);
        addDeckRank(cards, "J", 1);
        addDeckRank(cards, "10", 1);
        removeDeckRank(cards, "2", 1);
        removeDeckRank(cards, "3", 1);
        removeDeckRank(cards, "4", 1);
        removeDeckRank(cards, "5", 1);
        removeDeckRank(cards, "6", 1);
        removeDeckRank(cards, "7", 1);
        removeDeckRank(cards, "8", 1);
      }
    }
  };
  Object.assign(TITLE_META, buildBlackjackSecretTitleMeta());

  const BLACKJACK_MAX_LEVEL = 100;
  function buildBlackjackLevelThresholds(maxLevel = BLACKJACK_MAX_LEVEL) {
    const thresholds = [0];
    let total = 0;
    for (let level = 2; level <= maxLevel; level += 1) {
      let increment = 50 + ((level - 2) * 8);
      if (level > 10 && level <= 30) {
        increment = 115 + ((level - 11) * 5);
      } else if (level > 30 && level <= 60) {
        increment = 215 + ((level - 31) * 6);
      } else if (level > 60) {
        increment = 395 + ((level - 61) * 7);
      }
      total += increment;
      thresholds.push(total);
    }
    return thresholds;
  }

  const BLACKJACK_LEVEL_THRESHOLDS = buildBlackjackLevelThresholds();
  const MAX_RECENT_RUNS = 8;

  function sanitizeRecentRuns(entries) {
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        summary: typeof entry.summary === "string" ? entry.summary.slice(0, 72) : "Unknown result",
        detail: typeof entry.detail === "string" ? entry.detail.slice(0, 160) : "",
        map: Math.max(1, Math.min(5, Number(entry.map) || 1)),
        cash: Math.max(0, Number(entry.cash) || 0),
        lives: Math.max(0, Number(entry.lives) || 0)
      }))
      .slice(0, MAX_RECENT_RUNS);
  }

  function blackjackProgressScore(progress) {
    return (
      ((Number(progress.totalBossesDefeated) || 0) * 100) +
      ((Number(progress.highestMapReached) || 0) * 35) +
      ((Number(progress.worldOneClears) || 0) * 320) +
      ((Number(progress.vaultsOpened) || 0) * 16) +
      ((Number(progress.forgesUsed) || 0) * 18) +
      ((Number(progress.blackjacksWon) || 0) * 14) +
      ((Number(progress.skillTrialsCleared) || 0) * 55) +
      ((Number(progress.runsCompleted) || 0) * 22) +
      ((Number(progress.curseXpEarned) || 0)) +
      (countUnlockedRareTitles(progress) * 180) +
      (sanitizeRecentRuns(progress.recentRuns).length * 6)
    );
  }

  function defaultRunRareTracker() {
    return {
      lifeLosses: 0,
      doubleUses: 0,
      splitUses: 0,
      campVisits: 0,
      forgeVisits: 0,
      vaultVisits: 0,
      riskVisits: 0,
      skillTrialsCleared: 0,
      naturalBlackjacks: 0,
      bossRoundLosses: 0,
      shopCardsGained: 0,
      passivesGained: 0,
      cursedHandWins: defaultCursedWinMarks()
    };
  }

  function sanitizeRunRareTracker(source = {}) {
    const defaults = defaultRunRareTracker();
    return Object.keys(defaults).reduce((acc, key) => {
      if (key === "cursedHandWins") {
        acc[key] = sanitizeCursedWinMarks(source?.[key]);
        return acc;
      }
      acc[key] = Math.max(0, Number(source?.[key]) || 0);
      return acc;
    }, {});
  }

  function blackjackProgressLevel(progress) {
    const score = blackjackProgressScore(progress);
    let level = 1;
    for (let i = 0; i < BLACKJACK_LEVEL_THRESHOLDS.length; i += 1) {
      if (score >= BLACKJACK_LEVEL_THRESHOLDS[i]) {
        level = i + 1;
      }
    }
    return level;
  }

  function defaultBlackjackProgress() {
    return {
      accountId: DEV_ACCOUNT_ID,
      accountLabel: DEV_ACCOUNT_LABEL,
      accountRole: "dev",
      accountProtected: true,
      devToolsUnlocked: true,
      totalBossesDefeated: 0,
      highestMapReached: 0,
      worldOneClears: 0,
      vaultsOpened: 0,
      forgesUsed: 0,
      blackjacksWon: 0,
      skillTrialsCleared: 0,
      runsCompleted: 0,
      curseXpEarned: 0,
      rareTitleMarks: defaultRareTitleMarks(),
      rareTitleStreaks: defaultRareTitleStreaks(),
      equippedCurses: [],
      equippedTitles: ["newcomer"],
      recentRuns: []
    };
  }

  function normalizeBlackjackZeroStart(progress) {
    const hasActivity = progress.totalBossesDefeated > 0
      || progress.worldOneClears > 0
      || progress.vaultsOpened > 0
      || progress.forgesUsed > 0
      || progress.blackjacksWon > 0
      || progress.skillTrialsCleared > 0
      || progress.runsCompleted > 0
      || progress.curseXpEarned > 0
      || countUnlockedRareTitles(progress) > 0
      || sanitizeRecentRuns(progress.recentRuns).length > 0;
    if (!hasActivity && progress.highestMapReached <= 1) {
      progress.highestMapReached = 0;
    }
    return progress;
  }

  function normalizedKeyName(key) {
    const value = String(key || "").toLowerCase().trim();
    if (value === " ") return "space";
    if (value === "escape") return "esc";
    return value;
  }

  function keybindsWithDefaults(source = {}) {
    return Object.keys(DEFAULT_KEYBINDS).reduce((acc, action) => {
      const value = Array.isArray(source[action]) ? source[action].map((entry) => normalizedKeyName(entry)).filter(Boolean) : DEFAULT_KEYBINDS[action];
      acc[action] = [...new Set(value.length ? value : DEFAULT_KEYBINDS[action])];
      return acc;
    }, {});
  }

  function loadBlackjackKeybinds() {
    try {
      const raw = window.localStorage.getItem(BLACKJACK_KEYBINDS_KEY);
      if (!raw) {
        return keybindsWithDefaults();
      }
      return keybindsWithDefaults(JSON.parse(raw));
    } catch {
      return keybindsWithDefaults();
    }
  }

  function saveBlackjackKeybinds() {
    try {
      window.localStorage.setItem(BLACKJACK_KEYBINDS_KEY, JSON.stringify(customKeybinds));
    } catch {}
  }

  function formatKeybind(keys = []) {
    return keys.map((key) => key === "enter" ? "Enter" : key === "esc" ? "Esc" : key === "space" ? "Space" : key.length === 1 ? key.toUpperCase() : key).join(" / ");
  }

  function keybindMatches(action, key) {
    return (customKeybinds[action] || []).includes(normalizedKeyName(key));
  }

  function updateKeybindStatus(message = "Click a bind, then press a key.") {
    if (keybindStatusEl) {
      keybindStatusEl.textContent = message;
    }
  }

  function renderKeybindSettings() {
    if (!keybindSettingsEl) {
      return;
    }
    keybindSettingsEl.innerHTML = Object.entries(KEYBIND_LABELS).map(([action, meta]) => `
      <article class="keybind-setting">
        <div class="keybind-setting-head">
          <strong>${meta.label}</strong>
          <button class="btn btn-outline game-btn keybind-bind-btn${waitingForKeybindAction === action ? " waiting" : ""}" type="button" data-keybind-action="${action}">${formatKeybind(customKeybinds[action])}</button>
        </div>
        <small>${meta.desc}</small>
      </article>
    `).join("");
  }

  function titleRarityLabel(key) {
    return itemRankLabel(TITLE_META[key]?.rarity || 1);
  }

  function titleUnlockText(meta) {
    if (!meta) {
      return "Locked";
    }
    if (meta.unlock(blackjackProgress)) {
      return "Unlocked";
    }
    if (meta.hidden) {
      return SECRET_TITLE_ERROR_TEXT;
    }
    if (meta.unlockText) {
      return meta.unlockText;
    }
    return "Locked";
  }

  function updateTitleStatus(message = "Titles stay between runs, unlock from progression, and slightly reshape the deck.") {
    if (titleStatusEl) {
      titleStatusEl.textContent = message;
    }
  }

  function hasStoredRunSave() {
    try {
      return !!window.localStorage.getItem(BLACKJACK_RUN_SAVE_KEY);
    } catch {
      return false;
    }
  }

  function renderHomeScreen() {
    const unlocked = new Set(unlockedTitleKeys());
    const equipped = new Set(currentTitleKeys());
    if (homeEquippedTitlesEl) {
      const equippedMetas = currentTitleMetas();
      homeEquippedTitlesEl.innerHTML = equippedMetas.length ? equippedMetas.map((meta, index) => `
        <article class="title-option active" data-rarity="${meta.rarity || 1}">
          <strong>Slot ${index + 1}: ${meta.label}</strong>
          <span class="title-option-meta">${itemRankLabel(meta.rarity || 1)}</span>
          <small>${meta.effect}</small>
        </article>
      `).join("") : '<div class="home-run-log-empty">No titles equipped. This run will start without a title-based deck modifier.</div>';
    }
    if (homeTitleCollectionEl) {
      homeTitleCollectionEl.innerHTML = Object.entries(TITLE_META).map(([key, meta]) => `
        <article class="home-title-chip${equipped.has(key) ? " equipped" : ""}${unlocked.has(key) ? "" : " locked"}" data-rarity="${meta.rarity || 1}">
          <strong>${meta.label}</strong>
          <span>${itemRankLabel(meta.rarity || 1)}</span>
          <small>${unlocked.has(key) ? meta.effect : (meta.hidden ? SECRET_TITLE_ERROR_TEXT : titleUnlockText(meta))}</small>
        </article>
      `).join("");
    }
    if (homeProgressStatsEl) {
      const stats = [
        ["Bosses Defeated", blackjackProgress.totalBossesDefeated],
        ["World 1 Clears", blackjackProgress.worldOneClears],
        ["Vaults Opened", blackjackProgress.vaultsOpened],
        ["Forge Uses", blackjackProgress.forgesUsed],
        ["Natural Blackjacks", blackjackProgress.blackjacksWon],
        ["Skill Trials Cleared", blackjackProgress.skillTrialsCleared],
        ["Curse XP", blackjackProgress.curseXpEarned]
      ];
      homeProgressStatsEl.innerHTML = stats.map(([label, value]) => `
        <article class="home-progress-stat">
          <strong>${value}</strong>
          <span>${label}</span>
        </article>
      `).join("");
    }
    if (homeStatusEl) {
      const accountLabel = blackjackProgress.accountLabel || DEV_ACCOUNT_LABEL;
      homeStatusEl.textContent = hasStoredRunSave()
        ? `${accountLabel} account active. A run save was found. Continue it, or start fresh.`
        : `${accountLabel} account active. Titles and feat progress stay with you between runs.`;
    }
    renderRunDevTools();
  }

  function setHomePanelOpen(show) {
    homePanelOpen = !!show;
    if (homePanelEl) {
      homePanelEl.classList.toggle("hidden", !homePanelOpen);
    }
    renderHomeScreen();
  }

  function renderTitleSettings() {
    if (!titleSettingsEl) {
      return;
    }
    const unlocked = new Set(unlockedTitleKeys());
    const equipped = new Set(currentTitleKeys());
    titleSettingsEl.innerHTML = Object.entries(TITLE_META).map(([key, meta]) => `
      <article class="title-option${equipped.has(key) ? " active" : ""}" data-rarity="${meta.rarity || 1}">
        <strong>${meta.label}</strong>
        <span class="title-option-meta">${titleRarityLabel(key)}</span>
        <small>${unlocked.has(key) || !meta.hidden ? meta.desc : SECRET_TITLE_ERROR_TEXT}</small>
        <small>${unlocked.has(key) || !meta.hidden ? meta.effect : SECRET_TITLE_LOCKED_EFFECT_TEXT}</small>
        <span class="title-option-meta">${titleUnlockText(meta)}</span>
        <button class="btn btn-outline game-btn" type="button" data-title-key="${key}" ${unlocked.has(key) ? "" : "disabled"}>${equipped.has(key) ? "Unequip" : "Equip"}</button>
      </article>
    `).join("");
    updateTitleStatus(`Equipped ${currentTitleKeys().length}/3 · ${currentTitleLabel()} · ${currentTitleEffectText()}`);
  }

  function applyKeybindLabels() {
    bjScreen.querySelectorAll("[data-keybind]").forEach((btn) => {
      if (btn.hasAttribute("data-bj-action")) {
        const action = btn.getAttribute("data-bj-action");
        if (action === "hit") {
          btn.setAttribute("data-keybind", formatKeybind(customKeybinds.hit));
        } else if (action === "stand") {
          btn.setAttribute("data-keybind", formatKeybind(customKeybinds.stand));
        } else if (action === "double") {
          btn.setAttribute("data-keybind", formatKeybind(customKeybinds.double));
        } else if (action === "split") {
          btn.setAttribute("data-keybind", formatKeybind(customKeybinds.split));
        }
      } else if (btn.id === "bjMapBtn") {
        btn.setAttribute("data-keybind", formatKeybind(customKeybinds.map));
      } else if (btn.id === "bjStartNextTableBtn") {
        btn.setAttribute("data-keybind", formatKeybind(customKeybinds.hit));
      } else if (btn.id === "bjConfirmRouteBtn") {
        btn.setAttribute("data-keybind", formatKeybind(["enter"]));
      } else if (btn.id === "bjCloseMapBtn") {
        btn.setAttribute("data-keybind", formatKeybind(["esc"]));
      }
      const chip = btn.querySelector(".keybind-chip");
      if (chip) {
        chip.textContent = btn.getAttribute("data-keybind");
      }
    });
  }

  function loadBlackjackProgress() {
    try {
      const raw = window.localStorage.getItem(BLACKJACK_PROGRESS_KEY);
      if (!raw) {
        return defaultBlackjackProgress();
      }
      const parsed = JSON.parse(raw);
      const equippedTitles = Array.isArray(parsed.equippedTitles)
        ? parsed.equippedTitles.filter((key) => TITLE_META[key])
        : TITLE_META[parsed.selectedTitle]
          ? [parsed.selectedTitle]
          : [];
      return normalizeBlackjackZeroStart({
        accountId: typeof parsed.accountId === "string" ? parsed.accountId : DEV_ACCOUNT_ID,
        accountLabel: typeof parsed.accountLabel === "string" ? parsed.accountLabel : DEV_ACCOUNT_LABEL,
        accountRole: typeof parsed.accountRole === "string" ? parsed.accountRole : "dev",
        accountProtected: parsed.accountProtected !== false,
        devToolsUnlocked: parsed.devToolsUnlocked !== false,
        totalBossesDefeated: Math.max(0, Number(parsed.totalBossesDefeated) || 0),
        highestMapReached: Math.max(0, Math.min(5, Number(parsed.highestMapReached) || 0)),
        worldOneClears: Math.max(0, Number(parsed.worldOneClears) || 0),
        vaultsOpened: Math.max(0, Number(parsed.vaultsOpened) || 0),
        forgesUsed: Math.max(0, Number(parsed.forgesUsed) || 0),
        blackjacksWon: Math.max(0, Number(parsed.blackjacksWon) || 0),
        skillTrialsCleared: Math.max(0, Number(parsed.skillTrialsCleared) || 0),
        runsCompleted: Math.max(0, Number(parsed.runsCompleted) || 0),
        curseXpEarned: Math.max(0, Number(parsed.curseXpEarned) || 0),
        rareTitleMarks: sanitizeRareTitleMarks(parsed.rareTitleMarks),
        rareTitleStreaks: sanitizeRareTitleStreaks(parsed.rareTitleStreaks),
        equippedCurses: configuredCurseKeys(parsed),
        equippedTitles: [...new Set(equippedTitles.slice(0, 3))],
        recentRuns: sanitizeRecentRuns(parsed.recentRuns)
      });
    } catch {
      return defaultBlackjackProgress();
    }
  }

  function saveBlackjackProgress() {
    try {
      window.localStorage.setItem(BLACKJACK_PROGRESS_KEY, JSON.stringify(blackjackProgress));
    } catch {}
  }

  function updateBlackjackProgress(patch = {}) {
    blackjackProgress = {
      ...blackjackProgress,
      ...patch
    };
    blackjackProgress.accountId = typeof blackjackProgress.accountId === "string" ? blackjackProgress.accountId : DEV_ACCOUNT_ID;
    blackjackProgress.accountLabel = typeof blackjackProgress.accountLabel === "string" ? blackjackProgress.accountLabel : DEV_ACCOUNT_LABEL;
    blackjackProgress.accountRole = typeof blackjackProgress.accountRole === "string" ? blackjackProgress.accountRole : "dev";
    blackjackProgress.accountProtected = blackjackProgress.accountProtected !== false;
    blackjackProgress.devToolsUnlocked = blackjackProgress.devToolsUnlocked !== false;
    blackjackProgress.totalBossesDefeated = Math.max(0, blackjackProgress.totalBossesDefeated || 0);
    blackjackProgress.highestMapReached = Math.max(0, Math.min(5, blackjackProgress.highestMapReached || 0));
    blackjackProgress.worldOneClears = Math.max(0, blackjackProgress.worldOneClears || 0);
    blackjackProgress.vaultsOpened = Math.max(0, blackjackProgress.vaultsOpened || 0);
    blackjackProgress.forgesUsed = Math.max(0, blackjackProgress.forgesUsed || 0);
    blackjackProgress.blackjacksWon = Math.max(0, blackjackProgress.blackjacksWon || 0);
    blackjackProgress.skillTrialsCleared = Math.max(0, blackjackProgress.skillTrialsCleared || 0);
    blackjackProgress.runsCompleted = Math.max(0, blackjackProgress.runsCompleted || 0);
    blackjackProgress.curseXpEarned = Math.max(0, blackjackProgress.curseXpEarned || 0);
    blackjackProgress.rareTitleMarks = sanitizeRareTitleMarks(blackjackProgress.rareTitleMarks);
    blackjackProgress.rareTitleStreaks = sanitizeRareTitleStreaks(blackjackProgress.rareTitleStreaks);
    blackjackProgress.recentRuns = sanitizeRecentRuns(blackjackProgress.recentRuns);
    blackjackProgress.equippedCurses = configuredCurseKeys(blackjackProgress);
    blackjackProgress.equippedTitles = Array.isArray(blackjackProgress.equippedTitles)
      ? [...new Set(blackjackProgress.equippedTitles.filter((key) => TITLE_META[key]).slice(0, 3))]
      : [];
    blackjackProgress = normalizeBlackjackZeroStart(blackjackProgress);
    saveBlackjackProgress();
    renderHomeScreen();
  }

  function pushRecentRunLog(summary, detail, options = {}) {
    const nextLog = {
      summary: summary || "Run recorded",
      detail: detail || "",
      map: currentWorldMapNumber,
      cash: runCash,
      lives: runLives
    };
    const bonusXp = Math.max(0, Number(options.bonusXp) || 0);
    updateBlackjackProgress({
      runsCompleted: blackjackProgress.runsCompleted + 1,
      curseXpEarned: blackjackProgress.curseXpEarned + bonusXp,
      recentRuns: sanitizeRecentRuns([nextLog, ...(blackjackProgress.recentRuns || [])])
    });
  }

  function unlockedTitleKeys() {
    return Object.keys(TITLE_META).filter((key) => TITLE_META[key].unlock(blackjackProgress));
  }

  function currentTitleKeys() {
    const unlocked = new Set(unlockedTitleKeys());
    const keys = (blackjackProgress.equippedTitles || []).filter((key) => unlocked.has(key));
    return keys.slice(0, 3);
  }

  function currentTitleMetas() {
    return currentTitleKeys().map((key) => TITLE_META[key]).filter(Boolean);
  }

  function currentTitleLabel() {
    return currentTitleMetas().map((meta) => meta.label).join(", ") || "No titles equipped";
  }

  function currentTitleRarityLabel() {
    const highest = currentTitleMetas().reduce((best, meta) => Math.max(best, meta?.rarity || 1), 1);
    return itemRankLabel(highest);
  }

  function currentTitleEffectText() {
    return currentTitleMetas().map((meta) => meta.effect).join(" | ") || "No deck effect.";
  }

  function currentConfiguredCurseKeys(progress = blackjackProgress) {
    return configuredCurseKeys(progress);
  }

  function activeRunCurseKeys() {
    return sanitizeCurseKeys(activeRunCurses);
  }

  function hasRunCurse(key) {
    return activeRunCurseKeys().includes(key);
  }

  function currentRunCurseXpBonus() {
    return curseXpBonusPercent(activeRunCurseKeys());
  }

  function currentRunCurseLabel() {
    const keys = activeRunCurseKeys();
    return keys.length ? `${keys.length} curse${keys.length === 1 ? "" : "s"} (+${currentRunCurseXpBonus()}% XP)` : "No curses";
  }

  function runCurseStartCashPenalty() {
    return hasRunCurse("ragged-purse") ? 160 : 0;
  }

  function runCurseStartLifePenalty() {
    return hasRunCurse("soul-leak") ? 2 : 0;
  }

  function runCurseShopPriceMultiplier() {
    return hasRunCurse("crooked-shops") ? 1.35 : 1;
  }

  function runCurseEnemyIntelligenceBonus() {
    return hasRunCurse("loaded-house") ? 5 : 0;
  }

  function runCurseStakeMultiplier() {
    return hasRunCurse("blood-stakes") ? 1.25 : 1;
  }

  function runCursePayoutMultiplier() {
    return hasRunCurse("collectors-tithe") ? 0.88 : 1;
  }

  function applyRunCurseDeckEffects(targetDeck) {
    if (!hasRunCurse("withered-shoe")) {
      return;
    }
    removeDeckRank(targetDeck, "A", 1);
    const tenRanks = ["10", "J", "Q", "K"];
    for (let i = 0; i < 2; i += 1) {
      const rank = tenRanks[i % tenRanks.length];
      removeDeckRank(targetDeck, rank, 1);
    }
  }

  function buildRunCurseXpAward({ failed = false, worldCleared = false } = {}) {
    const curseKeys = activeRunCurseKeys();
    if (!curseKeys.length) {
      return { total: 0, percent: 0 };
    }
    let base = 24 + (currentWorldMapNumber * 14) + (bossesDefeatedThisRun * 22) + (runRareTracker.skillTrialsCleared * 18);
    if (worldCleared) {
      base += 120;
    }
    if (failed) {
      base = Math.max(12, Math.round(base * 0.65));
    }
    const percent = currentRunCurseXpBonus();
    return {
      total: Math.max(curseKeys.length * 10, Math.round(base * (percent / 100))),
      percent
    };
  }

  function currentUnlockedRankCap() {
    const level = blackjackProgressLevel(blackjackProgress);
    if (level >= 10) {
      return 3;
    }
    if (level >= 4) {
      return 2;
    }
    return 1;
  }

  function currentCardShopOfferCount() {
    const level = blackjackProgressLevel(blackjackProgress);
    return 4 + (level >= 20 ? 1 : 0) + (level >= 57 ? 1 : 0);
  }

  function currentSupportShopOfferCount() {
    const level = blackjackProgressLevel(blackjackProgress);
    return 4 + (level >= 26 ? 1 : 0) + (level >= 70 ? 1 : 0);
  }

  function currentCampRecoveryAmount() {
    const level = blackjackProgressLevel(blackjackProgress);
    return 1 + (level >= 36 ? 1 : 0) + (level >= 65 ? 1 : 0);
  }

  function deepCloneData(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function stableSerialize(value) {
    if (Array.isArray(value)) {
      return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
    }
    if (value && typeof value === "object") {
      const entries = Object.keys(value)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`);
      return `{${entries.join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function encodedSaveCode(payload) {
    const json = stableSerialize(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return `${BLACKJACK_SAVE_CODE_PREFIX}-${encoded}`;
  }

  function decodeSaveCode(saveCode) {
    const normalized = String(saveCode || "").trim().replace(/\s+/g, "");
    if (!normalized.startsWith(`${BLACKJACK_SAVE_CODE_PREFIX}-`)) {
      throw new Error("Save code prefix is invalid.");
    }
    const payload = normalized.slice(BLACKJACK_SAVE_CODE_PREFIX.length + 1);
    const json = decodeURIComponent(escape(atob(payload)));
    return migrateBlackjackSavePayload(JSON.parse(json));
  }

  function currentEncounterRuleKey() {
    return currentEncounterRule?.key || "";
  }

  function resolveEncounterRuleByKey(key) {
    if (!key) {
      return null;
    }
    return [...ENCOUNTER_RULES.elite, ...ENCOUNTER_RULES.boss].find((rule) => rule.key === key) || null;
  }

  function buildBlackjackRunSnapshot() {
    return {
      originalMode,
      countHelperVisible,
      showLongRunInfo,
      runCash,
      runLives,
      runFailed,
      runFailReason,
      currentMaxTotal,
      tablesPlayed,
      waitingForShopChoice,
      firstShopShown,
      waitingForMapChoice,
      nextDealerChoiceKey,
      offeredRoutes: deepCloneData(offeredRoutes),
      currentMapNodeId,
      pendingMapNodeId,
      completedMapNodeIds: [...completedMapNodeIds],
      mapPreviewOpen,
      mapNodes: deepCloneData(mapNodes),
      mapEdges: deepCloneData(mapEdges),
      currentSpecialNodeType,
      pendingVaultCredit,
      skillTrialActive,
      skillTrialRewardPending,
      currentTrialType,
      skillTrialFailed,
      currentShopOffers: deepCloneData(currentShopOffers),
      shopOffersDirty,
      freeOfferClaimed,
      deck: deepCloneData(deck),
      dealerHand: deepCloneData(dealerHand),
      dealerHandsPool: deepCloneData(dealerHandsPool),
      playerHand: deepCloneData(playerHand),
      dealerHoleHidden,
      roundOver,
      firstMove,
      betMultiplier,
      roundCount,
      winStreak,
      jackpotRoundArmed,
      jackpotRoundActive,
      playerAnimateIndex,
      dealerAnimateIndex,
      animateAllDeal,
      lastChipCount,
      tableActive,
      activeHandIndex,
      tableBetLocked,
      tableNet,
      tableDealerName,
      tableDealerProfile,
      tableHands: deepCloneData(tableHands),
      runningCount,
      dealerHoleCounted,
      activeTools: deepCloneData(activeTools),
      passiveState: deepCloneData(passiveState),
      cardTraining: deepCloneData(cardTraining),
      megaStackUnlocked,
      cardFusion: deepCloneData(cardFusion),
      forgeMode,
      forgeTargetCardKey,
      forgeFusionSecondCardKey,
      forgeActionSpent,
      activeRunCurses: deepCloneData(activeRunCurses),
      runRareTracker: deepCloneData(runRareTracker),
      identityUpgrades: deepCloneData(identityUpgrades),
      ownedShopCardCounts: deepCloneData(ownedShopCardCounts),
      ownedPassiveCounts: deepCloneData(ownedPassiveCounts),
      adviceIndex,
      combatLog: deepCloneData(combatLog),
      currentEncounterRuleKey: currentEncounterRuleKey(),
      currentEncounterCleared,
      currentNormalMonster: deepCloneData(currentNormalMonster),
      dealerSignatureCardsRemaining,
      dealerEliteSignatureQueue: deepCloneData(dealerEliteSignatureQueue),
      dealerBossSignatureQueue: deepCloneData(dealerBossSignatureQueue),
      currentBossNodeId,
      currentBossRoundsCleared,
      currentBossSplitCullRound,
      currentEliteNodeId,
      currentEliteRoundsPlayed,
      bossesDefeatedThisRun,
      worldOneMiddleBossOrder: deepCloneData(worldOneMiddleBossOrder),
      currentWorldMapNumber,
      enemyIntelligencePoints,
      earnedMaxBonusNodeIds: [...earnedMaxBonusNodeIds]
    };
  }

  function buildBlackjackSavePayload(options = {}) {
    const includeSavedAt = options.includeSavedAt !== false;
    const payload = {
      version: CURRENT_BLACKJACK_SAVE_VERSION,
      progress: deepCloneData(blackjackProgress),
      run: buildBlackjackRunSnapshot()
    };
    if (includeSavedAt) {
      payload.savedAt = Date.now();
    }
    return payload;
  }

  function sanitizeCountMap(source, allowedKeys) {
    const safe = {};
    const set = new Set(allowedKeys);
    Object.entries(source || {}).forEach(([key, value]) => {
      if (!set.has(key)) {
        return;
      }
      const count = Math.max(0, Number(value) || 0);
      if (count > 0) {
        safe[key] = count;
      }
    });
    return safe;
  }

  function sanitizeBooleanMap(source, defaults) {
    return Object.keys(defaults).reduce((acc, key) => {
      acc[key] = !!(source && source[key]);
      return acc;
    }, {});
  }

  function sanitizeCardList(cards) {
    if (!Array.isArray(cards)) {
      return [];
    }
    return cards
      .map((card) => ({ ...card }))
      .filter((card) => card && typeof card === "object");
  }

  function sanitizeHandList(hands) {
    if (!Array.isArray(hands)) {
      return [];
    }
    return hands
      .map((hand) => ({
        ...hand,
        cards: sanitizeCardList(hand?.cards),
        shopState: hand?.shopState && typeof hand.shopState === "object" ? { ...hand.shopState } : undefined
      }))
      .filter((hand) => hand && typeof hand === "object");
  }

  function sanitizeShopOffers(offers) {
    return {
      free: offers?.free && typeof offers.free === "object" ? { ...offers.free } : null,
      cards: Array.isArray(offers?.cards) ? offers.cards.filter(Boolean).map((offer) => ({ ...offer })) : [],
      others: Array.isArray(offers?.others) ? offers.others.filter(Boolean).map((offer) => ({ ...offer })) : []
    };
  }

  function sanitizeMapNodeIds(ids) {
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string" && id) : ["s1_1"];
  }

  function migrateBlackjackSavePayload(payload) {
    const parsed = payload && typeof payload === "object" ? payload : {};
    const version = Math.max(1, Number(parsed.version) || 1);
    const progress = {
      ...defaultBlackjackProgress(),
      ...(parsed.progress || {})
    };
    const run = parsed.run && typeof parsed.run === "object" ? { ...parsed.run } : {};
    const migrated = {
      version: CURRENT_BLACKJACK_SAVE_VERSION,
      savedAt: Number(parsed.savedAt) || Date.now(),
      progress: normalizeBlackjackZeroStart({
        accountId: typeof progress.accountId === "string" ? progress.accountId : DEV_ACCOUNT_ID,
        accountLabel: typeof progress.accountLabel === "string" ? progress.accountLabel : DEV_ACCOUNT_LABEL,
        accountRole: typeof progress.accountRole === "string" ? progress.accountRole : "dev",
        accountProtected: progress.accountProtected !== false,
        devToolsUnlocked: progress.devToolsUnlocked !== false,
        totalBossesDefeated: Math.max(0, Number(progress.totalBossesDefeated) || 0),
        highestMapReached: Math.max(0, Math.min(5, Number(progress.highestMapReached) || 0)),
        worldOneClears: Math.max(0, Number(progress.worldOneClears) || 0),
        vaultsOpened: Math.max(0, Number(progress.vaultsOpened) || 0),
        forgesUsed: Math.max(0, Number(progress.forgesUsed) || 0),
        blackjacksWon: Math.max(0, Number(progress.blackjacksWon) || 0),
        skillTrialsCleared: Math.max(0, Number(progress.skillTrialsCleared) || 0),
        runsCompleted: Math.max(0, Number(progress.runsCompleted) || 0),
        curseXpEarned: Math.max(0, Number(progress.curseXpEarned) || 0),
        rareTitleMarks: sanitizeRareTitleMarks(progress.rareTitleMarks),
        rareTitleStreaks: sanitizeRareTitleStreaks(progress.rareTitleStreaks),
        recentRuns: sanitizeRecentRuns(progress.recentRuns),
        equippedCurses: configuredCurseKeys(progress),
        equippedTitles: Array.isArray(progress.equippedTitles)
          ? [...new Set(progress.equippedTitles.filter((key) => TITLE_META[key]).slice(0, 3))]
          : TITLE_META[progress.selectedTitle]
            ? [progress.selectedTitle]
            : []
      }),
      run: {
        ...run,
        completedMapNodeIds: sanitizeMapNodeIds(run.completedMapNodeIds),
        offeredRoutes: Array.isArray(run.offeredRoutes) ? run.offeredRoutes.filter(Boolean).map((entry) => ({ ...entry })) : [],
        currentShopOffers: sanitizeShopOffers(run.currentShopOffers),
        deck: sanitizeCardList(run.deck),
        dealerHand: sanitizeCardList(run.dealerHand),
        dealerHandsPool: Array.isArray(run.dealerHandsPool) ? run.dealerHandsPool.map((hand) => sanitizeCardList(hand)) : [],
        playerHand: sanitizeCardList(run.playerHand),
        tableHands: sanitizeHandList(run.tableHands),
        activeTools: sanitizeCountMap(run.activeTools, ["rigged-shuffle", "dealer-distract", "chip-shield", "lucky-draw"]),
        passiveState: {
          "deck-polish-used": Math.max(0, Number(run.passiveState?.["deck-polish-used"]) || 0),
          "sharp-eye-used": Math.max(0, Number(run.passiveState?.["sharp-eye-used"]) || 0),
          "steel-nerves-used": !!run.passiveState?.["steel-nerves-used"],
          "smoke-mirror-used": Math.max(0, Number(run.passiveState?.["smoke-mirror-used"]) || 0),
          "split-fund-used": Math.max(0, Number(run.passiveState?.["split-fund-used"]) || 0),
          "grit-teeth-used": Math.max(0, Number(run.passiveState?.["grit-teeth-used"]) || 0)
        },
        cardTraining: sanitizeCountMap(run.cardTraining, Object.keys(SHOP_CARDS)),
        forgeMode: run.forgeMode === "fusion" ? "fusion" : "training",
        forgeTargetCardKey: SHOP_CARDS[run.forgeTargetCardKey] ? run.forgeTargetCardKey : "",
        forgeFusionSecondCardKey: SHOP_CARDS[run.forgeFusionSecondCardKey] ? run.forgeFusionSecondCardKey : "",
        forgeActionSpent: !!run.forgeActionSpent,
        activeRunCurses: sanitizeCurseKeys(run.activeRunCurses),
        runRareTracker: sanitizeRunRareTracker(run.runRareTracker),
        cardFusion: sanitizeBooleanMap(run.cardFusion, Object.fromEntries(Object.keys(SHOP_CARDS).map((key) => [key, false]))),
        identityUpgrades: sanitizeBooleanMap(run.identityUpgrades, {
          "wild-card": false,
          "golden-ace": false,
          "peek-card": false,
          "pressure-card": false
        }),
        ownedShopCardCounts: sanitizeCountMap(run.ownedShopCardCounts, Object.keys(SHOP_CARDS)),
        ownedPassiveCounts: sanitizeCountMap(run.ownedPassiveCounts, Object.keys(PASSIVE_UPGRADES)),
        currentEncounterRuleKey: typeof run.currentEncounterRuleKey === "string" ? run.currentEncounterRuleKey : "",
        dealerEliteSignatureQueue: Array.isArray(run.dealerEliteSignatureQueue) ? run.dealerEliteSignatureQueue.filter((key) => typeof key === "string") : [],
        dealerBossSignatureQueue: Array.isArray(run.dealerBossSignatureQueue) ? run.dealerBossSignatureQueue.filter((key) => typeof key === "string") : [],
        worldOneMiddleBossOrder: Array.isArray(run.worldOneMiddleBossOrder) ? run.worldOneMiddleBossOrder.filter((key) => typeof key === "string") : [],
        earnedMaxBonusNodeIds: sanitizeMapNodeIds(run.earnedMaxBonusNodeIds),
        mapNodes: run.mapNodes && typeof run.mapNodes === "object" ? deepCloneData(run.mapNodes) : {},
        mapEdges: Array.isArray(run.mapEdges) ? deepCloneData(run.mapEdges) : []
      }
    };
    if (version < 2) {
      migrated.run.saveMigrated = true;
    }
    return migrated;
  }

  function persistBlackjackRunSave() {
    try {
      window.localStorage.setItem(BLACKJACK_RUN_SAVE_KEY, JSON.stringify(buildBlackjackSavePayload()));
    } catch {}
  }

  function scheduleBlackjackRunSave() {
    if (savePersistTimer) {
      window.clearTimeout(savePersistTimer);
    }
    savePersistTimer = window.setTimeout(() => {
      persistBlackjackRunSave();
      savePersistTimer = null;
    }, 120);
  }

  function saveBlackjackCheckpoint() {
    scheduleBlackjackRunSave();
  }

  function updateSaveCodeStatus(message = "") {
    if (saveCodeStatusEl) {
      saveCodeStatusEl.textContent = message || "Create a save code to move this run to another device, or paste one here to load it.";
    }
  }

  function setSaveCodePanelOpen(show) {
    saveCodePanelOpen = !!show;
    if (saveCodePanelEl) {
      saveCodePanelEl.classList.toggle("hidden", !saveCodePanelOpen);
    }
    if (!saveCodePanelOpen && saveCodeInputEl) {
      saveCodeInputEl.value = "";
      updateSaveCodeStatus();
    }
  }

  function updateRunDevToolsStatus(message = "Dev-only run tools appear here on the protected developer account.") {
    if (runDevToolsStatusEl) {
      runDevToolsStatusEl.textContent = message;
    }
  }

  function renderRunDevTools() {
    if (!runDevToolsCardEl) {
      return;
    }
    const show = !!blackjackProgress?.devToolsUnlocked;
    runDevToolsCardEl.classList.toggle("hidden", !show);
    if (!show) {
      return;
    }
    updateRunDevToolsStatus(`Dev tools ready. Cash ${fmtMoney(runCash)} · Lives ${runLives} · Map ${currentWorldMapNumber}/5.`);
  }

  function syncRunDevToolChange(message, statusMessage = message, tableMessage = "Developer tool applied") {
    renderRunInfo();
    renderHomeScreen();
    renderTitleSettings();
    renderRouteChoices();
    updateShopUI();
    updateMapPopupUI();
    renderTable();
    renderHandBoard();
    updateTableStatus(tableMessage);
    updateActionButtons();
    updateAbilityStatus();
    updateStreakStatus();
    updateRunDevToolsStatus(message);
    setStatus(statusMessage);
    saveBlackjackCheckpoint();
  }

  function devAddCash(amount = 1000) {
    if (!blackjackProgress?.devToolsUnlocked) {
      return;
    }
    runCash += amount;
    syncRunDevToolChange(`Added ${fmtMoney(amount)} to the run.`, `Dev tool: added ${fmtMoney(amount)} cash.`, "Developer cash injected");
  }

  function devAddLives(amount = 3) {
    if (!blackjackProgress?.devToolsUnlocked) {
      return;
    }
    runLives += amount;
    syncRunDevToolChange(`Added ${amount} lives to the run.`, `Dev tool: added ${amount} lives.`, "Developer lives injected");
  }

  function devOpenNodeShop(nodeType, label) {
    if (!blackjackProgress?.devToolsUnlocked || runFailed) {
      return;
    }
    if (tableActive && !roundOver) {
      updateRunDevToolsStatus(`Finish the current table before forcing ${label.toLowerCase()}.`);
      setStatus(`Dev tool blocked: finish the current table before opening ${label.toLowerCase()}.`);
      return;
    }
    waitingForMapChoice = false;
    waitingForShopChoice = true;
    pendingMapNodeId = null;
    offeredRoutes = [];
    currentSpecialNodeType = nodeType;
    shopOffersDirty = true;
    syncRunDevToolChange(`${label} forced open for testing.`, `Dev tool: ${label.toLowerCase()} opened.`, `${label} opened`);
  }

  function devTriggerVault() {
    if (!blackjackProgress?.devToolsUnlocked || runFailed) {
      return;
    }
    if (tableActive && !roundOver) {
      updateRunDevToolsStatus("Finish the current table before triggering a vault event.");
      setStatus("Dev tool blocked: finish the current table before triggering a vault.");
      return;
    }
    resolveVaultNode();
    updateRunDevToolsStatus("Vault event triggered for testing.");
    saveBlackjackCheckpoint();
  }

  function devGrantTestLoadout() {
    if (!blackjackProgress?.devToolsUnlocked) {
      return;
    }
    [
      ["mirror-card", 2],
      ["jackpot-card", 1],
      ["marked-card", 1],
      ["golden-chip-card", 1],
      ["chain-card", 1],
      ["guardian-card", 1]
    ].forEach(([key, count]) => {
      if (!SHOP_CARDS[key]) {
        return;
      }
      addOwnedCardCopies(key, count);
    });
    [
      ["table-reputation", 2],
      ["dealer-tell", 1],
      ["split-fund", 1],
      ["chip-stash", 1]
    ].forEach(([key, count]) => {
      if (!PASSIVE_UPGRADES[key]) {
        return;
      }
      addOwnedPassiveCopies(key, count);
    });
    activeTools["rigged-shuffle"] += 1;
    activeTools["chip-shield"] += 1;
    syncRunDevToolChange("Test loadout granted: cards, passives, and a couple of tools were added.", "Dev tool: test loadout granted.", "Developer loadout injected");
  }

  function syncBlackjackUIAfterRestore(skipStatus = false) {
    if (showKeybindsCheck) {
      showKeybindsCheck.checked = !!showKeybindsCheck.checked;
    }
    updateCountHelperUI();
    addKeybindChips();
    renderTitleSettings();
    renderRouteChoices();
    updateMapPopupUI();
    updateShopUI();
    renderRunInfo();
    renderTable();
    renderHandBoard();
    renderHomeScreen();
    renderRunDevTools();
    updateTableStatus("Autosave restored");
    updateActionButtons();
    updateAbilityStatus();
    updateLossOverlay();
    updateStreakStatus();
    updateAdviceText(false);
    if (!skipStatus && statusEl && !statusEl.textContent) {
      statusEl.textContent = "Save restored.";
    }
  }

  function applyBlackjackSavePayload(payload, skipStatus = false) {
    const safePayload = migrateBlackjackSavePayload(payload);
    const run = safePayload?.run;
    if (!run) {
      throw new Error("Save payload is missing run data.");
    }
    blackjackProgress = {
      ...defaultBlackjackProgress(),
      ...(safePayload.progress || {})
    };
    saveBlackjackProgress();
    originalMode = !!run.originalMode;
    countHelperVisible = !!run.countHelperVisible;
    showLongRunInfo = !!run.showLongRunInfo;
    runCash = Number(run.runCash) || RUN_STARTING_CASH;
    runLives = Number(run.runLives) || RUN_STARTING_LIVES;
    runFailed = !!run.runFailed;
    runFailReason = run.runFailReason || "";
    currentMaxTotal = Number(run.currentMaxTotal) || BASE_MAX_TOTAL;
    tablesPlayed = Number(run.tablesPlayed) || 0;
    waitingForShopChoice = !!run.waitingForShopChoice;
    firstShopShown = !!run.firstShopShown;
    waitingForMapChoice = !!run.waitingForMapChoice;
    nextDealerChoiceKey = run.nextDealerChoiceKey || null;
    offeredRoutes = deepCloneData(run.offeredRoutes) || [];
    currentMapNodeId = run.currentMapNodeId || "s1_1";
    pendingMapNodeId = run.pendingMapNodeId || null;
    completedMapNodeIds = Array.isArray(run.completedMapNodeIds) ? [...run.completedMapNodeIds] : ["s1_1"];
    mapPreviewOpen = !!run.mapPreviewOpen;
    mapNodes = deepCloneData(run.mapNodes) || {};
    mapEdges = deepCloneData(run.mapEdges) || [];
    currentSpecialNodeType = run.currentSpecialNodeType || "";
    pendingVaultCredit = Number(run.pendingVaultCredit) || 0;
    skillTrialActive = !!run.skillTrialActive;
    skillTrialRewardPending = !!run.skillTrialRewardPending;
    currentTrialType = run.currentTrialType || "";
    skillTrialFailed = !!run.skillTrialFailed;
    currentShopOffers = sanitizeShopOffers(run.currentShopOffers);
    shopOffersDirty = !!run.shopOffersDirty;
    freeOfferClaimed = !!run.freeOfferClaimed;
    deck = sanitizeCardList(run.deck);
    dealerHand = sanitizeCardList(run.dealerHand);
    dealerHandsPool = Array.isArray(run.dealerHandsPool) ? run.dealerHandsPool.map((hand) => sanitizeCardList(hand)) : [];
    playerHand = sanitizeCardList(run.playerHand);
    dealerHoleHidden = !!run.dealerHoleHidden;
    roundOver = !!run.roundOver;
    firstMove = !!run.firstMove;
    betMultiplier = Number(run.betMultiplier) || 1;
    roundCount = Number(run.roundCount) || 0;
    winStreak = Number(run.winStreak) || 0;
    jackpotRoundArmed = !!run.jackpotRoundArmed;
    jackpotRoundActive = !!run.jackpotRoundActive;
    playerAnimateIndex = Number.isFinite(run.playerAnimateIndex) ? run.playerAnimateIndex : -1;
    dealerAnimateIndex = Number.isFinite(run.dealerAnimateIndex) ? run.dealerAnimateIndex : -1;
    animateAllDeal = !!run.animateAllDeal;
    lastChipCount = Number(run.lastChipCount) || 0;
    tableActive = !!run.tableActive;
    activeHandIndex = Number(run.activeHandIndex) || 0;
    tableBetLocked = Number(run.tableBetLocked) || 100;
    tableNet = Number(run.tableNet) || 0;
    tableDealerName = run.tableDealerName || "Crimson Dealer";
    tableDealerProfile = run.tableDealerProfile || "aggressive";
    tableHands = sanitizeHandList(run.tableHands);
    runningCount = Number(run.runningCount) || 0;
    dealerHoleCounted = !!run.dealerHoleCounted;
    activeTools = { "rigged-shuffle": 0, "dealer-distract": 0, "chip-shield": 0, "lucky-draw": 0, ...(run.activeTools || {}) };
    passiveState = { "deck-polish-used": 0, "sharp-eye-used": 0, "steel-nerves-used": false, "smoke-mirror-used": 0, "split-fund-used": 0, "grit-teeth-used": 0, ...(run.passiveState || {}) };
    cardTraining = run.cardTraining || {};
    megaStackUnlocked = !!run.megaStackUnlocked;
    cardFusion = run.cardFusion || {};
    forgeMode = run.forgeMode === "fusion" ? "fusion" : "training";
    forgeTargetCardKey = SHOP_CARDS[run.forgeTargetCardKey] ? run.forgeTargetCardKey : "";
    forgeFusionSecondCardKey = SHOP_CARDS[run.forgeFusionSecondCardKey] ? run.forgeFusionSecondCardKey : "";
    forgeActionSpent = !!run.forgeActionSpent;
    activeRunCurses = sanitizeCurseKeys(run.activeRunCurses);
    runRareTracker = sanitizeRunRareTracker(run.runRareTracker);
    identityUpgrades = { "wild-card": false, "golden-ace": false, "peek-card": false, "pressure-card": false, ...(run.identityUpgrades || {}) };
    ownedShopCardCounts = run.ownedShopCardCounts || {};
    ownedPassiveCounts = run.ownedPassiveCounts || {};
    ownedShopCards = new Set(Object.keys(ownedShopCardCounts).filter((key) => (ownedShopCardCounts[key] || 0) > 0));
    adviceIndex = Number(run.adviceIndex) || 0;
    combatLog = deepCloneData(run.combatLog) || [];
    runInfoPanelEl?.classList.toggle("show-long", showLongRunInfo);
    currentEncounterRule = resolveEncounterRuleByKey(run.currentEncounterRuleKey);
    currentEncounterCleared = !!run.currentEncounterCleared;
    currentNormalMonster = deepCloneData(run.currentNormalMonster) || null;
    dealerSignatureCardsRemaining = Number(run.dealerSignatureCardsRemaining) || 0;
    dealerEliteSignatureQueue = Array.isArray(run.dealerEliteSignatureQueue) ? [...run.dealerEliteSignatureQueue] : [];
    dealerBossSignatureQueue = Array.isArray(run.dealerBossSignatureQueue) ? [...run.dealerBossSignatureQueue] : [];
    currentBossNodeId = run.currentBossNodeId || null;
    currentBossRoundsCleared = Number(run.currentBossRoundsCleared) || 0;
    currentBossSplitCullRound = Number(run.currentBossSplitCullRound) || 0;
    currentEliteNodeId = run.currentEliteNodeId || null;
    currentEliteRoundsPlayed = Number(run.currentEliteRoundsPlayed) || 0;
    bossesDefeatedThisRun = Number(run.bossesDefeatedThisRun) || 0;
    worldOneMiddleBossOrder = Array.isArray(run.worldOneMiddleBossOrder) && run.worldOneMiddleBossOrder.length
      ? [...run.worldOneMiddleBossOrder]
      : shuffleList(["jack-of-lies", "mammon", "mortis", "lilith"]).slice(0, 3);
    currentWorldMapNumber = Number(run.currentWorldMapNumber) || 1;
    enemyIntelligencePoints = Number(run.enemyIntelligencePoints) || 0;
    earnedMaxBonusNodeIds = new Set(Array.isArray(run.earnedMaxBonusNodeIds) ? run.earnedMaxBonusNodeIds : []);
    if (choicePopupEl) {
      choicePopupEl.classList.add("hidden");
    }
    if (choiceOptionsEl) {
      choiceOptionsEl.innerHTML = "";
    }
    choiceResolver = null;
    syncBlackjackUIAfterRestore(skipStatus);
    if (run.saveMigrated) {
      updateSaveCodeStatus("Old save format converted to the current version.");
    }
    saveBlackjackCheckpoint();
  }

  function restoredRunLooksBroken() {
    const badEconomy = !Number.isFinite(runCash) || !Number.isFinite(runLives) || runCash < 0 || runLives < 0;
    const impossibleAliveState = !runFailed && runLives <= 0;
    const missingHandRow = !Array.isArray(tableHands) || tableHands.length !== TABLE_HANDS;
    const brokenHands = Array.isArray(tableHands) && tableHands.length > 0
      && tableHands.every((hand) => !Array.isArray(hand.cards) || hand.cards.length === 0);
    const brokenDealer = !Array.isArray(dealerHand) || dealerHand.length < 2;
    const brokenActiveHand = (tableActive || !roundOver) && (!Array.isArray(playerHand) || playerHand.length === 0);
    const missingDeck = !Array.isArray(deck) || deck.length === 0;
    return badEconomy
      || impossibleAliveState
      || missingHandRow
      || brokenActiveHand
      || (brokenHands && brokenDealer)
      || (brokenHands && missingDeck)
      || (brokenHands && !roundOver);
  }

  function liveTableLooksBroken() {
    const noPlayerCards = !Array.isArray(tableHands)
      || tableHands.length !== TABLE_HANDS
      || tableHands.every((hand) => !Array.isArray(hand.cards) || hand.cards.length === 0);
    const noDealerCards = !Array.isArray(dealerHand) || dealerHand.length < 2;
    const noActiveHand = (tableActive || !roundOver) && (!Array.isArray(playerHand) || playerHand.length === 0);
    const invalidEconomy = !Number.isFinite(runCash) || !Number.isFinite(runLives) || runCash < 0 || runLives < 0;
    return invalidEconomy || (runFailed ? runLives < 0 : runLives <= 0) || noPlayerCards || noDealerCards || noActiveHand;
  }

  function restoreBlackjackRunSave() {
    try {
      const raw = window.localStorage.getItem(BLACKJACK_RUN_SAVE_KEY);
      if (!raw) {
        return false;
      }
      const payload = migrateBlackjackSavePayload(JSON.parse(raw));
      applyBlackjackSavePayload(payload, true);
      if (restoredRunLooksBroken()) {
        try {
          window.localStorage.removeItem(BLACKJACK_RUN_SAVE_KEY);
        } catch {}
        return false;
      }
      setStatus("Autosave restored.");
      return true;
    } catch {
      return false;
    }
  }

  const tableEvents = [
    "double-table",
    "dealer-rage",
    "lucky-table",
    "tax-table"
  ];

  const dealerProfiles = [
    { key: "classic", name: "Classic Dealer", hitUntil: 17, behavior: "normal blackjack dealer rules" },
    { key: "safe", name: "Safe Dealer", hitUntil: 16, behavior: "stands at 16" },
    { key: "aggressive", name: "Aggressive Dealer", hitUntil: 19, behavior: "hits until 19" },
    { key: "lucky", name: "Lucky Dealer", hitUntil: 17, behavior: "higher blackjack chance" },
    { key: "chaotic", name: "Chaotic Dealer", hitUntil: 17, behavior: "random card swaps" }
  ];

  const TABLE_ADVICE_LINES = [
    "Split hands keep their first move, so a fresh pair can split again and can still double down.",
    "Camp is for shopping only. Card Forge is where Training and Card Fusion happen.",
    "Card Forge upgrades identity cards best. Wild Card, Golden Ace, Peek Card, and Pressure Card all have special upgrades.",
    "Risk Table adds power and a curse together. Take it when your deck can absorb the downside.",
    "Casino Vault buys tempo with money, but deck damage can make later tables worse.",
    "Dealer target tracks the current cap. Higher limits help both sides, so route choice still matters.",
    "Table Reputation cuts prices, so it becomes stronger the earlier you buy it.",
    "Use Delay Card or Guardian Card to survive risky lines, especially after a double down or split.",
    "Lives and cash are separate. Rich runs can still die if too many tables go badly.",
    "Normal encounters can be lost and still move the run forward, but lives are your real mistake buffer now.",
    "Elite nodes last two rounds. Losing costs a life, but it does not trap the whole run on that node.",
    "Boss nodes last three rounds and must actually be cleared. Losing a boss round costs a life and replays that round.",
    "Card Counter is strongest early because deck information matters more over many future hands.",
    "Deck Polish and Thin Deck keep bad draws from piling up over a long run.",
    "Sharp Eye and Lucky Draw are choice effects. They get better when your deck quality is already high.",
    "Iron Pressure is stronger than normal Pressure when the dealer is sitting on a weak total.",
    "Deep Peek is a planning card. It is best when you can still change the hand afterward.",
    "Perfect Wild is more about control than raw power. Use it to hit the cap cleanly.",
    "Eternal Ace lets you push totals higher without normal ace risk.",
    "Royal Card is not just a stat card. It changes how much a winning hand is worth.",
    "Double Draw and Fate Card are stronger in hands where one extra bad draw would ruin the line.",
    "Vault money can save a run now while making the next few tables harder.",
    "Skill Trial rewards are strongest when the deck already has room for one special payoff card.",
    "Burn Card and Heavy Card are deck taxes. If too many pile up, the run starts fighting itself.",
    "Mirror Curse punishes high-card strategies by turning your own strength against you.",
    "Cold Dealer pressure is subtle. Small dealer changes become large over many hands.",
    "High Roller scales with streaking. It is best in runs that already win cleanly.",
    "Casino Credit helps tables start safely, but it does not solve a weak deck forever.",
    "If a forge choice does not improve a card you actually use often, it is usually the wrong forge choice.",
    "Card Fusion consumes two different normal cards to create one stronger fused card. Use it when two middling cards can become one real payoff.",
    "The rising cap helps both sides. It is not free player power.",
    "A safe deck with card removal often outlasts a greedier deck with too many risky rewards.",
    "Boss rules matter as much as deck strength. Read the encounter before forcing the same line.",
    "World 1 is a five-map climb: tutorial boss first, three middle bosses in shuffled order, then the world boss.",
    "Lord Asmodeus is meant to teach patterns. If Map 1 feels chaotic, slow down and read the boss rules before forcing doubles.",
    "Jack of Lies and Mammon punish sloppy economy lines in different ways, while Mortis and Lilith pressure survival from different angles.",
    "Belial rewards flexible decks more than one-trick all-in decks.",
    "Boss clears give exclusive rewards now. Sometimes surviving to the boss reward matters more than one extra shop buy.",
    "Free table entry means cash is for shop power and extra actions now. Double and Split are the real bankroll commitments.",
    "Late-map shops scale much harder than early ones. Cheap early value usually beats waiting for one perfect late buy.",
    "If a run keeps losing lives on normals, the deck is behind even if cash still looks healthy.",
    "World 1 lives reset after the world, so spending life to finish a map can be correct if it secures the clear.",
    "Weak runs need consistency first. Strong runs can start chasing boss-exclusive rewards and forge upgrades."
  ];

  function ownedBaseShopCardKeys() {
    return [...new Set([
      ...Array.from(shopCardChecks)
      .filter((cb) => cb.checked)
      .map((cb) => cb.getAttribute("data-shop-card"))
      .filter((key) => SHOP_CARDS[key]),
      ...Array.from(ownedShopCards).filter((key) => (ownedShopCardCounts[key] || 0) > 0)
    ])];
  }

  function effectiveOwnedCardKey(baseKey) {
    if (baseKey === "wild-card" && identityUpgrades["wild-card"]) return "perfect-wild";
    if (baseKey === "golden-ace" && identityUpgrades["golden-ace"]) return "eternal-ace";
    if (baseKey === "peek-card" && identityUpgrades["peek-card"]) return "deep-peek";
    if (baseKey === "pressure-card" && identityUpgrades["pressure-card"]) return "iron-pressure";
    return baseKey;
  }

  function selectedShopCardKeys() {
    return ownedBaseShopCardKeys().map((key) => effectiveOwnedCardKey(key));
  }

  function selectedBaseShopCardKeys() {
    return Array.from(shopCardChecks)
      .filter((cb) => cb.checked)
      .map((cb) => cb.getAttribute("data-shop-card"))
      .filter((key) => SHOP_CARDS[key]);
  }

  function weightedSelectedShopCardKeys() {
    const weighted = [];
    ownedBaseShopCardKeys().forEach((baseKey) => {
      const effectiveKey = effectiveOwnedCardKey(baseKey);
      const count = Math.max(1, ownedShopCardCounts[baseKey] || 1);
      for (let i = 0; i < count; i += 1) {
        weighted.push(effectiveKey);
      }
    });
    return weighted;
  }

  function selectedShopCardCount() {
    return selectedShopCardKeys().length;
  }

  function forgeTrainingEligible(baseKey) {
    if (!SHOP_CARDS[baseKey]) {
      return false;
    }
    if (FUSION_OUTPUT_KEYS.includes(baseKey)) {
      return false;
    }
    if (baseKey === "wild-card" && identityUpgrades["wild-card"]) return false;
    if (baseKey === "golden-ace" && identityUpgrades["golden-ace"]) return false;
    if (baseKey === "peek-card" && identityUpgrades["peek-card"]) return false;
    if (baseKey === "pressure-card" && identityUpgrades["pressure-card"]) return false;
    return true;
  }

  function syncForgeTargetSelection() {
    const owned = Object.keys(ownedShopCardCounts).filter((key) => (ownedShopCardCounts[key] || 0) > 0 && SHOP_CARDS[key]);
    if (!owned.length) {
      forgeTargetCardKey = "";
      forgeFusionSecondCardKey = "";
      return;
    }
    if (forgeTargetCardKey && owned.includes(forgeTargetCardKey)) {
      if (!forgeFusionSecondCardKey || owned.includes(forgeFusionSecondCardKey)) {
        return;
      }
    }
    const selected = selectedBaseShopCardKeys().find((key) => owned.includes(key));
    forgeTargetCardKey = selected
      || owned.filter((key) => forgeTrainingEligible(key)).sort((a, b) => (cardTraining[a] || 0) - (cardTraining[b] || 0))[0]
      || owned[0];
    if (forgeFusionSecondCardKey && !owned.includes(forgeFusionSecondCardKey)) {
      forgeFusionSecondCardKey = "";
    }
  }

  function toggleForgeFusionTarget(key) {
    if (!key) {
      return;
    }
    if (forgeTargetCardKey === key) {
      forgeTargetCardKey = forgeFusionSecondCardKey;
      forgeFusionSecondCardKey = "";
      return;
    }
    if (forgeFusionSecondCardKey === key) {
      forgeFusionSecondCardKey = "";
      return;
    }
    if (!forgeTargetCardKey) {
      forgeTargetCardKey = key;
      return;
    }
    if (!forgeFusionSecondCardKey) {
      forgeFusionSecondCardKey = key;
      return;
    }
    forgeFusionSecondCardKey = key;
  }

  function renderForgePanel() {
    if (!campUpgradePanelEl || currentSpecialNodeType !== "forge") {
      return;
    }
    syncForgeTargetSelection();
    const ownedEntries = Object.entries(ownedShopCardCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => (SHOP_CARDS[a[0]]?.label || a[0]).localeCompare(SHOP_CARDS[b[0]]?.label || b[0]));

    if (trainingBtn) {
      trainingBtn.setAttribute("aria-pressed", forgeMode === "training" ? "true" : "false");
      trainingBtn.disabled = forgeActionSpent;
    }
    if (fusionBtn) {
      fusionBtn.setAttribute("aria-pressed", forgeMode === "fusion" ? "true" : "false");
      fusionBtn.disabled = forgeActionSpent;
    }
    if (forgeTargetListEl) {
      forgeTargetListEl.innerHTML = ownedEntries.length
        ? ownedEntries.map(([baseKey, count]) => {
            const effectiveKey = effectiveOwnedCardKey(baseKey);
            const effectiveMeta = SHOP_CARDS[effectiveKey] || SHOP_CARDS[baseKey];
            const notes = [];
            if (effectiveKey !== baseKey) {
              notes.push(`Ascended into ${effectiveMeta?.label || effectiveKey}`);
            }
            if ((cardTraining[baseKey] || 0) > 0) {
              notes.push(`Training +${cardTraining[baseKey]}`);
            }
            if (baseKey === "stack-card" && megaStackUnlocked) {
              notes.push("Mega Stack active");
            }
            if (forgeMode === "fusion" && forgeTargetCardKey === baseKey) {
              notes.unshift("Material A");
            }
            if (forgeMode === "fusion" && forgeFusionSecondCardKey === baseKey) {
              notes.unshift("Material B");
            }
            if (forgeMode === "training" && !forgeTrainingEligible(baseKey)) {
              notes.push("Training maxed");
            }
            if (forgeMode === "fusion" && !forgeFusionEligible(baseKey)) {
              notes.push("Fusion blocked");
            }
            return `
              <button
                class="forge-target-btn${forgeTargetCardKey === baseKey ? " is-selected" : ""}${forgeFusionSecondCardKey === baseKey ? " is-selected-secondary" : ""}"
                type="button"
                data-forge-target-key="${baseKey}"
                ${forgeActionSpent ? "disabled" : ""}
              >
                <strong>${escapeHtml(effectiveMeta?.label || baseKey)} x${count}</strong>
                <span>${escapeHtml(itemRankLabel(cardRank(effectiveKey)))}</span>
                <small>${escapeHtml(notes.join(" · ") || cardShortText(baseKey, count))}</small>
              </button>
            `;
          }).join("")
        : '<p class="run-info-empty">No forge targets owned yet.</p>';
    }

    let actionHint = "Select a forge target, then commit one action.";
    let applyLabel = forgeMode === "fusion" ? "Apply Card Fusion" : "Apply Training";
    let canApply = !forgeActionSpent;
    if (forgeMode === "fusion") {
      if (!forgeTargetCardKey) {
        actionHint = "Select the first card for fusion.";
        canApply = false;
      } else if (!forgeFusionSecondCardKey) {
        actionHint = `First material: ${SHOP_CARDS[forgeTargetCardKey]?.label || forgeTargetCardKey}. Select a second different card.`;
        canApply = false;
      } else if (forgeTargetCardKey === forgeFusionSecondCardKey) {
        actionHint = "Card Fusion needs two different cards.";
        canApply = false;
      } else if (!forgeFusionEligible(forgeTargetCardKey) || !forgeFusionEligible(forgeFusionSecondCardKey)) {
        actionHint = "One of those cards cannot be fused. Pick another pair.";
        canApply = false;
      } else {
        const resultKey = resolveFusionOutputKey(forgeTargetCardKey, forgeFusionSecondCardKey);
        actionHint = forgeFusionDetail(forgeTargetCardKey, forgeFusionSecondCardKey);
        applyLabel = resultKey ? `Fuse into ${fusionOutputLabel(resultKey)}` : "Apply Card Fusion";
        canApply = !!resultKey;
      }
    } else if (!forgeTargetCardKey) {
      actionHint = "Select a target card for training.";
      canApply = false;
    } else if (!forgeTrainingEligible(forgeTargetCardKey)) {
      actionHint = `${SHOP_CARDS[effectiveOwnedCardKey(forgeTargetCardKey)]?.label || SHOP_CARDS[forgeTargetCardKey]?.label || forgeTargetCardKey} is already at its forged form. Pick another card.`;
      canApply = false;
    } else {
      actionHint = forgeTrainingDetail(forgeTargetCardKey);
    }
    if (forgeActionSpent) {
      actionHint = "Forge action locked in. Press Done to continue.";
      canApply = false;
    }
    if (forgeActionHintEl) {
      forgeActionHintEl.textContent = actionHint;
    }
    if (forgeApplyBtn) {
      forgeApplyBtn.textContent = applyLabel;
      forgeApplyBtn.disabled = !canApply;
    }
  }

  function selectedPassiveKeys() {
    const keys = [];
    const checkboxKeys = Array.from(passiveChecks)
      .filter((cb) => cb.checked)
      .map((cb) => cb.getAttribute("data-passive-upgrade"));
    const all = new Set([...checkboxKeys, ...Object.keys(ownedPassiveCounts)]);
    all.forEach((key) => {
      const count = Math.max(checkboxKeys.includes(key) ? 1 : 0, ownedPassiveCounts[key] || 0);
      for (let i = 0; i < count; i += 1) {
        keys.push(key);
      }
    });
    return keys;
  }

  function hasPassive(key) {
    return passiveCount(key) > 0;
  }

  function passiveCount(key) {
    return Math.max(0, selectedPassiveKeys().filter((entry) => entry === key).length);
  }

  function selectedTacticalKeys() {
    return Array.from(tacticalItemChecks)
      .filter((cb) => cb.checked)
      .map((cb) => cb.getAttribute("data-tactical-item"));
  }

  function shuffleList(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildOffer(kind, key) {
    const meta = kind === "card"
      ? SHOP_CARDS[key]
      : kind === "passive"
        ? PASSIVE_UPGRADES[key]
        : TACTICAL_ITEMS[key];
    return meta ? { kind, key, ...meta } : null;
  }

  function shopPriceMultiplier() {
    if (originalMode) {
      return 1;
    }
    const mapFactor = Math.max(0, currentWorldMapNumber - 1) * 0.8;
    const tableFactor = Math.min(0.9, Math.floor(tablesPlayed / 4) * 0.16);
    return (0.95 + mapFactor + tableFactor) * runCurseShopPriceMultiplier();
  }

  function baseTableStakeForCurrentMap() {
    const stakes = [100, 115, 130, 150, 175];
    return Math.round(stakes[Math.max(0, Math.min(stakes.length - 1, currentWorldMapNumber - 1))] * runCurseStakeMultiplier());
  }

  function offerPrice(offer) {
    if (!offer) {
      return 0;
    }
    let base = 0;
    if (offer.kind === "card") {
      const type = SHOP_CARDS[offer.key]?.type || "utility";
      base = type === "risk" ? 58 : type === "risk-reward" ? 72 : 66;
    } else if (offer.kind === "passive") {
      base = 96;
    } else {
      base = 46;
    }
    base = Math.round(base * shopPriceMultiplier());
    if (hasPassive("table-reputation")) {
      const discount = Math.min(0.45, 0.12 * passiveCount("table-reputation"));
      base = Math.round(base * (1 - discount));
    }
    return base;
  }

  function offerClaimed(offer) {
    if (!offer) {
      return false;
    }
    if (offer.kind === "card") {
      const maxCopies = SHOP_CARDS[offer.key]?.maxCopies;
      return Number.isFinite(maxCopies) && (ownedShopCardCounts[offer.key] || 0) >= maxCopies;
    }
    if (offer.kind === "passive") {
      const maxCopies = PASSIVE_UPGRADES[offer.key]?.maxCopies;
      return Number.isFinite(maxCopies) && passiveCount(offer.key) >= maxCopies;
    }
    return selectedTacticalKeys().includes(offer.key);
  }

  function canOfferCard(key) {
    const meta = SHOP_CARDS[key];
    if (!meta || !cardIsUnlocked(key)) {
      return false;
    }
    const maxCopies = meta.maxCopies;
    if (Number.isFinite(maxCopies) && (ownedShopCardCounts[key] || 0) >= maxCopies) {
      return false;
    }
    return true;
  }

  function forgeFusionEligible(baseKey) {
    if (!SHOP_CARDS[baseKey]) {
      return false;
    }
    if (SHOP_CARDS[baseKey].type === "legendary" || FUSION_OUTPUT_KEYS.includes(baseKey)) {
      return false;
    }
    if ((cardTraining[baseKey] || 0) > 0) {
      return false;
    }
    if (baseKey === "wild-card" && identityUpgrades["wild-card"]) return false;
    if (baseKey === "golden-ace" && identityUpgrades["golden-ace"]) return false;
    if (baseKey === "peek-card" && identityUpgrades["peek-card"]) return false;
    if (baseKey === "pressure-card" && identityUpgrades["pressure-card"]) return false;
    if (baseKey === "stack-card") {
      return !megaStackUnlocked;
    }
    return true;
  }

  function fusionPairKey(a, b) {
    return [a, b].sort().join("::");
  }

  function resolveFusionOutputKey(firstKey, secondKey) {
    if (!firstKey || !secondKey || firstKey === secondKey) {
      return "";
    }
    const direct = FUSION_RECIPE_OVERRIDES[fusionPairKey(firstKey, secondKey)];
    if (direct) {
      return direct;
    }
    const firstType = SHOP_CARDS[firstKey]?.type;
    const secondType = SHOP_CARDS[secondKey]?.type;
    if (!firstType || !secondType) {
      return "";
    }
    return FUSION_TYPE_OUTPUTS[fusionPairKey(firstType, secondType)] || "";
  }

  function fusionOutputLabel(key) {
    return SHOP_CARDS[key]?.label || key;
  }

  function forgeFusionDetail(firstKey, secondKey = forgeFusionSecondCardKey) {
    if (!firstKey) {
      return "Select the first card for fusion.";
    }
    if (!secondKey) {
      return `First material: ${SHOP_CARDS[firstKey]?.label || firstKey}. Select a second different card.`;
    }
    if (firstKey === secondKey) {
      return "Card Fusion needs two different cards.";
    }
    const resultKey = resolveFusionOutputKey(firstKey, secondKey);
    if (!resultKey) {
      return "Those two cards cannot form a fusion result.";
    }
    return `${SHOP_CARDS[firstKey]?.label || firstKey} + ${SHOP_CARDS[secondKey]?.label || secondKey} -> ${fusionOutputLabel(resultKey)}. ${SHOP_CARDS[resultKey]?.desc || ""}`;
  }

  function forgeTrainingDetail(baseKey) {
    if (!baseKey || !SHOP_CARDS[baseKey]) {
      return "Select a target card for training.";
    }
    const current = cardTraining[baseKey] || 0;
    const next = current + 2;
    if (baseKey === "wild-card") return "Training will turn Wild Card into Perfect Wild.";
    if (baseKey === "golden-ace") return "Training will turn Golden Ace into Eternal Ace.";
    if (baseKey === "peek-card") return "Training will turn Peek Card into Deep Peek.";
    if (baseKey === "pressure-card") return "Training will turn Pressure Card into Iron Pressure.";
    if (baseKey === "blood-card") return `Training ${current} -> ${next}. Win/loss swing becomes $${50 + (next * 10)}.`;
    if (baseKey === "loaded-card") return `Training ${current} -> ${next}. Next draw bonus becomes +${2 + Math.floor(next / 2)}.`;
    if (baseKey === "jackpot-card") return `Training ${current} -> ${next}. Winning on 21 becomes +$${100 + (next * 25)}.`;
    if (baseKey === "marked-card") return `Training ${current} -> ${next}. Reveal bonus rises to +$${next * 5}.`;
    if (baseKey === "golden-chip-card") return `Training ${current} -> ${next}. Win bonus becomes +$${25 + (next * 10)}.`;
    if (baseKey === "tax-eater") return `Training ${current} -> ${next}. Tax relief stays active and win bonus rises to +$${next * 5}.`;
    if (baseKey === "ace-anchor") return `Training ${current} -> ${next}. Ace-hand loss reduction becomes $${20 + (next * 5)}.`;
    if (baseKey === "grim-chip") return `Training ${current} -> ${next}. Win bonus becomes +$${35 + (next * 10)}.`;
    if (baseKey === "dealer-trap") return `Training ${current} -> ${next}. Dealer bust payout becomes +$${25 + (next * 10)}.`;
    if (baseKey === "finisher-card") return `Training ${current} -> ${next}. Winning on 20 or 21 becomes +$${45 + (next * 10)}.`;
    if (baseKey === "control-card") return `Training ${current} -> ${next}. Control range becomes ${2 + Math.floor(next / 2)}.`;
    if (baseKey === "debt-card") return `Training ${current} -> ${next}. Extra debt penalty shrinks to $${Math.max(10, 50 - (next * 5))}.`;
    if (baseKey === "stack-card") return `Training ${current} -> ${next}. Each Stack Card gains +2 more training-scaled value.`;
    return `Training ${current} -> ${next}. ${SHOP_CARDS[baseKey].label} scales harder this run.`;
  }

  function canOfferPassive(key) {
    const meta = PASSIVE_UPGRADES[key];
    if (!meta || !passiveIsUnlocked(key)) {
      return false;
    }
    const maxCopies = meta.maxCopies;
    if (Number.isFinite(maxCopies) && passiveCount(key) >= maxCopies) {
      return false;
    }
    return true;
  }

  function generateShopOffers() {
    currentShopOffers.cards = shuffleList(SHOP_STORE_CARD_KEYS.filter((key) => canOfferCard(key)))
      .slice(0, currentCardShopOfferCount())
      .map((key) => buildOffer("card", key));
    const oneCopyCardOfferKeys = new Set(
      currentShopOffers.cards
        .filter((offer) => offer?.kind === "card" && Number.isFinite(SHOP_CARDS[offer.key]?.maxCopies))
        .map((offer) => offer.key)
    );
    const supportPool = [
      ...Object.keys(PASSIVE_UPGRADES).filter((key) => canOfferPassive(key)).map((key) => buildOffer("passive", key)),
      ...Object.keys(TACTICAL_ITEMS).map((key) => buildOffer("tactical", key))
    ];
    currentShopOffers.others = shuffleList(supportPool).slice(0, currentSupportShopOfferCount());
    const oneCopyPassiveOfferKeys = new Set(
      currentShopOffers.others
        .filter((offer) => offer?.kind === "passive" && Number.isFinite(PASSIVE_UPGRADES[offer.key]?.maxCopies))
        .map((offer) => offer.key)
    );
    const freePool = shuffleList([
      ...SHOP_STORE_CARD_KEYS
        .filter((key) => canOfferCard(key) && !oneCopyCardOfferKeys.has(key))
        .map((key) => buildOffer("card", key)),
      ...Object.keys(PASSIVE_UPGRADES)
        .filter((key) => canOfferPassive(key) && !oneCopyPassiveOfferKeys.has(key))
        .map((key) => buildOffer("passive", key)),
      ...Object.keys(TACTICAL_ITEMS).map((key) => buildOffer("tactical", key))
    ].filter(Boolean));
    currentShopOffers.free = freePool[0] || null;
    shopOffersDirty = false;
    freeOfferClaimed = false;
  }

  function renderOfferButton(offer, isFree = false) {
    if (!offer) {
      return '<span class="route-option-empty">No offer.</span>';
    }
    const claimed = offerClaimed(offer) || (isFree && freeOfferClaimed);
    const price = isFree ? 0 : offerPrice(offer);
    const affordable = isFree || runCash >= price;
    const action = claimed ? "Owned" : (isFree ? "Free" : affordable ? `Buy ${fmtMoney(price)}` : `Need ${fmtMoney(price)}`);
    const rank = offer.kind === "card"
      ? itemRankLabel(cardRank(offer.key))
      : offer.kind === "passive"
        ? itemRankLabel(passiveRank(offer.key))
        : "Tool";
    return `
      <button class="market-offer${isFree ? " free-offer" : ""}${claimed ? " claimed" : ""}" type="button" data-offer-kind="${offer.kind}" data-offer-key="${offer.key}" data-offer-free="${isFree ? "true" : "false"}" ${claimed || !affordable ? "disabled" : ""}>
        <strong>${offer.label}</strong>
        <small>${rank}</small>
        <small>${offer.desc}</small>
        <small>${action}</small>
      </button>
    `;
  }

  function renderShopOffers() {
    if (freeOfferEl) {
      freeOfferEl.innerHTML = renderOfferButton(currentShopOffers.free, true);
    }
    if (cardOfferGridEl) {
      cardOfferGridEl.innerHTML = currentShopOffers.cards.map((offer) => renderOfferButton(offer)).join("");
    }
    if (otherOfferGridEl) {
      otherOfferGridEl.innerHTML = currentShopOffers.others.map((offer) => renderOfferButton(offer)).join("");
    }
  }

  function createDefaultHandState() {
    return {
      stackPairsUsed: 0,
      loadedBonusPending: 0,
      controlPending: false,
      controlRange: 2,
      choiceDraws: 0,
      steadyHandUsed: false,
      delayCharges: 0,
      delayUsed: false,
      secondBreathCharges: 0,
      secondBreathUsed: false,
      extraWinBonus: 0,
      twentyOneWinBonus: 0,
      extraLossPenalty: 0,
      flatLossReduction: 0,
      winPayoutBonus: 0,
      taxRelief: false,
      aceAnchor: false,
      dealerTrapBonus: 0,
      finisherBonus: 0,
      pressureStand: false,
      dealerBait: false,
      dealerFreezeCharges: 0,
      comboKeys: {},
      comboLabels: [],
      eliteAbilityUsed: false,
      bossAbilityUsed: false
    };
  }

  function ensureHandState(hand) {
    if (!hand.shopState) {
      hand.shopState = createDefaultHandState();
    }
    return hand.shopState;
  }

  function activeHandState() {
    const hand = tableHands[activeHandIndex];
    return hand ? ensureHandState(hand) : createDefaultHandState();
  }

  function updateShopUI() {
    if (!deckUpgradeEl || !deckStatusEl || !startNextTableBtn) {
      return;
    }
    const showModal = !originalMode && waitingForShopChoice;
    if (showModal && shopOffersDirty) {
      generateShopOffers();
    }
    deckUpgradeEl.classList.toggle("hidden", !showModal);
    startNextTableBtn.disabled = !showModal;
    const campNode = currentSpecialNodeType === "camp";
    const forgeNode = currentSpecialNodeType === "forge";
    if (campUpgradePanelEl) {
      campUpgradePanelEl.classList.toggle("hidden", !showModal || !forgeNode);
    }
    if (shopMarketEl) {
      shopMarketEl.classList.toggle("hidden", showModal && forgeNode);
    }
    if (deckUpgradeTitleEl) {
      deckUpgradeTitleEl.textContent = forgeNode ? "Card Forge" : "Card Shop";
    }
    if (campUpgradeStatusEl) {
      campUpgradeStatusEl.textContent = forgeNode
        ? (forgeActionSpent
          ? "Forge spent. Review the result, then press Done to continue."
          : "Training upgrades one owned card. Card Fusion consumes two different normal cards to create one stronger result.")
        : "Card Forge upgrades selected run cards.";
    }
    if (!showModal) {
      updateAdviceText(false);
      return;
    }
    if (!forgeNode) {
      renderShopOffers();
    }
    const priceNote = hasPassive("table-reputation")
      ? " Table Reputation active: shop prices discounted."
      : "";
    const progressNote = ` Unlocks: ${itemRankLabel(currentUnlockedRankCap())} open. House level: ${blackjackProgressLevel(blackjackProgress)}. Meta bosses: ${blackjackProgress.totalBossesDefeated}.`;
    if (forgeNode) {
      renderForgePanel();
      deckStatusEl.textContent = `Cash: ${fmtMoney(runCash)}. Lives: ${runLives}. Card Forge only. ${forgeActionSpent ? "Forge action locked in." : "Training uses one target. Fusion uses two different cards."} Cards owned: ${selectedShopCardCount()}.${progressNote}`;
      updateAdviceText(false);
      renderRunInfo();
      return;
    }
    const campNote = campNode ? " Camp is shop-only." : "";
    deckStatusEl.textContent = waitingForMapChoice
      ? `Cash: ${fmtMoney(runCash)}. Lives: ${runLives}. Choose cards and tools, then close the shop and pick your next route. Cards: ${selectedShopCardCount()}. Passives: ${selectedPassiveKeys().length}. Tools queued: ${selectedTacticalKeys().length}.${priceNote}${campNote}${progressNote}`
      : `Cash: ${fmtMoney(runCash)}. Lives: ${runLives}. Choose cards and tools. Cards: ${selectedShopCardCount()}. Passives: ${selectedPassiveKeys().length}. Tools queued: ${selectedTacticalKeys().length}.${priceNote}${campNote}${progressNote}`;
    updateAdviceText(false);
    renderRunInfo();
  }

  function chooseControlledDelta(baseTotal, cardValue, range = 2) {
    const plus = cardValue + range;
    const minus = Math.max(1, cardValue - range);
    const plusTotal = baseTotal + plus;
    const minusTotal = baseTotal + minus;
    if (plusTotal <= currentBustLimit()) {
      return 2;
    }
    if (minusTotal <= currentBustLimit()) {
      return -2;
    }
    return plusTotal <= minusTotal ? 2 : -2;
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function cardShortText(key, count) {
    const card = SHOP_CARDS[key];
    if (!card) {
      return `owned x${count}`;
    }
    if (key === "stack-card" && megaStackUnlocked) {
      return `fusion active x ${count} · Mega Stack online`;
    }
    if (FUSION_OUTPUT_KEYS.includes(key)) {
      return `fusion result x${count} · value ${card.value}`;
    }
    const baseValue = key === "wild-card" || key === "perfect-wild" || key === "royal-wild" || key === "volatile-card"
      ? "flex"
      : String(card.value);
    return `value ${baseValue} x ${count}`;
  }

  function cardLongText(key, count) {
    const card = SHOP_CARDS[key];
    if (!card) {
      return "";
    }
    const trained = cardTraining[key] ? ` Trained bonus +${cardTraining[key]}.` : "";
    const typeText = card.type ? ` Type: ${card.type}.` : "";
    const creationText = key === "perfect-wild" || key === "eternal-ace" || key === "deep-peek" || key === "iron-pressure"
      ? " Created through training, so it sits above the normal shop ladder."
      : key === "stack-card" && megaStackUnlocked
        ? " Card Fusion is active, so Stack Card pairs become Mega Stack for 18 total."
        : FUSION_OUTPUT_KEYS.includes(key)
          ? ` Created through Card Fusion. ${card.desc || "It is stronger than the materials used to make it."}`
        : "";
    return `${card.label} owned ${count} time${count > 1 ? "s" : ""}.${typeText}${trained}${creationText}`;
  }

  function passiveCounts() {
    return selectedPassiveKeys().reduce((counts, key) => {
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }

  function renderRunInfo() {
    if (!ownedCardsListEl || !passiveListEl || !runInfoPanelEl) {
      return;
    }
    runInfoPanelEl.classList.toggle("show-long", showLongRunInfo);
    if (explainToggleBtn) {
      explainToggleBtn.textContent = showLongRunInfo ? "Short Explanations" : "Long Explanations";
    }

    const cardEntries = Object.entries(ownedShopCardCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => (SHOP_CARDS[a[0]]?.label || a[0]).localeCompare(SHOP_CARDS[b[0]]?.label || b[0]));
    ownedCardsListEl.innerHTML = cardEntries.length
      ? cardEntries.map(([key, count]) => `
          <article class="run-info-item">
            <strong>${escapeHtml(SHOP_CARDS[key]?.label || key)} x${count} · ${escapeHtml(itemRankLabel(cardRank(key)))}</strong>
            <p class="run-info-short">${escapeHtml(cardShortText(key, count))}</p>
            <p class="run-info-long">${escapeHtml(cardLongText(key, count))}</p>
          </article>
        `).join("")
      : '<p class="run-info-empty">No special cards owned yet.</p>';

    const passives = passiveCounts();
    const passiveEntries = Object.entries(passives)
      .sort((a, b) => (PASSIVE_UPGRADES[a[0]]?.label || a[0]).localeCompare(PASSIVE_UPGRADES[b[0]]?.label || b[0]));
    passiveListEl.innerHTML = passiveEntries.length
      ? passiveEntries.map(([key, count]) => {
          const meta = PASSIVE_SUMMARY_META[key];
          const passive = PASSIVE_UPGRADES[key];
          const shortText = meta ? meta.short(count) : `stack x${count}`;
          const longText = meta ? meta.long(count) : (passive?.desc || "");
          return `
            <article class="run-info-item">
              <strong>${escapeHtml(passive?.label || key)} x${count} · ${escapeHtml(itemRankLabel(passiveRank(key)))}</strong>
              <p class="run-info-short">${escapeHtml(shortText)}</p>
              <p class="run-info-long">${escapeHtml(longText)}</p>
            </article>
          `;
        }).join("")
      : '<p class="run-info-empty">No passives active yet.</p>';
  }

  function exportBlackjackSaveCode() {
    const code = encodedSaveCode(buildBlackjackSavePayload({ includeSavedAt: false }));
    setSaveCodePanelOpen(true);
    if (saveCodeInputEl) {
      saveCodeInputEl.value = code;
      saveCodeInputEl.focus();
      saveCodeInputEl.select();
    }
    updateSaveCodeStatus("Save code generated. Copy it to move this run and progression to another device.");
    saveBlackjackCheckpoint();
    return code;
  }

  async function copyBlackjackSaveCode() {
    const code = saveCodeInputEl?.value?.trim() || exportBlackjackSaveCode();
    try {
      await navigator.clipboard.writeText(code);
      updateSaveCodeStatus("Save code copied.");
    } catch {
      if (saveCodeInputEl) {
        saveCodeInputEl.focus();
        saveCodeInputEl.select();
      }
      updateSaveCodeStatus("Copy failed here. The code is selected so you can copy it manually.");
    }
  }

  function importBlackjackSaveCode() {
    const code = saveCodeInputEl?.value?.trim();
    if (!code) {
      updateSaveCodeStatus("Paste a Death Blackjack save code first.");
      return;
    }
    try {
      const payload = decodeSaveCode(code);
      applyBlackjackSavePayload(payload, true);
      setSaveCodePanelOpen(false);
      saveBlackjackCheckpoint();
      setStatus("Save code imported.");
    } catch (error) {
      updateSaveCodeStatus(error?.message || "That save code could not be loaded.");
    }
  }

  function deleteBlackjackSaveData() {
    if (blackjackProgress.accountProtected) {
      const label = blackjackProgress.accountLabel || DEV_ACCOUNT_LABEL;
      const confirmedDevReset = window.confirm(`${label} is protected. Reset this account back to a clean dev baseline instead?`);
      if (!confirmedDevReset) {
        return;
      }
      try {
        window.localStorage.removeItem(BLACKJACK_PROGRESS_KEY);
        window.localStorage.removeItem(BLACKJACK_RUN_SAVE_KEY);
      } catch {}
      blackjackProgress = defaultBlackjackProgress();
      if (savePersistTimer) {
        window.clearTimeout(savePersistTimer);
        savePersistTimer = null;
      }
      setSaveCodePanelOpen(false);
      resetCurrentRun({ skipSave: true });
      saveBlackjackProgress();
      renderTitleSettings();
      renderHomeScreen();
      updateTitleStatus("Protected dev account reset to a fresh baseline.");
      updateSaveCodeStatus(`${label} was reset to a clean dev baseline. Dev tools stayed available.`);
      setStatus(`${label} was reset. Progress is back to zero, but dev access remains.`);
      renderHomeScreen();
      return;
    }
    const confirmed = window.confirm("Delete all Death Blackjack save data, including progression, autosave, and transfer-save state?");
    if (!confirmed) {
      return;
    }
    try {
      window.localStorage.removeItem(BLACKJACK_PROGRESS_KEY);
      window.localStorage.removeItem(BLACKJACK_RUN_SAVE_KEY);
      window.localStorage.removeItem(BLACKJACK_KEYBINDS_KEY);
    } catch {}
    blackjackProgress = defaultBlackjackProgress();
    customKeybinds = keybindsWithDefaults();
    waitingForKeybindAction = "";
    if (savePersistTimer) {
      window.clearTimeout(savePersistTimer);
      savePersistTimer = null;
    }
    setSaveCodePanelOpen(false);
    resetCurrentRun({ skipSave: true });
    renderTitleSettings();
    updateTitleStatus("Save data deleted. Titles reset to the default.");
    renderKeybindSettings();
    addKeybindChips();
    updateSaveCodeStatus("Save data deleted. New progress will only save after the next checkpoint.");
    setStatus("Death Blackjack save data deleted.");
  }

  function cloneCard(card) {
    return card ? { ...card } : card;
  }

  function tenValueRatio() {
    if (!deck.length) {
      return 0;
    }
    const count = deck.filter((card) => ["10", "J", "Q", "K"].includes(card.rank)).length;
    return Math.round((count / deck.length) * 100);
  }

  function updateDeckCounterInfo() {
    if (!countHelperPanelEl) {
      return;
    }
    const existing = countHelperPanelEl.querySelector(".deck-counter-extra");
    if (!hasPassive("card-counter")) {
      if (existing) {
        existing.remove();
      }
      return;
    }
    const text = `Deck: ${deck.length} cards. 10-value density: ${tenValueRatio()}%.`;
    if (existing) {
      existing.textContent = text;
      return;
    }
    const line = document.createElement("p");
    line.className = "note deck-counter-extra";
    line.textContent = text;
    countHelperPanelEl.appendChild(line);
  }

  function adviceLineForState() {
    if (runFailed) {
      return runLives <= 0
        ? "Run failed because your lives ran out. Table survival now matters separately from economy."
        : "Run failed means you could not pay the next table entry. Economy matters as much as card power.";
    }
    if (waitingForMapChoice) {
      return "Map choice decides more than the next fight. Camps, forge nodes, and risky routes shape the whole run.";
    }
    if (waitingForShopChoice && currentSpecialNodeType === "camp") {
      return "Camp is a recovery stop. Buy only what keeps the run stable for the next tables.";
    }
    if (waitingForShopChoice && currentSpecialNodeType === "forge") {
      return "Card Forge is for permanent upgrades only. Use it to sharpen cards you already rely on.";
    }
    if (skillTrialActive) {
      return "Skill Trial rewards rare cards, but forcing a greedy line can throw the whole run.";
    }
    return TABLE_ADVICE_LINES[adviceIndex % TABLE_ADVICE_LINES.length];
  }

  function updateAdviceText(forceAdvance = false) {
    if (!adviceTextEl) {
      return;
    }
    if (forceAdvance) {
      adviceIndex = (adviceIndex + 1) % TABLE_ADVICE_LINES.length;
    }
    const nextText = adviceLineForState();
    if (adviceTextEl.textContent === nextText) {
      return;
    }
    if (adviceSwapTimer) {
      window.clearTimeout(adviceSwapTimer);
    }
    adviceTextEl.classList.remove("tip-entered");
    void adviceTextEl.offsetWidth;
    adviceTextEl.classList.add("tip-switching");
    adviceSwapTimer = window.setTimeout(() => {
      adviceTextEl.textContent = nextText;
      adviceTextEl.classList.remove("tip-switching");
      adviceTextEl.classList.add("tip-entered");
    }, 130);
  }

  function startAdviceRotation() {
    if (!adviceTextEl || adviceTimer) {
      return;
    }
    updateAdviceText(false);
    adviceTimer = window.setInterval(() => {
      updateAdviceText(true);
    }, 7000);
  }

  function applyQueuedToolsFromShop() {
    selectedTacticalKeys().forEach((key) => {
      if (Object.hasOwn(activeTools, key)) {
        activeTools[key] += 1;
      }
    });
    tacticalItemChecks.forEach((cb) => {
      cb.checked = false;
    });
  }

  function chooseCardFromOptions(title, text, cards) {
    if (!choicePopupEl || !choiceTitleEl || !choiceTextEl || !choiceOptionsEl || !cards.length) {
      return Promise.resolve(cards[0]);
    }
    choiceTitleEl.textContent = title;
    choiceTextEl.textContent = text;
    choiceOptionsEl.innerHTML = cards.map((card, index) => {
      const value = cardPoints(card.rank, card);
      const shopNote = card.shopLabel ? ` - ${card.shopLabel}` : "";
      return `<button class="route-option" type="button" data-choice-index="${index}">${card.rank} of ${card.suit}${shopNote} (Value ${value})</button>`;
    }).join("");
    choicePopupEl.classList.remove("hidden");
    return new Promise((resolve) => {
      choiceResolver = { resolve, cards };
    });
  }

  function normalizeCard(card) {
    if (!card) {
      return card;
    }
    const copy = { ...card };
    delete copy.forcedShopKey;
    return copy;
  }

  function applyTrainingUpgrade(targetOverride = "") {
    if (forgeActionSpent) {
      setStatus("This forge stop is already spent. Press Done to continue.");
      return false;
    }
    const owned = ownedBaseShopCardKeys();
    const selected = selectedBaseShopCardKeys().filter((key) => owned.includes(key));
    if (!targetOverride && selected.length > 1) {
      setStatus("Training needs one selected card, not several.");
      return false;
    }
    const target = (targetOverride && owned.includes(targetOverride) ? targetOverride : "")
      || selected[0]
      || [...owned].sort((a, b) => (cardTraining[a] || 0) - (cardTraining[b] || 0))[0];
    if (!target) {
      setStatus("Training needs a selected shop card to upgrade.");
      return false;
    }
    if (target === "wild-card") {
      if (identityUpgrades["wild-card"]) {
        setStatus("Perfect Wild is already forged. Pick another card.");
        return false;
      }
      identityUpgrades["wild-card"] = true;
      forgeActionSpent = true;
      saveBlackjackCheckpoint();
      setStatus("Wild Card upgraded into Perfect Wild. Rank IV unlocked through training.");
      updateShopUI();
      renderRunInfo();
      return true;
    }
    if (target === "golden-ace") {
      if (identityUpgrades["golden-ace"]) {
        setStatus("Eternal Ace is already forged. Pick another card.");
        return false;
      }
      identityUpgrades["golden-ace"] = true;
      forgeActionSpent = true;
      saveBlackjackCheckpoint();
      setStatus("Golden Ace upgraded into Eternal Ace. Rank IV unlocked through training.");
      updateShopUI();
      renderRunInfo();
      return true;
    }
    if (target === "peek-card") {
      if (identityUpgrades["peek-card"]) {
        setStatus("Deep Peek is already forged. Pick another card.");
        return false;
      }
      identityUpgrades["peek-card"] = true;
      forgeActionSpent = true;
      saveBlackjackCheckpoint();
      setStatus("Peek Card upgraded into Deep Peek. Rank IV unlocked through training.");
      updateShopUI();
      renderRunInfo();
      return true;
    }
    if (target === "pressure-card") {
      if (identityUpgrades["pressure-card"]) {
        setStatus("Iron Pressure is already forged. Pick another card.");
        return false;
      }
      identityUpgrades["pressure-card"] = true;
      forgeActionSpent = true;
      saveBlackjackCheckpoint();
      setStatus("Pressure Card upgraded into Iron Pressure. Rank IV unlocked through training.");
      updateShopUI();
      renderRunInfo();
      return true;
    }
    cardTraining[target] = (cardTraining[target] || 0) + 2;
    forgeActionSpent = true;
    saveBlackjackCheckpoint();
    setStatus(`${SHOP_CARDS[target].label} trained. It now gets +${cardTraining[target]} total training this run.`);
    updateShopUI();
    renderRunInfo();
    return true;
  }

  function applyFusionUpgrade() {
    if (forgeActionSpent) {
      setStatus("This forge stop is already spent. Press Done to continue.");
      return false;
    }
    const first = forgeTargetCardKey;
    const second = forgeFusionSecondCardKey;
    if (!first || !second) {
      setStatus("Card Fusion needs two different owned cards selected.");
      return false;
    }
    if (first === second) {
      setStatus("Card Fusion needs two different cards.");
      return false;
    }
    if (!ownedShopCardCounts[first] || !ownedShopCardCounts[second]) {
      setStatus("One of the fusion materials is no longer owned.");
      return false;
    }
    if (!forgeFusionEligible(first) || !forgeFusionEligible(second)) {
      setStatus("One of those cards cannot be used for fusion.");
      return false;
    }
    const resultKey = resolveFusionOutputKey(first, second);
    if (!resultKey) {
      setStatus("Those two cards do not form a valid fusion.");
      return false;
    }
    removeOwnedCardCopies(first, 1);
    removeOwnedCardCopies(second, 1);
    addOwnedCardCopies(resultKey, 1);
    forgeActionSpent = true;
    forgeTargetCardKey = resultKey;
    forgeFusionSecondCardKey = "";
    saveBlackjackCheckpoint();
    setStatus(`Card Fusion complete. ${SHOP_CARDS[first].label} + ${SHOP_CARDS[second].label} became ${SHOP_CARDS[resultKey].label}. ${SHOP_CARDS[resultKey].desc || ""}`);
    updateShopUI();
    renderRunInfo();
    return true;
  }

  function addOwnedCardCopies(key, count = 1, options = {}) {
    if (!SHOP_CARDS[key] || count <= 0) {
      return;
    }
    if (options.trackGain !== false) {
      runRareTracker.shopCardsGained += count;
    }
    ownedShopCards.add(key);
    ownedShopCardCounts[key] = (ownedShopCardCounts[key] || 0) + count;
  }

  function addOwnedPassiveCopies(key, count = 1, options = {}) {
    if (!PASSIVE_UPGRADES[key] || count <= 0) {
      return;
    }
    if (options.trackGain !== false) {
      runRareTracker.passivesGained += count;
    }
    ownedPassiveCounts[key] = Math.max((ownedPassiveCounts[key] || 0) + count, 1);
  }

  function recordNaturalBlackjackWin() {
    runRareTracker.naturalBlackjacks += 1;
    updateBlackjackProgress({ blackjacksWon: blackjackProgress.blackjacksWon + 1 });
  }

  function recordWinningCursedCards(cards = []) {
    cards.forEach((card) => {
      const key = card?.shopKey;
      if (!key || !Object.hasOwn(runRareTracker.cursedHandWins, key)) {
        return;
      }
      runRareTracker.cursedHandWins[key] += 1;
    });
  }

  function resetRareTitleStreaksForFailedRun() {
    const nextStreaks = sanitizeRareTitleStreaks(blackjackProgress.rareTitleStreaks);
    let changed = false;
    Object.keys(SECRET_TITLE_STREAK_TARGETS).forEach((key) => {
      if (nextStreaks[key] > 0) {
        nextStreaks[key] = 0;
        changed = true;
      }
    });
    if (changed) {
      updateBlackjackProgress({ rareTitleStreaks: nextStreaks });
    }
  }

  function unlockRareTitlesFromWorldClear() {
    const nextMarks = sanitizeRareTitleMarks(blackjackProgress.rareTitleMarks);
    const nextStreaks = sanitizeRareTitleStreaks(blackjackProgress.rareTitleStreaks);
    const unlockedNow = [];
    const mark = (key, met = true) => {
      const streakTarget = SECRET_TITLE_STREAK_TARGETS[key] || 1;
      nextStreaks[key] = met ? nextStreaks[key] + 1 : 0;
      if (met && nextStreaks[key] >= streakTarget) {
        nextMarks[key] = Math.max(0, Number(nextMarks[key]) || 0) + 1;
        unlockedNow.push(SECRET_TITLE_DEFS[key]?.label || key);
      }
    };
    const hasCards = runRareTracker.shopCardsGained > 0 || Object.values(ownedShopCardCounts).some((count) => count > 0);
    const hasPassives = runRareTracker.passivesGained > 0 || Object.values(ownedPassiveCounts).some((count) => count > 0);
    const totalCursedHandWins = Object.values(runRareTracker.cursedHandWins || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
    mark("null-signature", (
      !hasCards &&
      !hasPassives &&
      currentTitleKeys().length === 0 &&
      runRareTracker.campVisits === 0 &&
      runRareTracker.forgeVisits === 0 &&
      runRareTracker.doubleUses === 0 &&
      runRareTracker.splitUses === 0
    ));
    mark("last-spark", runLives === 1 && runRareTracker.lifeLosses >= 5 && runRareTracker.campVisits === 0);
    mark("uncut-exit", (
      runRareTracker.lifeLosses === 0 &&
      runRareTracker.campVisits >= 1 &&
      runRareTracker.forgeVisits >= 1 &&
      runRareTracker.riskVisits === 0 &&
      runRareTracker.vaultVisits === 0
    ));
    mark("straight-teeth", (
      runRareTracker.doubleUses === 0 &&
      runRareTracker.splitUses === 0 &&
      runRareTracker.campVisits >= 1 &&
      runRareTracker.forgeVisits >= 1 &&
      runRareTracker.riskVisits >= 1 &&
      runRareTracker.vaultVisits >= 1
    ));
    mark("ash-sleeper", runRareTracker.campVisits === 0 && runRareTracker.forgeVisits >= 2 && runRareTracker.lifeLosses <= 1 && (runRareTracker.cursedHandWins["burn-card"] || 0) >= 2);
    mark("unforged-witness", runRareTracker.forgeVisits === 0 && runRareTracker.campVisits >= 2 && runRareTracker.vaultVisits >= 1 && (runRareTracker.cursedHandWins["debt-card"] || 0) >= 2);
    mark("fivefold-omen", runRareTracker.naturalBlackjacks >= 7 && runRareTracker.bossRoundLosses === 0);
    mark("closed-ledger", (
      runRareTracker.bossRoundLosses === 0 &&
      runRareTracker.lifeLosses >= 3 &&
      runRareTracker.campVisits >= 1 &&
      runRareTracker.forgeVisits >= 1
    ));
    mark("full-circuit", (
      runRareTracker.campVisits >= 1 &&
      runRareTracker.forgeVisits >= 1 &&
      runRareTracker.riskVisits >= 2 &&
      runRareTracker.vaultVisits >= 2 &&
      runRareTracker.skillTrialsCleared >= 1 &&
      runRareTracker.bossRoundLosses === 0 &&
      (runRareTracker.cursedHandWins["heavy-card"] || 0) >= 1 &&
      (runRareTracker.cursedHandWins["mirror-curse"] || 0) >= 1
    ));
    mark("house-reserve", (
      runCash >= 9000 &&
      runLives >= 5 &&
      runRareTracker.vaultVisits >= 2 &&
      runRareTracker.riskVisits >= 2 &&
      runRareTracker.campVisits === 0 &&
      totalCursedHandWins >= 3
    ));
    const shouldSaveMarks = unlockedNow.length > 0;
    const streaksChanged = JSON.stringify(nextStreaks) !== JSON.stringify(sanitizeRareTitleStreaks(blackjackProgress.rareTitleStreaks));
    if (shouldSaveMarks || streaksChanged) {
      updateBlackjackProgress({ rareTitleMarks: nextMarks, rareTitleStreaks: nextStreaks });
    }
    return unlockedNow;
  }

  function removeOwnedCardCopies(key, count = 1) {
    if (!SHOP_CARDS[key] || count <= 0) {
      return;
    }
    const nextCount = Math.max(0, (ownedShopCardCounts[key] || 0) - count);
    if (nextCount <= 0) {
      delete ownedShopCardCounts[key];
      ownedShopCards.delete(key);
      return;
    }
    ownedShopCardCounts[key] = nextCount;
  }

  function resolveCampNode() {
    runRareTracker.campVisits += 1;
    const recoveryAmount = currentCampRecoveryAmount();
    const campLifeCap = 8 + Math.max(0, recoveryAmount - 1);
    const recoveredLife = runLives < campLifeCap ? Math.min(recoveryAmount, campLifeCap - runLives) : 0;
    if (recoveredLife > 0) {
      runLives += recoveredLife;
    }
    waitingForShopChoice = true;
    shopOffersDirty = true;
    waitingForMapChoice = true;
    buildBattleRoutes();
    tableActive = false;
    roundOver = true;
    dealAnimationLock = false;
    saveBlackjackCheckpoint();
    setStatus(recoveredLife > 0
      ? `Camp reached. Rested +${recoveredLife} life${recoveredLife === 1 ? "" : "s"} and opened the shop.`
      : "Camp reached. Shop opened. No forge upgrades here.");
    updateActionButtons();
    updateAbilityStatus();
    updateTableStatus("Camp node");
    updateShopUI();
    updateMapPopupUI();
  }

  function resolveForgeNode() {
    runRareTracker.forgeVisits += 1;
    updateBlackjackProgress({ forgesUsed: blackjackProgress.forgesUsed + 1 });
    waitingForShopChoice = true;
    shopOffersDirty = true;
    waitingForMapChoice = true;
    forgeMode = "training";
    forgeTargetCardKey = "";
    forgeFusionSecondCardKey = "";
    forgeActionSpent = false;
    buildBattleRoutes();
    tableActive = false;
    roundOver = true;
    dealAnimationLock = false;
    saveBlackjackCheckpoint();
    setStatus("Card Forge reached. Apply Training or Card Fusion, then choose your next direction.");
    updateActionButtons();
    updateAbilityStatus();
    updateTableStatus("Card Forge");
    updateShopUI();
    updateMapPopupUI();
  }

  function resolveRiskNode() {
    runRareTracker.riskVisits += 1;
    const riskEvents = [
      {
        title: "Devil's Bargain",
        text: "Gain a strong reward card, but a debt curse enters the run.",
        power: "royal-card",
        curse: "debt-card",
        cash: 90,
        life: 0
      },
      {
        title: "Hot Deck",
        text: "Gain draw control, but the deck gets heavier.",
        power: "double-draw",
        curse: "heavy-card",
        cash: 45,
        life: 0
      },
      {
        title: "Frozen Table",
        text: "Gain dealer control, but the deck takes burn damage.",
        power: "dealer-freeze",
        curse: "burn-card",
        cash: 0,
        life: 1
      }
    ];
    const picked = pickOne(riskEvents);
    addOwnedCardCopies(picked.power, 1);
    addOwnedCardCopies(picked.curse, 1);
    if (picked.cash > 0) {
      runCash += picked.cash;
    }
    if (picked.life > 0) {
      runLives += picked.life;
    }
    raiseEnemyIntelligence(1.5 + greedIntelligenceBonus());
    waitingForShopChoice = false;
    waitingForMapChoice = true;
    buildBattleRoutes();
    tableActive = false;
    roundOver = true;
    dealAnimationLock = false;
    saveBlackjackCheckpoint();
    setStatus(`Risk Table: ${picked.title}. ${SHOP_CARDS[picked.power].label} gained, ${SHOP_CARDS[picked.curse].label} added.${picked.cash > 0 ? ` Found ${fmtMoney(picked.cash)}.` : ""}${picked.life > 0 ? ` Recovered ${picked.life} life.` : ""}`);
    updateActionButtons();
    updateAbilityStatus();
    updateTableStatus("Risk node resolved");
    updateShopUI();
    updateMapPopupUI();
  }

  function resolveVaultNode() {
    runRareTracker.vaultVisits += 1;
    const vaultEvents = [
      {
        title: "Cold Ledger",
        cash: 180,
        cards: ["debt-card"],
        tools: ["chip-shield"]
      },
      {
        title: "Burned Safe",
        cash: 260,
        cards: ["burn-card", "burn-card"],
        tools: []
      },
      {
        title: "Black Archive",
        cash: 320,
        cards: ["mirror-curse"],
        tools: ["rigged-shuffle"]
      }
    ];
    const picked = pickOne(vaultEvents);
    updateBlackjackProgress({ vaultsOpened: blackjackProgress.vaultsOpened + 1 });
    runCash += picked.cash + (hasPassive("vault-interest") ? 60 * passiveCount("vault-interest") : 0);
    picked.cards.forEach((key) => addOwnedCardCopies(key, 1));
    picked.tools.forEach((key) => {
      if (Object.hasOwn(activeTools, key)) {
        activeTools[key] += 1;
      }
    });
    raiseEnemyIntelligence(Math.max(1, picked.cash / 140));
    waitingForShopChoice = false;
    waitingForMapChoice = true;
    buildBattleRoutes();
    tableActive = false;
    roundOver = true;
    dealAnimationLock = false;
    const toolText = picked.tools.length ? ` Tool gained: ${TACTICAL_ITEMS[picked.tools[0]].label}.` : "";
    saveBlackjackCheckpoint();
    setStatus(`Casino Vault: ${picked.title}. Stole ${fmtMoney(picked.cash)}.${picked.cards.length ? ` Curse cards added: ${picked.cards.map((key) => SHOP_CARDS[key].label).join(", ")}.` : ""}${toolText}`);
    updateActionButtons();
    updateAbilityStatus();
    updateTableStatus("Vault node resolved");
    updateShopUI();
    updateMapPopupUI();
  }

  function claimOffer(kind, key, isFree = false) {
    const offer = buildOffer(kind, key);
    const price = isFree ? 0 : offerPrice(offer);
    if (!isFree && runCash < price) {
      setStatus(`Not enough cash for ${offer?.label || key}.`);
      return;
    }
    if (kind === "card" && !canOfferCard(key)) {
      setStatus(`${SHOP_CARDS[key]?.label || key} is already at its copy limit.`);
      return;
    }
    if (kind === "passive" && !canOfferPassive(key)) {
      setStatus(`${PASSIVE_UPGRADES[key]?.label || key} is already at its copy limit.`);
      return;
    }
    if (kind === "card") {
      const input = Array.from(shopCardChecks).find((cb) => cb.getAttribute("data-shop-card") === key);
      if (input) {
        input.checked = true;
      }
      addOwnedCardCopies(key, 1);
      setStatus(`${SHOP_CARDS[key].label} ${isFree ? "claimed for free" : `bought for ${fmtMoney(price)}`}.`);
    } else if (kind === "passive") {
      const input = Array.from(passiveChecks).find((cb) => cb.getAttribute("data-passive-upgrade") === key);
      if (input) {
        input.checked = true;
        addOwnedPassiveCopies(key, 1);
        setStatus(`${PASSIVE_UPGRADES[key].label} ${isFree ? "claimed for free" : `bought for ${fmtMoney(price)}`}.`);
      }
    } else if (kind === "tactical") {
      const input = Array.from(tacticalItemChecks).find((cb) => cb.getAttribute("data-tactical-item") === key);
      if (input) {
        input.checked = true;
        setStatus(`${TACTICAL_ITEMS[key].label} ${isFree ? "claimed for free" : `bought for ${fmtMoney(price)}`}.`);
      }
    }
    if (isFree) {
      freeOfferClaimed = true;
    } else {
      runCash -= price;
    }
    updateShopUI();
    updateCountHelperUI();
    renderRunInfo();
    saveBlackjackCheckpoint();
  }

  function grantBossSpecialReward() {
    const rewardPool = currentEncounterRule?.rewardKeys?.length
      ? currentEncounterRule.rewardKeys
      : ["crown-card", "fate-card", "dealer-breaker"];
    const rewardKey = pickOne(rewardPool);
    addOwnedCardCopies(rewardKey, 1);
    return rewardKey;
  }

  const SHOP_CARDS = {
    "wild-card": { label: "Wild Card", value: 0, type: "utility", maxCopies: 1 },
    "golden-ace": { label: "Golden Ace", value: 11, type: "utility", maxCopies: 1 },
    "blood-card": { label: "Blood Card", value: 10, type: "risk-reward" },
    "dealer-bait": { label: "Dealer Bait", value: 6, type: "risk-reward" },
    "loaded-card": { label: "Loaded Card", value: 9, type: "risk-reward" },
    "lucky-seven": { label: "Lucky Seven", value: 7, type: "utility", desc: "Counts as 6, 7, or 8 depending on the hand." },
    "mirror-card": { label: "Mirror Card", value: 0, type: "utility", desc: "Copies the value of the previous card in the hand." },
    "jackpot-card": { label: "Jackpot Card", value: 6, type: "risk-reward", desc: "If this hand wins on 21, gain +$100." },
    "marked-card": { label: "Marked Card", value: 5, type: "utility", desc: "Reveal the dealer hole card and peek the next dealer draw." },
    "chain-card": { label: "Chain Card", value: 6, type: "utility", desc: "Break one dealer special card already on the table." },
    "second-breath": { label: "Second Breath", value: 4, type: "utility", desc: "If this hand busts by 1, save it once." },
    "golden-chip-card": { label: "Golden Chip Card", value: 3, type: "risk-reward", desc: "Winning hand gains +$25." },
    "tax-eater": { label: "Tax Eater", value: 5, type: "utility", desc: "This hand ignores Tax Table penalty." },
    "stack-card": { label: "Stack Card", value: 5, type: "risk-reward" },
    "ace-anchor": { label: "Ace Anchor", value: 5, type: "utility", desc: "If this hand contains an Ace, it wins extra cash and loses less." },
    "grim-chip": { label: "Grim Chip", value: 7, type: "risk-reward", desc: "Winning hand gains +$35, but losses cost +$15." },
    "dealer-trap": { label: "Dealer Trap", value: 5, type: "utility", desc: "If the dealer busts against this hand, gain +$25." },
    "finisher-card": { label: "Finisher Card", value: 6, type: "risk-reward", desc: "Winning on 20 or 21 gains +$45." },
    "pressure-card": { label: "Pressure Card", value: 8, type: "risk-reward", maxCopies: 1 },
    "peek-card": { label: "Peek Card", value: 4, type: "utility", maxCopies: 1 },
    "swap-card": { label: "Swap Card", value: 7, type: "utility" },
    "delay-card": { label: "Delay Card", value: 3, type: "utility" },
    "control-card": { label: "Control Card", value: 2, type: "utility" },
    "royal-card": { label: "Royal Card", value: 10, type: "risk-reward" },
    "double-draw": { label: "Double Draw", value: 6, type: "risk-reward" },
    "dealer-freeze": { label: "Dealer Freeze", value: 7, type: "risk-reward" },
    "volatile-card": { label: "Volatile Card", value: 0, type: "risk" },
    "debt-card": { label: "Debt Card", value: 10, type: "risk" },
    "burn-card": { label: "Burn Card", value: 15, type: "risk" },
    "heavy-card": { label: "Heavy Card", value: 12, type: "risk" },
    "split-card": { label: "Split Card", value: 8, type: "risk" },
    "mirror-curse": { label: "Mirror Curse", value: 4, type: "risk" },
    "perfect-wild": { label: "Perfect Wild", value: 0, type: "legendary" },
    "eternal-ace": { label: "Eternal Ace", value: 11, type: "legendary" },
    "deep-peek": { label: "Deep Peek", value: 4, type: "legendary" },
    "iron-pressure": { label: "Iron Pressure", value: 8, type: "legendary" },
    "perfect-ten": { label: "Perfect Ten", value: 10, type: "legendary" },
    "royal-wild": { label: "Royal Wild", value: 0, type: "legendary" },
    "guardian-card": { label: "Guardian Card", value: 5, type: "legendary" },
    "crown-card": { label: "Crown Card", value: 10, type: "legendary" },
    "fate-card": { label: "Fate Card", value: 5, type: "legendary" },
    "dealer-breaker": { label: "Dealer Breaker", value: 9, type: "legendary" },
    "control-plus": { label: "Control Card+", value: 2, type: "legendary" },
    "lucky-jackpot": { label: "Lucky Jackpot", value: 9, type: "legendary", desc: "Winning on 20 or 21 pays heavily." },
    "open-ledger": { label: "Open Ledger", value: 7, type: "legendary", desc: "Reveal the dealer and profit from it." },
    "clean-profit": { label: "Clean Profit", value: 7, type: "legendary", desc: "Ignore tax and cash out harder." },
    "loaded-reflection": { label: "Loaded Reflection", value: 8, type: "legendary", desc: "Next draw surges upward with stronger control." },
    "ruin-engine": { label: "Ruin Engine", value: 11, type: "legendary", desc: "Huge payout, punishing failure." },
    "house-sigil": { label: "House Sigil", value: 8, type: "legendary", desc: "Cleaner utility draw with extra payout." },
    "rigged-fortune": { label: "Rigged Fortune", value: 9, type: "legendary", desc: "Utility fused with greed for stronger wins." },
    "cinder-seal": { label: "Cinder Seal", value: 10, type: "legendary", desc: "Safety and dealer denial bound together." },
    "jackpot-engine": { label: "Jackpot Engine", value: 10, type: "legendary", desc: "High-end payout engine for strong finishes." },
    "infernal-contract": { label: "Infernal Contract", value: 11, type: "legendary", desc: "Powerful reward with a harsh hook." },
    "grave-metal": { label: "Grave Metal", value: 13, type: "legendary", desc: "Heavy fused card with strong upside and recoil." }
  };

  const SHOP_STORE_CARD_KEYS = Object.keys(SHOP_CARDS).filter((key) => ![
    "perfect-wild",
    "eternal-ace",
    "deep-peek",
    "iron-pressure",
    "perfect-ten",
    "royal-wild",
    "guardian-card",
    "crown-card",
    "fate-card",
    "dealer-breaker",
    "control-plus",
    "lucky-jackpot",
    "open-ledger",
    "clean-profit",
    "loaded-reflection",
    "ruin-engine",
    "house-sigil",
    "rigged-fortune",
    "cinder-seal",
    "jackpot-engine",
    "infernal-contract",
    "grave-metal",
    "royal-card",
    "double-draw",
    "dealer-freeze",
    "burn-card",
    "mirror-curse"
  ].includes(key));

  const PASSIVE_UPGRADES = {
    "card-counter": { label: "Card Counter", desc: "Show deck size and 10-value card odds.", maxCopies: 1 },
    "deck-polish": { label: "Deck Polish", desc: "Scrub risky injected card effects each table. Extra copies add more cleans." },
    "thin-deck": { label: "Thin Deck", desc: "Remove 5 random normal cards from each fresh deck." },
    "sharp-eye": { label: "Sharp Eye", desc: "Sometimes draw two cards and choose one. Extra copies stack the chance and uses." },
    "lucky-seat": { label: "Lucky Seat", desc: "Blackjack payout increased." },
    "cold-dealer": { label: "Cold Dealer", desc: "Dealer pushes for one extra card before standing." },
    "high-roller": { label: "High Roller", desc: "Win streaks pay a modest extra cash bonus." },
    "table-reputation": { label: "Table Reputation", desc: "Shop prices are reduced. Stacks with diminishing returns." },
    "casino-credit": { label: "Casino Credit", desc: "Start each table with +$10 credit." },
    "tax-shelter": { label: "Tax Shelter", desc: "Your winning hands ignore Tax Table penalty.", maxCopies: 1 },
    "steel-nerves": { label: "Steel Nerves", desc: "First losing hand each table loses 25% less." },
    "ember-bank": { label: "Ember Bank", desc: "Start each table with +$15 extra credit." },
    "smoke-mirror": { label: "Smoke Mirror", desc: "Dealer special cards are scrubbed each table. Extra copies add more scrubs." },
    "split-fund": { label: "Split Fund", desc: "Double or Split costs less. Extra copies add more discounted uses." },
    "life-insurance": { label: "Life Insurance", desc: "Whenever you lose a life, gain +$60." },
    "steady-hand": { label: "Steady Hand", desc: "First extra draw each hand is gently corrected toward safety." },
    "dealer-tell": { label: "Dealer Tell", desc: "Reveal the dealer hole card at the start of each table.", maxCopies: 1 },
    "chip-stash": { label: "Chip Stash", desc: "Start each table with Chip Shield charges." },
    "profit-margin": { label: "Profit Margin", desc: "Every winning hand pays a little extra cash." },
    "ace-credit": { label: "Ace Credit", desc: "Winning hands with an Ace pay extra cash." },
    "grit-teeth": { label: "Grit Teeth", desc: "Early losing hands each table refund some money." },
    "perfect-focus": { label: "Perfect Focus", desc: "Winning on 21 pays extra cash." },
    "boss-dividend": { label: "Boss Dividend", desc: "Boss round wins pay extra cash." },
    "vault-interest": { label: "Vault Interest", desc: "Casino Vaults pay extra cash." },
    "trial-script": { label: "Trial Script", desc: "Skill Trial wins pay extra cash." },
    "croupier-stash": { label: "Croupier Stash", desc: "Start each table with Lucky Draw charges." }
  };

  const ITEM_RANK_LABELS = {
    1: "Ashbound (Common)",
    2: "Cinder (Uncommon)",
    3: "Hellforged (Rare)",
    4: "Dreadmarked (Epic)",
    5: "Abyssal (Legendary)"
  };

  const CARD_RANKS = {
    "wild-card": 1,
    "golden-ace": 2,
    "blood-card": 1,
    "dealer-bait": 1,
    "loaded-card": 2,
    "lucky-seven": 1,
    "mirror-card": 2,
    "jackpot-card": 2,
    "marked-card": 2,
    "chain-card": 2,
    "second-breath": 1,
    "golden-chip-card": 1,
    "tax-eater": 2,
    "stack-card": 1,
    "ace-anchor": 2,
    "grim-chip": 2,
    "dealer-trap": 2,
    "finisher-card": 3,
    "pressure-card": 2,
    "peek-card": 1,
    "swap-card": 1,
    "delay-card": 1,
    "control-card": 1,
    "royal-card": 2,
    "double-draw": 2,
    "dealer-freeze": 2,
    "volatile-card": 1,
    "debt-card": 1,
    "burn-card": 2,
    "heavy-card": 2,
    "split-card": 2,
    "mirror-curse": 3,
    "perfect-wild": 4,
    "eternal-ace": 4,
    "deep-peek": 4,
    "iron-pressure": 4,
    "perfect-ten": 3,
    "royal-wild": 3,
    "guardian-card": 3,
    "crown-card": 3,
    "fate-card": 3,
    "dealer-breaker": 3,
    "control-plus": 3,
    "lucky-jackpot": 4,
    "open-ledger": 4,
    "clean-profit": 4,
    "loaded-reflection": 4,
    "ruin-engine": 4,
    "house-sigil": 4,
    "rigged-fortune": 4,
    "cinder-seal": 4,
    "jackpot-engine": 4,
    "infernal-contract": 4,
    "grave-metal": 4
  };

  const FUSION_OUTPUT_KEYS = [
    "lucky-jackpot",
    "open-ledger",
    "clean-profit",
    "loaded-reflection",
    "ruin-engine",
    "house-sigil",
    "rigged-fortune",
    "cinder-seal",
    "jackpot-engine",
    "infernal-contract",
    "grave-metal"
  ];

  const FUSION_RECIPE_OVERRIDES = {
    "jackpot-card::lucky-seven": "lucky-jackpot",
    "marked-card::peek-card": "open-ledger",
    "golden-chip-card::tax-eater": "clean-profit",
    "loaded-card::mirror-card": "loaded-reflection",
    "blood-card::debt-card": "ruin-engine"
  };

  const FUSION_TYPE_OUTPUTS = {
    "risk-reward::utility": "rigged-fortune",
    "risk::utility": "cinder-seal",
    "risk-reward::risk-reward": "jackpot-engine",
    "risk::risk-reward": "infernal-contract",
    "risk::risk": "grave-metal",
    "utility::utility": "house-sigil"
  };

  const PASSIVE_RANKS = {
    "card-counter": 1,
    "deck-polish": 2,
    "thin-deck": 1,
    "sharp-eye": 2,
    "lucky-seat": 1,
    "cold-dealer": 2,
    "high-roller": 1,
    "table-reputation": 2,
    "casino-credit": 1,
    "tax-shelter": 2,
    "steel-nerves": 1,
    "ember-bank": 2,
    "smoke-mirror": 2,
    "split-fund": 2,
    "life-insurance": 2,
    "steady-hand": 1,
    "dealer-tell": 2,
    "chip-stash": 1,
    "profit-margin": 1,
    "ace-credit": 2,
    "grit-teeth": 1,
    "perfect-focus": 3,
    "boss-dividend": 3,
    "vault-interest": 2,
    "trial-script": 2,
    "croupier-stash": 2
  };

  const CARD_UNLOCKS = {
    "lucky-seven": { level: 2 },
    "loaded-card": { bosses: 1 },
    "mirror-card": { bosses: 1 },
    "jackpot-card": { bosses: 1 },
    "marked-card": { level: 3 },
    "chain-card": { bosses: 2 },
    "tax-eater": { bosses: 2 },
    "ace-anchor": { level: 5 },
    "grim-chip": { level: 6 },
    "dealer-trap": { level: 7 },
    "finisher-card": { level: 8 },
    "golden-ace": { maps: 3 },
    "royal-card": { maps: 3 },
    "double-draw": { maps: 3 },
    "dealer-freeze": { bosses: 2 },
    "burn-card": { maps: 4 },
    "heavy-card": { bosses: 3 },
    "split-card": { bosses: 3 },
    "mirror-curse": { bosses: 4 },
    "wild-card": { maps: 2 },
    "pressure-card": { maps: 3 }
  };

  const PASSIVE_UNLOCKS = {
    "deck-polish": { bosses: 1 },
    "sharp-eye": { maps: 3 },
    "cold-dealer": { bosses: 1 },
    "table-reputation": { bosses: 2 },
    "tax-shelter": { bosses: 2 },
    "ember-bank": { maps: 3 },
    "smoke-mirror": { bosses: 2 },
    "split-fund": { bosses: 2 },
    "life-insurance": { bosses: 3 },
    "steel-nerves": { level: 3 },
    "dealer-tell": { level: 6 },
    "chip-stash": { level: 2 },
    "profit-margin": { level: 5 },
    "ace-credit": { level: 14 },
    "perfect-focus": { level: 22, worldClears: 1 },
    "boss-dividend": { level: 14 },
    "vault-interest": { level: 7 },
    "trial-script": { level: 8 },
    "croupier-stash": { level: 16 }
  };

  function itemRankLabel(rank) {
    return ITEM_RANK_LABELS[rank] || "Rank I";
  }

  function cardRank(key) {
    if (key === "stack-card" && megaStackUnlocked) {
      return 5;
    }
    return CARD_RANKS[key] || 1;
  }

  function passiveRank(key) {
    return PASSIVE_RANKS[key] || 1;
  }

  function unlockRuleMet(rule) {
    if (!rule) {
      return true;
    }
    if (Number.isFinite(rule.level) && blackjackProgressLevel(blackjackProgress) < rule.level) {
      return false;
    }
    if (Number.isFinite(rule.rank) && currentUnlockedRankCap() < rule.rank) {
      return false;
    }
    if (Number.isFinite(rule.bosses) && blackjackProgress.totalBossesDefeated < rule.bosses) {
      return false;
    }
    if (Number.isFinite(rule.maps) && blackjackProgress.highestMapReached < rule.maps) {
      return false;
    }
    if (Number.isFinite(rule.worldClears) && blackjackProgress.worldOneClears < rule.worldClears) {
      return false;
    }
    return true;
  }

  function cardUnlockRule(key) {
    return {
      rank: cardRank(key),
      ...(CARD_UNLOCKS[key] || {})
    };
  }

  function passiveUnlockRule(key) {
    return {
      rank: passiveRank(key),
      ...(PASSIVE_UNLOCKS[key] || {})
    };
  }

  function cardIsUnlocked(key) {
    return unlockRuleMet(cardUnlockRule(key));
  }

  function passiveIsUnlocked(key) {
    return unlockRuleMet(passiveUnlockRule(key));
  }

  function unlockRuleText(rule) {
    if (!rule) {
      return "Unlocked";
    }
    const parts = [];
    if (Number.isFinite(rule.level)) {
      parts.push(`Lv ${rule.level}`);
    }
    if (Number.isFinite(rule.rank) && rule.rank > 1) {
      parts.push(itemRankLabel(rule.rank));
    }
    if (Number.isFinite(rule.bosses)) {
      parts.push(`${rule.bosses} boss${rule.bosses > 1 ? "es" : ""}`);
    }
    if (Number.isFinite(rule.maps)) {
      parts.push(`Map ${rule.maps}`);
    }
    if (Number.isFinite(rule.worldClears)) {
      parts.push(`${rule.worldClears} world clear${rule.worldClears > 1 ? "s" : ""}`);
    }
    return parts.join(" · ") || "Unlocked";
  }

  const TACTICAL_ITEMS = {
    "rigged-shuffle": { label: "Rigged Shuffle", desc: "Seed one selected shop card into the top 10 cards next table." },
    "dealer-distract": { label: "Dealer Distract", desc: "Dealer redraws the last card once next table." },
    "chip-shield": { label: "Chip Shield", desc: "Next losing hand only loses half bet." },
    "lucky-draw": { label: "Lucky Draw", desc: "Once next table, draw two cards and choose one." }
  };

  const PASSIVE_SUMMARY_META = {
    "card-counter": {
      tag: "intel",
      unit: "%",
      base: 100,
      short: (count) => `intel ${100} x ${count} = ${100 * count}%`,
      long: (count) => `Shows deck size and ten-value density. Stacks as repeated deck-reading help, currently ${count} layer${count > 1 ? "s" : ""}.`
    },
    "deck-polish": {
      tag: "clean",
      unit: "risk clean",
      base: 1,
      short: (count) => `clean ${1} x ${count} = ${count} risk clean`,
      long: (count) => `Cancels up to ${count} risky injected card effect${count > 1 ? "s" : ""} per table.`
    },
    "thin-deck": {
      tag: "thin",
      unit: "cards",
      base: 5,
      short: (count) => `thin ${5} x ${count} = ${5 * count} cards`,
      long: (count) => `Removes ${5 * count} random normal cards from each fresh deck.`
    },
    "sharp-eye": {
      tag: "luck",
      unit: "%",
      base: 10,
      short: (count) => `luck ${10} x ${count} = ${Math.min(55, 10 * count)}%`,
      long: (count) => `Can trigger up to ${count} time${count > 1 ? "s" : ""} per table at up to ${Math.min(55, 10 * count)}% per check.`
    },
    "lucky-seat": {
      tag: "payout",
      unit: "step",
      base: 1,
      short: (count) => `payout ${1} x ${count} = +${count} step`,
      long: (count) => `Improves blackjack payout. Each copy is treated as one payout step in the summary.`
    },
    "cold-dealer": {
      tag: "pressure",
      unit: "step",
      base: 1,
      short: (count) => `pressure ${1} x ${count} = ${count} step`,
      long: (count) => `Shifts dealer behavior so the dealer pushes deeper before standing.`
    },
    "high-roller": {
      tag: "money",
      unit: "$/streak",
      base: 10,
      short: (count) => `money ${10} x ${count} = ${10 * count}$/streak`,
      long: (count) => `Adds ${fmtMoney(10 * count)} per win streak step when the table finishes positive.`
    },
    "table-reputation": {
      tag: "shop",
      unit: "%",
      base: 12,
      short: (count) => `shop ${12} x ${count} = ${Math.min(45, 12 * count)}%`,
      long: (count) => `Reduces shop prices. ${count} copy${count > 1 ? "ies" : ""} currently discount shops by up to ${Math.min(45, 12 * count)}%.`
    },
    "casino-credit": {
      tag: "credit",
      unit: "$",
      base: 10,
      short: (count) => `credit ${10} x ${count} = ${10 * count}$`,
      long: (count) => `Adds a small starting table credit before the hand sequence begins.`
    },
    "tax-shelter": {
      tag: "tax",
      unit: "shield",
      base: 1,
      short: (count) => `tax ${1} x ${count} = ${count} shield`,
      long: () => "Winning hands ignore Tax Table penalty."
    },
    "steel-nerves": {
      tag: "loss",
      unit: "%",
      base: 25,
      short: (count) => `loss ${25} x ${count} = ${25 * count}% cut`,
      long: () => "First losing hand each table loses less money."
    },
    "ember-bank": {
      tag: "credit",
      unit: "$",
      base: 15,
      short: (count) => `credit ${15} x ${count} = ${15 * count}$`,
      long: () => "Adds extra table-start cash every fight."
    },
    "smoke-mirror": {
      tag: "clean",
      unit: "special",
      base: 1,
      short: (count) => `clean ${1} x ${count} = ${count} special`,
      long: (count) => `Scrubs up to ${count} dealer special card${count > 1 ? "s" : ""} each table.`
    },
    "split-fund": {
      tag: "action",
      unit: "%",
      base: 50,
      short: (count) => `action ${50} x ${count} = ${50 * count}% cut`,
      long: (count) => `Reduces Double or Split costs for up to ${count} action${count > 1 ? "s" : ""} each table.`
    },
    "life-insurance": {
      tag: "life",
      unit: "$",
      base: 60,
      short: (count) => `life ${60} x ${count} = ${60 * count}$`,
      long: () => "Pays cash back whenever a life is lost."
    },
    "steady-hand": {
      tag: "control",
      unit: "step",
      base: 1,
      short: (count) => `control ${1} x ${count} = ${count} step`,
      long: () => "First extra draw each hand is nudged by one point toward a safer total."
    },
    "dealer-tell": {
      tag: "reveal",
      unit: "card",
      base: 1,
      short: (count) => `reveal ${1} x ${count} = ${count} card`,
      long: () => "Reveals the dealer hole card at table start."
    },
    "chip-stash": {
      tag: "shield",
      unit: "charge",
      base: 1,
      short: (count) => `shield ${1} x ${count} = ${count} charge`,
      long: (count) => `Adds ${count} Chip Shield charge${count > 1 ? "s" : ""} at the start of each table.`
    },
    "profit-margin": {
      tag: "money",
      unit: "$/win",
      base: 12,
      short: (count) => `money ${12} x ${count} = ${12 * count}$/win`,
      long: (count) => `Every winning hand pays an extra ${fmtMoney(12 * count)}.`
    },
    "ace-credit": {
      tag: "ace",
      unit: "$/ace win",
      base: 18,
      short: (count) => `ace ${18} x ${count} = ${18 * count}$/ace win`,
      long: (count) => `Winning hands with an Ace pay an extra ${fmtMoney(18 * count)}.`
    },
    "grit-teeth": {
      tag: "refund",
      unit: "uses",
      base: 1,
      short: (count) => `refund ${1} x ${count} = ${count} use`,
      long: (count) => `The first ${count} losing hand${count > 1 ? "s" : ""} each table refund ${fmtMoney(20)} each.`
    },
    "perfect-focus": {
      tag: "21",
      unit: "$/21",
      base: 25,
      short: (count) => `21 ${25} x ${count} = ${25 * count}$/21`,
      long: (count) => `Winning on 21 pays an extra ${fmtMoney(25 * count)}.`
    },
    "boss-dividend": {
      tag: "boss",
      unit: "$/boss round",
      base: 40,
      short: (count) => `boss ${40} x ${count} = ${40 * count}$/round`,
      long: (count) => `Boss round wins pay an extra ${fmtMoney(40 * count)}.`
    },
    "vault-interest": {
      tag: "vault",
      unit: "$/vault",
      base: 60,
      short: (count) => `vault ${60} x ${count} = ${60 * count}$/vault`,
      long: (count) => `Casino Vault nodes pay an extra ${fmtMoney(60 * count)}.`
    },
    "trial-script": {
      tag: "trial",
      unit: "$/trial win",
      base: 35,
      short: (count) => `trial ${35} x ${count} = ${35 * count}$/win`,
      long: (count) => `Skill Trial wins pay ${fmtMoney(35 * count)} more.`
    },
    "croupier-stash": {
      tag: "draw",
      unit: "charges",
      base: 1,
      short: (count) => `draw ${1} x ${count} = ${count} charge`,
      long: (count) => `Adds ${count} Lucky Draw charge${count > 1 ? "s" : ""} at the start of each table.`
    }
  };

  const DEALER_SPECIAL_CARDS = {
    "dealer-push-card": { label: "Dealer Push", desc: "Dealer must draw again." },
    "dealer-lock-card": { label: "Dealer Lock", desc: "Dealer stands immediately." },
    "dealer-burn-card": { label: "Dealer Burn", desc: "Dealer card gains +3 value." }
  };

  const WORLD_ONE_NORMAL_MONSTERS = [
    { name: "Crooked Dealer", key: "aggressive", signatureCardKey: "dealer-burn-card", signatureCopies: 3 },
    { name: "Card Shark", key: "lucky", signatureCardKey: "dealer-push-card", signatureCopies: 2 },
    { name: "Pit Runner", key: "aggressive", signatureCardKey: "dealer-push-card", signatureCopies: 2 },
    { name: "Debt Collector", key: "safe", signatureCardKey: "dealer-lock-card", signatureCopies: 2 },
    { name: "Smile Dealer", key: "safe", signatureCardKey: "dealer-lock-card", signatureCopies: 2 },
    { name: "False Angel", key: "lucky", signatureCardKey: "dealer-burn-card", signatureCopies: 3 },
    { name: "Velvet Snake", key: "chaotic", signatureCardKey: "dealer-push-card", signatureCopies: 2 },
    { name: "Ash Croupier", key: "aggressive", signatureCardKey: "dealer-burn-card", signatureCopies: 3 },
    { name: "Chip Vulture", key: "safe", signatureCardKey: "dealer-lock-card", signatureCopies: 2 },
    { name: "Red Glove", key: "lucky", signatureCardKey: "dealer-burn-card", signatureCopies: 3 },
    { name: "Silk Cheat", key: "chaotic", signatureCardKey: "dealer-lock-card", signatureCopies: 2 },
    { name: "House Hound", key: "aggressive", signatureCardKey: "dealer-push-card", signatureCopies: 2 },
    { name: "Brass Smile", key: "safe", signatureCardKey: "dealer-burn-card", signatureCopies: 3 },
    { name: "Lucky Butcher", key: "lucky", signatureCardKey: "dealer-push-card", signatureCopies: 2 },
    { name: "Floor Whisper", key: "chaotic", signatureCardKey: "dealer-lock-card", signatureCopies: 2 }
  ];

  const ENCOUNTER_RULES = {
    elite: [
      {
        key: "pit-boss",
        label: "Pit Boss",
        desc: "Signature cards: Dealer Burn + Dealer Lock. Ability: House Tax can cut table value while you play.",
        signatureCardKeys: ["dealer-burn-card", "dealer-lock-card"],
        abilityKey: "house-tax"
      },
      {
        key: "loaded-sleeve",
        label: "Loaded Sleeve",
        desc: "Signature cards: Dealer Burn + Dealer Push. Ability: Sleeve Heat can load another burn card into the dealer flow.",
        signatureCardKeys: ["dealer-burn-card", "dealer-push-card"],
        abilityKey: "sleeve-heat"
      },
      {
        key: "split-punisher",
        label: "Split Punisher",
        desc: "Signature cards: Dealer Lock + Dealer Push. Ability: Pain Mark can raise the loss cost on your active hand.",
        signatureCardKeys: ["dealer-lock-card", "dealer-push-card"],
        abilityKey: "pain-mark"
      },
      {
        key: "ash-magistrate",
        label: "Ash Magistrate",
        desc: "Signature cards: Dealer Burn + Dealer Burn. Ability: Cinder Mark can raise the loss cost on your active hand.",
        signatureCardKeys: ["dealer-burn-card", "dealer-burn-card"],
        abilityKey: "pain-mark"
      },
      {
        key: "velvet-auditor",
        label: "Velvet Auditor",
        desc: "Signature cards: Dealer Lock + Dealer Lock. Ability: Fee Clip can drain cash from the table mid-play.",
        signatureCardKeys: ["dealer-lock-card", "dealer-lock-card"],
        abilityKey: "house-tax"
      },
      {
        key: "riot-dealer",
        label: "Riot Dealer",
        desc: "Signature cards: Dealer Push + Dealer Push. Ability: Forced Push can queue another dealer push card.",
        signatureCardKeys: ["dealer-push-card", "dealer-push-card"],
        abilityKey: "forced-push"
      },
      {
        key: "glass-saint",
        label: "Glass Saint",
        desc: "Signature cards: Dealer Burn + Dealer Lock. Ability: Seal Table can queue another dealer lock card.",
        signatureCardKeys: ["dealer-burn-card", "dealer-lock-card"],
        abilityKey: "seal-table"
      },
      {
        key: "red-notary",
        label: "Red Notary",
        desc: "Signature cards: Dealer Burn + Dealer Push. Ability: Raise Penalty hits harder after a double down.",
        signatureCardKeys: ["dealer-burn-card", "dealer-push-card"],
        abilityKey: "raise-penalty"
      },
      {
        key: "house-fang",
        label: "House Fang",
        desc: "Signature cards: Dealer Lock + Dealer Push. Ability: Fang Mark can raise the loss cost on your active hand.",
        signatureCardKeys: ["dealer-lock-card", "dealer-push-card"],
        abilityKey: "pain-mark"
      },
      {
        key: "lucky-executioner",
        label: "Lucky Executioner",
        desc: "Signature cards: Dealer Burn + Dealer Push. Ability: Loaded Burn can queue another dealer burn card.",
        signatureCardKeys: ["dealer-burn-card", "dealer-push-card"],
        abilityKey: "loaded-burn"
      }
    ],
    boss: [
      {
        key: "lord-asmodeus",
        label: "Lord Asmodeus",
        desc: "3 rounds. Signature cards: Dealer Burn, Dealer Lock, Dealer Push. Abilities: House Tax, Seal Table, Forced Push.",
        signatureCardKeys: ["dealer-burn-card", "dealer-lock-card", "dealer-push-card"],
        abilityKeys: ["house-tax", "seal-table", "forced-push"],
        rewardKeys: ["control-plus", "guardian-card", "perfect-ten"]
      },
      {
        key: "jack-of-lies",
        label: "Jack of Lies",
        desc: "3 rounds. Signature cards: Dealer Lock, Dealer Lock, Dealer Burn. Abilities: Audit Drain, House Tax, Raise Penalty.",
        signatureCardKeys: ["dealer-lock-card", "dealer-lock-card", "dealer-burn-card"],
        abilityKeys: ["audit-drain", "house-tax", "raise-penalty"],
        rewardKeys: ["crown-card", "dealer-breaker", "fate-card"]
      },
      {
        key: "mammon",
        label: "Mammon",
        desc: "3 rounds. Signature cards: Dealer Burn, Dealer Burn, Dealer Push. Abilities: Loaded Burn, Cinder Mark, Forced Push.",
        signatureCardKeys: ["dealer-burn-card", "dealer-burn-card", "dealer-push-card"],
        abilityKeys: ["loaded-burn", "cinder-mark", "forced-push"],
        rewardKeys: ["royal-wild", "guardian-card", "crown-card"]
      },
      {
        key: "mortis",
        label: "Mortis",
        desc: "3 rounds. Signature cards: Dealer Lock, Dealer Burn, Dealer Lock. Abilities: Seal Table, Audit Drain, Cinder Mark.",
        signatureCardKeys: ["dealer-lock-card", "dealer-burn-card", "dealer-lock-card"],
        abilityKeys: ["seal-table", "audit-drain", "cinder-mark"],
        rewardKeys: ["guardian-card", "fate-card", "perfect-ten"]
      },
      {
        key: "lilith",
        label: "Lilith",
        desc: "3 rounds. Signature cards: Dealer Lock, Dealer Push, Dealer Burn. Abilities: Seal Table, Forced Push, Raise Penalty.",
        signatureCardKeys: ["dealer-lock-card", "dealer-push-card", "dealer-burn-card"],
        abilityKeys: ["seal-table", "forced-push", "raise-penalty"],
        rewardKeys: ["dealer-breaker", "perfect-ten", "royal-wild"]
      },
      {
        key: "belial",
        label: "Belial",
        desc: "3 rounds. Signature cards: Dealer Burn, Dealer Lock, Dealer Burn. Abilities: Audit Drain, House Tax, Cinder Mark.",
        signatureCardKeys: ["dealer-burn-card", "dealer-lock-card", "dealer-burn-card"],
        abilityKeys: ["audit-drain", "house-tax", "cinder-mark"],
        rewardKeys: ["fate-card", "crown-card", "dealer-breaker"]
      }
    ]
  };

  function eventLabel(eventKey) {
    if (originalMode || eventKey === "normal-table") {
      return "Original Blackjack - no modifiers";
    }
    if (eventKey === "double-table") {
      return "Double Table - all bets x2";
    }
    if (eventKey === "dealer-rage") {
      return "Dealer Rage - dealer hits until 19";
    }
    if (eventKey === "lucky-table") {
      return "Lucky Table - higher blackjack chance";
    }
    if (eventKey === "tax-table") {
      return "Tax Table - lose 10% of winnings";
    }
    return "Normal Table";
  }

  function encounterRuleLabel() {
    return currentEncounterRule ? `${currentEncounterRule.label} - ${currentEncounterRule.desc}` : "";
  }

  function ensureWorldOneMiddleBossOrder() {
    if (worldOneMiddleBossOrder.length !== 3) {
      worldOneMiddleBossOrder = shuffleList(["jack-of-lies", "mammon", "mortis", "lilith"]).slice(0, 3);
    }
    return worldOneMiddleBossOrder;
  }

  function pickWorldOneBossRule() {
    const pool = ENCOUNTER_RULES.boss || [];
    if (!pool.length) {
      return null;
    }
    const bossIndex = Math.max(1, Math.min(5, currentWorldMapNumber));
    let targetKey = "lord-asmodeus";
    if (bossIndex === 1) {
      targetKey = "lord-asmodeus";
    } else if (bossIndex >= 2 && bossIndex <= 4) {
      const middleOrder = ensureWorldOneMiddleBossOrder();
      targetKey = middleOrder[bossIndex - 2] || "jack-of-lies";
    } else {
      targetKey = "belial";
    }
    return pool.find((rule) => rule.key === targetKey) || pool[0];
  }

  function pickEncounterRule(type) {
    if (type === "boss") {
      return pickWorldOneBossRule();
    }
    const pool = ENCOUNTER_RULES[type];
    return Array.isArray(pool) && pool.length ? pickOne(pool) : null;
  }

  function applyEncounterRuleTableSetup() {
    if (!currentEncounterRule) {
      return;
    }
    if (currentSpecialNodeType === "boss") {
      const pattern = currentEncounterRule.key === "lord-asmodeus"
        ? ["double-table", "dealer-rage", "lucky-table", "tax-table", "double-table"]
        : currentEncounterRule.key === "jack-of-lies"
          ? ["tax-table", "double-table", "tax-table", "dealer-rage", "tax-table"]
          : currentEncounterRule.key === "mammon"
            ? ["dealer-rage", "dealer-rage", "double-table", "lucky-table", "dealer-rage"]
            : currentEncounterRule.key === "mortis"
              ? ["tax-table", "lucky-table", "dealer-rage", "tax-table", "dealer-rage"]
            : currentEncounterRule.key === "lilith"
              ? ["double-table", "dealer-rage", "double-table", "tax-table", "dealer-rage"]
              : ["tax-table", "dealer-rage", "lucky-table", "tax-table", "double-table"];
      tableHands.forEach((hand, index) => {
        hand.eventKey = pattern[index % pattern.length];
      });
    }
  }

  function applyEncounterRuleToSplitHand(hand) {
    if (!currentEncounterRule || !hand) {
      return;
    }
  }

  function encounterDealerHitBonus() {
    if (!currentEncounterRule) {
      return 0;
    }
    if (currentSpecialNodeType === "boss" && currentEncounterRule.key === "mammon") {
      return 1;
    }
    return 0;
  }

  function applyEncounterResolutionCost() {
    if (!currentEncounterRule) {
      return 0;
    }
    if (currentSpecialNodeType === "boss" && currentEncounterRule.key === "jack-of-lies") {
      tableNet -= 15;
      return 15;
    }
    return 0;
  }

  function eventBetMultiplier() {
    if (originalMode || currentEvent === "normal-table") {
      return 1;
    }
    return currentEvent === "double-table" ? 2 : 1;
  }

  function currentBustLimit() {
    return currentMaxTotal;
  }

  function nodeMaxBonus(type) {
    if (type === "elite") return 2;
    if (type === "boss") return 5;
    if (["fight", "risk", "vault", "trial"].includes(type)) return 1;
    return 0;
  }

  function awardMaxTotalBonusForCurrentNode() {
    if (originalMode || !currentMapNodeId || earnedMaxBonusNodeIds.has(currentMapNodeId)) {
      return;
    }
    const nodeType = mapNodes[currentMapNodeId]?.type;
    const bonus = nodeMaxBonus(nodeType);
    if (bonus > 0) {
      currentMaxTotal += bonus;
    }
    earnedMaxBonusNodeIds.add(currentMapNodeId);
  }

  function dealerHitThreshold() {
    if (originalMode) {
      return 17;
    }
    const target = currentBustLimit() - 4;
    const passiveAdjusted = hasPassive("cold-dealer")
      ? Math.min(currentBustLimit() - 1, target + passiveCount("cold-dealer"))
      : target;
    return Math.min(currentBustLimit() - 1, passiveAdjusted + encounterDealerHitBonus());
  }

  function sharpEyeReady() {
    if (!hasPassive("sharp-eye")) {
      return false;
    }
    if (passiveState["sharp-eye-used"] >= passiveCount("sharp-eye")) {
      return false;
    }
    return Math.random() < Math.min(0.55, 0.1 * passiveCount("sharp-eye"));
  }

  function encounterIntelligenceGain() {
    if (currentSpecialNodeType === "fight") return 1;
    if (currentSpecialNodeType === "elite") return 2;
    if (currentSpecialNodeType === "boss") return 3;
    return 0;
  }

  function encounterIntelligenceMultiplier() {
    if (currentSpecialNodeType === "fight") return 0.5;
    if (currentSpecialNodeType === "elite") return 1;
    if (currentSpecialNodeType === "boss") return 1.5;
    return 0;
  }

  function currentEncounterIntelligence() {
    return enemyIntelligencePoints * encounterIntelligenceMultiplier();
  }

  function playerBuildEntries() {
    const entries = [];
    selectedShopCardKeys().forEach((key) => {
      const copies = Math.max(1, ownedShopCardCounts[key] || 1);
      for (let i = 0; i < copies; i += 1) {
        entries.push({ kind: "card", key });
      }
    });
    selectedPassiveKeys().forEach((key) => {
      entries.push({ kind: "passive", key });
    });
    selectedTacticalKeys().forEach((key) => {
      const copies = Math.max(1, activeTools[key] || 1);
      for (let i = 0; i < copies; i += 1) {
        entries.push({ kind: "tool", key });
      }
    });
    return entries;
  }

  function buildReadRatio() {
    const intelligence = currentEncounterIntelligence();
    if (intelligence < 2.5) return 0;
    if (intelligence < 5) return 0.10;
    if (intelligence < 8) return 0.18;
    if (intelligence < 12) return 0.28;
    return 0.4;
  }

  function knownPlayerBuildEntries() {
    const entries = playerBuildEntries();
    if (!entries.length) {
      return [];
    }
    const ratio = buildReadRatio();
    if (ratio <= 0) {
      return [];
    }
    const desiredCount = Math.max(1, Math.ceil(entries.length * ratio));
    const weighted = entries
      .map((entry, index) => {
        let score = 0;
        if (entry.key === "dealer-breaker") score += 12;
        if (entry.key === "card-counter") score += 10;
        if (entry.key === "rigged-shuffle") score += 9;
        if (entry.key === "lucky-draw") score += 8;
        if (entry.key === "sharp-eye") score += 8;
        if (entry.key === "chip-shield") score += 7;
        if (entry.key === "cold-dealer") score += 7;
        if (entry.key === "thin-deck") score += 6;
        if (entry.key === "deck-polish") score += 5;
        if (entry.key === "high-roller") score += 4;
        if (entry.key === "casino-credit") score += 4;
        if (entry.key === "fate-card") score += 4;
        if (entry.key === "crown-card") score += 4;
        if (entry.key === "royal-card") score += 4;
        return { ...entry, index, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.index - b.index;
      });
    return weighted.slice(0, desiredCount);
  }

  function knownPlayerBuildSummary() {
    const known = knownPlayerBuildEntries();
    return {
      count: known.length,
      dealerPressure: known.filter((entry) => ["dealer-breaker", "cold-dealer", "chip-shield"].includes(entry.key)).length,
      drawManipulation: known.filter((entry) => ["card-counter", "rigged-shuffle", "sharp-eye", "lucky-draw", "thin-deck", "deck-polish"].includes(entry.key)).length,
      greedSignals: known.filter((entry) => ["high-roller", "casino-credit", "royal-card", "crown-card", "fate-card"].includes(entry.key)).length
    };
  }

  function greedIntelligenceBonus() {
    let bonus = 0;
    if (runCash >= 1000) bonus += 1;
    if (runCash >= 2500) bonus += 1;
    if (runCash >= 5000) bonus += 2;
    if (hasPassive("high-roller")) bonus += 1;
    if (hasPassive("casino-credit")) bonus += 0.5;
    if ((ownedShopCardCounts["royal-card"] || 0) > 0) bonus += 0.5;
    if ((ownedShopCardCounts["crown-card"] || 0) > 0) bonus += 0.5;
    if ((ownedShopCardCounts["fate-card"] || 0) > 0) bonus += 0.5;
    return bonus;
  }

  function raiseEnemyIntelligence(amount) {
    if (originalMode || amount <= 0) {
      return;
    }
    enemyIntelligencePoints += amount;
  }

  function dealerUsesStrategicPlay() {
    return !originalMode && encounterIntelligenceGain() > 0 && currentEncounterIntelligence() >= 1;
  }

  function dealerTrueCount() {
    const decksRemaining = Math.max(0.5, deck.length / 52);
    return runningCount / decksRemaining;
  }

  function familyPressureAgainstDealerTotal(dealerTotal) {
    const families = new Map();
    tableHands.forEach((hand, index) => {
      const familyId = hand.familyId || (index + 1);
      if (!families.has(familyId)) {
        families.set(familyId, { wins: 0, losses: 0, pushes: 0 });
      }
      const family = families.get(familyId);
      if (hand.state === "completed") {
        if (hand.result === "win") family.wins += 1;
        else if (hand.result === "loss") family.losses += 1;
        else family.pushes += 1;
        return;
      }
      const player = handTotal(hand.cards);
      let outcome = "push";
      if (player > currentBustLimit()) {
        outcome = "loss";
      } else if (dealerTotal > currentBustLimit() || player > dealerTotal) {
        outcome = "win";
      } else if (player < dealerTotal) {
        outcome = "loss";
      }
      if (outcome === "win") family.wins += 1;
      else if (outcome === "loss") family.losses += 1;
      else family.pushes += 1;
    });

    let playerFamilyWins = 0;
    let playerFamilyLosses = 0;
    families.forEach((family) => {
      if (family.wins > 0 && family.wins >= family.losses) {
        playerFamilyWins += 1;
      } else if (family.losses > family.wins) {
        playerFamilyLosses += 1;
      }
    });
    return { playerFamilyWins, playerFamilyLosses };
  }

  function strongestActivePlayerTotal() {
    return tableHands.reduce((best, hand) => {
      if (!hand || hand.state === "completed") {
        return best;
      }
      const total = handTotal(hand.cards);
      if (total > currentBustLimit()) {
        return best;
      }
      return Math.max(best, total);
    }, 0);
  }

  function shouldDealerDraw() {
    if (!dealerUsesStrategicPlay()) {
      return handTotal(dealerHand) < dealerHitThreshold();
    }
    const intelligence = currentEncounterIntelligence();
    const knownBuild = knownPlayerBuildSummary();
    const total = handTotal(dealerHand);
    if (total > currentBustLimit()) {
      return false;
    }
    const threshold = dealerHitThreshold();
    if (intelligence < 2) {
      if (total < threshold) {
        return true;
      }
      return Math.random() < Math.max(0.08, 0.26 - (intelligence * 0.06)) && total < currentBustLimit() - 1;
    }
    const { playerFamilyWins, playerFamilyLosses } = familyPressureAgainstDealerTotal(total);
    if (intelligence >= 3 && playerFamilyLosses > playerFamilyWins) {
      return false;
    }
    const trueCount = intelligence >= 4 ? dealerTrueCount() : 0;
    const strongestPlayer = strongestActivePlayerTotal();
    const baseTarget = threshold;
    const bossPressure = currentSpecialNodeType === "boss" && intelligence >= 5 ? 1 : 0;
    const countShift = trueCount <= -1.5 ? 1 : trueCount >= 1.5 ? -1 : 0;
    const buildPressure = knownBuild.greedSignals >= 2 ? 1 : 0;
    const cautionShift = knownBuild.dealerPressure >= 1 ? -1 : 0;
    const readShift = knownBuild.drawManipulation >= 2 ? -1 : 0;
    const smartTarget = Math.min(currentBustLimit() - 1, Math.max(13, baseTarget + bossPressure + countShift));
    const adjustedTarget = Math.min(currentBustLimit() - 1, Math.max(13, smartTarget + buildPressure + cautionShift + readShift));
    const floorTarget = Math.max(12, adjustedTarget - 2);

    if (total < floorTarget) {
      return true;
    }
    if (total >= adjustedTarget) {
      return false;
    }
    if (intelligence >= 2.5 && strongestPlayer >= (total - Math.min(1, knownBuild.dealerPressure))) {
      return true;
    }
    if (intelligence >= 4) {
      return trueCount < (knownBuild.drawManipulation >= 1 ? 0.5 : 0) && total < currentBustLimit() - 1;
    }
    return total < baseTarget;
  }

  function isTaxTable() {
    return currentEvent === "tax-table";
  }

  function updateEventBadge() {
    if (eventBadgeEl) {
      eventBadgeEl.textContent = `Event: ${eventLabel(currentEvent)}`;
    }
  }

  function chooseNextEvent() {
    currentEvent = tableEvents[Math.floor(Math.random() * tableEvents.length)];
    updateEventBadge();
  }

  function dealerNamePoolPick() {
    const monster = pickOne(WORLD_ONE_NORMAL_MONSTERS);
    currentNormalMonster = monster;
    return monster;
  }

  function dealerProfileLabel(key) {
    const profile = dealerProfiles.find((d) => d.key === key);
    return profile ? profile.name : key;
  }

  function routeRiskLabel(key) {
    if (key === "safe") return "Low Risk";
    if (key === "aggressive") return "High Pressure";
    if (key === "lucky") return "High Variance";
    if (key === "chaotic") return "Chaos";
    return "Standard";
  }

  function encounterIcon(type) {
    if (type === "fight") return "⚔";
    if (type === "elite") return "☠";
    if (type === "boss") return "👑";
    if (type === "camp") return "🔥";
    if (type === "forge") return "⚒";
    if (type === "risk") return "♠";
    if (type === "vault") return "💰";
    if (type === "trial") return "★";
    return "•";
  }

  function encounterLabel(type) {
    if (type === "fight") return "Fight";
    if (type === "elite") return "Elite Fight";
    if (type === "boss") return "Boss Fight";
    if (type === "camp") return "Camp";
    if (type === "forge") return "Card Forge";
    if (type === "risk") return "Risk Table";
    if (type === "vault") return "Casino Vault";
    if (type === "trial") return "Skill Trial";
    return "Node";
  }

  let mapNodes = {};
  let mapEdges = [];

  // Map balance sheet: tune these values to rebalance run structure.
  const MAP_BALANCE = {
    TOTAL_ENCOUNTERS: 6, // fixed run length from opening node to final boss node
    BOSS_ENCOUNTERS: 1, // only the final encounter is boss
    CAMPS_MIN: 1,
    CAMPS_MAX: 3,
    STAGE_NODE_COUNT_TEMPLATES: [
      [1, 1, 2, 2, 1, 1],
      [1, 2, 2, 2, 1, 1],
      [1, 2, 3, 2, 1, 1],
      [1, 2, 2, 2, 2, 1],
      [1, 2, 3, 2, 2, 1],
      [1, 3, 3, 2, 2, 1],
      [1, 2, 3, 3, 2, 1],
      [1, 2, 4, 3, 2, 1],
      [1, 3, 4, 3, 2, 1],
      [1, 2, 4, 4, 2, 1]
    ],
    MAX_OUTGOING_PER_NODE: 2,
    MAX_INCOMING_PER_NODE: 2,
    MAX_LANE_DELTA_PER_EDGE: 1,
    MAX_CHOICES_PER_STEP: 3, // how many next nodes are selectable at once
    MIN_OUTGOING_PER_NODE: 1
  };

  function pickOne(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function jitter(base, spread, min = 10, max = 90) {
    return Math.max(min, Math.min(max, base + ((Math.random() * 2 - 1) * spread)));
  }

  function currentMapGenerationProfile() {
    const profiles = {
      1: {
        templates: [
          [1, 2, 2, 2, 2, 1],
          [1, 2, 3, 2, 2, 1]
        ],
        maxChoices: 3,
        stagePlans: {
          1: ["camp", "fight"],
          2: ["forge", "fight", "fight"],
          3: ["fight", "elite", "fight"],
          4: ["camp", "fight"]
        }
      },
      2: {
        templates: [
          [1, 2, 3, 2, 2, 1],
          [1, 2, 2, 2, 2, 1]
        ],
        maxChoices: 3,
        stagePlans: {
          1: ["camp", "fight"],
          2: ["forge", "elite", "fight"],
          3: ["risk", "fight"],
          4: ["camp", "fight"]
        }
      },
      3: {
        templates: [
          [1, 3, 4, 3, 2, 1],
          [1, 2, 4, 3, 2, 1],
          [1, 3, 3, 2, 2, 1]
        ],
        maxChoices: 3,
        stagePlans: {
          1: ["camp", "fight", "elite"],
          2: ["forge", "risk", "vault", "fight"],
          3: ["trial", "elite", "fight"],
          4: ["camp", "fight"]
        }
      },
      4: {
        templates: [
          [1, 2, 4, 3, 2, 1],
          [1, 2, 3, 3, 2, 1]
        ],
        maxChoices: 3,
        stagePlans: {
          1: ["elite", "fight"],
          2: ["risk", "elite", "fight", "vault"],
          3: ["trial", "elite", "fight"],
          4: ["forge", "fight"]
        }
      },
      5: {
        templates: [
          [1, 2, 2, 2, 1, 1],
          [1, 2, 3, 2, 1, 1],
          [1, 1, 2, 2, 1, 1]
        ],
        maxChoices: 2,
        stagePlans: {
          1: ["elite", "fight"],
          2: ["risk", "trial", "fight"],
          3: ["elite", "fight"],
          4: ["forge"]
        }
      }
    };
    return profiles[currentWorldMapNumber] || profiles[3];
  }

  function buildStageNodeCounts(profile = currentMapGenerationProfile()) {
    const templatePool = profile?.templates?.length ? profile.templates : MAP_BALANCE.STAGE_NODE_COUNT_TEMPLATES;
    const feasible = templatePool.filter((tpl) => {
      if (!Array.isArray(tpl) || tpl.length !== MAP_BALANCE.TOTAL_ENCOUNTERS) {
        return false;
      }
      for (let i = 0; i < tpl.length - 1; i += 1) {
        const current = tpl[i];
        const next = tpl[i + 1];
        const canCoverNext = current * MAP_BALANCE.MAX_OUTGOING_PER_NODE >= next;
        const canServeCurrent = next * MAP_BALANCE.MAX_INCOMING_PER_NODE >= current;
        if (!canCoverNext || !canServeCurrent) {
          return false;
        }
      }
      return true;
    });
    if (!feasible.length) {
      return [1, 2, 2, 2, 2, 1];
    }
    return [...pickOne(feasible)];
  }

  function currentMapChoiceCap() {
    return currentMapGenerationProfile().maxChoices || MAP_BALANCE.MAX_CHOICES_PER_STEP;
  }

  function nodeTypeRiskWeight(type) {
    if (type === "camp" || type === "forge") return -2;
    if (type === "fight") return -1;
    if (type === "vault") return 1;
    if (type === "risk" || type === "trial" || type === "elite") return 2;
    return 0;
  }

  function assignStageNodeTypes(ids, draftNodes, plannedTypes = []) {
    const neutralPool = [...ids];
    const centerFirst = [...neutralPool].sort((a, b) => {
      const da = Math.abs((draftNodes[a]?.lane ?? 2) - 2);
      const db = Math.abs((draftNodes[b]?.lane ?? 2) - 2);
      return da - db;
    });
    const edgeFirst = [...neutralPool].sort((a, b) => {
      const da = Math.abs((draftNodes[a]?.lane ?? 2) - 2);
      const db = Math.abs((draftNodes[b]?.lane ?? 2) - 2);
      return db - da;
    });
    const remaining = new Set(ids);
    const assigned = new Map();

    plannedTypes.forEach((type) => {
      const source = nodeTypeRiskWeight(type) > 0 ? edgeFirst : centerFirst;
      const picked = source.find((id) => remaining.has(id));
      if (!picked) return;
      assigned.set(picked, type);
      remaining.delete(picked);
    });

    Array.from(remaining)
      .sort((a, b) => (draftNodes[a]?.lane ?? 2) - (draftNodes[b]?.lane ?? 2))
      .forEach((id) => {
        assigned.set(id, pickOne(["fight", "fight", "elite"]));
      });

    return assigned;
  }

  function enforceMapRoleCoverage(stageIds, draftNodes) {
    const midIds = stageIds.slice(1, stageIds.length - 1).flat();
    const types = midIds.map((id) => draftNodes[id]?.type);
    const hasEconomy = types.some((type) => ["camp", "vault"].includes(type));
    const hasPower = types.some((type) => ["forge", "risk"].includes(type));
    const hasDanger = types.some((type) => ["elite", "trial", "risk"].includes(type));
    const centerSorted = [...midIds].sort((a, b) => Math.abs((draftNodes[a]?.lane ?? 2) - 2) - Math.abs((draftNodes[b]?.lane ?? 2) - 2));
    const edgeSorted = [...midIds].sort((a, b) => Math.abs((draftNodes[b]?.lane ?? 2) - 2) - Math.abs((draftNodes[a]?.lane ?? 2) - 2));

    if (!hasEconomy && centerSorted.length) {
      draftNodes[centerSorted[0]].type = "camp";
    }
    if (!hasPower) {
      const target = centerSorted.find((id) => !["camp", "boss"].includes(draftNodes[id]?.type)) || centerSorted[0];
      if (target) draftNodes[target].type = "forge";
    }
    if (!hasDanger) {
      const target = edgeSorted.find((id) => !["boss"].includes(draftNodes[id]?.type)) || edgeSorted[0];
      if (target) draftNodes[target].type = "elite";
    }
  }

  function enforceBossPrepStage(stageIds, draftNodes) {
    const prepIds = stageIds[stageIds.length - 2] || [];
    if (!prepIds.length) return;
    const hasPrep = prepIds.some((id) => ["camp", "forge"].includes(draftNodes[id]?.type));
    if (hasPrep) return;
    const target = [...prepIds].sort((a, b) => Math.abs((draftNodes[a]?.lane ?? 2) - 2) - Math.abs((draftNodes[b]?.lane ?? 2) - 2))[0];
    if (target) {
      draftNodes[target].type = currentWorldMapNumber >= 4 ? "forge" : "camp";
    }
  }

  function enforceOptionalElite(stageIds, draftNodes) {
    const midStages = stageIds.slice(1, stageIds.length - 1);
    const hasOptionalElite = midStages.some((ids) => ids.length >= 2 && ids.some((id) => draftNodes[id]?.type === "elite") && ids.some((id) => draftNodes[id]?.type !== "elite"));
    if (hasOptionalElite) return;
    const candidateStage = midStages.find((ids) => ids.length >= 2);
    if (!candidateStage) return;
    const target = [...candidateStage].sort((a, b) => Math.abs((draftNodes[b]?.lane ?? 2) - 2) - Math.abs((draftNodes[a]?.lane ?? 2) - 2))[0];
    if (target) {
      draftNodes[target].type = "elite";
    }
  }

  function stageDesiredOutgoing(stageIndex, currentCount, nextCount) {
    if (stageIndex === 0) return Math.min(2, nextCount);
    if (stageIndex <= 1) return Math.min(2, nextCount);
    if (stageIndex === 2) return Math.min(currentCount >= 3 ? 2 : 1, nextCount);
    return 1;
  }

  function relabelDraftNodes(stageIds, draftNodes) {
    stageIds.flat().forEach((nodeId, idx) => {
      const type = draftNodes[nodeId].type;
      const stageNum = Number((nodeId.match(/^s(\d+)_/) || [])[1] || 0);
      draftNodes[nodeId].label = `${encounterLabel(type)} ${stageNum || (idx + 1)}`;
      draftNodes[nodeId].dealerKey = dealerKeyForEncounterType(type);
    });
  }

  function buildYAnchors(count) {
    if (count <= 1) {
      return [50];
    }
    const anchors = [];
    const minY = 22;
    const maxY = 78;
    const step = (maxY - minY) / (count - 1);
    for (let i = 0; i < count; i += 1) {
      anchors.push(minY + (i * step));
    }
    return anchors;
  }

  function laneIndicesForCount(count) {
    const laneCount = 5;
    const clamped = Math.max(1, Math.min(count, laneCount));
    const start = Math.floor((laneCount - clamped) / 2);
    return Array.from({ length: clamped }, (_v, i) => start + i);
  }

  function dealerKeyForEncounterType(type) {
    if (type === "camp") return "safe";
    if (type === "forge") return "safe";
    if (type === "risk") return pickOne(["chaotic", "aggressive"]);
    if (type === "vault") return "safe";
    if (type === "trial") return pickOne(["lucky", "aggressive"]);
    if (type === "elite") return pickOne(["chaotic", "lucky", "aggressive"]);
    if (type === "boss") return pickOne(["chaotic", "lucky", "aggressive"]);
    return pickOne(["safe", "aggressive"]);
  }

  function mapLayoutIsFullyConnected(stageIds, edges) {
    if (!stageIds.length) {
      return false;
    }
    const startId = stageIds[0]?.[0];
    const endIds = stageIds[stageIds.length - 1] || [];
    if (!startId || !endIds.length) {
      return false;
    }

    const forward = new Map();
    const backward = new Map();
    edges.forEach(([from, to]) => {
      if (!forward.has(from)) {
        forward.set(from, []);
      }
      if (!backward.has(to)) {
        backward.set(to, []);
      }
      forward.get(from).push(to);
      backward.get(to).push(from);
    });

    const reachableFromStart = new Set();
    const stack = [startId];
    while (stack.length) {
      const nodeId = stack.pop();
      if (reachableFromStart.has(nodeId)) {
        continue;
      }
      reachableFromStart.add(nodeId);
      (forward.get(nodeId) || []).forEach((nextId) => {
        if (!reachableFromStart.has(nextId)) {
          stack.push(nextId);
        }
      });
    }

    const canReachEnd = new Set();
    const reverseStack = [...endIds];
    while (reverseStack.length) {
      const nodeId = reverseStack.pop();
      if (canReachEnd.has(nodeId)) {
        continue;
      }
      canReachEnd.add(nodeId);
      (backward.get(nodeId) || []).forEach((prevId) => {
        if (!canReachEnd.has(prevId)) {
          reverseStack.push(prevId);
        }
      });
    }

    return stageIds.flat().every((nodeId) => reachableFromStart.has(nodeId) && canReachEnd.has(nodeId));
  }

  function generateRandomMapLayout() {
    let builtNodes = {};
    let builtEdges = [];
    const profile = currentMapGenerationProfile();

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const stageCounts = buildStageNodeCounts(profile);
      const stageIds = [];
      const draftNodes = {};
      const draftEdges = [];

      for (let stage = 0; stage < MAP_BALANCE.TOTAL_ENCOUNTERS; stage += 1) {
        const count = stageCounts[stage] || 1;
        const xBase = 8 + (stage * (84 / (MAP_BALANCE.TOTAL_ENCOUNTERS - 1)));
        const yAnchors = buildYAnchors(count);
        const laneIdxs = laneIndicesForCount(count);
        const ids = [];
        for (let idx = 0; idx < count; idx += 1) {
          const nodeId = `s${stage + 1}_${idx + 1}`;
          ids.push(nodeId);
          const type = stage === 0 ? "fight" : stage === MAP_BALANCE.TOTAL_ENCOUNTERS - 1 ? "boss" : "fight";
          const label = stage === 0
            ? "Opening Fight"
            : stage === MAP_BALANCE.TOTAL_ENCOUNTERS - 1
              ? "Final Boss"
              : `${encounterLabel(type)} ${stage + 1}`;
          const dealerKey = stage === 0 ? "classic" : dealerKeyForEncounterType(type);
          draftNodes[nodeId] = {
            id: nodeId,
            x: jitter(xBase, 1.8, 6, 94),
            y: jitter(yAnchors[idx] ?? 50, 1.6, 14, 86),
            lane: laneIdxs[idx] ?? 2,
            type,
            label,
            dealerKey
          };
        }
        stageIds.push(ids);
      }

      stageIds.slice(1, stageIds.length - 1).forEach((ids, stageIndex) => {
        const plannedTypes = profile.stagePlans?.[stageIndex + 1] || [];
        const assigned = assignStageNodeTypes(ids, draftNodes, plannedTypes);
        ids.forEach((nodeId, idx) => {
          const type = assigned.get(nodeId) || "fight";
          draftNodes[nodeId].type = type;
          const stageNum = Number((nodeId.match(/^s(\d+)_/) || [])[1] || 0);
          draftNodes[nodeId].label = `${encounterLabel(type)} ${stageNum || (idx + 1)}`;
          draftNodes[nodeId].dealerKey = dealerKeyForEncounterType(type);
        });
      });

      enforceMapRoleCoverage(stageIds, draftNodes);
      enforceBossPrepStage(stageIds, draftNodes);
      enforceOptionalElite(stageIds, draftNodes);
      relabelDraftNodes(stageIds, draftNodes);

      for (let stage = 0; stage < stageIds.length - 1; stage += 1) {
        const current = stageIds[stage];
        const next = stageIds[stage + 1];
        const edgeSet = new Set();
        const incomingCounts = new Map(next.map((id) => [id, 0]));
        const outgoingCounts = new Map(current.map((id) => [id, 0]));
        const outgoingTargets = new Map(current.map((id) => [id, new Set()]));

        function canAddEdge(_fromId, toId) {
          const currentIncoming = incomingCounts.get(toId) || 0;
          return currentIncoming < MAP_BALANCE.MAX_INCOMING_PER_NODE;
        }

        function addEdge(fromId, toId) {
          const key = `${fromId}|${toId}`;
          if (edgeSet.has(key) || !canAddEdge(fromId, toId)) {
            return false;
          }
          edgeSet.add(key);
          incomingCounts.set(toId, (incomingCounts.get(toId) || 0) + 1);
          outgoingCounts.set(fromId, (outgoingCounts.get(fromId) || 0) + 1);
          if (outgoingTargets.has(fromId)) {
            outgoingTargets.get(fromId).add(toId);
          }
          return true;
        }

        function removeEdge(fromId, toId) {
          const key = `${fromId}|${toId}`;
          if (!edgeSet.has(key)) {
            return false;
          }
          edgeSet.delete(key);
          incomingCounts.set(toId, Math.max(0, (incomingCounts.get(toId) || 0) - 1));
          outgoingCounts.set(fromId, Math.max(0, (outgoingCounts.get(fromId) || 0) - 1));
          if (outgoingTargets.has(fromId)) {
            outgoingTargets.get(fromId).delete(toId);
          }
          return true;
        }

        function laneDistance(fromId, toId) {
          const fromLane = draftNodes[fromId]?.lane ?? 2;
          const toLane = draftNodes[toId]?.lane ?? 2;
          return Math.abs(fromLane - toLane);
        }

        current.forEach((fromId) => {
          const nearPool = [...next].filter((toId) => laneDistance(fromId, toId) <= MAP_BALANCE.MAX_LANE_DELTA_PER_EDGE);
          const poolBase = nearPool.length ? nearPool : [...next];
          const pool = poolBase.sort((a, b) => {
            const da = laneDistance(fromId, a);
            const db = laneDistance(fromId, b);
            if (da !== db) {
              return da - db;
            }
            return (incomingCounts.get(a) || 0) - (incomingCounts.get(b) || 0);
          });
          const candidates = pool.filter((toId) => canAddEdge(fromId, toId));
          const choice = candidates.length ? pickOne(candidates) : null;
          if (choice) {
            addEdge(fromId, choice);
          }
        });

        current.forEach((fromId) => {
          const maxOut = Math.min(MAP_BALANCE.MAX_OUTGOING_PER_NODE, next.length);
          const desiredOut = Math.max(
            MAP_BALANCE.MIN_OUTGOING_PER_NODE,
            Math.min(maxOut, stageDesiredOutgoing(stage, current.length, next.length))
          );
          while ((outgoingCounts.get(fromId) || 0) < desiredOut) {
            const nearPool = [...next].filter((toId) => laneDistance(fromId, toId) <= MAP_BALANCE.MAX_LANE_DELTA_PER_EDGE);
            const poolBase = nearPool.length ? nearPool : [...next];
            const pool = poolBase
              .filter((toId) => canAddEdge(fromId, toId) && !edgeSet.has(`${fromId}|${toId}`))
              .sort((a, b) => laneDistance(fromId, a) - laneDistance(fromId, b));
            if (!pool.length) {
              break;
            }
            addEdge(fromId, pickOne(pool));
          }
        });

        next.forEach((toId) => {
          const hasIncoming = (incomingCounts.get(toId) || 0) > 0;
          if (!hasIncoming) {
            const sourcePool = [...current]
              .filter((fromId) => (outgoingCounts.get(fromId) || 0) < MAP_BALANCE.MAX_OUTGOING_PER_NODE)
              .sort((a, b) => (outgoingCounts.get(a) || 0) - (outgoingCounts.get(b) || 0));
            if (sourcePool.length) {
              addEdge(sourcePool[0], toId);
              return;
            }

            const donors = [...current].filter((fromId) => (outgoingCounts.get(fromId) || 0) > MAP_BALANCE.MIN_OUTGOING_PER_NODE);
            for (const donor of donors) {
              const donorTargets = [...(outgoingTargets.get(donor) || [])];
              const donorTarget = donorTargets.find((candidateTo) => (incomingCounts.get(candidateTo) || 0) > 1 && candidateTo !== toId);
              if (!donorTarget) {
                continue;
              }
              if (removeEdge(donor, donorTarget) && addEdge(donor, toId)) {
                return;
              }
              addEdge(donor, donorTarget);
            }
          }
        });

        Array.from(edgeSet).forEach((key) => {
          const [from, to] = key.split("|");
          draftEdges.push([from, to]);
        });
      }

      if (mapLayoutIsFullyConnected(stageIds, draftEdges)) {
        builtNodes = draftNodes;
        builtEdges = draftEdges;
        break;
      }

      builtNodes = draftNodes;
      builtEdges = draftEdges;
    }

    mapNodes = builtNodes;
    mapEdges = builtEdges;
  }

  function nextMapNodeIds(nodeId) {
    return mapEdges
      .filter(([from]) => from === nodeId)
      .map(([, to]) => to);
  }

  function routePriorityScore(nodeId) {
    const node = mapNodes[nodeId];
    if (!node) return 0;
    let score = 0;
    if (runLives <= 3) {
      if (node.type === "camp") score += 8;
      if (node.type === "forge") score += 4;
      if (node.type === "vault") score += 2;
      if (["risk", "trial", "elite"].includes(node.type)) score -= 4;
    }
    if (runCash >= 1800) {
      if (["risk", "vault", "elite"].includes(node.type)) score += 3;
      if (node.type === "camp") score -= 1;
    }
    if (currentWorldMapNumber >= 4) {
      if (node.type === "forge") score += 2;
      if (node.type === "camp") score += 1;
    }
    return score;
  }

  const MAP_STAGE_LABELS = ["Entry", "Fork", "Pressure", "Pivot", "Prep", "Boss"];

  function mapStageIndex(nodeId) {
    return Math.max(1, Number((String(nodeId || "").match(/^s(\d+)_/) || [])[1] || 1));
  }

  function routeNodeHint(type) {
    if (type === "fight") return "Baseline table. Safest way to keep the run moving and collect normal cash.";
    if (type === "elite") return "Two-round pressure fight. Better payout, sharper dealer logic.";
    if (type === "boss") return "Three-round checkpoint with exclusive boss rewards.";
    if (type === "camp") return "Recovery stop. Opens the shop and restores lives.";
    if (type === "forge") return "Training and fusion stop. No normal shop roll here.";
    if (type === "risk") return "Immediate power and money, but the downside lands right away.";
    if (type === "vault") return "Big cash spike with cursed cards or danger attached.";
    if (type === "trial") return "Skill check that pays out rare rewards if you clear it clean.";
    return "The House put something here.";
  }

  function routeNodeRewardHint(type) {
    if (type === "fight") return "Normal cash";
    if (type === "elite") return "1.5x cash";
    if (type === "boss") return "Exclusive boss drop";
    if (type === "camp") return "Heal + shop";
    if (type === "forge") return "Training / fusion";
    if (type === "risk") return "Power spike";
    if (type === "vault") return "Cash vault";
    if (type === "trial") return "Rare reward";
    return "Unknown";
  }

  function renderRouteChoices() {
    if (!routeChoicesEl) {
      return;
    }

    const edgeLines = mapEdges.map(([from, to]) => {
      const a = mapNodes[from];
      const b = mapNodes[to];
      const active = offeredRoutes.some((route) => route.nodeId === to);
      const selected = pendingMapNodeId === to;
      const fromCurrent = from === currentMapNodeId;
      const cls = selected
        ? "route-line selected"
        : (active || fromCurrent)
          ? "route-line active"
          : "route-line muted";
      return `<polyline class="${cls}" points="${a.x},${a.y} ${b.x},${b.y}"></polyline>`;
    }).join("");

    const stageGuides = Array.from({ length: MAP_BALANCE.TOTAL_ENCOUNTERS }, (_v, i) => {
      const x = 8 + (i * (84 / (MAP_BALANCE.TOTAL_ENCOUNTERS - 1)));
      return `<line class="stage-guide" x1="${x}" y1="6" x2="${x}" y2="94"></line>`;
    }).join("");

    const nodeHtml = Object.values(mapNodes).map((node) => {
      const isCurrent = node.id === currentMapNodeId;
      const isSelected = node.id === pendingMapNodeId;
      const isAvailable = offeredRoutes.some((route) => route.nodeId === node.id);
      const isCompleted = completedMapNodeIds.includes(node.id);
      const isDim = !isCurrent && !isSelected && !isAvailable && !isCompleted;
      const cls = [
        "enc-node",
        `enc-${node.type}`,
        isCurrent ? "current" : "",
        isSelected ? "selected" : "",
        isAvailable ? "available" : "",
        isCompleted ? "completed" : "",
        isDim ? "dimmed" : ""
      ].filter(Boolean).join(" ");
      const content = `${encounterIcon(node.type)}`;
      if (isAvailable) {
        return `
          <button class="${cls}" type="button" data-node-id="${node.id}" style="left:${node.x}%; top:${node.y}%;" title="${node.label} (${encounterLabel(node.type)})">${content}</button>
        `;
      }
      return `
        <span class="${cls}" style="left:${node.x}%; top:${node.y}%;" title="${node.label} (${encounterLabel(node.type)})">${content}</span>
      `;
    }).join("");

    const labelHtml = Object.values(mapNodes).map((node) => {
      const isCurrent = node.id === currentMapNodeId;
      const isSelected = node.id === pendingMapNodeId;
      const isAvailable = offeredRoutes.some((route) => route.nodeId === node.id);
      if (!isCurrent && !isSelected && !isAvailable) {
        return "";
      }
      const cls = [
        "route-label",
        isCurrent ? "current" : "",
        isSelected ? "selected" : "",
        isAvailable ? "available" : ""
      ].filter(Boolean).join(" ");
      return `
        <span class="${cls}" style="left:${node.x}%; top:calc(${node.y}% - 34px);">${node.label}</span>
      `;
    }).join("");

    const optionCards = offeredRoutes.map((route, index) => {
      const node = mapNodes[route.nodeId];
      const selected = pendingMapNodeId === route.nodeId;
      const futureText = route.future.length ? route.future.join(" -> ") : "Boss endpoint";
      return `
        <button class="map-route-option${selected ? " selected" : ""}" type="button" data-node-id="${route.nodeId}">
          <div class="map-route-option-top">
            <span class="map-route-option-index">${index + 1}</span>
            <span class="map-route-option-type">${encounterIcon(node.type)} ${encounterLabel(node.type)}</span>
            <span class="map-route-option-state">${selected ? "Locked" : "Open"}</span>
          </div>
          <strong class="map-route-option-title">${escapeHtml(node.label)}</strong>
          <span class="map-route-option-profile">${escapeHtml(route.profile.name)} · ${escapeHtml(routeRiskLabel(route.profile.key))}</span>
          <span class="map-route-option-copy">${escapeHtml(routeNodeHint(node.type))}</span>
          <div class="map-route-option-tags">
            <em>${escapeHtml(routeNodeRewardHint(node.type))}</em>
            <em>${escapeHtml(routeRiskLabel(route.profile.key))}</em>
          </div>
          <small class="map-route-option-future">${escapeHtml(futureText)}</small>
        </button>
      `;
    }).join("");

    const currentNode = mapNodes[currentMapNodeId];
    const selectedNode = pendingMapNodeId ? mapNodes[pendingMapNodeId] : null;
    const currentStage = mapStageIndex(currentMapNodeId);
    const stageStrip = Array.from({ length: MAP_BALANCE.TOTAL_ENCOUNTERS }, (_v, index) => {
      const stage = index + 1;
      const cls = [
        "battle-stage-chip",
        stage < currentStage ? "passed" : "",
        stage === currentStage ? "current" : "",
        selectedNode && mapStageIndex(selectedNode.id) === stage ? "selected" : ""
      ].filter(Boolean).join(" ");
      return `
        <div class="${cls}">
          <span>Stage ${stage}</span>
          <strong>${MAP_STAGE_LABELS[index] || `Step ${stage}`}</strong>
        </div>
      `;
    }).join("");

    const focusNode = selectedNode || currentNode;
    const focusProfile = selectedNode
      ? (offeredRoutes.find((route) => route.nodeId === selectedNode.id)?.profile || dealerProfiles[0])
      : null;
    const focusFuture = selectedNode
      ? (offeredRoutes.find((route) => route.nodeId === selectedNode.id)?.future || [])
      : nextMapNodeIds(currentMapNodeId).map((id) => mapNodes[id]?.label).filter(Boolean);

    routeChoicesEl.innerHTML = `
      <div class="battle-map-layout">
        <section class="battle-map-board">
          <div class="battle-map-stage-strip" aria-hidden="true">
            ${stageStrip}
          </div>
          <div class="world-map-scroll">
            <div class="world-map-canvas" aria-label="Branching encounter map">
              <svg class="world-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                ${stageGuides}
                ${edgeLines}
              </svg>
              <div class="world-map-nodes">${nodeHtml}</div>
              <div class="world-map-labels">${labelHtml}</div>
            </div>
          </div>
        </section>
        <aside class="battle-map-side">
          <article class="battle-map-focus">
            <span class="battle-map-focus-kicker">Map ${currentWorldMapNumber}/5 · Stage ${mapStageIndex(focusNode?.id || currentMapNodeId)}</span>
            <strong>${escapeHtml(selectedNode ? `Locked: ${focusNode?.label || "Unknown Node"}` : `Current: ${focusNode?.label || "Unknown Node"}`)}</strong>
            <p>${escapeHtml(selectedNode ? routeNodeHint(focusNode?.type) : "Choose the next route from the live branches below. You can still switch before confirming.")}</p>
            <div class="battle-map-focus-tags">
              <em>${encounterIcon(focusNode?.type || "fight")} ${escapeHtml(encounterLabel(focusNode?.type || "fight"))}</em>
              <em>${escapeHtml(routeNodeRewardHint(focusNode?.type || "fight"))}</em>
              ${focusProfile ? `<em>${escapeHtml(focusProfile.name)}</em>` : ""}
            </div>
            <small>${escapeHtml(focusFuture.length ? `After this: ${focusFuture.join(" -> ")}` : "This branch ends at the boss door.")}</small>
          </article>
          <div class="map-route-option-list" aria-label="Next direction options">
            ${optionCards || '<span class="route-option-empty">No available directions.</span>'}
          </div>
        </aside>
      </div>
    `;
  }

  function buildBattleRoutes() {
    if (originalMode || tablesPlayed < 1) {
      offeredRoutes = [];
      waitingForMapChoice = false;
      nextDealerChoiceKey = null;
      if (routeStatusEl) {
        routeStatusEl.textContent = originalMode
          ? "Battle map disabled in Original mode."
          : `Win the first table to unlock the battle map. Current map: ${currentWorldMapNumber}/5.`;
      }
      if (futurePreviewEl) {
        futurePreviewEl.textContent = "Future encounters will be shown here.";
      }
      renderRouteChoices();
      return;
    }

    if (!Object.keys(mapNodes).length || !mapEdges.length) {
      generateRandomMapLayout();
    }

    let nextIds = nextMapNodeIds(currentMapNodeId);
    if (!nextIds.length) {
      currentWorldMapNumber = Math.min(5, currentWorldMapNumber + 1);
      updateBlackjackProgress({ highestMapReached: Math.max(blackjackProgress.highestMapReached, currentWorldMapNumber) });
      generateRandomMapLayout();
      currentMapNodeId = "s1_1";
      pendingMapNodeId = null;
      completedMapNodeIds = ["s1_1"];
      nextIds = nextMapNodeIds(currentMapNodeId);
      if (routeStatusEl) {
        routeStatusEl.textContent = currentWorldMapNumber >= 5
          ? "Map 5/5 reached. Final boss route is now active."
          : `Map ${currentWorldMapNumber}/5 started. New random branch cycle generated.`;
      }
    }

    if (nextIds.length > currentMapChoiceCap()) {
      nextIds = [...nextIds]
        .sort((a, b) => {
          const scoreDiff = routePriorityScore(b) - routePriorityScore(a);
          if (scoreDiff !== 0) return scoreDiff;
          return Math.random() - 0.5;
        })
        .slice(0, currentMapChoiceCap());
    }

    offeredRoutes = nextIds.map((nodeId) => {
      const node = mapNodes[nodeId];
      const profile = dealerProfiles.find((d) => d.key === node.dealerKey) || dealerProfiles[0];
      const after = nextMapNodeIds(nodeId).map((id) => mapNodes[id].label);
      return { nodeId, profile, future: after };
    });

    waitingForMapChoice = offeredRoutes.length > 0;
    updateBlackjackProgress({ highestMapReached: Math.max(blackjackProgress.highestMapReached, currentWorldMapNumber) });
    nextDealerChoiceKey = null;
    if (routeStatusEl && waitingForMapChoice) {
      routeStatusEl.textContent = `Map ${currentWorldMapNumber}/5. Current node: ${mapNodes[currentMapNodeId].label}. Choose next direction.`;
    }
    if (futurePreviewEl) {
      futurePreviewEl.textContent = waitingForMapChoice
        ? "Direction is chosen after every encounter."
        : "No available direction from this node.";
    }
    renderRouteChoices();
    updateMapPopupUI();
  }

  function chooseBattleRoute(nodeId) {
    const picked = offeredRoutes.find((route) => route.nodeId === nodeId);
    if (!picked) {
      return;
    }
    pendingMapNodeId = picked.nodeId;
    nextDealerChoiceKey = picked.profile.key;
    waitingForMapChoice = true;
    if (routeStatusEl) {
      routeStatusEl.textContent = `Direction locked: ${mapNodes[picked.nodeId].label}.`;
    }
    if (futurePreviewEl) {
      const futureText = picked.future.length ? picked.future.join(" -> ") : "Boss endpoint";
      futurePreviewEl.textContent = `Selected path: ${futureText}. You can switch before starting next table.`;
    }
    renderRouteChoices();
    updateActionButtons();
    updateMapPopupUI();
    saveBlackjackCheckpoint();
    setStatus(`Direction selected: ${mapNodes[picked.nodeId].label}. You can still switch before Start Next Table.`);
  }

  function updateMapPopupUI() {
    if (!battleMapEl) {
      return;
    }
    const shouldShow = !originalMode && !waitingForShopChoice && (waitingForMapChoice || mapPreviewOpen);
    battleMapEl.classList.toggle("hidden", !shouldShow);
    if (confirmRouteBtn) {
      confirmRouteBtn.disabled = !shouldShow || !waitingForMapChoice || !pendingMapNodeId;
    }
    if (closeMapBtn) {
      closeMapBtn.disabled = !shouldShow || (waitingForMapChoice && !mapPreviewOpen);
    }
    updateAdviceText(false);
  }

  function addDeckRank(targetDeck, rank, count = 1) {
    for (let i = 0; i < count; i += 1) {
      const suit = suits[Math.floor(Math.random() * suits.length)];
      targetDeck.push({ suit, rank });
    }
  }

  function removeDeckRank(targetDeck, rank, count = 1) {
    for (let i = 0; i < count; i += 1) {
      const idx = targetDeck.findIndex((card) => card.rank === rank);
      if (idx >= 0) {
        targetDeck.splice(idx, 1);
      }
    }
  }

  function applyTitleDeckEffect(targetDeck) {
    currentTitleMetas().forEach((meta) => meta.applyDeck?.(targetDeck));
  }

  function buildDeck() {
    const newDeck = [];
    for (let deckIndex = 0; deckIndex < DECK_COUNT; deckIndex += 1) {
      for (const suit of suits) {
        for (const rank of ranks) {
          newDeck.push({ suit, rank });
        }
      }
    }
    const tutorialOpeningFight = !originalMode && currentMapNodeId === "s1_1";
    if (tutorialOpeningFight) {
      // Soften early high-rolls on the first map by trimming some blackjack density.
      let removedAces = 0;
      let removedTenValues = 0;
      for (let i = newDeck.length - 1; i >= 0; i -= 1) {
        const card = newDeck[i];
        const isTenValue = card.rank === "10" || card.rank === "J" || card.rank === "Q" || card.rank === "K";
        if (card.rank === "A" && removedAces < 2) {
          newDeck.splice(i, 1);
          removedAces += 1;
          continue;
        }
        if (isTenValue && removedTenValues < 6) {
          newDeck.splice(i, 1);
          removedTenValues += 1;
        }
        if (removedAces >= 2 && removedTenValues >= 6) {
          break;
        }
      }
    }
    applyTitleDeckEffect(newDeck);
    applyRunCurseDeckEffects(newDeck);
    for (let i = newDeck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    if (hasPassive("thin-deck")) {
      for (let i = 0; i < (5 * passiveCount("thin-deck")) && newDeck.length > 20; i += 1) {
        const idx = Math.floor(Math.random() * newDeck.length);
        newDeck.splice(idx, 1);
      }
    }
    return newDeck;
  }

  function maybeApplyShopModifier(card, owner = "generic") {
    if (!card || originalMode || owner !== "player" || tablesPlayed < 1) {
      return card;
    }
    if (card.forcedShopKey && SHOP_CARDS[card.forcedShopKey]) {
      const forced = SHOP_CARDS[card.forcedShopKey];
      return {
        ...card,
        shopKey: card.forcedShopKey,
        shopLabel: forced.label,
        shopValue: forced.value,
        volatileValue: card.forcedShopKey === "volatile-card" ? (1 + Math.floor(Math.random() * 11)) : null,
        valueAdjust: 0
      };
    }
    const selected = weightedSelectedShopCardKeys();
    if (!selected.length) {
      return card;
    }
    const triggerChance = Math.min(0.28, 0.07 * selected.length);
    if (Math.random() >= triggerChance) {
      return card;
    }
    const key = selected[Math.floor(Math.random() * selected.length)];
    if (passiveCount("deck-polish") > passiveState["deck-polish-used"] && SHOP_CARDS[key]?.type === "risk") {
      passiveState["deck-polish-used"] += 1;
      return card;
    }
    const shopCard = SHOP_CARDS[key];
    return {
      ...card,
      shopKey: key,
      shopLabel: shopCard.label,
      shopValue: shopCard.value,
      volatileValue: key === "volatile-card" ? (1 + Math.floor(Math.random() * 11)) : null,
      valueAdjust: 0
    };
  }

  function maybeApplyDealerModifier(card, owner = "generic") {
    if (!card || originalMode || owner !== "dealer" || tablesPlayed < 1) {
      return card;
    }
    const applyDealerSpecialCard = (specialCard, key, sourceLabel) => {
      if (passiveCount("smoke-mirror") > passiveState["smoke-mirror-used"]) {
        passiveState["smoke-mirror-used"] += 1;
        if (tableActive) {
          pushCombatLog(`Smoke Mirror scrubbed ${DEALER_SPECIAL_CARDS[key].label} before it landed.`);
        }
        return specialCard;
      }
      if (tableActive) {
        pushCombatLog(`${DEALER_SPECIAL_CARDS[key].label} was placed on a dealer draw${sourceLabel ? ` from ${sourceLabel}` : ""}.`);
      }
      return {
        ...specialCard,
        dealerSpecialKey: key,
        dealerSpecialLabel: DEALER_SPECIAL_CARDS[key].label
      };
    };
    if (currentSpecialNodeType === "boss" && dealerBossSignatureQueue.length) {
      const key = dealerBossSignatureQueue.shift();
      return applyDealerSpecialCard(card, key, currentEncounterRule?.label || "boss pressure");
    }
    if (currentSpecialNodeType === "elite" && dealerEliteSignatureQueue.length) {
      const key = dealerEliteSignatureQueue.shift();
      return applyDealerSpecialCard(card, key, currentEncounterRule?.label || "elite pressure");
    }
    if (currentSpecialNodeType === "fight" && currentNormalMonster && dealerSignatureCardsRemaining > 0) {
      dealerSignatureCardsRemaining -= 1;
      const key = currentNormalMonster.signatureCardKey;
      return applyDealerSpecialCard(card, key, currentNormalMonster.name);
    }
    const triggerChance = tableDealerProfile === "chaotic"
      ? 0.16
      : tableDealerProfile === "aggressive"
        ? 0.13
        : 0.09;
    if (Math.random() >= triggerChance) {
      return card;
    }
    const key = pickOne(Object.keys(DEALER_SPECIAL_CARDS));
    return applyDealerSpecialCard(card, key, "the dealer profile");
  }

  function drawCard(owner = "generic") {
    if (!deck.length) {
      deck = buildDeck();
      runningCount = 0;
      updateCountHelperUI();
    }
    const baseDrawn = normalizeCard(deck.pop());
    const drawn = owner === "dealer"
      ? maybeApplyDealerModifier(baseDrawn, owner)
      : maybeApplyShopModifier(baseDrawn, owner);
    updateDeckCounterInfo();
    return drawn;
  }

  function currentEncounterStage() {
    const node = mapNodes[currentMapNodeId];
    const stage = Number((node?.id?.match(/^s(\d+)_/) || [])[1] || 1);
    return Math.max(1, stage);
  }

  function eliteAbilityTriggerChance() {
    const stageBonus = Math.max(0, currentEncounterStage() - 2) * 0.04;
    return Math.min(0.1, 0.035 + (stageBonus * 0.22));
  }

  function currentBossRoundNumber() {
    return Math.min(3, currentBossRoundsCleared + 1);
  }

  function currentEliteRoundNumber() {
    return Math.min(2, currentEliteRoundsPlayed + 1);
  }

  function bossAbilityTriggerChance() {
    return Math.min(0.12, 0.05 + ((currentBossRoundNumber() - 1) * 0.025));
  }

  function maybeTriggerEliteAbility(action) {
    if (originalMode || currentSpecialNodeType !== "elite" || !currentEncounterRule || !tableActive || roundOver) {
      return "";
    }
    const hand = tableHands[activeHandIndex];
    const handState = hand ? ensureHandState(hand) : null;
    if (!handState || handState.eliteAbilityUsed) {
      return "";
    }
    if (Math.random() >= eliteAbilityTriggerChance()) {
      return "";
    }
    handState.eliteAbilityUsed = true;
    if (currentEncounterRule.abilityKey === "house-tax") {
      tableNet -= 15;
      return `${currentEncounterRule.label} used House Tax. Lose $15 from the table.`;
    }
    if (currentEncounterRule.abilityKey === "sleeve-heat") {
      dealerEliteSignatureQueue.push("dealer-burn-card");
      return `${currentEncounterRule.label} used Sleeve Heat. Another Dealer Burn was seeded.`;
    }
    if (currentEncounterRule.abilityKey === "pain-mark") {
      handState.extraLossPenalty += 15;
      return `${currentEncounterRule.label} used Pain Mark. This hand now loses an extra $15 if it fails.`;
    }
    if (currentEncounterRule.abilityKey === "forced-push") {
      dealerEliteSignatureQueue.push("dealer-push-card");
      return `${currentEncounterRule.label} used Forced Push. Another Dealer Push was seeded.`;
    }
    if (currentEncounterRule.abilityKey === "seal-table") {
      dealerEliteSignatureQueue.push("dealer-lock-card");
      return `${currentEncounterRule.label} used Seal Table. Another Dealer Lock was seeded.`;
    }
    if (currentEncounterRule.abilityKey === "raise-penalty") {
      const penalty = action === "double" ? 24 : 12;
      handState.extraLossPenalty += penalty;
      return `${currentEncounterRule.label} used Raise Penalty. This hand now loses an extra $${penalty} if it fails.`;
    }
    if (currentEncounterRule.abilityKey === "loaded-burn") {
      dealerEliteSignatureQueue.push("dealer-burn-card");
      return `${currentEncounterRule.label} used Loaded Burn. Another Dealer Burn was seeded.`;
    }
    return "";
  }

  function maybeTriggerBossAbility(action) {
    if (originalMode || currentSpecialNodeType !== "boss" || !currentEncounterRule || !tableActive || roundOver) {
      return "";
    }
    const hand = tableHands[activeHandIndex];
    const handState = hand ? ensureHandState(hand) : null;
    if (!handState || handState.bossAbilityUsed || Math.random() >= bossAbilityTriggerChance()) {
      return "";
    }
    handState.bossAbilityUsed = true;
    const abilityPool = currentEncounterRule.abilityKeys || [];
    const abilityKey = abilityPool.length ? pickOne(abilityPool) : "";
    if (abilityKey === "house-tax") {
      tableNet -= 20;
      return `${currentEncounterRule.label} used House Tax. Lose $20 from the table.`;
    }
    if (abilityKey === "seal-table") {
      dealerBossSignatureQueue.push("dealer-lock-card");
      return `${currentEncounterRule.label} used Seal Table. Another Dealer Lock was seeded.`;
    }
    if (abilityKey === "forced-push") {
      dealerBossSignatureQueue.push("dealer-push-card");
      return `${currentEncounterRule.label} used Forced Push. Another Dealer Push was seeded.`;
    }
    if (abilityKey === "audit-drain") {
      tableNet -= 25;
      return `${currentEncounterRule.label} used Audit Drain. Lose $25 from the table.`;
    }
    if (abilityKey === "raise-penalty") {
      const penalty = action === "double" ? 30 : 15;
      handState.extraLossPenalty += penalty;
      return `${currentEncounterRule.label} used Raise Penalty. This hand now loses an extra $${penalty} if it fails.`;
    }
    if (abilityKey === "loaded-burn") {
      dealerBossSignatureQueue.push("dealer-burn-card");
      return `${currentEncounterRule.label} used Loaded Burn. Another Dealer Burn was seeded.`;
    }
    if (abilityKey === "cinder-mark") {
      handState.extraLossPenalty += 25;
      return `${currentEncounterRule.label} used Cinder Mark. This hand now loses an extra $25 if it fails.`;
    }
    return "";
  }

  function maybeTriggerBossSplitCull() {
    if (originalMode || currentSpecialNodeType !== "boss" || !tableActive || roundOver) {
      return "";
    }
    const roundNumber = currentBossRoundNumber();
    if (roundNumber % 2 !== 0 || currentBossSplitCullRound === roundNumber) {
      return "";
    }
    const candidates = tableHands
      .map((hand, index) => ({ hand, index }))
      .filter(({ hand, index }) => hand.fromSplit && hand.state === "playing" && index !== activeHandIndex);
    if (!candidates.length) {
      return "";
    }
    const picked = pickOne(candidates);
    const handState = ensureHandState(picked.hand);
    let lossAmount = Math.round((tableBetLocked * (picked.hand.betMultiplier || 1) * eventBetMultiplier()) + (handState.extraLossPenalty || 0));
    if (activeTools["chip-shield"] > 0) {
      lossAmount = Math.round(lossAmount / 2);
      activeTools["chip-shield"] -= 1;
    }
    picked.hand.state = "completed";
    picked.hand.result = "loss";
    picked.hand.playerTotal = handTotal(picked.hand.cards);
    picked.hand.dealerTotal = null;
    tableNet -= lossAmount;
    currentBossSplitCullRound = roundNumber;
    renderHandBoard();
    updateActionButtons();
    return `${currentEncounterRule.label} executed split hand ${picked.index + 1}.`;
  }

  function applyPendingValueEffects(card, handState, baseTotalBeforeDraw) {
    if (!card || !handState) {
      return;
    }
    card.valueAdjust = card.valueAdjust || 0;
    if (handState.loadedBonusPending) {
      card.valueAdjust += handState.loadedBonusPending;
      handState.loadedBonusPending = 0;
    }
    if (handState.controlPending) {
      const controlRange = handState.controlRange || 2;
      const baseValue = card.shopKey === "volatile-card"
        ? (card.volatileValue || 1)
        : (card.shopValue ?? cardPoints(card.rank));
      card.valueAdjust += chooseControlledDelta(baseTotalBeforeDraw, baseValue + (card.valueAdjust || 0), controlRange);
      handState.controlPending = false;
      handState.controlRange = 2;
    }
    if (hasPassive("steady-hand") && !handState.steadyHandUsed) {
      const baseValue = card.shopKey === "volatile-card"
        ? (card.volatileValue || 1)
        : (card.shopValue ?? cardPoints(card.rank, card));
      card.valueAdjust += chooseControlledDelta(baseTotalBeforeDraw, baseValue + (card.valueAdjust || 0), passiveCount("steady-hand"));
      handState.steadyHandUsed = true;
    }
  }

  function scrubDealerSpecialCard() {
    const allDealerHands = dealerHandsPool.length ? dealerHandsPool : [dealerHand];
    for (const hand of allDealerHands) {
      for (const card of hand) {
        if (card?.dealerSpecialKey) {
          const removedLabel = card.dealerSpecialLabel || DEALER_SPECIAL_CARDS[card.dealerSpecialKey]?.label || "dealer special";
          delete card.dealerSpecialKey;
          delete card.dealerSpecialLabel;
          return removedLabel;
        }
      }
    }
    return "";
  }

  function saveOnePastCap(hand, handState) {
    if (!hand || !hand.cards?.length || !handState || handState.secondBreathCharges <= 0) {
      return false;
    }
    const total = handTotal(hand.cards);
    if (total !== currentBustLimit() + 1) {
      return false;
    }
    const lastCard = hand.cards[hand.cards.length - 1];
    if (!lastCard) {
      return false;
    }
    lastCard.valueAdjust = (lastCard.valueAdjust || 0) - 1;
    handState.secondBreathCharges -= 1;
    handState.secondBreathUsed = true;
    hand.state = "standing";
    hand.playerTotal = handTotal(hand.cards);
    hand.dealerTotal = null;
    hand.firstMove = false;
    return true;
  }

  function isOriginalComboCard(card) {
    return Boolean(
      card?.shopKey
      && SHOP_CARDS[card.shopKey]
      && SHOP_CARDS[card.shopKey].type !== "legendary"
      && !card.comboLocked
      && !(cardTraining[card.shopKey] > 0)
    );
  }

  function comboPairKey(a, b) {
    return [a, b].sort().join("::");
  }

  function rememberComboLabel(handState, label) {
    if (!label) {
      return;
    }
    handState.comboLabels = (handState.comboLabels || []).filter((entry) => entry !== label);
    handState.comboLabels.unshift(label);
    handState.comboLabels = handState.comboLabels.slice(0, 3);
  }

  function applyOriginalCardCombo(hand, handState, drawnCard) {
    if (!hand || !handState || !isOriginalComboCard(drawnCard)) {
      return [];
    }
    const messages = [];
    const partners = hand.cards.filter((card) => card !== drawnCard && isOriginalComboCard(card));
    partners.forEach((partner) => {
      const pairKey = comboPairKey(drawnCard.shopKey, partner.shopKey);
      if (handState.comboKeys[pairKey]) {
        return;
      }
      handState.comboKeys[pairKey] = true;
      drawnCard.comboLocked = true;
      partner.comboLocked = true;
      let label = "";
      let message = "";
      if (pairKey === comboPairKey("lucky-seven", "jackpot-card")) {
        label = "Lucky Jackpot";
        handState.twentyOneWinBonus += 75;
        message = "Lucky Jackpot formed: +$75 more on a winning 21.";
      } else if (pairKey === comboPairKey("mirror-card", "loaded-card")) {
        label = "Loaded Reflection";
        handState.loadedBonusPending += 3;
        handState.controlPending = true;
        handState.controlRange = Math.max(handState.controlRange || 2, 3);
        message = "Loaded Reflection formed: next draw gets +3 and stronger control.";
      } else if (pairKey === comboPairKey("marked-card", "peek-card")) {
        label = "Open Book";
        if (dealerHoleHidden && !dealerHoleCounted && dealerHand[1]) {
          addToRunningCount(dealerHand[1]);
          dealerHoleCounted = true;
        }
        dealerHoleHidden = false;
        handState.extraWinBonus += 15;
        message = "Open Book formed: the dealer hand is exposed and this hand gains +$15 on win.";
      } else if (pairKey === comboPairKey("golden-chip-card", "tax-eater")) {
        label = "Clean Profit";
        handState.taxRelief = true;
        handState.extraWinBonus += 40;
        message = "Clean Profit formed: ignore tax and gain +$40 on win.";
      } else if (pairKey === comboPairKey("chain-card", "dealer-freeze")) {
        label = "Cold Break";
        handState.dealerFreezeCharges += 1;
        const removed = scrubDealerSpecialCard();
        message = removed
          ? `Cold Break formed: froze one dealer draw and shattered ${removed}.`
          : "Cold Break formed: froze one dealer draw and destabilized the dealer.";
      } else if (pairKey === comboPairKey("blood-card", "debt-card")) {
        label = "Ruin Engine";
        handState.extraWinBonus += 60;
        handState.extraLossPenalty += 60;
        message = "Ruin Engine formed: +$60 on win, but lose an extra $60 on failure.";
      } else if (pairKey === comboPairKey("volatile-card", "mirror-card")) {
        label = "Feedback Loop";
        const swing = Math.random() < 0.5 ? -2 : 3;
        drawnCard.valueAdjust = (drawnCard.valueAdjust || 0) + swing;
        handState.extraLossPenalty += swing < 0 ? 10 : 0;
        message = swing < 0
          ? "Feedback Loop formed: this draw destabilized and the hand becomes riskier."
          : "Feedback Loop formed: the mirrored draw surged upward.";
      } else {
        const typePair = comboPairKey(SHOP_CARDS[drawnCard.shopKey].type, SHOP_CARDS[partner.shopKey].type);
        if (typePair === "risk-reward::risk-reward") {
          label = "Hot Hand";
          handState.extraWinBonus += 25;
          handState.twentyOneWinBonus += 25;
          message = "Hot Hand formed: +$25 on win and +$25 more on a winning 21.";
        } else if (typePair === "risk::risk") {
          label = "Crash Line";
          handState.loadedBonusPending += 2;
          handState.extraLossPenalty += 15;
          message = "Crash Line formed: next draw gets +2, but the hand loses an extra $15 if it fails.";
        } else if (typePair === "risk-reward::risk") {
          label = "Devil's Bargain";
          handState.extraWinBonus += 35;
          handState.extraLossPenalty += 20;
          message = "Devil's Bargain formed: stronger payout, harsher failure.";
        } else if (typePair === "risk-reward::utility") {
          label = "Rigged Edge";
          handState.extraWinBonus += 20;
          handState.controlPending = true;
          message = "Rigged Edge formed: +$20 on win and the next draw is nudged.";
        } else if (typePair === "risk::utility") {
          label = "Fault Line";
          handState.extraLossPenalty += 10;
          handState.controlPending = true;
          message = "Fault Line formed: the hand is shakier, but the next draw can be steered.";
        } else if (typePair === "utility::utility") {
          label = "Clean Link";
          handState.controlPending = true;
          handState.controlRange = Math.max(handState.controlRange || 2, 3);
          handState.extraWinBonus += 10;
          message = "Clean Link formed: the next draw is cleaner and the hand gains +$10 on win.";
        }
      }
      if (label && message) {
        rememberComboLabel(handState, label);
        messages.push(`${label}: ${message}`);
      }
    });
    return messages;
  }

  function applyImmediateShopCardEffect(card) {
    if (!card || !card.shopKey || !tableHands[activeHandIndex]) {
      return "";
    }
    const handState = activeHandState();
    const comboMessages = applyOriginalCardCombo(tableHands[activeHandIndex], handState, card);
    const appendCombo = (message) => [message, ...comboMessages].filter(Boolean).join(" ");
    if (card.shopKey === "blood-card") {
      const bonus = 50 + (trainingValue("blood-card") * 10);
      handState.extraWinBonus += bonus;
      handState.extraLossPenalty += bonus;
      return appendCombo(`Blood Card armed: +$${bonus} on win, -$${bonus} extra on loss.`);
    }
    if (card.shopKey === "dealer-bait") {
      handState.dealerBait = true;
      return appendCombo("Dealer Bait armed: dealer draws one extra card for this hand.");
    }
    if (card.shopKey === "loaded-card") {
      const loadBonus = 2 + Math.floor(trainingValue("loaded-card") / 2);
      handState.loadedBonusPending += loadBonus;
      return appendCombo(`Loaded Card armed: next drawn card gets +${loadBonus}.`);
    }
    if (card.shopKey === "jackpot-card") {
      const jackpotBonus = 100 + (trainingValue("jackpot-card") * 25);
      handState.twentyOneWinBonus += jackpotBonus;
      return appendCombo(`Jackpot Card armed: win on 21 for +$${jackpotBonus}.`);
    }
    if (card.shopKey === "marked-card") {
      if (dealerHoleHidden && !dealerHoleCounted && dealerHand[1]) {
        addToRunningCount(dealerHand[1]);
        dealerHoleCounted = true;
      }
      dealerHoleHidden = false;
      const nextDealerCard = deck[deck.length - 1];
      if (trainingValue("marked-card") > 0) {
        handState.extraWinBonus += trainingValue("marked-card") * 5;
      }
      return appendCombo(nextDealerCard
        ? `Marked Card used: hidden card revealed. Next dealer draw looks like ${nextDealerCard.rank} of ${nextDealerCard.suit}.`
        : "Marked Card used: hidden card revealed.");
    }
    if (card.shopKey === "chain-card") {
      const removed = scrubDealerSpecialCard();
      return appendCombo(removed
        ? `Chain Card shattered ${removed}.`
        : "Chain Card found no dealer special to break.");
    }
    if (card.shopKey === "second-breath") {
      handState.secondBreathCharges += 1;
      handState.extraWinBonus += trainingValue("second-breath") * 5;
      return appendCombo("Second Breath armed: bust by 1 once and stay alive.");
    }
    if (card.shopKey === "golden-chip-card") {
      const chipBonus = 25 + (trainingValue("golden-chip-card") * 10);
      handState.extraWinBonus += chipBonus;
      return appendCombo(`Golden Chip Card armed: +$${chipBonus} on win.`);
    }
    if (card.shopKey === "tax-eater") {
      handState.taxRelief = true;
      handState.extraWinBonus += trainingValue("tax-eater") * 5;
      return appendCombo("Tax Eater armed: this hand ignores Tax Table penalty.");
    }
    if (card.shopKey === "ace-anchor") {
      handState.aceAnchor = true;
      handState.flatLossReduction += 20 + (trainingValue("ace-anchor") * 5);
      return appendCombo("Ace Anchor armed: Ace hands win extra and lose less.");
    }
    if (card.shopKey === "grim-chip") {
      handState.extraWinBonus += 35 + (trainingValue("grim-chip") * 10);
      handState.extraLossPenalty += 15;
      return appendCombo("Grim Chip armed: +$35 on win, +$15 loss pressure.");
    }
    if (card.shopKey === "dealer-trap") {
      handState.dealerTrapBonus += 25 + (trainingValue("dealer-trap") * 10);
      return appendCombo("Dealer Trap armed: if the dealer busts, this hand cashes out harder.");
    }
    if (card.shopKey === "finisher-card") {
      handState.finisherBonus += 45 + (trainingValue("finisher-card") * 10);
      return appendCombo("Finisher Card armed: winning on 20 or 21 pays extra.");
    }
    if (card.shopKey === "pressure-card") {
      handState.pressureStand = true;
      return appendCombo("Pressure Card armed: dealer stands at current value for this hand.");
    }
    if (card.shopKey === "iron-pressure") {
      handState.pressureStand = true;
      return appendCombo("Iron Pressure armed: dealer stands immediately.");
    }
    if (card.shopKey === "peek-card") {
      if (dealerHoleHidden && !dealerHoleCounted && dealerHand[1]) {
        addToRunningCount(dealerHand[1]);
        dealerHoleCounted = true;
      }
      dealerHoleHidden = false;
      return appendCombo("Peek Card used: dealer hidden card revealed.");
    }
    if (card.shopKey === "deep-peek") {
      if (dealerHoleHidden && !dealerHoleCounted && dealerHand[1]) {
        addToRunningCount(dealerHand[1]);
        dealerHoleCounted = true;
      }
      dealerHoleHidden = false;
      const nextDealerCard = deck[deck.length - 1];
      return appendCombo(nextDealerCard
        ? `Deep Peek used: hidden card revealed. Next dealer draw looks like ${nextDealerCard.rank} of ${nextDealerCard.suit}.`
        : "Deep Peek used: hidden card revealed.");
    }
    if (card.shopKey === "swap-card") {
      if (!dealerHand.length || !playerHand.length) {
        return appendCombo("Swap Card had no valid target.");
      }
      const playerIndex = playerHand.length - 1;
      const dealerIndex = dealerHand.length - 1;
      const oldPlayer = cloneCard(playerHand[playerIndex]);
      const oldDealer = cloneCard(dealerHand[dealerIndex]);
      playerHand[playerIndex] = oldDealer;
      dealerHand[dealerIndex] = oldPlayer;
      if (!dealerHoleHidden || dealerIndex !== 1 || dealerHoleCounted) {
        replaceCountedCard(oldPlayer, oldDealer);
      }
      return appendCombo("Swap Card used: newest cards swapped.");
    }
    if (card.shopKey === "delay-card") {
      handState.delayCharges += 1;
      handState.extraWinBonus += trainingValue("delay-card") * 5;
      return appendCombo("Delay Card armed: ignore one bust this hand.");
    }
    if (card.shopKey === "control-card") {
      handState.controlPending = true;
      handState.controlRange = 2 + Math.floor(trainingValue("control-card") / 2);
      return appendCombo(`Control Card armed: next drawn card becomes plus or minus ${handState.controlRange}.`);
    }
    if (card.shopKey === "control-plus") {
      handState.controlPending = true;
      handState.controlRange = 3;
      return appendCombo("Control Card+ armed: next drawn card becomes plus or minus 3.");
    }
    if (card.shopKey === "lucky-jackpot") {
      handState.finisherBonus += 60;
      handState.twentyOneWinBonus += 120;
      return appendCombo("Lucky Jackpot armed: winning on 20 or 21 pays heavily.");
    }
    if (card.shopKey === "open-ledger") {
      if (dealerHoleHidden && !dealerHoleCounted && dealerHand[1]) {
        addToRunningCount(dealerHand[1]);
        dealerHoleCounted = true;
      }
      dealerHoleHidden = false;
      handState.extraWinBonus += 25;
      const nextDealerCard = deck[deck.length - 1];
      return appendCombo(nextDealerCard
        ? `Open Ledger used: hidden card revealed. Next dealer draw looks like ${nextDealerCard.rank} of ${nextDealerCard.suit}, and this hand gains +$25 on win.`
        : "Open Ledger used: hidden card revealed and this hand gains +$25 on win.");
    }
    if (card.shopKey === "clean-profit") {
      handState.taxRelief = true;
      handState.extraWinBonus += 60;
      return appendCombo("Clean Profit armed: ignore tax and gain +$60 on win.");
    }
    if (card.shopKey === "loaded-reflection") {
      handState.loadedBonusPending += 4;
      handState.controlPending = true;
      handState.controlRange = 4;
      return appendCombo("Loaded Reflection armed: next draw gets +4 and stronger control.");
    }
    if (card.shopKey === "ruin-engine") {
      handState.extraWinBonus += 80;
      handState.extraLossPenalty += 50;
      return appendCombo("Ruin Engine armed: +$80 on win, but lose an extra $50 on failure.");
    }
    if (card.shopKey === "house-sigil") {
      handState.controlPending = true;
      handState.controlRange = 4;
      handState.extraWinBonus += 20;
      return appendCombo("House Sigil armed: cleaner next draw and +$20 on win.");
    }
    if (card.shopKey === "rigged-fortune") {
      handState.extraWinBonus += 45;
      if (dealerHoleHidden && !dealerHoleCounted && dealerHand[1]) {
        addToRunningCount(dealerHand[1]);
        dealerHoleCounted = true;
      }
      dealerHoleHidden = false;
      return appendCombo("Rigged Fortune armed: reveal the dealer and gain +$45 on win.");
    }
    if (card.shopKey === "cinder-seal") {
      handState.dealerFreezeCharges += 1;
      handState.secondBreathCharges += 1;
      return appendCombo("Cinder Seal armed: freeze one dealer draw and survive one bust by 1.");
    }
    if (card.shopKey === "jackpot-engine") {
      handState.finisherBonus += 70;
      handState.twentyOneWinBonus += 70;
      return appendCombo("Jackpot Engine armed: strong extra payout on 20 and 21.");
    }
    if (card.shopKey === "infernal-contract") {
      handState.extraWinBonus += 70;
      handState.extraLossPenalty += 25;
      return appendCombo("Infernal Contract armed: +$70 on win, but lose an extra $25 on failure.");
    }
    if (card.shopKey === "grave-metal") {
      handState.loadedBonusPending += 2;
      handState.extraWinBonus += 30;
      handState.extraLossPenalty += 20;
      return appendCombo("Grave Metal armed: next draw gets +2, with bigger upside and recoil.");
    }
    if (card.shopKey === "debt-card") {
      const debtPenalty = Math.max(10, 50 - (trainingValue("debt-card") * 5));
      tableNet -= debtPenalty;
      runCash = Math.max(0, runCash - debtPenalty);
      return appendCombo(`Debt Card triggered: lose $${debtPenalty} immediately.`);
    }
    if (card.shopKey === "burn-card") {
      return appendCombo("Burn Card drawn: fixed value 15.");
    }
    if (card.shopKey === "royal-card") {
      handState.winPayoutBonus = (handState.winPayoutBonus || 0) + 0.5;
      return appendCombo("Royal Card armed: winning hand pays +50%.");
    }
    if (card.shopKey === "double-draw" || card.shopKey === "fate-card") {
      handState.choiceDraws = (handState.choiceDraws || 0) + 1 + Math.floor(trainingValue(card.shopKey) / 4);
      return appendCombo(`${card.shopLabel} armed: draw two and choose one next time.`);
    }
    if (card.shopKey === "dealer-freeze" || card.shopKey === "dealer-breaker") {
      handState.dealerFreezeCharges = (handState.dealerFreezeCharges || 0) + 1 + Math.floor(trainingValue(card.shopKey) / 4);
      return appendCombo(card.shopKey === "dealer-freeze"
        ? "Dealer Freeze armed: dealer skips the next draw."
        : "Dealer Breaker armed: dealer must draw one extra card.");
    }
    if (card.shopKey === "mirror-curse") {
      const highest = [...playerHand].sort((a, b) => cardPoints(b.rank, b) - cardPoints(a.rank, a))[0];
      if (highest) {
        dealerHand.push({ ...highest });
      }
      return appendCombo("Mirror Curse triggered: dealer copied your highest card.");
    }
    if (card.shopKey === "guardian-card") {
      handState.delayCharges += 1;
      return appendCombo("Guardian Card armed: ignore bust once this table.");
    }
    if (card.shopKey === "split-card") {
      return appendCombo("Split Card drawn.");
    }
    return appendCombo(card.shopLabel ? `${card.shopLabel} drawn.` : "");
  }

  function cardCountDelta(card) {
    if (!card) {
      return 0;
    }
    if (["2", "3", "4", "5", "6"].includes(card.rank)) {
      return 1;
    }
    if (["7", "8", "9"].includes(card.rank)) {
      return 0;
    }
    return -1;
  }

  function addToRunningCount(card) {
    runningCount += cardCountDelta(card);
    updateCountHelperUI();
  }

  function replaceCountedCard(oldCard, newCard) {
    runningCount -= cardCountDelta(oldCard);
    runningCount += cardCountDelta(newCard);
    updateCountHelperUI();
  }

  function updateCountHelperUI() {
    if (runningCountEl) {
      runningCountEl.textContent = String(runningCount);
    }
    if (countHelperPanelEl) {
      countHelperPanelEl.classList.toggle("hidden", !countHelperVisible);
    }
    if (countHelperBtn) {
      countHelperBtn.textContent = countHelperVisible ? "Hide Count Helper" : "Count Helper";
    }
  if (originalModeBtn) {
      originalModeBtn.textContent = originalMode ? "Playing Original Blackjack" : "Play Original Blackjack";
    }
    updateDeckCounterInfo();
  }

  function trainingValue(key) {
    return cardTraining[key] || 0;
  }

  function cardPoints(rank, card) {
    if (card && card.shopKey === "stack-card") {
      return 5 + (card.valueAdjust || 0) + trainingValue("stack-card");
    }
    if (card && card.shopKey === "mirror-card") {
      return Math.max(0, (card.valueAdjust || 0) + trainingValue("mirror-card"));
    }
    if (card && card.shopKey === "burn-card") {
      return 15 + (card.valueAdjust || 0) + trainingValue("burn-card");
    }
    if (card && card.shopKey === "volatile-card") {
      return Math.max(1, (card.volatileValue || 1) + (card.valueAdjust || 0) + trainingValue("volatile-card"));
    }
    if (card && card.shopKey === "heavy-card") {
      return 12 + (card.valueAdjust || 0) + trainingValue("heavy-card");
    }
    if (card && card.dealerSpecialKey === "dealer-burn-card") {
      return (Number(rank) || (["K", "Q", "J"].includes(rank) ? 10 : rank === "A" ? 11 : 0)) + 3;
    }
    if (card && Object.hasOwn(card, "shopValue")) {
      return card.shopValue + (card.valueAdjust || 0) + trainingValue(card.shopKey);
    }
    if (rank === "A") {
      return 11;
    }
    if (["K", "Q", "J"].includes(rank)) {
      return 10;
    }
    return Number(rank);
  }

  function handTotal(cards) {
    const resolvedValues = [];
    cards.forEach((card, index) => {
      let value = cardPoints(card.rank, card);
      if (card?.shopKey === "mirror-card") {
        value = index > 0 ? resolvedValues[index - 1] : 7;
      }
      resolvedValues.push(value);
    });
    let total = resolvedValues.reduce((sum, value) => sum + value, 0);
    const luckySevenIndices = cards.reduce((indices, card, index) => {
      if (card?.shopKey === "lucky-seven") {
        indices.push(index);
      }
      return indices;
    }, []);
    luckySevenIndices.forEach((index) => {
      const currentValue = resolvedValues[index];
      const options = [currentValue - 1, currentValue, currentValue + 1];
      const bestUnderCap = options.filter((value) => (total - currentValue + value) <= currentBustLimit()).sort((a, b) => b - a)[0];
      const nextValue = bestUnderCap ?? options.sort((a, b) => a - b)[0];
      total = total - currentValue + nextValue;
      resolvedValues[index] = nextValue;
    });
    const stackCards = cards.filter((card) => card.shopKey === "stack-card").length;
    if (stackCards >= 2) {
      total += Math.floor(stackCards / 2) * (megaStackUnlocked ? 8 : 5);
    }
    const wildCards = cards.filter((card) => card.shopKey === "wild-card");
    if (wildCards.length) {
      total -= wildCards.length * 11;
      for (let i = 0; i < wildCards.length; i += 1) {
        const wildsLeft = wildCards.length - i - 1;
        total += Math.max(1, Math.min(11, currentBustLimit() - total - wildsLeft));
      }
    }
    const perfectWilds = cards.filter((card) => card.shopKey === "perfect-wild");
    if (perfectWilds.length) {
      total -= perfectWilds.length * 11;
      for (let i = 0; i < perfectWilds.length; i += 1) {
        const left = perfectWilds.length - i - 1;
        total += Math.max(2, Math.min(12, currentBustLimit() - total - left));
      }
    }
    const royalWilds = cards.filter((card) => card.shopKey === "royal-wild");
    if (royalWilds.length) {
      total -= royalWilds.length * 11;
      for (let i = 0; i < royalWilds.length; i += 1) {
        const left = royalWilds.length - i - 1;
        total += Math.max(8, Math.min(11, currentBustLimit() - total - left));
      }
    }
    let aces = cards.filter((card) => card.rank === "A").length;
    aces += cards.filter((card) => card.shopKey === "golden-ace").length;
    while (total > currentBustLimit() && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    if (cards.some((card) => card.shopKey === "eternal-ace") && total > currentBustLimit()) {
      total = currentBustLimit();
    }
    return total;
  }

  function splitCardValue(card) {
    return cardPoints(card.rank, card);
  }

  function renderCards(target, cards, hideSecond, animateIndex, animateAll) {
    target.innerHTML = "";
    cards.forEach((card, index) => {
      const cardEl = document.createElement("article");
      cardEl.className = "playing-card";
      if (animateAll || index === animateIndex) {
        cardEl.classList.add("slam-in");
      }
      if (hideSecond && index === 1) {
        cardEl.classList.add("facedown");
        cardEl.setAttribute("aria-label", "Hidden dealer card");
        cardEl.innerHTML = '<span class="card-back-mark">?</span>';
      } else {
        if (target === dealerCardsEl && index === 1 && dealerRevealPulse && !hideSecond) {
          cardEl.classList.add("reveal-flip");
        }
        const isRed = card.suit === "hearts" || card.suit === "diamonds";
        if (card.shopKey) {
          cardEl.classList.add("special-card", "shop-card");
        }
        cardEl.innerHTML = `
          ${(card.shopLabel || card.dealerSpecialLabel) ? `<span class="special-badge">${card.shopLabel || card.dealerSpecialLabel}</span>` : ""}
          <span class="rank">${card.rank}</span>
          <span class="suit${isRed ? " red-suit" : ""}">${suitSymbols[card.suit]}</span>
        `;
      }
      target.appendChild(cardEl);
    });
  }

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
    pushCombatLog(message);
    updateLossOverlay();
  }

  function fmtMoney(amount) {
    const sign = amount < 0 ? "-" : "";
    return `${sign}$${Math.abs(Math.round(amount)).toLocaleString()}`;
  }

  function queuedDealerSpecialSummary() {
    const counts = {};
    if (!originalMode && currentSpecialNodeType === "fight" && currentNormalMonster && dealerSignatureCardsRemaining > 0) {
      counts[currentNormalMonster.signatureCardKey] = (counts[currentNormalMonster.signatureCardKey] || 0) + dealerSignatureCardsRemaining;
    }
    if (!originalMode && currentSpecialNodeType === "elite") {
      dealerEliteSignatureQueue.forEach((key) => {
        counts[key] = (counts[key] || 0) + 1;
      });
    }
    if (!originalMode && currentSpecialNodeType === "boss") {
      dealerBossSignatureQueue.forEach((key) => {
        counts[key] = (counts[key] || 0) + 1;
      });
    }
    return counts;
  }

  function placedDealerSpecialSummary() {
    const counts = {};
    dealerHandsPool.forEach((hand) => {
      hand.forEach((card) => {
        if (card?.dealerSpecialKey) {
          counts[card.dealerSpecialKey] = (counts[card.dealerSpecialKey] || 0) + 1;
        }
      });
    });
    return counts;
  }

  function renderDealerIntel() {
    if (!dealerIntelEl) {
      return;
    }
    const placed = placedDealerSpecialSummary();
    const queued = queuedDealerSpecialSummary();
    const keys = Array.from(new Set([...Object.keys(placed), ...Object.keys(queued)]));
    if (!keys.length) {
      dealerIntelEl.innerHTML = '<div class="table-panel-empty">No dealer special cards are active on this table yet.</div>';
      return;
    }
    dealerIntelEl.innerHTML = keys.map((key) => {
      const meta = DEALER_SPECIAL_CARDS[key];
      if (!meta) {
    return appendCombo("");
  }
      const placedCount = placed[key] || 0;
      const queuedCount = queued[key] || 0;
      const stateBits = [];
      if (placedCount > 0) stateBits.push(`Placed: <strong>${placedCount}</strong>`);
      if (queuedCount > 0) stateBits.push(`Queued: <strong>${queuedCount}</strong>`);
      return `
        <div class="dealer-intel-entry">
          <span class="dealer-intel-entry-title">${meta.label}</span>
          <span class="dealer-intel-entry-copy">${meta.desc}</span>
          <span class="dealer-intel-entry-copy">${stateBits.join(" · ")}</span>
        </div>
      `;
    }).join("");
  }

  function updateTableStatus(extra = "") {
    const completed = tableHands.filter((h) => h.state === "completed").length;
    const totalHands = tableHands.length || TABLE_HANDS;
    const dealerPoolText = dealerHandsPool.length > 1 ? ` · ${dealerHandsPool.length} enemy hands` : "";
    const encounterText = currentEncounterRule?.label || "";
    if (summaryRunEl) {
      summaryRunEl.textContent = `Cash: ${fmtMoney(runCash)} · Lives: ${runLives} · Title: ${currentTitleLabel()} (${currentTitleRarityLabel()})${activeRunCurseKeys().length ? ` · Curses: ${currentRunCurseLabel()}` : ""}`;
    }
    if (summaryDealerEl) {
      summaryDealerEl.textContent = `${tableDealerName}${encounterText ? ` · ${encounterText}` : ""}${dealerPoolText}`;
    }
    if (summaryProgressEl) {
      summaryProgressEl.textContent = tableActive
        ? `Hand ${activeHandIndex + 1}/${totalHands} · ${completed}/${totalHands} complete`
        : `Table cleared · ${completed}/${totalHands} complete`;
    }
    if (summaryStakeEl) {
      summaryStakeEl.textContent = tableActive
        ? `Bet: ${fmtMoney(tableBetLocked)} · Net: ${fmtMoney(tableNet)}`
        : `Final Net: ${fmtMoney(tableNet)} · Streak ${winStreak}`;
    }
    if (!tableStatusEl) {
      renderDealerIntel();
      return;
    }
    if (tableActive) {
      tableStatusEl.textContent = `${tableDealerName} is at the table. ${extra || "Choose the next hand action."}`;
      renderDealerIntel();
      return;
    }
    tableStatusEl.textContent = extra || "Table finished. Review the result and continue.";
    renderDealerIntel();
  }

  function encounterHandCount() {
    return TABLE_HANDS;
  }

  function encounterDealerHandCount() {
    if (originalMode) {
      return 1;
    }
    if (currentSpecialNodeType === "elite") {
      return 2;
    }
    if (currentSpecialNodeType === "boss") {
      return 3;
    }
    return 1;
  }

  function initTableHands() {
    const handCount = encounterHandCount();
    tableHands = Array.from({ length: handCount }, (_, i) => ({
      hand: i + 1,
      familyId: i + 1,
      state: "playing",
      result: "",
      playerTotal: null,
      dealerTotal: null,
      cards: [drawCard("player"), drawCard("player")],
      firstMove: true,
      betMultiplier: 1,
      shopState: createDefaultHandState(),
      eventKey: originalMode ? "normal-table" : tableEvents[Math.floor(Math.random() * tableEvents.length)],
      fromSplit: false
    }));
    activeHandIndex = 0;
  }

  function renumberHands() {
    tableHands.forEach((h, i) => {
      h.hand = i + 1;
    });
  }

  function renderHandBoard() {
    if (!handBoardEl) {
      return;
    }
    handBoardEl.innerHTML = tableHands.map((hand, idx) => `
      <article class="table-hand-tile" data-hand-index="${idx + 1}">
        <h3>Hand ${idx + 1}${hand.fromSplit ? " (Split)" : ""}</h3>
        <p>Pending</p>
        <div class="hand-mini-total">Total: 0/${currentBustLimit()}</div>
        <div class="playing-cards mini-cards"></div>
        <button class="btn btn-outline hand-select-btn" type="button" data-select-hand="${idx + 1}">Play Hand ${idx + 1}</button>
      </article>
    `).join("");

    const tiles = Array.from(handBoardEl.querySelectorAll(".table-hand-tile"));
    tiles.forEach((tile, idx) => {
      const hand = tableHands[idx];
      tile.classList.remove("active", "win", "loss", "push");
      if (idx === activeHandIndex && hand.state !== "completed") {
        tile.classList.add("active");
      }
      if (hand.state === "completed" && hand.result) {
        tile.classList.add(hand.result);
      }
      let line = "Pending";
      if (hand.state === "playing") {
        line = "In progress";
      } else if (hand.state === "completed") {
        const totals = hand.playerTotal !== null && hand.dealerTotal !== null
          ? `P:${hand.playerTotal} D:${hand.dealerTotal}`
          : "";
        line = `${hand.result.toUpperCase()} ${totals}`.trim();
      }
      const p = tile.querySelector("p");
      if (p) {
        p.textContent = line;
      }
      const t = tile.querySelector(".hand-mini-total");
      if (t) {
        const comboText = (hand.shopState?.comboLabels || []).length
          ? ` · Combo: ${(hand.shopState.comboLabels || []).slice(0, 2).join(", ")}`
          : "";
        t.textContent = `Total: ${handTotal(hand.cards)}/${currentBustLimit()}${comboText}`;
      }
      const miniCards = tile.querySelector(".mini-cards");
      if (miniCards) {
        renderCards(miniCards, hand.cards, false, -1, false);
      }
      const sel = tile.querySelector(".hand-select-btn");
      if (sel) {
        const isLockedAtCap = handTotal(hand.cards) === currentBustLimit();
        const canPlay = hand.state === "playing" && tableActive && !roundOver && !isLockedAtCap;
        sel.disabled = !canPlay;
        sel.style.display = canPlay ? "" : "none";
        sel.textContent = idx === activeHandIndex ? `Selected Hand ${idx + 1}` : `Play Hand ${idx + 1}`;
      }
    });
  }

  function streakBonusMultiplier(streak) {
    if (streak >= 5) {
      return 1.5;
    }
    if (streak >= 3) {
      return 1.25;
    }
    return 1;
  }

  function jackpotMultiplier() {
    return jackpotRoundActive ? 3 : 1;
  }

  function updateStreakStatus() {
    if (!streakStatusEl) {
      return;
    }
    const nextNote = jackpotRoundArmed ? " Next win streak milestone: Jackpot round armed." : "";
    streakStatusEl.textContent = `Streak: ${winStreak} wins. Bonus x${streakBonusMultiplier(winStreak).toFixed(2)}.${jackpotRoundActive ? " Jackpot round active (x3)." : ""}${nextNote}`;
  }

  function updateAbilityStatus() {}

  function updateActionButtons() {
    if (roundOver) {
      const mapReady = !waitingForMapChoice || Boolean(pendingMapNodeId);
      const canStartNext = !waitingForShopChoice && mapReady && !dealAnimationLock;
      actionButtons.forEach((btn) => {
        const action = btn.getAttribute("data-bj-action");
        if (action === "hit") {
          btn.textContent = canStartNext ? "Start Next Table" : ACTION_LABELS.hit;
          btn.style.display = "";
          btn.disabled = !canStartNext;
          return;
        }
        btn.textContent = ACTION_LABELS[action] || btn.textContent;
        btn.style.display = canStartNext ? "none" : "";
        btn.disabled = true;
      });
      addKeybindChips();
      return;
    }

    const lockedAtCap = tableActive
      && tableHands[activeHandIndex]
      && tableHands[activeHandIndex].state === "playing"
      && handTotal(playerHand) === currentBustLimit();
    actionButtons.forEach((btn) => {
      const action = btn.getAttribute("data-bj-action");
      btn.textContent = ACTION_LABELS[action] || btn.textContent;
      const splitReady = playerHand.length === 2
        && splitCardValue(playerHand[0]) === splitCardValue(playerHand[1]);
      let disabled = roundOver || lockedAtCap || dealAnimationLock;
      if (action === "double") {
        disabled = disabled || !firstMove || runCash < extraActionStakeCost();
      }
      if (action === "split") {
        disabled = disabled || !firstMove || !splitReady || runCash < extraActionStakeCost();
      }
      btn.disabled = disabled;
      btn.style.display = lockedAtCap ? "none" : "";
    });
    addKeybindChips();
  }

  function effectiveBetMultiplier() {
    return betMultiplier * eventBetMultiplier();
  }

  function extraActionStakeCost() {
    const baseCost = Math.round(tableBetLocked * eventBetMultiplier());
    if (passiveCount("split-fund") > passiveState["split-fund-used"]) {
      const discount = Math.min(0.9, 0.5 + ((passiveCount("split-fund") - 1) * 0.15));
      return Math.max(1, Math.round(baseCost * (1 - discount)));
    }
    return baseCost;
  }

  function resetStreak() {
    winStreak = 0;
    jackpotRoundArmed = false;
    updateStreakStatus();
  }

  function finalPayoutMultiplierForWin() {
    const base = effectiveBetMultiplier();
    const streakBonus = streakBonusMultiplier(winStreak);
    const jackpot = jackpotMultiplier();
    const tax = isTaxTable() ? 0.9 : 1;
    return base * streakBonus * jackpot * tax;
  }

  function blackjackPayoutMultiplier() {
    return BJ_AUTO_WIN_PAYOUT + (0.5 * passiveCount("lucky-seat"));
  }

  async function drawPlayerChoiceCard(reasonTitle, reasonText) {
    const first = drawCard("player");
    const second = drawCard("player");
    const picked = await chooseCardFromOptions(reasonTitle, reasonText, [first, second]);
    return picked;
  }

  function applyTableStreakOutcome() {
    const tableWon = tableNet > 0;
    if (tableWon) {
      winStreak += 1;
      if (winStreak >= 7) {
        jackpotRoundArmed = true;
      }
      if (skillTrialActive && !skillTrialFailed) {
        skillTrialRewardPending = true;
      }
      updateStreakStatus();
      return;
    }
    skillTrialRewardPending = false;
    resetStreak();
  }

  function startTable() {
    if (runFailed) {
      waitingForMapChoice = false;
      waitingForShopChoice = false;
      pendingMapNodeId = null;
      offeredRoutes = [];
      updateMapPopupUI();
      renderRouteChoices();
      setStatus("Run is over. Restart the run or toggle mode to swap versions.");
      updateAdviceText(false);
      return;
    }
    if (waitingForShopChoice) {
      setStatus("Finish the shop first.");
      updateAdviceText(false);
      return;
    }
    if (waitingForMapChoice && !pendingMapNodeId) {
      setStatus("Choose your next direction on the map first.");
      updateAdviceText(false);
      return;
    }
    if (runLives <= 0) {
      runFailed = true;
      runFailReason = "You ran out of lives before clearing the current floor.";
      roundOver = true;
      tableActive = false;
      waitingForMapChoice = false;
      waitingForShopChoice = false;
      pendingMapNodeId = null;
      offeredRoutes = [];
      setStatus("Run failed. You are out of lives.");
      updateTableStatus("Run failed");
      updateActionButtons();
      renderRouteChoices();
      updateShopUI();
      updateMapPopupUI();
      updateAdviceText(false);
      return;
    }
    tableActive = true;
    waitingForShopChoice = false;
    tableNet = 0;
    tableBetLocked = baseTableStakeForCurrentMap();
    passiveState["deck-polish-used"] = 0;
    passiveState["sharp-eye-used"] = 0;
    passiveState["steel-nerves-used"] = false;
    passiveState["smoke-mirror-used"] = 0;
    passiveState["split-fund-used"] = 0;
    passiveState["grit-teeth-used"] = 0;
    if (hasPassive("casino-credit")) {
      tableNet += 10 * passiveCount("casino-credit");
    }
    if (hasPassive("ember-bank")) {
      tableNet += 15 * passiveCount("ember-bank");
    }
    if (hasPassive("chip-stash")) {
      activeTools["chip-shield"] += passiveCount("chip-stash");
    }
    if (hasPassive("croupier-stash")) {
      activeTools["lucky-draw"] += passiveCount("croupier-stash");
    }
    if (pendingVaultCredit > 0) {
      tableNet += pendingVaultCredit;
      pendingVaultCredit = 0;
    }
    waitingForMapChoice = false;
    offeredRoutes = [];
    if (pendingMapNodeId) {
      currentMapNodeId = pendingMapNodeId;
      if (!completedMapNodeIds.includes(currentMapNodeId)) {
        completedMapNodeIds.push(currentMapNodeId);
      }
      pendingMapNodeId = null;
    }
    const currentMapNode = mapNodes[currentMapNodeId];
    currentSpecialNodeType = currentMapNode?.type || "";
    clearCombatLog();
    currentEncounterCleared = false;
    if (!originalMode && encounterIntelligenceGain() > 0) {
      raiseEnemyIntelligence(encounterIntelligenceGain() + greedIntelligenceBonus());
    }
    if (!originalMode && currentSpecialNodeType === "boss") {
      if (currentBossNodeId !== currentMapNodeId || !currentEncounterRule || !ENCOUNTER_RULES.boss.some((rule) => rule.key === currentEncounterRule.key)) {
        currentEncounterRule = pickEncounterRule("boss");
        currentBossNodeId = currentMapNodeId;
        currentBossRoundsCleared = 0;
      }
      currentEliteNodeId = null;
      currentEliteRoundsPlayed = 0;
      currentBossSplitCullRound = 0;
    } else if (!originalMode && currentSpecialNodeType === "elite") {
      if (currentEliteNodeId !== currentMapNodeId || !currentEncounterRule || !ENCOUNTER_RULES.elite.some((rule) => rule.key === currentEncounterRule.key)) {
        currentEncounterRule = pickEncounterRule("elite");
        currentEliteNodeId = currentMapNodeId;
        currentEliteRoundsPlayed = 0;
      }
      if (currentBossNodeId && currentMapNodeId !== currentBossNodeId) {
        currentBossNodeId = null;
        currentBossRoundsCleared = 0;
        currentBossSplitCullRound = 0;
      }
    } else {
      if (currentBossNodeId && currentMapNodeId !== currentBossNodeId) {
        currentBossNodeId = null;
        currentBossRoundsCleared = 0;
        currentBossSplitCullRound = 0;
      }
      if (currentEliteNodeId && currentMapNodeId !== currentEliteNodeId) {
        currentEliteNodeId = null;
        currentEliteRoundsPlayed = 0;
      }
      currentEncounterRule = !originalMode && (currentSpecialNodeType === "elite" || currentSpecialNodeType === "boss")
        ? pickEncounterRule(currentSpecialNodeType)
        : null;
    }
    currentNormalMonster = null;
    dealerSignatureCardsRemaining = 0;
    dealerEliteSignatureQueue = [];
    dealerBossSignatureQueue = [];
    if (routeStatusEl && tablesPlayed > 0 && !originalMode) {
      routeStatusEl.textContent = `Map ${currentWorldMapNumber}/5 encounter active at ${mapNodes[currentMapNodeId].label}.`;
    }
    if (futurePreviewEl && tablesPlayed > 0 && !originalMode) {
      futurePreviewEl.textContent = "Finish this encounter to choose your next direction.";
    }
    mapPreviewOpen = false;

    // Non-combat nodes now resolve into distinct event flows instead of all becoming shops.
    if (!originalMode && currentMapNode && ["camp", "forge", "risk", "vault"].includes(currentMapNode.type)) {
      if (currentMapNode.type === "camp") {
        resolveCampNode();
        return;
      }
      if (currentMapNode.type === "forge") {
        resolveForgeNode();
        return;
      }
      if (currentMapNode.type === "risk") {
        resolveRiskNode();
        return;
      }
      if (currentMapNode.type === "vault") {
        resolveVaultNode();
        return;
      }
    }
    if (!originalMode && currentMapNode && currentMapNode.type === "trial") {
      skillTrialActive = true;
      currentTrialType = pickOne(["high-stakes", "dealer-challenge", "hot-deck", "no-bust"]);
      skillTrialFailed = false;
      setStatus(`Skill Trial active: ${currentTrialType}. Win this table to gain a rare reward.`);
    } else {
      skillTrialActive = false;
      currentTrialType = "";
    }

    let pickedDealer = originalMode
      ? dealerProfiles.find((d) => d.key === "classic")
      : tablesPlayed === 0
        ? dealerProfiles.find((d) => d.key === "classic")
        : null;
    if (!pickedDealer && nextDealerChoiceKey) {
      pickedDealer = dealerProfiles.find((d) => d.key === nextDealerChoiceKey) || null;
    }
    if (!pickedDealer) {
      pickedDealer = currentSpecialNodeType === "fight" ? dealerNamePoolPick() : dealerProfiles.find((d) => d.key === dealerKeyForEncounterType(currentSpecialNodeType));
    }
    nextDealerChoiceKey = null;
    if (!originalMode && currentSpecialNodeType === "fight" && currentNormalMonster) {
      dealerSignatureCardsRemaining = currentNormalMonster.signatureCopies || 1;
    }
    if (!originalMode && currentSpecialNodeType === "elite" && currentEncounterRule) {
      dealerEliteSignatureQueue = [...(currentEncounterRule.signatureCardKeys || [])];
    }
    if (!originalMode && currentSpecialNodeType === "boss" && currentEncounterRule) {
      dealerBossSignatureQueue = [...(currentEncounterRule.signatureCardKeys || [])];
    }

    renderRouteChoices();
    updateShopUI();
    updateMapPopupUI();
    tableDealerName = !originalMode && currentEncounterRule ? currentEncounterRule.label : pickedDealer.name;
    tableDealerProfile = pickedDealer.key;
    if (!originalMode && currentSpecialNodeType === "fight" && currentNormalMonster) {
      const specialMeta = DEALER_SPECIAL_CARDS[currentNormalMonster.signatureCardKey];
      setStatus(`${currentNormalMonster.name} enters the table. Signature card: ${specialMeta?.label || "Unknown"} x${currentNormalMonster.signatureCopies || 1}.`);
    } else if (!originalMode && currentSpecialNodeType === "elite" && currentEncounterRule) {
      setStatus(`${currentEncounterRule.label} begins round ${currentEliteRoundNumber()}/2.`);
    } else if (!originalMode && currentSpecialNodeType === "boss" && currentEncounterRule) {
      setStatus(`${currentEncounterRule.label} begins round ${currentBossRoundNumber()}/3.`);
    }
    if (deck.length < RESHUFFLE_AT) {
      deck = buildDeck();
    }
    if (skillTrialActive && currentTrialType === "hot-deck") {
      for (let i = 0; i < 10; i += 1) {
        deck.push({ rank: "10", suit: suits[i % suits.length] });
      }
    }
    if (activeTools["rigged-shuffle"] > 0 && selectedShopCardKeys().length) {
      const forcedKey = selectedShopCardKeys()[Math.floor(Math.random() * selectedShopCardKeys().length)];
      const slot = Math.max(0, deck.length - (1 + Math.floor(Math.random() * Math.min(10, deck.length))));
      deck[slot] = { ...deck[slot], forcedShopKey: forcedKey };
      activeTools["rigged-shuffle"] -= 1;
    }
    dealerHandsPool = Array.from({ length: encounterDealerHandCount() }, () => [drawCard("dealer"), drawCard("dealer")]);
    dealerHand = dealerHandsPool[0] || [];
    if (skillTrialActive && currentTrialType === "dealer-challenge") {
      dealerHandsPool[0] = [{ rank: "10", suit: "spades" }, { rank: "8", suit: "hearts" }];
      dealerHand = dealerHandsPool[0];
    }
    dealerHoleCounted = false;
    addToRunningCount(dealerHand[0]);
    if (hasPassive("dealer-tell") && dealerHand[1]) {
      dealerHoleHidden = false;
      if (!dealerHoleCounted) {
        addToRunningCount(dealerHand[1]);
        dealerHoleCounted = true;
      }
    }
    if (!originalMode && tableDealerProfile === "lucky" && Math.random() < (0.10 + Math.random() * 0.02)) {
      const tenRanks = ["10", "J", "Q", "K"];
      const tenRank = tenRanks[Math.floor(Math.random() * tenRanks.length)];
      const aceSuit = suits[Math.floor(Math.random() * suits.length)];
      const tenSuit = suits[Math.floor(Math.random() * suits.length)];
      dealerHandsPool[0] = [
        { rank: "A", suit: aceSuit },
        { rank: tenRank, suit: tenSuit }
      ];
      dealerHand = dealerHandsPool[0];
    }
    initTableHands();
    applyEncounterRuleTableSetup();
    if (skillTrialActive && currentTrialType === "high-stakes") {
      tableBetLocked = Math.round(baseTableStakeForCurrentMap() * 2);
    }
    tableHands.forEach((hand) => {
      hand.cards.forEach((card) => addToRunningCount(card));
    });
    tableHands.forEach((hand) => {
      if (!originalMode && hand.eventKey === "lucky-table") {
        const openingTotal = handTotal(hand.cards);
        if (openingTotal <= 19) {
          // Lucky Table: opening-hand EV +2 (no forced blackjack).
          const targetTotal = Math.min(currentBustLimit(), openingTotal + 2);
          const delta = targetTotal - openingTotal;
          if (delta > 0) {
            const idx = hand.cards.length - 1;
            const prevCard = hand.cards[idx];
            const rankNum = Number(prevCard.rank);
            if (Number.isFinite(rankNum)) {
              const nextCard = { ...prevCard, rank: String(Math.min(10, rankNum + delta)) };
              hand.cards[idx] = nextCard;
              // Keep count helper aligned with the shown rank after Lucky Table adjustment.
              replaceCountedCard(prevCard, nextCard);
            }
          }
        }
      }
    });
    jackpotRoundActive = jackpotRoundArmed;
    jackpotRoundArmed = false;
    updateTableStatus("Table Start");
    renderHandBoard();
    startRound();
    if (currentEncounterRule) {
      if (currentSpecialNodeType === "boss") {
        setStatus(`${currentEncounterRule.label} round ${currentBossRoundNumber()}/3. ${currentEncounterRule.desc}`);
      } else if (currentSpecialNodeType === "elite") {
        setStatus(`${currentEncounterRule.label} round ${currentEliteRoundNumber()}/2. ${currentEncounterRule.desc}`);
      } else {
        setStatus(`${currentMapNode.label}: ${currentEncounterRule.label}. ${currentEncounterRule.desc}`);
      }
    }
    updateAdviceText(false);
  }

  function triggerDealerAnimation() {
    const row = bjScreen.querySelector(".dealer-row");
    if (!row) {
      return;
    }
    row.classList.add("dealer-acting");
    setTimeout(() => {
      row.classList.remove("dealer-acting");
    }, 750);
  }

  function playDealerImpactAnimation(breakTable = false) {
    if (!dealerImpactEl) {
      return Promise.resolve();
    }
    const row = bjScreen.querySelector(".dealer-row");
    const frames = breakTable ? DEALER_SLAM_FRAME_URLS : DEALER_SLAM_FRAME_URLS.slice(0, 5);
    const playId = dealerImpactPlayId + 1;
    dealerImpactPlayId = playId;
    if (row) {
      row.classList.add("boss-impact-active");
    }
    dealerImpactEl.classList.toggle("dealer-impact-break", breakTable);
    dealerImpactEl.classList.remove("hidden");
    frames.forEach((frameUrl, index) => {
      window.setTimeout(() => {
        if (dealerImpactPlayId !== playId) {
          return;
        }
        dealerImpactEl.src = frameUrl;
        dealerImpactEl.classList.toggle("dealer-impact-final", breakTable && index === frames.length - 1);
      }, index * DEALER_SLAM_FRAME_MS);
    });
    return new Promise((resolve) => {
      window.setTimeout(() => {
        if (dealerImpactPlayId === playId) {
          dealerImpactEl.classList.add("hidden");
          dealerImpactEl.classList.remove("dealer-impact-final");
          dealerImpactEl.classList.remove("dealer-impact-break");
          if (row) {
            row.classList.remove("boss-impact-active");
          }
        }
        resolve();
      }, (frames.length * DEALER_SLAM_FRAME_MS) + DEALER_SLAM_END_HOLD_MS);
    });
  }

  function currentCharacterFaceMeta() {
    if (originalMode) {
      return null;
    }
    if (currentSpecialNodeType === "fight" && currentNormalMonster) {
      const key = currentNormalMonster.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return CHARACTER_FACE_META[key] || null;
    }
    if (currentSpecialNodeType === "elite" && currentEncounterRule) {
      return CHARACTER_FACE_META[currentEncounterRule.key] || null;
    }
    return null;
  }

  function updateDealerFace() {
    if (!dealerFaceEl) {
      return;
    }
    const characterFace = currentCharacterFaceMeta();
    const bossFaceKey = !originalMode && currentSpecialNodeType === "boss" && currentEncounterRule && BOSS_FACE_KEYS.has(currentEncounterRule.key)
      ? currentEncounterRule.key
      : "";
    dealerFaceEl.style.removeProperty("--dealer-face-image");
    dealerFaceEl.style.removeProperty("--dealer-face-position");
    dealerFaceEl.style.removeProperty("--dealer-face-size");
    dealerFaceEl.removeAttribute("data-character-face");
    dealerFaceEl.dataset.bossFace = bossFaceKey;
    if (bossFaceKey) {
      dealerFaceEl.textContent = "";
      dealerFaceEl.setAttribute("aria-label", `${currentEncounterRule.label} portrait`);
      return;
    }
    if (characterFace) {
      dealerFaceEl.removeAttribute("data-boss-face");
      dealerFaceEl.dataset.characterFace = "true";
      dealerFaceEl.textContent = "";
      dealerFaceEl.style.setProperty("--dealer-face-image", `url("${characterFace.image}")`);
      dealerFaceEl.style.setProperty("--dealer-face-position", characterFace.position);
      dealerFaceEl.style.setProperty("--dealer-face-size", characterFace.size);
      dealerFaceEl.setAttribute("aria-label", `${tableDealerName} portrait`);
      return;
    }
    dealerFaceEl.removeAttribute("data-boss-face");
    dealerFaceEl.removeAttribute("aria-label");
    dealerFaceEl.textContent = "🎩";
  }

  function updateChipStack() {
    if (!chipStackEl) {
      return;
    }
    const targetCount = Math.max(2, Math.min(12, Math.round(effectiveBetMultiplier() + winStreak)));
    chipStackEl.innerHTML = "";
    for (let i = 0; i < targetCount; i += 1) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.style.height = `${10 + (i % 5) * 3}px`;
      if (targetCount > lastChipCount && i >= lastChipCount) {
        chip.classList.add("grow");
      }
      chipStackEl.appendChild(chip);
    }
    lastChipCount = targetCount;
  }

  function renderTable() {
    renderDealerPool();
    renderDealerIntel();
    updateDealerFace();
    renderCards(dealerCardsEl, dealerHand, dealerHoleHidden, dealerAnimateIndex, animateAllDeal);
    if (playerCardsEl) {
      renderCards(playerCardsEl, playerHand, false, playerAnimateIndex, animateAllDeal);
    }
    const visibleDealerCards = dealerHoleHidden ? dealerHand.slice(0, 1) : dealerHand;
    dealerTotalEl.textContent = `Total: ${handTotal(visibleDealerCards)}/${currentBustLimit()}`;
    if (playerTotalEl) {
      playerTotalEl.textContent = `Total: ${handTotal(playerHand)}/${currentBustLimit()}`;
    }
    updateChipStack();
    playerAnimateIndex = -1;
    dealerAnimateIndex = -1;
    animateAllDeal = false;
  }

  function renderDealerPool() {
    if (!dealerPoolEl) {
      return;
    }
    if (dealerHandsPool.length <= 1) {
      dealerPoolEl.innerHTML = "";
      return;
    }
    dealerPoolEl.innerHTML = dealerHandsPool.map((hand, index) => `
      <article class="dealer-pool-hand">
        <div class="dealer-pool-head">
          <span>Dealer Hand ${index + 1}</span>
          <span>${handTotal(dealerHoleHidden ? hand.slice(0, 1) : hand)}/${currentBustLimit()}</span>
        </div>
        <div class="playing-cards dealer-pool-cards" data-dealer-pool-index="${index}"></div>
      </article>
    `).join("");
    dealerHandsPool.forEach((hand, index) => {
      const target = dealerPoolEl.querySelector(`[data-dealer-pool-index="${index}"]`);
      if (target) {
        renderCards(target, hand, dealerHoleHidden, -1, false);
      }
    });
  }

  function activeMiniCardsEl() {
    if (!handBoardEl) {
      return null;
    }
    return handBoardEl.querySelector(`.table-hand-tile[data-hand-index="${activeHandIndex + 1}"] .mini-cards`);
  }

  function miniCardsElForHand(handIndex) {
    if (!handBoardEl) {
      return null;
    }
    return handBoardEl.querySelector(`.table-hand-tile[data-hand-index="${handIndex + 1}"] .mini-cards`);
  }

  function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function flyCardFromDeck(targetEl) {
    if (!deckBoxEl || !targetEl) {
      return Promise.resolve();
    }
    const from = deckBoxEl.getBoundingClientRect();
    const to = targetEl.getBoundingClientRect();
    const card = document.createElement("span");
    card.className = "deal-fly-card";
    const startX = from.left + (from.width / 2) - 24;
    const startY = from.top + (from.height / 2) - 34;
    const endX = to.left + Math.min(34, to.width / 3);
    const endY = to.top + Math.min(20, to.height / 3);
    card.style.left = `${startX}px`;
    card.style.top = `${startY}px`;
    card.style.opacity = "0.92";
    card.style.transform = "translate(0,0) scale(0.96) rotate(-6deg)";
    document.body.appendChild(card);
    requestAnimationFrame(() => {
      card.style.transition = "transform 540ms cubic-bezier(.16,.78,.2,1), opacity 540ms ease-out";
      card.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.78) rotate(8deg)`;
      card.style.opacity = "0.14";
    });
    return new Promise((resolve) => {
      setTimeout(() => {
        card.remove();
        resolve();
      }, 620);
    });
  }

  function startRound(animateInitialDeal = false) {
    if (!tableHands.length) {
      return;
    }
    currentEvent = tableHands[activeHandIndex].eventKey || "double-table";
    updateEventBadge();
    playerHand = [...tableHands[activeHandIndex].cards];
    ensureHandState(tableHands[activeHandIndex]);
    betMultiplier = tableHands[activeHandIndex].betMultiplier || 1;
    dealerHoleHidden = true;
    roundOver = false;
    firstMove = tableHands[activeHandIndex].firstMove;
    animateAllDeal = true;
    renderTable();
    renderHandBoard();
    updateActionButtons();
    updateAbilityStatus();
    updateStreakStatus();
    updateTableStatus();
    if (animateInitialDeal) {
      flyCardFromDeck(dealerCardsEl);
      flyCardFromDeck(activeMiniCardsEl());
    }
    if (lockActiveHandAt21(`Hand reached ${currentBustLimit()} and is locked.`)) {
      return;
    }
    setStatus(`Round ready. ${eventLabel(currentEvent)}. Current bet x${effectiveBetMultiplier()}.`);
  }

  function saveActiveHandState() {
    if (!tableHands[activeHandIndex]) {
      return;
    }
    tableHands[activeHandIndex].cards = [...playerHand];
    tableHands[activeHandIndex].firstMove = firstMove;
    tableHands[activeHandIndex].betMultiplier = betMultiplier;
  }

  function moveToNextPlayableHand() {
    const next = tableHands.findIndex((h) => h.state === "playing");
    if (next >= 0) {
      activeHandIndex = next;
      startRound();
      return true;
    }
    return false;
  }

  function handLossAmount(hand, handState) {
    let lossAmount = Math.round((tableBetLocked * (hand.betMultiplier || 1) * eventBetMultiplier()) + (handState.extraLossPenalty || 0));
    if (handState.flatLossReduction) {
      lossAmount = Math.max(0, lossAmount - handState.flatLossReduction);
    }
    if (hasPassive("steel-nerves") && !passiveState["steel-nerves-used"]) {
      const reduction = Math.min(0.8, 0.25 * passiveCount("steel-nerves"));
      lossAmount = Math.max(0, Math.round(lossAmount * (1 - reduction)));
      passiveState["steel-nerves-used"] = true;
    }
    if (passiveCount("grit-teeth") > passiveState["grit-teeth-used"]) {
      lossAmount = Math.max(0, lossAmount - 20);
      passiveState["grit-teeth-used"] += 1;
    }
    if (activeTools["chip-shield"] > 0) {
      lossAmount = Math.round(lossAmount / 2);
      activeTools["chip-shield"] -= 1;
    }
    return lossAmount;
  }

  function cardConditionalWinBonus(hand, handState) {
    let bonus = 0;
    if (handState.aceAnchor && hand.cards.some((card) => card.rank === "A")) {
      bonus += 20 + (trainingValue("ace-anchor") * 5);
    }
    if (handState.dealerTrapBonus && Number.isFinite(hand.dealerTotal) && hand.dealerTotal > currentBustLimit()) {
      bonus += handState.dealerTrapBonus;
    }
    if (handState.finisherBonus && hand.playerTotal >= 20) {
      bonus += handState.finisherBonus;
    }
    return bonus;
  }

  function passiveWinBonus(hand) {
    let bonus = 0;
    if (hasPassive("profit-margin")) {
      bonus += 12 * passiveCount("profit-margin");
    }
    if (hasPassive("ace-credit") && hand.cards.some((card) => card.rank === "A")) {
      bonus += 18 * passiveCount("ace-credit");
    }
    if (hasPassive("perfect-focus") && hand.playerTotal === 21) {
      bonus += 25 * passiveCount("perfect-focus");
    }
    return bonus;
  }

  function settleSplitHandOutcome(handIndex) {
    const hand = tableHands[handIndex];
    if (!hand || hand.state !== "playing") {
      return "playing";
    }
    const handState = ensureHandState(hand);
    const total = handTotal(hand.cards);
    if (total > currentBustLimit()) {
      if (skillTrialActive && currentTrialType === "no-bust") {
        skillTrialFailed = true;
      }
      if (handState.delayCharges > 0) {
        handState.delayCharges -= 1;
        handState.delayUsed = true;
        hand.state = "standing";
        hand.playerTotal = total;
        hand.dealerTotal = null;
        hand.firstMove = false;
        return "saved";
      }
      if (saveOnePastCap(hand, handState)) {
        return "saved";
      }
      hand.state = "completed";
      hand.result = "loss";
      hand.playerTotal = total;
      hand.dealerTotal = null;
      hand.firstMove = false;
      tableNet -= handLossAmount(hand, handState);
      applyEncounterResolutionCost();
      return "bust";
    }
    if (total === currentBustLimit()) {
      hand.state = "standing";
      hand.playerTotal = total;
      hand.dealerTotal = null;
      hand.firstMove = false;
      return "locked";
    }
    return "playing";
  }

  function encounterWinRequirement(type) {
    return 0;
  }

  function familyOutcomeSummary() {
    const families = new Map();
    tableHands.forEach((hand, index) => {
      const familyId = hand.familyId || (index + 1);
      if (!families.has(familyId)) {
        families.set(familyId, { wins: 0, losses: 0, pushes: 0, hands: [] });
      }
      const family = families.get(familyId);
      family.hands.push(hand);
      if (hand.result === "win") {
        family.wins += 1;
      } else if (hand.result === "loss") {
        family.losses += 1;
      } else if (hand.result === "push") {
        family.pushes += 1;
      }
    });

    const summary = [];
    families.forEach((family, familyId) => {
      let outcome = "push";
      if (family.wins > 0 && family.wins >= family.losses) {
        outcome = "win";
      } else if (family.losses > family.wins) {
        outcome = "loss";
      }
      summary.push({ familyId, ...family, outcome });
    });
    return summary.sort((a, b) => a.familyId - b.familyId);
  }

  function simulateDealerHandForOutcome(baseDealerHand, hand) {
    const dealerEvalHand = baseDealerHand.map((card) => cloneCard(card));
    const handState = ensureHandState(hand);
    const forcedStand = handState.pressureStand;
    const strategicDealer = dealerUsesStrategicPlay();
    const threshold = forcedStand || strategicDealer ? handTotal(dealerEvalHand) : dealerHitThreshold();
    const virtualDeck = buildDeck();
    let skippedDraw = false;
    while (!forcedStand && handTotal(dealerEvalHand) < threshold) {
      if (handState.dealerFreezeCharges > 0 && !skippedDraw) {
        skippedDraw = true;
        handState.dealerFreezeCharges -= 1;
        break;
      }
      dealerEvalHand.push(virtualDeck.pop());
    }
    if (handState.dealerBait || hand.cards.some((card) => card.shopKey === "dealer-breaker")) {
      if (handState.dealerFreezeCharges > 0 && !skippedDraw) {
        skippedDraw = true;
        handState.dealerFreezeCharges -= 1;
      } else {
        dealerEvalHand.push(virtualDeck.pop());
      }
    }
    return dealerEvalHand;
  }

  function chooseBestDealerHandResult(playerTotal, dealerEvalHands) {
    const intelligence = currentEncounterIntelligence();
    const knownBuild = knownPlayerBuildSummary();
    const resolved = dealerEvalHands.map((cards, index) => ({
      index,
      cards,
      total: handTotal(cards)
    }));
    if (resolved.length <= 1) {
      return resolved[0] || { index: 0, cards: [], total: currentBustLimit() + 1 };
    }
    if (intelligence < 2) {
      const viable = resolved.filter((entry) => entry.total <= currentBustLimit());
      return pickOne(viable.length ? viable : resolved);
    }
    const winningHands = resolved
      .filter((entry) => entry.total <= currentBustLimit() && entry.total > playerTotal)
      .sort((a, b) => a.total - b.total);
    if (winningHands.length) {
      if (knownBuild.dealerPressure >= 1) {
        return winningHands[0];
      }
      if (intelligence < 4 && winningHands.length > 1 && Math.random() < 0.35) {
        return winningHands[1];
      }
      return winningHands[0];
    }
    const survivingHands = resolved
      .filter((entry) => entry.total <= currentBustLimit())
      .sort((a, b) => b.total - a.total);
    if (survivingHands.length) {
      if (knownBuild.drawManipulation >= 2 && survivingHands.length > 1) {
        return survivingHands[0];
      }
      if (intelligence < 3.5 && survivingHands.length > 1 && Math.random() < 0.4) {
        return survivingHands[Math.min(1, survivingHands.length - 1)];
      }
      return survivingHands[0];
    }
    return resolved.sort((a, b) => a.total - b.total)[0] || { index: 0, cards: [], total: currentBustLimit() + 1 };
  }

  async function resolveTableEnd() {
    dealAnimationLock = true;
    updateActionButtons();
    updateAbilityStatus();
    triggerDealerAnimation();
    if (dealerHoleHidden) {
      dealerHoleHidden = false;
      if (!dealerHoleCounted && dealerHand[1]) {
        addToRunningCount(dealerHand[1]);
        dealerHoleCounted = true;
      }
      dealerRevealPulse = true;
      renderTable();
      dealerRevealPulse = false;
      await delay(430);
    }
    while (shouldDealerDraw()) {
      const dealerCard = drawCard("dealer");
      await flyCardFromDeck(dealerCardsEl);
      dealerHand.push(dealerCard);
      addToRunningCount(dealerCard);
      dealerAnimateIndex = dealerHand.length - 1;
      renderTable();
    }
    if (activeTools["dealer-distract"] > 0 && dealerHand.length) {
      const oldCard = dealerHand[dealerHand.length - 1];
      const newCard = drawCard("dealer");
      dealerHand[dealerHand.length - 1] = newCard;
      replaceCountedCard(oldCard, newCard);
      activeTools["dealer-distract"] -= 1;
      renderTable();
      setStatus("Dealer Distract triggered. Dealer redrew the last card.");
    }
    if (dealerHandsPool.length) {
      dealerHandsPool[0] = dealerHand;
    } else {
      dealerHandsPool = [dealerHand];
    }
    const dealerBaseHands = dealerHandsPool.length
      ? dealerHandsPool.map((hand) => hand.map((card) => cloneCard(card)))
      : [dealerHand.map((card) => cloneCard(card))];
    let tableWinGross = 0;

    tableHands.forEach((hand, idx) => {
      if (hand.state === "completed") {
        return;
      }
      if (!originalMode && tableDealerProfile === "chaotic" && hand.cards.length > 0 && dealerHand.length > 0 && Math.random() < 0.25) {
        const playerIdx = hand.cards.length - 1;
        const dealerIdx = 0;
        const tmp = hand.cards[playerIdx];
        hand.cards[playerIdx] = dealerHand[dealerIdx];
        dealerHand[dealerIdx] = tmp;
      }
      const player = handTotal(hand.cards);
      const dealerEvalHands = dealerBaseHands.map((dealerBaseHand) => simulateDealerHandForOutcome(dealerBaseHand, hand));
      const pickedDealer = chooseBestDealerHandResult(player, dealerEvalHands);
      const dealer = pickedDealer.total;
      const handState = ensureHandState(hand);
      let outcome = "push";
      if (player > currentBustLimit()) {
        outcome = "loss";
      } else if (dealer > currentBustLimit() || player > dealer) {
        outcome = "win";
      } else if (player < dealer) {
        outcome = "loss";
      }
      hand.state = "completed";
      hand.result = outcome;
      hand.playerTotal = player;
      hand.dealerTotal = dealer;
      if (outcome === "win") {
        const naturalBlackjack = isBlackjackHand(hand.cards);
        const blackjackBonus = naturalBlackjack ? blackjackPayoutMultiplier() : 1;
        const perfectTenBonus = hand.cards.some((card) => card.shopKey === "perfect-ten") && player === 21 ? 3 : 1;
        const payoutBonus = 1 + (handState.winPayoutBonus || 0);
        const twentyOneBonus = (player === 21 ? (handState.twentyOneWinBonus || 0) : 0) + passiveWinBonus(hand) + cardConditionalWinBonus(hand, handState);
        const taxSafeMultiplier = (handState.taxRelief || hasPassive("tax-shelter")) && currentEvent === "tax-table" ? 1 : eventBetMultiplier();
        const winAmount = Math.round((tableBetLocked * hand.betMultiplier * taxSafeMultiplier * blackjackBonus * perfectTenBonus * payoutBonus) + handState.extraWinBonus + twentyOneBonus);
        tableNet += winAmount;
        tableWinGross += winAmount;
        recordWinningCursedCards(hand.cards);
        if (!originalMode && naturalBlackjack) {
          recordNaturalBlackjackWin();
        }
      } else if (outcome === "loss") {
        tableNet -= handLossAmount(hand, handState);
      }
      applyEncounterResolutionCost();
      tableHands[idx] = hand;
    });

    const familySummary = familyOutcomeSummary();
    const familyWins = familySummary.filter((family) => family.outcome === "win").length;
    const familyLosses = familySummary.filter((family) => family.outcome === "loss").length;
    const failedTable = familyLosses > familyWins;
    const eliteRoundNumber = currentEliteRoundNumber();
    const previousEliteRoundsPlayed = currentEliteRoundsPlayed;
    const bossRoundWon = currentSpecialNodeType === "boss" ? familyWins > familyLosses : false;
    const bossRoundNumber = currentBossRoundNumber();
    const previousBossRoundsCleared = currentBossRoundsCleared;
    const encounterBlocksProgress = currentSpecialNodeType === "boss" || currentSpecialNodeType === "elite";
    if (currentSpecialNodeType === "boss") {
      if (bossRoundWon) {
        currentBossRoundsCleared = Math.min(3, currentBossRoundsCleared + 1);
      } else {
        runRareTracker.bossRoundLosses += 1;
      }
      currentEncounterCleared = currentBossRoundsCleared >= 3;
    } else if (currentSpecialNodeType === "elite") {
      currentEliteRoundsPlayed = Math.min(2, currentEliteRoundsPlayed + 1);
      currentEncounterCleared = currentEliteRoundsPlayed >= 2;
    } else {
      currentEncounterCleared = true;
    }
    const bossClearedThisTable = currentSpecialNodeType === "boss"
      && previousBossRoundsCleared < 3
      && currentBossRoundsCleared >= 3;
    const worldClearedThisTable = bossClearedThisTable && currentEncounterRule?.key === "belial";
    const loseLifeForFailure = !originalMode && (
      currentSpecialNodeType === "boss"
        ? !bossRoundWon
        : failedTable
    );
    const bossLostRound = currentSpecialNodeType === "boss" && bossRoundWon;
    const bossFullyDefeated = bossLostRound && currentEncounterCleared && previousBossRoundsCleared < 3;
    const bossReactionPromise = currentEncounterRule?.key === "lord-asmodeus" && bossLostRound
      ? playDealerImpactAnimation(bossFullyDefeated)
      : Promise.resolve();

    let tableStreakBonus = 1;
    if (familyWins >= 5) {
      tableStreakBonus = 1.2;
    } else if (familyWins >= 3) {
      tableStreakBonus = 1.08;
    }
    let streakBonusAdded = 0;
    if (tableStreakBonus > 1 && tableWinGross > 0) {
      streakBonusAdded = Math.round(tableWinGross * (tableStreakBonus - 1));
      tableNet += streakBonusAdded;
    }
    if (hasPassive("high-roller") && tableNet > 0 && winStreak > 0) {
      const highRollerBonus = winStreak * 10 * passiveCount("high-roller");
      tableNet += highRollerBonus;
      streakBonusAdded += highRollerBonus;
    }
    if (!originalMode && tableNet > 0) {
      let rewardIqGain = 0;
      if (tableNet >= 150) rewardIqGain += 0.5;
      if (tableNet >= 300) rewardIqGain += 0.5;
      if (tableNet >= 600) rewardIqGain += 1;
      if (tableWinGross >= 400) rewardIqGain += 0.5;
      if (streakBonusAdded >= 80) rewardIqGain += 0.5;
      if (rewardIqGain > 0) {
        raiseEnemyIntelligence(rewardIqGain);
      }
    }
    if (!originalMode) {
      let resultIqGain = 0;
      if (currentSpecialNodeType === "boss") {
        resultIqGain += bossRoundWon ? 1 : 2;
      } else if (currentSpecialNodeType === "elite") {
        resultIqGain += failedTable ? 2 : 1;
      } else if (currentSpecialNodeType === "fight") {
        resultIqGain += failedTable ? 2 : 1;
      }
      if (resultIqGain > 0) {
        raiseEnemyIntelligence(resultIqGain);
      }
    }
    if (currentEncounterCleared) {
      if (bossClearedThisTable) {
        bossesDefeatedThisRun += 1;
        updateBlackjackProgress({
          totalBossesDefeated: blackjackProgress.totalBossesDefeated + 1,
          worldOneClears: blackjackProgress.worldOneClears + (worldClearedThisTable ? 1 : 0),
          highestMapReached: Math.max(blackjackProgress.highestMapReached, currentWorldMapNumber)
        });
      }
      awardMaxTotalBonusForCurrentNode();
    }
    if (currentSpecialNodeType === "elite" && tableNet > 0) {
      tableNet = Math.round(tableNet * ELITE_PAYOUT_MULTIPLIER);
    }
    if (currentSpecialNodeType === "boss" && tableNet > 0) {
      tableNet = Math.round(tableNet * BOSS_PAYOUT_MULTIPLIER);
      if (hasPassive("boss-dividend")) {
        tableNet += 40 * passiveCount("boss-dividend");
      }
    }
    if (tableNet > 0 && !originalMode) {
      tableNet = Math.round(tableNet * runCursePayoutMultiplier());
    }
    runCash += tableNet;
    if (runCash < 0) {
      runCash = 0;
    }
    if (loseLifeForFailure) {
      runLives = Math.max(0, runLives - 1);
      runRareTracker.lifeLosses += 1;
      if (hasPassive("life-insurance")) {
        runCash += 60 * passiveCount("life-insurance");
      }
    }

    tableActive = false;
    roundOver = true;
    dealAnimationLock = false;
    tablesPlayed += 1;
    applyTableStreakOutcome();
    if (!originalMode && runLives <= 0) {
      runFailed = true;
      runFailReason = currentSpecialNodeType === "boss"
        ? `${currentEncounterRule?.label || "The boss"} took your last life.`
        : "You lost your last life on this table.";
      waitingForMapChoice = false;
      waitingForShopChoice = false;
      pendingMapNodeId = null;
      offeredRoutes = [];
      nextDealerChoiceKey = null;
      renderRouteChoices();
      updateMapPopupUI();
    } else if (!originalMode && encounterBlocksProgress && !currentEncounterCleared) {
      waitingForMapChoice = false;
      waitingForShopChoice = false;
      pendingMapNodeId = null;
      offeredRoutes = [];
      nextDealerChoiceKey = null;
      renderRouteChoices();
      updateMapPopupUI();
    } else {
      waitingForMapChoice = !originalMode;
    }
    let rareTitleUnlocks = [];
    if (!runFailed && worldClearedThisTable) {
      rareTitleUnlocks = unlockRareTitlesFromWorldClear();
    }
    const curseXpAward = buildRunCurseXpAward({ failed: runFailed, worldCleared: worldClearedThisTable });
    if (runFailed) {
      resetRareTitleStreaksForFailedRun();
      pushRecentRunLog(
        "Run lost",
        `${runFailReason || "The House closed the table before you could clear World 1."}${curseXpAward.total ? ` Bonus XP: +${curseXpAward.total} from ${activeRunCurseKeys().length} curse${activeRunCurseKeys().length === 1 ? "" : "s"}.` : ""}`,
        { bonusXp: curseXpAward.total }
      );
    } else if (worldClearedThisTable) {
      pushRecentRunLog(
        "World 1 cleared",
        `${currentEncounterRule?.label || "Final boss"} was beaten and the table released you with ${bossesDefeatedThisRun} boss clear${bossesDefeatedThisRun === 1 ? "" : "s"}.${rareTitleUnlocks.length ? ` Hidden titles: ${rareTitleUnlocks.join(", ")}.` : ""}${curseXpAward.total ? ` Bonus XP: +${curseXpAward.total} from ${activeRunCurseKeys().length} curse${activeRunCurseKeys().length === 1 ? "" : "s"}.` : ""}`,
        { bonusXp: curseXpAward.total }
      );
    }
    if (waitingForMapChoice) {
      buildBattleRoutes();
    } else if (!runFailed) {
      offeredRoutes = [];
      nextDealerChoiceKey = null;
      renderRouteChoices();
      updateMapPopupUI();
    }
    waitingForShopChoice = !runFailed && currentEncounterCleared && !originalMode && !firstShopShown && tablesPlayed >= 1;
    if (waitingForShopChoice) {
      firstShopShown = true;
      shopOffersDirty = true;
    }
    if (skillTrialRewardPending) {
      const rewardByTrial = {
        "high-stakes": "perfect-ten",
        "dealer-challenge": "control-plus",
        "hot-deck": "royal-wild",
        "no-bust": "guardian-card"
      };
      const rareReward = rewardByTrial[currentTrialType] || pickOne(["crown-card", "fate-card", "dealer-breaker"]);
      addOwnedCardCopies(rareReward, 1);
      updateBlackjackProgress({ skillTrialsCleared: blackjackProgress.skillTrialsCleared + 1 });
      runRareTracker.skillTrialsCleared += 1;
      if (hasPassive("trial-script")) {
        runCash += 35 * passiveCount("trial-script");
      }
      waitingForShopChoice = true;
      skillTrialRewardPending = false;
      setStatus(`Skill Trial cleared. ${SHOP_CARDS[rareReward].label} added to the deck pool.`);
    } else if (currentSpecialNodeType === "boss" && currentEncounterCleared && previousBossRoundsCleared < 3 && currentBossRoundsCleared >= 3) {
      const bossReward = grantBossSpecialReward();
      waitingForShopChoice = true;
      setStatus(`${currentEncounterRule.label} was defeated. ${SHOP_CARDS[bossReward].label} was added as a boss reward.`);
    }
    renderTable();
    renderHandBoard();
    updateActionButtons();
    updateAbilityStatus();
    if (runFailed) {
      updateTableStatus("Run failed");
      if (runLives <= 0) {
        setStatus(`Table End. Collect: ${fmtMoney(tableNet)}. Run failed: you are out of lives.`);
      }
    } else if (currentSpecialNodeType === "elite" && !currentEncounterCleared) {
      updateTableStatus("Elite round cleared");
      setStatus(`Table End. Collect: ${fmtMoney(tableNet)}. ${currentEncounterRule.label} round ${previousEliteRoundsPlayed + 1}/2 cleared. Next: round ${currentEliteRoundsPlayed + 1}/2.`);
    } else if (currentSpecialNodeType === "boss" && !currentEncounterCleared && bossRoundWon) {
      updateTableStatus("Boss round cleared");
      setStatus(`Table End. Collect: ${fmtMoney(tableNet)}. ${currentEncounterRule.label} round ${previousBossRoundsCleared + 1}/3 cleared. Next: round ${currentBossRoundsCleared + 1}/3.`);
    } else if (currentSpecialNodeType === "boss" && !currentEncounterCleared) {
      updateTableStatus("Boss round failed");
      setStatus(`Table End. Collect: ${fmtMoney(tableNet)}. ${currentEncounterRule.label} round ${bossRoundNumber}/3 failed. Lose 1 life and replay the round.`);
    } else if (loseLifeForFailure) {
      updateTableStatus("Life lost");
      setStatus(`Table End. Collect: ${fmtMoney(tableNet)}. The table went against you, so you lost 1 life.`);
    } else {
      updateTableStatus("Collect winnings");
      setStatus(`Table End. Collect: ${fmtMoney(tableNet)}.${streakBonusAdded > 0 ? ` Table streak bonus x${tableStreakBonus.toFixed(2)} added ${fmtMoney(streakBonusAdded)}.` : " No table streak bonus (needs 3+ wins)."}${waitingForShopChoice ? " Visit the shop, then continue." : waitingForMapChoice ? " Choose your next direction on the map, then press Start Next Table." : " Press Hit to start a new table."}`);
    }
    updateShopUI();
    updateMapPopupUI();
    saveBlackjackCheckpoint();
    await bossReactionPromise;
    if (!runFailed && currentSpecialNodeType === "elite" && !currentEncounterCleared) {
      await delay(500);
      startTable();
      return;
    }
    if (!runFailed && currentSpecialNodeType === "boss" && !currentEncounterCleared && bossRoundWon) {
      await delay(650);
      startTable();
      return;
    }
    updateAdviceText(false);
  }

  function markActiveHandCompleted(outcome, message, payoutMultiplier = 1) {
    saveActiveHandState();
    const hand = tableHands[activeHandIndex];
    const handState = ensureHandState(hand);
    hand.state = "completed";
    hand.result = outcome;
    hand.playerTotal = handTotal(hand.cards);
    hand.dealerTotal = null;
    if (outcome === "loss") {
      tableNet -= handLossAmount(hand, handState);
    } else if (outcome === "win") {
      const naturalBlackjack = isBlackjackHand(hand.cards);
      const perfectTenBonus = hand.cards.some((card) => card.shopKey === "perfect-ten") && hand.playerTotal === 21 ? 3 : 1;
      const payoutBonus = 1 + (handState.winPayoutBonus || 0);
      const twentyOneBonus = (hand.playerTotal === 21 ? (handState.twentyOneWinBonus || 0) : 0) + passiveWinBonus(hand) + cardConditionalWinBonus(hand, handState);
      const taxSafeMultiplier = (handState.taxRelief || hasPassive("tax-shelter")) && currentEvent === "tax-table" ? 1 : eventBetMultiplier();
      tableNet += Math.round((tableBetLocked * hand.betMultiplier * taxSafeMultiplier * payoutMultiplier * perfectTenBonus * payoutBonus) + handState.extraWinBonus + twentyOneBonus);
      recordWinningCursedCards(hand.cards);
      if (!originalMode && naturalBlackjack) {
        recordNaturalBlackjackWin();
      }
    }
    applyEncounterResolutionCost();

    renderHandBoard();
    updateActionButtons();
    if (moveToNextPlayableHand()) {
      setStatus(`${message} Choose next hand or continue actions.`);
      updateTableStatus("Select next hand");
      return;
    }
    resolveTableEnd();
  }

  function lockActiveHandAt21(message) {
    if (!tableHands[activeHandIndex] || tableHands[activeHandIndex].state !== "playing") {
      return false;
    }
    if (handTotal(playerHand) !== currentBustLimit()) {
      return false;
    }
    firstMove = false;
    saveActiveHandState();
    tableHands[activeHandIndex].state = "standing";
    renderHandBoard();
    updateActionButtons();
    updateAbilityStatus();
    if (moveToNextPlayableHand()) {
      setStatus(message);
      updateTableStatus(`${currentBustLimit()} locked - select next hand`);
      return true;
    }
    resolveTableEnd();
    return true;
  }

  function isBlackjackHand(cards) {
    if (!cards || cards.length !== 2) {
      return false;
    }
    const hasAce = cards.some((c) => c.rank === "A");
    const hasCrown = cards.some((c) => c.shopKey === "crown-card");
    const hasTenPoint = cards.some((c) => c.rank === "10" || c.rank === "J" || c.rank === "Q" || c.rank === "K");
    return handTotal(cards) === currentBustLimit() && ((hasAce && hasTenPoint) || (hasAce && hasCrown));
  }

  async function autoSplitCurrentHandFromCard() {
    if (playerHand.length !== 2) {
      return false;
    }
    dealAnimationLock = true;
    updateActionButtons();
    const baseHand = tableHands[activeHandIndex];
    const splitAnchorCard = playerHand[1];
    const activeDraw = drawCard("player");
    const splitDraw = drawCard("player");
    playerHand = [playerHand[0]];
    saveActiveHandState();
    renderTable();
    renderHandBoard();
    await flyCardFromDeck(activeMiniCardsEl());
    playerHand.push(activeDraw);
    addToRunningCount(activeDraw);
    const newSplitHand = {
      hand: 0,
      familyId: baseHand.familyId || baseHand.hand || (activeHandIndex + 1),
      state: "playing",
      result: "",
      playerTotal: null,
      dealerTotal: null,
      cards: [splitAnchorCard],
      firstMove: true,
      betMultiplier: baseHand.betMultiplier,
      shopState: createDefaultHandState(),
      eventKey: baseHand.eventKey,
      fromSplit: true
    };
    tableHands.splice(activeHandIndex + 1, 0, newSplitHand);
    baseHand.fromSplit = true;
    baseHand.firstMove = true;
    applyEncounterRuleToSplitHand(baseHand);
    applyEncounterRuleToSplitHand(newSplitHand);
    renumberHands();
    playerAnimateIndex = 1;
    firstMove = true;
    saveActiveHandState();
    renderTable();
    renderHandBoard();
    await flyCardFromDeck(miniCardsElForHand(activeHandIndex + 1));
    newSplitHand.cards.push(splitDraw);
    addToRunningCount(splitDraw);
    tableHands[activeHandIndex + 1] = newSplitHand;
    const currentOutcome = settleSplitHandOutcome(activeHandIndex);
    const splitOutcome = settleSplitHandOutcome(activeHandIndex + 1);
    dealAnimationLock = false;
    renderTable();
    renderHandBoard();
    updateActionButtons();
    updateAbilityStatus();
    if (currentOutcome !== "playing") {
      if (!moveToNextPlayableHand()) {
        resolveTableEnd();
      }
    }
    if (currentOutcome === "bust" && splitOutcome === "bust") {
      setStatus("Both split hands busted immediately.");
    } else if (currentOutcome === "bust") {
      setStatus("Current split hand busted. Move to the next hand.");
    } else if (splitOutcome === "bust") {
      setStatus("Second split hand busted immediately.");
    } else if (currentOutcome === "locked") {
      setStatus(`Hand reached ${currentBustLimit()} and is locked.`);
    }
    return true;
  }

    actionButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
      if (dealAnimationLock) {
        return;
      }
      const action = btn.getAttribute("data-bj-action");
      if (roundOver) {
        if (waitingForShopChoice) {
          setStatus(waitingForMapChoice
            ? "Finish the shop, then choose your next direction on the map."
            : "Finish the shop, then press Start Next Table.");
          return;
        }
        if (waitingForMapChoice) {
          setStatus("Choose your next direction on the map, then press Start Next Table.");
          return;
        }
        startTable();
        setStatus("New table started.");
        return;
      }
      if (!tableActive) {
        return;
      }
      if (!tableHands[activeHandIndex] || tableHands[activeHandIndex].state !== "playing") {
        if (!moveToNextPlayableHand()) {
          resolveTableEnd();
        }
        return;
      }

      if (action === "hit") {
        dealAnimationLock = true;
        updateActionButtons();
        updateAbilityStatus();
        const eliteAbilityMessage = maybeTriggerEliteAbility("hit");
        const bossAbilityMessage = maybeTriggerBossAbility("hit");
        const bossSplitCullMessage = maybeTriggerBossSplitCull();
        const handState = activeHandState();
        const baseTotalBeforeDraw = handTotal(playerHand);
        let drawnCard;
        if ((handState.choiceDraws || 0) > 0) {
          drawnCard = await drawPlayerChoiceCard("Double Draw", "Choose one of two cards.");
          handState.choiceDraws -= 1;
        } else if (activeTools["lucky-draw"] > 0) {
          drawnCard = await drawPlayerChoiceCard("Lucky Draw", "Choose one of two cards for this draw.");
          activeTools["lucky-draw"] -= 1;
        } else if (sharpEyeReady()) {
          drawnCard = await drawPlayerChoiceCard("Sharp Eye", "Sharp Eye triggered. Choose one of two cards.");
          passiveState["sharp-eye-used"] += 1;
        } else {
          drawnCard = drawCard("player");
        }
        applyPendingValueEffects(drawnCard, handState, baseTotalBeforeDraw);
        await flyCardFromDeck(activeMiniCardsEl());
        playerHand.push(drawnCard);
        addToRunningCount(drawnCard);
        playerAnimateIndex = playerHand.length - 1;
        firstMove = false;
        const effectMessage = applyImmediateShopCardEffect(drawnCard);
        saveActiveHandState();
        renderTable();
        renderHandBoard();
        dealAnimationLock = false;
        updateActionButtons();
        updateAbilityStatus();
        if (handTotal(playerHand) > currentBustLimit()) {
          if (skillTrialActive && currentTrialType === "no-bust") {
            skillTrialFailed = true;
          }
          if (handState.delayCharges > 0) {
            handState.delayCharges -= 1;
            handState.delayUsed = true;
            tableHands[activeHandIndex].state = "standing";
            saveActiveHandState();
            renderHandBoard();
            if (!moveToNextPlayableHand()) {
              resolveTableEnd();
            } else {
              setStatus("Delay Card saved the hand from bust. Choose another hand.");
            }
            return;
          }
          if (saveOnePastCap(tableHands[activeHandIndex], handState)) {
            saveActiveHandState();
            renderTable();
            renderHandBoard();
            if (!moveToNextPlayableHand()) {
              resolveTableEnd();
            } else {
              setStatus("Second Breath saved the hand at the limit. Choose another hand.");
            }
            return;
          }
          markActiveHandCompleted("loss", "Bust. Hand lost.");
        } else if (lockActiveHandAt21(`Hand reached ${currentBustLimit()} and is locked.`)) {
          return;
        } else if (drawnCard.shopKey === "split-card" && playerHand.length === 2) {
          const didSplit = await autoSplitCurrentHandFromCard();
          if (didSplit) {
            setStatus(`Split Card triggered. Hand split automatically.${eliteAbilityMessage ? ` ${eliteAbilityMessage}` : ""}${bossAbilityMessage ? ` ${bossAbilityMessage}` : ""}${bossSplitCullMessage ? ` ${bossSplitCullMessage}` : ""}`);
            return;
          }
        } else {
          const baseMessage = effectMessage || `Card drawn. Choose your next action. Bet x${effectiveBetMultiplier()}.`;
          setStatus(`${baseMessage}${eliteAbilityMessage ? ` ${eliteAbilityMessage}` : ""}${bossAbilityMessage ? ` ${bossAbilityMessage}` : ""}${bossSplitCullMessage ? ` ${bossSplitCullMessage}` : ""}`);
        }
        return;
      }

      if (action === "stand") {
        const eliteAbilityMessage = maybeTriggerEliteAbility("stand");
        const bossAbilityMessage = maybeTriggerBossAbility("stand");
        const bossSplitCullMessage = maybeTriggerBossSplitCull();
        firstMove = false;
        saveActiveHandState();
        tableHands[activeHandIndex].state = "standing";
        renderHandBoard();
        updateActionButtons();
        if (!moveToNextPlayableHand()) {
          resolveTableEnd();
        } else {
          setStatus(`Hand stood. Choose another hand to play.${eliteAbilityMessage ? ` ${eliteAbilityMessage}` : ""}${bossAbilityMessage ? ` ${bossAbilityMessage}` : ""}${bossSplitCullMessage ? ` ${bossSplitCullMessage}` : ""}`);
        }
        return;
      }

      if (action === "double") {
        if (!firstMove) {
          setStatus("Double Down is only available as your first move.");
          return;
        }
        if (runCash < extraActionStakeCost()) {
          setStatus(`Double Down needs ${fmtMoney(extraActionStakeCost())} available.`);
          return;
        }
        dealAnimationLock = true;
        updateActionButtons();
        updateAbilityStatus();
        const eliteAbilityMessage = maybeTriggerEliteAbility("double");
        const bossAbilityMessage = maybeTriggerBossAbility("double");
        const bossSplitCullMessage = maybeTriggerBossSplitCull();
        const handState = activeHandState();
        runRareTracker.doubleUses += 1;
        if (passiveCount("split-fund") > passiveState["split-fund-used"]) {
          passiveState["split-fund-used"] += 1;
        }
        const baseTotalBeforeDraw = handTotal(playerHand);
        let drawnCard;
        if ((handState.choiceDraws || 0) > 0) {
          drawnCard = await drawPlayerChoiceCard("Double Draw", "Choose one of two cards.");
          handState.choiceDraws -= 1;
        } else if (activeTools["lucky-draw"] > 0) {
          drawnCard = await drawPlayerChoiceCard("Lucky Draw", "Choose one of two cards for this draw.");
          activeTools["lucky-draw"] -= 1;
        } else if (sharpEyeReady()) {
          drawnCard = await drawPlayerChoiceCard("Sharp Eye", "Sharp Eye triggered. Choose one of two cards.");
          passiveState["sharp-eye-used"] += 1;
        } else {
          drawnCard = drawCard("player");
        }
        applyPendingValueEffects(drawnCard, handState, baseTotalBeforeDraw);
        await flyCardFromDeck(activeMiniCardsEl());
        playerHand.push(drawnCard);
        addToRunningCount(drawnCard);
        playerAnimateIndex = playerHand.length - 1;
        firstMove = false;
        betMultiplier *= 2;
        const effectMessage = applyImmediateShopCardEffect(drawnCard);
        saveActiveHandState();
        renderTable();
        renderHandBoard();
        dealAnimationLock = false;
        updateActionButtons();
        updateAbilityStatus();
        if (handTotal(playerHand) > currentBustLimit()) {
          if (skillTrialActive && currentTrialType === "no-bust") {
            skillTrialFailed = true;
          }
          if (handState.delayCharges > 0) {
            handState.delayCharges -= 1;
            handState.delayUsed = true;
            tableHands[activeHandIndex].state = "standing";
            saveActiveHandState();
            renderHandBoard();
            if (!moveToNextPlayableHand()) {
              resolveTableEnd();
            } else {
              setStatus("Delay Card saved the Double Down hand from bust.");
            }
            return;
          }
          if (saveOnePastCap(tableHands[activeHandIndex], handState)) {
            saveActiveHandState();
            renderTable();
            renderHandBoard();
            if (!moveToNextPlayableHand()) {
              resolveTableEnd();
            } else {
              setStatus("Second Breath saved the Double Down hand at the limit.");
            }
            return;
          }
          markActiveHandCompleted("loss", "Double Down bust.");
        } else if (lockActiveHandAt21(`Hand reached ${currentBustLimit()} and is locked.`)) {
          return;
        } else {
          tableHands[activeHandIndex].state = "standing";
          if (!moveToNextPlayableHand()) {
            resolveTableEnd();
          } else {
            const baseMessage = effectMessage || "Double Down locked this hand. Choose next hand.";
            setStatus(`${baseMessage}${eliteAbilityMessage ? ` ${eliteAbilityMessage}` : ""}${bossAbilityMessage ? ` ${bossAbilityMessage}` : ""}${bossSplitCullMessage ? ` ${bossSplitCullMessage}` : ""}`);
          }
        }
        return;
      }

      if (action === "split") {
        if (!firstMove) {
          setStatus("Split is only available as your first move.");
          return;
        }
        if (playerHand.length !== 2) {
          setStatus("Split requires exactly two cards.");
          return;
        }
        if (splitCardValue(playerHand[0]) !== splitCardValue(playerHand[1])) {
          setStatus("Split requires same card value (for example 10/J/Q/K).");
          return;
        }
        if (runCash < extraActionStakeCost()) {
          setStatus(`Split needs ${fmtMoney(extraActionStakeCost())} available.`);
          return;
        }
        dealAnimationLock = true;
        updateActionButtons();
        updateAbilityStatus();
        const eliteAbilityMessage = maybeTriggerEliteAbility("split");
        const bossAbilityMessage = maybeTriggerBossAbility("split");
        const bossSplitCullMessage = maybeTriggerBossSplitCull();
        runRareTracker.splitUses += 1;
        if (passiveCount("split-fund") > passiveState["split-fund-used"]) {
          passiveState["split-fund-used"] += 1;
        }
        const baseHand = tableHands[activeHandIndex];
        const splitAnchorCard = playerHand[1];
        const activeDraw = drawCard("player");
        const splitDraw = drawCard("player");
        playerHand = [playerHand[0]];
        saveActiveHandState();
        renderTable();
        renderHandBoard();
        await flyCardFromDeck(activeMiniCardsEl());
        playerHand.push(activeDraw);
        addToRunningCount(activeDraw);
        const newSplitHand = {
          hand: 0,
          familyId: baseHand.familyId || baseHand.hand || (activeHandIndex + 1),
          state: "playing",
          result: "",
          playerTotal: null,
          dealerTotal: null,
          cards: [splitAnchorCard],
          firstMove: true,
          betMultiplier: baseHand.betMultiplier,
          shopState: createDefaultHandState(),
          eventKey: baseHand.eventKey,
          fromSplit: true
        };
        tableHands.splice(activeHandIndex + 1, 0, newSplitHand);
        baseHand.fromSplit = true;
        baseHand.firstMove = true;
        applyEncounterRuleToSplitHand(baseHand);
        applyEncounterRuleToSplitHand(newSplitHand);
        renumberHands();
        playerAnimateIndex = 1;
        firstMove = true;
        saveActiveHandState();
        renderTable();
        renderHandBoard();
        await flyCardFromDeck(miniCardsElForHand(activeHandIndex + 1));
        newSplitHand.cards.push(splitDraw);
        addToRunningCount(splitDraw);
        tableHands[activeHandIndex + 1] = newSplitHand;
        const currentOutcome = settleSplitHandOutcome(activeHandIndex);
        const splitOutcome = settleSplitHandOutcome(activeHandIndex + 1);
        dealAnimationLock = false;
        renderTable();
        renderHandBoard();
        updateActionButtons();
        updateAbilityStatus();
        if (currentOutcome !== "playing") {
          if (!moveToNextPlayableHand()) {
            resolveTableEnd();
          }
          return;
        }
        if (currentOutcome === "locked") {
          setStatus(`Hand reached ${currentBustLimit()} and is locked.`);
          return;
        }
        if (splitOutcome === "bust") {
          setStatus(`Split activated. The second split hand busted immediately.${eliteAbilityMessage ? ` ${eliteAbilityMessage}` : ""}${bossAbilityMessage ? ` ${bossAbilityMessage}` : ""}${bossSplitCullMessage ? ` ${bossSplitCullMessage}` : ""}`);
          return;
        }
        setStatus(`Split activated. New hand ${activeHandIndex + 2} added to the row.${eliteAbilityMessage ? ` ${eliteAbilityMessage}` : ""}${bossAbilityMessage ? ` ${bossAbilityMessage}` : ""}${bossSplitCullMessage ? ` ${bossSplitCullMessage}` : ""}`);
      }
    });
  });

  if (handBoardEl) {
    handBoardEl.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-select-hand]");
      if (!btn || !tableActive || roundOver || dealAnimationLock) {
        return;
      }
      const handIndex = Number(btn.getAttribute("data-select-hand")) - 1;
      if (Number.isNaN(handIndex) || !tableHands[handIndex] || tableHands[handIndex].state === "completed") {
        return;
      }
      if (tableHands[handIndex].state !== "playing") {
        return;
      }
      activeHandIndex = handIndex;
      startRound();
      setStatus(`Selected hand ${handIndex + 1}.`);
    });
  }

  if (routeChoicesEl) {
    routeChoicesEl.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-node-id]");
      if (!btn || !waitingForMapChoice) {
        return;
      }
      chooseBattleRoute(btn.getAttribute("data-node-id"));
    });
  }

  if (confirmRouteBtn) {
    confirmRouteBtn.addEventListener("click", () => {
      if (!waitingForMapChoice) {
        return;
      }
      if (!pendingMapNodeId) {
        setStatus("Choose a direction first.");
        return;
      }
      startTable();
    });
  }

  if (mapBtn) {
    mapBtn.addEventListener("click", () => {
      if (originalMode) {
        setStatus("Map is disabled in Original Blackjack mode.");
        return;
      }
      if (waitingForShopChoice) {
        setStatus("Close the shop first, then open the map.");
        return;
      }
      mapPreviewOpen = true;
      updateMapPopupUI();
      setStatus("Map opened.");
    });
  }

  if (closeMapBtn) {
    closeMapBtn.addEventListener("click", () => {
      if (waitingForMapChoice && !mapPreviewOpen) {
        setStatus("Choose direction to continue.");
        return;
      }
      mapPreviewOpen = false;
      updateMapPopupUI();
      setStatus("Map closed.");
    });
  }

  if (countHelperBtn) {
    countHelperBtn.addEventListener("click", () => {
      countHelperVisible = !countHelperVisible;
      updateCountHelperUI();
    });
  }

  if (showKeybindsCheck) {
    showKeybindsCheck.addEventListener("change", () => {
      setShowKeybinds(showKeybindsCheck.checked);
    });
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      if (settingsPanelEl) {
        settingsPanelEl.classList.toggle("hidden");
      }
      waitingForKeybindAction = "";
      renderKeybindSettings();
      updateKeybindStatus();
    });
  }

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      if (!homePanelEl) {
        window.location.href = "./index.html";
        return;
      }
      setHomePanelOpen(!homePanelOpen);
    });
  }

  if (continueRunBtn) {
    continueRunBtn.addEventListener("click", () => {
      if (!tableActive || !tableHands.length) {
        startTable();
      }
      setHomePanelOpen(false);
    });
  }

  if (freshRunBtn) {
    freshRunBtn.addEventListener("click", () => {
      resetCurrentRun({ startImmediately: true });
      setHomePanelOpen(false);
      setStatus("Fresh Death Blackjack run started.");
    });
  }

  if (resetKeybindsBtn) {
    resetKeybindsBtn.addEventListener("click", () => {
      resetBlackjackKeybinds();
    });
  }

  if (keybindSettingsEl) {
    keybindSettingsEl.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-keybind-action]");
      if (!btn) {
        return;
      }
      waitingForKeybindAction = btn.getAttribute("data-keybind-action") || "";
      renderKeybindSettings();
      updateKeybindStatus(`Press a key for ${KEYBIND_LABELS[waitingForKeybindAction]?.label || "this action"}.`);
    });
  }

  if (titleSettingsEl) {
    titleSettingsEl.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-title-key]");
      if (!btn || btn.disabled) {
        return;
      }
      const key = btn.getAttribute("data-title-key");
      if (!key || !TITLE_META[key] || !unlockedTitleKeys().includes(key)) {
        updateTitleStatus("That title is still locked.");
        return;
      }
      const equipped = currentTitleKeys();
      const next = equipped.includes(key)
        ? equipped.filter((entry) => entry !== key)
        : equipped.length < 3
          ? [...equipped, key]
          : null;
      if (!next) {
        updateTitleStatus("Only 3 titles can be equipped at once.");
        return;
      }
      updateBlackjackProgress({ equippedTitles: next });
      renderTitleSettings();
      updateTitleStatus(
        equipped.includes(key)
          ? `${TITLE_META[key].label} unequipped.`
          : `${TITLE_META[key].label} equipped. ${TITLE_META[key].effect}`
      );
      updateTableStatus();
      saveBlackjackCheckpoint();
    });
  }

  [freeOfferEl, cardOfferGridEl, otherOfferGridEl].forEach((root) => {
    if (!root) {
      return;
    }
    root.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-offer-kind][data-offer-key]");
      if (!btn || btn.disabled) {
        return;
      }
      claimOffer(
        btn.getAttribute("data-offer-kind"),
        btn.getAttribute("data-offer-key"),
        btn.getAttribute("data-offer-free") === "true"
      );
    });
  });

  if (startNextTableBtn) {
    startNextTableBtn.addEventListener("click", () => {
      if (!waitingForShopChoice) {
        return;
      }
      applyQueuedToolsFromShop();
      waitingForShopChoice = false;
      currentSpecialNodeType = "";
      shopOffersDirty = true;
      updateShopUI();
      updateMapPopupUI();
      updateActionButtons();
      if (waitingForMapChoice) {
        setStatus("Shop closed. Choose your next direction on the map.");
        return;
      }
      setStatus("Shop closed. Press Start Next Table to continue.");
    });
  }

  if (trainingBtn) {
    trainingBtn.addEventListener("click", () => {
      if (!waitingForShopChoice) {
        return;
      }
      forgeMode = "training";
      forgeFusionSecondCardKey = "";
      renderForgePanel();
    });
  }

  if (fusionBtn) {
    fusionBtn.addEventListener("click", () => {
      if (!waitingForShopChoice) {
        return;
      }
      forgeMode = "fusion";
      renderForgePanel();
    });
  }

  if (forgeTargetListEl) {
    forgeTargetListEl.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-forge-target-key]");
      if (!btn || !waitingForShopChoice || forgeActionSpent) {
        return;
      }
      const pickedKey = btn.getAttribute("data-forge-target-key") || "";
      if (forgeMode === "fusion") {
        toggleForgeFusionTarget(pickedKey);
      } else {
        forgeTargetCardKey = pickedKey;
      }
      renderForgePanel();
    });
  }

  if (forgeApplyBtn) {
    forgeApplyBtn.addEventListener("click", () => {
      if (!waitingForShopChoice) {
        return;
      }
      if (forgeMode === "fusion") {
        applyFusionUpgrade();
      } else {
        applyTrainingUpgrade(forgeTargetCardKey);
      }
    });
  }

  if (choiceOptionsEl && choicePopupEl) {
    choiceOptionsEl.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-choice-index]");
      if (!btn || !choiceResolver) {
        return;
      }
      const idx = Number(btn.getAttribute("data-choice-index"));
      const picked = choiceResolver.cards[idx];
      const resolve = choiceResolver.resolve;
      choiceResolver = null;
      choicePopupEl.classList.add("hidden");
      choiceOptionsEl.innerHTML = "";
      resolve(picked);
    });
  }

  function isTypingTarget(target) {
    if (!target || !(target instanceof HTMLElement)) {
      return false;
    }
    const tagName = target.tagName;
    return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target.isContentEditable;
  }

  function clickEnabledButton(button) {
    if (!button || button.disabled) {
      return false;
    }
    button.click();
    return true;
  }

  function clickActionButton(action) {
    return clickEnabledButton(bjScreen.querySelector(`[data-bj-action="${action}"]`));
  }

  function selectRelativePlayableHand(direction) {
    if (!tableActive || roundOver || dealAnimationLock || tableHands.length < 2) {
      return false;
    }
    for (let offset = 1; offset <= tableHands.length; offset += 1) {
      const nextIndex = (activeHandIndex + (direction * offset) + tableHands.length) % tableHands.length;
      const nextHand = tableHands[nextIndex];
      if (!nextHand || nextHand.state !== "playing") {
        continue;
      }
      activeHandIndex = nextIndex;
      startRound();
      setStatus(`Selected hand ${nextIndex + 1}.`);
      return true;
    }
    return false;
  }

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (waitingForKeybindAction) {
      event.preventDefault();
      const normalized = normalizedKeyName(key);
      if (normalized === "tab") {
        updateKeybindStatus("Tab is reserved. Pick another key.");
        return;
      }
      customKeybinds[waitingForKeybindAction] = [normalized];
      waitingForKeybindAction = "";
      saveBlackjackKeybinds();
      renderKeybindSettings();
      addKeybindChips();
      updateKeybindStatus("Keybind updated.");
      return;
    }

    if (choiceResolver && (key === "1" || key === "2")) {
      const choiceBtn = choiceOptionsEl?.querySelector(`[data-choice-index="${Number(key) - 1}"]`);
      if (clickEnabledButton(choiceBtn)) {
        event.preventDefault();
      }
      return;
    }

    if (waitingForMapChoice && /^[1-9]$/.test(key)) {
      const routeButtons = Array.from(routeChoicesEl?.querySelectorAll("[data-node-id]") || []).filter((btn) => !btn.disabled);
      const routeBtn = routeButtons[Number(key) - 1];
      if (clickEnabledButton(routeBtn)) {
        event.preventDefault();
      }
      return;
    }

    if (key === "enter") {
      const didClick = waitingForShopChoice
        ? clickEnabledButton(startNextTableBtn)
        : waitingForMapChoice
          ? clickEnabledButton(confirmRouteBtn)
          : clickActionButton("hit");
      if (didClick) {
        event.preventDefault();
      }
      return;
    }

    if (keybindMatches("map", key)) {
      const didClick = mapPreviewOpen ? clickEnabledButton(closeMapBtn) : clickEnabledButton(mapBtn);
      if (didClick) {
        event.preventDefault();
      }
      return;
    }

    if (key === "escape" && mapPreviewOpen) {
      if (clickEnabledButton(closeMapBtn)) {
        event.preventDefault();
      }
      return;
    }

    if (keybindMatches("prevHand", key)) {
      if (selectRelativePlayableHand(-1)) {
        event.preventDefault();
      }
      return;
    }

    if (keybindMatches("nextHand", key)) {
      if (selectRelativePlayableHand(1)) {
        event.preventDefault();
      }
      return;
    }

    const action = ["hit", "stand", "double", "split"].find((actionKey) => keybindMatches(actionKey, key));
    if (action && clickActionButton(action)) {
      event.preventDefault();
    }
  });

  window.addEventListener("beforeunload", () => {
    persistBlackjackRunSave();
  });

  if (explainToggleBtn) {
    explainToggleBtn.addEventListener("click", () => {
      showLongRunInfo = !showLongRunInfo;
      renderRunInfo();
    });
  }

  if (exportSaveBtn) {
    exportSaveBtn.addEventListener("click", () => {
      exportBlackjackSaveCode();
    });
  }

  if (importSaveBtn) {
    importSaveBtn.addEventListener("click", () => {
      setSaveCodePanelOpen(!saveCodePanelOpen);
      if (saveCodePanelOpen && saveCodeInputEl) {
        saveCodeInputEl.focus();
      }
    });
  }

  if (deleteSaveBtn) {
    deleteSaveBtn.addEventListener("click", () => {
      deleteBlackjackSaveData();
    });
  }

  if (copySaveBtn) {
    copySaveBtn.addEventListener("click", () => {
      copyBlackjackSaveCode();
    });
  }

  if (applySaveBtn) {
    applySaveBtn.addEventListener("click", () => {
      importBlackjackSaveCode();
    });
  }

  if (devAddCashBtn) {
    devAddCashBtn.addEventListener("click", () => {
      devAddCash(1000);
    });
  }

  if (devAddLivesBtn) {
    devAddLivesBtn.addEventListener("click", () => {
      devAddLives(3);
    });
  }

  if (devOpenCampBtn) {
    devOpenCampBtn.addEventListener("click", () => {
      devOpenNodeShop("camp", "Camp");
    });
  }

  if (devOpenForgeBtn) {
    devOpenForgeBtn.addEventListener("click", () => {
      devOpenNodeShop("forge", "Forge");
    });
  }

  if (devOpenVaultBtn) {
    devOpenVaultBtn.addEventListener("click", () => {
      devTriggerVault();
    });
  }

  if (devGrantLoadoutBtn) {
    devGrantLoadoutBtn.addEventListener("click", () => {
      devGrantTestLoadout();
    });
  }

  if (restartRunBtn) {
    restartRunBtn.addEventListener("click", () => {
      resetCurrentRun();
      setStatus(originalMode ? "Original Blackjack mode restarted." : "Death Blackjack run restarted.");
    });
  }

    if (originalModeBtn) {
    originalModeBtn.addEventListener("click", () => {
      originalMode = !originalMode;
      resetCurrentRun();
      setStatus(originalMode ? "Original Blackjack mode active. No Death modifiers." : "Death Blackjack mode active.");
    });
  }
  blackjackProgress = loadBlackjackProgress();
  customKeybinds = loadBlackjackKeybinds();
  addKeybindChips();
  renderKeybindSettings();
  renderTitleSettings();
  renderHomeScreen();
  setShowKeybinds(false);
  DEALER_SLAM_FRAME_URLS.forEach((frameUrl) => {
    const preload = new Image();
    preload.src = frameUrl;
  });
  updateCountHelperUI();
  startAdviceRotation();
  updateAdviceText(false);
  setSaveCodePanelOpen(false);
  if (FRESH_RUN_MODE) {
    try {
      window.localStorage.removeItem(BLACKJACK_RUN_SAVE_KEY);
    } catch {}
    resetCurrentRun({ skipSave: true, startImmediately: !homePanelEl });
    if (!homePanelEl) {
      history.replaceState({}, document.title, window.location.pathname);
    }
  } else if (RESUME_RUN_MODE) {
    if (!restoreBlackjackRunSave()) {
      try {
        window.localStorage.removeItem(BLACKJACK_RUN_SAVE_KEY);
      } catch {}
      resetCurrentRun({ skipSave: true, startImmediately: !homePanelEl });
      setStatus(homePanelEl ? "Run save could not be restored. Fresh run loaded." : "Run save could not be restored. Fresh run loaded.");
    }
    if (!homePanelEl) {
      history.replaceState({}, document.title, window.location.pathname);
    }
  } else {
    resetCurrentRun({ skipSave: true, startImmediately: !homePanelEl });
  }
  if (liveTableLooksBroken()) {
    try {
      window.localStorage.removeItem(BLACKJACK_RUN_SAVE_KEY);
    } catch {}
    resetCurrentRun({ skipSave: true, startImmediately: !homePanelEl });
    setStatus(homePanelEl ? "Broken startup state was discarded. Open Home and start a fresh run." : "Broken startup state was discarded. Fresh run loaded.");
  }
  setHomePanelOpen(!!homePanelEl);
}
