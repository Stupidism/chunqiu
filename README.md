# 春秋 (Chunqiu) - 策略游戏前端

一个以中国古代春秋时期为背景的回合制策略游戏前端实现。

## 项目结构

```
chunqiu/
├── apps/
│   ├── lobby/          # 游戏大厅 (端口 5001)
│   ├── game/           # 游戏主界面 (端口 5002)
│   ├── editor/         # 地图编辑器 (端口 5003)
│   └── server/         # 后端服务 (API + WebSocket)
├── packages/
│   ├── ui/             # 共享UI组件
│   ├── game-core/      # 游戏核心逻辑
│   ├── types/          # 共享类型定义
│   └── db/             # 数据库客户端
├── package.json
├── turbo.json
└── README.md
```

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **语言**: TypeScript
- **构建工具**: Turborepo

## 快速开始

### 安装依赖

```bash
# 使用 pnpm
pnpm install

# 或使用 npm
npm install
```

### 开发模式

```bash
# 启动所有应用
pnpm dev

# 或单独启动
pnpm --filter @chunqiu/lobby dev
pnpm --filter @chunqiu/game dev
pnpm --filter @chunqiu/editor dev
```

### 构建

```bash
# 构建所有应用
pnpm build
```

### Docker 开发环境 (后端 + 数据库)

```bash
docker compose up --build
```

端口说明：
- `server` (Next.js API): `http://localhost:5004`
- `ws` (WebSocket): `ws://localhost:5005`
- `db` (PostgreSQL): `localhost:5432`

> 如果同时运行本地前端应用，注意端口占用冲突。

## 文档索引

### Features
- [00 项目概述](docs/features/00-project-overview.mdc)
- [01 设计系统](docs/features/01-design-system.mdc)
- [01a 图标体系](docs/features/01a-iconography.mdc)
- [02 地图系统总览](docs/features/02-map-system.mdc)
- [02a 地形与地貌](docs/features/02a-terrain-features.mdc)
- [02b 资源与生物群落](docs/features/02b-resources-biomes.mdc)
- [03 游戏系统总览](docs/features/03-game-systems.mdc)
- [03a 产出系统](docs/features/03a-yields-system.mdc)
- [03b 区域与建筑](docs/features/03b-district-building.mdc)
- [03c 科技树](docs/features/03c-technology-tree.mdc)
- [03d 市政与政体](docs/features/03d-civics-government.mdc)
- [03e 宗教与信仰](docs/features/03e-religion-faith.mdc)
- [03f 经济与贸易](docs/features/03f-economy-trade.mdc)
- [03g 单位与战斗](docs/features/03g-units-combat.mdc)
- [04 MVP 路线图](docs/features/04-mvp-roadmap.mdc)
- [05 文明总览](docs/features/05-civilizations.mdc)
- [05a 秦](docs/features/05a-civ-qin.mdc)
- [05b 齐](docs/features/05b-civ-qi.mdc)
- [05c 楚](docs/features/05c-civ-chu.mdc)
- [05d 晋](docs/features/05d-civ-jin.mdc)
- [05e 吴](docs/features/05e-civ-wu.mdc)
- [05f 越](docs/features/05f-civ-yue.mdc)
- [05g 郑](docs/features/05g-civ-zheng.mdc)
- [05h 宋](docs/features/05h-civ-song.mdc)
- [05i 鲁](docs/features/05i-civ-lu.mdc)
- [05j 燕](docs/features/05j-civ-yan.mdc)
- [06 城邦](docs/features/06-city-states.mdc)
- [07 奇观](docs/features/07-wonders.mdc)
- [08 项目系统](docs/features/08-projects.mdc)
- [09 伟人](docs/features/09-great-people.mdc)
- [10 改良设施](docs/features/10-improvements.mdc)

### Architecture
- [00 架构总览](docs/architecture/00-architecture-overview.mdc)
- [01 技术栈与架构](docs/architecture/01-tech-stack.mdc)
- [02 Monorepo 结构](docs/architecture/02-monorepo-structure.mdc)
- [03 目录结构](docs/architecture/03-directory-structure.mdc)
- [04 数据库设计](docs/architecture/04-database-schema.mdc)
- [05 WebSocket 协议](docs/architecture/05-websocket-protocol.mdc)
- [06 游戏大厅 App](docs/architecture/06-app-lobby.mdc)
- [07 游戏界面 App](docs/architecture/07-app-game.mdc)
- [08 地图编辑器 App](docs/architecture/08-app-editor.mdc)
- [09 后端服务器 App](docs/architecture/09-app-server.mdc)
- [10 PVP 同步回合](docs/architecture/10-turn-system-pvp.mdc)
- [11 AI 纯回合制](docs/architecture/11-turn-system-ai.mdc)
- [12 存档与回放](docs/architecture/12-saves-replays.mdc)
- [13 地图尺寸](docs/architecture/13-map-sizing.mdc)
- [14 错位四边形网格](docs/architecture/14-editor-staggered-grid.mdc)
- [15 数据模型概念](docs/architecture/15-data-model-concepts.mdc)
- [16 协议与事件](docs/architecture/16-protocol-events.mdc)
- [17 UI 状态机](docs/architecture/17-ui-state-machines.mdc)
- [18 部署与域名策略](docs/architecture/18-deployment-strategy.mdc)
- [19 移动端友好 UI 要求](docs/architecture/19-mobile-friendly-ui.mdc)
- [20 语音输入与指令解析](docs/architecture/20-voice-input-commands.mdc)

## 应用说明

### 游戏大厅 (apps/lobby)

- 登录/注册
- 房间列表
- 创建/加入房间
- 玩家统计

访问: http://localhost:5001

### 游戏主界面 (apps/game)

- 地图渲染（错位四边形网格）
- 资源栏显示
- 单位操作面板
- 城市面板
- 回合管理
- 小地图

访问: http://localhost:5002

### 地图编辑器 (apps/editor)

- 地图画布
- 地形编辑工具
- 海拔编辑工具
- 资源放置工具
- 导入/导出地图

访问: http://localhost:5003

## 共享包

### @chunqiu/ui

甲骨文风格的UI组件库：
- Button - 青铜器风格按钮
- Card - 青铜器风格卡片
- Input - 输入框
- HexTile - 六边形地图格子
- ResourceIndicator - 资源指示器
- Dialog - 对话框
- Badge - 徽章
- Tooltip - 提示框
- ScrollArea - 滚动区域
- Separator - 分隔线
- Avatar - 头像

### @chunqiu/types

共享TypeScript类型定义：
- Tile, Position, Yields
- Unit, City, Player
- GameState, GameMap
- Room, User
- 等等...

### @chunqiu/game-core

游戏核心逻辑：
- 地图生成器
- 单位逻辑
- 城市逻辑
- 战斗系统

## 特色功能

### 甲骨文风格UI

- 青铜器色调配色方案
- 甲骨文装饰角
- 古风字体
- 纸张纹理背景

### 六边形地图

- 错位四边形网格渲染
- 战争迷雾系统
- 视野计算
- 地形和资源显示

### 状态管理

- Zustand store
- 持久化存储
- 撤销/重做支持（编辑器）

## 开发计划

- [x] 项目结构初始化
- [x] 共享类型定义
- [x] 共享UI组件
- [x] 游戏核心逻辑
- [x] 游戏大厅
- [x] 游戏主界面
- [x] 地图编辑器
- [ ] WebSocket实时通信
- [ ] 科技树界面
- [ ] 外交系统
- [ ] 胜利条件

## 许可证

MIT
