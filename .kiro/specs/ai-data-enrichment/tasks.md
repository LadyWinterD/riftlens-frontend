# Implementation Plan

- [x] 1. 添加 Data Dragon 静态数据爬取和 DynamoDB 存储


  - 创建函数 `fetch_and_store_static_data()` 从 Data Dragon API 获取 champion.json, item.json, summoner.json, runesReforged.json
  - 创建 DynamoDB 表 `StaticData` 或使用现有表存储静态数据
  - 使用键 `DDRAGON_CHAMPIONS`, `DDRAGON_ITEMS`, `DDRAGON_SUMMONERS`, `DDRAGON_RUNES` 存储数据
  - 在 `main()` 函数开始时调用此函数
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. 增强比赛数据提取 - 添加缺失字段

  - 修改循环 #3 中的比赛详情处理逻辑
  - 提取比赛元数据: `gameCreation` (时间戳), `gameDuration` (比赛时长)
  - 为每个参与者提取以下新字段:
    - `champLevel` (英雄等级)
    - `neutralMinionsKilled` (野怪数)
    - `wardsPlaced`, `wardsKilled` (视野细节)
    - `physicalDamageDealtToChampions`, `magicDamageDealtToChampions` (伤害细分)
    - `totalDamageTaken`, `damageSelfMitigated` (承受伤害和减免)
    - `perks` (符文对象)
    - `turretKills`, `objectivesStolen` (团队贡献)
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 3. 实现衍生指标计算

  - 创建函数 `calculate_derived_metrics(participants, game_duration)` 
  - 第一次遍历: 计算 `team_100_total_kills` 和 `team_200_total_kills`
  - 第二次遍历: 为每个参与者计算:
    - `csPerMin` = (totalMinionsKilled + neutralMinionsKilled) / (gameDuration / 60)
    - `visionPerMin` = visionScore / (gameDuration / 60)
    - `killParticipation` = (kills + assists) / team_total_kills
  - 将计算结果添加到每个参与者对象中
  - _Requirements: 3.5_

- [x] 4. 存储完整的 10 人比赛数据到 DynamoDB

  - 创建或更新 DynamoDB 表结构以支持 `matchHistory` 字段
  - 为每场比赛创建一个对象，包含:
    - `matchId`
    - `gameCreation`, `gameDuration` (比赛元数据)
    - `participants` 数组 (包含全部 10 名玩家的完整数据)
  - 使用 PUUID 作为主键更新每个玩家的记录
  - 实现去重逻辑: 在存储前检查 `matchId` 是否已存在
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.4_

- [x] 5. 更新 Lambda AI Processor 以访问 StaticData


  - 修改 `lambda_chatbot_updated.py` 
  - 添加函数 `get_static_data(key)` 从 DynamoDB StaticData 表查询数据
  - 在生成 AI 提示词时，使用静态数据将 ID 翻译为名称:
    - Champion IDs → Champion names
    - Item IDs → Item names
    - Summoner spell IDs → Spell names
    - Rune IDs → Rune names
  - 添加错误处理: 如果静态数据不存在，记录警告并使用 ID 值
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. 更新 Lambda AI 提示词以支持对线对比分析

  - 修改 Lambda 中的系统提示词，包含全部 10 名参与者数据
  - 指示 AI 识别对线对手 (相同 position, 不同 teamId)
  - 指示 AI 进行对比分析: CS差距, 伤害差距, 视野差距, KDA差距
  - 指示 AI 基于数据差距提供具体改进建议
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. 添加爬虫统计和日志

  - 在 `main()` 函数结束时输出统计信息:
    - 总玩家数
    - 总比赛数
    - 总 API 调用次数
    - 执行时间
  - 添加详细的进度日志，显示当前处理的比赛/玩家
  - _Requirements: 5.5_

- [x] 8. 测试和验证


  - 运行更新后的爬虫脚本，验证数据完整性
  - 检查 DynamoDB 中的数据结构是否正确
  - 验证 StaticData 表是否包含所有静态数据
  - 测试 Lambda 函数是否能正确读取和翻译数据
  - 验证 AI 分析是否包含对线对比和具体建议
