import json
import boto3
from decimal import Decimal

# ###################################################################
# ✅ V21.0 - AI 数据增强 Lambda 配置
# ###################################################################

# [ 1. 初始化 AWS 服务 ]
DYNAMODB_PLAYERS_TABLE = "RiftLensPlayers"
DYNAMODB_STATIC_TABLE = "RiftLensStaticData"
DYNAMODB_REGION = "us-east-1"
BEDROCK_REGION = "ap-southeast-2"

try:
    dynamodb = boto3.resource('dynamodb', region_name=DYNAMODB_REGION)
    bedrock_runtime = boto3.client('bedrock-runtime', region_name=BEDROCK_REGION)
    players_table = dynamodb.Table(DYNAMODB_PLAYERS_TABLE)
    static_table = dynamodb.Table(DYNAMODB_STATIC_TABLE)
    print("[Lambda 冷启动] 成功初始化 DynamoDB 和 Bedrock 客户端。")
except Exception as e:
    print(f"[Lambda 冷启动] 致命错误: 无法初始化 AWS 客户端: {e}")

# 静态数据缓存
static_data_cache = {}

# ###################################################################
# ✅ 静态数据访问函数
# ###################################################################

def get_static_data(key):
    """
    从 DynamoDB 获取静态数据（带缓存）
    """
    global static_data_cache
    
    # 检查缓存
    if key in static_data_cache:
        return static_data_cache[key]
    
    try:
        response = static_table.get_item(Key={'DataKey': key})
        if 'Item' in response:
            data = json.loads(response['Item']['Data'])
            static_data_cache[key] = data
            return data
        else:
            print(f"[StaticData] 警告: 未找到 {key}")
            return None
    except Exception as e:
        print(f"[StaticData] 错误: 无法获取 {key}: {str(e)}")
        return None

def translate_champion_id(champion_name):
    """
    将英雄名称翻译为中文（如果有静态数据）
    """
    champions_data = get_static_data('DDRAGON_CHAMPIONS')
    if champions_data and 'data' in champions_data:
        for champ_key, champ_info in champions_data['data'].items():
            if champ_info.get('id') == champion_name or champ_info.get('name') == champion_name:
                return champ_info.get('name', champion_name)
    return champion_name

def translate_item_id(item_id):
    """
    将装备 ID 翻译为名称
    """
    if item_id == 0:
        return "空"
    
    items_data = get_static_data('DDRAGON_ITEMS')
    if items_data and 'data' in items_data:
        item_info = items_data['data'].get(str(item_id))
        if item_info:
            return item_info.get('name', f'Item {item_id}')
    return f'Item {item_id}'

def translate_summoner_spell(spell_id):
    """
    将召唤师技能 ID 翻译为名称
    """
    summoners_data = get_static_data('DDRAGON_SUMMONERS')
    if summoners_data and 'data' in summoners_data:
        for spell_key, spell_info in summoners_data['data'].items():
            if spell_info.get('key') == str(spell_id):
                return spell_info.get('name', f'Spell {spell_id}')
    return f'Spell {spell_id}'

# ###################################################################
# ✅ 构建增强的系统提示
# ###################################################################

