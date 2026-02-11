# Playtest Report (Game)

Date: 2026-02-11
Target: `apps/game` at `http://localhost:5002/?roomId=room-1770779986770`

## Summary
- Map now renders reliably with starter unit/city.
- Primary buttons respond with visible feedback.
- E2E smoke flows confirmed via Playwright client with state snapshots.

## Runs

1. Move unit by tile click
- Command: `node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js --url "http://localhost:5002/?roomId=room-1770779986770" --click-selector "[data-testid='tile-7-8']" --actions-json '{"steps":[{"buttons":[],"frames":6}]}' --iterations 1 --pause-ms 300 --screenshot-dir "output/web-game/run-5"`
- Result: unit moved to (7,8), movement reduced, toast shown.
- Artifacts: `output/web-game/run-5/shot-0.png`, `output/web-game/run-5/state-0.json`

2. Open tech panel
- Command: `node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js --url "http://localhost:5002/?roomId=room-1770779986770" --click-selector "[data-testid='action-tech']" --actions-json '{"steps":[{"buttons":[],"frames":4}]}' --iterations 1 --pause-ms 300 --screenshot-dir "output/web-game/run-6"`
- Result: tech panel shown, toast shown.
- Artifacts: `output/web-game/run-6/shot-0.png`, `output/web-game/run-6/state-0.json`

3. End turn
- Command: `node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js --url "http://localhost:5002/?roomId=room-1770779986770" --click-selector "[data-testid='turn-end']" --actions-json '{"steps":[{"buttons":[],"frames":4}]}' --iterations 1 --pause-ms 300 --screenshot-dir "output/web-game/run-7"`
- Result: turn incremented to 2.
- Artifacts: `output/web-game/run-7/shot-0.png`, `output/web-game/run-7/state-0.json`

4. Build in city
- Command: `node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js --url "http://localhost:5002/?roomId=room-1770779986770&select=city" --click-selector "[data-testid='city-build']" --actions-json '{"steps":[{"buttons":[],"frames":4}]}' --iterations 1 --pause-ms 300 --screenshot-dir "output/web-game/run-8"`
- Result: production queue count = 1, toast shown.
- Artifacts: `output/web-game/run-8/shot-0.png`, `output/web-game/run-8/state-0.json`

## Notes
- Initial Playwright screenshots were cropped due to canvas size; fixed by sizing the hidden test canvas to viewport.
- Added `data-testid` hooks for deterministic automation.
