"use client";

import { useState, useMemo } from 'react';

// [“稳赢”的 V7.2!] 我们“复用”这两个组件！
import CyberMatchCard from './CyberMatchCard'; 
import { CyberStatCard_V2_Small } from './Tab_AIReport'; // (我们必须在 Tab_AIReport.js 里 export 它)

// --- [V7.0 蓝图!] “左侧面板”的“英雄选择按钮” ---
function ChampionButton({ championName, championIcon, games, winRate, onClick, isActive }) {
  const borderColor = isActive ? 'border-cyber-yellow' : 'border-cyber-gray/30';
  const textColor = isActive ? 'text-cyber-yellow' : 'text-cyber-gray-light';
  const shadow = isActive ? 'shadow-neon-yellow' : '';

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-3 bg-space-light rounded-sm border-2 ${borderColor} 
                  hover:border-cyber-yellow/50 transition-all duration-300 ${shadow}`}
    >
      <span className="text-4xl mr-3">{championIcon}</span>
      <div className="text-left">
        <p className={`font-bold text-lg ${textColor}`}>{championName}</p>
        <p className="font-mono text-xs text-cyber-gray">
          {games} Games | {winRate}% Win Rate
        </p>
      </div>
    </button>
  );
}

export default function ChampionsTab({ report }) {

  // --- 1. [“稳赢”的 V7.2] 计算“英雄池” (我们只在 Day 6 计算一次) ---
  const championPool = useMemo(() => {
    const pool = new Map();
    for (const match of report.matchHistory) {
      if (!pool.has(match.championName)) {
        // 如果是第一次见，创建“空”数据
        pool.set(match.championName, {
          name: match.championName,
          icon: match.championName === "Volibear" ? "🐻" : (match.championName === "Kayn" ? "🔥" : (match.championName ==="Riven" ? "⚔️" : "❓")), // (我们明天再来修复这个)
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          cs: 0,
          vision: 0,
        });
      }

      // 聚合数据
      const stats = pool.get(match.championName);
      stats.games += 1;
      if (match.win) stats.wins += 1;
      stats.kills += match.kills;
      stats.deaths += match.deaths;
      stats.assists += match.assists;
      stats.cs += match.cs;
      stats.vision += match.visionScore;
    }

    // 把 Map 转换成“排序后”的数组
    const sortedPool = Array.from(pool.values());
    sortedPool.sort((a, b) => b.games - a.games); // 按“比赛场数”排序
    return sortedPool;

  }, [report.matchHistory]); // (只有当 report 改变时才重新计算)

  // --- 2. [“稳赢”的 V7.2] “状态”管理 (我们正在看哪个英雄？) ---
  // (默认选中“英雄池”里的第一个英雄)
  const [selectedChampion, setSelectedChampion] = useState(championPool[0]?.name || null);

  // --- 3. [“稳赢”的 V7.2] “过滤”出我们要的比赛！ ---
  const filteredMatches = useMemo(() => {
    return report.matchHistory.filter(match => match.championName === selectedChampion);
  }, [selectedChampion, report.matchHistory]); // (只有当“选中的英雄”改变时才重新过滤)

  return (
    <div className="text-white p-4 border border-yellow-500/30 rounded-lg bg-black/30 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400 font-mono uppercase tracking-wider"
          style={{textShadow: '0 0 10px #ffff00'}}>
        [Tab 3: CHAMPIONS]
      </h2>

      {/* --- [V7.0 蓝图] “4 列表格” (1-Sidebar, 3-Main) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* --- A. [V7.0 蓝图] 左侧：英雄选择器 (1/4) --- */}
        <div className="lg:col-span-1 h-[600px] overflow-y-auto space-y-2 pr-2">
          {championPool.map((champ) => (
            <ChampionButton
              key={champ.name}
              championName={champ.name}
              championIcon={champ.icon}
              games={champ.games}
              winRate={((champ.wins / champ.games) * 100).toFixed(0)}
              onClick={() => setSelectedChampion(champ.name)}
              isActive={selectedChampion === champ.name}
            />
          ))}
        </div>

        {/* --- B. [V7.0 蓝图] 右侧：详细分析 (3/4) --- */}
        <div className="lg:col-span-3 h-[600px] overflow-y-auto space-y-4 pr-2">

          {/* --- B-1. [V7.0 蓝图] “霓虹”标题 --- */}
          <div className="flex items-center space-x-4 p-4 bg-space-light rounded-sm border-2 border-cyber-yellow/30">
            <span className="text-6xl">{championPool.find(c => c.name === selectedChampion)?.icon}</span>
            <div>
              <h3 className="text-4xl font-bold text-cyber-yellow" style={{textShadow: '0 0 10px #ffff00'}}>
                {selectedChampion}
              </h3>
              <p className="font-mono text-cyber-gray-light">
                ANALYZING {filteredMatches.length} MATCHES...
              </p>
            </div>
          </div>

          {/* --- B-2. [V7.0 蓝图] “匹配”的比赛列表！ --- */}
          <div className="space-y-2">
            {filteredMatches.map((match, index) => (
              <CyberMatchCard 
                key={match.matchId} 
                match={match} 
                gameNumber={filteredMatches.length - index} 
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}