'use client';

import { Swords, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface LaneMatchupComparisonProps {
  participants: any[];
  currentPlayerPuuid: string;
}

export default function LaneMatchupComparison({
  participants,
  currentPlayerPuuid
}: LaneMatchupComparisonProps) {
  const currentPlayer = participants.find(p => p.puuid === currentPlayerPuuid);
  const opponent = participants.find(p =>
    (p.individualPosition === currentPlayer?.individualPosition || 
     p.teamPosition === currentPlayer?.teamPosition) &&
    p.teamId !== currentPlayer?.teamId
  );

  if (!currentPlayer || !opponent) {
    return (
      <div className="bg-[#0a0e27] border border-[#666]/30 rounded-lg p-6 text-center">
        <p className="text-[#666] font-mono">Lane opponent data not available</p>
      </div>
    );
  }

  const playerKDA = currentPlayer.deaths === 0 ? 999 :
    ((currentPlayer.kills + currentPlayer.assists) / currentPlayer.deaths);
  const opponentKDA = opponent.deaths === 0 ? 999 :
    ((opponent.kills + opponent.assists) / opponent.deaths);

  const playerCS = (currentPlayer.totalMinionsKilled || 0) + (currentPlayer.neutralMinionsKilled || 0);
  const opponentCS = (opponent.totalMinionsKilled || 0) + (opponent.neutralMinionsKilled || 0);
  const csDiff = playerCS - opponentCS;

  const goldDiff = (currentPlayer.goldEarned || 0) - (opponent.goldEarned || 0);
  const damageDiff = (currentPlayer.totalDamageDealtToChampions || 0) - (opponent.totalDamageDealtToChampions || 0);

  const position = currentPlayer.individualPosition || currentPlayer.teamPosition || 'UNKNOWN';

  return (
    <div
      className="border-2 rounded-lg p-6"
      style={{
        borderColor: '#ff990040',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)'
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.2), rgba(255, 153, 0, 0.1))',
            boxShadow: '0 0 20px rgba(255, 153, 0, 0.3)'
          }}
        >
          <Swords className="w-6 h-6 text-[#ff9900]" />
        </div>
        <h3 className="text-2xl text-[#ff9900] uppercase tracking-wider font-mono">
          LANE MATCHUP - {position}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Stats */}
        <div
          className="rounded-lg p-6 border-2"
          style={{
            borderColor: '#00ffff60',
            background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.05))'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#666] uppercase tracking-wider font-mono">YOU</span>
            <div className="px-3 py-1 rounded-full" style={{ background: '#00ffff20' }}>
              <span className="text-xs text-[#00ffff] font-mono">BLUE SIDE</span>
            </div>
          </div>
          <div className="text-center mb-6">
            <div className="text-3xl text-[#00ffff] mb-2 font-mono">{currentPlayer.championName}</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl text-[#00ff00] font-mono">{currentPlayer.kills}</span>
              <span className="text-2xl text-[#666]">/</span>
              <span className="text-4xl text-[#ff0000] font-mono">{currentPlayer.deaths}</span>
              <span className="text-2xl text-[#666]">/</span>
              <span className="text-4xl text-[#ffff00] font-mono">{currentPlayer.assists}</span>
            </div>
            <div
              className="inline-block px-4 py-2 rounded-lg border"
              style={{
                background: '#00ffff10',
                borderColor: '#00ffff30'
              }}
            >
              <span className="text-xs text-[#666]">KDA: </span>
              <span className="text-[#00ffff] font-mono">
                {playerKDA === 999 ? 'Perfect' : playerKDA.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#00ffff10' }}>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ffaa00]" />
                <span className="text-sm text-[#666] font-mono">Gold</span>
              </div>
              <span className="text-[#ffaa00] font-mono">
                {((currentPlayer.goldEarned || 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#00ffff10' }}>
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#ff0000]" />
                <span className="text-sm text-[#666] font-mono">Damage</span>
              </div>
              <span className="text-[#ff0000] font-mono">
                {((currentPlayer.totalDamageDealtToChampions || 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#00ffff10' }}>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ffff00]" />
                <span className="text-sm text-[#666] font-mono">CS</span>
              </div>
              <span className="text-[#ffff00] font-mono">{playerCS}</span>
            </div>
          </div>
        </div>

        {/* Opponent Stats */}
        <div
          className="rounded-lg p-6 border-2"
          style={{
            borderColor: '#ff000060',
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.05))'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#666] uppercase tracking-wider font-mono">OPPONENT</span>
            <div className="px-3 py-1 rounded-full" style={{ background: '#ff000020' }}>
              <span className="text-xs text-[#ff0000] font-mono">RED SIDE</span>
            </div>
          </div>
          <div className="text-center mb-6">
            <div className="text-3xl text-[#ff0000] mb-2 font-mono">{opponent.championName}</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl text-[#00ff00] font-mono">{opponent.kills}</span>
              <span className="text-2xl text-[#666]">/</span>
              <span className="text-4xl text-[#ff0000] font-mono">{opponent.deaths}</span>
              <span className="text-2xl text-[#666]">/</span>
              <span className="text-4xl text-[#ffff00] font-mono">{opponent.assists}</span>
            </div>
            <div
              className="inline-block px-4 py-2 rounded-lg border"
              style={{
                background: '#ff000010',
                borderColor: '#ff000030'
              }}
            >
              <span className="text-xs text-[#666]">KDA: </span>
              <span className="text-[#ff0000] font-mono">
                {opponentKDA === 999 ? 'Perfect' : opponentKDA.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#ff000010' }}>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ffaa00]" />
                <span className="text-sm text-[#666] font-mono">Gold</span>
              </div>
              <span className="text-[#ffaa00] font-mono">
                {((opponent.goldEarned || 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#ff000010' }}>
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#ff0000]" />
                <span className="text-sm text-[#666] font-mono">Damage</span>
              </div>
              <span className="text-[#ff0000] font-mono">
                {((opponent.totalDamageDealtToChampions || 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#ff000010' }}>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ffff00]" />
                <span className="text-sm text-[#666] font-mono">CS</span>
              </div>
              <span className="text-[#ffff00] font-mono">{opponentCS}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Differences */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div
          className="rounded-lg p-4 text-center border"
          style={{
            background: csDiff >= 0 ? '#00ff0010' : '#ff000010',
            borderColor: csDiff >= 0 ? '#00ff0030' : '#ff000030'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {csDiff >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#00ff00]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#ff0000]" />
            )}
            <span className="text-xs text-[#666] font-mono">CS DIFF</span>
          </div>
          <div className={`text-2xl font-mono ${csDiff >= 0 ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
            {csDiff >= 0 ? '+' : ''}{csDiff}
          </div>
        </div>

        <div
          className="rounded-lg p-4 text-center border"
          style={{
            background: goldDiff >= 0 ? '#00ff0010' : '#ff000010',
            borderColor: goldDiff >= 0 ? '#00ff0030' : '#ff000030'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {goldDiff >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#00ff00]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#ff0000]" />
            )}
            <span className="text-xs text-[#666] font-mono">GOLD DIFF</span>
          </div>
          <div className={`text-2xl font-mono ${goldDiff >= 0 ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
            {goldDiff >= 0 ? '+' : ''}{(goldDiff / 1000).toFixed(1)}k
          </div>
        </div>

        <div
          className="rounded-lg p-4 text-center border"
          style={{
            background: damageDiff >= 0 ? '#00ff0010' : '#ff000010',
            borderColor: damageDiff >= 0 ? '#00ff0030' : '#ff000030'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {damageDiff >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#00ff00]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#ff0000]" />
            )}
            <span className="text-xs text-[#666] font-mono">DMG DIFF</span>
          </div>
          <div className={`text-2xl font-mono ${damageDiff >= 0 ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
            {damageDiff >= 0 ? '+' : ''}{(damageDiff / 1000).toFixed(1)}k
          </div>
        </div>
      </div>
    </div>
  );
}
