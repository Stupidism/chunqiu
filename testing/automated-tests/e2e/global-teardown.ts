/**
 * Playwright 全局清理
 * 在所有测试之后执行
 */

import { FullConfig } from '@playwright/test';
import { request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 全局清理函数
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  const { baseURL } = config.projects[0].use;

  // 1. 清理测试数据
  await cleanupTestData(baseURL);

  // 2. 清理临时文件
  await cleanupTempFiles();

  // 3. 生成测试报告摘要
  await generateReportSummary(config);

  console.log('✅ Global teardown completed');
}

/**
 * 清理测试数据
 */
async function cleanupTestData(baseURL: string | undefined) {
  console.log('🗑️ Cleaning up test data...');

  if (!baseURL) {
    console.log('ℹ️ No base URL, skipping test data cleanup');
    return;
  }

  const context = await request.newContext();

  try {
    const response = await context.post(`${baseURL}/api/test/cleanup`, {
      headers: {
        'X-Test-Key': process.env.TEST_API_KEY || 'test-key'
      }
    });

    if (response.ok()) {
      console.log('✅ Test data cleaned up');
    } else {
      console.warn('⚠️ Failed to cleanup test data:', await response.text());
    }
  } catch (error) {
    console.warn('⚠️ Cleanup API not available');
  } finally {
    await context.dispose();
  }
}

/**
 * 清理临时文件
 */
async function cleanupTempFiles() {
  console.log('🗑️ Cleaning up temporary files...');

  const tempDirs = [
    path.join(process.cwd(), 'test-results'),
    path.join(process.cwd(), 'playwright-report', 'data')
  ];

  for (const dir of tempDirs) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Cleaned up: ${dir}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to cleanup ${dir}:`, error);
    }
  }
}

/**
 * 生成测试报告摘要
 */
async function generateReportSummary(config: FullConfig) {
  console.log('📊 Generating test report summary...');

  const reportDir = path.join(process.cwd(), '..', 'reports');
  const summaryFile = path.join(reportDir, 'test-summary.json');

  try {
    // 读取测试结果
    const resultsFile = path.join(reportDir, 'playwright-results.json');
    let results = null;

    if (fs.existsSync(resultsFile)) {
      const resultsData = fs.readFileSync(resultsFile, 'utf-8');
      results = JSON.parse(resultsData);
    }

    // 生成摘要
    const summary = {
      timestamp: new Date().toISOString(),
      config: {
        workers: config.workers,
        retries: config.retries,
        projects: config.projects.map(p => p.name)
      },
      results: results ? {
        total: results.stats?.tests || 0,
        passed: results.stats?.expected || 0,
        failed: results.stats?.unexpected || 0,
        skipped: results.stats?.skipped || 0,
        flaky: results.stats?.flaky || 0,
        duration: results.stats?.duration || 0
      } : null
    };

    // 确保报告目录存在
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // 写入摘要文件
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log('✅ Test summary saved to:', summaryFile);

    // 打印摘要
    if (summary.results) {
      console.log('\n📈 Test Results:');
      console.log(`  Total: ${summary.results.total}`);
      console.log(`  Passed: ${summary.results.passed} ✅`);
      console.log(`  Failed: ${summary.results.failed} ❌`);
      console.log(`  Skipped: ${summary.results.skipped} ⏭️`);
      console.log(`  Flaky: ${summary.results.flaky} ⚠️`);
      console.log(`  Duration: ${(summary.results.duration / 1000).toFixed(2)}s`);
    }
  } catch (error) {
    console.warn('⚠️ Failed to generate test summary:', error);
  }
}

export default globalTeardown;
