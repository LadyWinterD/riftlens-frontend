import json
import boto3
from decimal import Decimal
import time

# ##################################################################
# ✅ 阶段二：配置“AI 分析器”
# ##################################################################

DYNAMODB_TABLE_NAME = "PlayerReports"
DYNAMODB_REGION = "ap-southeast-2" # (悉尼！)
GAMES_TO_ANALYZE_COUNT = 20 # (这个值只用于 Prompt 中显示，保持与 V19.5 一致)

# ##################################################################
# ✅ 阶段二 - 步骤二：初始化 AWS
# ##################################################################

try:
    # (确保您的 AWS CLI 已配置 `aws configure`)
    dynamodb = boto3.resource('dynamodb', region_name=DYNAMODB_REGION)
    bedrock_runtime = boto3.client('bedrock-runtime', region_name=DYNAMODB_REGION)
    table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    print(f"[AI 分析器] 成功连接到 DynamoDB ({DYNAMODB_TABLE_NAME}) 和 Bedrock。")
except Exception as e:
    print(f"[AI 分析器] 致命错误: 无法连接到 AWS 服务。 {str(e)}")
    print("请 确认你已经“登录”了 AWS CLI (aws configure)！")
    exit()

# ##################################################################
# ✅ 阶段二 - 步骤三：复用 V19.5 的“AI 助手”函数
# (我们从 V19.5 脚本中“复制”这些函数，它们不需要改变)
# ##################################################################

def build_bedrock_prompt(annual_stats, worst_game_stats, summoner_name):
    """(V7.2) 构造“模型私语者” Prompt (V7.2 英语 - 不变)"""
    
    # (从 V2.0 修复版中学习：确保我们安全地处理来自 DDB 的 Decimal)
    try:
        stats_summary = f"""
    - Player: {summoner_name}
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
    - CS/min: {Decimal(worst_game_stats.get('csPerMin', 0)):.1f}
    - Vision/min: {Decimal(worst_game_stats.get('visionPerMin', 0)):.1f}
    """
    except Exception as e:
        print(f"    [AI 分析器] 警告: 构建 Prompt 时遇到数据类型问题: {e}")
        # 如果数据损坏，提供一个回退 Prompt
        stats_summary = "Error: Could not parse annual_stats."
        roast_summary = "Error: Could not parse worst_game_stats."


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
    print(f"    [AI 分析器] 正在调用 Amazon Bedrock (AI)...")
    try:
        model_id = 'anthropic.claude-3-haiku-20240307-v1:0'
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}]
        }
        # Bedrock API 调用超时时间设为 30 秒
        response = bedrock_runtime.invoke_model(body=json.dumps(request_body), modelId=model_id)
        response_body = json.loads(response.get('body').read())
        ai_text = response_body.get('content', [{}])[0].get('text', '')
        print(f"    [AI 分析器] 成功从 Bedrock 获得 AI 分析: {ai_text[:50]}...")
        return ai_text
    except Exception as e:
        print(f"    [AI 分析器] Bedrock (AI) 调用失败: {str(e)}")
        # 检查是否是超时或速率限制
        if "Read timeout" in str(e):
            return "AI analysis failed: (Bedrock connection timed out. Server may be busy.)"
        if "ThrottlingException" in str(e):
            return "AI analysis failed: (Bedrock API rate limit exceeded. Please wait and try again.)"
        return "AI analysis failed. (The AI module encountered an error.)"

# ##################################################################
# ✅ 阶段二 - 步骤四：“主”分析循环 
# (从 AWS 读取 -> 调用 AI -> 更新 AWS)
# ##################################################################

def main_processor():
    """
    “AI 处理器”主函数
    """
    print("--- [RiftLens 阶段二] “AI 分析处理器”启动 ---")
    
    # 1. 从 DynamoDB “扫描”所有“准备就绪”的报告
    try:
        print("[AI 分析器] 正在扫描 DynamoDB 查找“待处理”的报告...")
        
        # 我们的扫描逻辑：
        # 1. 必须存在 `worstGameStats` (由脚本 A 保证)
        # 2. 必须 *不存在* `analysisTimestamp` (防止我们重复处理)
        response = table.scan(
            FilterExpression="attribute_exists(worstGameStats) AND attribute_not_exists(analysisTimestamp)"
        )
        items_to_process = response['Items']
        
        # 处理分页
        while 'LastEvaluatedKey' in response:
            print("[AI 分析器] ...正在扫描下一页...")
            response = table.scan(
                FilterExpression="attribute_exists(worstGameStats) AND attribute_not_exists(analysisTimestamp)",
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items_to_process.extend(response['Items'])

        print(f"[AI 分析器] 发现 {len(items_to_process)} 份报告需要 AI 分析。")

    except Exception as e:
        print(f"[AI 分析器] 致命错误: 扫描 DynamoDB 失败。 {str(e)}")
        return

    # 2. 循环处理每一个“待处理”的报告
    processed_count = 0
    failed_count = 0
    
    for report in items_to_process:
        player_puuid = report.get("PlayerID")
        player_name = report.get("playerName", "Unknown Player")
            
        print(f"\n--- 正在分析 ({processed_count + 1}/{len(items_to_process)}): {player_name} ---")

        try:
            # 3. 验证我们是否拥有所需的数据（由扫描保证，但双重检查更安全）
            if "annualStats" not in report or "worstGameStats" not in report:
                print(f"    [AI 分析器] 错误: {player_name} 的数据不完整。跳过。")
                failed_count += 1
                continue

            # 4. 从 DB 中提取数据
            annual_stats = report["annualStats"]
            worst_game_stats = report["worstGameStats"]
            
            # 5. [在线] 调用 AI (复用 V19.5 的函数)
            prompt = build_bedrock_prompt(annual_stats, worst_game_stats, player_name)
            ai_analysis = call_bedrock(prompt)

            if "AI analysis failed" in ai_analysis:
                print(f"    [AI 分析器] Bedrock 分析失败。跳过此玩家，不更新数据库。")
                failed_count += 1
                # 如果是速率超限，我们应该暂停一下
                if "ThrottlingException" in ai_analysis:
                    print("    [AI 分析器] --- 遭遇 Bedrock 速率限制！暂停 10 秒钟... ---")
                    time.sleep(10)
                continue # 跳过此玩家

            # 6. [在线] 将结果“更新”回 DynamoDB
            print(f"    [AI 分析器] 正在将分析结果更新回 DynamoDB...")
            table.update_item(
                Key={'PlayerID': player_puuid},
                UpdateExpression="SET aiAnalysis_DefaultRoast = :analysis, analysisTimestamp = :ts",
                ExpressionAttributeValues={
                    ':analysis': ai_analysis,
                    ':ts': int(time.time()) # 添加一个时间戳，防止我们重复处理
                }
            )
            print(f"    [AI 分析器] 成功更新 {player_name} 的报告！")
            processed_count += 1
            
            # 尊重 Bedrock 的速率限制 (非常重要！)
            time.sleep(2) # 每次调用后暂停 2 秒，防止超速

        except Exception as e:
            print(f"    [AI 分析器] 处理 {player_name} 时发生意外错误: {str(e)}")
            failed_count += 1

    print(f"\n--- [RiftLens 阶段二]  完成！ ---")
    print(f"--- 成功分析并更新: {processed_count} 份报告 ---")
    print(f"--- 失败或跳过: {failed_count} 份报告 ---")

# ##################################################################
# ✅ 阶段二 - 步骤五：运行！
# ##################################################################

if __name__ == "__main__":
    main_processor()