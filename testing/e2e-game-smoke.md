# Game E2E Smoke (Playwright Client)

This is a smoke checklist for `apps/game` using the Playwright client script.

## Prereqs

- `pnpm dev` running with game at `http://localhost:5002`
- Run from repo root

## Commands

1. Move unit by clicking a target tile
```
node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url "http://localhost:5002/?roomId=room-1770779986770" \
  --click-selector "[data-testid='tile-7-8']" \
  --actions-json '{"steps":[{"buttons":[],"frames":6}]}' \
  --iterations 1 \
  --pause-ms 300 \
  --screenshot-dir "output/web-game/run-5"
```

Expected (state JSON):
- `selectedUnit` is `unit-1`
- `selectedTile` is `{row:7,col:8}`
- `message` is `单位已移动`

2. Open tech panel
```
node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url "http://localhost:5002/?roomId=room-1770779986770" \
  --click-selector "[data-testid='action-tech']" \
  --actions-json '{"steps":[{"buttons":[],"frames":4}]}' \
  --iterations 1 \
  --pause-ms 300 \
  --screenshot-dir "output/web-game/run-6"
```

Expected (state JSON):
- `activePanel` is `tech`
- `message` is `已打开科技树面板`

3. End turn
```
node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url "http://localhost:5002/?roomId=room-1770779986770" \
  --click-selector "[data-testid='turn-end']" \
  --actions-json '{"steps":[{"buttons":[],"frames":4}]}' \
  --iterations 1 \
  --pause-ms 300 \
  --screenshot-dir "output/web-game/run-7"
```

Expected (state JSON):
- `turn` increments

4. Build in city (city preselected)
```
node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url "http://localhost:5002/?roomId=room-1770779986770&select=city" \
  --click-selector "[data-testid='city-build']" \
  --actions-json '{"steps":[{"buttons":[],"frames":4}]}' \
  --iterations 1 \
  --pause-ms 300 \
  --screenshot-dir "output/web-game/run-8"
```

Expected (state JSON):
- `selectedCity` is `city-1`
- `cities[0].productionQueue` is `1`
- `message` is `已加入生产队列：粮仓`
