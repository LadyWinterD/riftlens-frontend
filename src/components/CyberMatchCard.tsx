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
  matchData?: any;
  playerPuuid?: string;
  onCardClick?: () => void;
}

const DD_VERSION = '15.22.1';
const DD_CDN = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}`;

const SUMMONER_SPELL_MAP: Record<number, string> = {
  1: 'SummonerBoost',
  3: 'SummonerExhaust',
  4: 'SummonerFlash',
  6: 'SummonerHaste',
  7: 'SummonerHeal',
  11: 'SummonerSmite',
  12: 'SummonerTeleport',
  13: 'SummonerMana',
  14: 'SummonerDot',
  21: 'SummonerBarrier',
  30: 'SummonerPoroRecall',
  31: 'SummonerPoroThrow',
  32: 'SummonerSnowball',
  39: 'SummonerSnowURFSnowball_Mark',
  54: 'Summoner_UltBookPlaceholder',
  55: 'Summoner_UltBookSmitePlaceholder',
  2201: 'SummonerCherryHold',
  2202: 'SummonerCherryFlash',
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
  onCardClick,
}: CyberMatchCardProps) {
  const winColor = isWin ? '#00ff00' : '#ff0000';
  const winBorderColor = isWin ? '#00ff00' : '#ff0000';

  // 处理英雄 ID
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

  // 召唤师技能映射
  const getSummonerSpellName = (id?: number) => (id ? SUMMONER_SPELL_MAP[id] || null : null);
  const spell1 = getSummonerSpellName(summoner1Id);
  const spell2 = getSummonerSpellName(summoner2Id);

  return (
    <div
      className="relative bg-[#0a0e27]/60 border-l-4 border-r border-t border-b p-4 backdrop-blur-sm group hover:bg-[#0a0e27]/80 transition-all cursor-pointer"
      style={{
        borderLeftColor: winBorderColor,
        borderRightColor: '#333',
        borderTopColor: '#333',
        borderBottomColor: '#333',
      }}
      onClick={onCardClick}
    >
      <div
        className="absolute top-0 left-0 w-0 group-hover:w-full h-px transition-all duration-500"
        style={{ backgroundColor: winColor }}
      ></div>

      <div className="flex items-center gap-4">
        {/* 左侧：胜负与编号 */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-[#666] font-mono">#{gameNumber}</div>
          <div className="text-3xl filter" style={{ filter: `drop-shadow(0 0 10px ${winColor})` }}>
            {isWin ? '✓' : '✗'}
          </div>
          <div className="text-xs uppercase tracking-wider font-mono" style={{ color: winColor }}>
            {isWin ? 'WIN' : 'LOSS'}
          </div>
        </div>

        {/* 英雄头像 */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#00ffff] bg-[#0a0e27]"
            style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}
          >
            <img
              src={`${DD_CDN}/img/champion/${champId}.png`}
              alt={champion}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-[#00ffff] text-xs uppercase tracking-wider font-mono">{champion}</div>
        </div>

        {/* 召唤师技能 */}
        <div className="flex flex-col gap-1">
          {[spell1, spell2].map(
            (spell, i) =>
              spell && (
                <div
                  key={i}
                  className="relative w-6 h-6 bg-[#0a0e27] border border-[#ffff00]/40 rounded overflow-hidden"
                >
                  <img
                    src={`${DD_CDN}/img/spell/${spell}.png`}
                    alt={spell}
                    className="w-full h-full object-cover"
                  />
                </div>
              ),
          )}
        </div>

        {/* 分隔线 */}
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#00ffff] to-transparent"></div>

        {/* 右侧数据 */}
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
              KDA:{' '}
              <span className="text-[#00ffff]">
                {deaths === 0 ? 'PERFECT' : ((kills + assists) / deaths).toFixed(1)}
              </span>
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

          {/* 装备与符文 */}
          <div className="flex items-center gap-2">
            {/* Rune */}
            {typeof rune === 'number' && rune > 0 && (
              <div className="relative w-8 h-8 bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded overflow-hidden">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${Math.floor(rune / 100) * 100}/${rune}/${rune}.png`}
                  alt="Rune"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Items */}
            <div className="flex gap-1">
              {items
                .filter((item) => Number(item) > 0)
                .slice(0, 6)
                .map((item, idx) => {
                  const itemId = Number(item);
                  return (
                    <div
                      key={idx}
                      className="relative w-7 h-7 bg-[#00ffff]/10 border border-[#00ffff]/30 rounded overflow-hidden"
                    >
                      <img
                        src={`${DD_CDN}/img/item/${itemId}.png`}
                        alt={`Item ${itemId}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.fallback-text')) {
                            const fallback = document.createElement('div');
                            fallback.className =
                              'fallback-text absolute inset-0 flex items-center justify-center text-[8px] bg-[#1a1f3a] text-[#666] font-mono leading-none';
                            fallback.textContent = itemId.toString();
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
