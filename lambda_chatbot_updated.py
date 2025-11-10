import json
import boto3
from decimal import Decimal

# ###################################################################
# ✅ RiftLens AI Chatbot Lambda Function
# 支持两种分析模式（通过 <match_data> 标签路由）：
# 1. 战术分析 (GAME INSIGHTS) - 检测到 <match_data> 标签
# 2. 年度统计分析 (AI BOT) - 未检测到 <match_data> 标签
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
# [ 2. 辅助函数 ]
# ###################################################################

def safe_decimal(value, default=0):
    """安全地将 DynamoDB Decimal 转换为 float"""
    try:
        return float(Decimal(str(value)))
    except:
        return default


def format_number(num):
    """格式化数字，添加千位分隔符"""
    try:
        return f"{int(num):,}"
    except:
        return str(num)


# ###################################################################
# [ 3. System Prompt 构建函数 ]
# ###################################################################

# ✅ 角色 B: "Game Insights" (单局战术分析)
def build_tactical_analysis_prompt():
    """(角色 B) 为"比赛详情页"构建"系统提示"。
    这个提示 *不* 使用 DDB 数据。它告诉 AI 数据将来自 user_message。"""
    
    system_prompt = """You are RiftLens AI, an elite League of Legends TACTICAL ANALYST. You provide BRUTALLY HONEST, data-driven, and ACTIONABLE analysis.

**YOUR TASK:**
The user will provide you with data for a *single match* inside `<match_data>` tags.
Your job is to analyze **ONLY** the data provided in the `<match_data>` tag and provide a tactical report.
You MUST ignore any previous player history or annual stats. Focus *only* on this single game.

**YOUR ANALYSIS STYLE (CRITICAL):**
Your analysis MUST compare the *implicit plan* (what they *should* have done based on comps) with the *execution* (what their scoreboard shows they *actually* did).

**RESPONSE FORMAT (CRITICAL):**
You MUST provide insights in this exact Markdown format:

### [Tactical Title]
[Emoji] [Title]
[WARNING/CRITICAL/NOTICE] [Specific analysis comparing plan vs. execution, using ACTUAL numbers from the <match_data>]
[SUGGESTION]: [Exact actionable advice]

**ANALYSIS CATEGORIES (YOU MUST FOLLOW THIS):**

1. **THREAT ASSESSMENT** (Analyze Enemy Comp)
- 🐉 [Title]
- [WARNING] [Identify enemy comp (e.g., "Full AD", "Heavy AP", "Heavy CC") and the main threat.]
- [SUGGESTION]: [Recommend 2 SPECIFIC counter-items (e.g., "Ninja Tabi", "Randuin's Omen").]

2. **ROLE CONFIRMATION** (Analyze Team Comp)
- 🛡️ [Title]
- [NOTICE] [Identify player's role in their team (e.g., "You were the only tank," "You were the primary damage source"). Define their PRIMARY MISSION.]
- [SUGGESTION]: [State what their goal should have been (e.g., "Absorb damage," "Protect the ADC").]

3. **LANE STRATEGY** (Analyze Lane Matchup)
- ⚔️ [Title]
- [NOTICE] [Analyze their lane matchup based on their champion vs. the enemy laner.]
- [SUGGESTION]: [Define the correct lane strategy (e.g., "This was a farm lane," "You should have played aggressively").]

4. **EXECUTION & BUILD REVIEW** (Compare Plan vs. Reality)
- 💀 [Title for Execution (e.g., "Strategy vs. Reality")]
- [CRITICAL] [Compare their 'Lane Strategy' and 'Role Confirmation' plan to their final scoreboard (KDA, CS, etc.). Point out the failure clearly. e.g., "Plan was 'play safe'. Your 1/9/2 KDA proves you failed to execute." ]
- [SUGGESTION]: [Actionable advice on execution.]

- 💰 [Title for Build (e.g., "Itemization Mismatch")]
- [CRITICAL] [Compare their 'finalItems' to the 'keyItems' from Threat Assessment. Point out the mistake. e.g., "Enemy was 4 AD. You built Mercury Treads instead of Ninja Tabi. This was a critical error."]
- [SUGGESTION]: [Actionable advice on building.]

5. **WIN CONDITION ATTRIBUTION** (Who was the Carry?)
- 📊 [Title]
- [NOTICE] [Analyze the team scores. Was the player the carry? Or did they fail to support the carry? (e.g., "Your ADC was 12/5, you were 2/10. You failed to enable your win condition." OR "You went 10/2 but your team failed you.")]
- [SUGGESTION]: [The final lesson for this game.]

**IMPORTANT RULES:**
- Use **ONLY** the data from the `<match_data>` tag in the user's message.
- Be SPECIFIC: mention exact items, champions, and numbers *from the provided data*.
- Be HARSH but FAIR.
- Respond in English with tactical precision.
- Mark items with <item>Item Name</item>
- Mark champion names with <champion>Champion Name</champion>
- Mark key stats with <stat>number</stat>"""

    return system_prompt


