import json
import boto3
from decimal import Decimal

# ##################################################################
# ✅   - 步骤一：配置“上传器”工具
# ##################################################################

DYNAMODB_TABLE_NAME = "PlayerReports"
DYNAMODB_REGION = "ap-southeast-2" 
INPUT_DATA_FILE = "all_player_data.json"

# ##################################################################
# ✅   - 步骤二：“[“ ”的    “清洗”函数！]”
# ##################################################################

def clean_empty_keys(data_object):
    """
      递归地“清洗”一个 Python 对象 (字典或列表)。
    它   会“删除”所有“键 (Key)”是“空字符串 ("")”的条目。
    """
    if isinstance(data_object, dict):
        #   我们   必须在“键”的“列表”上循环，因为我们   正在“修改”字典！
        for key in list(data_object.keys()):
            if key == "":
                # [“    Bug 修复”！]  “杀死”那个“空”的“键 (Key)”！
                del data_object[key]
                print(f"    [清洗器] 成功“杀死”了一个“空属性名称”！")
            else:
                #  “递归”！
                clean_empty_keys(data_object[key])
    elif isinstance(data_object, list):
        #  “递归”！
        for item in data_object:
            clean_empty_keys(item)
    
    #   返回“已清洗”的对象！
    return data_object

# ##################################################################
# ✅   - 步骤三：“主”上传逻辑
# ##################################################################

def main():
    """
      “AWS 上传器”主函数
    """
    print("--- [ ] RiftLens AI 教练 - “AWS 上传器”脚本启动 ---")
    
    # 1. 初始化 DynamoDB
    try:
        dynamodb = boto3.resource('dynamodb', region_name=DYNAMODB_REGION)
        table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        print(f"[ ] 成功连接到 DynamoDB 表: {DYNAMODB_TABLE_NAME}")
    except Exception as e:
        print(f"[ ] 致命错误: 无法连接到 DynamoDB！ {str(e)}")
        print("请   确认你已经“登录”了 AWS CLI (aws configure)！")
        return

    # 2. “读取”本地数据缓存
    try:
        with open(INPUT_DATA_FILE, 'r', encoding='utf-8') as f:
            all_player_data = json.load(f, parse_float=Decimal)
        print(f"[ ] 成功加载 {len(all_player_data)} 个玩家 (来自 '{INPUT_DATA_FILE}')！")
    except Exception as e:
        print(f"[ ] 致命错误: 无法读取 '{INPUT_DATA_FILE}'！ {str(e)}")
        return
    
    # 3. [ ] “主”循环！（“上传”！）
    upload_count = 0
    total_players = len(all_player_data)
    
    try:
        with table.batch_writer() as batch:
            for puuid, player_data in all_player_data.items():
                
                # [“   “清洗”！”]
                # (我们   必须在“上传”之前“清洗”它！)
                cleaned_player_data = clean_empty_keys(player_data)
                
                #     开启“TTL 缓存”！
                
                #     把“主键” (PUUID) 放回“Item”里！
                cleaned_player_data["PlayerID"] = puuid 
                
                #  “上传”！
                batch.put_item(Item=cleaned_player_data)
                
                upload_count += 1
                if upload_count % 50 == 0:
                    print(f"   ...已上传 {upload_count} / {total_players} 个报告...")

    except Exception as e:
        print(f"[ ] 致命错误: 批量上传到 DynamoDB 失败！ {str(e)}")
        print("    [上传器] （** ** 是因为你的 AWS CLI 没配置！`aws configure`）")
        return

    print(f"\n--- 全部  完成！ ---")
    print(f"--- 成功将 {upload_count} / {total_players} 份“数据报告”上传到 DynamoDB！ ---")
    print(f"--- 我们的“  架构”  “数据就绪”！ ---")


# ##################################################################
# ✅   - 步骤四：运行！
# ##################################################################

if __name__ == "__main__":
    main()