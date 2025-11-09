import json
import os
import requests
import time
import boto3
from botocore.exceptions import ClientError

# ##################################################################
# ✅ V20.0 - AI 数据增强爬虫配置
# ##################################################################

# [ 1. 密钥 ] 100% 把你今天"有效"的 24 小时密钥粘贴到这里！
RIOT_API_KEY = "RGAPI-bd5be278-27d8-4e89-94bb-787085c934db" # 警告！ 100% 必须替换这里！

# [ 2. 路由 ] 100% 硬编码"欧洲区"！
RIOT_ACCOUNT_ROUTING = "europe"
RIOT_MATCH_ROUTING = "europe"

# [ 3. 爬取深度 ]
GAMES_TO_CRAWL_PER_SEED = 5

# [ 4. "种子" ] 100% 你的"V19.2 - 11 个黄金玩家"名单！
SEED_PLAYER_LIST = [
    {"name": "Suger 99", "tag": "EUW"},
    {"name": "KaynYouNot", "tag": "NCL"},
    {"name": "CapitalGaming", "tag": "1005"},
    {"name": "gllob", "tag": "dede"},
    {"name": "SkyD4C", "tag": "6666"},
    {"name": "Bratz", "tag": "NCL"},
    {"name": "CrocodilPasDuNil", "tag": "Fej"},
    {"name": "can i die soon", "tag": "EUW"},
    {"name": "ELYOYA CANARIO", "tag": "EUW"},
    {"name": "Yiga Chad", "tag": "EUW"},
    {"name": "novakiddo", "tag": "7673"},
    {"name": "Floverx", "tag": "EUW"},
]

# [ 5. API 限速器 ]
CALLS_PER_PERIOD = 100
PERIOD_IN_SECONDS = 121
call_count = 0
start_time = time.time()

# [ 6. DynamoDB 配置 ]
DYNAMODB_TABLE_NAME = "RiftLensPlayers"
DYNAMODB_STATIC_TABLE_NAME = "RiftLensStaticData"
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# [ 7. Data Dragon 版本 ]
DDRAGON_VERSION = "14.23.1"
DDRAGON_BASE_URL = f"https://ddragon.leagueoflegends.com/cdn/{DDRAGON_VERSION}/data/zh_CN"

# ##################################################################
# ✅ Data Dragon 静态数据爬取
# ##################################################################

def fetch_and_store_static_data():
    """
    从 Data Dragon API 获取静态数据并存储到 DynamoDB
    """
    print("\n--- [静态数据] 正在获取 Data Dragon 静态数据... ---")
    
    static_data_endpoints = {
        "DDRAGON_CHAMPIONS": f"{DDRAGON_BASE_URL}/champion.json",
        "DDRAGON_ITEMS": f"{DDRAGON_BASE_URL}/item.json",
        "DDRAGON_SUMMONERS": f"{DDRAGON_BASE_URL}/summoner.json",
        "DDRAGON_RUNES": f"https://ddragon.leagueoflegends.com/cdn/{DDRAGON_VERSION}/data/zh_CN/runesReforged.json"
    }
    
    try:
        table = dynamodb.Table(DYNAMODB_STATIC_TABLE_NAME)
    except Exception as e:
        print(f"    [静态数据] ❌ 无法连接到 DynamoDB 表 {DYNAMODB_STATIC_TABLE_NAME}: {str(e)}")
        return
    
    for key, url in static_data_endpoints.items():
        try:
            print(f"    [静态数据] 正在获取 {key}...")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # 存储到 DynamoDB
            table.put_item(
                Item={
                    'DataKey': key,
                    'Data': json.dumps(data, ensure_ascii=False),
                    'Version': DDRAGON_VERSION,
                    'UpdatedAt': int(time.time())
                }
            )
            print(f"    [静态数据] ✅ {key} 已成功存储到 DynamoDB")
            
        except Exception as e:
            print(f"    [静态数据] ❌ 获取 {key} 失败: {str(e)}")
    
    print("--- [静态数据] 静态数据获取完成 ---\n")

# ##################################################################
# ✅ API 调用器
# ##################################################################

def rate_limited_riot_api_call(url):
    """
    尊重限速的 Riot API 调用器
    """
    global call_count, start_time
    
    if call_count >= CALLS_PER_PERIOD:
        elapsed_time = time.time() - start_time
        if elapsed_time < PERIOD_IN_SECONDS:
            sleep_time = PERIOD_IN_SECONDS - elapsed_time
            print(f"    [爬虫] --- 遭遇 API 限速 (100 次 / 2 分钟) ---")
            print(f"    [爬虫] --- 正在睡眠 {sleep_time:.2f} 秒... ---")
            time.sleep(sleep_time)
        
        call_count = 0
        start_time = time.time()

    print(f"    [爬虫] 正在调用 Riot API (第 {call_count + 1} / {CALLS_PER_PERIOD} 次): {url[:80]}...")
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
        print(f"    [爬虫] Riot API 调用失败: {str(e)}")
        return None