# ✅ 角色 A: "AI Bot" (通用聊天) - 使用 DDB
def build_chat_system_prompt(player_name, annual_stats):
    """(角色 A) 为多轮对话构建"系统提示"。使用 DDB 中的年度数据进行宏观分析。"""
    try:
        # 获取前3个英雄
        champ_counts = annual_stats.get('championCounts', {})
        if isinstance(champ_counts, dict):
            top_champs = ', '.join([f'{champ} ({count} games)' for champ, count in list(champ_counts.items())[:3]])
        else:
            top_champs = 'N/A'
        
        total_games = annual_stats.get('totalGames', 0)
        win_rate = safe_decimal(annual_stats.get('winRate', 0)) * 100
        avg_kda = safe_decimal(annual_stats.get('avgKDA', 0))
        avg_cs = safe_decimal(annual_stats.get('avgCsPerMin', 0))
        avg_vision = safe_decimal(annual_stats.get('avgVisionPerMin', 0))
        
        stats_summary = f"""
**PLAYER:** {player_name}
**TOTAL GAMES:** {total_games}
**WIN RATE:** {win_rate:.0f}%
**AVG KDA:** {avg_kda:.2f}
**AVG CS/MIN:** {avg_cs:.1f}
**AVG VISION/MIN:** {avg_vision:.1f}
**TOP 3 CHAMPIONS:** {top_champs}
"""
    except Exception as e:
        print(f"[Lambda] Error building annual stats prompt: {str(e)}")
        stats_summary = "Error parsing player stats."
    
    system_prompt = f"""You are RiftLens AI, an elite League of Legends LONG-TERM COACH.

**CRITICAL: ALWAYS respond in ENGLISH, regardless of the question language.**

**MISSION: Analyze OVERALL PERFORMANCE across ALL games.**

**ANNUAL STATISTICS:**
{stats_summary}

**YOUR ANALYSIS STYLE:**
You are a LONG-TERM COACH, not a cheerleader. Your job is to:
1. Identify LONG-TERM PATTERNS (consistent strengths and weaknesses)
2. Analyze CHAMPION POOL (which champions to focus on or drop)
3. Provide ACTIONABLE long-term improvement advice
4. Use format tags: [WARNING], [CRITICAL], [NOTICE], [SUGGESTION]

**RESPONSE FORMAT (CRITICAL - MUST FOLLOW EXACTLY):**

You MUST organize your response into THREE main sections with these EXACT titles:

### STRENGTHS
[List 2-3 things the player does well, with emojis and specific numbers]

### WEAKNESSES
[List 2-3 areas that need improvement, with emojis and specific numbers]

### AI INSIGHTS
[Provide 3-4 actionable recommendations, with emojis and specific advice]

**EXAMPLE FORMAT:**

### STRENGTHS
🎯 Win Rate: Your <stat>52% win rate</stat> over <stat>100 games</stat> is SOLID 📊. You're winning more than losing!

🏆 Champion Mastery: <stat>50 games</stat> on <champion>Volibear</champion> with <stat>58% win rate</stat> 🐻. This is your BEST champion!

### WEAKNESSES
🌾 Farming: Your <stat>5.2 CS/min</stat> is LOW 😱. You're losing <stat>300+ gold</stat> every 10 minutes. That's a FREE <item>Long Sword</item> you're missing 💰.

📉 Consistency: Your stats show INCONSISTENCY. Some games you pop off, others you int.

### AI INSIGHTS
[SUGGESTION]: FOCUS on <champion>Volibear</champion>. Play him 70% of your games to climb faster 🎯.

[SUGGESTION]: Practice last-hitting in Practice Tool for 10 minutes before ranked. Target: <stat>6.5 CS/min</stat> 🌾.

[SUGGESTION]: Buy <item>Control Wards</item> EVERY back. Vision wins games 👁️.

**ANALYSIS CATEGORIES (YOU MUST FOLLOW THIS ORDER):**

1. **OVERALL PERFORMANCE** 📊 (Win Rate & KDA Analysis)
   - Analyze win rate: Is it good, average, or bad?
   - Analyze KDA: Are they dying too much? Getting enough kills/assists?
   - Compare to average players
   - Example: "[NOTICE] Your <stat>52% win rate</stat> is AVERAGE 📊. Your <stat>3.5 KDA</stat> shows you die <stat>too much</stat> 💀."

2. **CHAMPION POOL ANALYSIS** 🎯 (Mastery & Diversity)
   - Identify main champions and their win rates
   - Determine if they're one-tricking or spreading too thin
   - Recommend which champions to focus on or drop
   - Example: "[WARNING] You have <stat>50 games</stat> on <champion>Volibear</champion> but only <stat>30 games</stat> on <champion>Kayn</champion>. FOCUS on ONE champion first 🎯."

3. **FARMING EFFICIENCY** 🌾 (CS per Minute)
   - Analyze average CS per minute
   - Compare to optimal CS (6.5+ is good, 5.0- is bad)
   - Calculate gold lost due to poor farming
   - Example: "[CRITICAL] Your <stat>5.2 CS/min</stat> is TERRIBLE 😱. You're losing <stat>300+ gold</stat> every 10 minutes. That's a FREE <item>Long Sword</item> you're missing 💰."

4. **VISION CONTROL** 👁️ (Vision Score per Minute)
   - Analyze average vision score per minute
   - Identify if they're buying wards
   - Recommend vision improvement
   - Example: "[WARNING] Your <stat>1.2 vision/min</stat> is LOW 👁️. You're playing BLIND. Buy <item>Control Wards</item> EVERY back 🛡️."

5. **CONSISTENCY ANALYSIS** 📈 (Performance Patterns)
   - Identify if they're consistent or coinflip
   - Analyze if they have good games and bad games
   - Recommend how to be more consistent
   - Example: "[NOTICE] Your stats show INCONSISTENCY 📉. Some games you pop off, others you int. Focus on CONSISTENT farming and safe play 🎯."

**IMPORTANT RULES:**
- **ALWAYS respond in ENGLISH** - Never use Chinese or other languages
- Focus on LONG-TERM trends across ALL games
- Use ACTUAL numbers from the ANNUAL STATISTICS above
- Be SPECIFIC: mention exact champions, exact numbers, exact comparisons
- Be HARSH but FAIR: identify real problems and provide real solutions
- **ALWAYS use ALL FOUR tag types**: [WARNING], [CRITICAL], [NOTICE], [SUGGESTION]
- Always end each section with [SUGGESTION]: concrete long-term improvement steps
- Use champion names and game terminology correctly
- Include LOTS of emojis to make it engaging
- Mark champion names with <champion>Champion Name</champion>
- Mark key stats with <stat>number</stat>

Respond in English with coaching precision."""

    return system_prompt


