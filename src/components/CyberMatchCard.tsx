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
  summoner1Id?: number;
  summoner2Id?: number;
  matchData?: any;  // 新增：完整的比赛数据
  playerPuuid?: string;  // 新增：玩家 PUUID
  onCardClick?: () => void;  // 新增：点击回调
}

const DD_VERSION = '15.22.1';
const DD_CDN = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}`;

// 召唤师技能ID映射表 (v15.22.1)
const SUMMONER_SPELL_MAP: Record<number, string> = {
  1: 'SummonerBoost',  // Cleanse
  3: 'SummonerExhaust',  // Exhaust
  4: 'SummonerFlash',  // Flash
  6: 'SummonerHaste',  // Ghost
  7: 'SummonerHeal',  // Heal
  11: 'SummonerSmite',  // Smite
  12: 'SummonerTeleport',  // Teleport
  13: 'SummonerMana',  // Clarity
  14: 'SummonerDot',  // Ignite
  21: 'SummonerBarrier',  // Barrier
  30: 'SummonerPoroRecall',  // To the King!
  31: 'SummonerPoroThrow',  // Poro Toss
  32: 'SummonerSnowball',  // Mark
  39: 'SummonerSnowURFSnowball_Mark',  // Mark
  54: 'Summoner_UltBookPlaceholder',  // Placeholder
  55: 'Summoner_UltBookSmitePlaceholder',  // Placeholder and Attack-Smite
  2201: 'SummonerCherryHold',  // Flee
  2202: 'SummonerCherryFlash',  // Flash
};

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
  gameNumber,
  summoner1Id,
  summoner2Id,
  matchData,
  playerPuuid,
  onCardClick
}: CyberMatchCardProps) {
  const winColor = isWin ? '#00ff00' : '#ff0000';
  const winBorderColor = isWin ? '#00ff00' : '#ff0000';

  // 获取英雄ID
  const getChampionId = () => {
    if (championId) return championId;
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
      "Cho'Gath": 'Chogath',
      "Kai'Sa": 'Kaisa',
      "Kha'Zix": 'Khazix',
      "Kog'Maw": 'KogMaw',
      'LeBlanc': 'Leblanc',
      'Nunu & Willump': 'Nunu',
      "Rek'Sai": 'RekSai',
      'Renata Glasc': 'Renata',
      "Vel'Koz": 'Velkoz',
      'Wukong': 'MonkeyKing',
      "Bel'Veth": 'Belveth',
    };
    return nameMap[champion] || champion.replace(/[^a-zA-Z]/g, '');
  };

  const champId = getChampionId();

  // 获取召唤师技能名称
  const getSummonerSpellName = (spellId?: number): string | null => {
    if (!spellId) return null;
    return SUMMONER_SPELL_MAP[spellId] || null;
  };

  const spell1 = getSummonerSpellName(summoner1Id);
  const spell2 = getSummonerSpellName(summoner2Id);

  return (
    <div 
      className="relative bg-[#0a0e27]/60 border-l-4 border-r border-t border-b p-4 backdrop-blur-sm group hover:bg-[#0a0e27]/80 transition-all cursor-pointer"
      style={{ 
        borderLeftColor: winBorderColor,
        borderRightColor: '#333',
        borderTopColor: '#333',
        borderBottomColor: '#333'
      }}
      onClick={onCardClick}
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
            <img
              src={`${DD_CDN}/img/champion/${champId}.png`}
              alt={champion}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center text-2xl">
              {championIcon}
            </div>
          </div>
          <div className="text-[#00ffff] text-xs uppercase tracking-wider font-mono">{champion}</div>
        </div>

        {/* Summoner Spells */}
        <div className="flex flex-col gap-1">
          {spell1 && (
            <div className="relative w-6 h-6 bg-[#0a0e27] border border-[#ffff00]/40 rounded overflow-hidden">
              <img
                src={`/spells/${spell1}.png`}
                alt={spell1}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 本地图标失败，尝试CDN
                  const target = e.currentTarget;
                  if (target.src.includes('/spells/')) {
                    target.src = `${DD_CDN}/img/spell/${spell1}.png`;
                  } else {
                    // CDN也失败，显示后备图标
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-icon')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center text-xs bg-[#1a1f3a] text-[#ffff00]';
                      fallback.textContent = '✨';
                      parent.appendChild(fallback);
                    }
                  }
                }}
              />
            </div>
          )}
          {spell2 && (
            <div className="relative w-6 h-6 bg-[#0a0e27] border border-[#ffff00]/40 rounded overflow-hidden">
              <img
                src={`/spells/${spell2}.png`}
                alt={spell2}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 本地图标失败，尝试CDN
                  const target = e.currentTarget;
                  if (target.src.includes('/spells/')) {
                    target.src = `${DD_CDN}/img/spell/${spell2}.png`;
                  } else {
                    // CDN也失败，显示后备图标
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-icon')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center text-xs bg-[#1a1f3a] text-[#ffff00]';
                      fallback.textContent = '✨';
                      parent.appendChild(fallback);
                    }
                  }
                }}
              />
            </div>
          )}
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
            {typeof rune === 'number' && rune > 0 && (
              <div className="relative w-8 h-8 bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded overflow-hidden">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${Math.floor(rune / 100) * 100}/${rune}/${rune}.png`}
                  alt="Rune"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center text-sm">⚡</div>
              </div>
            )}
            
            {/* Items */}
            <div className="flex gap-1">
              {items.slice(0, 6).map((item, idx) => {
                const itemId = typeof item === 'number' ? item : parseInt(item) || 0;
                return (
                  <div 
                    key={idx} 
                    className="relative w-7 h-7 bg-[#00ffff]/10 border border-[#00ffff]/30 rounded overflow-hidden"
                  >
                    {itemId > 0 ? (
                      <img
                        src={`/items/${itemId}.png`}
                        alt={`Item ${itemId}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 本地图标失败，尝试CDN
                          const target = e.currentTarget;
                          if (target.src.includes('/items/')) {
                            target.src = `${DD_CDN}/img/item/${itemId}.png`;
                          } else {
                            // CDN也失败，显示装备ID
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-text')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'fallback-text absolute inset-0 flex items-center justify-center text-[8px] bg-[#1a1f3a] text-[#666] font-mono leading-none';
                              fallback.textContent = itemId.toString();
                              parent.appendChild(fallback);
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#0a0e27]/50"></div>
                    )}
                  </div>
                );
              })}
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
