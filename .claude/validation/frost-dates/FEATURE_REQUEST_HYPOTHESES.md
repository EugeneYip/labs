# Feature request hypotheses: Frost Dates

Recorded during Comparative Research (2026-10-11). **None is to be built.**

**Status:**
- *Hypothetical*.
- *Indirect*: public evidence of the need.
- *Direct*: a Frost Dates user asked. There are none yet.

**Labs fit:**
- *Yes*: static and local.
- *Amendment*: needs an offline data script.
- *No*: needs servers, accounts or keys.

A request becomes evidence only when a real user needs it.

| # | Idea | Status and signal | Labs fit | Main cost or risk |
|---|---|---|---|---|
| 1 | Dates corrected against local stations at frost-prone sites | **Indirect, strongest:** Canberra about 5 weeks optimistic (`notes/accuracy-check.md`); "the station isn't where the garden is" pain [V] | Amendment (offline correction with GHCN, CC0) | Method design; a different product in effect |
| 2 | A warmth-aware or qualified planting calendar for mild climates (built 2026-10-11, commit 291fac5) | **Indirect, strong:** the RHS uses 16 °C; NZ uses 18 °C soil; the maritime calendar is 1.5–2.5 months early [V] | Yes (night temperatures are already in the record) | Rules per crop; keeping it simple |
| 3 | Per-place pages (a URL for each town) for search and sharing | Indirect: place queries in Australia, NZ and Germany show no tool [SERP] | Amendment (pre-built pages) | Build pipeline; thin-content risk |
| 4 | Place in the address, so a result can be shared | Hypothetical | Yes | Low |
| 5 | Lower thresholds for growers (25 °F, 20 °F) | Indirect: the MRCC tool added them for high tunnels [V] | Yes | Scope beyond home gardeners |
| 6 | Nightly frost alerts | Indirect: many 2025–26 apps [S] | No (push notifications need servers) | Infrastructure; forecast liability |
| 7 | German interface and place search | Indirect: German queries show no tool [SERP] | Yes | Translation upkeep |
| 8 | Incremental refresh (fetch only new days) | Internal: cuts a return visit from about 83 calls to about 1 [V] | Yes | Low. A good idea regardless |
| 9 | Ground-frost estimate | Indirect: ground frost matters for seedlings [V] | Yes technically | No validated method from 2 m air temperature |
| 10 | Station comparison ("nearest station says …") | Indirect: gardeners seek closer stations [V] | Amendment | Data pipeline |
| 11 | `models=era5_land` for a consistent record | Internal [V] | Yes | Doesn't improve accuracy (own check) |
| 12 | Hardiness zone or growing degree days | Hypothetical | Yes | Scope creep |

Building anything requires a separate owner decision.
