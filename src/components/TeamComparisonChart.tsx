'use client';

interface TeamComparisonChartProps {
  participants: any[];
  currentPlayerPuuid: string;
}

const DD_VERSION = '15.22.1';
const DD_CDN = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}`;

export default function TeamComparisonChart({
  participants,
  currentPlayerPuuid
}: TeamComparisonChartProps) {
  const blueTeam = participants.filter(p => p.teamId === 100).slice(0, 5);
  const redTeam = participants.filter(p => p.teamId === 200).slice(0, 5);

  if (blueTeam.length !== 5 || redTeam.length !== 5) return null;

  const getChampionId = (name: string) => {
    const nameMap: Record<string, string> = {
      'Lee Sin': 'LeeSin', 'Twisted Fate': 'TwistedFate', 'Jarvan IV': 'JarvanIV',
      'Dr. Mundo': 'DrMundo', 'Master Yi': 'MasterYi', 'Miss Fortune': 'MissFortune',
      'Tahm Kench': 'TahmKench', 'Xin Zhao': 'XinZhao', 'Aurelion Sol': 'AurelionSol',
      "Cho'Gath": 'Chogath', "Kai'Sa": 'Kaisa', "Kha'Zix": 'Khazix',
      "Kog'Maw": 'KogMaw', 'LeBlanc': 'Leblanc', 'Nunu & Willump': 'Nunu',
      "Rek'Sai": 'RekSai', 'Renata Glasc': 'Renata', "Vel'Koz": 'Velkoz',
      'Wukong': 'MonkeyKing', "Bel'Veth": 'Belveth',
    };
    return nameMap[name] || name.replace(/[^a-zA-Z]/g, '');
  };

  const maxDamageDealt = Math.max(...participants.map(p => p.totalDamageDealtToChampions || 0));
  const maxDamageTaken = Math.max(...participants.map(p => p.totalDamageTaken || 0));
  const maxGold = Math.max(...participants.map(p => p.goldEarned || 0));
  const maxWardsPlaced = Math.max(...participants.map(p => p.wardsPlaced || 0));
  const maxWardsKilled = Math.max(...participants.map(p => p.wardsKilled || 0));

  const renderPlayerRow = (bluePlayer: any, redPlayer: any, index: number) => {
    const isCurrentBlue = bluePlayer.puuid === currentPlayerPuuid;
    const isCurrentRed = redPlayer.puuid === currentPlayerPuuid;
    
    return (
      <div key={index} className="flex items-center gap-2">
        {/* Blue Player */}
        <div className={`flex items-center gap-2 ${isCurrentBlue ? 'opacity-100' : 'opacity-70'}`}>
          <img
            src={`${DD_CDN}/img/champion/${getChampionId(bluePlayer.championName)}.png`}
            alt={bluePlayer.championName}
            className="w-8 h-8 rounded-full border-2 border-[#00ffff]"
          />
        </div>
        
        {/* Blue Stats */}
        <div className="text-right text-xs text-[#00ffff] font-mono min-w-[60px]">
          {/* Will be filled by specific stat */}
        </div>
        
        {/* Progress bars */}
        <div className="flex-1">
          {/* Will be filled by specific comparison */}
        </div>
        
        {/* Red Stats */}
        <div className="text-left text-xs text-[#ff0000] font-mono min-w-[60px]">
          {/* Will be filled by specific stat */}
        </div>
        
        {/* Red Player */}
        <div className={`flex items-center gap-2 ${isCurrentRed ? 'opacity-100' : 'opacity-70'}`}>
          <img
            src={`${DD_CDN}/img/champion/${getChampionId(redPlayer.championName)}.png`}
            alt={redPlayer.championName}
            className="w-8 h-8 rounded-full border-2 border-[#ff0000]"
          />
        </div>
      </div>
    );
  };

  const renderStatComparison = (
    title: string,
    icon: string,
    blueTeam: any[],
    redTeam: any[],
    statKey: string,
    maxValue: number,
    blueColor: string,
    redColor: string
  ) => (
    <div
      className="border-2 rounded-lg p-6"
      style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        borderColor: '#66666640'
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-mono uppercase tracking-wider text-[#666]">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {blueTeam.map((bluePlayer, idx) => {
          const redPlayer = redTeam[idx];
          const blueValue = bluePlayer[statKey] || 0;
          const redValue = redPlayer[statKey] || 0;
          const bluePercent = maxValue > 0 ? (blueValue / maxValue) * 100 : 0;
          const redPercent = maxValue > 0 ? (redValue / maxValue) * 100 : 0;
          const isCurrentBlue = bluePlayer.puuid === currentPlayerPuuid;
          const isCurrentRed = redPlayer.puuid === currentPlayerPuuid;

          return (
            <div key={idx} className="flex items-center gap-2">
              {/* Blue Champion */}
              <img
                src={`${DD_CDN}/img/champion/${getChampionId(bluePlayer.championName)}.png`}
                alt={bluePlayer.championName}
                className={`w-8 h-8 rounded-full border-2 ${isCurrentBlue ? 'border-[#00ffff]' : 'border-[#00ffff]/30'}`}
                style={isCurrentBlue ? { boxShadow: '0 0 10px #00ffff' } : {}}
              />
              
              {/* Blue Value */}
              <div className={`text-right text-xs font-mono min-w-[50px] ${isCurrentBlue ? 'text-[#00ffff] font-bold' : 'text-[#00ffff]/70'}`}>
                {blueValue.toLocaleString()}
              </div>
              
              {/* Progress Bars */}
              <div className="flex-1 flex items-center gap-1">
                {/* Blue Bar */}
                <div className="flex-1 h-4 bg-[#0a0e27] rounded-l overflow-hidden flex justify-end">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${bluePercent}%`,
                      background: blueColor,
                      boxShadow: `0 0 10px ${blueColor}`
                    }}
                  />
                </div>
                
                {/* Red Bar */}
                <div className="flex-1 h-4 bg-[#0a0e27] rounded-r overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${redPercent}%`,
                      background: redColor,
                      boxShadow: `0 0 10px ${redColor}`
                    }}
                  />
                </div>
              </div>
              
              {/* Red Value */}
              <div className={`text-left text-xs font-mono min-w-[50px] ${isCurrentRed ? 'text-[#ff0000] font-bold' : 'text-[#ff0000]/70'}`}>
                {redValue.toLocaleString()}
              </div>
              
              {/* Red Champion */}
              <img
                src={`${DD_CDN}/img/champion/${getChampionId(redPlayer.championName)}.png`}
                alt={redPlayer.championName}
                className={`w-8 h-8 rounded-full border-2 ${isCurrentRed ? 'border-[#ff0000]' : 'border-[#ff0000]/30'}`}
                style={isCurrentRed ? { boxShadow: '0 0 10px #ff0000' } : {}}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Combined Damage Table */}
      <div
        className="border-2 rounded-lg p-6"
        style={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
          borderColor: '#66666640'
        }}
      >
        <div className="grid grid-cols-2 gap-6">
          {/* Damage Dealt */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚔️</span>
              <h3 className="text-lg font-mono uppercase tracking-wider text-[#666]">DAMAGE DEALT</h3>
            </div>
            
            <div className="space-y-3">
              {blueTeam.map((bluePlayer, idx) => {
                const redPlayer = redTeam[idx];
                const blueValue = bluePlayer.totalDamageDealtToChampions || 0;
                const redValue = redPlayer.totalDamageDealtToChampions || 0;
                const bluePercent = maxDamageDealt > 0 ? (blueValue / maxDamageDealt) * 100 : 0;
                const redPercent = maxDamageDealt > 0 ? (redValue / maxDamageDealt) * 100 : 0;
                const isCurrentBlue = bluePlayer.puuid === currentPlayerPuuid;
                const isCurrentRed = redPlayer.puuid === currentPlayerPuuid;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <img
                      src={`${DD_CDN}/img/champion/${getChampionId(bluePlayer.championName)}.png`}
                      alt={bluePlayer.championName}
                      className={`w-8 h-8 rounded-full border-2 ${isCurrentBlue ? 'border-[#00ffff]' : 'border-[#00ffff]/30'}`}
                      style={isCurrentBlue ? { boxShadow: '0 0 10px #00ffff' } : {}}
                    />
                    <div className={`text-right text-xs font-mono min-w-[50px] ${isCurrentBlue ? 'text-[#00ffff] font-bold' : 'text-[#00ffff]/70'}`}>
                      {blueValue.toLocaleString()}
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 h-4 bg-[#0a0e27] rounded-l overflow-hidden flex justify-end">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${bluePercent}%`,
                            background: '#00aaff',
                            boxShadow: '0 0 10px #00aaff'
                          }}
                        />
                      </div>
                      <div className="flex-1 h-4 bg-[#0a0e27] rounded-r overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${redPercent}%`,
                            background: '#ff0055',
                            boxShadow: '0 0 10px #ff0055'
                          }}
                        />
                      </div>
                    </div>
                    <div className={`text-left text-xs font-mono min-w-[50px] ${isCurrentRed ? 'text-[#ff0000] font-bold' : 'text-[#ff0000]/70'}`}>
                      {redValue.toLocaleString()}
                    </div>
                    <img
                      src={`${DD_CDN}/img/champion/${getChampionId(redPlayer.championName)}.png`}
                      alt={redPlayer.championName}
                      className={`w-8 h-8 rounded-full border-2 ${isCurrentRed ? 'border-[#ff0000]' : 'border-[#ff0000]/30'}`}
                      style={isCurrentRed ? { boxShadow: '0 0 10px #ff0000' } : {}}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Damage Received */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛡️</span>
              <h3 className="text-lg font-mono uppercase tracking-wider text-[#666]">DAMAGE RECEIVED</h3>
            </div>
            
            <div className="space-y-3">
              {blueTeam.map((bluePlayer, idx) => {
                const redPlayer = redTeam[idx];
                const blueValue = bluePlayer.totalDamageTaken || 0;
                const redValue = redPlayer.totalDamageTaken || 0;
                const bluePercent = maxDamageTaken > 0 ? (blueValue / maxDamageTaken) * 100 : 0;
                const redPercent = maxDamageTaken > 0 ? (redValue / maxDamageTaken) * 100 : 0;
                const isCurrentBlue = bluePlayer.puuid === currentPlayerPuuid;
                const isCurrentRed = redPlayer.puuid === currentPlayerPuuid;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <img
                      src={`${DD_CDN}/img/champion/${getChampionId(bluePlayer.championName)}.png`}
                      alt={bluePlayer.championName}
                      className={`w-8 h-8 rounded-full border-2 ${isCurrentBlue ? 'border-[#00ffff]' : 'border-[#00ffff]/30'}`}
                      style={isCurrentBlue ? { boxShadow: '0 0 10px #00ffff' } : {}}
                    />
                    <div className={`text-right text-xs font-mono min-w-[50px] ${isCurrentBlue ? 'text-[#00ffff] font-bold' : 'text-[#00ffff]/70'}`}>
                      {blueValue.toLocaleString()}
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 h-4 bg-[#0a0e27] rounded-l overflow-hidden flex justify-end">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${bluePercent}%`,
                            background: '#00aaff',
                            boxShadow: '0 0 10px #00aaff'
                          }}
                        />
                      </div>
                      <div className="flex-1 h-4 bg-[#0a0e27] rounded-r overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${redPercent}%`,
                            background: '#ff0055',
                            boxShadow: '0 0 10px #ff0055'
                          }}
                        />
                      </div>
                    </div>
                    <div className={`text-left text-xs font-mono min-w-[50px] ${isCurrentRed ? 'text-[#ff0000] font-bold' : 'text-[#ff0000]/70'}`}>
                      {redValue.toLocaleString()}
                    </div>
                    <img
                      src={`${DD_CDN}/img/champion/${getChampionId(redPlayer.championName)}.png`}
                      alt={redPlayer.championName}
                      className={`w-8 h-8 rounded-full border-2 ${isCurrentRed ? 'border-[#ff0000]' : 'border-[#ff0000]/30'}`}
                      style={isCurrentRed ? { boxShadow: '0 0 10px #ff0000' } : {}}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Three cards in one row: Income, Wards Placed, Wards Cleared */}
      <div className="grid grid-cols-3 gap-4">
        {/* Income */}
        {renderStatComparison(
          'INCOME',
          '💰',
          blueTeam,
          redTeam,
          'goldEarned',
          maxGold,
          '#ffaa00',
          '#ffaa00'
        )}
        
        {/* Wards Placed */}
        {renderStatComparison(
          'WARDS PLACED',
          '📍',
          blueTeam,
          redTeam,
          'wardsPlaced',
          maxWardsPlaced,
          '#ff00ff',
          '#ff00ff'
        )}
        
        {/* Wards Cleared */}
        {renderStatComparison(
          'WARDS CLEARED',
          '💥',
          blueTeam,
          redTeam,
          'wardsKilled',
          maxWardsKilled,
          '#ff00ff',
          '#ff00ff'
        )}
      </div>
    </div>
  );
}
