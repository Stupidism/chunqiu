#!/usr/bin/env node
/**
 * 从汉典下载替代字符的甲骨文/金文
 * 
 * 一些现代汉字在古代使用不同的字形
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'assets', 'oracle-bone-icons');
const BASE_URL = 'https://www.zdic.net';

// 替代字符配置
// 原字 -> 替代字 (古文字中存在的)
const ALTERNATIVES = {
  terrain: {
    // 草 -> 艸 (草的本字，甲骨文存在)
    '草': { alt: '艸', name: '草原', reason: '艸是草的本字' },
    // 泽 -> 澤 (繁体) 或用 水
    '泽': { alt: '澤', name: '湖泊', reason: '繁体字' },
    // 泥 -> 用 土
    '泥': { alt: '土', name: '沼泽', reason: '以土代泥' },
  },
  resources: {
    // 铁 -> 鐵 (繁体)
    '铁': { alt: '鐵', name: '铁矿', reason: '繁体字' },
    // 茶 -> 荼 (茶的古字)
    '茶': { alt: '荼', name: '茶叶', reason: '荼是茶的古字' },
    // 瓦 -> 用陶
    '瓦': { alt: '陶', name: '瓷器', reason: '以陶代瓦' },
  },
  status: {
    // 击 -> 擊 (繁体)
    '击': { alt: '擊', name: '攻击', reason: '繁体字' },
    // 医 -> 醫 (繁体)
    '医': { alt: '醫', name: '治疗', reason: '繁体字' },
  },
};

/**
 * 从汉典页面提取甲骨文/金文图片URL
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
    
    // 查找甲骨文图片
    const oracleMatches = html.match(/img\.zdic\.net\/zy\/jiaguwen\/[^"'\s]+\.svg/g);
    if (oracleMatches && oracleMatches.length > 0) {
      let imgUrl = 'https://' + oracleMatches[0];
      const imgResponse = await fetch(imgUrl);
      if (imgResponse.ok) {
        return { 
          success: true, 
          data: await imgResponse.text(), 
          ext: 'svg',
          type: '甲骨文',
          url: imgUrl
        };
      }
    }
    
    // 查找金文
    const bronzeMatches = html.match(/img\.zdic\.net\/zy\/jinwen\/[^"'\s]+\.svg/g);
    if (bronzeMatches && bronzeMatches.length > 0) {
      let imgUrl = 'https://' + bronzeMatches[0];
      const imgResponse = await fetch(imgUrl);
      if (imgResponse.ok) {
        return { 
          success: true, 
          data: await imgResponse.text(), 
          ext: 'svg',
          type: '金文',
          url: imgUrl
        };
      }
    }
    
    // 查找小篆
    const sealMatches = html.match(/img\.zdic\.net\/zy\/xiaozhuan\/[^"'\s]+\.svg/g);
    if (sealMatches && sealMatches.length > 0) {
      let imgUrl = 'https://' + sealMatches[0];
      const imgResponse = await fetch(imgUrl);
      if (imgResponse.ok) {
        return { 
          success: true, 
          data: await imgResponse.text(), 
          ext: 'svg',
          type: '小篆',
          url: imgUrl
        };
      }
    }
    
    return { success: false, error: '未找到古文字' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('========================================');
  console.log('  下载替代字符的古文字形');
  console.log('========================================\n');
  
  let success = 0;
  const downloaded = [];
  const failed = [];
  
  for (const [category, chars] of Object.entries(ALTERNATIVES)) {
    const categoryDir = join(OUTPUT_DIR, category);
    
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }
    
    console.log(`\n📁 ${category.toUpperCase()}`);
    
    for (const [originalChar, info] of Object.entries(chars)) {
      process.stdout.write(`  🔍 ${info.name} (${originalChar} → ${info.alt}) ... `);
      
      const result = await fetchZdicOracleBone(info.alt);
      
      if (result.success) {
        // 保存为原字的文件名
        const filepath = join(categoryDir, `${originalChar}.${result.ext}`);
        await writeFile(filepath, result.data, 'utf-8');
        console.log(`✅ ${result.type}`);
        success++;
        downloaded.push({ 
          original: originalChar, 
          alt: info.alt, 
          name: info.name,
          type: result.type,
          reason: info.reason
        });
      } else {
        console.log(`❌ ${result.error}`);
        failed.push({ original: originalChar, alt: info.alt, name: info.name });
      }
      
      await delay(300);
    }
  }
  
  console.log('\n========================================');
  console.log(`  完成: ${success}/${Object.values(ALTERNATIVES).reduce((a, b) => a + Object.keys(b).length, 0)}`);
  console.log('========================================');
  
  if (downloaded.length > 0) {
    console.log('\n✅ 下载的替代字符:');
    downloaded.forEach(d => 
      console.log(`   ${d.name}: ${d.original} → ${d.alt} (${d.type}, ${d.reason})`)
    );
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 未找到:');
    failed.forEach(f => console.log(`   ${f.name}: ${f.original} → ${f.alt}`));
  }
}

main().catch(console.error);


