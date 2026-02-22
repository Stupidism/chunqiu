#!/usr/bin/env node
/**
 * Civ6 全量补缺第三轮：
 * 对第二轮失败字符进行更宽松的“中文 /hans/ 链接 + 繁体回退”重试。
 *
 * 用法:
 *   node scripts/retry-civ6-full-gap-failed-round3.mjs
 */

import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'packages', 'ui', 'assets', 'oracle-bone-icons');
const FAILED_IN = join(ROOT, 'FAILED_DOWNLOADS_CIV6_FULL_GAP_ROUND2.md');
const FAILED_OUT = join(ROOT, 'FAILED_DOWNLOADS_CIV6_FULL_GAP_ROUND3.md');
const MAP_OUT = join(ROOT, 'FALLBACK_SOURCE_MAP_ROUND3.md');
const BASE_URL = 'https://www.zdic.net';

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
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (res.status !== 429 && res.status < 500) return res;
      if (i === retry) return res;
    } catch (err) {
      if (i === retry) throw err;
    }
    await delay(450 * (i + 1));
  }
}

function isHanChar(ch) {
  return /^\p{Script=Han}$/u.test(ch);
}

function extractVariantUrls(html) {
  const out = {};
  for (const key of VARIANT_ORDER) {
    const matches = [...html.matchAll(VARIANT_META[key].regex)].map((m) => m[0]);
    if (!matches.length) continue;
    out[key] = `https://${[...new Set(matches)][0]}`;
  }
  return out;
}

