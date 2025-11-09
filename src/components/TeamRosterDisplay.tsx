'use client';

import { Users } from 'lucide-react';

interface TeamRosterDisplayProps {
  participants: any[];
  currentPlayerPuuid: string;
}

const DD_VERSION = '15.22.1'; // Updated to latest version
const DD_CDN = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}`;

const POSITION_ORDER = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];

// Summoner Spell ID to Name mapping
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

const translatePosition = (position: string) => {
  const posMap: Record<string, string> = {
    TOP: 'Top',
    JUNGLE: 'Jungle',
    MIDDLE: 'Mid',
    BOTTOM: 'ADC',
    UTILITY: 'Support'
  };
  return posMap[position] || position;
};

export default function TeamRosterDisplay({
  participants,
  currentPlayerPuuid
}: TeamRosterDisplayProps) {
  // Split into teams
  const blueTeam = participants
    .filter(p => p.teamId === 100)
    .sort((a, b) => {
      const posA = POSITION_ORDER.indexOf(a.individualPosition || a.teamPosition || '');
      const posB = POSITION_ORDER.indexOf(b.individualPosition || b.teamPosition || '');
      return posA - posB;
    });

  const redTeam = participants
    .filter(p => p.teamId === 200)
    .sort((a, b) => {
      const posA = POSITION_ORDER.indexOf(a.individualPosition || a.teamPosition || '');
      const posB = POSITION_ORDER.indexOf(b.individualPosition || b.teamPosition || '');
      return posA - posB;
    });

  const isBlueWin = blueTeam[0]?.win;

  const renderTeam = (team: any[], teamName: string, teamColor: string, isWin: boolean) => (
    <div
      className="border-2 rounded-lg overflow-hidden"
      style={{
        borderColor: `${teamColor}40`,
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)'
      }}
    >

      {/* Team Header */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{
          background: `${teamColor}10`,
          borderColor: `${teamColor}30`
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: teamColor, boxShadow: `0 0 10px ${teamColor}` }}
          />
          <span className="text-lg font-mono uppercase tracking-wider" style={{ color: teamColor }}>
            {teamName}
          </span>
        </div>
        <span
          className="text-sm font-mono uppercase tracking-wider"
          style={{ color: isWin ? '#00ff00' : '#ff0000' }}
        >
          {isWin ? 'VICTORY' : 'DEFEAT'}
        </span>
      </div>

      {/* Players */}
      <div className="divide-y" style={{ borderColor: `${teamColor}20` }}>
        {team.map((player, index) => {
          const isCurrentPlayer = player.puuid === currentPlayerPuuid;
          const kda = player.deaths === 0 ? 999 : ((player.kills + player.assists) / player.deaths);
          
          return (
            <div
              key={player.puuid || index}
              className={`px-6 py-4 hover:bg-[#00ffff]/5 transition-colors ${
                isCurrentPlayer ? 'bg-[#00ffff]/10 border-l-4' : ''
              }`}
              style={isCurrentPlayer ? { borderLeftColor: '#00ffff' } : {}}
            >
              <div className="flex items-center gap-4">
                {/* Position & Champion */}
                <div className="flex items-center gap-3 w-48">
                  <div
                    className="px-2 py-1 rounded text-xs font-mono uppercase"
                    style={{
                      background: isCurrentPlayer ? '#00ffff20' : '#66666620',
                      color: isCurrentPlayer ? '#00ffff' : '#666'
                    }}
                  >
                    {translatePosition(player.individualPosition || player.teamPosition || '')}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isCurrentPlayer ? 'text-[#00ffff]' : 'text-white'}`}>
                      {player.championName}
                    </div>
                    <div className="text-xs text-[#666] truncate">
                      {player.summonerName}
                    </div>
                  </div>
                </div>

                {/* KDA */}
                <div className="w-32 text-center">
                  <div className="text-sm font-mono">
                    <span className="text-[#00ff00]">{player.kills}</span>
                    <span className="text-[#666]">/</span>
                    <span className="text-[#ff0000]">{player.deaths}</span>
                    <span className="text-[#666]">/</span>
                    <span className="text-[#ffff00]">{player.assists}</span>
                  </div>
                  <div className="text-xs text-[#666]">
                    {kda === 999 ? 'Perfect' : kda.toFixed(1)}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-xs font-mono">
                  <div>
                    <span className="text-[#666]">CS: </span>
                    <span className="text-[#ffff00]">
                      {(player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#666]">Gold: </span>
                    <span className="text-[#ffaa00]">
                      {((player.goldEarned || 0) / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[#666]">Dmg: </span>
                    <span className="text-[#ff0000]">
                      {((player.totalDamageDealtToChampions || 0) / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>

                {/* Summoner Spells */}
                <div className="flex gap-1">
                  {[player.summoner1Id, player.summoner2Id].map((spellId, idx) => {
                    const spellName = SUMMONER_SPELL_MAP[spellId as number];
                    if (!spellName) return null;
                    return (
                      <div
                        key={idx}
                        className="relative w-6 h-6 rounded border overflow-hidden"
                        style={{
                          background: '#0a0e27',
                          borderColor: '#ffff0030'
                        }}
                      >
                        <img
                          src={`/spells/${spellName}.png`}
                          alt={spellName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes('/spells/')) {
                              target.src = `${DD_CDN}/img/spell/${spellName}.png`;
                            } else {
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.fallback-icon')) {
                                const fallback = document.createElement('div');
                                fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center text-[6px] bg-[#1a1f3a] text-[#ffff00]';
                                fallback.textContent = '✨';
                                parent.appendChild(fallback);
                              }
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="flex gap-1 ml-auto">
                  {[
                    player.item0,
                    player.item1,
                    player.item2,
                    player.item3,
                    player.item4,
                    player.item5,
                    player.item6
                  ].map((itemId, idx) => {
                    const id = typeof itemId === 'number' ? itemId : parseInt(itemId) || 0;
                    return (
                      <div
                        key={idx}
                        className="relative w-8 h-8 rounded border overflow-hidden"
                        style={{
                          background: '#0a0e27',
                          borderColor: id > 0 ? '#00ffff30' : '#333'
                        }}
                      >
                        {id > 0 ? (
                          <img
                            src={`/items/${id}.png`}
                            alt={`Item ${id}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.includes('/items/')) {
                                target.src = `${DD_CDN}/img/item/${id}.png`;
                              } else {
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.item-fallback')) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'item-fallback absolute inset-0 flex items-center justify-center text-[6px] bg-[#1a1f3a] text-[#00ffff] font-mono leading-none';
                                  fallback.textContent = id.toString();
                                  parent.appendChild(fallback);
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[#0a0e27]/50" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className="border-2 rounded-lg p-6"
      style={{
        borderColor: '#00ffff40',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)'
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1))',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
          }}
        >
          <Users className="w-6 h-6 text-[#00ffff]" />
        </div>
        <h3 className="text-2xl text-[#00ffff] uppercase tracking-wider font-mono">
          ALL PLAYERS
        </h3>
      </div>

      <div className="space-y-4">
        {renderTeam(blueTeam, 'BLUE TEAM', '#00ffff', isBlueWin)}
        {renderTeam(redTeam, 'RED TEAM', '#ff0000', !isBlueWin)}
      </div>
    </div>
  );
}
