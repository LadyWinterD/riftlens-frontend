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
# 安全地转换 Decimal 类型
def safe_decimal(value, default=0):
    """安全地将 DynamoDB Decimal 转换为 float"""
    try:
        return float(Decimal(str(value)))
    except:
        return default

def build_match_analysis_prompt(match_data, player_name):
    """为单场比赛分析构建 system prompt"""
    try:
        # 提取比赛数据
        champion = match_data.get('championName', 'Unknown')
        win = match_data.get('win', False)
        kills = match_data.get('kills', 0)
        deaths = match_data.get('deaths', 0)
        assists = match_data.get('assists', 0)
        cs = match_data.get('cs', 0) or match_data.get('totalMinionsKilled', 0)
        game_duration = match_data.get('gameDurationInSec', 0) or match_data.get('gameDuration', 0)
        cs_per_min = (cs / (game_duration / 60)) if game_duration > 0 else 0
        
        # 装备
        items = []
        for i in range(7):
            item_id = match_data.get(f'item{i}', 0)
            if item_id and item_id > 0:
                items.append(str(item_id))
        items_str = ', '.join(items) if items else 'No items recorded'
        
        # 伤害和金钱
        damage_dealt = match_data.get('totalDamageDealtToChampions', 0) or match_data.get('damage', 0)
        damage_taken = match_data.get('totalDamageTaken', 0)
        gold_earned = match_data.get('goldEarned', 0)
        vision_score = match_data.get('visionScore', 0)
        
        # 队伍分析
        participants = match_data.get('participants', [])
        player_team_id = match_data.get('teamId', 100)
        
        your_team = []
        enemy_team = []
        
        if participants and len(participants) == 10:
            for p in participants:
                champ_name = p.get('championName', 'Unknown')
                if p.get('teamId') == player_team_id:
                    your_team.append(champ_name)
                else:
                    enemy_team.append(champ_name)
        
        your_team_str = ', '.join(your_team) if your_team else 'Team data not available'
        enemy_team_str = ', '.join(enemy_team) if enemy_team else 'Enemy data not available'
        
        match_summary = f"""
<match_data>
**PLAYER:** {player_name}
**CHAMPION:** {champion}
**RESULT:** {'VICTORY ✅' if win else 'DEFEAT ❌'}
**KDA:** {kills}/{deaths}/{assists} (Ratio: {((kills + assists) / deaths if deaths > 0 else kills + assists):.2f})
**CS:** {cs} ({cs_per_min:.1f}/min)
**DAMAGE DEALT:** {damage_dealt:,}
**DAMAGE TAKEN:** {damage_taken:,}
**GOLD EARNED:** {gold_earned:,}
**VISION SCORE:** {vision_score}
**GAME DURATION:** {game_duration // 60}:{game_duration % 60:02d}
**ITEMS:** {items_str}

**YOUR TEAM:** {your_team_str}
**ENEMY TEAM:** {enemy_team_str}
</match_data>
"""
    except Exception as e:
        print(f"[Lambda] Error building match analysis prompt: {str(e)}")
        match_summary = "<match_data>Error parsing match data.</match_data>"
    
    system_prompt = f"""You are RiftLens AI, an elite League of Legends TACTICAL ANALYST.

**CRITICAL: ALWAYS respond in ENGLISH, regardless of the question language.**

**MISSION: Analyze THIS SPECIFIC MATCH, not overall performance.**

**YOUR TASK:**
The user will provide you with data for a *single match* inside `<match_data>` tags.
Your job is to analyze **ONLY** the data provided in the `<match_data>` tag and provide a tactical report.
You MUST ignore any previous player history or annual stats. Focus *only* on this single game.

**YOUR ANALYSIS STYLE (CRITICAL):**
Your analysis MUST compare the *implicit plan* (what they *should* have done based on comps) with the *execution* (what their scoreboard shows they *actually* did).

Format:
### [Tactical Title]
[Emoji] [Title]
[WARNING/CRITICAL/NOTICE] [Specific analysis comparing plan vs. execution, using ACTUAL numbers from the <match_data>]
[SUGGESTION]: [Exact actionable advice]

{match_summary}

**ANALYSIS CATEGORIES (YOU MUST FOLLOW THIS ORDER):**

1. **THREAT ASSESSMENT** 🛡️ (Enemy Composition Analysis)
   - Analyze enemy team composition (Full AD? Full AP? Heavy CC?)
   - Recommend SPECIFIC counter-items
   - Example: "[WARNING] Enemy has <stat>4 AD</stat> champions 🔥. You MUST build <item>Ninja Tabi</item> + <item>Randuin's Omen</item>."

2. **ROLE CONFIRMATION** 🎯 (Team Composition Analysis)
   - Analyze your team composition
   - Define YOUR PRIMARY MISSION based on team needs
   - Example: "[NOTICE] Your team has NO frontline 😱. YOU are the tank 🛡️. Your job is ABSORB DAMAGE, not chase kills 💀."

3. **LANE STRATEGY** ⚔️ (Matchup Analysis)
   - Analyze your champion vs enemy champions
   - Was it favorable or unfavorable matchup?
   - Example: "You (<champion>Jax</champion>) vs <champion>Teemo</champion>. This is UNFAVORABLE 😢. Strategy: SURVIVE and FARM. Don't fight."

4. **EXECUTION REVIEW** 📊 (Strategy vs Reality)
   - Compare PLAN (what you should have done) vs REALITY (what the scoreboard shows)
   - Did you follow the strategy?
   - Example: "[CRITICAL] Your <stat>9 deaths</stat> 💀 show you did NOT follow 'play safe' strategy. You kept fighting when you should have farmed 🌾."

5. **BUILD ANALYSIS** 🎒 (Item Choices)
   - Compare actual build vs optimal build for the situation
   - Point out CRITICAL mistakes
   - Example: "[CRITICAL] You built <item>Mercury Treads</item> against <stat>5 AD</stat> champions ⚔️. This is a MAJOR mistake ❌. You needed <item>Ninja Tabi</item>."

6. **TEAM ROLE PERFORMANCE** 🏆 (Role Fulfillment)
   - Did you fulfill your team role?
   - Compare your damage/tanking stats with team needs
   - Example: "You were the ONLY tank but built full damage 💥. Your damage taken (<stat>{damage_taken:,}</stat>) is TOO LOW for a tank. Your ADC died because you didn't protect them 😢."

7. **WIN CONDITION ANALYSIS** 🎯 (Who Was Supposed to Carry?)
   - Identify if player was the win condition or support role
   - Determine if loss was their fault
   - Example: "[NOTICE] Your <champion>ADC</champion> went <stat>12/5/8</stat> 🔥. They were the win condition ⭐. Your <stat>2/10/3</stat> means you failed to protect them 😢."

**IMPORTANT RULES:**
- **ALWAYS respond in ENGLISH** - Never use Chinese or other languages
- Use ACTUAL numbers from the <match_data> above
- Be SPECIFIC: mention exact items, exact strategies, exact numbers
- Be HARSH but FAIR: if they played well, say so; if they messed up, explain exactly how
- **ALWAYS use ALL FOUR tag types**: [WARNING], [CRITICAL], [NOTICE], [SUGGESTION]
- Always end each section with [SUGGESTION]: concrete next steps
- Use champion names, item names, and game terminology correctly
- Include LOTS of emojis to make it engaging
- Mark items with <item>Item Name</item>
- Mark champion names with <champion>Champion Name</champion>
- Mark key stats with <stat>number</stat>

Respond in English with tactical precision."""

    return system_prompt