function toSingleHanCandidate(raw) {
  if (!raw) return null;

  let s = raw.trim();
  if (!s) return null;

  // Support escaped slashes from inline script payloads.
  s = s.replace(/\\\//g, '/');
  s = s.replace(/&apos;|&#39;|&#x27;/gi, "'");

  // Strip query/hash and common trailing punctuation.
  s = s.replace(/[?#].*$/, '');
  s = s.replace(/['"”“‘’`]+$/g, '');

  try {
    s = decodeURIComponent(s);
  } catch {
    // Keep original when decode fails.
  }

  const hanOnly = [...s].filter((ch) => isHanChar(ch)).join('');
  if (hanOnly.length !== 1) return null;
  return hanOnly;
}

function extractRelatedHanChars(html) {
  const out = [];
  const seen = new Set();
  const normalizedHtml = html.replace(/\\\//g, '/');

  for (const m of normalizedHtml.matchAll(/\/hans\/([^\s"'<>]+)/g)) {
    const candidate = toSingleHanCandidate(m[1]);
    if (!candidate) continue;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
  }

  return out;
}

async function fetchPage(char) {
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
  if (!res.ok) return { ok: false, pageUrl, error: `HTTP ${res.status}` };
  return { ok: true, pageUrl, html: await res.text() };
}

async function translateTraditional(char, tl = 'zh-TW') {
  const u = new URL('https://translate.googleapis.com/translate_a/single');
  u.search = new URLSearchParams({
    client: 'gtx',
    sl: 'zh-CN',
    tl,
    dt: 't',
    q: char,
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

  try {
    const text = await res.text();
    const json = JSON.parse(text);
    const out = json?.[0]?.map((x) => x?.[0] || '').join('').trim() || '';
    if (out.length === 1 && isHanChar(out)) return out;
  } catch {
    return null;
  }
  return null;
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

function parseFailedList(md) {
  const rows = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^- (.) \[([^\]]+)\] - ([^-]+?)(?: - (https:\/\/\S+))?$/);
    if (!m) continue;
    const [, char, catsRaw, error, pageUrl] = m;
    const categories = catsRaw.split(',').map((x) => x.trim()).filter(Boolean);
    rows.push({ char, categories, error: error.trim(), pageUrl: pageUrl || '' });
  }
  return rows;
}

async function main() {
  console.log('========================================');
  console.log('  Civ6 全量补缺第三轮（中文链接回退）');
  console.log('========================================\n');

  const source = await readFile(FAILED_IN, 'utf8');
  const failedRows = parseFailedList(source);
  console.log(`第二轮失败字符: ${failedRows.length}`);

  let recovered = 0;
  let downloaded = 0;
  let skipped = 0;

  const unresolved = [];
  const sourceMap = [];

  for (const row of failedRows) {
    const { char, categories } = row;
    process.stdout.write(`🔁 ${char} ... `);

    const queue = [];
    const seen = new Set();
    const fetched = new Set();
    let lastPageUrl = '';

    const push = (c) => {
      if (!c || c.length !== 1 || !isHanChar(c)) return;
      if (seen.has(c)) return;
      seen.add(c);
      queue.push(c);
    };

    push(char);
    const tw = await translateTraditional(char, 'zh-TW');
    const hk = await translateTraditional(char, 'zh-HK');
    push(tw);
    push(hk);

    let foundSource = null;
    let foundVariants = null;

    // Pass 1: seeds + collect first-hop /hans/ 单字候选.
    const seedSnapshot = [...queue];
    for (const seed of seedSnapshot) {
      const page = await fetchPage(seed);
      fetched.add(seed);
      if (!page.ok) {
        lastPageUrl = page.pageUrl;
        continue;
      }

      lastPageUrl = page.pageUrl;
      const variants = extractVariantUrls(page.html);
      if (Object.keys(variants).length) {
        foundSource = seed;
        foundVariants = variants;
        break;
      }

      const related = extractRelatedHanChars(page.html).slice(0, 24);
      for (const r of related) push(r);
    }

    // Pass 2: try collected candidates (no recursive expansion to avoid drift).
    if (!foundSource || !foundVariants) {
      for (const candidate of queue) {
        if (fetched.has(candidate)) continue;
        const page = await fetchPage(candidate);
        fetched.add(candidate);
        if (!page.ok) {
          lastPageUrl = page.pageUrl;
          continue;
        }

        lastPageUrl = page.pageUrl;
        const variants = extractVariantUrls(page.html);
        if (Object.keys(variants).length) {
          foundSource = candidate;
          foundVariants = variants;
          break;
        }

        // Keep runtime bounded.
        if (fetched.size >= 48) break;
      }
    }

    if (!foundSource || !foundVariants) {
      console.log('❌ 仍无可用版本');
      unresolved.push({
        char,
        categories,
        error: '第三轮回退后仍无甲骨文/金文/小篆',
        pageUrl: lastPageUrl,
      });
      await delay(120);
      continue;
    }

    sourceMap.push({ char, source: foundSource, categories });
    let any = false;

    for (const variant of VARIANT_ORDER) {
      const url = foundVariants[variant];
      if (!url) continue;

      const dl = await downloadSvg(url);
      if (!dl.success) continue;

      for (const category of categories) {
        const outDir = join(ROOT, category);
        await mkdir(outDir, { recursive: true });
        const outPath = join(outDir, `${char}.${variant}.svg`);
        if (await pathExists(outPath)) {
          skipped++;
          continue;
        }
        await writeFile(outPath, dl.content, 'utf8');
        downloaded++;
        any = true;
      }
    }

    recovered++;
    console.log(`${any ? '✅' : '⏭️'} 来源:${foundSource}`);
    await delay(120);
  }

  const failLines = [
    '# Civ6 全量补缺第三轮失败列表',
    '',
    `生成时间: ${new Date().toISOString()}`,
    '',
    ...unresolved.map(
      (f) =>
        `- ${f.char} [${f.categories.join(', ')}] - ${f.error}${f.pageUrl ? ` - ${f.pageUrl}` : ''}`,
    ),
    '',
  ];
  await writeFile(FAILED_OUT, failLines.join('\n'), 'utf8');

  const mapLines = [
    '# Civ6 全量补缺第三轮回退映射',
    '',
    `生成时间: ${new Date().toISOString()}`,
    '',
    ...sourceMap.map((x) => `- ${x.char} <= ${x.source} [${x.categories.join(', ')}]`),
    '',
  ];
  await writeFile(MAP_OUT, mapLines.join('\n'), 'utf8');

  console.log('\n========================================');
  console.log(`已恢复字符: ${recovered}/${failedRows.length}`);
  console.log(`新增文件: ${downloaded}`);
  console.log(`已存在跳过: ${skipped}`);
  console.log(`仍失败字符: ${unresolved.length}`);
  console.log('========================================');
  console.log(`失败报告: ${FAILED_OUT}`);
  console.log(`回退映射: ${MAP_OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

