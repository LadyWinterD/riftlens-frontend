"use client";

// [“稳赢”的 V7.2!] 我们现在导入“共享”的卡片！
import CyberMatchCard from './CyberMatchCard'; 

export default function MatchLogTab({ report }) {
  const matches = report.matchHistory || [];

  return (
    <div className="text-white p-4 border border-magenta-500/30 rounded-lg bg-black/30 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-4 text-magenta-400 font-mono uppercase tracking-wider"
          style={{textShadow: '0 0 10px #ff00ff'}}>
        [Tab 2: MATCH LOG]
      </h2>

      {/* [V7.0 蓝图] 可滚动的比赛列表 */}
      <div className="space-y-2 h-[600px] overflow-y-auto pr-2">
        {matches.map((match, index) => (
          <CyberMatchCard 
            key={match.matchId} 
            {...match}
            matchData={match}
            gameNumber={matches.length - index} 
          />
        ))}
      </div>
    </div>
  );
}