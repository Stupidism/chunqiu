#!/usr/bin/env node
/**
 * 重新统计 Civ6 图标缺口（支持复合词）：
 * - 不合成新 SVG 文件
 * - 统计口径改为“渲染时可直接按字拼接”
 * - 允许：
 *   1) 单字覆盖
 *   2) 双字复合覆盖（连续两个汉字都可用）
 *
 * 输出：
 * - packages/ui/assets/oracle-bone-icons/CIV6_COMPOUND_GAP.md
 *
 * 用法：
 *   node scripts/recompute-civ6-gap-with-compounds.mjs
 *
 * 可选环境变量：
 *   CIV6_ASSETS_ROOT=/path/to/Civ6.app/Contents/Assets
 */

import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { basename, dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ICON_ROOT = join(__dirname, '..', 'packages', 'ui', 'assets', 'oracle-bone-icons');
const REPORT_PATH = join(ICON_ROOT, 'CIV6_COMPOUND_GAP.md');
const CACHE_PATH = join(ICON_ROOT, '.civ6-phrase-zh-cache.json');
const CIV6_ASSETS_ROOT =
  process.env.CIV6_ASSETS_ROOT ||
  "/Users/sun/Library/Application Support/Steam/steamapps/common/Sid Meier's Civilization VI/Civ6.app/Contents/Assets";

const TARGET_CATEGORIES = [
  'units',
  'policies',
  'greatworks',
  'notifications',
  'technologies',
  'beliefs',
  'buildings',
  'promotions',
  'civics',
  'teams',
  'status',
  'resources',
  'wonders',
  'civilizations',
  'stats',
  'districts',
  'leaders',
  'terrain',
  'diplomacy',
  'projects',
];

const VARIANTS = ['oracle', 'bronze', 'seal'];

const FILE_HINTS = [
  { re: /icons[_-]units?|unitportraits|unitflags/i, category: 'units' },
  { re: /icons[_-]polic/i, category: 'policies' },
  { re: /icons[_-]greatworks?/i, category: 'greatworks' },
  { re: /icons[_-]notifications?/i, category: 'notifications' },
  { re: /icons[_-]tech(unlocks?)?/i, category: 'technologies' },
  { re: /icons[_-]belief|icons[_-]religions?/i, category: 'beliefs' },
  { re: /icons[_-]buildings?/i, category: 'buildings' },
  { re: /icons[_-]promotions?/i, category: 'promotions' },
  { re: /icons[_-]civics?/i, category: 'civics' },
  { re: /icons[_-]teams?/i, category: 'teams' },
  { re: /icons[_-]unitactions?|icons[_-]consequences?/i, category: 'status' },
  { re: /icons[_-]resources?/i, category: 'resources' },
  { re: /icons[_-]wonders?/i, category: 'wonders' },
  { re: /icons[_-]civilizations?/i, category: 'civilizations' },
  { re: /icons[_-]stats?/i, category: 'stats' },
  { re: /icons[_-]districts?/i, category: 'districts' },
  { re: /icons[_-]leaders?/i, category: 'leaders' },
  { re: /icons[_-]terrain|icons[_-]features?/i, category: 'terrain' },
  { re: /icons[_-](diplo|envoys|relationships?)/i, category: 'diplomacy' },
  { re: /icons[_-]projects?/i, category: 'projects' },
];

const DROP_TOKENS = new Set([
  'ICON',
  'ATLAS',
  'FOW',
  'SMALL',
  'LARGE',
  'MASK',
  'BUTTON',
  'BG',
  'BACKGROUND',
  'DEFAULT',
  'PORTRAIT',
  'PORTRAITS',
  'UNITFLAG',
  'UNITFLAGS',
  'FLAG',
  'FLAGS',
  'TYPE',
  'TYPES',
  'STYLE',
  'CIVILIZATION',
  'CIVILIZATIONS',
  'PLAYER',
  'MAJOR',
  'MINOR',
  'GENERIC',
  'UI',
  'TEXT',
  'LABEL',
  'SLOT',
  'BONUS',
  'ACTION',
  'ACTIONS',
  'ABILITY',
  'ABILITIES',
]);

const STOP_CHARS = new Set([
  '的',
  '了',
  '和',
  '与',
  '及',
  '并',
  '在',
  '于',
  '中',
  '上',
  '下',
  '前',
  '后',
  '内',
  '外',
  '有',
  '无',
  '可',
  '不',
  '个',
  '种',
  '类',
  '者',
  '为',
  '对',
  '将',
  '被',
  '或',
  '到',
  '从',
]);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, init = {}, retry = 4, timeoutMs = 12000) {
  for (let i = 0; i <= retry; i++) {
    try {
      const res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status !== 429 && res.status < 500) return res;
      if (i === retry) return res;
    } catch (err) {
      if (i === retry) throw err;
    }
    await delay(500 * (i + 1));
  }
}

