Original prompt: 页面现在没渲染出来任何地图，很多按钮点了没效果，不要老是来问我，你继续测试呀，review，e2e 测试，执行 e2e 测试，修复遇到的问题

- Added deterministic selection in game init and exposed selected state in render_game_to_text.
- Tile clicks now move selected unit (with feedback); added test canvas sized to viewport for Playwright screenshots.
- Added data-testid hooks for tiles, action bar, turn actions, unit/city buttons.
- Added query param `select=city|unit|none` to control initial selection for tests.
- Added placeholder favicon to stop 404 console noise.
- Ran Playwright smoke flows (move, tech panel, end turn, city build) with artifacts under output/web-game/run-5..run-8.

- Applied oracle-bone icons in game UI (resource bar, unit/city panels, tile overlays) and copied assets to app public folders.
- Main map terrain colors now render correctly via SVG fill (not just minimap).
- Added move-mode gating, movement range highlight, and distance-based movement cost. Unit must click Move then pick a tile; movement 0 prevents moving.
- Added tile hover info panel (terrain/resource/unit/city), default yield display per tile, resource icon bottom-right, unit type icon top-right.
- Added OracleIcon (SVG mask rendering) to avoid white backgrounds on svg icons.
- Ran Playwright check for move mode + icon/yield overlays (artifact: output/web-game/run-12).

TODO
- Consider persisting selection across end-turn (optional UX decision).
- Add dedicated test for unit attack once enemy units exist.

- Read local Civ6 UI article (Zhihu export) and reshaped game HUD to mirror Civ6: top-left power row + interface buttons, top-right turn/year/clock/report controls, bottom-left minimap + map tools, bottom-right large next-turn button.
- Replaced unit/city/action icons with oracle-bone SVGs to remove white backgrounds; standardized icon tones.
- Darkened left panels to ink style and aligned typography with HUD; adjusted hover/map info placement.
- Fixed pointer event overlap so city panel buttons can be clicked when minimap is present.
- Ran Playwright checks for new layout (runs: output/web-game/run-17..run-22). run-20 initially failed click due to overlay; fixed in page layout and reran (run-21).
- Adjusted hover tooltip to follow mouse, moved unit icon inside tile (top-right), added bottom-right unit action panel and right-side city drawer. City drawer now only shows when a city is explicitly selected.
- Playwright: run-23/25 verify new layout, run-26 still cannot click city-build via selector even though UI renders; needs investigation of click interception or visibility in Playwright.
- Added UnitActionPanel docked next to Next Turn button; removed left unit panel. City panel now only renders when city is selected (right-side drawer). Hover tooltip now follows mouse position.
- Playwright: run-23/25 for layout, run-27 shows city build works when click is sent via actions-json (selector click still flaky under client script).
- Fixed GameMap hover tooltip crash (iconBase scope), improved tooltip layout with icons and yields.
- Added City drawer close button + ESC/C shortcut and slide animation; City panel reorganized into Civ6-like sections.
- Unit action panel refined (header + active state highlight).
- Updated Playwright client fallback click; selector click still logs a timeout but state confirms click succeeded (run-34/38). Actions-json click remains reliable.

- UI tuning (run-43..run-53):
  - GameMap: first-view camera now centers around selected tile/current player unit (fallback city), not whole map center; preserves left bias to reserve right UI lane.
  - GameMap: mouse-wheel zoom now keeps cursor-anchored focus (camera compensation during zoom).
  - page.tsx: top toast extracted from right-bottom stack; right-bottom control stack and active-panel now auto-shift left when city drawer is open (prevents overlap).
  - Minimap: added click-to-recenter camera and stable viewport rectangle clamp; added data-testid=minimap.
  - HexTile: reduced default yield icon cluster size and slightly lowered opacity so unit/city/resource markers stay visually primary.
- Validation:
  - run-46/47/50/51/52: selection-based layouts and drawer avoidance verified.
  - run-53: unit move mode still works, highlights visible, action message shown.
- Known residual:
  - Workspace still has unrelated pre-existing TS errors across packages; full type-check not green yet.

- Added left-button drag pan for main map (without Shift).
  - Implemented drag threshold + post-drag click suppression to prevent accidental tile clicks while panning.
  - Internal refs track camera/zoom for stable pointer interactions.
- Validation:
  - Direct Playwright drag check confirms transform changed (pan applied).
  - run-54 confirms unit action click still enters move mode after drag logic change (no click regression).

