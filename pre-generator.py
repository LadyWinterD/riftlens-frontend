import json
import os
import requests
import boto3 
import time
import math
from decimal import Decimal 

# ##################################################################
# ✅ V19.5 - 步骤一：配置“AI 生成器”工具
# ##################################################################

# [ 1. 密钥 ] 100% 把你今天（11 月 5 日）“有效”的 24 小时密钥粘贴到这里！
RIOT_API_KEY = "RGAPI-70b74c64-f90a-484a-80bc-da838e0b12f6" # 警告！ 100% 必须替换这里！

# [ 2. 路由 ] 100% 硬编码“欧洲区”！
RIOT_MATCH_ROUTING = "europe"

# [ 3. 数据库 ] 100% 你的 DynamoDB 表！
DYNAMODB_TABLE_NAME = "PlayerReports"
DYNAMODB_REGION = "ap-southeast-2" # (悉尼！)

# [ 4. AI 成本 ] 我们 100%“离线”生成“默认” AI 报告！
bedrock_runtime = boto3.client('bedrock-runtime', region_name='ap-southeast-2')

# [ 5. 目标 ] 100% 你的“V19.5 - 499 人花名册”！
PLAYER_MANIFEST_FILE = "player_manifest.json"

GAMES_TO_ANALYZE_COUNT = 20 # (我们只分析 20 场，确保“预生成”速度！)

# [ 6. API 限速器 ] 100% 尊重 Riot API！
CALLS_PER_PERIOD = 100
PERIOD_IN_SECONDS = 121 
call_count = 0
start_time = time.time()

# ##################################################################
# ✅ V19.5 - 步骤二：“尊重限速”的 API 调用器
# ##################################################################

def rate_limited_riot_api_call(url):
    """
    [“V19.5 稳赢”的关键！] 
    这个函数 100% 会“自动”检查我们的 API 调用次数，
    并在需要时 100%“自动”睡眠 120 秒！
    """
    global call_count, start_time
    
    if call_count >= CALLS_PER_PERIOD:
        elapsed_time = time.time() - start_time
        if elapsed_time < PERIOD_IN_SECONDS:
            sleep_time = PERIOD_IN_SECONDS - elapsed_time
            print(f"    [AI 生成器] --- 遭遇 API 限速 (100 次 / 2 分钟) ---")
            print(f"    [AI 生成器] --- 100%“尊重限速”，正在“睡眠” {sleep_time:.2f} 秒... ---")
            time.sleep(sleep_time)
        
        call_count = 0
        start_time = time.time()

    print(f"    [AI 生成器] 正在调用 Riot API (第 {call_count + 1} / {CALLS_PER_PERIOD} 次): {url[:80]}...")
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
        print(f"    [AI 生成器] Riot API 调用失败: {str(e)}")
        return None

# ##################################################################
# ✅ V19.5 - 步骤三：“巨兽”函数（100% 是“本地”的！）
# ##################################################################

def get_player_stats_from_match(match_data, target_puuid):
    """(V14.0) 从一场比赛中解析出 *我们* 玩家的“超级数据”！"""
    try:
        participants = match_data.get('info', {}).get('participants', [])
        for player in participants:
            if player.get('puuid') == target_puuid:
                game_duration_sec = match_data.get('info', {}).get('gameDuration', 1)
                game_duration_min = game_duration_sec / 60
                
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
                    "csPerMin": (player.get('totalMinionsKilled', 0) + player.get('neutralMinionsKilled', 0)) / game_duration_min,
                    "visionPerMin": player.get('visionScore', 0) / game_duration_min,
                    "kda": (player.get('kills', 0) + player.get('assists', 0)) / max(1, player.get('deaths', 0))
                }
                stats_decimal = json.loads(json.dumps(stats), parse_float=Decimal)
                return stats_decimal
    except Exception as e:
        print(f"    [AI 生成器] 解析比赛数据失败: {str(e)}")
        return None

