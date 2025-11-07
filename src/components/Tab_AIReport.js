// [关键] 告诉 Next.js 这是客户端组件
"use client";

// [关键] 导入我们 Day 5 安装的“肌肉” (Recharts)！
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- [V7.0 蓝图!] “CyberStatCard” (霓虹统计卡片) 子组件 ---
// [“稳赢”的 V7.2!] 我们把它“导出”(export)！
export function CyberStatCard_V2_Small({ title, value, unit, color }) {
  const colorVariants = {
    cyan: { text: 'text-cyber-cyan', shadow: 'shadow-neon-cyan', border: 'border-cyber-cyan/30' },
    magenta: { text: 'text-cyber-magenta', shadow: 'shadow-neon-magenta', border: 'border-cyber-magenta/30' },
    yellow: { text: 'text-cyber-yellow', shadow: 'shadow-neon-yellow', border: 'border-cyber-yellow/30' },
    green: { text: 'text-cyber-green', shadow: 'shadow-[0_0_10px_#00ff00]', border: 'border-cyber-green/30' },
  };
  const selectedColor = colorVariants[color] || colorVariants.cyan;

  return (
    <div 
      className={`bg-space-light p-4 border-2 ${selectedColor.border} rounded-sm 
                  hover:${selectedColor.shadow} transition-shadow duration-300`}
    >
      <p className={`text-sm font-mono uppercase tracking-wider text-cyber-gray-light`}>{title}</p>
      <p className={`text-4xl font-bold ${selectedColor.text}`} style={{textShadow: `0 0 10px var(--color-${color})`}}>
        {value} <span className="text-base font-normal text-cyber-gray">{unit}</span>
      </p>
    </div>
  );
}


export default function AIReportTab({ report }) {
  // --- 1. [V7.0 蓝图!] “AI 分析面板”的内部标签页状态 ---
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('strengths');

  // --- 2. [V21.2 终极 Bug 修复!] ---
  // (我们 100% 必须从“正确”的键读取，并 100% 添加“安全保护”！)
  const aiReportString = report.aiAnalysis_DefaultRoast || ""; 
  const aiReportParts = aiReportString.split(/\n\n(?!\[)/);
  
  const strengths = aiReportParts[1] || "AI STRENGTHS ANALYSIS PENDING...";
  const roast = aiReportParts[2] || "AI WEAKNESS ANALYSIS PENDING...";
  const caseStudy = aiReportParts[3] || "AI CASE STUDY PENDING...";
  
  // --- 3. 准备“Top 3 英雄”图表数据 ---
  const championData = Object.entries(report.annualStats.championCounts).map(([name, count]) => ({
    name: name, "Games": count,
  }));

  // --- 4. [“稳赢” V7.2] UI 界面！ ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* --- A. “年度平均值”仪表盘 (V7.0 蓝图) --- */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <CyberStatCard_V2_Small 
          title="Annual KDA"
          value={parseFloat(report.annualStats.avgKDA).toFixed(2)} 
          unit="" 
          color="cyan"
        />
        <CyberStatCard_V2_Small 
          title="Annual Win Rate"
          value={(parseFloat(report.annualStats.winRate) * 100).toFixed(0)} 
          unit="%" 
          color="magenta"
        />
        <CyberStatCard_V2_Small 
          title="Avg. CS/min"
          value={parseFloat(report.annualStats.avgCsPerMin).toFixed(1)} 
          unit="cs/m" 
          color="yellow"
        />
        <CyberStatCard_V2_Small 
          title="Avg. Vision/min"
          value={parseFloat(report.annualStats.avgVisionPerMin).toFixed(1)} 
          unit="vis/m" 
          color="green"
        />
      </div>

      {/* --- B. “AI 分析面板” (V7.0 蓝图) --- */}
      <div className="lg:col-span-2 bg-space-light p-6 border-2 border-cyber-cyan/30 rounded-sm">
        <h3 className="text-2xl font-bold font-mono uppercase tracking-wider text-cyber-cyan mb-4" 
            style={{textShadow: '0 0 10px #00ffff'}}>
          [ NEURAL ANALYSIS CORE ]
        </h3>
        
        <div className="flex mb-4 border-b border-cyber-gray/20">
          <button 
            onClick={() => setActiveAnalysisTab('strengths')}
            className={`font-mono uppercase px-4 py-2 ${activeAnalysisTab === 'strengths' ? 'text-cyber-green border-b-2 border-cyber-green' : 'text-cyber-gray hover:text-white'}`}
          >
            STRENGTHS ▲
          </button>
          <button 
            onClick={() => setActiveAnalysisTab('weaknesses')}
            className={`font-mono uppercase px-4 py-2 ${activeAnalysisTab === 'weaknesses' ? 'text-cyber-red border-b-2 border-cyber-red' : 'text-cyber-gray hover:text-white'}`}
          >
            WEAKNESSES ▼
          </button>
          <button 
            onClick={() => setActiveAnalysisTab('insights')}
            className={`font-mono uppercase px-4 py-2 ${activeAnalysisTab === 'insights' ? 'text-cyber-yellow border-b-2 border-cyber-yellow' : 'text-cyber-gray hover:text-white'}`}
          >
            AI INSIGHTS ◆
          </button>
        </div>
        
        <div className="h-96 overflow-y-auto pr-2">
          {activeAnalysisTab === 'strengths' && (
            <p className="text-cyber-gray-light whitespace-pre-line font-mono">{strengths}</p>
          )}
          {activeAnalysisTab === 'weaknesses' && (
            <p className="text-cyber-gray-light whitespace-pre-line font-mono">{roast}</p>
          )}
          {activeAnalysisTab === 'insights' && (
            <p className="text-cyber-gray-light whitespace-pre-line font-mono">{caseStudy}</p>
          )}
        </div>
      </div>
        
      {/* --- C. “Top 3 英雄”图表 (V7.0 蓝图) --- */}
      <div className="lg:col-span-1 bg-space-light p-6 border-2 border-cyber-magenta/30 rounded-sm">
        <h3 className="text-2xl font-bold font-mono uppercase tracking-wider text-cyber-magenta mb-4"
            style={{textShadow: '0 0 10px #ff00ff'}}>
          [ TOP 3 CHAMPIONS ]
        </h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={championData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#aaaaaa" />
              <Tooltip 
                wrapperStyle={{ backgroundColor: '#0a0e27', border: '1px solid #666' }} 
                contentStyle={{ backgroundColor: '#0a0e27' }}
                labelStyle={{ color: '#00ffff' }}
              />
              <Bar dataKey="Games" fill="#ff00ff" background={{ fill: '#1a1f3a' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}