#!/usr/bin/env node
/**
 * 从汉典 (zdic.net) 下载甲骨文 SVG 图标
 * 
 * 用法: node scripts/download-zdic-icons.mjs
 */

import { mkdir, writeFile, readFile, access } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'assets', 'oracle-bone-icons');
const BASE_URL = 'https://www.zdic.net';

// 需要下载的汉字配置（只包含 oraclebone.org 未找到的字符）
const MISSING_ICONS = {
  buildings: {
    '市': { name: '市场' },
    '学': { name: '学宫' },
    '斤': { name: '工坊' },
  },
  yields: {
    '金': { name: '金币' },
  },
  terrain: {
    '草': { name: '草原' },
    '川': { name: '河流' },
    '泽': { name: '湖泊' },
    '海': { name: '海洋' },
    '沙': { name: '沙漠' },
    '冰': { name: '冻土' },
    '泥': { name: '沼泽' },
  },
  resources: {
    '铁': { name: '铁矿' },
    '铜': { name: '铜矿' },
    '茶': { name: '茶叶' },
    '瓦': { name: '瓷器' },
    '香': { name: '香料' },
  },
  status: {
    '击': { name: '攻击' },
    '盾': { name: '防御' },
    '足': { name: '移动' },
    '医': { name: '治疗' },
    '造': { name: '建造' },
    '毁': { name: '拆除' },
    '和': { name: '外交' },
  },
  eras: {
    '剑': { name: '铁器' },
  },
  ui: {
    '否': { name: '取消' },
  },
};

/**
 * 从汉典页面提取甲骨文图片URL
 */
async function fetchZdicOracleBone(char) {
  const encodedChar = encodeURIComponent(char);
  const pageUrl = `${BASE_URL}/hans/${encodedChar}`;
  
  try {
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    
    // 查找甲骨文图片 URL
    // 格式: //img.zdic.net/zy/jiaguwen/XX_XXXX.svg
    const imgMatches = html.match(/img\.zdic\.net\/zy\/jiaguwen\/[^"'\s]+\.svg/g);
    
    if (imgMatches && imgMatches.length > 0) {
      // 取第一个甲骨文图片
      let imgUrl = imgMatches[0];
      if (!imgUrl.startsWith('http')) {
        imgUrl = 'https://' + imgUrl;
      }
      
      // 下载 SVG
      const imgResponse = await fetch(imgUrl);
      if (imgResponse.ok) {
        const svgContent = await imgResponse.text();
        return { 
          success: true, 
          data: svgContent, 
          ext: 'svg',
          url: imgUrl,
          totalVariants: imgMatches.length
        };
      }
    }
    
    // 如果没有甲骨文，尝试查找金文
    const bronzeMatches = html.match(/img\.zdic\.net\/zy\/jinwen\/[^"'\s]+\.svg/g);
    if (bronzeMatches && bronzeMatches.length > 0) {
      let imgUrl = bronzeMatches[0];
      if (!imgUrl.startsWith('http')) {
        imgUrl = 'https://' + imgUrl;
      }
      
      const imgResponse = await fetch(imgUrl);
      if (imgResponse.ok) {
        const svgContent = await imgResponse.text();
        return { 
          success: true, 
          data: svgContent, 
          ext: 'svg',
          url: imgUrl,
          note: '金文(bronze)',
          totalVariants: bronzeMatches.length
        };
      }
    }
    
    return { success: false, error: '未找到甲骨文或金文', pageUrl };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 检查文件是否已存在（JPG 或 SVG）
 */
async function fileExists(dir, char) {
  const jpgPath = join(dir, `${char}.jpg`);
  const svgPath = join(dir, `${char}.svg`);
  
  try {
    await access(jpgPath);
    return true;
  } catch {}
  
  try {
    await access(svgPath);
    return true;
  } catch {}
  
  return false;
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('  汉典甲骨文图标下载工具');
  console.log('  数据来源: zdic.net');
  console.log('========================================\n');
  
  // 统计
  let total = 0;
  let success = 0;
  let skipped = 0;
  const failed = [];
  const downloaded = [];
  
  for (const [category, chars] of Object.entries(MISSING_ICONS)) {
    const categoryDir = join(OUTPUT_DIR, category);
    
    // 创建目录
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }
    
    console.log(`\n📁 ${category.toUpperCase()}`);
    
    for (const [char, info] of Object.entries(chars)) {
      total++;
      
      // 检查是否已下载
      if (await fileExists(categoryDir, char)) {
        console.log(`  ⏭️  ${info.name} (${char}) - 已存在`);
        skipped++;
        continue;
      }
      
      process.stdout.write(`  🔍 ${info.name} (${char}) ... `);
      
      const result = await fetchZdicOracleBone(char);
      
      if (result.success) {
        const filepath = join(categoryDir, `${char}.${result.ext}`);
        await writeFile(filepath, result.data, 'utf-8');
        const note = result.note ? ` (${result.note})` : '';
        console.log(`✅ SVG${note}`);
        success++;
        downloaded.push({ char, name: info.name, category, url: result.url });
      } else {
        console.log(`❌ ${result.error}`);
        failed.push({ 
          char, 
          name: info.name, 
          category, 
          error: result.error,
          pageUrl: result.pageUrl
        });
      }
      
      // 避免请求过快
      await delay(300);
    }
  }
  
  // 打印摘要
  console.log('\n========================================');
  console.log(`  下载完成: ${success}/${total - skipped} (跳过: ${skipped})`);
  console.log(`  输出目录: ${OUTPUT_DIR}`);
  console.log('========================================');
  
  if (downloaded.length > 0) {
    console.log('\n✅ 成功下载:');
    downloaded.forEach(d => console.log(`   - ${d.name} (${d.char})`));
  }
  
  if (failed.length > 0) {
    console.log('\n⚠️  以下字符仍需手动下载:\n');
    
    const manualList = failed.map(f => {
      const url = `${BASE_URL}/hans/${encodeURIComponent(f.char)}`;
      return `- ${f.name} (${f.char}): ${url}`;
    }).join('\n');
    
    console.log(manualList);
    
    // 更新失败列表
    const failedListPath = join(OUTPUT_DIR, 'FAILED_DOWNLOADS.md');
    const existingContent = existsSync(failedListPath) 
      ? await readFile(failedListPath, 'utf-8') 
      : '';
    
    const newFailedContent = `
## 汉典 (zdic.net) 未找到的字符

${manualList}

---
`;
    
    if (!existingContent.includes('汉典')) {
      await writeFile(failedListPath, existingContent + newFailedContent, 'utf-8');
    }
  }
}

main().catch(console.error);


