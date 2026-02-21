#!/usr/bin/env node
/**
 * 生成甲骨文图标完整索引 README。
 *
 * 用法:
 *   node scripts/generate-oracle-bone-readme.mjs
 */

import { readdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'packages', 'ui', 'assets', 'oracle-bone-icons');
const README = join(ROOT, 'README.md');

const CIV6_CORE = {
  definitionFiles: 118,
  iconCategories: 55,
  mapped: 55,
  uncovered: 0,
};

const CIV6_DETAIL = [
  ['units', 1529],
  ['policies', 220],
  ['greatworks', 217],
  ['notifications', 212],
  ['technologies', 212],
  ['beliefs', 164],
  ['buildings', 165],
  ['promotions', 152],
  ['civics', 138],
  ['teams', 130],
  ['status', 136],
  ['resources', 108],
  ['wonders', 91],
  ['civilizations', 91],
  ['stats', 71],
  ['districts', 62],
  ['leaders', 54],
  ['terrain', 62],
  ['diplomacy', 51],
  ['projects', 46],
];

function byLocale(a, b) {
  return a.localeCompare(b, 'zh-Hans-CN-u-co-pinyin');
}

async function parseCategory(dirPath) {
  const names = (await readdir(dirPath, { withFileTypes: true }))
    .filter((d) => d.isFile() && !d.name.startsWith('.') && !d.name.toLowerCase().endsWith('.md'))
    .map((d) => d.name)
    .sort(byLocale);

  const chars = new Map();
  let oracle = 0;
  let bronze = 0;
  let seal = 0;
  let legacy = 0;

  for (const file of names) {
    let m = file.match(/^(.+)\.(oracle|bronze|seal)\.svg$/);
    if (m) {
      const [, char, variant] = m;
      if (!chars.has(char)) chars.set(char, { oracle: [], bronze: [], seal: [], legacy: [] });
      chars.get(char)[variant].push(file);
      if (variant === 'oracle') oracle++;
      if (variant === 'bronze') bronze++;
      if (variant === 'seal') seal++;
      continue;
    }

    m = file.match(/^(.+)\.(svg|png|jpg|jpeg)$/i);
    if (m) {
      const [, char] = m;
      if (!chars.has(char)) chars.set(char, { oracle: [], bronze: [], seal: [], legacy: [] });
      chars.get(char).legacy.push(file);
      legacy++;
    }
  }

  return {
    fileCount: names.length,
    charCount: chars.size,
    oracle,
    bronze,
    seal,
    legacy,
    charEntries: [...chars.entries()].sort((a, b) => byLocale(a[0], b[0])),
  };
}

