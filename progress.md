Original prompt: 页面现在没渲染出来任何地图，很多按钮点了没效果，不要老是来问我，你继续测试呀，review，e2e 测试，执行 e2e 测试，修复遇到的问题

- Added deterministic selection in game init and exposed selected state in render_game_to_text.
- Tile clicks now move selected unit (with feedback); added test canvas sized to viewport for Playwright screenshots.
- Added data-testid hooks for tiles, action bar, turn actions, unit/city buttons.
- Added query param `select=city|unit|none` to control initial selection for tests.
- Added placeholder favicon to stop 404 console noise.
- Ran Playwright smoke flows (move, tech panel, end turn, city build) with artifacts under output/web-game/run-5..run-8.

TODO
- Consider persisting selection across end-turn (optional UX decision).
- Add dedicated test for unit attack once enemy units exist.