# ##################################################################
# ✅ 衍生指标计算
# ##################################################################

def calculate_derived_metrics(participants, game_duration):
    """
    计算衍生指标: csPerMin, visionPerMin, killParticipation
    """
    # 第一次遍历: 计算团队总击杀数
    team_100_kills = 0
    team_200_kills = 0
    
    for p in participants:
        if p.get('teamId') == 100:
            team_100_kills += p.get('kills', 0)
        else:
            team_200_kills += p.get('kills', 0)
    
    # 第二次遍历: 计算每个玩家的衍生指标
    game_duration_minutes = game_duration / 60.0
    
    for p in participants:
        # CS per minute
        total_cs = p.get('totalMinionsKilled', 0) + p.get('neutralMinionsKilled', 0)
        p['csPerMin'] = round(total_cs / game_duration_minutes, 2) if game_duration_minutes > 0 else 0
        
        # Vision per minute
        p['visionPerMin'] = round(p.get('visionScore', 0) / game_duration_minutes, 2) if game_duration_minutes > 0 else 0
        
        # Kill participation
        team_total_kills = team_100_kills if p.get('teamId') == 100 else team_200_kills
        if team_total_kills > 0:
            p['killParticipation'] = round((p.get('kills', 0) + p.get('assists', 0)) / team_total_kills, 2)
        else:
            p['killParticipation'] = 0
    
    return participants

# ##################################################################
# ✅ 增强的比赛数据提取
# ##################################################################

def extract_enhanced_match_data(match_data):
    """
    从比赛数据中提取所有 AI 分析需要的字段
    """
    if not match_data or 'info' not in match_data:
        return None
    
    info = match_data['info']
    
    # 提取比赛元数据
    match_metadata = {
        'matchId': match_data.get('metadata', {}).get('matchId'),
        'gameCreation': info.get('gameCreation'),
        'gameDuration': info.get('gameDuration'),
        'gameMode': info.get('gameMode'),
        'queueId': info.get('queueId')
    }
    
    # 提取所有 10 名参与者的数据
    participants_data = []
    for p in info.get('participants', []):
        participant = {
            # 基础信息
            'puuid': p.get('puuid'),
            'summonerName': p.get('summonerName'),
            'championName': p.get('championName'),
            'champLevel': p.get('champLevel'),
            'individualPosition': p.get('individualPosition'),
            'teamId': p.get('teamId'),
            'win': p.get('win'),
            
            # KDA
            'kills': p.get('kills'),
            'deaths': p.get('deaths'),
            'assists': p.get('assists'),
            
            # 经济
            'goldEarned': p.get('goldEarned'),
            'totalMinionsKilled': p.get('totalMinionsKilled'),
            'neutralMinionsKilled': p.get('neutralMinionsKilled'),
            
            # 视野
            'visionScore': p.get('visionScore'),
            'wardsPlaced': p.get('wardsPlaced'),
            'wardsKilled': p.get('wardsKilled'),
            
            # 伤害
            'totalDamageDealtToChampions': p.get('totalDamageDealtToChampions'),
            'physicalDamageDealtToChampions': p.get('physicalDamageDealtToChampions'),
            'magicDamageDealtToChampions': p.get('magicDamageDealtToChampions'),
            'totalDamageTaken': p.get('totalDamageTaken'),
            'damageSelfMitigated': p.get('damageSelfMitigated'),
            
            # 装备和技能
            'item0': p.get('item0'),
            'item1': p.get('item1'),
            'item2': p.get('item2'),
            'item3': p.get('item3'),
            'item4': p.get('item4'),
            'item5': p.get('item5'),
            'item6': p.get('item6'),
            'summoner1Id': p.get('summoner1Id'),
            'summoner2Id': p.get('summoner2Id'),
            'perks': p.get('perks'),
            
            # 团队贡献
            'turretKills': p.get('turretKills'),
            'objectivesStolen': p.get('objectivesStolen')
        }
        participants_data.append(participant)
    
    # 计算衍生指标
    participants_data = calculate_derived_metrics(participants_data, info.get('gameDuration', 0))
    
    return {
        **match_metadata,
        'participants': participants_data
    }

# ##################################################################
# ✅ DynamoDB 存储
# ##################################################################

