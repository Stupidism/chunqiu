#!/usr/bin/env python3
"""
从中华语文知识库下载甲骨文图片
https://www.chinese-linguipedia.org/

用法: python download_oracle_bone_images.py
"""

import os
import time
import requests
from urllib.parse import quote
from pathlib import Path

# 输出目录
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "oracle-bone-icons"

# 需要下载的所有汉字（繁体）
CHARACTERS = {
    # 单位图标
    "units": ["戈", "弓", "馬", "行", "力", "石", "目", "貝", "巫"],
    # 建筑图标  
    "buildings": ["宮", "倉", "屯", "市", "學", "宗", "邑", "井", "斤", "舟", "亭"],
    # 产出图标
    "yields": ["禾", "工", "金", "冊", "文", "祀", "令", "言"],
    # 地形图标
    "terrain": ["田", "艸", "林", "山", "阜", "川", "澤", "海", "沙", "冰", "泥"],
    # 资源图标
    "resources": ["鐵", "銅", "硝", "絲", "玉", "茶", "瓦", "香", "漆", "麥", "米", "魚", "牛", "木"],
    # 状态图标
    "status": ["擊", "盾", "足", "止", "醫", "升", "造", "毀", "和", "戎"],
    # 时代图标
    "eras": ["古", "鼎", "劍", "王"],
    # UI 图标
    "ui": ["齒", "乂", "可", "否", "訊", "戒", "日", "旦"],
}

# 备用简体字映射（如果繁体查不到）
SIMPLIFIED_MAP = {
    "馬": "马",
    "貝": "贝", 
    "宮": "宫",
    "倉": "仓",
    "學": "学",
    "澤": "泽",
    "鐵": "铁",
    "銅": "铜",
    "絲": "丝",
    "麥": "麦",
    "魚": "鱼",
    "擊": "击",
    "醫": "医",
    "劍": "剑",
    "齒": "齿",
    "訊": "讯",
}


def get_oracle_bone_image_url(character: str):
    """
    尝试获取汉字的甲骨文图片 URL
    
    中华语文知识库的 API 结构（需要进一步分析）
    """
    # 网站 API endpoint（需要通过浏览器开发者工具分析确认）
    base_url = "https://www.chinese-linguipedia.org"
    search_url = f"{base_url}/search_source_inner.html?word={quote(character)}"
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        }
        
        response = requests.get(search_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # 解析页面寻找甲骨文图片
        # 通常图片在特定的 class 或 id 下
        # 这里需要根据实际页面结构调整
        html = response.text
        
        # 查找可能的图片 URL 模式
        import re
        
        # 常见的图片模式
        patterns = [
            r'src="([^"]*oracle[^"]*\.(?:png|jpg|gif|svg))"',
            r'src="([^"]*jiaguwen[^"]*\.(?:png|jpg|gif|svg))"',
            r'src="([^"]*甲骨[^"]*\.(?:png|jpg|gif|svg))"',
            r'src="(/images/[^"]*\.(?:png|jpg|gif|svg))"',
            r'data-src="([^"]*\.(?:png|jpg|gif|svg))"',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            if matches:
                img_url = matches[0]
                if not img_url.startswith("http"):
                    img_url = base_url + img_url
                return img_url
        
        return None
        
    except Exception as e:
        print(f"  获取 {character} 时出错: {e}")
        return None


def download_image(url: str, filepath: Path) -> bool:
    """下载图片到指定路径"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        filepath.write_bytes(response.content)
        return True
    except Exception as e:
        print(f"  下载失败: {e}")
        return False


def main():
    """主函数"""
    print("=" * 60)
    print("甲骨文图标下载工具")
    print("数据来源: 中华语文知识库 (chinese-linguipedia.org)")
    print("=" * 60)
    
    # 创建输出目录
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # 统计
    total = 0
    success = 0
    failed = []
    
    for category, chars in CHARACTERS.items():
        print(f"\n📂 {category.upper()}")
        category_dir = OUTPUT_DIR / category
        category_dir.mkdir(exist_ok=True)
        
        for char in chars:
            total += 1
            print(f"  🔍 搜索: {char}", end=" ")
            
            # 尝试繁体
            img_url = get_oracle_bone_image_url(char)
            
            # 如果繁体查不到，尝试简体
            if not img_url and char in SIMPLIFIED_MAP:
                simplified = SIMPLIFIED_MAP[char]
                print(f"→ 尝试简体 {simplified}", end=" ")
                img_url = get_oracle_bone_image_url(simplified)
            
            if img_url:
                filepath = category_dir / f"{char}.png"
                if download_image(img_url, filepath):
                    print("✅")
                    success += 1
                else:
                    print("❌ 下载失败")
                    failed.append(char)
            else:
                print("❌ 未找到")
                failed.append(char)
            
            # 避免请求过快
            time.sleep(0.5)
    
    # 打印摘要
    print("\n" + "=" * 60)
    print(f"下载完成: {success}/{total}")
    if failed:
        print(f"失败的字符: {', '.join(failed)}")
    print(f"输出目录: {OUTPUT_DIR}")
    print("=" * 60)
    
    # 生成手动下载指南
    if failed:
        guide_path = OUTPUT_DIR / "MANUAL_DOWNLOAD_GUIDE.md"
        with open(guide_path, "w", encoding="utf-8") as f:
            f.write("# 手动下载指南\n\n")
            f.write("以下字符需要手动从网站下载：\n\n")
            f.write("网站地址: https://www.chinese-linguipedia.org/search_source.html\n\n")
            for char in failed:
                encoded = quote(char)
                url = f"https://www.chinese-linguipedia.org/search_source_inner.html?word={encoded}"
                f.write(f"- [{char}]({url})\n")
        print(f"\n📝 手动下载指南已生成: {guide_path}")


if __name__ == "__main__":
    main()

