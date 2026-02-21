#!/usr/bin/env node
/**
 * 从汉典下载 Civ6 缺口图标的古文字版本
 *
 * 目标:
 * - 同一个字区分为 3 个版本: 甲骨文 / 金文 / 小篆
 * - 保存为:
 *   - {char}.oracle.svg
 *   - {char}.bronze.svg
 *   - {char}.seal.svg
 *
 * 用法:
 *   node scripts/download-civ6-gap-icons.mjs
 */

import { access, mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'packages', 'ui', 'assets', 'oracle-bone-icons');
const BASE_URL = 'https://www.zdic.net';

// 基于 Civ6 核心图标类别缺口挑选的代表字符
const CIV6_GAP_ICONS = {
  civilizations: {
    '邦': { name: '文明' },
    '城': { name: '自由城市' },
  },
  leaders: {
    '君': { name: '领袖' },
  },
  civics: {
    '政': { name: '市政' },
  },
  technologies: {
    '技': { name: '科技' },
  },
  policies: {
    '律': { name: '政策' },
  },
  governments: {
    '官': { name: '政体' },
  },
  districts: {
    '坊': { name: '区域' },
  },
  wonders: {
    '观': { name: '奇观' },
  },
  projects: {
    '作': { name: '项目' },
  },
  beliefs: {
    '神': { name: '信条' },
  },
  governors: {
    '督': { name: '总督' },
  },
  notifications: {
    '告': { name: '通知' },
  },
  diplomacy: {
    '盟': { name: '外交' },
  },
  victories: {
    '胜': { name: '胜利' },
  },
  improvements: {
    '耕': { name: '改良' },
  },
  proposals: {
    '议': { name: '提案' },
  },
  routes: {
    '商': { name: '贸易路线' },
  },
  greatpeople: {
    '贤': { name: '伟人' },
  },
  greatworks: {
    '典': { name: '巨作' },
  },
  mappins: {
    '标': { name: '地图钉' },
  },
  resources: {
    '漆': { name: '漆器' },
  },
  advisors: {
    '师': { name: '顾问' },
  },
  citybanner: {
    '旗': { name: '城市旗帜' },
  },
  civilopedia: {
    '典': { name: '百科索引' },
  },
  emergencies: {
    '急': { name: '紧急事件' },
  },
  environmentaleffects: {
    '候': { name: '环境效果' },
  },
  gamesettings: {
    '设': { name: '游戏设置' },
  },
  historicmoments: {
    '史': { name: '历史时刻' },
  },
  promotions: {
    '升': { name: '晋升' },
  },
  stats: {
    '数': { name: '统计' },
  },
  teams: {
    '队': { name: '队伍' },
  },
  unitabilities: {
    '能': { name: '单位能力' },
  },
  worldbuilder: {
    '造': { name: '世界编辑' },
  },
};

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

    // 429/5xx 退避重试
    await delay(1200 * (i + 1));
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
  const url = `${BASE_URL}/hans/${encodeURIComponent(char)}`;
  const res = await fetchWithRetry(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    return { success: false, error: `HTTP ${res.status}`, pageUrl: url };
  }

  const html = await res.text();
  const variants = extractVariantUrls(html);

  if (!Object.keys(variants).length) {
    return { success: false, error: '未找到甲骨文/金文/小篆', pageUrl: url };
  }

  return { success: true, variants, pageUrl: url };
}

async function downloadVariantSvg(variantUrl) {
  const res = await fetchWithRetry(variantUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Accept: 'image/svg+xml,*/*;q=0.8',
      Referer: BASE_URL,
    },
  });

  if (!res.ok) return { success: false, error: `HTTP ${res.status}` };

  return { success: true, svg: await res.text() };
}

async function main() {
  console.log('========================================');
  console.log('  Civ6 缺口图标 - 三版本下载');
  console.log('  版本: 甲骨文 / 金文 / 小篆');
  console.log('  来源: zdic.net');
  console.log('========================================\n');

  let totalChars = 0;
  let successChars = 0;
  let downloadedFiles = 0;
  let skippedFiles = 0;
  const failed = [];

  for (const [category, chars] of Object.entries(CIV6_GAP_ICONS)) {
    const categoryDir = join(OUTPUT_DIR, category);
    if (!existsSync(categoryDir)) await mkdir(categoryDir, { recursive: true });

    console.log(`\n📁 ${category.toUpperCase()}`);

    for (const [char, info] of Object.entries(chars)) {
      totalChars++;

      process.stdout.write(`  🔍 ${info.name} (${char}) ... `);
      const variantResult = await fetchVariantMap(char);

      if (!variantResult.success) {
        console.log(`❌ ${variantResult.error}`);
        failed.push({
          category,
          char,
          name: info.name,
          error: variantResult.error,
          pageUrl: variantResult.pageUrl,
        });
        await delay(900);
        continue;
      }

      let anySaved = false;
      const foundLabels = [];

      for (const variant of VARIANT_ORDER) {
        const variantUrl = variantResult.variants[variant];
        if (!variantUrl) continue;

        foundLabels.push(VARIANT_META[variant].label);

        const outPath = join(categoryDir, `${char}.${variant}.svg`);
        if (await fileExists(outPath)) {
          skippedFiles++;
          continue;
        }

        const downloadRes = await downloadVariantSvg(variantUrl);
        if (!downloadRes.success) continue;

        await writeFile(outPath, downloadRes.svg, 'utf-8');
        downloadedFiles++;
        anySaved = true;
      }

      if (foundLabels.length) {
        successChars++;
        const suffix = anySaved ? '✅' : '⏭️';
        console.log(`${suffix} ${foundLabels.join('/')}`);
      } else {
        console.log('❌ 找到条目但下载失败');
        failed.push({
          category,
          char,
          name: info.name,
          error: '找到条目但下载失败',
          pageUrl: variantResult.pageUrl,
        });
      }

      await delay(900);
    }
  }

  console.log('\n========================================');
  console.log(`  字符完成: ${successChars}/${totalChars}`);
  console.log(`  新增文件: ${downloadedFiles}`);
  console.log(`  已存在跳过: ${skippedFiles}`);
  console.log('========================================');

  if (failed.length) {
    const failedPath = join(OUTPUT_DIR, 'FAILED_DOWNLOADS_CIV6_GAPS.md');
    const lines = [
      '# Civ6 缺口图标下载失败列表',
      '',
      `生成时间: ${new Date().toISOString()}`,
      '',
      ...failed.map(
        (f) =>
          `- [${f.category}] ${f.name} (${f.char}) - ${f.error}${f.pageUrl ? ` - ${f.pageUrl}` : ''}`,
      ),
      '',
    ];
    await writeFile(failedPath, lines.join('\n'), 'utf-8');
    console.log(`\n⚠️  失败列表已写入: ${failedPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
