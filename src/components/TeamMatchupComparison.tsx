'use client';

import { Trophy, Coins, Swords } from 'lucide-react';

interface TeamMatchupComparisonProps {
  participants: any[];
  currentPlayerPuuid: string;
}

export default function TeamMatchupComparison({
  participants,
  currentPlayerPuuid
}: TeamMatchupComparisonProps) {
  const team1 = participants.filter(p => p.teamId === 100);
  const team2 = participants.filter(p => p.teamId === 200);

  const team1Stats = {
    kills: team1.reduce((acc, p) => acc + (p.kills || 0), 0),
    gold: team1.reduce((acc, p) => acc + (p.goldEarned || 0), 0),
    damage: team1.reduce((acc, p) => acc + (p.totalDamageDealtToChampions || 0), 0)
  };

  const team2Stats = {
    kills: team2.reduce((acc, p) => acc + (p.kills || 0), 0),
    gold: team2.reduce((acc, p) => acc + (p.goldEarned || 0), 0),
    damage: team2.reduce((acc, p) => acc + (p.totalDamageDealtToChampions || 0), 0)
  };

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
          <Trophy className="w-6 h-6 text-[#00ffff]" />
        </div>
        <h3 className="text-2xl text-[#00ffff] uppercase tracking-wider font-mono">
          TEAM COMPARISON
        </h3>
      </div>

      <div className="space-y-4">
        {/* Kills Comparison */}
        <div
          className="rounded-lg p-5 border"
          style={{
            background: '#0a0e27',
            borderColor: '#00ff0040'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-5 h-5 text-[#00ff00]" />
            <span className="text-sm text-[#666] uppercase tracking-wider font-mono">
              TOTAL KILLS
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#00ffff]" />
              <span className="text-xs text-[#666]">Blue Team</span>
              <span className="text-3xl text-[#00ffff] ml-2 font-mono">{team1Stats.kills}</span>
            </div>
            <div 
              className="px-4 py-2 rounded-lg border font-mono" 
              style={{ background: '#1a1f3a', borderColor: '#66666640' }}
            >
              <span className="text-[#666] uppercase text-sm">VS</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl text-[#ff0000] mr-2 font-mono">{team2Stats.kills}</span>
              <span className="text-xs text-[#666]">Red Team</span>
              <div className="w-3 h-3 rounded-full bg-[#ff0000]" />
            </div>
          </div>
        </div>

        {/* Gold Comparison */}
        <div
          className="rounded-lg p-5 border"
          style={{
            background: '#0a0e27',
            borderColor: '#ffaa0040'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-5 h-5 text-[#ffaa00]" />
            <span className="text-sm text-[#666] uppercase tracking-wider font-mono">
              TOTAL GOLD
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#00ffff]" />
              <span className="text-xs text-[#666]">Blue Team</span>
              <span className="text-3xl text-[#ffaa00] ml-2 font-mono">
                {(team1Stats.gold / 1000).toFixed(1)}k
              </span>
            </div>
            <div 
              className="px-4 py-2 rounded-lg border font-mono" 
              style={{ background: '#1a1f3a', borderColor: '#66666640' }}
            >
              <span className="text-[#666] uppercase text-sm">VS</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl text-[#ff9900] mr-2 font-mono">
                {(team2Stats.gold / 1000).toFixed(1)}k
              </span>
              <span className="text-xs text-[#666]">Red Team</span>
              <div className="w-3 h-3 rounded-full bg-[#ff0000]" />
            </div>
          </div>
        </div>

        {/* Damage Comparison */}
        <div
          className="rounded-lg p-5 border"
          style={{
            background: '#0a0e27',
            borderColor: '#ff00ff40'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-5 h-5 text-[#ff00ff]" />
            <span className="text-sm text-[#666] uppercase tracking-wider font-mono">
              TOTAL DAMAGE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#00ffff]" />
              <span className="text-xs text-[#666]">Blue Team</span>
              <span className="text-3xl text-[#ff00ff] ml-2 font-mono">
                {(team1Stats.damage / 1000).toFixed(1)}k
              </span>
            </div>
            <div 
              className="px-4 py-2 rounded-lg border font-mono" 
              style={{ background: '#1a1f3a', borderColor: '#66666640' }}
            >
              <span className="text-[#666] uppercase text-sm">VS</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl text-[#ff0099] mr-2 font-mono">
                {(team2Stats.damage / 1000).toFixed(1)}k
              </span>
              <span className="text-xs text-[#666]">Red Team</span>
              <div className="w-3 h-3 rounded-full bg-[#ff0000]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
