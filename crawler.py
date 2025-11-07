import json
import os
import requests
import time

# ##################################################################
# ✅ V19.4 - 步骤一：配置“爬虫”工具
# ##################################################################

# [ 1. 密钥 ] 100% 把你今天（11 月 5 日）“有效”的 24 小时密钥粘贴到这里！
RIOT_API_KEY = "RGAPI-bd5be278-27d8-4e89-94bb-787085c934db" # 警告！ 100% 必须替换这里！

# [ 2. 路由 ] 100% 硬编码“欧洲区”！
RIOT_ACCOUNT_ROUTING = "europe"
RIOT_MATCH_ROUTING = "europe"

# [ 3. 爬取深度 ]
# (为了“稳赢”，我们 100% 只爬取 5 场比赛的队友，这已经 11*5*9 = 495 个新 PUUID 了！)
GAMES_TO_CRAWL_PER_SEED = 5

# [ 4. “种子” ] 100% 你的“V19.2 - 11 个黄金玩家”名单！
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

# [ 5. API 限速器 ] 100% 尊重 Riot API！
# (每 120 秒 100 次调用)
CALLS_PER_PERIOD = 100
PERIOD_IN_SECONDS = 121 # (我们 100% 留 1 秒的“安全”余量)
call_count = 0
start_time = time.time()

# ##################################################################
# ✅ V19.4 - 步骤二：“尊重限速”的 API 调用器
# ##################################################################

def rate_limited_riot_api_call(url):
    """
    [“V19.4 稳赢”的关键！] 
    这个函数 100% 会“自动”检查我们的 API 调用次数，
    并在需要时 100%“自动”睡眠 120 秒！
    """
    global call_count, start_time
    
    # 1. 检查我们是不是“太快了”？
    if call_count >= CALLS_PER_PERIOD:
        elapsed_time = time.time() - start_time
        if elapsed_time < PERIOD_IN_SECONDS:
            sleep_time = PERIOD_IN_SECONDS - elapsed_time
            print(f"    [爬虫] --- 遭遇 API 限速 (100 次 / 2 分钟) ---")
            print(f"    [爬虫] --- 100%“尊重限速”，正在“睡眠” {sleep_time:.2f} 秒... ---")
            time.sleep(sleep_time)
        
        # 2. “重启”计数器
        call_count = 0
        start_time = time.time()

    # 3. [“稳赢”的执行！]
    print(f"    [爬虫] 正在调用 Riot API (第 {call_count + 1} / {CALLS_PER_PERIOD} 次): {url[:80]}...")
    call_count += 1 # 100% 计数！
    
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
        # (我们 100% 不在这里“重试”，因为 `call_count` 已经 +1 了)
        return None

# ##################################################################
# ✅ V19.4 - 步骤三：“主爬虫”逻辑
# ##################################################################