async function walkXmlFiles(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkXmlFiles(full, out);
      continue;
    }
    if (entry.isFile() && extname(entry.name).toLowerCase() === '.xml') {
      out.push(full);
    }
  }
  return out;
}

function extractIconNames(xmlText) {
  return [...xmlText.matchAll(/<Row\s+[^>]*\bName="([^"]+)"/g)]
    .map((m) => m[1].trim())
    .filter((name) => name.startsWith('ICON_'));
}

function categoryFromIcon(name, filePath) {
  const byPrefix = [
    ['ICON_UNIT_', 'units'],
    ['ICON_POLICY_', 'policies'],
    ['ICON_GREATWORK_', 'greatworks'],
    ['ICON_NOTIFICATION_', 'notifications'],
    ['ICON_TECH_', 'technologies'],
    ['ICON_BELIEF_', 'beliefs'],
    ['ICON_BUILDING_', 'buildings'],
    ['ICON_PROMOTION_', 'promotions'],
    ['ICON_CIVIC_', 'civics'],
    ['ICON_TEAM_', 'teams'],
    ['ICON_RESOURCE_', 'resources'],
    ['ICON_WONDER_', 'wonders'],
    ['ICON_CIVILIZATION_', 'civilizations'],
    ['ICON_STAT_', 'stats'],
    ['ICON_DISTRICT_', 'districts'],
    ['ICON_LEADER_', 'leaders'],
    ['ICON_TERRAIN_', 'terrain'],
    ['ICON_FEATURE_', 'terrain'],
    ['ICON_DIPLO_', 'diplomacy'],
    ['ICON_RELATIONSHIP_', 'diplomacy'],
    ['ICON_PROJECT_', 'projects'],
  ];

  for (const [prefix, category] of byPrefix) {
    if (name.startsWith(prefix) && TARGET_CATEGORIES.includes(category)) return category;
  }

  if (
    name.startsWith('ICON_ACTION_') ||
    name.startsWith('ICON_OPERATION_') ||
    name.startsWith('ICON_CONSEQUENCE_')
  ) {
    return 'status';
  }

  const fileName = basename(filePath);
  for (const hint of FILE_HINTS) {
    if (hint.re.test(fileName) || hint.re.test(filePath)) return hint.category;
  }

  return null;
}

function normalizeIconToPhrase(iconName, category) {
  let raw = iconName.replace(/^ICON_/, '');

  raw = raw
    .replace(/_FOW$/, '')
    .replace(/_SMALL$/, '')
    .replace(/_LARGE$/, '')
    .replace(/_PORTRAIT$/, '')
    .replace(/_PORTRAITS$/, '')
    .replace(/_UNITFLAG$/, '')
    .replace(/_UNITFLAGS$/, '');

  const categoryPrefixes = {
    units: 'UNIT_',
    policies: 'POLICY_',
    greatworks: 'GREATWORK_',
    notifications: 'NOTIFICATION_',
    technologies: 'TECH_',
    beliefs: 'BELIEF_',
    buildings: 'BUILDING_',
    promotions: 'PROMOTION_',
    civics: 'CIVIC_',
    teams: 'TEAM_',
    status: 'ACTION_',
    resources: 'RESOURCE_',
    wonders: 'WONDER_',
    civilizations: 'CIVILIZATION_',
    stats: 'STAT_',
    districts: 'DISTRICT_',
    leaders: 'LEADER_',
    terrain: 'TERRAIN_',
    diplomacy: 'DIPLO_',
    projects: 'PROJECT_',
  };

  const categoryPrefix = categoryPrefixes[category];
  if (categoryPrefix && raw.startsWith(categoryPrefix)) {
    raw = raw.slice(categoryPrefix.length);
  }

  let parts = raw.split('_').filter(Boolean);
  parts = parts.filter((p) => !DROP_TOKENS.has(p) && !/^\d+$/.test(p));

  if (!parts.length) return null;
  return parts.join(' ').toLowerCase();
}

