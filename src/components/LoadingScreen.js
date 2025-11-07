"use client";
import { useState, useEffect } from 'react';

// [“稳赢”的特色!] 我们的“黑客”消息列表 (已经是英语)
const loadingMessages = [
  "[ 1/4 ] NEURAL LINK ESTABLISHED...",
  "[ 1/4 ] ACCESSING RIOT API (REGION: europe)...",
  "[ 2/4 ] RETRIEVING MATCH HISTORY (PUUID: 7LN0...)...",
  "[ 2/4 ] ANALYZING 20 MATCHES... (THIS WILL TAKE A MOMENT)...",
  "[ 3/4 ] DATA AGGREGATED. CALCULATING ANNUAL STATS...",
  "[ 3/4 ] SENDING DATA TO AWS BEDROCK AI (CLAUDE 3 HAIKU)...",
  "[ 4/4 ] AI COACH IS GENERATING YOUR 'ROAST'...",
  "[ 4/4 ] COMPILING FINAL REPORT..."
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => {
        if (prevIndex < loadingMessages.length - 1) {
          return prevIndex + 1;
        }
        clearInterval(interval); 
        return prevIndex;
      });
    }, 3000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center 
                  bg-[#0a0e27]/90 backdrop-blur-sm">
      <div 
        className="text-7xl text-cyan-400 animate-pulse" 
        style={{textShadow: '0 0 20px #00ffff'}}
      >
        ⚡
      </div>
      <div className="w-1/3 max-w-sm mt-8 overflow-hidden rounded-sm border border-cyan-500/50 h-4 bg-black/50">
        <div 
          className="h-full bg-cyan-400" 
          style={{ 
            width: `${((messageIndex + 1) / loadingMessages.length) * 100}%`,
            transition: 'width 2.5s linear' 
          }}
        />
      </div>
      <p className="mt-6 text-xl font-mono text-cyan-300 tracking-wider">
        {loadingMessages[messageIndex]}
      </p>
      <p className="mt-2 text-sm font-mono text-gray-500">
        (AI is analyzing... please maintain connection...)
      </p>
    </div>
  );
}