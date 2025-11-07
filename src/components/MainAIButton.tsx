"use client";
import { motion } from 'framer-motion';

// (这是您 Figma 蓝图中的 V1 MainAIButton - 100% 保持不变)
export default function MainAIButton({ 
  isOpen, 
  isGlitching, 
  onClick 
}: { 
  isOpen: boolean; 
  isGlitching: boolean; 
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isOpen
          ? { scale: 1 }
          : isGlitching
          ? {
              scale: [1, 1.15, 0.95, 1.1, 1],
              rotate: [0, -5, 5, -2, 0],
            }
          : {
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 20px #00ffff',
                '0 0 40px #00ffff',
                '0 0 20px #00ffff'
              ]
            }
      }
      transition={
        isOpen 
          ? {} 
          : isGlitching
          ? { duration: 0.5 }
          : {
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
            }
      }
      onClick={onClick}
      className="relative bg-gradient-to-br from-[#00ffff] to-[#0088ff] w-20 h-20 border-4 border-[#00ffff] flex items-center justify-center overflow-hidden"
      style={{
        boxShadow: isGlitching 
          ? '0 0 40px #ff0000, inset 0 0 30px rgba(255,0,0,0.5)' 
          : '0 0 30px #00ffff, inset 0 0 20px rgba(0,255,255,0.5)',
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
      }}
    >
      {/* Glitch overlay */}
      {isGlitching && (
        <motion.div
          className="absolute inset-0 bg-[#ff0000]/30 mix-blend-screen"
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Notification indicators */}
      {!isOpen && !isGlitching && (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute inset-0 border-2 border-[#ff00ff]"
            style={{
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
            }}
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff00ff] animate-pulse"
            style={{ 
              boxShadow: '0 0 10px #ff00ff',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            }}
          />
        </>
      )}

      {/* Error indicator when glitching */}
      {isGlitching && (
        <div className="absolute -top-1 -right-1 text-xs font-mono text-[#ff0000] bg-black px-1 animate-pulse"
          style={{ textShadow: '0 0 5px #ff0000' }}
        >
          ERR
        </div>
      )}

      {/* Icon */}
      <motion.div 
        className="text-4xl filter relative z-10"
        style={{ filter: 'drop-shadow(0 0 10px white)' }}
        animate={
          isGlitching 
            ? { x: [-2, 2, -2, 2, 0], y: [-2, 2, -2, 2, 0] }
            : isOpen 
            ? {} 
            : { 
                textShadow: [
                  '0 0 10px #fff',
                  '0 0 20px #fff, 0 0 30px #00ffff',
                  '0 0 10px #fff'
                ]
              }
        }
        transition={
          isGlitching
            ? { duration: 0.2, repeat: 2 }
            : isOpen 
            ? {} 
            : { repeat: Infinity, duration: 2 }
        }
      >
        {isGlitching ? '⚠️' : isOpen ? '✕' : '🤖'}
      </motion.div>

      {/* Scanning effect */}
      {!isOpen && !isGlitching && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-30"
          animate={{ y: ['-100%', '100%'] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'linear',
          }}
        />
      )}
    </motion.button>
  );
}