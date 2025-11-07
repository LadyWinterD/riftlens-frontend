import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';

const analysisData = [
  {
    category: 'STRENGTHS',
    color: '#00ff00',
    icon: '▲',
    items: [
      { title: 'VISION MASTERY', text: '1.8 vision score/min - Top 15% of players. Excellent map awareness detected.' },
      { title: 'CHAMPION EXPERTISE', text: '127 games on Volibear with 58% win rate. Neural patterns show mastery achieved.' },
      { title: 'OBJECTIVE FOCUS', text: '73% dragon participation rate. Superior team coordination algorithms.' },
      { title: 'LATE GAME SCALING', text: 'KDA improves +32% after 25 minutes. Patience protocol: optimal.' }
    ]
  },
  {
    category: 'WEAKNESSES',
    color: '#ff0000',
    icon: '▼',
    items: [
      { title: 'FARMING DEFICIT', text: '5.2 CS/min at 10 minutes. Target: 6.5 CS/min. Recommendation: Training protocols.' },
      { title: 'POSITIONING ERROR', text: '43% deaths from solo positioning. Team synchronization required.' },
      { title: 'SUMMONER SPELL USAGE', text: 'Flash cooldown inefficiency: 7.3 min average. Optimal: 5.5 min usage rate.' },
      { title: 'BUILD ADAPTATION', text: 'Item diversity: 89% repetition. Database suggests exploring alternative builds.' }
    ]
  },
  {
    category: 'AI INSIGHTS',
    color: '#ffff00',
    icon: '◆',
    items: [
      { title: 'MATCH #87234 ANALYSIS', text: 'Volibear 14/2/11 - Baron steal at 3:24 created 87% win probability spike.' },
      { title: 'LEARNING MOMENT', text: 'Kayn 2/8/3 - Three 1v5 attempts detected. Red Kayn durability overestimated.' },
      { title: 'PRIORITY TARGET', text: 'Early CS improvement. +15 CS by 10min = +300g advantage. High impact/effort ratio.' },
      { title: 'BUILD OPTIMIZATION', text: 'Thornmail timing vs AD comps: Current +23% HP loss. Earlier purchase recommended.' }
    ]
  }
];

interface CyberAnalysisPanelProps {
  playerData?: any; // AWS playerData
}

export function CyberAnalysisPanel({ playerData }: CyberAnalysisPanelProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  // 如果有AWS数据，使用真实数据生成分析
  // 否则使用默认的Mock数据
  const aiAnalysisText = playerData?.AIReport || "No AI analysis available. Load player data to see insights.";

  return (
    <div className="bg-[#0a0e27]/80 border-2 border-[#00ffff]/30 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="border-b-2 border-[#00ffff]/30 p-6 bg-[#00ffff]/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl filter drop-shadow-[0_0_10px_#00ffff]">🧠</div>
            <div>
              <h2 className="text-2xl text-[#00ffff] uppercase tracking-wider"
                style={{ textShadow: '0 0 10px #00ffff' }}
              >
                Neural Analysis Core
              </h2>
              <p className="text-[#666] text-xs font-mono">AI-POWERED PERFORMANCE EVALUATION</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse"></div>
            <span className="text-[#00ff00] text-xs font-mono">ANALYZING</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 border-b-2 border-[#00ffff]/30">
        {analysisData.map((category, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(idx)}
            className={`p-4 uppercase tracking-wider text-sm font-mono transition-all relative ${
              activeCategory === idx
                ? 'bg-opacity-20'
                : 'opacity-50 hover:opacity-100'
            }`}
            style={{
              color: category.color,
              backgroundColor: activeCategory === idx ? category.color + '20' : 'transparent',
              borderBottom: activeCategory === idx ? `2px solid ${category.color}` : '2px solid transparent'
            }}
          >
            <span className="mr-2">{category.icon}</span>
            {category.category}
            {activeCategory === idx && (
              <div 
                className="absolute bottom-0 left-0 w-full h-px"
                style={{ 
                  background: `linear-gradient(90deg, transparent, ${category.color}, transparent)`,
                  boxShadow: `0 0 10px ${category.color}`
                }}
              ></div>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <ScrollArea className="h-[500px] p-6">
        {playerData ? (
          // 如果有AWS数据，显示AI报告
          <div className="relative bg-[#0a0e27]/60 border-l-2 border-[#00ffff] p-6">
            <div className="flex items-start gap-3">
              <div className="text-xl mt-1 filter drop-shadow-[0_0_5px_#00ffff]">
                🧠
              </div>
              <div className="flex-1">
                <h3 
                  className="uppercase tracking-wider text-sm mb-4 font-mono text-[#00ffff]"
                  style={{ textShadow: '0 0 5px #00ffff' }}
                >
                  AWS AI CHATBOT ANALYSIS
                </h3>
                <div className="text-[#aaa] text-sm leading-relaxed font-mono whitespace-pre-wrap">
                  {aiAnalysisText}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 没有数据时显示默认分析
          <div className="space-y-4">
            {analysisData[activeCategory].items.map((item, idx) => (
              <div
                key={idx}
                className="relative bg-[#0a0e27]/60 border-l-2 p-4 group hover:bg-[#0a0e27]/80 transition-all"
                style={{ borderLeftColor: analysisData[activeCategory].color }}
              >
                {/* Corner accent */}
                <div 
                  className="absolute top-0 right-0 w-0 h-0 border-t-4 border-r-4 opacity-0 group-hover:opacity-50 transition-opacity"
                  style={{
                    borderTopColor: analysisData[activeCategory].color,
                    borderRightColor: analysisData[activeCategory].color
                  }}
                ></div>

                <div className="flex items-start gap-3">
                  <div 
                    className="text-xl mt-1 filter"
                    style={{ filter: `drop-shadow(0 0 5px ${analysisData[activeCategory].color})` }}
                  >
                    {analysisData[activeCategory].icon}
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="uppercase tracking-wider text-sm mb-2 font-mono"
                      style={{ 
                        color: analysisData[activeCategory].color,
                        textShadow: `0 0 5px ${analysisData[activeCategory].color}`
                      }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-[#aaa] text-sm leading-relaxed font-mono">
                      {item.text}
                    </p>
                  </div>
                </div>

                {/* Data stream animation */}
                <div 
                  className="absolute right-2 top-2 text-xs opacity-0 group-hover:opacity-30 font-mono transition-opacity"
                  style={{ color: analysisData[activeCategory].color }}
                >
                  [DATA_#{idx + 1}]
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t-2 border-[#00ffff]/30 p-4 bg-[#00ffff]/5">
        <div className="flex items-center justify-between text-xs font-mono text-[#666]">
          <span>ANALYSIS TIMESTAMP: 2025-11-04 14:32:07</span>
          <span className="text-[#00ffff]">CONFIDENCE: 94.7%</span>
        </div>
      </div>
    </div>
  );
}
