#!/bin/bash
#
# 从 oraclebone.org 批量下载甲骨文 SVG 图片
# 用法: ./download_oraclebone_svg.sh
#

set -e

OUTPUT_DIR="../packages/ui/assets/oracle-bone-icons"
BASE_URL="https://oraclebone.org/character"

# 定义要下载的汉字（拼音_汉字格式）
declare -A UNITS=(
    ["ge1_戈"]="战士"
    ["gong1_弓"]="弓手"
    ["ma3_马"]="骑兵"
    ["xing2_行"]="开拓者"
    ["li4_力"]="工人"
    ["shi2_石"]="投石车"
    ["mu4_目"]="斥候"
    ["bei4_贝"]="商人"
    ["wu1_巫"]="僧侣"
)

declare -A BUILDINGS=(
    ["gong1_宫"]="宫殿"
    ["cang1_仓"]="粮仓"
    ["tun2_屯"]="兵营"
    ["shi4_市"]="市场"
    ["xue2_学"]="学宫"
    ["zong1_宗"]="祭坛"
    ["yi4_邑"]="城墙"
    ["jing3_井"]="水井"
    ["jin1_斤"]="工坊"
    ["zhou1_舟"]="港口"
    ["ting2_亭"]="驿站"
)

declare -A YIELDS=(
    ["he2_禾"]="粮食"
    ["gong1_工"]="生产"
    ["jin1_金"]="金币"
    ["ce4_册"]="科研"
    ["wen2_文"]="文化"
    ["si4_祀"]="信仰"
    ["ling4_令"]="影响力"
    ["yan2_言"]="外交点"
)

declare -A TERRAIN=(
    ["tian2_田"]="平原"
    ["cao3_草"]="草原"
    ["lin2_林"]="森林"
    ["shan1_山"]="山脉"
    ["fu4_阜"]="丘陵"
    ["chuan1_川"]="河流"
    ["ze2_泽"]="湖泊"
    ["hai3_海"]="海洋"
    ["sha1_沙"]="沙漠"
    ["bing1_冰"]="冻土"
    ["ni2_泥"]="沼泽"
)

declare -A STATUS=(
    ["ji1_击"]="攻击"
    ["dun4_盾"]="防御"
    ["zu2_足"]="移动"
    ["zhi3_止"]="驻守"
    ["yi1_医"]="治疗"
    ["sheng1_升"]="升级"
    ["zao4_造"]="建造"
    ["hui3_毁"]="拆除"
    ["he2_和"]="外交"
    ["rong2_戎"]="宣战"
)

declare -A ERAS=(
    ["gu3_古"]="远古"
    ["ding3_鼎"]="青铜"
    ["jian4_剑"]="铁器"
    ["wang2_王"]="帝国"
)

declare -A UI=(
    ["chi3_齿"]="设置"
    ["ce4_册"]="菜单"
    ["yi4_乂"]="关闭"
    ["ke3_可"]="确认"
    ["fou3_否"]="取消"
    ["xun4_讯"]="信息"
    ["jie4_戒"]="警告"
    ["ri4_日"]="回合"
    ["dan4_旦"]="结束回合"
)

download_category() {
    local category=$1
    local -n chars=$2
    
    local dir="$OUTPUT_DIR/$category"
    mkdir -p "$dir"
    
    echo ""
    echo "📁 下载 $category ..."
    
    for key in "${!chars[@]}"; do
        local name="${chars[$key]}"
        local char="${key#*_}"
        local url="$BASE_URL/$key/"
        local output="$dir/${char}.html"
        
        echo -n "  🔍 $name ($char) ... "
        
        # 下载页面
        if curl -s -o "$output.tmp" "$url"; then
            # 从页面中提取 SVG URL（需要根据实际页面结构调整）
            # oraclebone.org 可能直接内嵌 SVG 或者使用图片
            if grep -q "svg" "$output.tmp"; then
                # 提取 SVG 内容
                grep -oP '<svg[^>]*>.*?</svg>' "$output.tmp" > "$dir/${char}.svg" 2>/dev/null && echo "✅" || echo "⚠️ 需手动提取"
            else
                echo "⚠️ 未找到 SVG"
            fi
            rm -f "$output.tmp"
        else
            echo "❌ 下载失败"
        fi
        
        sleep 0.3  # 避免请求过快
    done
}

echo "========================================"
echo "  甲骨文 SVG 图标下载工具"
echo "  数据来源: oraclebone.org"
echo "========================================"

cd "$(dirname "$0")"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 下载各类别
download_category "units" UNITS
download_category "buildings" BUILDINGS
download_category "yields" YIELDS
download_category "terrain" TERRAIN
download_category "status" STATUS
download_category "eras" ERAS
download_category "ui" UI

echo ""
echo "========================================"
echo "  下载完成！"
echo "  输出目录: $OUTPUT_DIR"
echo "========================================"
echo ""
echo "注意: 部分文件可能需要手动从网站下载"
echo "访问: https://oraclebone.org/"
