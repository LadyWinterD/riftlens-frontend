interface CyberMatchCardProps {
  champion: string;
  championId?: string;
  championIcon: string;
  isWin: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  visionScore: number;
  items: (string | number)[];
  rune: string | number;
  duration: string;
  gameNumber: number;
}

const DD_VERSION = '14.1.1';
const DD_CDN = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}`;

export function CyberMatchCard({
  champion,
  championId,
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

  // 将英雄名转换为ID（处理特殊情况）
  const getChampionId = () => {
    if (championId) return championId;
    // 处理特殊英雄名
    const nameMap: Record<string, string> = {
      'Lee Sin': 'LeeSin',
      'Twisted Fate': 'TwistedFate',
      'Jarvan IV': 'JarvanIV',
      'Dr. Mundo': 'DrMundo',
      'Master Yi': 'MasterYi',
      'Miss Fortune': 'MissFortune',
      'Tahm Kench': 'TahmKench',
      'Xin Zhao': 'XinZhao',
      'Aurelion Sol': 'AurelionSol',
      'Cho\'Gath': 'Chogath',
      'Kai\'Sa': 'Kaisa',
      'Kha\'Zix': 'Khazix',
      'Kog\'Maw': 'KogMaw',
      'LeBlanc': 'Leblanc',
      'Nunu & Willump': 'Nunu',
      'Rek\'Sai': 'RekSai',
      'Renata Glasc': 'Renata',
      'Vel\'Koz': 'Velkoz',
      'Wukong': 'MonkeyKing',
      'Bel\'Veth': 'Belveth',
    };
    return nameMap[champion] || champion.replace(/[^a-zA-Z]/g, '');
  };

  const champId = getChampionId();

  // 渲染英雄头像
  const renderChampionIcon = () => {
    if (typeof championIcon === 'string' && championIcon.startsWith('http')) {
      // 如果是URL，直接使用
      return (
        <img
          src={championIcon}
          alt={champion}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    
    // 使用Data Dragon CDN
    return (
      <>
        <img
          src={`${DD_CDN}/img/champion/${champId}.png`}
          alt={champion}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden absolute inset-0 flex items-center justify-center text-2xl">
          {championIcon}
        </div>
      </>
    );
  };

  // 渲染符文图标
  const renderRuneIcon = () => {
    if (typeof rune === 'number') {
      const runeTree = Math.floor(rune / 100) * 100;
      return (
        <>
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${runeTree}/${rune}/${rune}.png`}
            alt="Rune"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center text-sm">⚡</div>
        </>
      );
    }
    return <span>{rune}</span>;
  };

  // 渲染装备图标
  const renderItemIcon = (item: string | number, idx: number) => {
    if (typeof item === 'number' && item > 0) {
      return (
        <>
          <img
            src={`${DD_CDN}/img/item/${item}.png`}
            alt={`Item ${item}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center text-xs">?</div>
        </>
      );
    } else if (typeof item === 'number' && item === 0) {
      return <div className="absolute inset-0 bg-[#0a0e27]/50"></div>;
    }
    return <span className="text-sm">{item}</span>;
  };

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
          <div className="text-xs uppercase tracking-wider font-mono"
            style={{ color: winColor }}
          >
            {isWin ? 'WIN' : 'LOSS'}
          </div>
        </div>

        {/* Champion */}
        <div className="flex flex-col items-center gap-1">
          <div 
            className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#00ffff] bg-[#0a0e27]"
            style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}
          >
            {renderChampionIcon()}
          </div>
          <div className="text-[#00ffff] text-xs uppercase tracking-wider font-mono">{champion}</div>
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
            <div className="text-xs text-[#666] font-mono">
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
            {/* Rune */}
            <div className="relative text-lg bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded w-8 h-8 flex items-center justify-center overflow-hidden">
              {renderRuneIcon()}
            </div>
            {/* Items */}
            <div className="flex gap-1">
              {items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="relative text-sm bg-[#00ffff]/10 border border-[#00ffff]/30 rounded w-7 h-7 flex items-center justify-center overflow-hidden"
                >
                  {renderItemIcon(item, idx)}
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
