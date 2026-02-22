#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = '/Users/sun/Documents/personal/chunqiu';
const SRC_ROOT = path.join(ROOT, 'packages/ui/assets/oracle-bone-icons');
const OUT_ROOT = path.join(ROOT, 'packages/ui/assets/icons');
const WORK_ROOT = path.join(ROOT, 'output/icons-priority-x5-work');
const MANIFEST = path.join(WORK_ROOT, 'manifest.csv');
const SELECTION = path.join(WORK_ROOT, 'selection.csv');
const SVGO_CFG = path.join(WORK_ROOT, 'svgo.aggressive.config.mjs');

const CONCURRENCY = Number(process.env.ICON_GEN_CONCURRENCY || 6);
const VARIANT_PRIORITY = { oracle: 0, bronze: 1, seal: 2 };

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function run(cmd, args, cwd = ROOT) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

function parseCsvLine(line) {
  const i1 = line.indexOf(',');
  if (i1 < 0) return null;
  const i2 = line.indexOf(',', i1 + 1);
  if (i2 < 0) return null;
  return {
    output_rel: line.slice(0, i1),
    source_rel: line.slice(i1 + 1, i2),
    variant: line.slice(i2 + 1),
  };
}

function countCurveCommands(svgText) {
  const m = svgText.match(/[cCsSqQtTaA]/g);
  return m ? m.length : 0;
}

function normalizeSep(p) {
  return p.split(path.sep).join('/');
}

function shouldSkipDirName(name) {
  return (
    name.startsWith('parallel-path-opt-test-') ||
    name === '.git' ||
    name === 'node_modules'
  );
}

function parseVariantRelPath(relPath) {
  const m = relPath.match(/^(.*)\.(oracle|bronze|seal)\.svg$/i);
  if (!m) return null;
  return {
    stem: m[1],
    variant: m[2].toLowerCase(),
  };
}

async function walkSvgFiles(dir, found) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDirName(entry.name)) continue;
      await walkSvgFiles(full, found);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.svg')) {
      found.push(full);
    }
  }
}

async function buildManifest() {
  await fs.mkdir(WORK_ROOT, { recursive: true });

  const svgFiles = [];
  await walkSvgFiles(SRC_ROOT, svgFiles);

  const selected = new Map();

  for (const full of svgFiles) {
    const rel = normalizeSep(path.relative(SRC_ROOT, full));
    const parsed = parseVariantRelPath(rel);
    if (!parsed) continue;

    const dirPart = parsed.stem.includes('/') ? parsed.stem.slice(0, parsed.stem.lastIndexOf('/')) : '';
    const charPart = parsed.stem.includes('/') ? parsed.stem.slice(parsed.stem.lastIndexOf('/') + 1) : parsed.stem;
    const output_rel = dirPart ? `${dirPart}/${charPart}.svg` : `${charPart}.svg`;

    const prio = VARIANT_PRIORITY[parsed.variant];
    if (prio === undefined) continue;

    const prev = selected.get(output_rel);
    if (!prev || prio < prev.prio) {
      selected.set(output_rel, {
        output_rel,
        source_rel: rel,
        variant: parsed.variant,
        prio,
      });
    }
  }

  const rows = Array.from(selected.values()).sort((a, b) =>
    a.output_rel.localeCompare(b.output_rel, 'zh-Hans-CN')
  );

  const lines = ['output_rel,source_rel,variant'];
  for (const row of rows) {
    lines.push(`${row.output_rel},${row.source_rel},${row.variant}`);
  }

  await fs.writeFile(MANIFEST, `${lines.join('\n')}\n`, 'utf8');
  await fs.writeFile(SELECTION, `${lines.join('\n')}\n`, 'utf8');

  const counts = { oracle: 0, bronze: 0, seal: 0 };
  for (const row of rows) {
    counts[row.variant] += 1;
  }
  console.log(`manifest=${MANIFEST}`);
  console.log(`total_icons=${rows.length}`);
  console.log(`oracle=${counts.oracle}`);
  console.log(`bronze=${counts.bronze}`);
  console.log(`seal=${counts.seal}`);
}

async function backupOldOutputIfNeeded() {
  if (!(await exists(OUT_ROOT))) return null;
  const entries = await fs.readdir(OUT_ROOT);
  if (entries.length === 0) return null;

  const backup = `${OUT_ROOT}-backup-${nowStamp()}`;
  await fs.rename(OUT_ROOT, backup);
  return backup;
}

async function writeSvgoConfig() {
  const cfg = `export default {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,
          removeUnknownsAndDefaults: false,
        },
      },
    },
    {
      name: 'convertPathData',
      params: {
        applyTransforms: true,
        applyTransformsStroked: true,
        makeArcs: { threshold: 2.5, tolerance: 0.5 },
        straightCurves: true,
        lineShorthands: true,
        curveSmoothShorthands: true,
        floatPrecision: 0,
        transformPrecision: 0,
        utilizeAbsolute: false,
      },
    },
    {
      name: 'cleanupNumericValues',
      params: {
        floatPrecision: 0,
      },
    },
  ],
};
`;
  await fs.writeFile(SVGO_CFG, cfg, 'utf8');
}

async function loadJobs() {
  const csv = await fs.readFile(SELECTION, 'utf8');
  const lines = csv.split('\n').filter(Boolean);
  const jobs = [];
  for (let i = 1; i < lines.length; i += 1) {
    const parsed = parseCsvLine(lines[i]);
    if (!parsed) continue;
    jobs.push(parsed);
  }
  return jobs;
}

