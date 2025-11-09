import json
import boto3
import requests
import time
from decimal import Decimal

# ##################################################################
# ✅ 数据增强更新器 - 保持现有结构，只添加缺失字段
# ##################################################################

# [ 1. Riot API 配置 ]
RIOT_API_KEY = "RGAPI-dc514f45-336f-4c1c-92da-4a5b5621282f"  # 更新为你的密钥
RIOT_MATCH_ROUTING = "europe"

# [ 2. DynamoDB 配置 ]
DYNAMODB_TABLE_NAME = "PlayerReports"
DYNAMODB_STATIC_TABLE_NAME = "RiftLensStaticData"
DYNAMODB_REGION = "ap-southeast-2"

# [ 3. Data Dragon 配置 ]
DDRAGON_VERSION = "14.23.1"
DDRAGON_BASE_URL = f"https://ddragon.leagueoflegends.com/cdn/{DDRAGON_VERSION}/data/zh_CN"

# [ 4. API 限速 ]
CALLS_PER_PERIOD = 100
PERIOD_IN_SECONDS = 121
call_count = 0
start_time = time.time()

# 初始化 AWS
dynamodb = boto3.resource('dynamodb', region_name=DYNAMODB_REGION)
players_table = dynamodb.Table(DYNAMODB_TABLE_NAME)

# ##################################################################
# ✅ API 调用器
# ##################################################################

def rate_limited_riot_api_call(url):
    """尊重限速的 Riot API 调用"""
    global call_count, start_time
    
    if call_count >= CALLS_PER_PERIOD:
        elapsed_time = time.time() - start_time
        if elapsed_time < PERIOD_IN_SECONDS:
            sleep_time = PERIOD_IN_SECONDS - elapsed_time
            print(f"    [限速] 等待 {sleep_time:.2f} 秒...")
            time.sleep(sleep_time)
        call_count = 0
        start_time = time.time()

    print(f"    [API] 调用 {call_count + 1}/{CALLS_PER_PERIOD}: {url[:80]}...")
    call_count += 1
    
    try:
        response = requests.get(url, headers={"X-Riot-Token": RIOT_API_KEY}, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"    [API] 失败: {str(e)}")
        return None

# ##################################################################
# ✅ 静态数据获取
# ##################################################################

def fetch_and_store_static_data():
    """获取 Data Dragon 静态数据并存储到 DynamoDB"""
    print("\n--- [静态数据] 开始获取... ---")
    
    static_data_endpoints = {
        "DDRAGON_CHAMPIONS": f"{DDRAGON_BASE_URL}/champion.json",
        "DDRAGON_ITEMS": f"{DDRAGON_BASE_URL}/item.json",
        "DDRAGON_SUMMONERS": f"{DDRAGON_BASE_URL}/summoner.json",
        "DDRAGON_RUNES": f"https://ddragon.leagueoflegends.com/cdn/{DDRAGON_VERSION}/data/zh_CN/runesReforged.json"
    }
    
    try:
        static_table = dynamodb.Table(DYNAMODB_STATIC_TABLE_NAME)
    except Exception as e:
        print(f"    [静态数据] 警告: 无法访问 {DYNAMODB_STATIC_TABLE_NAME} 表")
        print(f"    [静态数据] 请先创建表: aws dynamodb create-table --table-name {DYNAMODB_STATIC_TABLE_NAME} ...")
        return
    
    for key, url in static_data_endpoints.items():
        try:
            print(f"    [静态数据] 获取 {key}...")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            static_table.put_item(
                Item={
                    'DataKey': key,
                    'Data': json.dumps(data, ensure_ascii=False),
                    'Version': DDRAGON_VERSION,
                    'UpdatedAt': int(time.time())
                }
            )
            print(f"    [静态数据] ✅ {key} 已存储")
        except Exception as e:
            print(f"    [静态数据] ❌ {key} 失败: {str(e)}")
    
    print("--- [静态数据] 完成 ---\n")

# ##################################################################
# ✅ 数据增强函数
# ##################################################################

