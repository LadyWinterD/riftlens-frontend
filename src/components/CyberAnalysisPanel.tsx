import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { postStatefulChatMessage } from '@/services/awsService';

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
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // 当 playerData 加载时，自动请求 AI 分析
  useEffect(() => {
    if (playerData && !aiGeneratedData && !isLoadingAI) {
      generateAIAnalysis();
    }
  }, [playerData]);

  // 调用 AI 生成分析
  const generateAIAnalysis = async () => {
    if (!playerData || !playerData.annualStats) return;

    setIsLoadingAI(true);
    setLoadingProgress(0);
    
    let progressInterval: NodeJS.Timeout | null = null;
    let messageInterval: NodeJS.Timeout | null = null;
    
    try {
      // 模拟进度条
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);

      // 搞笑加载文本
      const funnyMessages = [
        '🔍 Scanning your embarrassing match history...',
        '😱 Found your 0/10 game... analyzing...',
        '🤔 Calculating how many times you died to jungle camps...',
        '💀 Counting your "tactical deaths"...',
        '🎯 Measuring your skill... still measuring...',
        '🧠 AI is laughing at your builds...',
        '📊 Crunching numbers... and your ego...',
        '🔥 Roasting your gameplay... please wait...',
      ];
      
      let messageIndex = 0;
      setLoadingMessage(funnyMessages[0]);
      messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % funnyMessages.length;
        setLoadingMessage(funnyMessages[messageIndex]);
      }, 2000);
      const stats = playerData.annualStats;
      const winRate = (Number(stats.winRate) * 100).toFixed(0);
      const kda = Number(stats.avgKDA || 0).toFixed(2);
      const csPerMin = Number(stats.avgCsPerMin || 0).toFixed(1);
      const visionPerMin = Number(stats.avgVisionPerMin || 0).toFixed(2);
      const topChamps = Object.entries(stats.championCounts || {}).slice(0, 3);

      const analysisQuestion = `Provide a NEURAL ANALYSIS CORE report for this player's overall performance:

ANNUAL STATISTICS:
- Win Rate: ${winRate}%
- Average KDA: ${kda}
- CS per minute: ${csPerMin}
- Vision per minute: ${visionPerMin}
- Total Games: ${stats.totalGames || 0}
- Top Champions: ${topChamps.map(([name, games]) => `${name} (${games} games)`).join(', ')}

Provide analysis in 3 categories:

### STRENGTHS
List 2-4 things the player does well. Use emojis and be encouraging but honest.

### WEAKNESSES  
List 2-4 areas that need improvement. Be brutally honest and funny. Use emojis.

### AI INSIGHTS
Provide 3-4 actionable recommendations. Be specific and use emojis.

Use lots of emojis, ALL CAPS for emphasis, and make it engaging and colorful!`;

      const aiResponse = await postStatefulChatMessage(
        playerData.PlayerID,
        analysisQuestion,
        [],
        playerData
      );

      // 解析 AI 回复为三个类别
      const parsed = parseAIResponse(aiResponse);
      
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
      setLoadingProgress(100);
      setLoadingMessage('✅ Analysis complete!');
      
      // 短暂延迟后显示结果
      setTimeout(() => {
        setAiGeneratedData(parsed);
        setIsLoadingAI(false);
      }, 500);
    } catch (error) {
      console.error('Failed to generate AI analysis:', error);
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
      setLoadingMessage('❌ AI failed... using backup roasts');
      // 如果失败，使用默认数据
      setTimeout(() => {
        setAiGeneratedData(null);
        setIsLoadingAI(false);
      }, 1000);
    }
  };

  // 解析 AI 回复
  const parseAIResponse = (text: string) => {
    console.log('[CyberAnalysisPanel] Parsing AI response:', text.substring(0, 300));
    
    const result: any = {
      strengths: { items: [] },
      weaknesses: { items: [] },
      insights: { items: [] }
    };

    // 按 ### 分割章节
    const sections = text.split(/###\s+/g).filter(s => s.trim());
    
    sections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(l => l.trim());
      if (lines.length === 0) return;

      const sectionTitle = lines[0].trim();
      const sectionContent = lines.slice(1).join('\n').trim();
      
      // 提取章节标题（去除 emoji 和特殊字符）
      const titleClean = sectionTitle.replace(/[📊🏆🎯👁️⚔️🌾📈💀🐻😱💰🛡️📉]/g, '').trim().toUpperCase();
      
      console.log(`[CyberAnalysisPanel] Section ${index}: "${titleClean}"`);

      // 简单直接的匹配
      if (titleClean.includes('STRENGTH')) {
        result.strengths.items.push({ 
          title: 'Performance Highlights', 
          text: sectionContent 
        });
      } else if (titleClean.includes('WEAKNESS')) {
        result.weaknesses.items.push({ 
          title: 'Areas to Improve', 
          text: sectionContent 
        });
      } else if (titleClean.includes('INSIGHT') || titleClean.includes('RECOMMENDATION')) {
        result.insights.items.push({ 
          title: 'AI Recommendations', 
          text: sectionContent 
        });
      } else {
        // 如果标题不明确，根据内容判断
        const contentUpper = sectionContent.toUpperCase();
        if (contentUpper.includes('[CRITICAL]') || contentUpper.includes('[WARNING]')) {
          result.weaknesses.items.push({ 
            title: sectionTitle.replace(/[📊🏆🎯👁️⚔️🌾📈💀🐻😱💰🛡️📉]/g, '').trim(), 
            text: sectionContent 
          });
        } else if (contentUpper.includes('[SUGGESTION]')) {
          result.insights.items.push({ 
            title: sectionTitle.replace(/[📊🏆🎯👁️⚔️🌾📈💀🐻😱💰🛡️📉]/g, '').trim(), 
            text: sectionContent 
          });
        } else {
          result.strengths.items.push({ 
            title: sectionTitle.replace(/[📊🏆🎯👁️⚔️🌾📈💀🐻😱💰🛡️📉]/g, '').trim(), 
            text: sectionContent 
          });
        }
      }
    });

    // 如果某个类别为空，添加占位符
    if (result.strengths.items.length === 0) {
      result.strengths.items.push({ 
        title: 'Analyzing Performance...', 
        text: '🔍 AI is analyzing your strengths across all games...' 
      });
    }
    if (result.weaknesses.items.length === 0) {
      result.weaknesses.items.push({ 
        title: 'Analyzing Weaknesses...', 
        text: '🔍 AI is identifying areas for improvement...' 
      });
    }
    if (result.insights.items.length === 0) {
      result.insights.items.push({ 
        title: 'Generating Insights...', 
        text: '🔍 AI is creating personalized recommendations...' 
      });
    }

    console.log('[CyberAnalysisPanel] Parsed result:', {
      strengths: result.strengths.items.length,
      weaknesses: result.weaknesses.items.length,
      insights: result.insights.items.length
    });

    return [
      { category: 'STRENGTHS', color: '#00ff00', icon: '▲', items: result.strengths.items },
      { category: 'WEAKNESSES', color: '#ff0000', icon: '▼', items: result.weaknesses.items },
      { category: 'AI INSIGHTS', color: '#ffff00', icon: '◆', items: result.insights.items }
    ];
  };

  // 渲染带特效的文本
  const renderStyledText = (text: string) => {
    // 先处理所有特殊标签
    const parts = text.split(/(<rainbow>.*?<\/rainbow>|<stat>.*?<\/stat>|<champion>.*?<\/champion>|<item>.*?<\/item>)/g);
    
    return parts.map((part, partIndex) => {
      // 彩虹标签
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
      
      // 统计数据标签 <stat>
      if (part.startsWith('<stat>') && part.endsWith('</stat>')) {
        const content = part.replace(/<\/?stat>/g, '');
        return (
          <motion.span
            key={partIndex}
            className="inline-block font-bold text-[#ffff00] px-1"
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
            {content}
          </motion.span>
        );
      }
      
      // 英雄名称标签 <champion>
      if (part.startsWith('<champion>') && part.endsWith('</champion>')) {
        const content = part.replace(/<\/?champion>/g, '');
        return (
          <motion.span
            key={partIndex}
            className="inline-block font-bold text-[#00ffff] px-1"
            style={{
              textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
            }}
            animate={{
              opacity: [1, 0.7, 1],
              textShadow: [
                '0 0 10px rgba(0, 255, 255, 0.8)',
                '0 0 20px rgba(0, 255, 255, 1)',
                '0 0 10px rgba(0, 255, 255, 0.8)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {content}
          </motion.span>
        );
      }
      
      // 装备名称标签 <item>
      if (part.startsWith('<item>') && part.endsWith('</item>')) {
        const content = part.replace(/<\/?item>/g, '');
        return (
          <motion.span
            key={partIndex}
            className="inline-block font-bold text-[#ff00ff] px-1"
            style={{
              textShadow: '0 0 10px rgba(255, 0, 255, 0.8)',
            }}
            animate={{
              opacity: [1, 0.8, 1],
              textShadow: [
                '0 0 10px rgba(255, 0, 255, 0.8)',
                '0 0 15px rgba(255, 0, 255, 1)',
                '0 0 10px rgba(255, 0, 255, 0.8)',
              ],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
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

  // 使用 AI 生成的数据（如果有），否则使用本地生成或默认数据
  const displayData = aiGeneratedData || (playerData ? generateRoastAnalysis() : analysisData);

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
            <div className={`w-2 h-2 rounded-full animate-pulse ${isLoadingAI ? 'bg-[#ffff00]' : 'bg-[#00ff00]'}`}></div>
            <span className={`text-xs font-mono ${isLoadingAI ? 'text-[#ffff00]' : 'text-[#00ff00]'}`}>
              {isLoadingAI ? 'AI GENERATING...' : aiGeneratedData ? 'AI COMPLETE' : 'ANALYZING'}
            </span>
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
        {isLoadingAI ? (
          // AI 加载动画
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <motion.div
              className="text-6xl"
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
              }}
            >
              🧠
            </motion.div>
            
            <div className="w-full max-w-md space-y-4">
              <div className="text-center">
                <motion.p
                  className="text-[#00ffff] font-mono text-lg mb-2"
                  style={{ textShadow: '0 0 10px #00ffff' }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {loadingMessage}
                </motion.p>
              </div>
              
              {/* 进度条 */}
              <div className="relative w-full h-4 bg-[#1a1f3a] border-2 border-[#00ffff] overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#ffff00]"
                  style={{ 
                    width: `${loadingProgress}%`,
                    boxShadow: '0 0 20px rgba(0,255,255,0.8)'
                  }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-mono font-bold z-10">
                    {Math.round(loadingProgress)}%
                  </span>
                </div>
              </div>
              
              {/* 搞笑提示 */}
              <div className="text-center space-y-1">
                <motion.p
                  className="text-[#666] text-xs font-mono"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  &gt; Analyzing your questionable decisions...
                </motion.p>
                <motion.p
                  className="text-[#666] text-xs font-mono"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                >
                  &gt; Preparing brutal honesty...
                </motion.p>
                <motion.p
                  className="text-[#666] text-xs font-mono"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
                >
                  &gt; Loading roast database...
                </motion.p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
          {displayData[activeCategory].items.map((item: any, idx: number) => (
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