def build_annual_stats_prompt(player_name, annual_stats):
    """为年度统计分析构建 system prompt"""
    try:
        # 获取前3个英雄
        champ_counts = annual_stats.get('championCounts', {})
        if isinstance(champ_counts, dict):
            top_champs = ', '.join([f'{champ} ({count} games)' for champ, count in list(champ_counts.items())[:3]])
        else:
            top_champs = 'N/A'
        
        stats_summary = f"""
**PLAYER:** {player_name}
**TOTAL GAMES:** {annual_stats.get('totalGames', 0)}
**WIN RATE:** {safe_decimal(annual_stats.get('winRate', 0)) * 100:.0f}%
**AVG KDA:** {safe_decimal(annual_stats.get('avgKDA', 0)):.2f}
**AVG CS/MIN:** {safe_decimal(annual_stats.get('avgCsPerMin', 0)):.1f}
**AVG VISION/MIN:** {safe_decimal(annual_stats.get('avgVisionPerMin', 0)):.1f}
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

**RESPONSE FORMAT:**

Structure your response as:

### [Category Title]
[Emoji] [Specific Finding]
[WARNING/CRITICAL/NOTICE/SUGGESTION] [Analysis based on annual stats with ACTUAL numbers]
[SUGGESTION]: [Long-term improvement advice]

Example:
### 📊 OVERALL PERFORMANCE ANALYSIS
🎯 Win Rate Assessment
[NOTICE] Your <stat>52% win rate</stat> over <stat>100 games</stat> is AVERAGE 📊. You're winning slightly more than losing, but there's HUGE room for improvement.

### 🏆 CHAMPION MASTERY
⚔️ One-Trick Potential
[WARNING] You have <stat>50 games</stat> on <champion>Volibear</champion> with <stat>58% win rate</stat> 🐻. This is your BEST champion. But you're spreading yourself too thin with <stat>30 games</stat> on <champion>Kayn</champion> at only <stat>45% win rate</stat> 💀.
[SUGGESTION]: FOCUS on <champion>Volibear</champion>. Play him 70% of your games. Drop <champion>Kayn</champion> until you master Volibear first.

### [Tactical Title]
[Emoji] [Title]
[WARNING/CRITICAL/NOTICE] [Specific analysis with ACTUAL numbers and comparisons]
[SUGGESTION]: [Exact actionable advice]

**VISUAL ENHANCEMENT RULES:**
- Use LOTS of emojis: 🛡️ (defense), ⚔️ (attack), 💀 (deaths), 🎯 (accuracy), 📊 (stats), 💰 (gold), 👁️ (vision), 🔥 (damage), ❄️ (CC), ⚡ (speed)
- Mark important items with <item>Item Name</item>
- Mark champion names with <champion>Champion Name</champion>
- Mark key stats with <stat>number</stat>
- Use ALL CAPS for emphasis on critical words
- Add emojis to make it engaging and visual

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


# 旧的 build_system_prompt 函数保留用于向后兼容
def build_system_prompt(player_name, annual_stats, worst_game_stats):
    """向后兼容的函数 - 调用 build_annual_stats_prompt"""
    return build_annual_stats_prompt(player_name, annual_stats)


# ###################################################################
# ✅ 阶段二 - 步骤三："主处理函数" (Lambda Handler)
   - Identify enemy team composition (Full AD/Full AP/Heavy CC)
   - Recommend SPECIFIC counter-items
   - Example: "[WARNING] Enemy has <stat>4 AD</stat> champions 🔥. You MUST build <item>Ninja Tabi</item> + <item>Randuin's Omen</item>."

2. **ROLE CONFIRMATION** 🎯 (Team Composition Analysis)
   - Identify player's role in team (only tank? only damage? only engage?)
   - Define PRIMARY MISSION based on team needs
   - Example: "[NOTICE] Your team has NO frontline 😱. YOU are the tank 🛡️. Your job is ABSORB DAMAGE, not chase kills 💀."

3. **BUILD ANALYSIS** 🎒 (Item Choices)
   - Compare actual build vs optimal build for the situation
   - Point out CRITICAL mistakes
   - Example: "[CRITICAL] You built <item>Mercury Treads</item> against <stat>5 AD</stat> champions ⚔️. This is a MAJOR mistake ❌. You needed <item>Ninja Tabi</item>."

4. **EXECUTION REVIEW** 📊 (Strategy vs Reality)
   - Compare what they should have done vs what they did
   - Use KDA, CS, damage, deaths as evidence
   - Example: "[WARNING] Your <stat>9 deaths</stat> 💀 show you did NOT follow 'play safe' strategy. You kept fighting when you should have farmed 🌾."

5. **WIN CONDITION ANALYSIS** 🏆 (Who was supposed to carry?)
   - Identify if player was the win condition or support role
   - Determine if loss was their fault
   - Example: "[NOTICE] Your <champion>ADC</champion> went <stat>12/5/8</stat> 🔥. They were the win condition ⭐. Your <stat>2/10/3</stat> means you failed to protect them 😢."

**IMPORTANT RULES:**
- **ALWAYS respond in ENGLISH** - Never use Chinese or other languages
- Use ACTUAL numbers from the match data
- Be SPECIFIC: mention exact items, exact strategies, exact numbers
- Be HARSH but FAIR: if they played well, say so; if they messed up, explain exactly how
- **ALWAYS use ALL FOUR tag types**: [WARNING], [CRITICAL], [NOTICE], [SUGGESTION]
- Always end with [SUGGESTION]: concrete next steps
- Use champion names, item names, and game terminology correctly
- Include LOTS of emojis to make it engaging

**LANGUAGE REQUIREMENT: Your response MUST be in ENGLISH, regardless of the question language.**

Respond in English with tactical precision."""

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
        if not player_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Missing "playerId" in request body.'
                })
            }
        
        if not user_message or not user_message.strip():
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Missing or empty "userMessage" in request body.'
                })
            }
        
        # 清理用户消息
        user_message = user_message.strip()
        
        # 检测预设问题
        preset_questions = [
            'performance summary',
            'champion pool analysis', 
            'full system diagnostic',
            'what am i doing wrong'
        ]
        is_preset_question = any(preset.lower() in user_message.lower() for preset in preset_questions)
        
        if is_preset_question:
            print(f"[Lambda] 检测到预设问题: {user_message}")
            print("[Lambda] 将基于年度统计数据进行分析")
        
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
            # 如果是预设问题，添加额外提示
            if is_preset_question:
                enhanced_message = f"{user_message}\n\nIMPORTANT: Analyze the ANNUAL STATISTICS provided in the system context. Focus on overall performance across ALL games, not a single match. Include specific numbers from the annual stats (win rate, KDA, CS/min, vision/min, champion pool)."
                messages.append({
                    "role": "user",
                    "content": [{"type": "text", "text": enhanced_message}]
                })
            else:
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
            # 如果是预设问题，添加额外提示
            final_message = user_message
            if is_preset_question:
                final_message = f"{user_message}\n\nIMPORTANT: Analyze the ANNUAL STATISTICS provided in the system context. Focus on overall performance across ALL games, not a single match. Include specific numbers from the annual stats (win rate, KDA, CS/min, vision/min, champion pool)."
            
            if last_role != 'user':
                messages.append({
                    "role": "user",
                    "content": [{"type": "text", "text": final_message}]
                })
            else:
                # 如果最后一条是 user，先添加一个简短的 assistant 响应
                messages.append({
                    "role": "assistant",
                    "content": [{"type": "text", "text": "I understand. Please continue."}]
                })
                messages.append({
                    "role": "user",
                    "content": [{"type": "text", "text": final_message}]
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