def build_enhanced_system_prompt(player_name, player_puuid, match_data):
    """
    为 AI 构建包含完整 10 人比赛数据的系统提示
    """
    
    # 找到该玩家的数据
    player_data = None
    for p in match_data.get('participants', []):
        if p.get('puuid') == player_puuid:
            player_data = p
            break
    
    if not player_data:
        return "Error: Player not found in match data."
    
    # 构建玩家数据摘要
    player_summary = f"""
**玩家信息:**
- 召唤师名: {player_data.get('summonerName', player_name)}
- 英雄: {translate_champion_id(player_data.get('championName', 'Unknown'))}
- 位置: {player_data.get('individualPosition', 'Unknown')}
- 等级: {player_data.get('champLevel', 0)}
- 结果: {'胜利' if player_data.get('win') else '失败'}

**KDA:**
- K/D/A: {player_data.get('kills', 0)}/{player_data.get('deaths', 0)}/{player_data.get('assists', 0)}
- 击杀参与率: {player_data.get('killParticipation', 0) * 100:.0f}%

**经济:**
- 金币: {player_data.get('goldEarned', 0):,}
- 补刀: {player_data.get('totalMinionsKilled', 0)} (CS/min: {player_data.get('csPerMin', 0):.1f})
- 野怪: {player_data.get('neutralMinionsKilled', 0)}

**视野:**
- 视野得分: {player_data.get('visionScore', 0)} (Vision/min: {player_data.get('visionPerMin', 0):.2f})
- 插眼: {player_data.get('wardsPlaced', 0)}
- 排眼: {player_data.get('wardsKilled', 0)}

**伤害:**
- 总伤害: {player_data.get('totalDamageDealtToChampions', 0):,}
- 物理伤害: {player_data.get('physicalDamageDealtToChampions', 0):,}
- 魔法伤害: {player_data.get('magicDamageDealtToChampions', 0):,}
- 承受伤害: {player_data.get('totalDamageTaken', 0):,}
- 伤害减免: {player_data.get('damageSelfMitigated', 0):,}

**装备:**
- {', '.join([translate_item_id(player_data.get(f'item{i}', 0)) for i in range(7) if player_data.get(f'item{i}', 0) != 0])}

**召唤师技能:**
- {translate_summoner_spell(player_data.get('summoner1Id', 0))}, {translate_summoner_spell(player_data.get('summoner2Id', 0))}

**团队贡献:**
- 推塔: {player_data.get('turretKills', 0)}
- 抢龙: {player_data.get('objectivesStolen', 0)}
"""
    
    # 找到对线对手（相同位置，不同队伍）
    opponent_data = None
    player_position = player_data.get('individualPosition')
    player_team = player_data.get('teamId')
    
    for p in match_data.get('participants', []):
        if (p.get('individualPosition') == player_position and 
            p.get('teamId') != player_team):
            opponent_data = p
            break
    
    opponent_summary = ""
    if opponent_data:
        opponent_summary = f"""
**对线对手数据:**
- 召唤师名: {opponent_data.get('summonerName', 'Unknown')}
- 英雄: {translate_champion_id(opponent_data.get('championName', 'Unknown'))}
- K/D/A: {opponent_data.get('kills', 0)}/{opponent_data.get('deaths', 0)}/{opponent_data.get('assists', 0)}
- 补刀: {opponent_data.get('totalMinionsKilled', 0)} (CS/min: {opponent_data.get('csPerMin', 0):.1f})
- 伤害: {opponent_data.get('totalDamageDealtToChampions', 0):,}
- 视野得分: {opponent_data.get('visionScore', 0)}
- 金币: {opponent_data.get('goldEarned', 0):,}

**对线差距分析:**
- CS 差距: {player_data.get('totalMinionsKilled', 0) - opponent_data.get('totalMinionsKilled', 0):+d}
- 伤害差距: {player_data.get('totalDamageDealtToChampions', 0) - opponent_data.get('totalDamageDealtToChampions', 0):+,}
- 视野差距: {player_data.get('visionScore', 0) - opponent_data.get('visionScore', 0):+d}
- 金币差距: {player_data.get('goldEarned', 0) - opponent_data.get('goldEarned', 0):+,}
"""
    
    # 构建完整的系统提示
    system_prompt = f"""You are RiftLens AI, an elite League of Legends coach and data analyst. You provide brutally honest, data-driven analysis.

You are analyzing a specific match for the player. Below is the complete data for this match.

<match_data>
<match_info>
- Match ID: {match_data.get('matchId', 'Unknown')}
- Game Duration: {match_data.get('gameDuration', 0) // 60} minutes {match_data.get('gameDuration', 0) % 60} seconds
- Game Mode: {match_data.get('gameMode', 'Unknown')}
</match_info>

<player_performance>
{player_summary}
</player_performance>

<lane_matchup>
{opponent_summary if opponent_summary else "对线对手数据不可用"}
</lane_matchup>

<all_participants>
Below are all 10 players in this match for context:
{json.dumps([{
    'summonerName': p.get('summonerName'),
    'championName': p.get('championName'),
    'position': p.get('individualPosition'),
    'teamId': p.get('teamId'),
    'kda': f"{p.get('kills')}/{p.get('deaths')}/{p.get('assists')}",
    'cs': p.get('totalMinionsKilled'),
    'damage': p.get('totalDamageDealtToChampions'),
    'gold': p.get('goldEarned')
} for p in match_data.get('participants', [])], indent=2, ensure_ascii=False)}
</all_participants>
</match_data>

**RESPONSE FORMAT (CRITICAL):**
You MUST format your response using this structure:

### [Catchy Title]
[Emoji] [Title]
[Detailed description with ACTUAL numbers from THIS match data]

**Format Rules:**
1. Start each insight with ### followed by a catchy title
2. Use relevant emojis: 🎯 (lane dominance), 👁️ (vision), 🔮 (control wards), 🐉 (objectives), ⚡ (levels/power), 💀 (deaths), ⚔️ (damage), 🛡️ (tankiness), 💰 (gold), 📊 (stats)
3. Create unique, memorable titles based on the player's actual performance
4. Include SPECIFIC numbers from the match data above (not generic examples)
5. Be direct and actionable
6. Provide 2-3 achievements (things done well) and 3-4 improvements (areas to work on)
7. Compare to lane opponent when relevant

**Your task:**
1. Analyze the player's performance based on the data above
2. Compare them to their lane opponent (if available)
3. Identify 2-3 achievements (things they did well)
4. Identify 3-4 areas to improve (with specific data)
5. Be honest and direct - use the data to support your analysis

Respond in English using the format above."""

    return system_prompt

