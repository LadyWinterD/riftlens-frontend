'use client';

import React from 'react';

interface TeamRosterProps {
  participants: any[];
  currentPlayerPuuid: string;
  teamId: number;
}

const POSITION_ORDER = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];

export default function TeamRoster({
  participants,
  currentPlayerPuuid,
  teamId
}: TeamRosterProps) {
  // 过滤并排序该队伍的玩家
  const teamPlayers = participants
    .filter((p) => p.teamId === teamId)
    .sort((a, b) => {
      const posA = POSITION_ORDER.indexOf(a.individualPosition || '');
      const posB = POSITION_ORDER.indexOf(b.individualPosition || '');
      return posA - posB;
    });

  const isWinningTeam = teamPlayers[0]?.win;

  // 格式化数字
  const formatNumber = (num: number) => {
    return num?.toLocaleString('zh-CN') || '0';
  };

  // 位置翻译
  const translatePosition = (position: string) => {
    const posMap: { [key: string]: string } = {
      TOP: '上路',
      JUNGLE: '打野',
      MIDDLE: '中路',
      BOTTOM: '下路',
      UTILITY: '辅助'
    };
    return posMap[position] || position;
  };

  return (
    <div className="mb-6">
      {/* 队伍标题 */}
      <div
        className={`flex items-center justify-between px-4 py-2 rounded-t-lg ${
          isWinningTeam
            ? 'bg-gradient-to-r from-green-900/30 to-green-800/20 border-b-2 border-green-500/50'
            : 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-b-2 border-red-500/50'
        }`}
      >
        <span className="font-bold text-white">
          {teamId === 100 ? '蓝色方' : '红色方'}
        </span>
        <span
          className={`text-sm font-semibold ${
            isWinningTeam ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isWinningTeam ? '胜利' : '失败'}
        </span>
      </div>

      {/* 玩家列表 */}
      <div className="bg-gray-800/30 rounded-b-lg overflow-hidden">
        {/* 表头 */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-900/50 text-xs text-gray-400 font-semibold">
          <div className="col-span-3">玩家</div>
          <div className="col-span-2 text-center">KDA</div>
          <div className="col-span-1 text-center">补刀</div>
          <div className="col-span-2 text-center">金币</div>
          <div className="col-span-2 text-center">伤害</div>
          <div className="col-span-2 text-center">视野</div>
        </div>

        {/* 玩家行 */}
        {teamPlayers.map((player, index) => {
          const isCurrentPlayer = player.puuid === currentPlayerPuuid;
          const totalCS =
            (player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0);

          return (
            <div
              key={player.puuid || index}
              className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-700/30 hover:bg-purple-500/10 transition-colors ${
                isCurrentPlayer ? 'bg-purple-500/20 border-l-4 border-l-purple-500' : ''
              }`}
            >
              {/* 玩家信息 */}
              <div className="col-span-3 flex items-center gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        isCurrentPlayer
                          ? 'bg-purple-500/30 text-purple-300'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}
                    >
                      {translatePosition(player.individualPosition || '')}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold mt-1 ${
                      isCurrentPlayer ? 'text-purple-300' : 'text-white'
                    }`}
                  >
                    {player.championName}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {player.summonerName}
                  </span>
                </div>
              </div>

              {/* KDA */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-semibold text-white">
                    {player.kills}/{player.deaths}/{player.assists}
                  </div>
                  <div className="text-xs text-gray-400">
                    {player.deaths > 0
                      ? ((player.kills + player.assists) / player.deaths).toFixed(1)
                      : 'Perfect'}
                  </div>
                </div>
              </div>

              {/* 补刀 */}
              <div className="col-span-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-semibold text-white">{totalCS}</div>
                  <div className="text-xs text-gray-500">
                    {player.csPerMin?.toFixed(1) || '0.0'}
                  </div>
                </div>
              </div>

              {/* 金币 */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="text-sm text-yellow-400">
                  {formatNumber(player.goldEarned || 0)}
                </div>
              </div>

              {/* 伤害 */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="text-sm text-red-400">
                  {formatNumber(player.totalDamageDealtToChampions || 0)}
                </div>
              </div>

              {/* 视野 */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-blue-400">{player.visionScore || 0}</div>
                  <div className="text-xs text-gray-500">
                    {player.wardsPlaced || 0}/{player.wardsKilled || 0}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
