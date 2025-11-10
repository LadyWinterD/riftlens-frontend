import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
import { motion } from 'framer-motion';

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

  // 渲染带特效的文本
  const renderStyledText = (text: string) => {
    // 先处理彩虹标签
    const parts = text.split(/(<rainbow>.*?<\/rainbow>)/g);
    
    return parts.map((part, partIndex) => {
      if (part.startsWith('<rainbow>') && part.endsWith('</rainbow>')) {
        const content = part.replace(/<\/?rainbow>/g, '');
        return (
          <motion.span
            key={partIndex}
            className="inline-block font-bold"
            style={{
              background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{
              backgroundPosition: ['0% center', '200% center'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {content}
          </motion.span>
        );
      }
      
      // 处理普通文本中的数字和全大写词
      const tokens = part.split(/(\d+\.?\d*%?|\b[A-Z]{2,}\b)/g);
      
      return tokens.map((token, tokenIndex) => {
        // 数字 - 黄色发光效果
        if (/^\d+\.?\d*%?$/.test(token)) {
          return (
            <motion.span
              key={`${partIndex}-${tokenIndex}`}
              className="inline-block font-bold text-[#ffff00]"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 0, 0.8)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                textShadow: [
                  '0 0 10px rgba(255, 255, 0, 0.8)',
                  '0 0 20px rgba(255, 255, 0, 1)',
                  '0 0 10px rgba(255, 255, 0, 0.8)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {token}
            </motion.span>
          );
        }
        
        // 全大写词（至少2个字母）
        if (/^[A-Z]{2,}$/.test(token)) {
          // 强调词 - 红色闪烁效果
          const emphasisWords = ['FREE', 'NOT', 'STOP', 'ALL', 'NEVER', 'ALWAYS', 'EVERY', 'NO', 'YES', 'MUST', 'DONT'];
          const isEmphasis = emphasisWords.includes(token);
          
          if (isEmphasis) {
            return (
              <motion.span
                key={`${partIndex}-${tokenIndex}`}
                className="inline-block font-bold text-[#ff0000]"
                style={{
                  textShadow: '0 0 10px rgba(255, 0, 0, 0.8)',
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  textShadow: [
                    '0 0 10px rgba(255, 0, 0, 0.8)',
                    '0 0 20px rgba(255, 0, 0, 1)',
                    '0 0 10px rgba(255, 0, 0, 0.8)',
                  ],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {token}
              </motion.span>
            );
          }
          
          // 普通大写词 - 青色闪烁效果
          return (
            <motion.span
              key={`${partIndex}-${tokenIndex}`}
              className="inline-block font-bold text-[#00ffff]"
              style={{
                textShadow: '0 0 8px rgba(0, 255, 255, 0.6)',
              }}
              animate={{
                opacity: [1, 0.7, 1],
                textShadow: [
                  '0 0 8px rgba(0, 255, 255, 0.6)',
                  '0 0 15px rgba(0, 255, 255, 1)',
                  '0 0 8px rgba(0, 255, 255, 0.6)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {token}
            </motion.span>
          );
        }
        
        return <span key={`${partIndex}-${tokenIndex}`}>{token}</span>;
      });
    });
  };

  // 生成搞笑毒舌的分析
  const generateRoastAnalysis = () => {
    if (!playerData || !playerData.annualStats) {
      return analysisData; // 返回默认数据
    }

    const stats = playerData.annualStats;
    const winRate = (Number(stats.winRate) * 100).toFixed(0);
    const kda = Number(stats.avgKDA || 0).toFixed(2);
    const csPerMin = Number(stats.avgCsPerMin || 0).toFixed(1);
    const visionPerMin = Number(stats.avgVisionPerMin || 0).toFixed(2);
    const topChamps = Object.entries(stats.championCounts || {}).slice(0, 3);

    const strengths = [];
    const weaknesses = [];
    const insights = [];

    // STRENGTHS - 搞笑夸奖
    if (Number(stats.winRate) >= 0.55) {
      strengths.push({
        title: '🎉 ACTUALLY WINNING GAMES',
        text: `${winRate}% win rate? NOT BAD! 😎 You're not <rainbow>completely hopeless</rainbow>. Keep it up and maybe you'll hit GOLD someday... in 2030. 🚀`
      });
    } else if (Number(stats.winRate) >= 0.50) {
      strengths.push({
        title: '⚖️ PERFECTLY BALANCED',
        text: `${winRate}% win rate. CONGRATULATIONS on being the definition of <rainbow>"average"</rainbow>. 😴 At least you're CONSISTENT at being <rainbow>mediocre</rainbow>! 🎯`
      });
    }

    if (Number(stats.avgKDA) >= 3.0) {
      strengths.push({
        title: '⚔️ KDA WARRIOR',
        text: `${kda} KDA - <rainbow>Impressive</rainbow>! 🌟 Either you're ACTUALLY GOOD, or you're a <rainbow>master</rainbow> at stealing kills and running away. 🏃 I'm betting on the LATTER. 😏`
      });
    }

    if (topChamps.length > 0) {
      const [champName, games] = topChamps[0];
      strengths.push({
        title: '🐴 ONE-TRICK PONY',
        text: `${games} games on ${champName}. WOW, you really can't play anything else, can you? 🤔 At least you found ONE champion you don't <rainbow>int</rainbow> on. 🎮`
      });
    }

    // WEAKNESSES - 毒舌吐槽
    if (Number(stats.avgCsPerMin) < 6.0) {
      weaknesses.push({
        title: '🌾 FARMING DISASTER',
        text: `${csPerMin} CS/min? 😱 Are you playing LEAGUE or playing <rainbow>hide-and-seek</rainbow> with the minions? 🙈 Even my GRANDMA farms better than this! 👵`
      });
    }

    if (Number(stats.avgVisionPerMin) < 1.0) {
      weaknesses.push({
        title: '🦇 BLIND AS A BAT',
        text: `${visionPerMin} vision/min. 👀 Do you know what WARDS are? Or do you think the map is just <rainbow>decorative</rainbow>? 🎨 Buy some glasses AND some wards! 👓`
      });
    }

    if (Number(stats.winRate) < 0.50) {
      weaknesses.push({
        title: '😭 PROFESSIONAL LOSER',
        text: `${winRate}% win rate. You LOSE more than you WIN. 📉 Maybe try playing a different game? Like <rainbow>Solitaire</rainbow>. 🃏 You can't blame TEAMMATES there. 🤷`
      });
    }

    if (Number(stats.avgKDA) < 2.0) {
      weaknesses.push({
        title: '💀 DEATH SPEEDRUN',
        text: `${kda} KDA. Are you trying to set a <rainbow>world record</rainbow> for most deaths? 🏆 Because you're doing GREAT at that! Maybe try staying <rainbow>alive</rainbow>? 🙏`
      });
    }

    // AI INSIGHTS - 搞笑建议
    insights.push({
      title: '🛑 PRIORITY #1: STOP DYING',
      text: `SERIOUSLY. 😤 Just... STOP running into 5 enemies. It's not <rainbow>brave</rainbow>, it's <rainbow>stupid</rainbow>. 🤦 Your team is TIRED of watching gray screens because of you. 👻`
    });

    insights.push({
      title: '👁️ WARD PLACEMENT 101',
      text: `Wards are FREE after you back. 🆓 F-R-E-E. USE THEM! The map has MORE than just your lane, I promise. 🗺️ EXPLORE it. With WARDS. 💡`
    });

    insights.push({
      title: '💰 CS IS GOLD, GOLD IS ITEMS',
      text: `EVERY minion you miss is crying. 😢 And so is your wallet. HIT the minions. ALL of them. It's NOT that hard. Right click. BOOM. <rainbow>Gold</rainbow>. ✨`
    });

    insights.push({
      title: '📺 MAYBE WATCH A GUIDE?',
        text: `YOUTUBE exists. 🎥 GUIDES exist. PRO players exist. LEARN from them. 🧠 Or keep doing whatever you're doing and stay <rainbow>hardstuck</rainbow>. 🪨 YOUR CHOICE! 🤷`
    });

    return [
      { category: 'STRENGTHS', color: '#00ff00', icon: '▲', items: strengths.length > 0 ? strengths : [{ title: 'SEARCHING...', text: 'Still looking for strengths... This might take a while.' }] },
      { category: 'WEAKNESSES', color: '#ff0000', icon: '▼', items: weaknesses.length > 0 ? weaknesses : [{ title: 'TOO MANY TO LIST', text: 'Where do I even start? Everything needs work, buddy.' }] },
      { category: 'AI INSIGHTS', color: '#ffff00', icon: '◆', items: insights }
    ];
  };

  const displayData = playerData ? generateRoastAnalysis() : analysisData;

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
        <div className="space-y-4">
          {displayData[activeCategory].items.map((item, idx) => (
              <div
                key={idx}
                className="relative bg-[#0a0e27]/60 border-l-2 p-4 group hover:bg-[#0a0e27]/80 transition-all"
                style={{ borderLeftColor: displayData[activeCategory].color }}
              >
                {/* Corner accent */}
                <div 
                  className="absolute top-0 right-0 w-0 h-0 border-t-4 border-r-4 opacity-0 group-hover:opacity-50 transition-opacity"
                  style={{
                    borderTopColor: displayData[activeCategory].color,
                    borderRightColor: displayData[activeCategory].color
                  }}
                ></div>

                <div className="flex items-start gap-3">
                  <div 
                    className="text-xl mt-1 filter"
                    style={{ filter: `drop-shadow(0 0 5px ${displayData[activeCategory].color})` }}
                  >
                    {displayData[activeCategory].icon}
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="uppercase tracking-wider text-sm mb-2 font-mono"
                      style={{ 
                        color: displayData[activeCategory].color,
                        textShadow: `0 0 5px ${displayData[activeCategory].color}`
                      }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-[#aaa] text-sm leading-relaxed font-mono">
                      {renderStyledText(item.text)}
                    </p>
                  </div>
                </div>

                {/* Data stream animation */}
                <div 
                  className="absolute right-2 top-2 text-xs opacity-0 group-hover:opacity-30 font-mono transition-opacity"
                  style={{ color: displayData[activeCategory].color }}
                >
                  [DATA_#{idx + 1}]
                </div>
              </div>
            ))}
          </div>
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
