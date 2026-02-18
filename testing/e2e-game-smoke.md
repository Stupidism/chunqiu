# Game E2E Core Flow (Playwright Client)

`apps/game` 的 E2E 只覆盖关键主流程。
细粒度规则（每个操作后的状态正确性、特定状态下的渲染细节）由 `vitest` 单元测试负责。

## Scope

E2E 仅验证以下关键链路：

1. 回合流转（点击下一回合）。
2. 城市生产入队（点击建造）。
3. 结束对局（点击投降）。
4. 镜头归位（点击归位）。

## Prereqs

- `pnpm dev` 运行中，`game` 服务地址为 `http://localhost:5002`
- 在仓库根目录执行

## Commands

### 1) 回合流转

```bash
node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url "http://localhost:5002/?roomId=room-1770779986770" \
  --click-selector "[data-testid='turn-end']" \
  --actions-json '{"steps":[{"buttons":[],"frames":6}]}' \
  --iterations 1 \
  --pause-ms 300 \
  --screenshot-dir "output/web-game/run-89"
```

Expected (`output/web-game/run-89/state-0.json`):
- `turn = 2`
- `phase = "playing"`

### 2) 城市建造

```bash
node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url "http://localhost:5002/?roomId=room-1770779986770&select=city" \
  --click-selector "[data-testid='city-build']" \
  --actions-json '{"steps":[{"buttons":[],"frames":6}]}' \
  --iterations 1 \
  --pause-ms 300 \
  --screenshot-dir "output/web-game/run-90"
```

Expected (`output/web-game/run-90/state-0.json`):
- `selectedCity = "city-1"`
- `cities[0].productionQueue = 1`
- `message = "已加入生产队列：粮仓"`

### 3) 投降结束

```bash
node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url "http://localhost:5002/?roomId=room-1770779986770" \
  --click-selector "[data-testid='turn-surrender']" \
  --actions-json '{"steps":[{"buttons":[],"frames":6}]}' \
  --iterations 1 \
  --pause-ms 300 \
  --screenshot-dir "output/web-game/run-91"
```

Expected (`output/web-game/run-91/state-0.json`):
- `phase = "ended"`

### 4) 镜头归位

```bash
node /Users/sun/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url "http://localhost:5002/?roomId=room-1770779986770" \
  --click-selector "[data-testid='action-center']" \
  --actions-json '{"steps":[{"buttons":[],"frames":6}]}' \
  --iterations 1 \
  --pause-ms 300 \
  --screenshot-dir "output/web-game/run-92"
```

Expected (`output/web-game/run-92/state-0.json`):
- `message = "镜头已归位"`
- `camera` 字段存在且有 `{x, y, zoom}`
