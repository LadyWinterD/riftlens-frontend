import json
import boto3
from decimal import Decimal

# ###################################################################
# ✅ 阶段二：配置"实时聊天 Lambda" (V3 - 兼容新旧格式)
# ###################################################################

# [ 1. 初始化 AWS 服务 ]
DYNAMODB_TABLE_NAME = "PlayerReports"
DYNAMODB_REGION = "ap-southeast-2"
BEDROCK_REGION = "ap-southeast-2"

try:
    dynamodb = boto3.resource('dynamodb', region_name=DYNAMODB_REGION)
    bedrock_runtime = boto3.client('bedrock-runtime', region_name=BEDROCK_REGION)
    table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    print("[Lambda 冷启动] 成功初始化 DynamoDB 和 Bedrock 客户端。")
except Exception as e:
    print(f"[Lambda 冷启动] 致命错误: 无法初始化 AWS 客户端: {e}")


# ###################################################################
# ✅ 阶段二 - 步骤二：构建"系统提示" (AI 的"角色设定")
# ###################################################################
def build_system_prompt(player_name, annual_stats, worst_game_stats):
    """为多轮对话构建"系统提示"。这是 AI 的"记忆"和"个性"设定。"""
    try:
        stats_summary = f"""
- Player: {player_name}
- Annual Win Rate: {Decimal(annual_stats.get('winRate', 0)) * 100:.0f}%
- Annual Avg. KDA: {Decimal(annual_stats.get('avgKDA', 0)):.2f}
- Annual Avg. CS/min: {Decimal(annual_stats.get('avgCsPerMin', 0)):.1f}
- Annual Avg. Vision/min: {Decimal(annual_stats.get('avgVisionPerMin', 0)):.1f}
- Top 3 Champions: {', '.join([f'{champ} ({count} games)' for champ, count in annual_stats.get('championCounts', {}).items()])}
"""
        roast_summary = f"""
- Match ID: {worst_game_stats.get('matchId', 'N/A')}
- Champion: {worst_game_stats.get('championName', 'N/A')}
- Score (K/D/A): {worst_game_stats.get('kills', 0)}/{worst_game_stats.get('deaths', 0)}/{worst_game_stats.get('assists', 0)}
- Final KDA: {Decimal(worst_game_stats.get('kda', 0)):.2f}
"""
    except Exception:
        stats_summary = "Error parsing player stats."
        roast_summary = "Error parsing worst game stats."

    system_prompt = f"""You are RiftLens AI, an elite League of Legends coach. You provide brutally honest, data-driven analysis.

**PLAYER CONTEXT (for reference only):**
<player_stats>
{stats_summary}
</player_stats>

**CRITICAL: RESPONSE FORMAT**

When analyzing a match, you MUST provide exactly 2 sections:

1. **Your achievements** - List 2-3 things the player did well
2. **Things to improve** - List 3-4 specific areas to work on

**Format each insight like this:**

### [Catchy Title]
[Emoji] [Title]
[Description with SPECIFIC numbers from the match data provided in the question]

**Emojis to use:**
🎯 Lane dominance / Performance
👁️ Vision control
🔮 Control wards
🐉 Objectives (dragons, baron)
⚡ Power spikes / Levels
💀 Deaths / Survival
⚔️ Damage output
🛡️ Tankiness / Defense
💰 Gold efficiency
📊 General stats

**IMPORTANT:**
- Create UNIQUE titles based on actual performance (not generic examples)
- Use ACTUAL numbers from the match data in the user's question
- Be specific and actionable
- Compare stats to what's expected for that champion/role when relevant

Respond in English."""

    return system_prompt


