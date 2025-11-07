import json
import boto3
import time
from decimal import Decimal

# ##################################################################
# ✅ 脚本 A：配置“最差比赛回填”工具 (V3)
# ##################################################################

# [ 1. 数据库 ] 您的 DynamoDB 表！
DYNAMODB_TABLE_NAME = "PlayerReports"
DYNAMODB_REGION = "ap-southeast-2" # (悉尼！)

# [ 2. 业务逻辑 ] 我们要查找的“最差”标准
# (我们从 V19.5 脚本中精确复制此逻辑)
WORST_KDA_THRESHOLD = Decimal('1.0')

# ##################################################################
# ✅ 脚本 A - 步骤二：初始化 AWS
# ##################################################################

try:
    # (确保您的 AWS CLI 已配置 `aws configure`)
    dynamodb = boto3.resource('dynamodb', region_name=DYNAMODB_REGION)
    table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    print(f"[回填器] 成功连接到 DynamoDB 表: {DYNAMODB_TABLE_NAME}")
except Exception as e:
    print(f"[回填器] 致命错误: 无法连接到 DynamoDB！ {str(e)}")
    print("请 确认你已经“登录”了 AWS CLI (aws configure)！")
    exit()

# ##################################################################
# ✅ 脚本 A - 步骤三：“最差比赛”计算器 (本地)
# [!! V2.0 修复版 - 2025年11月7日 !!]
# ##################################################################

def find_worst_game_from_history(match_history):
    """
    (V19.5 核心逻辑 - V2.0 修复版)
    在 *本地* 循环 'matchHistory' 列表。
    [V2.0 修复]: 强制将 'kda' 和 'deaths' 从 'str' 转换为数字，
    以防止 TypeError。
    """
    
    worst_game_found = None
    
    if not match_history:
        return None

    # 1. 循环 'matchHistory'
    for game in match_history:
        try:
            # --- [V2.0 修复] 1. 安全地获取 KDA (修复 'str' vs 'Decimal' 错误) ---
            raw_kda = game.get('kda')
            if raw_kda is None:
                kda = Decimal('99.0') # 默认 KDA
            else:
                try:
                    # 关键修复：强制转换 (例如 "0.5" -> Decimal('0.5'))
                    kda = Decimal(raw_kda) 
                except Exception:
                    # 处理 "N/A" 或其他坏数据
                    kda = Decimal('99.0') 

            # --- 2. 安全地获取 'win' ---
            is_loss = not game.get('win', True)
            
            # --- 3. 应用核心逻辑 ---
            if is_loss and kda < WORST_KDA_THRESHOLD:
                # 这是一个“糟糕”的候选游戏
                
                # --- [V2.0 修复] 4. 安全地获取 'deaths' (修复潜在的 'str' vs 'int' 错误) ---
                raw_deaths = game.get('deaths')
                try:
                    current_deaths = int(raw_deaths) # (例如 "10" -> 10)
                except Exception:
                    current_deaths = 0

                if worst_game_found is None:
                    worst_game_found = game
                else:
                    # --- [V2.0 修复] 5. 安全地获取 'worst_game_found' 的死亡次数 ---
                    raw_worst_deaths = worst_game_found.get('deaths')
                    try:
                        worst_deaths = int(raw_worst_deaths)
                    except Exception:
                        worst_deaths = 0
                    
                    # --- 6. 纯数字比较 ---
                    if current_deaths > worst_deaths:
                        worst_game_found = game
                        
        except Exception as e:
            # (这个通用的捕获器仍然保留，以防万一)
            print(f"    [回填器] 警告: 解析 'matchHistory' 中的一场比赛时出现意外错误: {str(e)}")
            continue # 跳过这场损坏的比赛

    # 3. V19.5 的“后备”逻辑
    if worst_game_found is None:
        first_loss = next((game for game in match_history if not game.get('win')), None)
        if first_loss:
            worst_game_found = first_loss
        else:
            # 如果他们全赢了... 那就用第一场比赛
            worst_game_found = match_history[0]

    return worst_game_found

# ##################################################################
# ✅ 脚本 A - 步骤四：“主”回填循环 (本地) (V3)
# ##################################################################

