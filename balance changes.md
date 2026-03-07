# Balance Changes

## Version
v0.1 (current baseline)

This file tracks balance values currently active in `gambling-king.js`.

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