def build_bedrock_prompt(annual_stats, worst_game_stats, summoner_name):
    """(V7.2) 构造“模型私语者” Prompt (V7.2 英语 - 不变)"""
    
    stats_summary = f"""
    - Player: {summoner_name}
    - Annual Win Rate: {annual_stats['winRate'] * 100:.0f}%
    - Annual Avg. KDA: {annual_stats['avgKDA']:.2f}
    - Annual Avg. CS/min: {annual_stats['avgCsPerMin']:.1f}
    - Annual Avg. Vision/min: {annual_stats['avgVisionPerMin']:.1f}
    - Top 3 Champions: {', '.join([f'{champ} ({count} games)' for champ, count in annual_stats['championCounts'].items()])}
    """
    
    roast_summary = f"""
    - Match ID: {worst_game_stats['matchId']}
    - Champion: {worst_game_stats['championName']}
    - Score (K/D/A): {worst_game_stats['kills']}/{worst_game_stats['deaths']}/{worst_game_stats['assists']}
    - Final KDA: {worst_game_stats['kda']:.2f}
    - CS/min: {worst_game_stats['csPerMin']:.1f}
    - Vision/min: {worst_game_stats['visionPerMin']:.1f}
    """

    prompt = f"""
    Human: You are a world-class, elite League of Legends data analyst and coach. Your task is to provide a "Roast Master 3000" and "Hidden Gem Detector" style AI audit report for a player. Your tone must be strict, fair, and brutally honest, but your insights must be deep and actionable.

    You MUST reply **in English**.

    Here is the player's "2025 Annual Average Data" (based on their last {GAMES_TO_ANALYZE_COUNT} games):
    <annual_stats>
    {stats_summary}
    </annual_stats>

    Here is a "Typical Loss" that the AI has selected from their history to demonstrate their fatal flaw:
    <worst_game_stats>
    {roast_summary}
    </worst_game_stats>

    Please write the report strictly following this format:

    1.  **[ANNUAL STRENGTHS]**: (Briefly analyze the player's 1-2 annual strengths from <annual_stats>.)
    2.  **[HIDDEN FATAL FLAW (The Roast)]**: (Look at <annual_stats> and identify their single most critical, hidden, "annual weakness pattern". For example: 'Your KDA looks decent, but your 0.4 Vision/min is a match-losing disaster.')
    3.  **[AI CASE STUDY (The "Why")]**: (Look at <worst_game_stats> and explain exactly HOW their "annual weakness" caused them to lose this "typical game". Be specific. Provide 1-2 concrete, actionable recommendations for improvement.)

    Assistant:
    """
    return prompt

def call_bedrock(prompt):
    """(V7.0) 调用 Bedrock (AI) (不变)"""
    print(f"    [AI 生成器] 正在调用 Amazon Bedrock (AI)...")
    try:
        model_id = 'anthropic.claude-3-haiku-20240307-v1:0'
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}]
        }
        response = bedrock_runtime.invoke_model(body=json.dumps(request_body), modelId=model_id)
        response_body = json.loads(response.get('body').read())
        ai_text = response_body.get('content', [{}])[0].get('text', '')
        print(f"    [AI 生成器] 成功从 Bedrock 获得 AI 分析: {ai_text[:50]}...")
        return ai_text
    except Exception as e:
        print(f"    [AI 生成器] Bedrock (AI) 调用失败: {str(e)}")
        return "AI analysis failed. (This is a pre-generated report. The AI module may be offline.)"


# ##################################################################
# ✅ V19.5 - 步骤四：“主”循环 (100% “本地”运行！)
# ##################################################################

