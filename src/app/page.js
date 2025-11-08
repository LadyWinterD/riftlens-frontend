"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
// [V21] 导入我们 *确认可用* 的服务
import { searchSummoner } from "@/services/awsService";
import playerManifest from '../../player_manifest.json';
// [V21] 导入您的 Figma 风格组件
import { CyberStatCard } from "@/components/CyberStatCard";
import { CyberMatchCard } from "@/components/CyberMatchCard";
import { CyberAnalysisPanel } from "@/components/CyberAnalysisPanel";
import { RiftAI } from "@/components/RiftAI";
import { PlayerSearchBar } from "@/components/PlayerSearchBar";
import { CyberLoadingScreen } from "@/components/CyberLoadingScreen";

// [V21] 导入您项目中的 Shadcn UI 组件
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster, toast } from "sonner"; // (来自 sonner.tsx)

// Data Dragon CDN版本
const DD_VERSION = '14.1.1';
const DD_CDN = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}`;

export default function Home() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState(null); // (V21: 存储来自 Lambda 的完整*原始*报告)
  const [selectedChampion, setSelectedChampion] = useState(""); // (V21: 按名称选择)
  const [currentSummoner, setCurrentSummoner] = useState({ name: "Suger 99", region: "EUW" });

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  const handleLoadingSearch = async (summonerName, region) => {
    // 从加载界面搜索
    setCurrentSummoner({ name: summonerName, region });
    setShowLoadingScreen(false);
    toast.success(`[SCAN COMPLETE] Loading data for ${summonerName} (${region})`, {
      style: {
        background: "#0a0e27",
        border: "2px solid #00ff00",
        color: "#00ffff",
        fontFamily: "monospace",
      },
    });
    // 调用实际搜索
    await handleSearch(summonerName, region);
  };

  const handleDemoMode = () => {
    // 使用演示数据
    setCurrentSummoner({ name: "Demo Player", region: "DEMO" });
    setShowLoadingScreen(false);
    toast.success('[DEMO MODE] Sample dashboard loaded successfully!', {
      style: {
        background: "#0a0e27",
        border: "2px solid #ffff00",
        color: "#ffff00",
        fontFamily: "monospace",
      },
    });
    // 调用实际搜索演示数据
    handleSearch("Suger 99", "EUW");
  };

  // [!! V21 关键修复 !!] 
  // 这是我们新的 handleSearch 逻辑
  const handleSearch = async (summonerName, region) => {
    console.log("[AWS] Searching summoner:", summonerName, region);
    setIsLoading(true);
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
      (player) => {
        const playerName = player.name.toLowerCase();
        const searchName = summonerName.toLowerCase();
        // 精确匹配 name 字段
        return playerName === searchName;
      }
    );

    console.log(`[LOCAL] Searching for: "${summonerName}"`);
    console.log(`[LOCAL] Found player:`, foundPlayer);

    if (!foundPlayer) {
      const errorMsg = `[LOCAL ERROR] Summoner "${summonerName}" not found in local manifest. Total players: ${playerManifest.length}`;
      console.error(errorMsg);
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

      if (!data) {
        throw new Error("API returned empty data.");
      }

      console.log("[AWS] Report successfully received!", data);
      console.log("[AWS] Data keys:", Object.keys(data));
      console.log("[AWS] annualStats:", data.annualStats);
      console.log("[AWS] avgKDA type:", typeof data.annualStats?.avgKDA);
      
      // 标准化 PlayerID 字段名（可能是 PlayerID, playerId, 或 playerID）
      if (!data.PlayerID && !data.playerId && !data.playerID) {
        console.warn("[AWS] No PlayerID field found, using PUUID as fallback");
        data.PlayerID = puuid;
      } else if (data.playerId) {
        data.PlayerID = data.playerId;
      } else if (data.playerID) {
        data.PlayerID = data.playerID;
      }
      
      console.log("[AWS] Using PlayerID:", data.PlayerID);
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

  // --- [ 加载界面 ] ---
  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {showLoadingScreen && (
          <CyberLoadingScreen
            onLoadingComplete={handleLoadingComplete}
            onSearch={handleLoadingSearch}
            onDemoMode={handleDemoMode}
            minLoadingTime={3500}
          />
        )}
      </AnimatePresence>

      {/* Main App */}
      {!showLoadingScreen && renderMainApp()}
      
      <Toaster position="top-center" />
    </>
  );

  function renderMainApp() {
    // [加载中状态]
    if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center relative overflow-hidden">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ffff 2px, #00ffff 4px)',
          animation: 'scanlines 8s linear infinite'
        }} />

        {/* Loading Content */}
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-8 animate-pulse">🔍</div>
          <div className="text-4xl text-[#00ffff] font-mono mb-4" style={{
            textShadow: '0 0 20px #00ffff'
          }}>
            NEURAL SCAN IN PROGRESS
          </div>
          <div className="flex items-center justify-center gap-2 text-[#ff00ff] font-mono">
            <span className="animate-pulse">▓</span>
            <span className="animate-pulse delay-100">▓</span>
            <span className="animate-pulse delay-200">▓</span>
            <span className="text-[#666]">ANALYZING PLAYER DATA</span>
            <span className="animate-pulse delay-200">▓</span>
            <span className="animate-pulse delay-100">▓</span>
            <span className="animate-pulse">▓</span>
          </div>
        </div>
      </div>
    );
  }

    // [初始状态] - 现在由加载界面处理
    if (!playerData) {
      return null;
    }

  // --- [ V21 关键的数据转换 (The "Bridge") ] ---
  // 这是“转接头”。
  // 我们在这里“转换”数据，以匹配您的 Figma 组件
  
  // 1. 转换 OverallStats (修复字段名称匹配)
  // 确保所有数值都被正确转换为数字类型
  const annualStats = playerData.annualStats || {};
  
  const OverallStats = {
    avgKDA: Number(annualStats.avgKDA) || 0,
    winRate: Number(annualStats.winRate) || 0,
    avgCsPerMin: Number(annualStats.avgCsPerMin) || 0,
    totalGames: Number(annualStats.totalGames) || 0,
    championCounts: annualStats.championCounts || {}
  };
  
  console.log('[DATA TRANSFORM] OverallStats:', OverallStats);
  
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
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ffff 2px, #00ffff 4px)'
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0a0e27] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 overflow-visible">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-[#00ffff] mb-2" style={{
            textShadow: '0 0 20px #00ffff'
          }}>
            RIFTLENS AI
          </h1>
          <div className="text-[#ff00ff] font-mono text-sm" style={{
            textShadow: '0 0 10px #ff00ff'
          }}>
            [ ANALYZING: {currentSummoner.name} • {currentSummoner.region} ]
          </div>
        </header>
        
        <PlayerSearchBar onSearch={handleSearch} isLoading={isLoading} />
        
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#0a0e27]/80 border-2 border-[#00ffff]/30 p-1">
            <TabsTrigger 
              value="report" 
              className="data-[state=active]:bg-[#00ffff]/20 data-[state=active]:text-[#00ffff] data-[state=active]:border-2 data-[state=active]:border-[#00ffff] text-[#666] font-mono uppercase tracking-wider transition-all"
              style={{ textShadow: 'data-[state=active]:0 0 10px #00ffff' }}
            >
              📊 AI REPORT
            </TabsTrigger>
            <TabsTrigger 
              value="matches" 
              className="data-[state=active]:bg-[#ff00ff]/20 data-[state=active]:text-[#ff00ff] data-[state=active]:border-2 data-[state=active]:border-[#ff00ff] text-[#666] font-mono uppercase tracking-wider transition-all"
            >
              🎮 MATCH HISTORY
            </TabsTrigger>
            <TabsTrigger 
              value="champions" 
              className="data-[state=active]:bg-[#00ffff]/20 data-[state=active]:text-[#00ffff] data-[state=active]:border-2 data-[state=active]:border-[#00ffff] text-[#666] font-mono uppercase tracking-wider transition-all"
            >
              ⚔️ CHAMPIONS
            </TabsTrigger>
          </TabsList>

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
            <div className="bg-[#0a0e27]/80 border-2 border-[#ff00ff]/40 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-[#ff00ff] font-mono uppercase tracking-wider" style={{
                  textShadow: '0 0 10px #ff00ff'
                }}>
                  🎮 RECENT MATCHES
                </h2>
                <div className="text-[#666] font-mono text-sm">
                  Showing {Math.min(20, Matches.length)} of {Matches.length} games
                </div>
              </div>
              <ScrollArea className="h-[800px] pr-4">
                <div className="space-y-3">
                  {/* [V21 修复] 读取 Matches (而不是 playerData.Matches) */}
                  {Matches.slice(0, 20).map((match, idx) => (
                    <CyberMatchCard
                      key={idx}
                      champion={match.championName || "Unknown"}
                      championIcon="🎮"
                      isWin={match.win}
                      kills={match.kills} deaths={match.deaths} assists={match.assists}
                      cs={match.cs} visionScore={match.visionScore || 0}
                      items={match.items || ["⚔️", "🛡️", "👢", "💎", "🔮", "⭐"]}
                      rune="🔥"
                      duration={`${Math.floor((match.gameDurationInSec || 0) / 60)}:${((match.gameDurationInSec || 0) % 60).toString().padStart(2, "0")}`}
                      gameNumber={idx + 1}
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
              <div className="lg:col-span-1 bg-[#0a0e27]/80 border-2 border-[#00ffff]/40 p-4 backdrop-blur-sm">
                <h3 className="text-[#00ffff] font-mono uppercase tracking-wider mb-4 text-sm" style={{
                  textShadow: '0 0 10px #00ffff'
                }}>
                  ⚔️ CHAMPION POOL
                </h3>
                <div className="space-y-2">
                  {/* [V21 修复] 读取 ChampionStats (而不是 playerData.ChampionStats) */}
                  {ChampionStats.map((champ, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedChampion(champ.Champion)}
                      className={`w-full text-left px-3 py-2 border-2 transition-all font-mono text-sm ${
                        selectedChampion === champ.Champion 
                          ? "border-[#00ffff] bg-[#00ffff]/10" 
                          : "border-[#00ffff]/20 bg-[#0a0e27]/50 hover:border-[#00ffff]/50"
                      }`}
                    >
                      <div className="text-sm text-[#00ffff]">{champ.Champion}</div>
                      <div className="text-xs flex items-center justify-between mt-1">
                        <span className="text-[#666]">{champ.Games} games</span>
                        <span className={champ.WinRate >= 0.5 ? "text-[#00ff00]" : "text-[#ff0000]"}>
                          {(champ.WinRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Champion Match History (V21 修复) */}
              <div className="lg:col-span-3 bg-[#0a0e27]/80 border-2 border-[#00ffff]/40 p-6 backdrop-blur-sm">
                {/* [V21 修复] 读取 selectedChampData */}
                {selectedChampData && (
                  <>
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-[#00ffff]/30">
                      <h2 className="text-3xl text-[#00ffff] font-mono uppercase tracking-wider" style={{
                        textShadow: '0 0 10px #00ffff'
                      }}>
                        {selectedChampData.Champion}
                      </h2>
                      <div className="flex items-center gap-4 text-sm font-mono">
                        <span className="text-[#666]">{selectedChampData.Games} GAMES</span>
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
                            championIcon="🎮"
                            isWin={match.win}
                            kills={match.kills} deaths={match.deaths} assists={match.assists}
                            cs={match.cs} visionScore={match.visionScore || 0}
                            items={match.items || ["⚔️", "🛡️", "👢", "💎", "🔮", "⭐"]}
                            rune="🔥"
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
    </div>
    );
  }
}