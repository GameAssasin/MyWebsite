# Balance Changes

## Version
Website v0.2 (current)

This file tracks website-version changes and Gambling King balance/content updates.

## Website v0.2 vs Official Live v0.1 (2026-03-08)

### Death Wheel: Added / Changed in v0.2
- Added full playable Death Wheel page and roulette-ring UI.
- Added balanced 36-slot type system with live slot labels and type colors.
- Added run bar (Cash, Spins, Risk, Lives), Effects panel, and Event Log.
- Added shop system with rotating offers, manual open button, skip-popup toggle, and shop-landing reward mode.
- Added triple spin unlock at `$3000` (3 spins for `2.5x` cost; spin counter counts triple action as 1 spin).
- Added `2x speed` mode (faster animation, not skip).
- Added `Show info` mode and inline owned-effect math in Effects list.
- Added live-updating slot-count cards in "Balanced 36-Slot Death Wheel" section.
- Removed debt system from Death Wheel (no debt carry).
- Run-end rules now include immediate loss at `Money = $0` and immediate loss at `Lives = 0`.
- Starting cash changed:
  - `$1000 -> $1200`
- Death life-loss behavior changed:
  - `always lose 1 life on unshielded Death -> 45% chance to lose 1 life`

### Changed
- Global payout easing enabled:
  - `GLOBAL_PAYOUT_EASE_MULTIPLIER: 1 -> 2`
- Hell-specific payout correction added:
  - `HELL_PAYOUT_FACTOR: 1 -> 0.7`
- Effective Hell payout multiplier vs old baseline formula:
  - `1.0x -> 1.4x`
- `SPIN_COST` kept at:
  - `$115` (unchanged)
- Gambling King difficulty tuning updated (Hard+ band):
  - `Hard startMoney: 553 -> 760`
  - `Expert startMoney: 479 -> 730`
  - `Master startMoney: 291 -> 700`
  - `Nightmare startMoney: 245 -> 670`
  - `Insane startMoney: 199 -> 640`
  - `Hell startMoney: 168 -> 610`
  - Hard+ also received updated `debtLimit`, `baseInterest`, `feeBase`, `feeGrowth`, `payoutScale`, and `devilChance` values.

### Renamed
- Balance page notes link text:
  - `Open source balance notes file` -> `Balance notes`
- Balance page status wording:
  - `Gambling King: v0.1 baseline available now.` -> `Gambling King: v0.2 current live balance.`
- Gambling King Objective wording rewritten for clarity:
  - Old focus: "earn as much money as possible"
  - New focus: explicit win/loss conditions (survive target spins, lose at 10000 debt)
- Upgrade panel labels:
  - `Inventory` button wording aligned to `Upgrades`
  - Long upgrade descriptions -> short default descriptions

### Added
- New v0.2 section on balance page (from->to summary format).
- New quick toggle in Gambling King:
  - `Show full info` checkbox next to `Show keybinds`
- Upgrade description mode system:
  - Short mode (default)
  - Full-info mode (toggle on)
- Upgrade meta visibility mode:
  - `Level/Cost/Bonus` lines hidden in short mode, shown in full mode
- Themed inventory scrollbar styling (replaces default look in modal)

## Difficulty Stats (v0.1)

| Difficulty | Start Money | Debt Limit | Base Interest | Fee Base | Fee Growth | Payout Scale | Devil Chance |
|---|---:|---:|---:|---:|---:|---:|---:|
| Noob | 1169 | 2763 | 0.0345 | 24 | 1.138 | 1.4025 | 0.0437 |
| Easy | 956 | 2338 | 0.0437 | 31 | 1.182 | 1.2963 | 0.0518 |
| Casual | 808 | 2019 | 0.0564 | 41 | 1.233 | 1.19 | 0.069 |
| Normal | 808 | 2019 | 0.0587 | 45 | 1.241 | 1.1688 | 0.069 |
| Hard | 553 | 1381 | 0.0863 | 69 | 1.389 | 1.0311 | 0.1035 |
| Expert | 479 | 1190 | 0.0989 | 85 | 1.475 | 0.9775 | 0.1207 |
| Master | 291 | 750 | 0.1645 | 152 | 1.848 | 0.6656 | 0.2024 |
| Nightmare | 245 | 643 | 0.1897 | 184 | 2.037 | 0.6196 | 0.2277 |
| Insane | 199 | 536 | 0.215 | 222 | 2.24 | 0.5661 | 0.253 |
| Hell | 168 | 428 | 0.2404 | 266 | 2.417 | 0.5202 | 0.2783 |

## Combo Multipliers (v0.1)
- `x2`: `1.05`
- `x3`: `2.7`
- `x4`: `2.8`
- `x5`: `3.2`
- `x6`: `3.6`
- `x7`: `4.0`
- `x8`: `4.5`

## Spin Economy (v0.1)
- Fixed spin cost: `$115` per spin
- Bet size control removed (no manual bet scaling)

## Payout Tuning (v0.1)
- Global payout tuning multiplier: `0.65`
- Extra slot payout penalty: `1 / (1 + 0.3 * extraSlots)`

## Reel Rules (v0.1)
- Base reel slots: `3`
- Max reel slots: `8`
- Reel Expansion adds +1 slot per level (up to max)
- Base upgrade costs are globally multiplied by `1.15`
- Reel Expansion cost: `getCost(320, level, 2.45) * (1 + 0.35 * extraSlots)`