def main():
    """
    V19.5 “AI 生成器”主函数
    """
    print("--- [V19.5] RiftLens AI 教练 - “AI 生成器”脚本启动 ---")
    
    # 1. 初始化 DynamoDB
    try:
        dynamodb = boto3.resource('dynamodb', region_name=DYNAMODB_REGION)
        table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        print(f"[V19.5] 成功连接到 DynamoDB 表: {DYNAMODB_TABLE_NAME}")
    except Exception as e:
        print(f"[V19.5] 致命错误: 无法连接到 DynamoDB！ {str(e)}")
        print("请 100% 确认你已经“登录”了 AWS CLI (aws configure)！")
        return

    # 2. “读取”花名册
    try:
        with open(PLAYER_MANIFEST_FILE, 'r', encoding='utf-8') as f:
            player_manifest = json.load(f)
        print(f"[V19.5] 成功加载 {len(player_manifest)} 个玩家 (来自 'player_manifest.json')！")
    except Exception as e:
        print(f"[V19.5] 致命错误: 无法读取 'player_manifest.json'！ {str(e)}")
        print("请 100% 确认你已经“成功运行”了 `crawler.py`（“脚本 #1”）！")
        return
        
    # 3. [V19.5] “主”循环！
    player_count = 0
    for player in player_manifest:
        player_puuid = player["puuid"]
        player_full_name = player["displayName"]
        player_count += 1
        
        print(f"\n--- [V19.5] 开始处理玩家 ({player_count}/{len(player_manifest)}): {player_full_name} ---")
        
        # 4. [V19.5] “在线”获取比赛列表
        match_list_url = f"https://{RIOT_MATCH_ROUTING}.api.riotgames.com/lol/match/v5/matches/by-puuid/{player_puuid}/ids?count={GAMES_TO_ANALYZE_COUNT}"
        match_ids = rate_limited_riot_api_call(match_list_url)
        
        if not match_ids:
            print(f"    [AI 生成器] 找不到 {player_full_name} 的比赛记录。跳过。")
            continue
        
        print(f"    [AI 生成器] 成功获取 {len(match_ids)} 场比赛 ID。开始循环...")
        
        # 5. [V19.5] “在线”循环获取比赛详情
        all_match_stats = []
        worst_game = None 
        
        for match_id in match_ids:
            match_detail_url = f"https://{RIOT_MATCH_ROUTING}.api.riotgames.com/lol/match/v5/matches/{match_id}"
            match_data = rate_limited_riot_api_call(match_detail_url)
            
            if not match_data:
                continue 

            player_stats = get_player_stats_from_match(match_data, player_puuid)
            
            if player_stats:
                all_match_stats.append(player_stats)
                if not player_stats['win'] and player_stats['kda'] < Decimal('1.0'):
                    if worst_game is None or player_stats['deaths'] > worst_game['deaths']:
                        worst_game = player_stats
                        
            time.sleep(1.5) # [“稳赢”的 V18.0 关键！] 100% 必须“慢下来”！

        if not all_match_stats:
            print(f"    [AI 生成器] 成功获取比赛 ID，但解析 {player_full_name} 的详情失败。跳过。")
            continue

        if worst_game is None:
            worst_game = next((game for game in all_match_stats if not game['win']), all_match_stats[0])

        print(f"    [AI 生成器] 成功解析 {len(all_match_stats)} 场比赛。开始聚合...")

        # 6. [V19.5] “离线”聚合（包含 V14.0“超级数据”！）
        total_games = len(all_match_stats)
        total_wins = sum(1 for game in all_match_stats if game['win'])
        champion_counts = {}
        position_counts = {} 
        total_kda = Decimal('0.0')
        total_cs_per_min = Decimal('0.0')
        total_vision_per_min = Decimal('0.0')
        total_damage = Decimal('0.0') 
        total_gold = Decimal('0.0') 
        
        for game in all_match_stats:
            champ = game['championName']
            pos = game['position']
            champion_counts[champ] = champion_counts.get(champ, 0) + 1
            position_counts[pos] = position_counts.get(pos, 0) + 1
            total_kda += game['kda']
            total_cs_per_min += game['csPerMin']
            total_vision_per_min += game['visionPerMin']
            total_damage += game['damage']
            total_gold += game['gold']

        annual_stats = {
            "playerName": player_full_name,
            "totalGames": total_games,
            "winRate": total_wins / total_games,
            "avgKDA": total_kda / total_games,
            "avgCsPerMin": total_cs_per_min / total_games,
            "avgVisionPerMin": total_vision_per_min / total_games,
            "avgDamage": total_damage / total_games, 
            "avgGold": total_gold / total_games, 
            "championCounts": dict(sorted(champion_counts.items(), key=lambda item: item[1], reverse=True)[:3]),
            "positionCounts": dict(sorted(position_counts.items(), key=lambda item: item[1], reverse=True))
        }
        
        # 7. [V19.5] “在线”调用 AI（“预生成”报告！）
        prompt = build_bedrock_prompt(annual_stats, worst_game, player_full_name)
        ai_analysis = call_bedrock(prompt)
        
        # 8. [V19.5] “离线”构建“超级 JSON 报告”
        expiration_time = int(time.time()) + 86400 # 24 小时 TTL
        
        final_report = {
            "PlayerID": player_puuid, 
            "playerName": player_full_name,
            "expirationTime": expiration_time, 
            "annualStats": annual_stats,
            "aiAnalysis_DefaultRoast": ai_analysis, # [“V19.5 终极战略”！] 我们 100% 把它命名为“默认”！
            "matchHistory": all_match_stats,
            # (我们 100%“离线”生成了“数据”，但 100%“在线”生成“AI 聊天”！)
        }

        # 9. [V19.5] “上传”到 DynamoDB（“缓存”）！
        try:
            table.put_item(Item=final_report)
            print(f"    [AI 生成器] 成功！已将 {player_full_name} 的“超级报告”上传到 DynamoDB！")
        except Exception as e:
            print(f"    [AI 生成器] 致命错误: 无法将 {player_full_name} 的报告上传到 DynamoDB！ {str(e)}")
            print("    [AI 生成器] （**100%** 是因为 Boto3 没装，或者你的 AWS CLI 没配置！`aws configure`）")

    print(f"\n--- [V19.5] 100% 完成！ ---")
    print(f"--- 成功为 {len(player_manifest)} 个玩家生成了“超级数据报告”！ ---")


# ##################################################################
# ✅ V19.5 - 步骤五：运行！
# ##################################################################

if __name__ == "__main__":
    if "xxxx" in RIOT_API_KEY:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("! 首席工程师！你 100% 必须先在“第 11 行”粘贴你“有效”的 API 密钥！ !")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        main()