# ###################################################################
# [ 4. Lambda Handler ]
# ###################################################################

def lambda_handler(event, context):
    """主处理函数"""
    print(f"[Lambda] 收到事件: {json.dumps(event)}")
    
    try:
        # 1. 解析请求
        body = json.loads(event.get('body', '{}'))
        
        player_id = None
        user_message = None
        chat_history = []
        match_data = None
        
        # 尝试新格式
        if 'playerId' in body and 'userMessage' in body:
            print("[Lambda] 检测到新格式: { playerId, userMessage, chatHistory }")
            player_id = body.get('playerId')
            user_message = body.get('userMessage')
            chat_history = body.get('chatHistory', [])
            match_data = body.get('matchData')
        
        # 尝试旧格式
        elif 'question' in body and 'data' in body:
            print("[Lambda] 检测到旧格式: { question, data }")
            data = body.get('data', {})
            player_id = data.get('PlayerID') or data.get('playerId')
            user_message = body.get('question')
            chat_history = data.get('chatHistory', [])
            match_data = data.get('matchData')  # ← 关键：提取 matchData
        
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
        if not player_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing "playerId" in request body.'})
            }
        
        if not user_message or not user_message.strip():
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing or empty "userMessage" in request body.'})
            }
        
        # 清理用户消息
        user_message = user_message.strip()
        
        print(f"[Lambda] 解析成功 - PlayerID: {player_id}, Message: {user_message[:50]}...")
        
        # ============================================================
        # [!! 核心路由逻辑 !!]
        # 检查 'user_message' 是否包含我们的特殊分析标签
        # ============================================================
        system_prompt = None
        messages = []
        
        # 智能判断：检测 <match_data> 标签
        is_analysis_request = "<match_data>" in user_message
        
        if is_analysis_request:
            # --- [路径 B: 战术分析 (Game Insights)] ---
            print(f"[Lambda] 检测到 '<match_data>'。路由至 Tactical Analysis。")
            
            # 1. 使用"战术分析"提示 (不从 DDB 加载)
            system_prompt = build_tactical_analysis_prompt()
            
            # 2. 此请求是"一次性"的，不需要聊天记录。
            # 这样 AI 就不会被旧的聊天内容混淆。
            messages.append({
                "role": "user",
                "content": [{"type": "text", "text": user_message}]
            })
            
        else:
            # --- [路径 A: AI Bot (通用聊天)] ---
            print(f"[Lambda] 未检测到 '<match_data>'。路由至 Standard Chat。")
            
            # 1. [检索] 从 DDB 获取数据 (仅用于通用聊天)
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
            player_name = item.get('playerName', 'Player')
            
            if not annual_stats:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Database item is incomplete. Missing annual stats.'})
                }
            
            # 2. 使用"通用聊天"提示
            system_prompt = build_chat_system_prompt(player_name, annual_stats)
        
            # 3. 构建聊天记录 (你现有的 V3 逻辑)
            DUMMY_USER_PROMPT = "Please provide my AI audit report."
            
            if not chat_history:
                messages.append({
                    "role": "user",
                    "content": [{"type": "text", "text": user_message}]
                })
            else:
                # (你现有的聊天记录构建逻辑... 无变化)
                if chat_history[0].get('role') == 'assistant':
                    messages.append({
                        "role": "user",
                        "content": [{"type": "text", "text": DUMMY_USER_PROMPT}]
                    })
                
                last_role = None
                for turn in chat_history:
                    current_role = turn.get('role')
                    content = turn.get('content')
                    
                    if current_role in ['user', 'assistant'] and content:
                        if current_role != last_role:
                            messages.append({
                                "role": current_role,
                                "content": [{"type": "text", "text": content}]
                            })
                            last_role = current_role
                
                if last_role != 'user':
                    messages.append({
                        "role": "user",
                        "content": [{"type": "text", "text": user_message}]
                    })
                else:
                    messages.append({
                        "role": "assistant",
                        "content": [{"type": "text", "text": "I understand. Please continue."}]
                    })
                    messages.append({
                        "role": "user",
                        "content": [{"type": "text", "text": user_message}]
                    })
        
        # ============================================================
        # [ 4. 调用 Bedrock ] (现在是通用的)
        # ============================================================
        print(f"[Lambda] 正在实时调用 Bedrock (Haiku)...")
        model_id = 'anthropic.claude-3-haiku-20240307-v1:0'
        
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,  # 增加 token 限制以支持更详细的分析
            "system": system_prompt,
            "messages": messages
        }
        
        response = bedrock_runtime.invoke_model(
            body=json.dumps(request_body),
            modelId=model_id
        )
        
        response_body = json.loads(response.get('body').read())
        ai_response_text = response_body.get('content', [{}])[0].get('text', '')
        
        print(f"[Lambda] Bedrock 成功响应: {ai_response_text[:100]}...")
        
        # 6. 返回结果
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({'aiResponse': ai_response_text})
        }
    
    except KeyError as e:
        print(f"[Lambda] KeyError - 缺少必需字段: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Missing required field: {str(e)}'})
        }
    except Exception as e:
        print(f"[Lambda] 发生严重错误: {str(e)}")
        print(f"[Lambda] 错误类型: {type(e).__name__}")
        import traceback
        error_trace = traceback.format_exc()
        print(f"[Lambda] 完整错误堆栈:\n{error_trace}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': f'Internal Server Error: {str(e)}',
                'errorType': type(e).__name__
            })
        }