def enrich_match_data(match_id, player_puuid):
    """
    为指定比赛添加缺失字段和全部 10 人数据
    """
    # 获取比赛详情
    match_url = f"https://{RIOT_MATCH_ROUTING}.api.riotgames.com/lol/match/v5/matches/{match_id}"
    match_data = rate_limited_riot_api_call(match_url)
    
    if not match_data or 'info' not in match_data:
        return None
    
    info = match_data['info']
    
    # 找到该玩家的数据
    player_data = None
    for p in info.get('participants', []):
        if p.get('puuid') == player_puuid:
            player_data = p
            break
    
    if not player_data:
        return None
    
    # 构建增强的比赛数据（保持现有字段 + 添加新字段）
    enriched_match = {
        # 比赛元数据（新增）
        'gameCreation': info.get('gameCreation'),
        'gameDuration': info.get('gameDuration'),
        
        # 玩家基础数据（新增）
        'champLevel': player_data.get('champLevel'),
        'teamId': player_data.get('teamId'),
        
        # 经济数据（新增）
        'neutralMinionsKilled': player_data.get('neutralMinionsKilled'),
        'totalMinionsKilled': player_data.get('totalMinionsKilled'),
        'goldEarned': player_data.get('goldEarned'),
        
        # 视野数据（新增）
        'wardsPlaced': player_data.get('wardsPlaced'),
        'wardsKilled': player_data.get('wardsKilled'),
        
        # 伤害数据（新增）
        'totalDamageDealtToChampions': player_data.get('totalDamageDealtToChampions'),
        'physicalDamageDealtToChampions': player_data.get('physicalDamageDealtToChampions'),
        'magicDamageDealtToChampions': player_data.get('magicDamageDealtToChampions'),
        'totalDamageTaken': player_data.get('totalDamageTaken'),
        'damageSelfMitigated': player_data.get('damageSelfMitigated'),
        
        # 团队贡献（新增）
        'turretKills': player_data.get('turretKills'),
        'objectivesStolen': player_data.get('objectivesStolen'),
        
        # 符文（新增）
        'perks': player_data.get('perks'),
        
        # 全部 10 人数据（新增 - 用于 AI 对比分析）
        'participants': []
    }
    
    # 提取所有 10 名玩家的数据
    for p in info.get('participants', []):
        participant = {
            'puuid': p.get('puuid'),
            'summonerName': p.get('summonerName'),
            'championName': p.get('championName'),
            'champLevel': p.get('champLevel'),
            'individualPosition': p.get('individualPosition'),
            'teamId': p.get('teamId'),
            'win': p.get('win'),
            'kills': p.get('kills'),
            'deaths': p.get('deaths'),
            'assists': p.get('assists'),
            'goldEarned': p.get('goldEarned'),
            'totalMinionsKilled': p.get('totalMinionsKilled'),
            'neutralMinionsKilled': p.get('neutralMinionsKilled'),
            'visionScore': p.get('visionScore'),
            'wardsPlaced': p.get('wardsPlaced'),
            'wardsKilled': p.get('wardsKilled'),
            'totalDamageDealtToChampions': p.get('totalDamageDealtToChampions'),
            'physicalDamageDealtToChampions': p.get('physicalDamageDealtToChampions'),
            'magicDamageDealtToChampions': p.get('magicDamageDealtToChampions'),
            'totalDamageTaken': p.get('totalDamageTaken'),
            'damageSelfMitigated': p.get('damageSelfMitigated'),
            'item0': p.get('item0'),
            'item1': p.get('item1'),
            'item2': p.get('item2'),
            'item3': p.get('item3'),
            'item4': p.get('item4'),
            'item5': p.get('item5'),
            'item6': p.get('item6'),
            'summoner1Id': p.get('summoner1Id'),
            'summoner2Id': p.get('summoner2Id'),
            'turretKills': p.get('turretKills'),
            'objectivesStolen': p.get('objectivesStolen')
        }
        enriched_match['participants'].append(participant)
    
    return enriched_match

# ##################################################################
# ✅ 主更新逻辑
# ##################################################################

def main():
    """增量更新现有数据"""
    print("--- [数据增强] 开始更新现有数据 ---\n")
    
    stats = {
        'total_players': 0,
        'total_matches_processed': 0,
        'total_matches_enriched': 0,
        'total_api_calls': 0
    }
    
    # 步骤 1: 获取并存储静态数据
    fetch_and_store_static_data()
    
    # 步骤 2: 扫描所有玩家
    print("--- [扫描] 读取 DynamoDB 中的所有玩家... ---")
    
    try:
        response = players_table.scan()
        players = response.get('Items', [])
        
        # 处理分页
        while 'LastEvaluatedKey' in response:
            response = players_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            players.extend(response.get('Items', []))
        
        print(f"    [扫描] 找到 {len(players)} 个玩家\n")
        stats['total_players'] = len(players)
        
    except Exception as e:
        print(f"    [扫描] 错误: {str(e)}")
        return
    
    # 步骤 3: 为每个玩家更新比赛数据
    for idx, player in enumerate(players):
        player_id = player.get('PlayerID')
        player_name = player.get('playerName', 'Unknown')
        match_history = player.get('matchHistory', [])
        
        print(f"\n--- [{idx+1}/{len(players)}] 处理玩家: {player_name} ---")
        print(f"    [玩家] 找到 {len(match_history)} 场比赛")
        
        if not match_history:
            continue
        
        updated_matches = []
        
        for match in match_history:
            match_id = match.get('matchId')
            stats['total_matches_processed'] += 1
            
            # 检查是否已经有增强数据
            if 'participants' in match and match.get('participants'):
                print(f"    [比赛] {match_id} 已增强，跳过")
                updated_matches.append(match)
                continue
            
            print(f"    [比赛] 增强 {match_id}...")
            
            # 获取增强数据
            enriched_data = enrich_match_data(match_id, player_id)
            
            if enriched_data:
                # 合并现有数据和新数据
                updated_match = {**match, **enriched_data}
                updated_matches.append(updated_match)
                stats['total_matches_enriched'] += 1
                print(f"    [比赛] ✅ {match_id} 已增强")
            else:
                # 保留原数据
                updated_matches.append(match)
                print(f"    [比赛] ⚠️ {match_id} 无法增强，保留原数据")
        
        # 更新 DynamoDB
        try:
            player['matchHistory'] = updated_matches
            players_table.put_item(Item=player)
            print(f"    [更新] ✅ {player_name} 数据已更新到 DynamoDB")
        except Exception as e:
            print(f"    [更新] ❌ {player_name} 更新失败: {str(e)}")
    
    # 输出统计
    stats['total_api_calls'] = call_count
    
    print(f"\n--- [完成] 数据增强完成！ ---")
    print(f"--- 总玩家数: {stats['total_players']} ---")
    print(f"--- 处理比赛数: {stats['total_matches_processed']} ---")
    print(f"--- 增强比赛数: {stats['total_matches_enriched']} ---")
    print(f"--- API 调用数: {stats['total_api_calls']} ---")

# ##################################################################
# ✅ 运行
# ##################################################################

if __name__ == "__main__":
    if "bd5be278" in RIOT_API_KEY:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("! 请先更新 RIOT_API_KEY 为你的有效 API 密钥！")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        main()
