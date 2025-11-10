import json
import os
import requests
# [“V19.6 战略”！] “不”导入 BOTO3！
# [“V19.6 战略”！] “不”导入 BEDROCK！
import time
import math
from decimal import Decimal 

# ##################################################################
# ✅ V25.0 - 步骤一：配置“数据爬虫”工具
# ##################################################################

# [ 1. 密钥 ]  把你今天（11 月 6 日）“有效”的 24 小时密钥粘贴到这里！
RIOT_API_KEY = "RGAPI-e9cba6d3-5530-4e92-af3b-bcd7b974d136" # 警告！  必须替换这里！

# [ 2. 路由 ]  硬编码“欧洲区”！
RIOT_MATCH_ROUTING = "europe"

# [ 3. 目标 ]  你的“V19.5 - 499 人花名册”！
PLAYER_MANIFEST_FILE = "player_manifest.json"
# [ 4. 输出 ]  我们的“本地数据缓存”！
OUTPUT_DATA_FILE = "all_player_data.json"

GAMES_TO_ANALYZE_COUNT = 20 

# [ 5. API 限速器 ]  尊重 Riot API！
CALLS_PER_PERIOD = 100
PERIOD_IN_SECONDS = 121 
call_count = 0
start_time = time.time()

# ##################################################################
# ✅ V25.0 - 步骤二：“尊重限速”的 API 调用器
# ##################################################################

def rate_limited_riot_api_call(url):
    """
    [“V19.6 稳赢”的关键！] 
    这个函数  会“自动”检查我们的 API 调用次数，
    并在需要时 “自动”睡眠 120 秒！
    """
    global call_count, start_time
    
    if call_count >= CALLS_PER_PERIOD:
        elapsed_time = time.time() - start_time
        if elapsed_time < PERIOD_IN_SECONDS:
            sleep_time = PERIOD_IN_SECONDS - elapsed_time
            print(f"    [数据爬虫] --- 遭遇 API 限速 (100 次 / 2 分钟) ---")
            print(f"    [数据爬虫] --- “尊重限速”，正在“睡眠” {sleep_time:.2f} 秒... ---")
            time.sleep(sleep_time)
        
        call_count = 0
        start_time = time.time()

    print(f"    [数据爬虫] 正在调用 Riot API (第 {call_count + 1} / {CALLS_PER_PERIOD} 次): {url[:80]}...")
    call_count += 1 
    
    try:
        response = requests.get(
            url,
            headers={"X-Riot-Token": RIOT_API_KEY},
            timeout=10 
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"    [数据爬虫] Riot API 调用失败: {str(e)}")
        return None

# ##################################################################
# ✅ V25.0 - 步骤三：“巨兽”函数（“V25.0 修复版”！）
# ##################################################################

def get_player_stats_from_match(match_data, target_puuid):
    """(V25.0) 从一场比赛中解析出 *我们* 玩家的“超级数据”！"""
    try:
        participants = match_data.get('info', {}).get('participants', [])
        for player in participants:
            if player.get('puuid') == target_puuid:
                game_duration_sec = match_data.get('info', {}).get('gameDuration', 1)
                game_duration_min = game_duration_sec / 60
                
                # [“V25.0 修复”！]  包含了你“刚问”的“召唤师技能”！
                stats = {
                    "matchId": match_data.get('metadata', {}).get('matchId'),
                    "win": player.get('win', False),
                    "championName": player.get('championName', 'Unknown'),
                    "kills": player.get('kills', 0),
                    "deaths": player.get('deaths', 0),
                    "assists": player.get('assists', 0),
                    "visionScore": player.get('visionScore', 0),
                    "cs": player.get('totalMinionsKilled', 0) + player.get('neutralMinionsKilled', 0),
                    "gold": player.get('goldEarned', 0),
                    "damage": player.get('totalDamageDealtToChampions', 0),
                    "position": player.get('teamPosition', 'UNKNOWN'),
                    # [V19.6]  要把“浮点数”转换成“字符串”，JSON 才  不会出错！
                    "csPerMin": f"{(player.get('totalMinionsKilled', 0) + player.get('neutralMinionsKilled', 0)) / game_duration_min:.2f}",
                    "visionPerMin": f"{player.get('visionScore', 0) / game_duration_min:.2f}",
                    "kda": f"{(player.get('kills', 0) + player.get('assists', 0)) / max(1, player.get('deaths', 0)):.2f}",
                    "summoner1Id": player.get('summoner1Id', 0), # [V25.0 新增!] 召唤师技能 1
                    "summoner2Id": player.get('summoner2Id', 0),  # [V25.0 新增!] 召唤师技能 2
                    "item0": player.get('item0', 0),
                    "item1": player.get('item1', 0),
                    "item2": player.get('item2', 0),
                    "item3": player.get('item3', 0),
                    "item4": player.get('item4', 0),
                    "item5": player.get('item5', 0),
                    "item6": player.get('item6', 0), # (饰品)
                }
                return stats
    except Exception as e:
        print(f"    [数据爬虫] 解析比赛数据失败: {str(e)}")
        return None

# ##################################################################
# ✅ V25.0 - 步骤四：“主”循环 ( “本地”运行！)
# ##################################################################

