"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // [V21] 切换到 framer-motion (Next.js 标配)
import { AIDeepAnalysis } from './AIDeepAnalysis'; // [V21 修复] 使用命名导出
import { postStatefulChatMessage, type ChatMessage } from '@/services/awsService';

import CyberChatMessage from './CyberChatMessage';
import CyberTypingIndicator from './CyberTypingIndicator';
import MainAIButton from './MainAIButton';
import SubAIModule from './SubAIModule';


// AI Personalities (您的 Figma 蓝图 - 保持不变)
const AI_PERSONALITIES = {
  main: {
    name: 'RIFT-CORE',
    color: '#00ffff',
    icon: '🤖',
    // [V21] 我们只保留“问题” (答案将由 AI 实时生成)
    responses: [
      { q: 'Full system diagnostic' },
      { q: 'Performance summary' },
      { q: 'Champion pool analysis' },
      { q: 'What am I doing wrong?' },
    ]
  },
  combat: {
    name: 'WAR-PROTOCOL',
    color: '#ff0000',
    icon: '⚔️',
    personality: 'Aggressive combat advisor',
    messages: [
      'ALERT: Your kill participation too low! More fights = more wins!',
      'CRITICAL: Stop playing scared. Press your advantage!',
      'COMBAT ANALYSIS: You backed off 3 winnable fights. ENGAGE MORE!',
      'WARNING: Enemy jungler out-pressured you. Assert dominance!',
    ]
  },
  strategy: {
    name: 'LOGIC-ENGINE',
    color: '#ffff00',
    icon: '🧠',
    personality: 'Strategic analysis unit',
    messages: [
      'CALCULATION: Your farm efficiency decreased 18% after 15 minutes.',
      'OBSERVATION: 4 deaths were avoidable with better map awareness.',
      'DATA POINT: Vision control improved +23% but still below optimal.',
      'STRATEGIC NOTE: Objective priority correct but execution timing off by 12 seconds average.',
    ]
  }
};

// Glitch text effect (您的 Figma 蓝图 - 保持不变)
const GlitchText = ({ children, isGlitching }: { children: string; isGlitching: boolean }) => {
  if (!isGlitching) return <>{children}</>;
  return (
    <motion.span
      animate={{ x: [0, -2, 2, -1, 1, 0], opacity: [1, 0.8, 1, 0.7, 1] }}
      transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
      className="inline-block"
    >
      {children}
    </motion.span>
  );
};

interface RiftAIProps {
  playerData?: any; // AWS playerData (来自 V21 page.js)
}

