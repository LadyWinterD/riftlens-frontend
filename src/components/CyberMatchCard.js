// [V21.4 终极修复版]
// 修复了: .toFixed() Bug
// 新增了: 100%“在线” Data Dragon 英雄图标！

import Image from 'next/image'; // <-- [V21.4 终极新增！] 100% 导入 Next.js“图片”组件！

// 这是一个“共享”组件，所以我们 100% 导出它
export default function CyberMatchCard({ match, gameNumber }) {
  
  // --- 1. [V7.0 蓝图] 设置“胜利/失败”的霓虹颜色 ---
  const win = match.win;
  const borderColor = win ? 'border-cyber-green' : 'border-cyber-red'; // 绿/红
  const textColor = win ? 'text-cyber-green' : 'text-cyber-red';

  // --- 2. [V21.4 终极新增！] “Data Dragon” 100%“在线”图标！ ---
  // (我们 100%“假设” Data Dragon 的“最新”版本是 14.21.1)
  // (我们 100%“假设” Riot API 返回的 'championName' 100% 是“Fiddlesticks”, “MonkeyKing”...)
  const championIconUrl = `https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${match.championName}.png`;


  return (
    <div 
      className={`flex items-center p-4 bg-space-light rounded-sm border-l-4 ${borderColor} 
                  border-y-2 border-r-2 border-y-gray-800 border-r-gray-800 
                  hover:bg-gray-900/50 transition-colors duration-300`}
    >
      {/* --- A. [V7.0 蓝图] 游戏编号 (等宽字体) --- */}
      <div className="w-10 font-mono text-cyber-gray text-lg">
        #{gameNumber}
      </div>

      {/* --- B. [V7.0 蓝图] 胜利/失败 (霓虹辉光) --- */}
      <div className={`w-16 text-center font-bold uppercase ${textColor}`} style={{ textShadow: `0 0 10px ${win ? '#00ff00' : '#ff0000'}` }}>
        {win ? "VICTORY" : "DEFEAT"}
      </div>

      {/* --- C. [V21.4 终极修复!] 英雄 (Data Dragon 图标！) --- */}
      <div className="w-32 flex items-center space-x-2">
        <Image 
          src={championIconUrl}
          alt={match.championName}
          width={40} // (100%“小”图标)
          height={40}
          className="rounded-sm border-2 border-cyber-cyan/30"
        />
        <span className="font-bold text-cyber-cyan-light">{match.championName}</span>
      </div>

      {/* --- D. [V7.0 蓝图] KDA (颜色编码) --- */}
      <div className="w-32 font-mono text-lg text-cyber-gray-light">
        <span className="text-cyber-green">{match.kills}</span> / 
        <span className="text-cyber-red"> {match.deaths} </span> / 
        <span className="text-cyber-yellow">{match.assists}</span>
        
        {/* --- [V21.3 终极 Bug 修复!] 100% 必须用“parseFloat”！ --- */}
        <p className="text-xs text-cyber-gray">{parseFloat(match.kda).toFixed(2)} KDA</p>
      </div>

      {/* --- E. [V7.0 蓝图] 数据 (等宽字体) --- */}
      <div className="w-48 font-mono text-cyber-gray-light grid grid-cols-2 gap-x-2">
        <div>
          <span className="text-xs text-cyber-gray">CS/min: </span>
          {parseFloat(match.csPerMin).toFixed(1)}
        </div>
        <div>
          <span className="text-xs text-cyber-gray">CS: </span>
          {match.cs}
        </div>
        <div>
          <span className="text-xs text-cyber-gray">Vision/min: </span>
          {parseFloat(match.visionPerMin).toFixed(1)}
        </div>
        <div>
          <span className="text-xs text-cyber-gray">Vision: </span>
          {match.visionScore}
        </div>
      </div>
      
      {/* --- F. [V21.4 “装备” Bug!] 100% 还是“空”的！ --- */}
      {/* (我们 100% 必须在“下一阶段”修复这个！) */}
      <div className="flex-1 flex space-x-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-10 h-10 bg-black/50 border border-cyber-gray/30 rounded-sm"></div>
        ))}
      </div>

    </div>
  );
}