async function translateToZh(phrase) {
  const u = new URL('https://translate.googleapis.com/translate_a/single');
  u.search = new URLSearchParams({
    client: 'gtx',
    sl: 'en',
    tl: 'zh-CN',
    dt: 't',
    q: phrase,
  }).toString();

  const res = await fetchWithRetry(
    u.toString(),
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'application/json,text/plain,*/*',
      },
    },
    4,
    9000,
  );

  if (!res.ok) return null;

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!Array.isArray(json) || !Array.isArray(json[0])) return null;
    const translated = json[0].map((item) => item?.[0] || '').join('').trim();
    return translated || null;
  } catch {
    return null;
  }
}

async function loadTranslationCache() {
  const raw = await readFile(CACHE_PATH, 'utf8').catch(() => '');
  if (!raw) return {};
  try {
    const json = JSON.parse(raw);
    if (!json || typeof json !== 'object') return {};
    return json;
  } catch {
    return {};
  }
}

async function saveTranslationCache(cacheObj) {
  await writeFile(CACHE_PATH, `${JSON.stringify(cacheObj, null, 2)}\n`, 'utf8');
}

function extractOrderedHanChars(text) {
  const out = [];
  for (const m of text.matchAll(/[\p{Script=Han}]/gu)) {
    const ch = m[0];
    if (STOP_CHARS.has(ch)) continue;
    out.push(ch);
  }
  return out;
}

function dedupeKeepOrder(arr) {
  const out = [];
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

async function loadCategoryCharVariants(category) {
  const dir = join(ICON_ROOT, category);
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const map = new Map(); // char => Set(variant)

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const m = entry.name.match(/^(.+)\.(oracle|bronze|seal)\.svg$/);
    if (!m) continue;
    const [, char, variant] = m;
    if (!map.has(char)) map.set(char, new Set());
    map.get(char).add(variant);
  }

  return map;
}

function hasSingleCoverage(chars, charVariants, variant = null) {
  for (const ch of chars) {
    const v = charVariants.get(ch);
    if (!v) continue;
    if (!variant || v.has(variant)) return true;
  }
  return false;
}

function hasCompoundCoverage(charsOrdered, charVariants, variant = null) {
  if (charsOrdered.length < 2) return false;

  for (let i = 0; i < charsOrdered.length - 1; i++) {
    const a = charsOrdered[i];
    const b = charsOrdered[i + 1];
    const va = charVariants.get(a);
    const vb = charVariants.get(b);
    if (!va || !vb) continue;

    if (!variant) return true;
    if (va.has(variant) && vb.has(variant)) return true;
  }
  return false;
}

function newMetrics() {
  return {
    total: 0,
    analyzable: 0,
    noPhrase: 0,
    translationFail: 0,
    single: 0,
    compound: 0,
    covered: 0,
    semanticGap: 0,
    strictGap: 0,
    newByCompound: 0,
    byVariant: {
      oracle: { covered: 0, strictGap: 0 },
      bronze: { covered: 0, strictGap: 0 },
      seal: { covered: 0, strictGap: 0 },
    },
  };
}