def main():
    """
    V25.0 “数据爬虫”主函数
    """
    print("--- [V25.0] RiftLens AI 教练 - “数据爬虫”脚本启动 ---")
    
    # 1. “读取”花名册
    try:
        with open(PLAYER_MANIFEST_FILE, 'r', encoding='utf-8') as f:
            player_manifest = json.load(f)
        print(f"[V25.0] 成功加载 {len(player_manifest)} 个玩家 (来自 'player_manifest.json')！")
    except Exception as e:
        print(f"[V25.0] 致命错误: 无法读取 'player_manifest.json'！ {str(e)}")
        print("请  确认你已经“成功运行”了 `crawler.py`（“脚本 #1”）！")
        return
    
    # 2. [V25.0] 我们的“本地数据缓存”！
    all_player_data = {}

    # 3. [V25.0] “主”循环！
    player_count = 0
    for player in player_manifest:
        player_puuid = player["puuid"]
        player_full_name = player["displayName"]
        player_count += 1
        
        print(f"\n--- [V25.0] 开始处理玩家 ({player_count}/{len(player_manifest)}): {player_full_name} ---")
        
        # 4. [V25.0] “在线”获取比赛列表
        match_list_url = f"https://{RIOT_MATCH_ROUTING}.api.riotgames.com/lol/match/v5/matches/by-puuid/{player_puuid}/ids?count={GAMES_TO_ANALYZE_COUNT}"
        match_ids = rate_limited_riot_api_call(match_list_url)
        
        if not match_ids:
            print(f"    [数据爬虫] 找不到 {player_full_name} 的比赛记录。跳过。")
            continue
        
        print(f"    [数据爬虫] 成功获取 {len(match_ids)} 场比赛 ID。开始循环...")
        
        # 5. [V25.0] “在线”循环获取比赛详情
        all_match_stats = []
        
        for match_id in match_ids:
            match_detail_url = f"https://{RIOT_MATCH_ROUTING}.api.riotgames.com/lol/match/v5/matches/{match_id}"
            match_data = rate_limited_riot_api_call(match_detail_url)
            
            if not match_data:
                continue 

            # [V25.0]  调用“新”的（带“召唤师技能”）“巨兽”函数！
            player_stats = get_player_stats_from_match(match_data, player_puuid)
            
            if player_stats:
                all_match_stats.append(player_stats)
                        
            time.sleep(1.5) # [“稳赢”的 V18.0 关键！]  必须“慢下来”！

        if not all_match_stats:
            print(f"    [数据爬虫] 成功获取比赛 ID，但解析 {player_full_name} 的详情失败。跳过。")
            continue

        print(f"    [数据爬虫] 成功解析 {len(all_match_stats)} 场比赛。开始聚合...")

        # 6. [V25.0] “离线”聚合（包含 V14.0“超级数据”！）
        total_games = len(all_match_stats)
        total_wins = sum(1 for game in all_match_stats if game['win'])
        champion_counts = {}
        position_counts = {} 
        total_kda = 0.0
        total_cs_per_min = 0.0
        total_vision_per_min = 0.0
        total_damage = 0.0
        total_gold = 0.0
        
        for game in all_match_stats:
            champ = game['championName']
            pos = game['position']
            champion_counts[champ] = champion_counts.get(champ, 0) + 1
            position_counts[pos] = position_counts.get(pos, 0) + 1
            total_kda += float(game['kda'])
            total_cs_per_min += float(game['csPerMin'])
            total_vision_per_min += float(game['visionPerMin'])
            total_damage += game['damage']
            total_gold += game['gold']

        annual_stats = {
            "playerName": player_full_name,
            "totalGames": total_games,
            "winRate": f"{total_wins / total_games:.2f}",
            "avgKDA": f"{total_kda / total_games:.2f}",
            "avgCsPerMin": f"{total_cs_per_min / total_games:.2f}",
            "avgVisionPerMin": f"{total_vision_per_min / total_games:.2f}",
            "avgDamage": f"{total_damage / total_games:.2f}", 
            "avgGold": f"{total_gold / total_games:.2f}", 
            "championCounts": dict(sorted(champion_counts.items(), key=lambda item: item[1], reverse=True)[:3]),
            "positionCounts": dict(sorted(position_counts.items(), key=lambda item: item[1], reverse=True))
        }
        
        # 7. [V25.0] “离线”构建“数据 JSON 报告”
        final_data_report = {
            "PlayerID": player_puuid, 
            "playerName": player_full_name,
            "annualStats": annual_stats,
            "matchHistory": all_match_stats, # ( 包含了“召唤师技能”！)
        }

        # 8. [V25.0] “保存”到“本地缓存”！
        all_player_data[player_puuid] = final_data_report
        print(f"    [数据爬虫] 成功！已将 {player_full_name} 的“数据报告”保存到“本地缓存”！")

    # 9. [V25.0] “最终”一步：保存“本地数据缓存” (用于明天“上传”！)
    try:
        with open(OUTPUT_DATA_FILE, "w", encoding='utf-8') as f:
            json.dump(all_player_data, f, indent=2, ensure_ascii=False)
        print(f"\n--- [V25.0]  完成！ ---")
        print(f"--- 成功为 {len(all_player_data)} / {len(player_manifest)} 个玩家生成了“数据报告”！ ---")
        print(f"--- 你的“本地数据缓存”  已经保存到 '{OUTPUT_DATA_FILE}'！ ---")
    except Exception as e:
        print(f"[V25.0] 致命错误: 无法保存 '{OUTPUT_DATA_FILE}'！ {str(e)}")


# ##################################################################
# ✅ V25.0 - 步骤五：运行！
# ##################################################################

if __name__ == "__main__":
    if "xxxx" in RIOT_API_KEY:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("! 首席工程师！你  必须先在“第 11 行”粘贴你“有效”的 API 密钥！ !")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        main()