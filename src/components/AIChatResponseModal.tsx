import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect } from 'react';
import { JSX } from 'react/jsx-runtime';

interface AIChatResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  answer: string;
  isProcessing?: boolean;
}

export function AIChatResponseModal({
  isOpen,
  onClose,
  question,
  answer,
  isProcessing = false
}: AIChatResponseModalProps) {
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingIntervalId, setTypingIntervalId] = useState<NodeJS.Timeout | null>(null);

  // 打字机效果
  useEffect(() => {
    if (isOpen && answer && !isProcessing) {
      // 如果答案太长，跳过打字机效果
      if (answer.length > 5000) {
        setDisplayedAnswer(answer);
        setIsTyping(false);
        return;
      }

      setIsTyping(true);
      setDisplayedAnswer('');
      let currentIndex = 0;
      const typingSpeed = 15; // ms per character

      const interval = setInterval(() => {
        if (currentIndex < answer.length) {
          setDisplayedAnswer(answer.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
          setTypingIntervalId(null);
        }
      }, typingSpeed);

      setTypingIntervalId(interval);

      return () => {
        clearInterval(interval);
        setTypingIntervalId(null);
      };
    }
  }, [answer, isOpen, isProcessing]);

  // 重置状态当弹窗关闭
  useEffect(() => {
    if (!isOpen) {
      setDisplayedAnswer('');
      setIsTyping(false);
    }
  }, [isOpen]);

  // 跳过打字机效果
  const skipTyping = () => {
    if (typingIntervalId) {
      clearInterval(typingIntervalId);
      setTypingIntervalId(null);
    }
    setDisplayedAnswer(answer);
    setIsTyping(false);
  };

  // 格式化AI回答 - 支持特殊语法
  const formatAnswer = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      // 标题 (以 ### 开头)
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl text-[#00ffff] font-mono uppercase tracking-wider mt-4 mb-2"
            style={{ textShadow: '0 0 10px #00ffff' }}>
            {line.replace('### ', '')}
          </h3>
        );
      }
      // 子标题 (以 ## 开头)
      else if (line.startsWith('## ')) {
        elements.push(
          <h4 key={index} className="text-lg text-[#ff00ff] font-mono uppercase tracking-wider mt-3 mb-2"
            style={{ textShadow: '0 0 8px #ff00ff' }}>
            {line.replace('## ', '')}
          </h4>
        );
      }
      // 重要信息 (以 >>> 开头)
      else if (line.startsWith('>>> ')) {
        elements.push(
          <div key={index} className="border-l-4 border-[#ff0000] bg-[#ff0000]/10 pl-4 py-2 my-2">
            <span className="text-[#ff0000] font-mono">{line.replace('>>> ', '')}</span>
          </div>
        );
      }
      // 成功/正向信息 (以 +++ 开头)
      else if (line.startsWith('+++ ')) {
        elements.push(
          <div key={index} className="border-l-4 border-[#00ff00] bg-[#00ff00]/10 pl-4 py-2 my-2">
            <span className="text-[#00ff00] font-mono">{line.replace('+++ ', '')}</span>
          </div>
        );
      }
      // 列表项 (以 - 或 • 开头)
      else if (line.match(/^[\-•]\s/)) {
        elements.push(
          <div key={index} className="flex items-start gap-3 my-1 ml-4">
            <span className="text-[#00ffff] mt-1">▸</span>
            <span className="text-[#aaa] font-mono flex-1">{line.replace(/^[\-•]\s/, '')}</span>
          </div>
        );
      }
      // 数字列表 (以数字. 开头)
      else if (line.match(/^\d+\.\s/)) {
        const number = line.match(/^(\d+)\.\s/)?.[1];
        elements.push(
          <div key={index} className="flex items-start gap-3 my-1 ml-4">
            <span className="text-[#ffff00] font-mono min-w-[24px]">{number}.</span>
            <span className="text-[#aaa] font-mono flex-1">{line.replace(/^\d+\.\s/, '')}</span>
          </div>
        );
      }
      // 分隔线
      else if (line.trim() === '---') {
        elements.push(
          <div key={index} className="my-4 h-px bg-gradient-to-r from-transparent via-[#00ffff] to-transparent" />
        );
      }
      // 空行
      else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      }
      // 普通文本
      else {
        elements.push(
          <p key={index} className="text-[#aaa] font-mono my-1 leading-relaxed">{line}</p>
        );
      }
    });

    return elements;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a0e27] border-4 border-[#00ffff] overflow-hidden"
            style={{
              boxShadow: '0 0 60px #00ffff, inset 0 0 50px rgba(0,255,255,0.1)'
            }}
          >
            {/* Animated scanlines */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ffff 2px, #00ffff 4px)',
                animation: 'scanlines 8s linear infinite'
              }}
            />

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#ff00ff]" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#ff00ff]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#ff00ff]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#ff00ff]" />

            {/* Header */}
            <div className="relative border-b-4 border-[#00ffff]/40 p-6 bg-[#00ffff]/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="text-5xl filter drop-shadow-[0_0_20px_#00ffff]"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    🤖
                  </motion.div>
                  <div>
                    <h2
                      className="text-3xl text-[#00ffff] uppercase tracking-wider font-mono"
                      style={{
                        textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff'
                      }}
                    >
                      RIFT-CORE AI RESPONSE
                    </h2>
                    <p className="text-[#666] text-sm font-mono uppercase tracking-wider mt-1">
                      NEURAL ANALYSIS OUTPUT
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#666] hover:text-white transition-colors p-2 hover:bg-[#ff00ff]/20 border-2 border-transparent hover:border-[#ff00ff]"
                >
                  <X size={32} />
                </button>
              </div>

              {/* Status bar */}
              <div className="mt-4 flex items-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#00ff00]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[#666]">AI STATUS: </span>
                  <span className="text-[#00ff00]">
                    {isProcessing
                      ? 'PROCESSING...'
                      : isTyping
                      ? 'GENERATING...'
                      : 'COMPLETE'}
                  </span>
                </div>
                <div className="text-[#666]">
                  CONFIDENCE LEVEL:{' '}
                  <span className="text-[#00ffff]">96.3%</span>
                </div>
                <div className="text-[#666]">
                  RESPONSE TIME:{' '}
                  <span className="text-[#00ffff]">
                    {(Math.random() * 2 + 0.5).toFixed(2)}s
                  </span>
                </div>
              </div>
            </div>

            {/* Question Display */}
            <div className="relative border-b-2 border-[#ff00ff]/30 p-6 bg-[#ff00ff]/5">
              <div className="flex gap-4">
                <div className="text-3xl filter drop-shadow-[0_0_10px_#ff00ff]">
                  💬
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[#ff00ff] mb-2 font-mono uppercase tracking-wider">
                    YOUR QUESTION:
                  </div>
                  <p className="text-lg text-[#fff] font-mono leading-relaxed">
                    {question}
                  </p>
                </div>
              </div>
            </div>

            {/* Answer Display */}
            <ScrollArea className="h-[calc(85vh-280px)]">
              <div className="p-6">
                {isProcessing ? (
                  // Loading state
                  <div className="flex flex-col items-center justify-center py-20">
                    <motion.div
                      className="text-6xl mb-6"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      ⚙️
                    </motion.div>
                    <div
                      className="text-[#00ffff] font-mono text-lg mb-4"
                      style={{ textShadow: '0 0 10px #00ffff' }}
                    >
                      NEURAL PATHWAYS INITIALIZING...
                    </div>
                    <div className="w-64 h-2 bg-[#1a1f3a] border-2 border-[#00ffff] relative overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00ffff] to-[#ff00ff]"
                        style={{ boxShadow: '0 0 20px #00ffff' }}
                        animate={{ width: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div className="mt-6 text-[#666] text-xs font-mono space-y-1">
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        &gt; Analyzing player data...
                      </motion.p>
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.5
                        }}
                      >
                        &gt; Cross-referencing meta database...
                      </motion.p>
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 1
                        }}
                      >
                        &gt; Generating strategic recommendations...
                      </motion.p>
                    </div>
                  </div>
                ) : (
                  // Answer content
                  <div className="relative">
                    <div className="flex gap-4 mb-4">
                      <div className="text-3xl filter drop-shadow-[0_0_10px_#00ffff]">
                        🧠
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-[#00ffff] mb-4 font-mono uppercase tracking-wider flex items-center gap-2">
                          <span>AI ANALYSIS:</span>
                          <motion.div
                            className="h-px flex-1 bg-gradient-to-r from-[#00ffff] to-transparent"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="text-base leading-relaxed">
                          {formatAnswer(displayedAnswer)}
                          {isTyping && (
                            <motion.span
                              className="inline-block w-2 h-5 bg-[#00ffff] ml-1"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Skip typing button */}
                    {isTyping && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={skipTyping}
                        className="mt-6 px-6 py-3 border-2 border-[#ffff00] text-[#ffff00] text-sm font-mono uppercase tracking-wider hover:bg-[#ffff00]/20 transition-all relative overflow-hidden"
                        style={{ boxShadow: '0 0 20px rgba(255,255,0,0.5)' }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-[#ffff00]/10"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                          <span className="text-xl">⏩</span>
                          SKIP ANIMATION
                        </span>
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="relative border-t-4 border-[#00ffff]/40 p-4 bg-[#00ffff]/5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#666]">
                  NEURAL LINK:{' '}
                  <span className="text-[#00ff00]">STABLE</span>
                </span>
                <div className="flex gap-4">
                  <span className="text-[#666]">
                    SYSTEM:{' '}
                    <span className="text-[#00ffff]">RiftAI-47</span>
                  </span>
                  <span className="text-[#666]">
                    VERSION:{' '}
                    <span className="text-[#00ffff]">v2.5.7</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border-2 border-[#ff00ff] text-[#ff00ff] uppercase tracking-wider hover:bg-[#ff00ff]/20 transition-all"
                  style={{ boxShadow: '0 0 15px rgba(255,0,255,0.3)' }}
                >
                  CLOSE
                </button>
              </div>
            </div>

            {/* Glitch effect overlay (random) */}
            <motion.div
              className="absolute inset-0 bg-[#00ffff]/5 mix-blend-screen pointer-events-none"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 5 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