def main():
    """
    V19.4 “玩家爬虫”主函数
    """
    print("--- [V19.4] RiftLens AI 教练 - “玩家爬虫”脚本启动 ---")
    
    # 1. [“V19.4 核心”] 我们的“花名册”
    # (我们用 PUUID 作为“键”，确保 100% 不重复！)
    player_manifest = {} # (PUUID -> {"name": "...", "tag": "..."})
    
    # 2. [“V19.4 核心”] 我们的“新” PUUID 队列
    # (我们 100% 需要一个“待办事项”列表！)
    puuids_to_crawl_matches = set()
    puuids_to_crawl_names = set()

    # --- 循环 #1: “种子” ---
    print(f"\n--- [V19.4] 循环 #1: 正在处理 {len(SEED_PLAYER_LIST)} 个“种子”玩家... ---")
    for player in SEED_PLAYER_LIST:
        summoner_name = player["name"]
        tag_line = player["tag"]
        
        account_url = f"https://{RIOT_ACCOUNT_ROUTING}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{summoner_name}/{tag_line}"
        account_data = rate_limited_riot_api_call(account_url)
        
        if account_data and 'puuid' in account_data:
            puuid = account_data['puuid']
            player_full_name = f"{account_data['gameName']}#{account_data['tagLine']}"
            
            print(f"    [爬虫] 成功获取“种子” PUUID: {player_full_name}")
            
            if puuid not in player_manifest:
                player_manifest[puuid] = {"name": account_data['gameName'], "tag": account_data['tagLine']}
                puuids_to_crawl_matches.add(puuid) # 100% 把“种子”加到“待办”里！
        else:
            print(f"    [爬虫] 找不到“种子”玩家 {summoner_name}#{tag_line}。跳过。")

    # --- 循环 #2: “获取比赛 ID” ---
    print(f"\n--- [V19.4] 循环 #2: 正在为 {len(puuids_to_crawl_matches)} 个“种子” PUUID 查找比赛... ---")
    match_ids_to_crawl_details = set()
    
    for puuid in puuids_to_crawl_matches:
        match_list_url = f"https://{RIOT_MATCH_ROUTING}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?count={GAMES_TO_CRAWL_PER_SEED}"
        match_ids = rate_limited_riot_api_call(match_list_url)
        
        if match_ids:
            print(f"    [爬虫] 成功获取 {len(match_ids)} 场比赛 ID (来自 PUUID: {puuid[:10]}...)")
            for match_id in match_ids:
                match_ids_to_crawl_details.add(match_id)
    
    # --- 循环 #3: “获取队友/敌人 PUUID” ---
    print(f"\n--- [V19.4] 循环 #3: 正在为 {len(match_ids_to_crawl_details)} 场比赛查找“新”的 PUUID... ---")
    
    for match_id in match_ids_to_crawl_details:
        match_detail_url = f"https://{RIOT_MATCH_ROUTING}.api.riotgames.com/lol/match/v5/matches/{match_id}"
        match_data = rate_limited_riot_api_call(match_detail_url)
        
        if not match_data:
            continue
        
        # [“V19.4 核心”] 100% 抓取 10 个人的 PUUID！
        try:
            participants = match_data.get('info', {}).get('participants', [])
            for p in participants:
                puuid = p.get('puuid')
                if puuid and puuid not in player_manifest:
                    # [“$10,000 美元”的“新” PUUID！]
                    puuids_to_crawl_names.add(puuid) 
                    # (我们 100% 不知道他的“名字”，所以我们 100% 必须把他加到“循环 #4”的“待办”里！)
        except Exception as e:
            print(f"    [爬虫] 解析比赛 {match_id} 详情失败: {str(e)}")

    # --- 循环 #4: “获取新名字”（“$10,000 美元”的“灾难”点！）---
    print(f"\n--- [V19.4] 循环 #4: 找到了 {len(puuids_to_crawl_names)} 个“新”的 PUUID！正在 100%“尊重限速”地获取他们的“名字”... ---")
    print(f"--- (这 100% 需要 { (len(puuids_to_crawl_names) / CALLS_PER_PERIOD) * PERIOD_IN_SECONDS / 60 :.2f} 分钟！请 100% 耐心等待！) ---")
    
    for puuid in puuids_to_crawl_names:
        account_url = f"https://{RIOT_ACCOUNT_ROUTING}.api.riotgames.com/riot/account/v1/accounts/by-puuid/{puuid}"
        account_data = rate_limited_riot_api_call(account_url)
        
        if account_data and 'gameName' in account_data and 'tagLine' in account_data:
            player_full_name = f"{account_data['gameName']}#{account_data['tagLine']}"
            print(f"    [爬虫] 成功获取“新”玩家: {player_full_name}")
            
            # [“V19.4 核心”] 100% 把它加到“花名册”里！
            if puuid not in player_manifest:
                player_manifest[puuid] = {"name": account_data['gameName'], "tag": account_data['tagLine']}
        else:
            print(f"    [爬虫] 找不到 PUUID {puuid[:10]}... 的名字。跳过。")

    # --- [V19.4] “最终”一步：保存“花名册” (用于前端) ---
    
    # [V19.4] 100% 把“键”(PUUID) 和“值”(Name/Tag) 合并到一个“列表”里！
    final_manifest_list = []
    for puuid, data in player_manifest.items():
        final_manifest_list.append({
            "puuid": puuid,
            "name": data["name"],
            "tag": data["tag"],
            "displayName": f"{data['name']}#{data['tag']}"
        })

    try:
        with open("player_manifest.json", "w", encoding='utf-8') as f:
            json.dump(final_manifest_list, f, indent=2, ensure_ascii=False)
        print(f"\n--- [V19.4] 100% 完成！ ---")
        print(f"--- 成功爬取了 {len(final_manifest_list)} 个“欧洲区”玩家！ ---")
        print(f"--- 你的“前端”玩家名单 100% 已经保存到 'player_manifest.json'！ ---")
    except Exception as e:
        print(f"[V19.4] 致命错误: 无法保存 'player_manifest.json'！ {str(e)}")


# ##################################################################
# ✅ V19.4 - 步骤四：运行！
# ##################################################################

if __name__ == "__main__":
    if "xxxx" in RIOT_API_KEY:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("! 首席工程师！你 100% 必须先在“第 11 行”粘贴你“有效”的 API 密钥！ !")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        main()