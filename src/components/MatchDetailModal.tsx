'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import TeamRoster from './TeamRoster';
import LaneMatchupComparison from './LaneMatchupComparison';
import { postStatefulChatMessage } from '@/services/awsService';

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchData: any;
  playerPuuid: string;
  playerData?: any; // Full player data for AI analysis
}

export default function MatchDetailModal({
  isOpen,
  onClose,
  matchData,
  playerPuuid,
  playerData: fullPlayerData
}: MatchDetailModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  if (!isOpen || !matchData) return null;

  // Current matchData comes from matchHistory, build player data for display
  // Use match data as the base for player stats
  const playerMatchData = {
    puuid: playerPuuid,
    championName: matchData.championName,
    championLevel: matchData.championLevel || 18,
    individualPosition: matchData.position,
    summonerName: matchData.summonerName || 'Player',
    kills: matchData.kills,
    deaths: matchData.deaths,
    assists: matchData.assists,
    totalMinionsKilled: matchData.cs || 0,
    neutralMinionsKilled: 0,
    csPerMin: parseFloat(matchData.csPerMin) || 0,
    goldEarned: matchData.gold,
    totalDamageDealtToChampions: matchData.damage,
    visionScore: matchData.visionScore,
    wardsPlaced: matchData.wardsPlaced || 0,
    wardsKilled: matchData.wardsKilled || 0,
    item0: matchData.item0 || 0,
    item1: matchData.item1 || 0,
    item2: matchData.item2 || 0,
    item3: matchData.item3 || 0,
    item4: matchData.item4 || 0,
    item5: matchData.item5 || 0,
    item6: matchData.item6 || 0,
    win: matchData.win,
    teamId: 100 // Default blue side
  };

  if (!playerMatchData) return null;

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration
  const formatDuration = (seconds: number | string) => {
    if (!seconds) return '0:00';
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format number
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  // AI Analysis function
  const handleAIAnalysis = async () => {
    if (!fullPlayerData) {
      setAnalysisError('Player data not available');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const analysisQuestion = `Analyze my performance in this match (${matchData.championName}, ${matchData.win ? 'Victory' : 'Defeat'}). KDA: ${matchData.kills}/${matchData.deaths}/${matchData.assists}, CS: ${matchData.cs}, Damage: ${matchData.damage}. What should I improve?`;
      
      const aiResponse = await postStatefulChatMessage(
        fullPlayerData.PlayerID || playerPuuid,
        analysisQuestion,
        [], // Empty chat history for match analysis
        fullPlayerData
      );
      
      setAiAnalysis(aiResponse);
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      setAnalysisError(error.message || 'AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* 模态内容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-purple-500/30 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/30 p-6 flex justify-between items-center z-10">
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                MATCH DETAILS
              </h2>
              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <span>
                  {matchData.gameCreation ? formatTimestamp(matchData.gameCreation) : 'Recent Match'}
                </span>
                <span>•</span>
                <span>
                  Duration: {formatDuration(matchData.gameDurationInSec || matchData.gameDuration || 0)}
                </span>
                <span>•</span>
                <span className={playerMatchData.win ? 'text-green-400' : 'text-red-400'}>
                  {playerMatchData.win ? 'VICTORY' : 'DEFEAT'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Player Info Card */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-6">
                {/* Champion Avatar Placeholder */}
                <div className="w-24 h-24 bg-purple-500/20 rounded-lg flex items-center justify-center border-2 border-purple-500/50">
                  <span className="text-3xl font-bold text-purple-400">
                    {playerMatchData.championLevel}
                  </span>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {playerMatchData.championName}
                  </h3>
                  <div className="flex gap-4 text-sm">
                    <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300">
                      {playerMatchData.individualPosition || 'Unknown Position'}
                    </span>
                    <span className="px-3 py-1 bg-gray-700/50 rounded-full text-gray-300">
                      {playerMatchData.summonerName}
                    </span>
                  </div>
                </div>

                {/* KDA */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {playerMatchData.kills} / {playerMatchData.deaths} / {playerMatchData.assists}
                  </div>
                  <div className="text-sm text-gray-400">
                    KDA: {playerMatchData.deaths > 0
                      ? ((playerMatchData.kills + playerMatchData.assists) / playerMatchData.deaths).toFixed(2)
                      : 'Perfect'}
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">CS</div>
                  <div className="text-xl font-bold text-white">
                    {(playerMatchData.totalMinionsKilled || 0) + (playerMatchData.neutralMinionsKilled || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {playerMatchData.csPerMin || 0} / min
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Gold</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {formatNumber(playerMatchData.goldEarned || 0)}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Damage</div>
                  <div className="text-xl font-bold text-red-400">
                    {formatNumber(playerMatchData.totalDamageDealtToChampions || 0)}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Vision</div>
                  <div className="text-xl font-bold text-blue-400">
                    {playerMatchData.visionScore || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    {playerMatchData.wardsPlaced || 0} placed / {playerMatchData.wardsKilled || 0} killed
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mt-6">
                <div className="text-sm text-gray-400 mb-2">Items</div>
                <div className="flex gap-2">
                  {[
                    playerMatchData.item0,
                    playerMatchData.item1,
                    playerMatchData.item2,
                    playerMatchData.item3,
                    playerMatchData.item4,
                    playerMatchData.item5,
                    playerMatchData.item6
                  ].map((itemId, index) => {
                    if (!itemId || itemId === 0) {
                      return (
                        <div
                          key={index}
                          className="w-12 h-12 bg-gray-800/50 rounded border border-gray-700"
                        />
                      );
                    }
                    return (
                      <div
                        key={index}
                        className="w-12 h-12 bg-purple-500/20 rounded border border-purple-500/50 flex items-center justify-center"
                      >
                        <span className="text-xs text-purple-300">{itemId}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Note: Full match data needed */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-300 text-sm">
                💡 Note: Currently showing simplified data. Full 10-player match data and lane matchup features require complete match information from the API.
              </p>
            </div>

            {/* AI Analysis Button */}
            <div className="mb-6">
              <button
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'AI Analyzing...' : 'AI Analyze This Match'}</span>
              </button>

              {/* AI Analysis Result */}
              {aiAnalysis && (
                <div className="mt-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Analysis Result
                  </h4>
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {aiAnalysis}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {analysisError && (
                <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-300">{analysisError}</p>
                  <button
                    onClick={handleAIAnalysis}
                    className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* 10-Player Data - Hidden until full data available */}
            {matchData.participants && matchData.participants.length === 10 ? (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">All Players Data</h3>
                <TeamRoster
                  participants={matchData.participants}
                  currentPlayerPuuid={playerPuuid}
                  teamId={100}
                />
                <TeamRoster
                  participants={matchData.participants}
                  currentPlayerPuuid={playerPuuid}
                  teamId={200}
                />
                <LaneMatchupComparison
                  participants={matchData.participants}
                  currentPlayerPuuid={playerPuuid}
                />
              </div>
            ) : (
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 text-center">
                <p className="text-gray-400 mb-2">Full 10-player match data coming soon</p>
                <p className="text-sm text-gray-500">
                  We're preparing to display detailed data for all players and lane matchup analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