# ###################################################################
# ✅ Lambda Handler
# ###################################################################

def lambda_handler(event, context):
    """
    增强版 Lambda Handler - 支持完整的 10 人比赛数据分析
    """
    print(f"[Lambda] 收到事件: {json.dumps(event)}")
    
    try:
        # 解析请求
        body = json.loads(event.get('body', '{}'))
        
        player_id = body.get('playerId')
        user_message = body.get('userMessage')
        match_id = body.get('matchId')  # 新增: 指定要分析的比赛
        chat_history = body.get('chatHistory', [])
        
        if not player_id or not user_message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Missing "playerId" or "userMessage" in request body.'
                })
            }
        
        print(f"[Lambda] PlayerID: {player_id}, MatchID: {match_id}")
        
        # 从 DynamoDB 获取玩家数据
        db_response = players_table.get_item(Key={'PlayerID': player_id})
        
        if 'Item' not in db_response:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Player not found in database.'})
            }
        
        item = db_response['Item']
        match_history = item.get('matchHistory', [])
        
        # 选择要分析的比赛
        match_data = None
        if match_id:
            # 查找指定的比赛
            for match in match_history:
                if match.get('matchId') == match_id:
                    match_data = match
                    break
        else:
            # 使用最近的比赛
            if match_history:
                match_data = match_history[0]
        
        if not match_data:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No match data found for analysis.'})
            }
        
        # 构建增强的系统提示
        system_prompt = build_enhanced_system_prompt(
            player_name=item.get('playerName', 'Player'),
            player_puuid=player_id,
            match_data=match_data
        )
        
        # 构建消息历史
        messages = []
        
        # --- [!! 修复角色交替问题 !!] ---
        # Bedrock API 要求角色必须在 user 和 assistant 之间交替
        
        # 检查 chatHistory 是否为空
        if not chat_history:
            # 如果没有历史记录，直接使用新问题
            messages.append({
                "role": "user",
                "content": [{"type": "text", "text": user_message}]
            })
        else:
            # 如果有历史记录，检查第一条是否是 assistant
            if chat_history[0].get('role') == 'assistant':
                # 注入虚拟用户提示
                messages.append({
                    "role": "user",
                    "content": [{"type": "text", "text": "Please analyze my match performance."}]
                })
            
            # 附加真实的聊天记录，确保角色交替
            last_role = None
            for turn in chat_history:
                current_role = turn.get('role')
                content = turn.get('content')
                
                # 只添加有效的消息，且确保角色交替
                if current_role in ['user', 'assistant'] and content:
                    # 跳过连续相同角色的消息
                    if current_role != last_role:
                        messages.append({
                            "role": current_role,
                            "content": [{"type": "text", "text": content}]
                        })
                        last_role = current_role
            
            # 添加新问题，确保不与最后一条消息角色相同
            if last_role != 'user':
                messages.append({
                    "role": "user",
                    "content": [{"type": "text", "text": user_message}]
                })
            else:
                # 如果最后一条是 user，先添加一个简短的 assistant 响应
                messages.append({
                    "role": "assistant",
                    "content": [{"type": "text", "text": "I understand. Please continue."}]
                })
                messages.append({
                    "role": "user",
                    "content": [{"type": "text", "text": user_message}]
                })
        # --- [修复结束] ---
        
        # 调用 Bedrock
        print(f"[Lambda] 正在调用 Bedrock...")
        model_id = 'anthropic.claude-3-haiku-20240307-v1:0'
        
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "system": system_prompt,
            "messages": messages
        }
        
        response = bedrock_runtime.invoke_model(
            body=json.dumps(request_body),
            modelId=model_id
        )
        
        response_body = json.loads(response.get('body').read())
        ai_response_text = response_body.get('content', [{}])[0].get('text', '')
        
        print(f"[Lambda] Bedrock 响应成功")
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({'aiResponse': ai_response_text})
        }
    
    except Exception as e:
        print(f"[Lambda] 错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Internal Server Error: {str(e)}'})
        }