def main_backfill():
    """
    “回填器”主函数。
    读取 DDB -> 本地计算 -> 更新 DDB
    """
    print("--- [RiftLens 回填器 V3 - 强制覆盖模式] 启动 ---")
    print("--- 目标: 从 'matchHistory' 计算 'worstGameStats' ---")
    
    # 1. [在线] 扫描 DynamoDB 以获取所有玩家
    # (这会读取您的 400 多个玩家)
    try:
        print("[回填器] 正在扫描 DynamoDB... (这可能需要 30-60 秒)")
        
        scan_params = {
            # 我们只获取我们需要回填的字段
            'ProjectionExpression': 'PlayerID, playerName, matchHistory, worstGameStats'
        }
        
        all_items = []
        response = table.scan(**scan_params)
        all_items.extend(response['Items'])
        
        # 处理分页（如果您的表大于 1MB）
        while 'LastEvaluatedKey' in response:
            print("[回填器] ...正在扫描下一页...")
            scan_params['ExclusiveStartKey'] = response['LastEvaluatedKey']
            response = table.scan(**scan_params)
            all_items.extend(response['Items'])

        total_players = len(all_items)
        print(f"[回填器] 扫描完成！发现 {total_players} 个玩家报告。")

    except Exception as e:
        print(f"[回填器] 致命错误: 扫描 DynamoDB 失败！ {str(e)}")
        return

    # 2. [本地] 循环处理
    processed_count = 0
    updated_count = 0
    skipped_count = 0
    
    for item in all_items:
        processed_count += 1
        player_puuid = item.get('PlayerID')
        player_name = item.get('playerName', 'Unknown Player')

        print(f"\n--- 正在处理 ({processed_count}/{total_players}): {player_name} ---")

        # 3. [本地] 检查是否已完成 (使脚本可重复运行)
        # [!! 强制覆盖模式 V3.0 !!] 
        # 我们禁用此检查，以强制用 V2.0 的正确逻辑覆盖 V1.0 的错误数据。
        # if 'worstGameStats' in item:
        #     print("    [回填器] 'worstGameStats' 字段已存在。跳过。")
        #     skipped_count += 1
        #     continue
        
        # 4. [本地] 检查数据完整性
        if 'matchHistory' not in item or not item['matchHistory']:
            print("    [回填器] 错误: 找不到 'matchHistory' 或为空。跳过。")
            skipped_count += 1
            continue

        # 5. [本地] 核心计算逻辑！
        print("    [回填器] 正在从 'matchHistory' (本地) 计算 'worstGameStats'...")
        match_history = item['matchHistory']
        worst_game = find_worst_game_from_history(match_history)
        
        if worst_game is None:
            print("    [回填器] 错误: 'find_worst_game_from_history' 未能返回结果。跳过。")
            skipped_count += 1
            continue
        
        print(f"    [回填器] 计算完成。最差比赛ID: {worst_game.get('matchId')}")

        # 6. [在线] 将结果“更新”回 DynamoDB
        try:
            table.update_item(
                Key={'PlayerID': player_puuid},
                UpdateExpression="SET worstGameStats = :wg",
                ExpressionAttributeValues={
                    ':wg': worst_game  # Boto3 会自动处理 Decimal -> DDB Number
                }
            )
            print(f"    [回填器] 成功！已将 'worstGameStats' 更新到 {player_name} 的记录中。")
            updated_count += 1
            
            # (稍微暂停一下，避免触发 DDB 的“写入限制” (WCU) 错误)
            time.sleep(0.1) 
            
        except Exception as e:
            print(f"    [回填器] 致命错误: 无法将 'worstGameStats' 更新到 DDB！ {str(e)}")

    print(f"\n--- [RiftLens 回填器 V3]  完成！ ---")
    print(f"--- 总共处理: {processed_count} ---")
    print(f"--- 成功更新: {updated_count} ---")
    print(f"--- 已经跳过: {skipped_count} ---")


# ##################################################################
# ✅ 脚本 A - 步骤五：运行！
# ##################################################################

if __name__ == "__main__":
    main_backfill()