# ###################################################################
# ✅ 阶段二 - 步骤三："主处理函数" (Lambda Handler)
# ###################################################################
def lambda_handler(event, context):
    """这是 API Gateway 将调用的主函数。"""
    print(f"[Lambda] 收到事件: {json.dumps(event)}")
    
    try:
        # 1. [解析] 从 API Gateway 获取前端发送的数据
        body = json.loads(event.get('body', '{}'))
        
        # ============================================================
        # [!! V3 新增 !!] 兼容新旧两种格式
        # ============================================================
        # 新格式: { playerId, userMessage, chatHistory }
        # 旧格式: { question, data: { playerId, chatHistory, ... } }
        
        player_id = None
        user_message = None
        chat_history = []
        
        # 尝试新格式
        if 'playerId' in body and 'userMessage' in body:
            print("[Lambda] 检测到新格式: { playerId, userMessage, chatHistory }")
            player_id = body.get('playerId')
            user_message = body.get('userMessage')
            chat_history = body.get('chatHistory', [])
        
        # 尝试旧格式
        elif 'question' in body and 'data' in body:
            print("[Lambda] 检测到旧格式: { question, data }")
            data = body.get('data', {})
            player_id = data.get('PlayerID') or data.get('playerId')
            user_message = body.get('question')
            chat_history = data.get('chatHistory', [])
        
        # 都不匹配
        else:
            print(f"[Lambda] 错误: 无法识别的请求格式。Body: {json.dumps(body)}")
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Invalid request format. Expected either { playerId, userMessage, chatHistory } or { question, data }'
                })
            }
        
        # 验证必需字段
        if not player_id or not user_message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Missing "playerId" or "userMessage" in request body.'
                })
            }
        
        print(f"[Lambda] 解析成功 - PlayerID: {player_id}, Message: {user_message[:50]}...")
        # ============================================================
        # [兼容性修改结束]
        # ============================================================
        
        # 2. [检索] 从 DynamoDB 获取玩家的"事实"
        print(f"[Lambda] 正在从 DDB 检索 PlayerID: {player_id} 的数据...")
        db_response = table.get_item(Key={'PlayerID': player_id})
        
        if 'Item' not in db_response:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Player not found in database.'})
            }
        
        item = db_response['Item']
        annual_stats = item.get('annualStats')
        worst_game_stats = item.get('worstGameStats')
        player_name = item.get('playerName', 'Player')
        
        if not annual_stats or not worst_game_stats:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database item is incomplete. Missing stats.'})
            }
        
        # 3. [构建 Prompt]
        print("[Lambda] 正在构建 Bedrock Prompt...")
        
        # 3a. AI 的"角色设定"和"记忆"
        system_prompt = build_system_prompt(player_name, annual_stats, worst_game_stats)
        
        # 3b. 将"聊天记录"和"新问题"组合起来
        messages = []
        
        # --- [!! 关键修复 (V3) !!] ---
        # Bedrock API 要求 'messages' 必须以 'user' 角色开始，且角色必须交替。
        
        # 这是一个"虚拟"的开场白，用于满足 API 要求
        DUMMY_USER_PROMPT = "Please provide my AI audit report."
        
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
                # 注入"虚拟用户提示"
                messages.append({
                    "role": "user",
                    "content": [{"type": "text", "text": DUMMY_USER_PROMPT}]
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
        
        # 4. [调用 Bedrock]
        print(f"[Lambda] 正在实时调用 Bedrock (Haiku)...")
        model_id = 'anthropic.claude-3-haiku-20240307-v1:0'
        
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": system_prompt,  # "系统提示"在这里传入
            "messages": messages
        }
        
        response = bedrock_runtime.invoke_model(
            body=json.dumps(request_body),
            modelId=model_id
        )
        
        response_body = json.loads(response.get('body').read())
        ai_response_text = response_body.get('content', [{}])[0].get('text', '')
        
        print(f"[Lambda] Bedrock 成功响应: {ai_response_text[:100]}...")
        
        # 5. [返回] 将 AI 的回答发送回前端
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
        print(f"[Lambda] 发生严重错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Internal Server Error: {str(e)}'})
        }