- Camera + fullscreen polish:
  - GameMap now clamps camera bounds after drag and wheel-zoom (prevents map from being dragged into all-empty space).
  - Minimap click recenter now respects same viewport-aware clamp.
  - ActionBar fullscreen control now works (button + keyboard F), with active visual state and UI message feedback.
- Validation:
  - run-55 baseline render OK.
  - run-56 fullscreen button works; state message = 已进入全屏.
  - direct drag stress test confirms camera transform remains bounded while still pannable.

TODO Sprint (2026-02-12)
- [x] Item 1: 相机边界约束 + 全屏切换稳定化（按钮 + F 键）。
- [x] Item 2: 地块收益显示开关（ActionBar 的“收益”按钮真正切换）。
- [x] Item 3: 小地图支持按住拖动平移主地图（不仅点击定位）。
- [x] Item 4: 加入“镜头归位/居中”控制与快捷键。
- [x] Item 5: 键盘方向键 / WASD 平移镜头（受边界约束）。
- [x] Item 6: 单位快速居中操作（单位面板/动作面板按钮）。
- [x] Item 7: 右侧抽屉与右下控件在窄屏时自适应避让。
- [x] Item 8: 集中回归（交互链路 + 无新报错）并收尾。
- Regression bundle (Item 8):
  - run-70: yields toggle verified (`showTileYields=false`, toast shown).
  - run-71: recenter control verified (`message=镜头已归位`).
  - run-72: unit focus action verified (`message=镜头已定位到单位`).
  - run-73: left drag + minimap drag + keyboard pan path exercised (camera transforms changed as expected with boundary clamp).
  - run-74: narrow viewport city drawer scenario verified with no console/page errors.

TODO Sprint 2 (2026-02-18)
- [x] Item A: 修复“镜头归位无效”链路。
  - `GameMap` 归位初始化改为 `requestAnimationFrame` 重试，避免容器尺寸尚未就绪导致首次归位失败后一直不可用。
  - 去掉归位触发对 `hasAutoCentered` 的依赖，确保按钮/快捷键请求始终生效。
  - `render_game_to_text` 增加 `camera` 字段，便于自动化断言镜头是否真的变化。
  - 验证：
    - run-77（仅右移）：`camera.x = 69.6`
    - run-76（右移后归位）：`camera.x = 117.6`
    - 截图对比可见地图回到默认焦点区域，无新 console/page error。
- [x] Item B: 落地“地图钉”功能（替换 ActionBar 开发中占位）。
  - store 新增 `mapPins`、`toggleMapPin`；`activeAction` 扩展为 `'move' | 'pin' | null`。
  - ActionBar 的“地图钉”按钮改为可交互模式切换（高亮态 + `P` 快捷键）。
  - GameMap 在 pin 模式下点击地块可放置/移除地图钉，并在地块内渲染 pin 图标与编号。
  - `render_game_to_text` 新增 `mapPins`，便于自动化校验。
  - 验证：
    - run-79 / run-80：`mapPins` 返回已更新（示例 `[{row:7,col:5}]`、`[{row:7,col:3}]`），页面无新报错。
- [x] Item C: 落地“搜索”功能（替换 ActionBar 开发中占位）。
  - 新增 `MapSearchPanel`：
    - 支持城市名 / 单位名 / 坐标（`7,6`）检索；
    - 结果点击后自动选中并镜头定位（单位走 `requestFocusUnit`，城市/坐标走 `requestCameraRecenter`）。
  - ActionBar：
    - “搜索”按钮改为真实行为，新增高亮态；
    - 支持 `/` 快捷键开关搜索面板。
  - `activePanel` 扩展支持 `search`。
  - 验证：
    - run-82：`activePanel = "search"`，搜索面板可见，控制台无报错。
    - run-81：点击结果后定位到城市并关闭面板，状态同步正确。
- [x] Item D: 落地“滤镜 / 战略”镜头切换（替换 ActionBar 开发中占位）。
  - store 新增 `mapLens: normal | resource | strategic`，并支持状态切换。
  - ActionBar：
    - “滤镜”切换资源镜头（高亮含资源地块，弱化普通地块）；
    - “战略”切换战略镜头（突出战略资源地块）；
    - 新增快捷键：`Y`（收益开关）、`V`（战略镜头）。
  - GameMap 根据 `mapLens` 实时应用图层弱化/强化效果。
  - `render_game_to_text` 新增 `mapLens`，便于自动化断言。
  - 验证：
    - run-83：`mapLens = "resource"`，截图可见资源镜头生效。
    - run-84：`mapLens = "strategic"`，截图可见战略镜头生效。
