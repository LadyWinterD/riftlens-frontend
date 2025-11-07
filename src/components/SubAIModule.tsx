"use client";
import { motion } from 'framer-motion';

interface PersonalityType {
  name: string;
  color: string;
  icon: string;
  personality: string;
  shape?: string; // Optional since it's not always present
}

export default function SubAIModule({ 
  personality, 
  message, 
  onDismiss 
}: { 
  personality: PersonalityType;
  message: string;
  onDismiss: () => void;
}) {
  const isDiamond = personality.shape === 'diamond';
  const isTriangle = personality.shape === 'triangle';

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
    >
      {/* Main container */}
      <div 
        className="relative border-2 p-4 w-[320px] bg-[#0a0e27]/95 backdrop-blur-md overflow-hidden"
        style={{ 
          borderColor: personality.color,
          boxShadow: `0 0 20px ${personality.color}, inset 0 0 20px ${personality.color}20`,
          clipPath: isDiamond 
            ? 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)'
            : isTriangle
            ? 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 100%, 0% 100%, 0% 5%)'
            : 'none'
        }}
      >
        {/* Scanlines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${personality.color} 2px, ${personality.color} 4px)`,
            animation: 'scanlines 8s linear infinite'
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 mb-3 pb-3 border-b-2"
          style={{ borderColor: `${personality.color}40` }}
        >
          <div className="text-2xl filter"
            style={{ filter: `drop-shadow(0 0 10px ${personality.color})` }}
          >
            {personality.icon}
          </div>
          <div className="flex-1">
            <h4 className="uppercase tracking-wider text-sm font-mono"
              style={{ color: personality.color, textShadow: `0 0 10px ${personality.color}` }}
            >
              {personality.name}
            </h4>
            <p className="text-[#666] text-xs font-mono">{personality.personality.toUpperCase()}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-[#666] hover:text-[#fff] text-xs"
          >
            ✕
          </button>
        </div>

        {/* Message */}
        <div className="relative z-10">
          <div className="text-xs mb-2 font-mono uppercase tracking-wider"
            style={{ color: personality.color }}
          >
            {personality.name === 'WAR-PROTOCOL' ? 'COMBAT ALERT:' : 'ANALYSIS:'}
          </div>
          <p className="text-sm text-[#aaa] font-mono leading-relaxed">
            {message}
          </p>
        </div>

        {/* Status bar */}
        <div className="relative z-10 mt-3 pt-3 border-t-2"
          style={{ borderColor: `${personality.color}40` }}
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#666]">SUB-ROUTINE</span>
            <motion.span 
              style={{ color: personality.color }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ● ACTIVE
            </motion.span>
          </div>
        </div>
      </div>

      {/* Floating indicator */}
      <motion.div
        className="absolute -top-2 -left-2 text-xs font-mono px-2 py-1 border-2"
        style={{ 
          color: personality.color,
          borderColor: personality.color,
          backgroundColor: '#0a0e27',
          boxShadow: `0 0 10px ${personality.color}`
        }}
        animate={{ y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        NEW
      </motion.div>
    </motion.div>
  );
}

