interface CyberMatchCardProps {
  champion: string;
  championIcon: string;
  isWin: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  visionScore: number;
  items: string[];
  rune: string;
  duration: string;
  gameNumber: number;
}

export function CyberMatchCard({
  champion,
  championIcon,
  isWin,
  kills,
  deaths,
  assists,
  cs,
  visionScore,
  items,
  rune,
  duration,
  gameNumber
}: CyberMatchCardProps) {
  const winColor = isWin ? '#00ff00' : '#ff0000';
  const winBorderColor = isWin ? '#00ff00' : '#ff0000';

  return (
    <div 
      className="relative bg-[#0a0e27]/60 border-l-4 border-r border-t border-b p-4 backdrop-blur-sm group hover:bg-[#0a0e27]/80 transition-all"
      style={{ 
        borderLeftColor: winBorderColor,
        borderRightColor: '#333',
        borderTopColor: '#333',
        borderBottomColor: '#333'
      }}
    >
      {/* Animated line on hover */}
      <div 
        className="absolute top-0 left-0 w-0 group-hover:w-full h-px transition-all duration-500"
        style={{ backgroundColor: winColor }}
      ></div>

      <div className="flex items-center gap-4">
        {/* Game Number & Win/Loss */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-[#666] font-mono">#{gameNumber}</div>
          <div className="text-3xl filter"
            style={{ filter: `drop-shadow(0 0 10px ${winColor})` }}
          >
            {isWin ? '✓' : '✗'}
          </div>
          <div className="text-xs uppercase tracking-wider"
            style={{ color: winColor }}
          >
            {isWin ? 'WIN' : 'LOSS'}
          </div>
        </div>

        {/* Champion */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl filter drop-shadow-[0_0_10px_#00ffff]">{championIcon}</div>
          <div className="text-[#00ffff] text-xs uppercase tracking-wider">{champion}</div>
        </div>

        {/* Vertical Separator */}
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#00ffff] to-transparent"></div>

        {/* Stats */}
        <div className="flex-1 space-y-2">
          {/* KDA */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#00ff00]">{kills}</span>
              <span className="text-[#666]">/</span>
              <span className="text-[#ff0000]">{deaths}</span>
              <span className="text-[#666]">/</span>
              <span className="text-[#ffff00]">{assists}</span>
            </div>
            <div className="text-xs text-[#666]">
              KDA: <span className="text-[#00ffff]">{deaths === 0 ? 'PERFECT' : ((kills + assists) / deaths).toFixed(1)}</span>
            </div>
          </div>

          {/* CS, Vision, Duration */}
          <div className="flex gap-3 text-xs font-mono">
            <div className="flex items-center gap-1">
              <span className="text-[#666]">CS:</span>
              <span className="text-[#ffff00]">{cs}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#666]">VISION:</span>
              <span className="text-[#ff00ff]">{visionScore}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#666]">TIME:</span>
              <span className="text-[#00ffff]">{duration}</span>
            </div>
          </div>

          {/* Items & Rune */}
          <div className="flex items-center gap-2">
            <div className="text-lg bg-[#ff00ff]/10 border border-[#ff00ff]/30 w-8 h-8 flex items-center justify-center">
              {rune}
            </div>
            <div className="flex gap-1">
              {items.map((item, idx) => (
                <div key={idx} className="text-sm bg-[#00ffff]/10 border border-[#00ffff]/30 w-7 h-7 flex items-center justify-center">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Glitch effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-5 pointer-events-none"
        style={{ animation: 'glitch 0.3s infinite' }}
      ></div>
    </div>
  );
}
