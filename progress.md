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