async function runInkscapeBatch(jobs) {
  let index = 0;
  let done = 0;
  const failures = [];

  async function worker() {
    while (true) {
      const i = index;
      index += 1;
      if (i >= jobs.length) return;

      const job = jobs[i];
      const src = path.join(SRC_ROOT, job.source_rel);
      const out = path.join(OUT_ROOT, job.output_rel);
      await fs.mkdir(path.dirname(out), { recursive: true });

      const actions = `select-all;path-simplify;path-simplify;path-simplify;path-simplify;path-simplify;export-filename:${out};export-plain-svg;export-do`;

      try {
        await run('inkscape', [src, '--batch-process', `--actions=${actions}`]);
      } catch (err) {
        failures.push({ job, error: String(err) });
      }

      done += 1;
      if (done % 100 === 0 || done === jobs.length) {
        console.log(`inkscape_done=${done}/${jobs.length}`);
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, CONCURRENCY) }, () => worker());
  await Promise.all(workers);

  return failures;
}

async function runSvgoRecursive() {
  await run('npx', ['-y', 'svgo', '--config', SVGO_CFG, '--folder', OUT_ROOT, '--recursive', '--quiet']);
}

async function buildMetrics(jobs) {
  const metricsRows = [];
  const variantCounts = { oracle: 0, bronze: 0, seal: 0 };
  let origTotal = 0;
  let outTotal = 0;

  for (const job of jobs) {
    const src = path.join(SRC_ROOT, job.source_rel);
    const out = path.join(OUT_ROOT, job.output_rel);

    const srcStat = await fs.stat(src);
    const outStat = await fs.stat(out);

    const srcText = await fs.readFile(src, 'utf8');
    const outText = await fs.readFile(out, 'utf8');

    const origCurve = countCurveCommands(srcText);
    const outCurve = countCurveCommands(outText);

    metricsRows.push({
      file: job.output_rel,
      variant: job.variant,
      orig_bytes: srcStat.size,
      out_bytes: outStat.size,
      orig_curve_cmds: origCurve,
      out_curve_cmds: outCurve,
    });

    variantCounts[job.variant] = (variantCounts[job.variant] || 0) + 1;
    origTotal += srcStat.size;
    outTotal += outStat.size;
  }

  const metricsPath = path.join(OUT_ROOT, 'metrics.csv');
  const summaryPath = path.join(OUT_ROOT, 'summary.txt');
  const readmePath = path.join(OUT_ROOT, 'README.md');
  const selectionPath = path.join(OUT_ROOT, 'selection.csv');

  const metricLines = [
    'file,variant,orig_bytes,out_bytes,orig_curve_cmds,out_curve_cmds',
    ...metricsRows.map((r) =>
      `${r.file},${r.variant},${r.orig_bytes},${r.out_bytes},${r.orig_curve_cmds},${r.out_curve_cmds}`
    ),
  ];
  await fs.writeFile(metricsPath, `${metricLines.join('\n')}\n`, 'utf8');

  const categories = new Set(metricsRows.map((r) => (r.file.includes('/') ? r.file.split('/')[0] : '.')));

  const summary = [
    `files=${metricsRows.length}`,
    `categories=${categories.size}`,
    `orig_total=${origTotal}`,
    `out_total=${outTotal}`,
    `out_delta=${(((outTotal - origTotal) * 100) / origTotal).toFixed(2)}%`,
    `oracle=${variantCounts.oracle || 0}`,
    `bronze=${variantCounts.bronze || 0}`,
    `seal=${variantCounts.seal || 0}`,
  ].join('\n');
  await fs.writeFile(summaryPath, `${summary}\n`, 'utf8');

  const readme = `# icons (priority + x5 simplify)\n\nGenerated from \`packages/ui/assets/oracle-bone-icons\` with priority:\n\`oracle > bronze > seal\`.\n\nFor each character, only one source variant is selected and simplified.\nOutput directory structure mirrors source categories.\n\nPipeline:\n1. Variant selection by priority\n2. Inkscape \`path-simplify\` x5\n3. Aggressive SVGO cleanup\n\nArtifacts:\n- \`selection.csv\`\n- \`metrics.csv\`\n- \`summary.txt\`\n- \`.logs/\`\n`;
  await fs.writeFile(readmePath, readme, 'utf8');

  await fs.copyFile(SELECTION, selectionPath);
}

async function main() {
  await buildManifest();
  const jobs = await loadJobs();

  console.log(`jobs=${jobs.length}`);
  console.log(`concurrency=${CONCURRENCY}`);

  const backup = await backupOldOutputIfNeeded();
  if (backup) {
    console.log(`backup_created=${backup}`);
  }

  await fs.mkdir(OUT_ROOT, { recursive: true });
  await fs.mkdir(path.join(OUT_ROOT, '.logs'), { recursive: true });
  await writeSvgoConfig();

  const failures = await runInkscapeBatch(jobs);
  if (failures.length > 0) {
    const failPath = path.join(OUT_ROOT, 'FAILED_JOBS.json');
    await fs.writeFile(failPath, JSON.stringify(failures, null, 2), 'utf8');
    throw new Error(`inkscape failed on ${failures.length} jobs, see ${failPath}`);
  }

  console.log('svgo_start=true');
  await runSvgoRecursive();
  console.log('svgo_done=true');

  await buildMetrics(jobs);
  console.log(`done=${OUT_ROOT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