async function main() {
  console.log('========================================');
  console.log('  Civ6 缺口重算（支持双字复合词）');
  console.log('========================================\n');

  const xmlFiles = await walkXmlFiles(CIV6_ASSETS_ROOT);
  console.log(`发现 XML 文件: ${xmlFiles.length}`);

  const iconsByCategory = new Map(TARGET_CATEGORIES.map((c) => [c, new Set()]));
  let parsedXml = 0;

  for (const file of xmlFiles) {
    const xml = await readFile(file, 'utf8').catch(() => null);
    if (!xml || !xml.includes('ICON_')) continue;

    parsedXml++;
    const names = extractIconNames(xml);
    if (!names.length) continue;

    for (const name of names) {
      const category = categoryFromIcon(name, file);
      if (!category) continue;
      iconsByCategory.get(category).add(name);
    }
  }

  console.log(`解析含 ICON 的 XML: ${parsedXml}`);
  for (const category of TARGET_CATEGORIES) {
    console.log(`- ${category}: ${iconsByCategory.get(category).size} 条 ICON`);
  }

  const iconRecords = [];
  const phrases = new Set();

  for (const category of TARGET_CATEGORIES) {
    for (const icon of iconsByCategory.get(category)) {
      const phrase = normalizeIconToPhrase(icon, category);
      iconRecords.push({ category, icon, phrase });
      if (phrase) phrases.add(phrase);
    }
  }

  console.log(`\n待翻译词组: ${phrases.size}`);

  const persistedCache = await loadTranslationCache();
  const phraseCache = new Map();

  let cached = 0;
  let fetched = 0;
  for (const phrase of phrases) {
    const hit = persistedCache[phrase];
    if (typeof hit === 'string' && hit.trim()) {
      phraseCache.set(phrase, hit.trim());
      cached++;
      continue;
    }

    const zh = await translateToZh(phrase);
    if (zh) {
      phraseCache.set(phrase, zh);
      persistedCache[phrase] = zh;
    } else {
      phraseCache.set(phrase, null);
      persistedCache[phrase] = null;
    }

    fetched++;
    if (fetched % 50 === 0) {
      console.log(`翻译进度: ${fetched}/${phrases.size - cached} (cache ${cached})`);
    }
    await delay(35);
  }

  await saveTranslationCache(persistedCache);
  console.log(`翻译完成: fetched=${fetched}, cache=${cached}, total=${phrases.size}`);

  const charVariantsByCategory = new Map();
  for (const category of TARGET_CATEGORIES) {
    charVariantsByCategory.set(category, await loadCategoryCharVariants(category));
  }

  const metrics = new Map(TARGET_CATEGORIES.map((c) => [c, newMetrics()]));
  const unresolvedSamples = new Map(TARGET_CATEGORIES.map((c) => [c, []]));
  const unanalyzableSamples = new Map(TARGET_CATEGORIES.map((c) => [c, []]));

  for (const category of TARGET_CATEGORIES) {
    metrics.get(category).total = iconsByCategory.get(category).size;
  }

  for (const rec of iconRecords) {
    const m = metrics.get(rec.category);
    const charVariants = charVariantsByCategory.get(rec.category);

    if (!rec.phrase) {
      m.noPhrase++;
      if (unanalyzableSamples.get(rec.category).length < 20) {
        unanalyzableSamples.get(rec.category).push({
          icon: rec.icon,
          reason: '无法提取语义短语',
        });
      }
      continue;
    }

    const zh = phraseCache.get(rec.phrase);
    if (!zh) {
      m.translationFail++;
      if (unanalyzableSamples.get(rec.category).length < 20) {
        unanalyzableSamples.get(rec.category).push({
          icon: rec.icon,
          reason: `翻译失败: ${rec.phrase}`,
        });
      }
      continue;
    }

    const ordered = extractOrderedHanChars(zh);
    if (!ordered.length) {
      m.translationFail++;
      if (unanalyzableSamples.get(rec.category).length < 20) {
        unanalyzableSamples.get(rec.category).push({
          icon: rec.icon,
          reason: `翻译后无有效汉字: ${zh}`,
        });
      }
      continue;
    }

    m.analyzable++;

    const deduped = dedupeKeepOrder(ordered);
    const singleAny = hasSingleCoverage(deduped, charVariants);
    const compoundAny = hasCompoundCoverage(ordered, charVariants);
    const coveredAny = singleAny || compoundAny;

    if (singleAny) m.single++;
    if (compoundAny) m.compound++;

    if (coveredAny) {
      m.covered++;
      if (!singleAny && compoundAny) m.newByCompound++;
    } else if (unresolvedSamples.get(rec.category).length < 20) {
      unresolvedSamples.get(rec.category).push({
        icon: rec.icon,
        phrase: rec.phrase,
        zh,
      });
    }

    for (const variant of VARIANTS) {
      const singleV = hasSingleCoverage(deduped, charVariants, variant);
      const compoundV = hasCompoundCoverage(ordered, charVariants, variant);
      if (singleV || compoundV) {
        m.byVariant[variant].covered++;
      }
    }
  }

  const total = newMetrics();

  for (const category of TARGET_CATEGORIES) {
    const m = metrics.get(category);

    m.semanticGap = Math.max(0, m.analyzable - m.covered);
    m.strictGap = Math.max(0, m.total - m.covered);

    for (const variant of VARIANTS) {
      m.byVariant[variant].strictGap = Math.max(0, m.total - m.byVariant[variant].covered);
    }

    total.total += m.total;
    total.analyzable += m.analyzable;
    total.noPhrase += m.noPhrase;
    total.translationFail += m.translationFail;
    total.single += m.single;
    total.compound += m.compound;
    total.covered += m.covered;
    total.semanticGap += m.semanticGap;
    total.newByCompound += m.newByCompound;

    for (const variant of VARIANTS) {
      total.byVariant[variant].covered += m.byVariant[variant].covered;
    }
  }

  total.strictGap = Math.max(0, total.total - total.covered);
  for (const variant of VARIANTS) {
    total.byVariant[variant].strictGap = Math.max(0, total.total - total.byVariant[variant].covered);
  }

  const lines = [];
  lines.push('# Civ6 缺口重算（支持双字复合词）');
  lines.push('');
  lines.push(`生成时间: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('统计口径:');
  lines.push('- 以 `ICON_*` 唯一条目为单位');
  lines.push('- 覆盖规则：单字可渲染，或连续双字都可渲染');
  lines.push('- 不预合成 SVG，渲染时直接并排/并列摆放两个字');
  lines.push('- 提供两种缺口：`语义缺口`（仅可语义化条目）和 `严格缺口`（全部 ICON 条目）');
  lines.push('');
  lines.push('## 总览');
  lines.push('');
  lines.push(`- ICON 总条目: ${total.total}`);
  lines.push(`- 可语义化条目: ${total.analyzable}`);
  lines.push(`- 不可语义化条目: ${total.noPhrase + total.translationFail}`);
  lines.push(`  - 无可用英文短语: ${total.noPhrase}`);
  lines.push(`  - 翻译失败/无有效汉字: ${total.translationFail}`);
  lines.push(`- 单字可覆盖: ${total.single}`);
  lines.push(`- 双字可覆盖: ${total.compound}`);
  lines.push(`- 最终可覆盖(单字或双字): ${total.covered}`);
  lines.push(`- 双字新增覆盖: ${total.newByCompound}`);
  lines.push(`- 语义缺口: ${total.semanticGap}`);
  lines.push(`- 严格缺口: ${total.strictGap}`);
  lines.push('');
  lines.push('- 按版本可覆盖（严格口径）：');
  for (const variant of VARIANTS) {
    lines.push(`  - ${variant}: ${total.byVariant[variant].covered} (严格缺口 ${total.byVariant[variant].strictGap})`);
  }
  lines.push('');
  lines.push('## 分类明细');
  lines.push('');
  lines.push('| 类别 | ICON条目 | 可语义化 | 不可语义化 | 单字覆盖 | 双字覆盖 | 最终覆盖 | 双字新增 | 语义缺口 | 严格缺口 |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const category of TARGET_CATEGORIES) {
    const m = metrics.get(category);
    lines.push(
      `| ${category} | ${m.total} | ${m.analyzable} | ${m.noPhrase + m.translationFail} | ${m.single} | ${m.compound} | ${m.covered} | ${m.newByCompound} | ${m.semanticGap} | ${m.strictGap} |`,
    );
  }

  lines.push('');
  lines.push('## 各版本覆盖（严格口径）');
  lines.push('');
  lines.push('| 类别 | oracle覆盖 | oracle严格缺口 | bronze覆盖 | bronze严格缺口 | seal覆盖 | seal严格缺口 |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|');
  for (const category of TARGET_CATEGORIES) {
    const m = metrics.get(category);
    lines.push(
      `| ${category} | ${m.byVariant.oracle.covered} | ${m.byVariant.oracle.strictGap} | ${m.byVariant.bronze.covered} | ${m.byVariant.bronze.strictGap} | ${m.byVariant.seal.covered} | ${m.byVariant.seal.strictGap} |`,
    );
  }

  lines.push('');
  lines.push('## 未覆盖样本（语义可解析但不可覆盖，每类最多20条）');
  lines.push('');
  for (const category of TARGET_CATEGORIES) {
    const samples = unresolvedSamples.get(category);
    if (!samples.length) continue;
    lines.push(`### ${category}`);
    lines.push('');
    for (const s of samples) {
      lines.push(`- ${s.icon} | ${s.phrase} | ${s.zh}`);
    }
    lines.push('');
  }

  lines.push('## 不可语义化样本（每类最多20条）');
  lines.push('');
  for (const category of TARGET_CATEGORIES) {
    const samples = unanalyzableSamples.get(category);
    if (!samples.length) continue;
    lines.push(`### ${category}`);
    lines.push('');
    for (const s of samples) {
      lines.push(`- ${s.icon} | ${s.reason}`);
    }
    lines.push('');
  }

  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, `${lines.join('\n')}\n`, 'utf8');

  console.log('\n========================================');
  console.log(`ICON 总条目: ${total.total}`);
  console.log(`可语义化条目: ${total.analyzable}`);
  console.log(`最终可覆盖: ${total.covered}`);
  console.log(`双字新增覆盖: ${total.newByCompound}`);
  console.log(`语义缺口: ${total.semanticGap}`);
  console.log(`严格缺口: ${total.strictGap}`);
  console.log('========================================');
  console.log(`报告文件: ${REPORT_PATH}`);
  console.log(`翻译缓存: ${CACHE_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