// [!! V21 重构 !!]
// 您的 AI 核心组件，现已 100% 兼容 V21 架构
export function RiftAI({ playerData }: RiftAIProps) {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Deep analysis state (保持不变)
  const [deepAnalysisOpen, setDeepAnalysisOpen] = useState(false);
  const [deepAnalysisType, setDeepAnalysisType] = useState<'diagnostic' | 'performance' | 'champion' | 'mistakes' | null>(null);
  
  // [V21 关键状态]
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customQuestion, setCustomQuestion] = useState(''); // (仅用于输入框)

  // Sub-AI states (您的 Figma 蓝图 - 保持不变)
  const [combatAIVisible, setCombatAIVisible] = useState(false);
  const [strategyAIVisible, setStrategyAIVisible] = useState(false);
  const [combatMessage, setCombatMessage] = useState('');
  const [strategyMessage, setStrategyMessage] = useState('');

  // Glitch effect trigger (您的 Figma 蓝图 - 保持不变)
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 500);
    }, 8000 + Math.random() * 4000);
    return () => clearInterval(glitchInterval);
  }, []);

  // Random sub-AI appearances (您的 Figma 蓝图 - 保持不变)
  useEffect(() => {
    if (!playerData) return; // (V21: 仅在加载数据后才显示)
    
    const showSubAI = () => {
      const rand = Math.random();
      if (rand > 0.7) {
        const msg = AI_PERSONALITIES.combat.messages[Math.floor(Math.random() * AI_PERSONALITIES.combat.messages.length)];
        setCombatMessage(msg);
        setCombatAIVisible(true);
        setTimeout(() => setCombatAIVisible(false), 6000);
      } else if (rand > 0.4) {
        const msg = AI_PERSONALITIES.strategy.messages[Math.floor(Math.random() * AI_PERSONALITIES.strategy.messages.length)];
        setStrategyMessage(msg);
        setStrategyAIVisible(true);
        setTimeout(() => setStrategyAIVisible(false), 6000);
      }
    };
    const interval = setInterval(showSubAI, 15000 + Math.random() * 10000);
    setTimeout(showSubAI, 5000);
    return () => clearInterval(interval);
  }, [playerData]); // (V21: 依赖 playerData)

  // [!! V21 关键 !!]
  // 当 'playerData' 从 page.js 传入时，初始化聊天
  useEffect(() => {
    if (playerData && playerData.aiAnalysis_DefaultRoast) {
      // 使用“预生成”的报告作为 AI 的第一句话 (开场白)
      setChatHistory([
        { role: 'assistant', content: playerData.aiAnalysis_DefaultRoast }
      ]);
      setIsMainOpen(true); // 自动打开聊天窗口
    }
  }, [playerData]); // 依赖于 'playerData' prop

  // [!! V21 核心 !!]
  // V21 的“主发送函数” (同时处理“预设”和“自由”聊天)
  const handleSendMessage = async (message: string) => {
    if (isProcessing || !message || !playerData) return;

    // 1. 立即将用户消息添加到 UI
    const newUserMessage: ChatMessage = { role: 'user', content: message };
    const updatedHistory = [...chatHistory, newUserMessage]; 
    setChatHistory(updatedHistory);
    setCustomQuestion(''); // 清空输入框

    // 2. 设置加载状态
    setIsProcessing(true);

    try {
      // 3. [!! 核心 V21 !!] 调用我们的 "有状态" 聊天 API
      const aiResponse = await postStatefulChatMessage(
        playerData.PlayerID, // 发送 PlayerID (PUUID)
        message,
        updatedHistory // [!! 关键 !!] 发送完整聊天记录
      );

      // 4. [成功] 将 AI 回答添加到 UI
      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: aiResponse }
      ]);

    } catch (error: any) {
      // 5. [失败] 在聊天窗口中显示错误
      setChatHistory([
        ...updatedHistory,
        { role: 'error', content: `[AI OFFLINE] ${error.message}` }
      ]);
    } finally {
      // 6. 移除加载状态
      setIsProcessing(false);
    }
  };

  // [V21] 预设问题 (现在调用 *真实* AI)
  const handleQuestionClick = (index: number) => {
    const question = AI_PERSONALITIES.main.responses[index].q;
    handleSendMessage(question);
  };
  
  // [V21] 自由聊天 (现在调用 *真实* AI)
  const handleCustomQuestionSubmit = () => {
    handleSendMessage(customQuestion);
  };

  // [V1 - 保持不变] 深度分析
  const handleQuestionDoubleClick = (index: number) => {
    const analysisTypes: ('diagnostic' | 'performance' | 'champion' | 'mistakes')[] = [
      'diagnostic', 'performance', 'champion', 'mistakes'
    ];
    setDeepAnalysisType(analysisTypes[index]);
    setDeepAnalysisOpen(true);
  };

  // [V1 - 保持不变] 按 Enter 键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomQuestionSubmit();
    }
  };

  // [V21] 如果没有数据，此组件不显示任何内容
  if (!playerData) {
    return null;
  }

  return (
    <>
      {/* Deep Analysis Modal (您的 V1 蓝图 - 保持不变) */}
      <AIDeepAnalysis
        isOpen={deepAnalysisOpen}
        onClose={() => setDeepAnalysisOpen(false)}
        analysisType={deepAnalysisType}
        playerData={playerData} // [V21] 传递真实数据
      />

      {/* Combat AI - Top Left (您的 V1 蓝图 - 保持不变) */}
      <AnimatePresence>
        {combatAIVisible && (
          <motion.div
            initial={{ opacity: 0, x: -50, rotate: -10 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -50, rotate: -10 }}
            className="fixed top-24 left-6 z-50"
          >
            <SubAIModule
              personality={AI_PERSONALITIES.combat}
              message={combatMessage}
              onDismiss={() => setCombatAIVisible(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strategy AI - Top Right (您的 V1 蓝图 - 保持不变) */}
      <AnimatePresence>
        {strategyAIVisible && (
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 10 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: 50, rotate: 10 }}
            className="fixed top-24 right-6 z-50"
          >
            <SubAIModule
              personality={AI_PERSONALITIES.strategy}
              message={strategyMessage}
              onDismiss={() => setStrategyAIVisible(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main AI Interface (您的 V1 蓝图 - 保持不变) */}
      <>
        {/* Overlay */}
        <AnimatePresence>
          {isMainOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsMainOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main AI Panel */}
        <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {isMainOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="mb-4 mr-2"
              >
                {/* [!! V21 核心 UI 修复 !!] */}
                {/* 我们现在传入 *新* 的 MainAIPanel_V21 */}
                <MainAIPanel_V21
                  isGlitching={isGlitching}
                  onQuestionClick={handleQuestionClick}
                  onQuestionDoubleClick={handleQuestionDoubleClick}
                  customQuestion={customQuestion}
                  setCustomQuestion={setCustomQuestion}
                  onCustomSubmit={handleCustomQuestionSubmit}
                  onKeyPress={handleKeyPress}
                  isProcessing={isProcessing}
                  chatHistory={chatHistory} // [V21] 传入 V21 格式的聊天记录
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main AI Button (您的 V1 蓝图 - 保持不变) */}
          <MainAIButton
            isOpen={isMainOpen}
            isGlitching={isGlitching}
            onClick={() => setIsMainOpen(!isMainOpen)}
          />

          {/* Floating Data Points (您的 V1 蓝图 - 保持不变) */}
          {!isMainOpen && (
            <>
              <motion.div
                className="absolute -top-8 -left-8 text-xs font-mono text-[#00ffff]"
                animate={{ opacity: [0.3, 1, 0.3], y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <GlitchText isGlitching={isGlitching}>RIFT-CORE</GlitchText>
              </motion.div>
              <motion.div
                className="absolute -bottom-8 -right-8 text-xs font-mono text-[#ff00ff]"
                animate={{ opacity: [0.3, 1, 0.3], y: [5, -5, 5] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
              >
                CLICK ME
              </motion.div>
            </>
          )}
        </div>
      </>
    </>
  );
}

// ##################################################################
// [!! V21 核心 UI 修复 !!]
// 这是 *重写* 的 MainAIPanel，它现在是一个 *聊天窗口*，
// 但 100% 匹配您的 Figma 赛博朋克风格。
// ##################################################################
function MainAIPanel_V21({
  isGlitching,
  onQuestionClick,
  onQuestionDoubleClick,
  customQuestion,
  setCustomQuestion,
  onCustomSubmit,
  onKeyPress,
  isProcessing,
  chatHistory
}: {
  isGlitching: boolean;
  onQuestionClick: (index: number) => void;
  onQuestionDoubleClick: (index: number) => void;
  customQuestion: string;
  setCustomQuestion: (val: string) => void;
  onCustomSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isProcessing: boolean;
  chatHistory: ChatMessage[]; // [V21] 接收 V21 格式的聊天记录
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // [V21] 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isProcessing]);

  return (
    <div 
      className="relative border-2 border-[#00ffff] p-6 w-[480px] h-[70vh] max-h-[700px] 
                 bg-[#0a0e27]/95 backdrop-blur-md overflow-hidden
                 flex flex-col" // [V21] 更改为 Flex 布局
      style={{ boxShadow: '0 0 30px #00ffff, inset 0 0 30px rgba(0,255,255,0.1)' }}
    >
      {/* Glitch overlay (您的 V1 蓝图 - 保持不变) */}
      {isGlitching && (
        <motion.div
          className="absolute inset-0 bg-[#ff0000]/20 mix-blend-screen pointer-events-none z-50"
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Scanlines (您的 V1 蓝图 - 保持不变) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ffff 2px, #00ffff 4px)',
          animation: 'scanlines 8s linear infinite'
        }}
      />

      {/* Corner decorations (您的 V1 蓝图 - 保持不变) */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff00ff]" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff00ff]" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ff00ff]" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ff00ff]" />

      {/* Header (您的 V1 蓝图 - 保持不变) */}
      <header className="relative z-10 flex items-center gap-3 mb-4 pb-4 border-b-2 border-[#00ffff]/30">
        <div className="text-3xl filter drop-shadow-[0_0_20px_#00ffff] animate-pulse">🤖</div>
        <div className="flex-1">
          <h3 className="text-[#00ffff] uppercase tracking-wider" style={{ textShadow: '0 0 10px #00ffff' }}>
            <GlitchText isGlitching={isGlitching}>{isGlitching ? 'R1FT-C0R3 [SYS_ERR]' : 'RIFT-CORE AI'}</GlitchText>
          </h3>
          <p className="text-[#666] text-xs font-mono">{isGlitching ? 'STATUS: [GLITCH_DETECTED]' : 'SYSTEM v2.5.7 // STATUS: ACTIVE'}</p>
        </div>
        <motion.div 
          className={`w-2 h-2 rounded-full animate-pulse ${isGlitching ? 'bg-[#ff0000]' : 'bg-[#00ff00]'}`}
          style={{ boxShadow: isGlitching ? '0 0 10px #ff0000' : '0 0 10px #00ff00' }}
          animate={isGlitching ? { scale: [1, 1.5, 1] } : {}}
          transition={isGlitching ? { duration: 0.3, repeat: 3 } : {}}
        />
      </header>
      
      {/* [!! V21 聊天窗口 !!] */}
      {/* 这是新的滚动聊天区域 */}
      <div className="relative z-10 flex-1 space-y-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
        {chatHistory.map((msg, index) => (
          // (这个 CyberChatMessage 组件必须从 @/components/ 导入)
          <CyberChatMessage key={index} role={msg.role} content={msg.content} />
        ))}
        {isProcessing && <CyberTypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* [!! V21 提问区 !!] */}
      {/* 这是新的输入区域 */}
      <div className="relative z-10 mt-4 pt-4 border-t-2 border-[#00ffff]/30">
        
        {/* Question Buttons (您的 V1 蓝图 - 保持不变) */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-[#666] font-mono uppercase tracking-wider">QUICK QUERIES:</div>
            <motion.div 
              className="text-xs text-[#ff00ff] font-mono"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ textShadow: '0 0 5px #ff00ff' }}
            >
              💡 DOUBLE-CLICK FOR DEEP ANALYSIS
            </motion.div>
          </div>
          {AI_PERSONALITIES.main.responses.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onQuestionClick(index)}
              onDoubleClick={() => onQuestionDoubleClick(index)}
              className="relative w-full text-left px-4 py-3 border-2 transition-all font-mono text-sm overflow-hidden 
                         border-[#00ffff]/30 bg-[#0a0e27]/80 text-[#00ffff] 
                         hover:border-[#00ffff] hover:bg-[#00ffff]/5"
              title="Double-click for deep analysis"
            >
              {/* (您的 V1 按钮内部样式 - 保持不变) */}
              <div className="relative z-10 flex items-center gap-3">
                <span className="text-xl filter" style={{ filter: 'drop-shadow(0 0 5px #00ffff)' }}>
                  {['🔍', '📊', '🎯', '❓'][index]}
                </span>
                <span className="uppercase tracking-wider">{item.q}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Custom Input Section (您的 V1 蓝图 - 保持不变) */}
        <div className="mt-4 pt-4 border-t-2 border-[#ff00ff]/30">
          <div className="text-xs text-[#ff00ff] mb-2 font-mono uppercase tracking-wider flex items-center gap-2">
            <span>🗨️ FREE CHAT MODE</span>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              [ACTIVE]
            </motion.span>
          </div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); onCustomSubmit(); }}>
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="ASK ANYTHING..."
              disabled={isProcessing}
              className="flex-1 bg-[#0a0e27] border-2 border-[#ff00ff]/30 px-3 py-2 text-sm text-[#aaa] font-mono placeholder:text-[#666] focus:border-[#ff00ff] focus:outline-none transition-colors"
              style={{ boxShadow: '0 0 10px #ff00ff20' }}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!customQuestion.trim() || isProcessing}
              className="px-4 py-2 bg-[#ff00ff]/10 border-2 border-[#ff00ff] text-[#ff00ff] font-mono text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{
                boxShadow: customQuestion.trim() && !isProcessing ? '0 0 15px #ff00ff' : 'none'
              }}
            >
              {isProcessing ? '...' : 'SEND'}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}