#!/usr/bin/env node
/**
 * 面向 Civ6 图标条目的全量补缺下载：
 * 1) 解析 Civ6 本地 XML 的 ICON_* 名称
 * 2) 英文词组翻译为中文，提取汉字
 * 3) 到汉典抓取 oracle/bronze/seal 三版本
 *
 * 说明：
 * - 这是“尽量补齐”策略，不保证每个 ICON 条目都有独立汉字。
 * - 已有文件不覆盖，仅补新增字符。
 *
 * 用法:
 *   node scripts/download-civ6-full-gap-icons.mjs
 *
 * 可选环境变量:
 *   CIV6_ASSETS_ROOT=/path/to/Civ6.app/Contents/Assets
 */

import { access, mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { dirname, extname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ICON_ROOT = join(__dirname, '..', 'packages', 'ui', 'assets', 'oracle-bone-icons');
const CIV6_ASSETS_ROOT =
  process.env.CIV6_ASSETS_ROOT ||
  '/Users/sun/Library/Application Support/Steam/steamapps/common/Sid Meier\'s Civilization VI/Civ6.app/Contents/Assets';

const BASE_URL = 'https://www.zdic.net';

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

const VARIANT_ORDER = ['oracle', 'bronze', 'seal'];

const VARIANT_META = {
  oracle: {
    label: '甲骨文',
    regex: /img\.zdic\.net\/zy\/jiaguwen\/[^"'\s]+\.svg/gi,
  },
  bronze: {
    label: '金文',
    regex: /img\.zdic\.net\/zy\/jinwen\/[^"'\s]+\.svg/gi,
  },
  seal: {
    label: '小篆',
    regex: /img\.zdic\.net\/zy\/xiaozhuan\/[^"'\s]+\.svg/gi,
  },
};

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

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
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
      await delay(500 * (i + 1));
    } catch (err) {
      if (i === retry) throw err;
      await delay(500 * (i + 1));
    }
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

  // Strip common suffixes that don't carry semantics.
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

function extractHanChars(text) {
  const out = [];
  for (const m of text.matchAll(/[\p{Script=Han}]/gu)) {
    const ch = m[0];
    if (STOP_CHARS.has(ch)) continue;
    out.push(ch);
  }
  return [...new Set(out)];
}

async function collectExistingChars(category) {
  const dir = join(ICON_ROOT, category);
  if (!(await pathExists(dir))) return new Set();

  const files = await readdir(dir, { withFileTypes: true });
  const chars = new Set();
  for (const file of files) {
    if (!file.isFile()) continue;
    const m = file.name.match(/^(.+)\.(oracle|bronze|seal)\.svg$/);
    if (m) chars.add(m[1]);
  }
  return chars;
}

function extractVariantUrls(html) {
  const out = {};
  for (const key of VARIANT_ORDER) {
    const matches = [...html.matchAll(VARIANT_META[key].regex)].map((m) => m[0]);
    if (!matches.length) continue;
    const unique = [...new Set(matches)];
    out[key] = `https://${unique[0]}`;
  }
  return out;
}

async function fetchVariantMap(char) {
  const pageUrl = `${BASE_URL}/hans/${encodeURIComponent(char)}`;
  const res = await fetchWithRetry(
    pageUrl,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    },
    4,
    12000,
  );

  if (!res.ok) return { success: false, error: `HTTP ${res.status}`, pageUrl };

  const html = await res.text();
  const variants = extractVariantUrls(html);
  if (!Object.keys(variants).length) {
    return { success: false, error: '未找到甲骨文/金文/小篆', pageUrl };
  }

  return { success: true, variants, pageUrl };
}

async function downloadSvg(url) {
  const res = await fetchWithRetry(
    url,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'image/svg+xml,*/*;q=0.8',
        Referer: BASE_URL,
      },
    },
    4,
    12000,
  );

  if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
  return { success: true, content: await res.text() };
}

async function main() {
  console.log('========================================');
  console.log('  Civ6 全量补缺下载（三版本）');
  console.log('  目标类别:', TARGET_CATEGORIES.join(', '));
  console.log('  图标库目录:', ICON_ROOT);
  console.log('  Civ6 资源目录:', CIV6_ASSETS_ROOT);
  console.log('========================================\n');

  const xmlFiles = await walkXmlFiles(CIV6_ASSETS_ROOT);
  console.log(`发现 XML 文件: ${xmlFiles.length}`);

  const iconSets = new Map(TARGET_CATEGORIES.map((c) => [c, new Set()]));
  let parsedXml = 0;

  for (const file of xmlFiles) {
    const xml = await readFile(file, 'utf8').catch(() => null);
    if (!xml || !xml.includes('ICON_')) continue;

    parsedXml++;
    const names = extractIconNames(xml);
    if (!names.length) continue;

    for (const name of names) {
      const category = categoryFromIcon(name, file);
      if (!category || !iconSets.has(category)) continue;
      iconSets.get(category).add(name);
    }
  }

  console.log(`解析含 ICON 的 XML: ${parsedXml}`);
  for (const category of TARGET_CATEGORIES) {
    console.log(`- ${category}: ${iconSets.get(category).size} 条 ICON`);
  }

  const phraseToCategories = new Map();
  for (const category of TARGET_CATEGORIES) {
    const names = iconSets.get(category);
    for (const name of names) {
      const phrase = normalizeIconToPhrase(name, category);
      if (!phrase) continue;
      if (!phraseToCategories.has(phrase)) phraseToCategories.set(phrase, new Set());
      phraseToCategories.get(phrase).add(category);
    }
  }

  console.log(`\n待翻译词组: ${phraseToCategories.size}`);

  const categoryChars = new Map(TARGET_CATEGORIES.map((c) => [c, new Set()]));
  const failedTranslations = [];
  let translatedCount = 0;

  for (const [phrase, categories] of phraseToCategories.entries()) {
    const zh = await translateToZh(phrase);
    if (!zh) {
      failedTranslations.push(phrase);
      continue;
    }
    translatedCount++;
    const chars = extractHanChars(zh);
    if (!chars.length) continue;

    for (const category of categories) {
      const set = categoryChars.get(category);
      for (const ch of chars) set.add(ch);
    }

    if (translatedCount % 50 === 0) {
      console.log(`翻译进度: ${translatedCount}/${phraseToCategories.size}`);
    }
    await delay(40);
  }

  console.log(`翻译完成: ${translatedCount}/${phraseToCategories.size}`);

  const neededByChar = new Map(); // char => Set(category)
  const categoryNewCharCount = new Map();

  for (const category of TARGET_CATEGORIES) {
    const existing = await collectExistingChars(category);
    const candidates = categoryChars.get(category);
    let newCount = 0;

    for (const char of candidates) {
      if (existing.has(char)) continue;
      if (!neededByChar.has(char)) neededByChar.set(char, new Set());
      neededByChar.get(char).add(category);
      newCount++;
    }

    categoryNewCharCount.set(category, newCount);
  }

  console.log('\n新增候选字符（按类别）:');
  for (const category of TARGET_CATEGORIES) {
    console.log(`- ${category}: ${categoryNewCharCount.get(category)}`);
  }
  console.log(`\n去重后待抓字符: ${neededByChar.size}`);

  const failed = [];
  let downloadedFiles = 0;
  let skippedFiles = 0;
  let successChars = 0;

  for (const [char, categories] of neededByChar.entries()) {
    process.stdout.write(`🔍 ${char} (${categories.size}类) ... `);

    const variantRes = await fetchVariantMap(char);
    if (!variantRes.success) {
      console.log(`❌ ${variantRes.error}`);
      failed.push({
        char,
        categories: [...categories],
        error: variantRes.error,
        pageUrl: variantRes.pageUrl,
      });
      await delay(180);
      continue;
    }

    let anySaved = false;
    const found = [];

    for (const variant of VARIANT_ORDER) {
      const variantUrl = variantRes.variants[variant];
      if (!variantUrl) continue;
      found.push(variant);

      const dl = await downloadSvg(variantUrl);
      if (!dl.success) continue;

      for (const category of categories) {
        const outDir = join(ICON_ROOT, category);
        await mkdir(outDir, { recursive: true });
        const outPath = join(outDir, `${char}.${variant}.svg`);
        if (await pathExists(outPath)) {
          skippedFiles++;
          continue;
        }
        await writeFile(outPath, dl.content, 'utf8');
        downloadedFiles++;
        anySaved = true;
      }
    }

    if (found.length) {
      successChars++;
      console.log(`${anySaved ? '✅' : '⏭️'} ${found.join('/')}`);
    } else {
      console.log('❌ 页面可达但无可用版本');
      failed.push({
        char,
        categories: [...categories],
        error: '页面可达但无可用版本',
        pageUrl: variantRes.pageUrl,
      });
    }

    await delay(180);
  }

  console.log('\n========================================');
  console.log(`字符抓取成功: ${successChars}/${neededByChar.size}`);
  console.log(`新增文件: ${downloadedFiles}`);
  console.log(`已存在跳过: ${skippedFiles}`);
  console.log(`翻译失败词组: ${failedTranslations.length}`);
  console.log('========================================');

  const failPath = join(ICON_ROOT, 'FAILED_DOWNLOADS_CIV6_FULL_GAP.md');
  const failLines = [
    '# Civ6 全量补缺失败列表',
    '',
    `生成时间: ${new Date().toISOString()}`,
    '',
    '## 抓取失败字符',
    '',
    ...failed.map(
      (f) =>
        `- ${f.char} [${f.categories.join(', ')}] - ${f.error}${f.pageUrl ? ` - ${f.pageUrl}` : ''}`,
    ),
    '',
    '## 翻译失败词组',
    '',
    ...failedTranslations.map((s) => `- ${s}`),
    '',
  ];
  await writeFile(failPath, failLines.join('\n'), 'utf8');
  console.log(`\n失败报告: ${failPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
