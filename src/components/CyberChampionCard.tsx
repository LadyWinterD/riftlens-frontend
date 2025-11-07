interface CyberChampionCardProps {
  name: string;
  icon: string;
  games: number;
  avgKDA: number;
  avgCS: number;
  winRate: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CyberChampionCard({
  name,
  icon,
  games,
  avgKDA,
  avgCS,
  winRate,
  isSelected = false,
  onClick
}: CyberChampionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left relative overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'bg-[#ffff00]/10 border-2 border-[#ffff00] scale-105'
          : 'bg-[#0a0e27]/60 border-2 border-[#ffff00]/20 hover:border-[#ffff00]/50'
      }`}
      style={{
        boxShadow: isSelected ? '0 0 20px #ffff00' : 'none'
      }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffff00] animate-pulse"></div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl filter"
            style={{ filter: isSelected ? 'drop-shadow(0 0 10px #ffff00)' : 'none' }}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div className={`uppercase tracking-wider text-sm ${
              isSelected ? 'text-[#ffff00]' : 'text-[#00ffff]'
            }`}
              style={{ textShadow: isSelected ? '0 0 10px #ffff00' : 'none' }}
            >
              {name}
            </div>
            <div className="text-[#666] text-xs font-mono">{games} GAMES</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-[#00ffff] font-mono">{avgKDA.toFixed(1)}</div>
            <div className="text-[#666] uppercase" style={{ fontSize: '0.65rem' }}>KDA</div>
          </div>
          <div className="text-center">
            <div className="text-[#ff00ff] font-mono">{avgCS.toFixed(1)}</div>
            <div className="text-[#666] uppercase" style={{ fontSize: '0.65rem' }}>CS/M</div>
          </div>
          <div className="text-center">
            <div className={`font-mono ${winRate >= 50 ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
              {winRate}%
            </div>
            <div className="text-[#666] uppercase" style={{ fontSize: '0.65rem' }}>WIN</div>
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <div className={`absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ffff00] to-transparent transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </button>
  );
}
