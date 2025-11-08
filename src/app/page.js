"use client";

import { useState } from "react";
// [V21] 导入我们 *确认可用* 的服务
import { searchSummoner, postStatefulChatMessage } from "@/services/awsService";
import playerManifest from '../../player_manifest.json';
// [V21] 导入您的 Figma 风格组件
import { CyberStatCard } from "@/components/CyberStatCard";
import { CyberMatchCard } from "@/components/CyberMatchCard";
import { CyberAnalysisPanel } from "@/components/CyberAnalysisPanel";
import { RiftAI } from "@/components/RiftAI";
import { PlayerSearchBar } from "@/components/PlayerSearchBar";

// [V21] 导入您项目中的 Shadcn UI 组件
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster, toast } from "sonner"; // (来自 sonner.tsx)

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState(null); // (V21: 存储来自 Lambda 的完整*原始*报告)
  const [error, setError] = useState(null);
  const [selectedChampion, setSelectedChampion] = useState(""); // (V21: 按名称选择)
  const [currentSummoner, setCurrentSummoner] = useState({ name: "Suger 99", region: "NA" });

  // [!! V21 关键修复 !!] 
  // 这是我们新的 handleSearch 逻辑
  const handleSearch = async (summonerName, region) => {
    console.log("[AWS] Searching summoner:", summonerName, region);
    setIsLoading(true);
    setError(null);
    toast.loading(`[NEURAL SCAN] Connecting to local manifest...`, {
      id: "search-toast",
      style: {
        background: "#0a0e27",
        border: "2px solid #00ffff",
        color: "#00ffff",
        fontFamily: "monospace",
      },
    });

    // 1. [本地查找 PUUID]
    // (注意：您的 manifest 使用 'displayName' 和 'name')
    const foundPlayer = playerManifest.find(
      (player) => (player.displayName || player.name).toLowerCase() === summonerName.toLowerCase()
    );

    if (!foundPlayer) {
      const errorMsg = `[LOCAL ERROR] Summoner "${summonerName}" not found in local manifest.`;
      console.error(errorMsg);
      setError(errorMsg);
      toast.error(errorMsg, {
        id: "search-toast",
        style: {
          background: "#0a0e27",
          border: "2px solid #ff0000",
          color: "#ff0000",
          fontFamily: "monospace",
        },
      });
      setIsLoading(false);
      return;
    }

    // [V21] 我们从 manifest 中提取了 PUUID！
    const puuid = foundPlayer.puuid; 
    console.log(`[LOCAL] Found PUUID: ${puuid} for name: ${summonerName}`);
    toast.loading(`[NEURAL SCAN] PUUID found. Connecting to AWS...`, { id: "search-toast" });

    // 2. [调用 AWS]
    // 现在我们使用 *真实* 的 PUUID 调用 awsService
    try {
      const data = await searchSummoner(puuid); 

      if (!data || !data.PlayerID) {
        throw new Error("API returned empty or invalid player data.");
      }

      console.log("[AWS] Report successfully received!", data);
      setPlayerData(data); // 存储 *原始* DDB 数据
      setCurrentSummoner({ name: data.playerName || summonerName, region });

      // [V21] 自动选择第一个英雄
      if (data.annualStats && data.annualStats.championCounts) {
        const firstChamp = Object.keys(data.annualStats.championCounts)[0];
        setSelectedChampion(firstChamp);
      }

      toast.success(`[SCAN COMPLETE] Data loaded for ${data.playerName}`, { 
        id: "search-toast", 
        style: {
          background: "#0a0e27",
          border: "2px solid #00ff00",
          color: "#00ffff",
          fontFamily: "monospace",
        }
      });
    } catch (err) {
      console.error("[AWS] Failed to call API:", err);
      setError(err.message);
      toast.error(`[AWS ERROR] ${err.message}`, { 
        id: "search-toast",
        style: {
          background: "#0a0e27",
          border: "2px solid #ff0000",
          color: "#ff0000",
          fontFamily: "monospace",
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- [ 您的 Figma 风格 Loading 和初始状态 ] ---
  // (您的 V1 JSX 在这里 100% 保持不变，它非常棒)

  // [加载中状态]
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        {/* ... 您的 Loading JSX (来自 response_17) ... */}
         <div className="text-4xl text-[#00ffff]">NEURAL SCAN IN PROGRESS...</div>
      </div>
    );
  }

  // [初始状态]
  if (!playerData) {
    return (
      <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden">
        {/* ... 您的欢迎界面 JSX (来自 response_17) ... */}
        <button onClick={() => handleSearch("Suger 99", "NA")}>
          [ INITIATE AI ANALYSIS ]
        </button>
        <Toaster position="top-center" />
      </div>
    );
  }

  // --- [ V21 关键的数据转换 (The "Bridge") ] ---
  // 这是“转接头”。
  // 我们在这里“转换”数据，以匹配您的 Figma 组件
  
  // 1. 转换 OverallStats
  const OverallStats = playerData.annualStats || {};
  
  // 2. 转换 Matches
  const Matches = playerData.matchHistory || [];
  
  // 3. 转换 ChampionStats
  const ChampionStats = OverallStats.championCounts ? Object.entries(OverallStats.championCounts).map(([name, games]) => {
      // (我们从 matchHistory 中实时计算该英雄的 WinRate 和 KDA)
      const champMatches = Matches.filter(m => m.championName === name);
      const wins = champMatches.filter(m => m.win).length;
      const totalKills = champMatches.reduce((acc, m) => acc + (m.kills || 0), 0);
      const totalDeaths = champMatches.reduce((acc, m) => acc + (m.deaths || 1), 0); // (防除零)
      const totalAssists = champMatches.reduce((acc, m) => acc + (m.assists || 0), 0);
      
      return {
          Champion: name,
          Games: games,
          WinRate: champMatches.length > 0 ? wins / champMatches.length : 0,
          AvgKDA: totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists,
      };
  }).sort((a, b) => b.Games - a.Games) : []; // 按游戏场次排序

  const selectedChampData = ChampionStats.find(c => c.Champion === selectedChampion);
  const selectedChampMatches = Matches.filter(m => m.championName === selectedChampion);


  // --- [ 已加载数据 ] ---
  // (您的 V1 JSX 现在 100% 可以工作了)
  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-x-hidden">
      {/* ... 您的网格/扫描线/粒子背景 ... */}
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 overflow-visible">
        {/* ... 您的 Header (完全不变) ... */}
        
        <PlayerSearchBar onSearch={handleSearch} isLoading={isLoading} />
        
        <Tabs defaultValue="report" className="w-full">
          {/* ... 您的 TabsList (完全不变) ... */}

          {/* Tab 1: AI Report (V21 兼容) */}
          <TabsContent value="report" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* [V21 修复] 读取 OverallStats.avgKDA (而不是 .AvgKDA) */}
              <CyberStatCard
                label="KDA"
                value={OverallStats.avgKDA?.toFixed(2) || "N/A"}
                color="cyan" icon="⚔️"
              />
              <CyberStatCard
                label="WIN RATE"
                value={OverallStats.winRate ? `${(OverallStats.winRate * 100).toFixed(0)}%` : "N/A"}
                color="magenta" icon="🎯"
              />
              <CyberStatCard
                label="CS/MIN"
                value={OverallStats.avgCsPerMin?.toFixed(1) || "N/A"}
                color="yellow" icon="🌾"
              />
              <CyberStatCard
                label="GAMES"
                value={OverallStats.totalGames?.toString() || "N/A"}
                color="green" icon="🎮"
              />
            </div>
            {/* [V21] 传递 *原始* playerData, CyberAnalysisPanel 会自己解析 */}
            <CyberAnalysisPanel playerData={playerData} />
          </TabsContent>

          {/* Tab 2: Match History (V21 兼容) */}
          <TabsContent value="matches">
            <div className="bg-[#0a0e27]/80 ...">
              {/* ... */}
              <ScrollArea className="h-[800px] pr-4">
                <div className="space-y-3">
                  {/* [V21 修复] 读取 Matches (而不是 playerData.Matches) */}
                  {Matches.slice(0, 20).map((match, idx) => (
                    <CyberMatchCard
                      key={idx}
                      champion={match.championName || "Unknown"}
                      isWin={match.win}
                      kills={match.kills} deaths={match.deaths} assists={match.assists}
                      cs={match.cs} visionScore={match.visionScore || 0}
                      duration={`${Math.floor((match.gameDurationInSec || 0) / 60)}:${((match.gameDurationInSec || 0) % 60).toString().padStart(2, "0")}`}
                      gameNumber={idx + 1}
                      // (其他 props...)
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Tab 3: Champions (V21 兼容) */}
          <TabsContent value="champions">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Champion List (V21 修复) */}
              <div className="lg:col-span-1 ...">
                <div className="space-y-2">
                  {/* [V21 修复] 读取 ChampionStats (而不是 playerData.ChampionStats) */}
                  {ChampionStats.map((champ, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedChampion(champ.Champion)}
                      className={`... ${selectedChampion === champ.Champion ? "border-[#00ffff] bg-[#00ffff]/10" : "..."}`}
                    >
                      {/* ... (按钮内部样式) ... */}
                      <div className="text-sm ...">{champ.Champion}</div>
                      <div className="text-xs ...">
                        <span>{champ.Games} games</span>
                        <span className={champ.WinRate >= 0.5 ? "text-[#00ff00]" : "text-[#ff0000]"}>
                          {(champ.WinRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Champion Match History (V21 修复) */}
              <div className="lg:col-span-3 ...">
                {/* [V21 修复] 读取 selectedChampData */}
                {selectedChampData && (
                  <>
                    <div className="flex items-center gap-4 ...">
                      <h2 className="text-3xl ...">{selectedChampData.Champion}</h2>
                      <div className="flex ...">
                        <span>{selectedChampData.Games} GAMES</span>
                        <span>{selectedChampData.AvgKDA.toFixed(2)} KDA</span>
                        <span className={selectedChampData.WinRate >= 0.5 ? "text-[#00ff00]" : "text-[#ff0000]"}>
                          {(selectedChampData.WinRate * 100).toFixed(0)}% WR
                        </span>
                      </div>
                    </div>

                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-3">
                        {/* [V21 修复] 读取 selectedChampMatches */}
                        {selectedChampMatches.map((match, idx) => (
                          <CyberMatchCard
                            key={idx}
                            champion={match.championName}
                            isWin={match.win}
                            kills={match.kills} deaths={match.deaths} assists={match.assists}
                            cs={match.cs} visionScore={match.visionScore || 0}
                            duration={`${Math.floor((match.gameDurationInSec || 0) / 60)}:${((match.gameDurationInSec || 0) % 60).toString().padStart(2, "0")}`}
                            gameNumber={idx + 1}
                          />
                        ))}
                      </div>
                    </ScrollArea
>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* [V21] 聊天机器人 (它将接收 *原始* playerData) */}
      <RiftAI playerData={playerData} />

      <Toaster position="top-center" />
    </div>
  );
}