async function main() {
  const categories = (await readdir(ROOT, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort(byLocale);

  const details = new Map();

  let totalChars = 0;
  let totalFiles = 0;
  let totalOracle = 0;
  let totalBronze = 0;
  let totalSeal = 0;
  let totalLegacy = 0;

  const rows = [];
  for (const category of categories) {
    const parsed = await parseCategory(join(ROOT, category));
    details.set(category, parsed);
    totalChars += parsed.charCount;
    totalFiles += parsed.fileCount;
    totalOracle += parsed.oracle;
    totalBronze += parsed.bronze;
    totalSeal += parsed.seal;
    totalLegacy += parsed.legacy;
    rows.push(
      `| ${category} | ${parsed.charCount} | ${parsed.fileCount} | ${parsed.oracle} | ${parsed.bronze} | ${parsed.seal} | ${parsed.legacy} |`,
    );
  }

  const lines = [];
  lines.push('# 甲骨文图标索引（完整）');
  lines.push('');
  lines.push('> 自动生成，包含同字三版本：`oracle`（甲骨文）/ `bronze`（金文）/ `seal`（小篆）。');
  lines.push('');
  lines.push(`生成时间: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## 总览');
  lines.push('');
  lines.push(`- 目录数: ${categories.length}`);
  lines.push(`- 字符数: ${totalChars}`);
  lines.push(`- 文件总数: ${totalFiles}`);
  lines.push(`- 三版本文件: oracle ${totalOracle} / bronze ${totalBronze} / seal ${totalSeal}`);
  lines.push(`- 历史文件(单文件版): ${totalLegacy}`);
  lines.push('');
  lines.push('## Figma AI 复合词使用（重点）');
  lines.push('');
  lines.push('- 不要生成“词级 SVG”新文件；复合词在渲染层按字拼接。');
  lines.push('- 单字资源命名：`{字}.{variant}.svg`，`variant ∈ {oracle, bronze, seal}`。');
  lines.push('- 复合词资源规则：词里的每个字分别查找并渲染，优先同一 `variant`；缺字时允许降级到其它版本。');
  lines.push('- 竖排规范：按古代行文优先“上到下”，多列时“从右到左”。两字词默认单列上下排布。');
  lines.push('- 间距建议：字高 `1em`，字间距 `0.12em-0.18em`，列间距 `0.20em-0.30em`。');
  lines.push('- 当前复合词统计：语义缺口 `0`，严格缺口 `70`（主要是不可语义化 token，如 `ICON_TEAM_ICON_*`）。');
  lines.push('- 缺口统计请参考：[`CIV6_COMPOUND_GAP.md`](./CIV6_COMPOUND_GAP.md)。');
  lines.push('');
  lines.push('### 可直接给 Figma AI 的提示词');
  lines.push('');
  lines.push('```text');
  lines.push('请基于 /packages/ui/assets/oracle-bone-icons 设计一套文明6风格图标系统。');
  lines.push('不要生成词级SVG，不要把两个字合成一张图；词语在UI里按字级SVG拼接。');
  lines.push('单字文件格式：{字}.oracle.svg / {字}.bronze.svg / {字}.seal.svg。');
  lines.push('复合词（2-4字）按古代竖排：先上到下，再右到左；两字词固定上下排布。');
  lines.push('同一词优先使用同一版本（oracle优先，其次bronze，再seal）；缺字时逐字降级。');
  lines.push('请输出组件规范：字框尺寸、字间距、列间距、对齐方式、状态色和交互态。');
  lines.push('```');
  lines.push('');

  lines.push('## Civ6 核心对照');
  lines.push('');
  lines.push(`- Civ6 核心图标定义文件: ${CIV6_CORE.definitionFiles}`);
  lines.push(`- Civ6 图标类别: ${CIV6_CORE.iconCategories}`);
  lines.push(`- 已映射并覆盖: ${CIV6_CORE.mapped}`);
  lines.push(`- 未覆盖: ${CIV6_CORE.uncovered}`);
  lines.push('');
  lines.push('### Civ6 详细缺口（按条目数）');
  lines.push('');
  lines.push('> 说明: 这里按 `ICON_*` 唯一标识数量与本库“字符数”做粗粒度对比。');
  lines.push('');
  lines.push('| 类别 | Civ6 图标条目 | 本库字符 | 估算缺口 |');
  lines.push('|---|---:|---:|---:|');
  for (const [category, civ6Count] of CIV6_DETAIL) {
    const libCount = details.get(category)?.charCount || 0;
    const gap = Math.max(0, civ6Count - libCount);
    lines.push(`| ${category} | ${civ6Count} | ${libCount} | ${gap} |`);
  }
  lines.push('');

  lines.push('## 类别统计');
  lines.push('');
  lines.push('| 类别 | 字符数 | 文件数 | oracle | bronze | seal | legacy |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|');
  lines.push(...rows);

  for (const category of categories) {
    const parsed = details.get(category);
    lines.push('');
    lines.push(`## ${category}`);
    lines.push('');
    lines.push('| 字 | 版本 | 文件 |');
    lines.push('|---|---|---|');

    for (const [char, files] of parsed.charEntries) {
      const version = [
        `oracle:${files.oracle.length ? 'Y' : '-'}`,
        `bronze:${files.bronze.length ? 'Y' : '-'}`,
        `seal:${files.seal.length ? 'Y' : '-'}`,
        `legacy:${files.legacy.length ? 'Y' : '-'}`,
      ].join(' ');

      const all = [...files.oracle, ...files.bronze, ...files.seal, ...files.legacy].sort(byLocale);
      const fileList = all.map((f) => `\`${f}\``).join('<br>');
      lines.push(`| ${char} | ${version} | ${fileList} |`);
    }
  }

  await writeFile(README, `${lines.join('\n')}\n`, 'utf8');
  console.log(`README generated: ${README}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
