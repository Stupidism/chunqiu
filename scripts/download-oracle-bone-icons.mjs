#!/usr/bin/env node
/**
 * 从 oraclebone.org 下载甲骨文图标
 * 
 * 用法: node scripts/download-oracle-bone-icons.mjs
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'packages', 'ui', 'assets', 'oracle-bone-icons');
const BASE_URL = 'https://oraclebone.org';

// 需要下载的汉字配置
const ICONS = {
  units: {
    '戈': { pinyin: 'ge1', name: '战士' },
    '弓': { pinyin: 'gong1', name: '弓手' },
    '马': { pinyin: 'ma3', name: '骑兵' },
    '行': { pinyin: 'xing2', name: '开拓者' },
    '力': { pinyin: 'li4', name: '工人' },
    '石': { pinyin: 'shi2', name: '投石车' },
    '目': { pinyin: 'mu4', name: '斥候' },
    '贝': { pinyin: 'bei4', name: '商人' },
    '巫': { pinyin: 'wu1', name: '僧侣' },
  },
  buildings: {
    '宫': { pinyin: 'gong1', name: '宫殿' },
    '仓': { pinyin: 'cang1', name: '粮仓' },
    '屯': { pinyin: 'tun2', name: '兵营' },
    '市': { pinyin: 'shi4', name: '市场' },
    '学': { pinyin: 'xue2', name: '学宫' },
    '宗': { pinyin: 'zong1', name: '祭坛' },
    '邑': { pinyin: 'yi4', name: '城墙' },
    '井': { pinyin: 'jing3', name: '水井' },
    '斤': { pinyin: 'jin1', name: '工坊' },
    '舟': { pinyin: 'zhou1', name: '港口' },
    '亭': { pinyin: 'ting2', name: '驿站' },
  },
  yields: {
    '禾': { pinyin: 'he2', name: '粮食' },
    '工': { pinyin: 'gong1', name: '生产' },
    '金': { pinyin: 'jin1', name: '金币' },
    '册': { pinyin: 'ce4', name: '科研' },
    '文': { pinyin: 'wen2', name: '文化' },
    '祀': { pinyin: 'si4', name: '信仰' },
    '令': { pinyin: 'ling4', name: '影响力' },
    '言': { pinyin: 'yan2', name: '外交点' },
  },
  terrain: {
    '田': { pinyin: 'tian2', name: '平原' },
    '草': { pinyin: 'cao3', name: '草原' },
    '林': { pinyin: 'lin2', name: '森林' },
    '山': { pinyin: 'shan1', name: '山脉' },
    '阜': { pinyin: 'fu4', name: '丘陵' },
    '川': { pinyin: 'chuan1', name: '河流' },
    '泽': { pinyin: 'ze2', name: '湖泊' },
    '海': { pinyin: 'hai3', name: '海洋' },
    '沙': { pinyin: 'sha1', name: '沙漠' },
    '冰': { pinyin: 'bing1', name: '冻土' },
    '泥': { pinyin: 'ni2', name: '沼泽' },
  },
  resources: {
    '铁': { pinyin: 'tie3', name: '铁矿' },
    '铜': { pinyin: 'tong2', name: '铜矿' },
    '丝': { pinyin: 'si1', name: '丝绸' },
    '玉': { pinyin: 'yu4', name: '玉石' },
    '茶': { pinyin: 'cha2', name: '茶叶' },
    '瓦': { pinyin: 'wa3', name: '瓷器' },
    '香': { pinyin: 'xiang1', name: '香料' },
    '麦': { pinyin: 'mai4', name: '小麦' },
    '米': { pinyin: 'mi3', name: '稻米' },
    '鱼': { pinyin: 'yu2', name: '鱼类' },
    '牛': { pinyin: 'niu2', name: '牛羊' },
    '木': { pinyin: 'mu4', name: '木材' },
  },
  status: {
    '击': { pinyin: 'ji1', name: '攻击' },
    '盾': { pinyin: 'dun4', name: '防御' },
    '足': { pinyin: 'zu2', name: '移动' },
    '止': { pinyin: 'zhi3', name: '驻守' },
    '医': { pinyin: 'yi1', name: '治疗' },
    '升': { pinyin: 'sheng1', name: '升级' },
    '造': { pinyin: 'zao4', name: '建造' },
    '毁': { pinyin: 'hui3', name: '拆除' },
    '和': { pinyin: 'he2', name: '外交' },
    '戎': { pinyin: 'rong2', name: '宣战' },
  },
  eras: {
    '古': { pinyin: 'gu3', name: '远古' },
    '鼎': { pinyin: 'ding3', name: '青铜' },
    '剑': { pinyin: 'jian4', name: '铁器' },
    '王': { pinyin: 'wang2', name: '帝国' },
  },
  ui: {
    '齿': { pinyin: 'chi3', name: '设置' },
    '乂': { pinyin: 'yi4', name: '关闭' },
    '可': { pinyin: 'ke3', name: '确认' },
    '否': { pinyin: 'fou3', name: '取消' },
    '讯': { pinyin: 'xun4', name: '信息' },
    '戒': { pinyin: 'jie4', name: '警告' },
    '日': { pinyin: 'ri4', name: '回合' },
    '旦': { pinyin: 'dan4', name: '结束回合' },
  },
};

/**
 * 从 oraclebone.org 获取页面并提取图片URL
 */
