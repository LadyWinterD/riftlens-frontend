'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Target, Shield } from 'lucide-react';
import TeamMatchupComparison from './TeamMatchupComparison';
import LaneMatchupComparison from './LaneMatchupComparison';
import TeamRosterDisplay from './TeamRosterDisplay';
import TeamComparisonChart from './TeamComparisonChart';
import { postStatefulChatMessage, getTacticalAnalysis } from '@/services/awsService';

interface CyberMatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchData: any;
  playerPuuid: string;
  playerData?: any;
}

const DD_VERSION = '15.22.1'; // Updated to latest version
const DD_CDN = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}`;

// Summoner Spell ID to Name mapping
const SUMMONER_SPELL_MAP: Record<number, string> = {
  1: 'SummonerBoost',      // Cleanse
  3: 'SummonerExhaust',    // Exhaust
  4: 'SummonerFlash',      // Flash
  6: 'SummonerHaste',      // Ghost
  7: 'SummonerHeal',       // Heal
  11: 'SummonerSmite',     // Smite
  12: 'SummonerTeleport',  // Teleport
  13: 'SummonerMana',      // Clarity
  14: 'SummonerDot',       // Ignite
  21: 'SummonerBarrier',   // Barrier
  30: 'SummonerPoroRecall',
  31: 'SummonerPoroThrow',
  32: 'SummonerSnowball',  // Mark (ARAM)
  39: 'SummonerSnowURFSnowball_Mark',
  54: 'Summoner_UltBookPlaceholder',
  55: 'Summoner_UltBookSmitePlaceholder',
  2201: 'SummonerCherryHold',
  2202: 'SummonerCherryFlash',
};

export default function CyberMatchDetailModal({
  isOpen,
  onClose,
  matchData,
  playerPuuid,
  playerData: fullPlayerData
}: CyberMatchDetailModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // 重置 AI 分析状态当 matchData 改变时
  useEffect(() => {
    setAiAnalysis(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
  }, [matchData?.matchId, matchData?.gameId]); // 监听比赛 ID 的变化

  if (!isOpen || !matchData) return null;

  // Debug logging
  console.log('[CyberMatchDetailModal] matchData:', matchData);
  console.log('[CyberMatchDetailModal] championName:', matchData.championName);
  console.log('[CyberMatchDetailModal] participants:', matchData.participants);
  console.log('[CyberMatchDetailModal] participants length:', matchData.participants?.length);
  console.log('[CyberMatchDetailModal] participants type:', typeof matchData.participants);
  console.log('[CyberMatchDetailModal] has participants:', !!matchData.participants);
  console.log('[CyberMatchDetailModal] items:', [
    matchData.item0,
    matchData.item1,
    matchData.item2,
    matchData.item3,
    matchData.item4,
    matchData.item5,
    matchData.item6
  ]);

  const isWin = matchData.win;
  const winColor = isWin ? '#00ff00' : '#ff0000';
  const hasFullMatchData = matchData.participants && matchData.participants.length === 10;

  const formatDuration = (seconds: number | string) => {
    if (!seconds) return '0:00';
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    return num?.toLocaleString('en-US') || '0';
  };

  // 清理文本中的引号和特殊字符
  const cleanText = (text: string) => {
    return text
      .replace(/["""''「」『』]/g, '')
      .replace(/^["'\s]+|["'\s]+$/g, '')
      .trim();
  };

  // 渲染战术标签
  const renderTacticalTag = (tag: string) => {
    const tagConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
      'WARNING': { color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.15)', icon: '⚠️', label: 'WARNING' },
      'CRITICAL': { color: '#ff0000', bg: 'rgba(255, 0, 0, 0.15)', icon: '🚨', label: 'CRITICAL' },
      'NOTICE': { color: '#00ffff', bg: 'rgba(0, 255, 255, 0.15)', icon: 'ℹ️', label: 'NOTICE' },
      'SUGGESTION': { color: '#00ff00', bg: 'rgba(0, 255, 0, 0.15)', icon: '💡', label: 'SUGGESTION' },
    };

    const config = tagConfig[tag] || tagConfig['NOTICE'];
    
    return (
      <span 
        className="inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-xs uppercase tracking-wider mr-2"
        style={{ 
          color: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.color}`,
          textShadow: `0 0 10px ${config.color}`
        }}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  // 高亮数字和特殊文本
  const highlightText = (text: string) => {
    const cleanedText = cleanText(text);
    const parts = cleanedText.split(/(\[WARNING\]|\[CRITICAL\]|\[NOTICE\]|\[SUGGESTION\]|<item>.*?<\/item>|<champion>.*?<\/champion>|<stat>.*?<\/stat>|\d+[.,]?\d*%?|\b\d+\b|\b[A-Z]{2,}\b)/g);
    
    return parts.map((part, i) => {
      // 战术标签
      if (part.match(/^\[(WARNING|CRITICAL|NOTICE|SUGGESTION)\]$/)) {
        const tag = part.replace(/[\[\]]/g, '');
        return <span key={i}>{renderTacticalTag(tag)}</span>;
      }
      
      // 装备名称
      if (part.startsWith('<item>') && part.endsWith('</item>')) {
        const itemName = part.replace(/<\/?item>/g, '');
        return (
          <span 
            key={i} 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-sm bg-[#ff00ff]/20 border border-[#ff00ff]/50"
            style={{ color: '#ff00ff', textShadow: '0 0 10px rgba(255,0,255,0.8)' }}
          >
            <span>🎒</span>
            <span>{itemName}</span>
          </span>
        );
      }
      
      // 英雄名称
      if (part.startsWith('<champion>') && part.endsWith('</champion>')) {
        const champName = part.replace(/<\/?champion>/g, '');
        return (
          <span 
            key={i} 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-sm bg-[#00ffff]/20 border border-[#00ffff]/50"
            style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.8)' }}
          >
            <span>⚔️</span>
            <span>{champName}</span>
          </span>
        );
      }
      
      // 统计数据
      if (part.startsWith('<stat>') && part.endsWith('</stat>')) {
        const statValue = part.replace(/<\/?stat>/g, '');
        return (
          <span 
            key={i} 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-sm bg-[#ffaa00]/20 border border-[#ffaa00]/50"
            style={{ color: '#ffaa00', textShadow: '0 0 10px rgba(255,170,0,0.8)' }}
          >
            <span>📊</span>
            <span>{statValue}</span>
          </span>
        );
      }
      
      // 全大写词
      if (/^[A-Z]{2,}$/.test(part)) {
        return (
          <span 
            key={i} 
            className="font-bold text-[#ff6b6b]"
            style={{ textShadow: '0 0 8px rgba(255,107,107,0.6)' }}
          >
            {part}
          </span>
        );
      }
      
      // 数字
      if (/^\d+[.,]?\d*%?$/.test(part) || /^\d+$/.test(part)) {
        return (
          <span 
            key={i} 
            className="text-[#ffff00] font-bold"
            style={{ textShadow: '0 0 8px rgba(255,255,0,0.6)' }}
          >
            {part}
          </span>
        );
      }
      
      return <span key={i}>{part}</span>;
    });
  };

  // Format AI analysis with proper styling
  const formatAIAnalysis = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    
    lines.forEach((line, index) => {
      // 标题 (以 ### 开头)
      if (line.startsWith('### ')) {
        const title = cleanText(line.replace('### ', ''));
        elements.push(
          <h3 
            key={index} 
            className="text-2xl text-[#00ffff] font-bold uppercase tracking-wide mt-6 mb-3"
            style={{ textShadow: '0 0 15px #00ffff, 0 0 30px rgba(0,255,255,0.5)' }}
          >
            {title}
          </h3>
        );
      }
      // 子标题 (以 ## 开头)
      else if (line.startsWith('## ')) {
        const subtitle = cleanText(line.replace('## ', ''));
        elements.push(
          <h4 
            key={index} 
            className="text-sm text-[#ff6b6b] font-semibold uppercase tracking-wider mt-3 mb-1.5"
            style={{ textShadow: '0 0 8px rgba(255,107,107,0.5)' }}
          >
            {subtitle}
          </h4>
        );
      }
      // 粗体标题行
      else if (line.match(/^\*\*(.+?)\*\*$/)) {
        const boldText = cleanText(line.replace(/\*\*/g, ''));
        elements.push(
          <h4 
            key={index} 
            className="text-base text-[#ff6b6b] font-bold uppercase tracking-wide mt-3 mb-2"
            style={{ textShadow: '0 0 10px rgba(255,107,107,0.6)' }}
          >
            {boldText}
          </h4>
        );
      }
      // 重要信息 (以 >>> 开头)
      else if (line.startsWith('>>> ')) {
        elements.push(
          <div key={index} className="border-l-4 border-[#ff0000] bg-[#ff0000]/10 pl-4 py-2 my-2">
            <span className="text-[#ff0000] font-mono">{highlightText(line.replace('>>> ', ''))}</span>
          </div>
        );
      }
      // 成功/正向信息 (以 +++ 开头)
      else if (line.startsWith('+++ ')) {
        elements.push(
          <div key={index} className="border-l-4 border-[#00ff00] bg-[#00ff00]/10 pl-4 py-2 my-2">
            <span className="text-[#00ff00] font-mono">{highlightText(line.replace('+++ ', ''))}</span>
          </div>
        );
      }
      // 列表项 (以 - 或 • 开头)
      else if (line.match(/^[\-•]\s/)) {
        elements.push(
          <div key={index} className="flex items-start gap-3 my-1 ml-4">
            <span className="text-[#00ffff] mt-1">▸</span>
            <span className="text-[#ccc] font-mono flex-1">{highlightText(line.replace(/^[\-•]\s/, ''))}</span>
          </div>
        );
      }
      // 数字列表 (以数字. 开头)
      else if (line.match(/^\d+\.\s/)) {
        const number = line.match(/^(\d+)\.\s/)?.[1];
        const content = line.replace(/^\d+\.\s/, '');
        elements.push(
          <div key={index} className="flex items-start gap-3 my-1 ml-4">
            <span className="text-[#ffff00] font-mono min-w-[24px] font-bold">{number}.</span>
            <span className="text-[#ccc] font-mono flex-1">{highlightText(content)}</span>
          </div>
        );
      }
      // 分隔线
      else if (line.trim() === '---') {
        elements.push(
          <div key={index} className="my-4 h-px bg-gradient-to-r from-transparent via-[#00ffff] to-transparent" />
        );
      }
      // 空行
      else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      }
      // 普通文本
      else {
        elements.push(
          <p key={index} className="text-[#bbb] font-mono my-1 leading-relaxed text-base">
            {highlightText(line)}
          </p>
        );
      }
    });
    
    return elements;
  };



  const getChampionId = (champion: string) => {
    if (!champion) return 'Aatrox';
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

  const champId = getChampionId(matchData?.championName);

  // 分析阵容类型
  const analyzeTeamComposition = (participants: any[], teamId: number) => {
    const team = participants.filter(p => p.teamId === teamId);
    let adCount = 0;
    let apCount = 0;
    let tankCount = 0;
    let ccCount = 0;
    
    team.forEach(p => {
      // 简单判断：物理伤害 > 魔法伤害 = AD
      if (p.physicalDamageDealtToChampions > p.magicDamageDealtToChampions) {
        adCount++;
      } else {
        apCount++;
      }
      
      // 判断坦克（承伤高）
      if (p.totalDamageTaken > 25000) {
        tankCount++;
      }
    });
    
    return { adCount, apCount, tankCount, ccCount, champions: team.map(p => p.championName) };
  };

  // AI Analysis function
  const handleAIAnalysis = async () => {
    if (!fullPlayerData) {
      setAnalysisError('Player data not available. Cannot perform analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiAnalysis(null);

    try {
      // 检查是否有完整的 10 人数据
      const hasFullMatchData = matchData.participants && matchData.participants.length === 10;
      
      if (hasFullMatchData) {
        // 完整战术分析（有 10 人数据）
        console.log('[CyberMatchDetailModal] Using full tactical analysis with 10-player data');
        
        const playerTeamId = matchData.teamId;
        const enemyTeamId = playerTeamId === 100 ? 200 : 100;

        const getKDAString = (p: any) => `${p.kills}/${p.deaths}/${p.assists}`;

        const allParticipants = matchData.participants.map((p: any) => ({
          championName: p.championName,
          role: p.position || p.lane,
          kda: getKDAString(p),
          totalDamageDealtToChampions: p.totalDamageDealtToChampions,
          totalDamageTaken: p.totalDamageTaken,
          teamId: p.teamId
        }));

        const myTeamData = allParticipants.filter((p: any) => p.teamId === playerTeamId);
        const enemyTeamData = allParticipants.filter((p: any) => p.teamId === enemyTeamId);

        const playerScoreboardData = {
          kda: getKDAString(matchData),
          cs: matchData.cs || 0,
          csPerMin: matchData.csPerMin || 0,
          gameDurationMinutes: Math.floor((matchData.gameDurationInSec || matchData.gameDuration || 0) / 60),
          finalItems: [matchData.item0, matchData.item1, matchData.item2,
                       matchData.item3, matchData.item4, matchData.item5, matchData.item6]
                       .filter(id => id && id > 0),
          damageDealt: matchData.damage || 0,
          damageTaken: matchData.totalDamageTaken || 0,
          visionScore: matchData.visionScore || 0,
          championLevel: matchData.championLevel || 18
        };

        const gameDataForAI = {
          myTeam: myTeamData,
          enemyTeam: enemyTeamData,
          player: {
            championName: matchData.championName,
            role: matchData.position || 'UNKNOWN',
            scoreboard: playerScoreboardData
          },
          gameResult: matchData.win ? "Win" : "Loss" as "Win" | "Loss"
        };

        console.log("[CyberMatchDetailModal] Sending full tactical data for analysis:", gameDataForAI);

        const aiResponse = await getTacticalAnalysis(
          fullPlayerData.PlayerID || playerPuuid,
          gameDataForAI,
          [],
          fullPlayerData
        );

        setAiAnalysis(aiResponse);
      } else {
        // 简化分析（只有玩家自己的数据）
        console.log('[CyberMatchDetailModal] Using simplified analysis (no 10-player data available)');
        
        // 安全地转换数值
        const safeNumber = (val: any, decimals: number = 1) => {
          const num = Number(val);
          return isNaN(num) ? '0' : num.toFixed(decimals);
        };
        
        const csPerMin = safeNumber(matchData.csPerMin, 1);
        const kda = matchData.deaths === 0 ? 'Perfect' : safeNumber((matchData.kills + matchData.assists) / matchData.deaths, 2);
        
        const simplifiedQuestion = `Analyze my performance in this match:

Champion: ${matchData.championName}
Result: ${matchData.win ? 'Victory' : 'Defeat'}
KDA: ${matchData.kills}/${matchData.deaths}/${matchData.assists} (KDA: ${kda})
CS: ${matchData.cs || 0} (${csPerMin} per min)
Damage Dealt: ${(matchData.damage || 0).toLocaleString()}
Damage Taken: ${(matchData.totalDamageTaken || 0).toLocaleString()}
Vision Score: ${matchData.visionScore || 0}
Game Duration: ${Math.floor((matchData.gameDurationInSec || matchData.gameDuration || 0) / 60)} minutes
Items: ${[matchData.item0, matchData.item1, matchData.item2, matchData.item3, matchData.item4, matchData.item5, matchData.item6].filter(id => id && id > 0).join(', ')}

Provide tactical insights and improvement suggestions based on this performance data. Focus on:
1. KDA analysis - was I too aggressive or too passive?
2. Farming efficiency - is my CS/min good for this champion?
3. Damage output - did I contribute enough damage?
4. Vision control - was my vision score adequate?
5. Overall performance rating and key areas to improve.

Use the format with [WARNING], [CRITICAL], [NOTICE], and [SUGGESTION] tags.`;

        const aiResponse = await postStatefulChatMessage(
          fullPlayerData.PlayerID || playerPuuid,
          simplifiedQuestion,
          [],
          fullPlayerData
        );

        setAiAnalysis(aiResponse);
      }
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      setAnalysisError(error.message || 'AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-[#0a0e27] border-2 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          style={{
            borderColor: winColor,
            boxShadow: `0 0 30px ${winColor}50`,
            animation: 'slideUp 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated border effect */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${winColor}30, transparent)`,
              animation: 'borderPulse 2s infinite'
            }}
          />

          {/* Header */}
          <div 
            className="relative border-b p-6 flex justify-between items-center"
            style={{ borderColor: `${winColor}30`, background: 'rgba(10, 14, 39, 0.95)' }}
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="text-3xl"
                  style={{ filter: `drop-shadow(0 0 10px ${winColor})` }}
                >
                  {isWin ? '✓' : '✗'}
                </div>
                <h2
                  className="text-3xl font-mono uppercase tracking-wider"
                  style={{
                    color: winColor,
                    textShadow: `0 0 20px ${winColor}`
                  }}
                >
                  {isWin ? 'VICTORY' : 'DEFEAT'}
                </h2>
              </div>
              <div className="flex gap-4 text-sm text-[#666] font-mono">
                <span>DURATION: <span className="text-[#00ffff]">
                  {formatDuration(matchData.gameDurationInSec || matchData.gameDuration || 0)}
                </span></span>
                <span>•</span>
                <span>MODE: <span className="text-[#ffff00]">RANKED SOLO</span></span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#ff0000]/20 rounded-lg transition-all border border-[#ff0000]/30"
              style={{ boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)' }}
            >
              <X className="w-6 h-6 text-[#ff0000]" />
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* AI Analysis Section - Moved to top */}
            <div
              className="border-2 rounded-lg p-6"
              style={{
                borderColor: '#ff00ff40',
                background: 'linear-gradient(135deg, #1a0a27 0%, #0a1a27 100%)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles 
                  className="w-6 h-6 text-[#ff00ff]" 
                  style={{ filter: 'drop-shadow(0 0 10px #ff00ff)' }} 
                />
                <h3 className="text-xl font-mono uppercase tracking-wider text-[#ff00ff]">
                  GAME INSIGHTS
                </h3>
              </div>

              {!aiAnalysis ? (
                <button
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full border-2 rounded-lg py-4 px-6 font-mono uppercase tracking-wider transition-all hover:bg-[#ff00ff]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: '#ff00ff',
                    color: '#ff00ff',
                    boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)'
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzing ? 'AI COMPUTING...' : 'GET AI INSIGHTS'}</span>
                  </div>
                </button>
              ) : (
                <div className="space-y-4">
                  {formatAIAnalysis(aiAnalysis)}
                </div>
              )}

              {analysisError && (
                <div className="mt-4 border rounded-lg p-4" style={{ background: '#0a0e27', borderColor: '#ff000040' }}>
                  <p className="text-sm text-[#ff0000] font-mono">{analysisError}</p>
                  <button
                    onClick={handleAIAnalysis}
                    className="mt-2 text-sm text-[#ff0000] hover:text-[#ff0000]/80 underline"
                  >
                    RETRY
                  </button>
                </div>
              )}
            </div>

            {/* Player Performance Card */}
            <div
              className="relative border-2 rounded-lg p-6 overflow-hidden"
              style={{
                borderColor: `${winColor}40`,
                background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)'
              }}
            >
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ffff 2px, #00ffff 4px)',
                  animation: 'glitchSlide 3s linear infinite'
                }}
              />
              
              <div className="relative flex items-center gap-6">
                {/* Champion Avatar */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="relative w-32 h-32 rounded-full overflow-hidden border-4 bg-[#0a0e27]"
                    style={{
                      borderColor: winColor,
                      boxShadow: `0 0 30px ${winColor}80`
                    }}
                  >
                    <img
                      src={`${DD_CDN}/img/champion/${champId}.png`}
                      alt={matchData.championName}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono"
                      style={{
                        background: '#0a0e27',
                        borderColor: '#00ffff',
                        boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
                      }}
                    >
                      <span className="text-[#00ffff]">{matchData.championLevel || 18}</span>
                    </div>
                  </div>
                  <div className="text-[#00ffff] uppercase tracking-wider font-mono">
                    {matchData.championName}
                  </div>
                  <div className="text-xs text-[#666] font-mono">
                    {matchData.position || 'UNKNOWN'}
                  </div>
                  
                  {/* Summoner Spells */}
                  <div className="flex gap-2 mt-2">
                    {[matchData.summoner1Id, matchData.summoner2Id].map((spellId, idx) => {
                      const spellName = SUMMONER_SPELL_MAP[spellId as number];
                      if (!spellName) return null;
                      return (
                        <div
                          key={idx}
                          className="relative w-8 h-8 rounded border-2 overflow-hidden"
                          style={{
                            background: '#0a0e27',
                            borderColor: '#ffff0040',
                            boxShadow: '0 0 10px rgba(255, 255, 0, 0.2)'
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
                                  fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center text-xs bg-[#1a1f3a] text-[#ffff00]';
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
                </div>

                {/* Vertical divider */}
                <div className="w-px h-32 bg-gradient-to-b from-transparent via-[#00ffff] to-transparent" />

                {/* Stats Grid */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {/* KDA */}
                  <div className="col-span-2">
                    <div className="text-xs text-[#666] font-mono mb-2">COMBAT PERFORMANCE</div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 font-mono text-2xl">
                        <span className="text-[#00ff00]">{matchData.kills}</span>
                        <span className="text-[#666]">/</span>
                        <span className="text-[#ff0000]">{matchData.deaths}</span>
                        <span className="text-[#666]">/</span>
                        <span className="text-[#ffff00]">{matchData.assists}</span>
                      </div>
                      <div
                        className="px-4 py-2 rounded border font-mono"
                        style={{
                          background: '#0a0e27',
                          borderColor: '#00ffff40',
                          boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)'
                        }}
                      >
                        <span className="text-xs text-[#666]">KDA: </span>
                        <span className="text-[#00ffff]">
                          {matchData.deaths === 0 ? 'PERFECT' : ((matchData.kills + matchData.assists) / matchData.deaths).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CS */}
                  <div
                    className="border rounded-lg p-3"
                    style={{ background: '#0a0e27', borderColor: '#ffff0040' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-[#ffff00]" />
                      <span className="text-xs text-[#666] font-mono">MINIONS</span>
                    </div>
                    <div className="text-xl text-[#ffff00] font-mono">{matchData.cs || 0}</div>
                    <div className="text-xs text-[#666] font-mono">{matchData.csPerMin || 0} / min</div>
                  </div>

                  {/* Damage */}
                  <div
                    className="border rounded-lg p-3"
                    style={{ background: '#0a0e27', borderColor: '#ff000040' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-[#ff0000]" />
                      <span className="text-xs text-[#666] font-mono">DAMAGE</span>
                    </div>
                    <div className="text-xl text-[#ff0000] font-mono">{formatNumber(matchData.damage || 0)}</div>
                  </div>

                  {/* Gold */}
                  <div
                    className="border rounded-lg p-3"
                    style={{ background: '#0a0e27', borderColor: '#ffaa0040' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#ffaa00]">💰</span>
                      <span className="text-xs text-[#666] font-mono">GOLD</span>
                    </div>
                    <div className="text-xl text-[#ffaa00] font-mono">{formatNumber(matchData.gold || 0)}</div>
                  </div>

                  {/* Vision */}
                  <div
                    className="border rounded-lg p-3"
                    style={{ background: '#0a0e27', borderColor: '#ff00ff40' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-[#ff00ff]" />
                      <span className="text-xs text-[#666] font-mono">VISION</span>
                    </div>
                    <div className="text-xl text-[#ff00ff] font-mono">{matchData.visionScore || 0}</div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mt-6 pt-6 border-t" style={{ borderColor: `${winColor}20` }}>
                <div className="text-xs text-[#666] font-mono mb-3 uppercase tracking-wider">
                  EQUIPMENT LOADOUT
                </div>
                <div className="flex gap-2">
                  {[
                    matchData.item0,
                    matchData.item1,
                    matchData.item2,
                    matchData.item3,
                    matchData.item4,
                    matchData.item5,
                    matchData.item6
                  ].map((itemId, index) => {
                    const id = typeof itemId === 'number' ? itemId : parseInt(itemId) || 0;
                    return (
                      <div
                        key={index}
                        className="relative w-14 h-14 rounded border-2 overflow-hidden"
                        style={{
                          background: '#0a0e27',
                          borderColor: id > 0 ? '#00ffff40' : '#333',
                          boxShadow: id > 0 ? '0 0 10px rgba(0, 255, 255, 0.2)' : 'none'
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
                                if (parent && !parent.querySelector('.fallback-text')) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'fallback-text absolute inset-0 flex items-center justify-center text-[8px] bg-[#1a1f3a] text-[#00ffff] font-mono leading-none';
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

            {/* Team & Lane Matchup */}
            {hasFullMatchData ? (
              <>
                <TeamComparisonChart
                  participants={matchData.participants}
                  currentPlayerPuuid={playerPuuid}
                />
                <LaneMatchupComparison
                  participants={matchData.participants}
                  currentPlayerPuuid={playerPuuid}
                />
                <TeamRosterDisplay
                  participants={matchData.participants}
                  currentPlayerPuuid={playerPuuid}
                />
              </>
            ) : (
              <div
                className="border-2 rounded-lg p-6 text-center"
                style={{
                  borderColor: '#00ffff40',
                  background: 'linear-gradient(135deg, #0a1a1f 0%, #0a1f1a 100%)'
                }}
              >
                <div className="text-[#00ffff] mb-2">ℹ️ SIMPLIFIED VIEW</div>
                <p className="text-sm text-[#888] font-mono mb-3">
                  Showing your performance stats. Full team analysis available with enhanced match data.
                </p>
                <p className="text-xs text-[#666] font-mono">
                  💡 Tip: AI Insights can still analyze your individual performance - click "GET AI INSIGHTS" above!
                </p>
              </div>
            )}


          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        @keyframes borderPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes glitchSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}