def store_match_to_dynamodb(puuid, match_data):
    """
    将比赛数据存储到 DynamoDB
    """
    try:
        table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        
        # 获取现有玩家数据
        response = table.get_item(Key={'PlayerID': puuid})
        
        if 'Item' in response:
            # 玩家已存在，更新 matchHistory
            player_data = response['Item']
            match_history = player_data.get('matchHistory', [])
            
            # 检查是否已存在此比赛
            match_ids = [m.get('matchId') for m in match_history]
            if match_data['matchId'] not in match_ids:
                match_history.append(match_data)
                player_data['matchHistory'] = match_history
                table.put_item(Item=player_data)
                return True
            else:
                return False  # 比赛已存在，跳过
        else:
            # 新玩家，创建记录
            player_data = {
                'PlayerID': puuid,
                'matchHistory': [match_data]
            }
            table.put_item(Item=player_data)
            return True
            
    except Exception as e:
        print(f"    [DynamoDB] ❌ 存储失败: {str(e)}")
        return False

# ##################################################################
# ✅ 主爬虫逻辑
# ##################################################################

def main():
    """
    V20.0 增强版爬虫主函数
    """
    print("--- [V20.0] RiftLens AI 数据增强爬虫启动 ---")
    
    # 统计信息
    stats = {
        'total_players': 0,
        'total_matches': 0,
        'total_api_calls': 0,
        'start_time': time.time()
    }
    
    # 步骤 1: 获取并存储静态数据
    fetch_and_store_static_data()
    
    # 步骤 2: 获取种子玩家 PUUID
    print(f"\n--- [V20.0] 正在处理 {len(SEED_PLAYER_LIST)} 个种子玩家... ---")
    seed_puuids = []
    
    for player in SEED_PLAYER_LIST:
        summoner_name = player["name"]
        tag_line = player["tag"]
        
        account_url = f"https://{RIOT_ACCOUNT_ROUTING}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{summoner_name}/{tag_line}"
        account_data = rate_limited_riot_api_call(account_url)
        
        if account_data and 'puuid' in account_data:
            puuid = account_data['puuid']
            player_full_name = f"{account_data['gameName']}#{account_data['tagLine']}"
            print(f"    [爬虫] ✅ 获取种子 PUUID: {player_full_name}")
            seed_puuids.append(puuid)
            stats['total_players'] += 1
    
    # 步骤 3: 为每个种子玩家获取比赛
    print(f"\n--- [V20.0] 正在为 {len(seed_puuids)} 个种子玩家获取比赛数据... ---")
    
    for puuid in seed_puuids:
        # 获取比赛列表
        match_list_url = f"https://{RIOT_MATCH_ROUTING}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?count={GAMES_TO_CRAWL_PER_SEED}"
        match_ids = rate_limited_riot_api_call(match_list_url)
        
        if not match_ids:
            continue
        
        print(f"    [爬虫] 找到 {len(match_ids)} 场比赛 (PUUID: {puuid[:10]}...)")
        
        # 获取每场比赛的详细数据
        for match_id in match_ids:
            match_detail_url = f"https://{RIOT_MATCH_ROUTING}.api.riotgames.com/lol/match/v5/matches/{match_id}"
            match_data = rate_limited_riot_api_call(match_detail_url)
            
            if not match_data:
                continue
            
            # 提取增强的比赛数据
            enhanced_match = extract_enhanced_match_data(match_data)
            
            if enhanced_match:
                # 为所有 10 名参与者存储数据
                for participant in enhanced_match['participants']:
                    participant_puuid = participant['puuid']
                    
                    # 为每个参与者创建一个包含完整比赛数据的记录
                    match_record = {
                        'matchId': enhanced_match['matchId'],
                        'gameCreation': enhanced_match['gameCreation'],
                        'gameDuration': enhanced_match['gameDuration'],
                        'gameMode': enhanced_match['gameMode'],
                        'queueId': enhanced_match['queueId'],
                        'participants': enhanced_match['participants'],
                        'playerData': participant  # 该玩家的个人数据
                    }
                    
                    if store_match_to_dynamodb(participant_puuid, match_record):
                        stats['total_matches'] += 1
    
    # 输出统计信息
    stats['total_api_calls'] = call_count
    stats['execution_time'] = time.time() - stats['start_time']
    
    print(f"\n--- [V20.0] 爬取完成！ ---")
    print(f"--- 总玩家数: {stats['total_players']} ---")
    print(f"--- 总比赛数: {stats['total_matches']} ---")
    print(f"--- 总 API 调用: {stats['total_api_calls']} ---")
    print(f"--- 执行时间: {stats['execution_time']:.2f} 秒 ---")

# ##################################################################
# ✅ 运行
# ##################################################################

if __name__ == "__main__":
    if "xxxx" in RIOT_API_KEY or "bd5be278" in RIOT_API_KEY:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("! 请先更新 RIOT_API_KEY 为你的有效 API 密钥！")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        main()