async function fetchOracleBoneImage(char, pinyin) {
  // URL 编码汉字
  const encodedChar = encodeURIComponent(char);
  const pageUrl = `${BASE_URL}/character/${pinyin}_${encodedChar}/`;
  
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
    
    // 查找图片 URL: /images/upscaled/pinyin_char_0.jpg
    // 例如: /images/upscaled/li4_%E5%8A%9B_0.jpg
    const imgMatch = html.match(/src=([^\s>]+images\/upscaled\/[^"'\s>]+\.(jpg|png|jpeg))/i);
    
    if (imgMatch) {
      let imgUrl = imgMatch[1];
      // 移除可能的引号
      imgUrl = imgUrl.replace(/^["']|["']$/g, '');
      
      if (!imgUrl.startsWith('http')) {
        imgUrl = BASE_URL + imgUrl;
      }
      
      // 下载图片
      const imgResponse = await fetch(imgUrl);
      if (imgResponse.ok) {
        const buffer = await imgResponse.arrayBuffer();
        return { 
          success: true, 
          data: Buffer.from(buffer), 
          ext: imgUrl.split('.').pop(),
          url: imgUrl 
        };
      }
    }
    
    // 尝试备用模式：直接构造图片URL
    const directUrl = `${BASE_URL}/images/upscaled/${pinyin}_${encodedChar}_0.jpg`;
    const directResponse = await fetch(directUrl);
    if (directResponse.ok) {
      const buffer = await directResponse.arrayBuffer();
      return { 
        success: true, 
        data: Buffer.from(buffer), 
        ext: 'jpg',
        url: directUrl 
      };
    }
    
    return { success: false, error: 'Image not found', pageUrl };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
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
  console.log('  甲骨文图标下载工具');
  console.log('  数据来源: oraclebone.org');
  console.log('========================================\n');
  
  // 先清理之前错误下载的 SVG 文件
  console.log('🧹 清理之前错误下载的文件...\n');
  
  // 统计
  let total = 0;
  let success = 0;
  const failed = [];
  
  for (const [category, chars] of Object.entries(ICONS)) {
    const categoryDir = join(OUTPUT_DIR, category);
    
    // 创建目录
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }
    
    console.log(`\n📁 ${category.toUpperCase()}`);
    
    for (const [char, info] of Object.entries(chars)) {
      total++;
      process.stdout.write(`  🔍 ${info.name} (${char}) ... `);
      
      const result = await fetchOracleBoneImage(char, info.pinyin);
      
      if (result.success) {
        const filepath = join(categoryDir, `${char}.${result.ext}`);
        await writeFile(filepath, result.data);
        console.log(`✅ ${result.ext}`);
        success++;
      } else {
        console.log(`❌ ${result.error}`);
        failed.push({ 
          char, 
          name: info.name, 
          category, 
          pinyin: info.pinyin,
          error: result.error,
          pageUrl: result.pageUrl
        });
      }
      
      // 避免请求过快
      await delay(200);
    }
  }
  
  // 打印摘要
  console.log('\n========================================');
  console.log(`  下载完成: ${success}/${total}`);
  console.log(`  输出目录: ${OUTPUT_DIR}`);
  console.log('========================================');
  
  if (failed.length > 0) {
    console.log('\n⚠️  以下字符需要手动下载:\n');
    
    // 生成手动下载列表
    const manualList = failed.map(f => {
      const encodedChar = encodeURIComponent(f.char);
      const url = `${BASE_URL}/character/${f.pinyin}_${encodedChar}/`;
      return `- ${f.name} (${f.char}): ${url}`;
    }).join('\n');
    
    console.log(manualList);
    
    // 保存失败列表到文件
    const failedListPath = join(OUTPUT_DIR, 'FAILED_DOWNLOADS.md');
    const failedContent = `# 需要手动下载的字符

以下字符在 oraclebone.org 上未找到，请尝试其他资源：

${manualList}

## 备用资源

- 书法迷: http://jiaguwen.shufami.com/
- 古今文字集成: http://ccamc.org/cjkv_oaccgd.php
- Wikimedia Commons: https://commons.wikimedia.org/wiki/Category:Oracle_bone_script
`;
    await writeFile(failedListPath, failedContent, 'utf-8');
    console.log(`\n📝 失败列表已保存到: ${failedListPath}`);
  }
}

main().catch(console.error);
