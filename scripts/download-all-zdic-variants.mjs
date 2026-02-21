#!/usr/bin/env node
/**
 * 按现有图标库全量补齐汉典三版本字形:
 * - oracle (甲骨文)
 * - bronze (金文)
 * - seal (小篆)
 *
 * 规则:
 * - 扫描 packages/ui/assets/oracle-bone-icons/<category> 中已存在的字符
 * - 对每个字符下载缺失版本，不覆盖已存在文件
 *
 * 用法:
 *   node scripts/download-all-zdic-variants.mjs
 */

import { access, mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'packages', 'ui', 'assets', 'oracle-bone-icons');
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

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchWithRetry(url, init = {}, retry = 4) {
  for (let i = 0; i <= retry; i++) {
    const res = await fetch(url, init);
    if (res.status !== 429 && res.status < 500) return res;

    if (i === retry) return res;
    await delay(1000 * (i + 1));
  }
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
  const res = await fetchWithRetry(pageUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    return { success: false, error: `HTTP ${res.status}`, pageUrl };
  }

  const html = await res.text();
  const variants = extractVariantUrls(html);

  if (!Object.keys(variants).length) {
    return { success: false, error: '未找到甲骨文/金文/小篆', pageUrl };
  }

  return { success: true, variants, pageUrl };
}

async function downloadSvg(url) {
  const res = await fetchWithRetry(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Accept: 'image/svg+xml,*/*;q=0.8',
      Referer: BASE_URL,
    },
  });

  if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
  return { success: true, content: await res.text() };
}

async function collectCharsByCategory() {
  const dirs = await readdir(ROOT, { withFileTypes: true });
  const out = new Map();

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const category = dir.name;
    const categoryPath = join(ROOT, category);
    const files = await readdir(categoryPath, { withFileTypes: true });
    const chars = new Set();

    for (const f of files) {
      if (!f.isFile()) continue;
      if (f.name.startsWith('.')) continue;
      if (f.name.toLowerCase().endsWith('.md')) continue;

      let m = f.name.match(/^(.+)\.(oracle|bronze|seal)\.svg$/);
      if (m) {
        chars.add(m[1]);
        continue;
      }

      m = f.name.match(/^(.+)\.(svg|jpg|jpeg|png)$/i);
      if (m) chars.add(m[1]);
    }

    if (chars.size) out.set(category, [...chars].sort((a, b) => a.localeCompare(b)));
  }

  return out;
}

async function main() {
  console.log('========================================');
  console.log('  全量补齐汉典三版本字形');
  console.log('  目标: 按现有图标库逐字补齐');
  console.log('  来源: zdic.net');
  console.log('========================================\n');

  const categoryChars = await collectCharsByCategory();

  let totalChars = 0;
  let resolvedChars = 0;
  let downloaded = 0;
  let skipped = 0;
  const failed = [];

  for (const [category, chars] of categoryChars.entries()) {
    const categoryDir = join(ROOT, category);
    await mkdir(categoryDir, { recursive: true });

    console.log(`\n📁 ${category.toUpperCase()}`);

    for (const char of chars) {
      totalChars++;
      process.stdout.write(`  🔍 ${char} ... `);

      const variantRes = await fetchVariantMap(char);
      if (!variantRes.success) {
        console.log(`❌ ${variantRes.error}`);
        failed.push({ category, char, error: variantRes.error, pageUrl: variantRes.pageUrl });
        await delay(800);
        continue;
      }

      const foundLabels = [];
      let charChanged = false;

      for (const variant of VARIANT_ORDER) {
        const url = variantRes.variants[variant];
        if (!url) continue;

        foundLabels.push(VARIANT_META[variant].label);

        const outPath = join(categoryDir, `${char}.${variant}.svg`);
        if (await fileExists(outPath)) {
          skipped++;
          continue;
        }

        const dl = await downloadSvg(url);
        if (!dl.success) continue;

        await writeFile(outPath, dl.content, 'utf8');
        downloaded++;
        charChanged = true;
      }

      if (foundLabels.length) {
        resolvedChars++;
        console.log(`${charChanged ? '✅' : '⏭️'} ${foundLabels.join('/')}`);
      } else {
        console.log('❌ 找到页面但无可用版本');
        failed.push({ category, char, error: '找到页面但无可用版本', pageUrl: variantRes.pageUrl });
      }

      await delay(800);
    }
  }

  console.log('\n========================================');
  console.log(`  字符完成: ${resolvedChars}/${totalChars}`);
  console.log(`  新增文件: ${downloaded}`);
  console.log(`  已存在跳过: ${skipped}`);
  console.log('========================================');

  if (failed.length) {
    const failedPath = join(ROOT, 'FAILED_DOWNLOADS_ALL_VARIANTS.md');
    const lines = [
      '# 全量补齐三版本下载失败列表',
      '',
      `生成时间: ${new Date().toISOString()}`,
      '',
      ...failed.map(
        (f) =>
          `- [${f.category}] ${f.char} - ${f.error}${f.pageUrl ? ` - ${f.pageUrl}` : ''}`,
      ),
      '',
    ];
    await writeFile(failedPath, lines.join('\n'), 'utf8');
    console.log(`\n⚠️  失败列表已写入: ${failedPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
