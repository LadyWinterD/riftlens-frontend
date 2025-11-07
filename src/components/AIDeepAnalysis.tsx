import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from './ui/scroll-area';
import { X } from 'lucide-react';

interface DeepAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  analysisType: 'diagnostic' | 'performance' | 'champion' | 'mistakes' | null;
  playerData?: any; // AWS playerData
}

// Mock detailed data
const DEEP_ANALYSIS_DATA = {
  diagnostic: {
    title: 'FULL SYSTEM DIAGNOSTIC',
    subtitle: 'Neural Performance Matrix Analysis',
    icon: '🔍',
    color: '#00ffff',
    sections: [
      {
        title: 'COMBAT EFFICIENCY',
        metrics: [
          { label: 'Kill Participation', value: 68, max: 100, status: 'warning', detail: 'Below optimal threshold. Target: 75%+' },
          { label: 'Damage Per Minute', value: 542, max: 800, status: 'good', detail: 'Above average for jungle role' },
          { label: 'Combat Positioning', value: 45, max: 100, status: 'critical', detail: 'Frequently caught out of position' },
          { label: 'Skirmish Win Rate', value: 61, max: 100, status: 'good', detail: '2v2 and 3v3 performance solid' },
        ]
      },
      {
        title: 'MACRO GAMEPLAY',
        metrics: [
          { label: 'Objective Control', value: 72, max: 100, status: 'good', detail: 'Dragon/Baron timing excellent' },
          { label: 'Map Presence', value: 58, max: 100, status: 'warning', detail: 'Top side neglected in 40% of games' },
          { label: 'Wave Management', value: 34, max: 100, status: 'critical', detail: 'Ignoring wave states for ganks' },
          { label: 'Recall Timing', value: 51, max: 100, status: 'warning', detail: 'Missing optimal back windows' },
        ]
      },
      {
        title: 'VISION & INFORMATION',
        metrics: [
          { label: 'Vision Score/Min', value: 1.2, max: 2.0, status: 'warning', detail: 'Ward placement frequency low' },
          { label: 'Control Ward Usage', value: 3.2, max: 5.0, status: 'warning', detail: 'Average 3.2 per game, need 4.5+' },
          { label: 'Enemy Ward Denial', value: 8.5, max: 15, status: 'critical', detail: 'Sweeper usage suboptimal' },
          { label: 'Map Awareness', value: 62, max: 100, status: 'good', detail: 'React to pings quickly' },
        ]
      }
    ],
    recommendations: [
      { priority: 'HIGH', text: 'Practice positioning drills in training mode - 15min daily', impact: '+12% survival rate' },
      { priority: 'HIGH', text: 'Study wave management basics - watch educational content', impact: '+8% CS advantage' },
      { priority: 'MEDIUM', text: 'Increase pink ward purchases - aim for 4-5 per game', impact: '+15% vision control' },
      { priority: 'LOW', text: 'Review minimap every 3-5 seconds during gameplay', impact: '+6% map awareness' },
    ]
  },
  performance: {
    title: 'PERFORMANCE TRAJECTORY',
    subtitle: 'Win Rate & Skill Trend Analysis',
    icon: '📊',
    color: '#ff00ff',
    timeline: [
      { period: 'Last 7 Days', wr: 45, kda: 3.2, trend: 'down', note: 'Tilt detected after 3-game loss streak' },
      { period: 'Last 14 Days', wr: 52, kda: 3.8, trend: 'stable', note: 'Consistent performance plateau' },
      { period: 'Last 30 Days', wr: 58, kda: 4.1, trend: 'up', note: 'Peak performance period' },
      { period: 'All Time', wr: 54, kda: 3.7, trend: 'stable', note: 'Overall baseline established' },
    ],
    insights: [
      { type: 'STRENGTH', text: 'Your early game (0-15min) is 23% stronger than late game', icon: '▲' },
      { type: 'WEAKNESS', text: 'Performance drops 31% after first death', icon: '▼' },
      { type: 'PATTERN', text: 'Win rate increases to 67% when taking first dragon', icon: '◆' },
      { type: 'TREND', text: 'Mechanics improving +8% month-over-month', icon: '▲' },
    ]
  },
  champion: {
    title: 'CHAMPION POOL MATRIX',
    subtitle: 'Mastery Level & Optimization Analysis',
    icon: '🎯',
    color: '#ffff00',
    champions: [
      { name: 'Volibear', icon: '🐻', mastery: 'S', games: 5, wr: 60, kda: 4.2, notes: 'Main pick - optimal', strengths: ['Early ganks', 'Team fights'], weaknesses: ['Late scaling'] },
      { name: 'Kayn', icon: '⚔️', mastery: 'A', games: 4, wr: 50, kda: 3.8, notes: 'Inconsistent form choice', strengths: ['Mobility', 'Outplay potential'], weaknesses: ['Form timing'] },
      { name: 'Shaco', icon: '🃏', mastery: 'C', games: 3, wr: 33, kda: 2.9, notes: 'Drop from pool', strengths: ['Early pressure'], weaknesses: ['Team fights', 'Late game'] },
      { name: 'Lee Sin', icon: '👊', mastery: 'B', games: 3, wr: 67, kda: 3.5, notes: 'High potential', strengths: ['Mechanics', 'Early game'], weaknesses: ['Consistency'] },
      { name: 'Graves', icon: '🔫', mastery: 'S', games: 2, wr: 100, kda: 5.0, notes: 'Add to main pool', strengths: ['All stages', 'Carry potential'], weaknesses: ['None detected'] },
    ],
    recommendations: [
      '🎯 PRIMARY POOL: Volibear, Graves, Lee Sin (3 champions)',
      '⚠️ DROP: Shaco - 33% WR insufficient',
      '📚 LEARN: Master Graves mechanics - highest carry potential',
      '🔄 BACKUP: Kayn situational for Red Kayn games only',
    ]
  },
  mistakes: {
    title: 'ERROR CLASSIFICATION SYSTEM',
    subtitle: 'Failure Point Analysis & Solutions',
    icon: '❓',
    color: '#ff0000',
    categories: [
      {
        type: 'MECHANICAL ERRORS',
        count: 12,
        percentage: 28,
        items: [
          { error: 'Missed crucial skillshots in fights', frequency: 5, fix: 'Practice tool combos 10min/day' },
          { error: 'Poor flash usage (panic/waste)', frequency: 4, fix: 'Mental checklist before using flash' },
          { error: 'Failed execute on low HP targets', frequency: 3, fix: 'Learn damage foresight/practice' },
        ]
      },
      {
        type: 'DECISION MAKING',
        count: 18,
        percentage: 42,
        items: [
          { error: 'Forcing fights when behind', frequency: 6, fix: 'Review win conditions before engaging' },
          { error: 'Invading without vision/prio', frequency: 5, fix: 'Track enemy jungler before invades' },
          { error: 'Ignoring objectives for kills', frequency: 4, fix: 'Dragon timer > kill gold calculation' },
          { error: 'Overextending without team', frequency: 3, fix: 'Check teammate positions pre-engage' },
        ]
      },
      {
        type: 'AWARENESS ISSUES',
        count: 13,
        percentage: 30,
        items: [
          { error: 'Ganked without seeing enemy jungler', frequency: 6, fix: 'Ward enemy jungle entrances' },
          { error: 'Missed TP/ultimate availability', frequency: 4, fix: 'Tab-check cooldowns before plays' },
          { error: 'Ignored missing enemy laners', frequency: 3, fix: 'Ping/track MIA before ganking' },
        ]
      }
    ],
    priority: [
      { rank: 1, issue: 'Forcing fights when behind', impact: 'Causes 40% of preventable losses', solution: 'Learn when to farm & scale vs fight' },
      { rank: 2, issue: 'Awareness of enemy jungler', impact: 'Leads to 6 avoidable deaths/10 games', solution: 'Track enemy jungle path early game' },
      { rank: 3, issue: 'Wave management ignorance', impact: 'Loses 15+ CS per game', solution: '30min YouTube guide + practice' },
    ]
  }
};

export function AIDeepAnalysis({ isOpen, onClose, analysisType }: DeepAnalysisProps) {
  if (!analysisType) return null;

  const data = DEEP_ANALYSIS_DATA[analysisType];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a0e27] border-4 overflow-hidden"
            style={{ 
              borderColor: data.color,
              boxShadow: `0 0 50px ${data.color}, inset 0 0 50px ${data.color}20`
            }}
          >
            {/* Animated scanlines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ffff 2px, #00ffff 4px)',
                animation: 'scanlines 8s linear infinite'
              }}
            />

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4" style={{ borderColor: data.color }} />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4" style={{ borderColor: data.color }} />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4" style={{ borderColor: data.color }} />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4" style={{ borderColor: data.color }} />

            {/* Header */}
            <div className="relative border-b-4 p-6" style={{ borderColor: `${data.color}40` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="text-6xl filter"
                    style={{ filter: `drop-shadow(0 0 20px ${data.color})` }}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {data.icon}
                  </motion.div>
                  <div>
                    <h2 className="text-4xl uppercase tracking-wider font-mono"
                      style={{ 
                        color: data.color,
                        textShadow: `0 0 20px ${data.color}, 0 0 40px ${data.color}`
                      }}
                    >
                      {data.title}
                    </h2>
                    <p className="text-[#666] text-sm font-mono uppercase tracking-wider mt-1">
                      {data.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="text-[#666] hover:text-white transition-colors p-2"
                >
                  <X size={32} />
                </button>
              </div>

              {/* Status bar */}
              <div className="mt-4 flex items-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-[#00ff00]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[#666]">AI ANALYSIS ENGINE: </span>
                  <span className="text-[#00ff00]">ACTIVE</span>
                </div>
                <div className="text-[#666]">
                  CONFIDENCE LEVEL: <span style={{ color: data.color }}>94.7%</span>
                </div>
                <div className="text-[#666]">
                  PROCESSING TIME: <span className="text-[#00ffff]">0.23s</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(90vh-180px)]">
              <div className="p-6">
                {analysisType === 'diagnostic' && <DiagnosticContent data={data} />}
                {analysisType === 'performance' && <PerformanceContent data={data} />}
                {analysisType === 'champion' && <ChampionContent data={data} />}
                {analysisType === 'mistakes' && <MistakesContent data={data} />}
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Diagnostic Content
function DiagnosticContent({ data }: any) {
  return (
    <div className="space-y-6">
      {/* Metric Sections */}
      {data.sections.map((section: any, idx: number) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="border-2 border-[#00ffff]/30 bg-[#00ffff]/5 p-6"
        >
          <h3 className="text-xl text-[#00ffff] uppercase tracking-wider font-mono mb-4"
            style={{ textShadow: '0 0 10px #00ffff' }}
          >
            {section.title}
          </h3>

          <div className="space-y-4">
            {section.metrics.map((metric: any, midx: number) => (
              <div key={midx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-[#aaa]">{metric.label}</span>
                  <span className={`text-sm font-mono ${
                    metric.status === 'good' ? 'text-[#00ff00]' : 
                    metric.status === 'warning' ? 'text-[#ffff00]' : 
                    'text-[#ff0000]'
                  }`}>
                    {metric.value}{typeof metric.max === 'number' && metric.max > 10 ? '' : '%'}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="relative h-3 bg-[#1a1f3a] border border-[#00ffff]/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 + midx * 0.05 }}
                    className="h-full"
                    style={{
                      background: metric.status === 'good' 
                        ? 'linear-gradient(90deg, #00ff00, #00ff0080)' 
                        : metric.status === 'warning'
                        ? 'linear-gradient(90deg, #ffff00, #ffff0080)'
                        : 'linear-gradient(90deg, #ff0000, #ff000080)',
                      boxShadow: metric.status === 'good'
                        ? '0 0 10px #00ff00'
                        : metric.status === 'warning'
                        ? '0 0 10px #ffff00'
                        : '0 0 10px #ff0000'
                    }}
                  />
                  
                  {/* Scanning line */}
                  <motion.div
                    className="absolute top-0 bottom-0 w-[2px] bg-white opacity-60"
                    animate={{ left: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </div>

                <p className="text-xs text-[#666] font-mono">{metric.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-2 border-[#ffff00] bg-[#ffff00]/10 p-6"
        style={{ boxShadow: '0 0 20px #ffff00' }}
      >
        <h3 className="text-xl text-[#ffff00] uppercase tracking-wider font-mono mb-4"
          style={{ textShadow: '0 0 10px #ffff00' }}
        >
          🎯 PRIORITY RECOMMENDATIONS
        </h3>

        <div className="space-y-3">
          {data.recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="flex gap-4 border-l-4 pl-4"
              style={{ 
                borderColor: rec.priority === 'HIGH' ? '#ff0000' : rec.priority === 'MEDIUM' ? '#ffff00' : '#00ffff'
              }}
            >
              <div className="flex-shrink-0">
                <span className={`text-xs font-mono px-2 py-1 border ${
                  rec.priority === 'HIGH' 
                    ? 'border-[#ff0000] text-[#ff0000]' 
                    : rec.priority === 'MEDIUM'
                    ? 'border-[#ffff00] text-[#ffff00]'
                    : 'border-[#00ffff] text-[#00ffff]'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#aaa] font-mono">{rec.text}</p>
                <p className="text-xs text-[#00ff00] font-mono mt-1">Expected impact: {rec.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Performance Content
function PerformanceContent({ data }: any) {
  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="space-y-4">
        {data.timeline.map((period: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="border-2 border-[#ff00ff]/30 bg-[#ff00ff]/5 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-lg text-[#ff00ff] font-mono uppercase">{period.period}</h4>
                <p className="text-xs text-[#666] font-mono">{period.note}</p>
              </div>
              <div className={`text-2xl ${
                period.trend === 'up' ? 'text-[#00ff00]' : 
                period.trend === 'down' ? 'text-[#ff0000]' : 
                'text-[#ffff00]'
              }`}>
                {period.trend === 'up' ? '📈' : period.trend === 'down' ? '📉' : '➡️'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#666] font-mono mb-1">WIN RATE</div>
                <div className="text-2xl font-mono" style={{ color: period.wr >= 50 ? '#00ff00' : '#ff0000' }}>
                  {period.wr}%
                </div>
              </div>
              <div>
                <div className="text-xs text-[#666] font-mono mb-1">AVG KDA</div>
                <div className="text-2xl text-[#00ffff] font-mono">{period.kda}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-2 border-[#00ffff] bg-[#00ffff]/5 p-6"
      >
        <h3 className="text-xl text-[#00ffff] uppercase tracking-wider font-mono mb-4">
          💡 KEY INSIGHTS
        </h3>

        <div className="space-y-3">
          {data.insights.map((insight: any, idx: number) => (
            <div key={idx} className="flex gap-3 items-start">
              <span className={`text-xl ${
                insight.type === 'STRENGTH' ? 'text-[#00ff00]' :
                insight.type === 'WEAKNESS' ? 'text-[#ff0000]' :
                insight.type === 'PATTERN' ? 'text-[#ffff00]' :
                'text-[#00ffff]'
              }`}>
                {insight.icon}
              </span>
              <div className="flex-1">
                <span className={`text-xs font-mono px-2 py-1 border ${
                  insight.type === 'STRENGTH' ? 'border-[#00ff00] text-[#00ff00]' :
                  insight.type === 'WEAKNESS' ? 'border-[#ff0000] text-[#ff0000]' :
                  insight.type === 'PATTERN' ? 'border-[#ffff00] text-[#ffff00]' :
                  'border-[#00ffff] text-[#00ffff]'
                }`}>
                  {insight.type}
                </span>
                <p className="text-sm text-[#aaa] font-mono mt-2">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Champion Content
function ChampionContent({ data }: any) {
  return (
    <div className="space-y-6">
      {/* Champion Grid */}
      <div className="grid grid-cols-1 gap-4">
        {data.champions.map((champ: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`border-2 p-4 ${
              champ.mastery === 'S' ? 'border-[#ffff00] bg-[#ffff00]/10' :
              champ.mastery === 'A' ? 'border-[#00ff00] bg-[#00ff00]/10' :
              champ.mastery === 'B' ? 'border-[#00ffff] bg-[#00ffff]/10' :
              'border-[#ff0000] bg-[#ff0000]/10'
            }`}
            style={{
              boxShadow: champ.mastery === 'S' ? '0 0 20px #ffff00' : 'none'
            }}
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl filter"
                style={{ filter: `drop-shadow(0 0 10px ${champ.mastery === 'S' ? '#ffff00' : '#00ffff'})` }}
              >
                {champ.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-mono uppercase" style={{ 
                    color: champ.mastery === 'S' ? '#ffff00' : 
                           champ.mastery === 'A' ? '#00ff00' :
                           champ.mastery === 'B' ? '#00ffff' : '#ff0000'
                  }}>
                    {champ.name}
                  </h4>
                  <span className={`text-xs font-mono px-3 py-1 border-2 ${
                    champ.mastery === 'S' ? 'border-[#ffff00] text-[#ffff00]' :
                    champ.mastery === 'A' ? 'border-[#00ff00] text-[#00ff00]' :
                    champ.mastery === 'B' ? 'border-[#00ffff] text-[#00ffff]' :
                    'border-[#ff0000] text-[#ff0000]'
                  }`}>
                    MASTERY: {champ.mastery}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-[#666] font-mono">GAMES</div>
                    <div className="text-lg text-[#aaa] font-mono">{champ.games}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#666] font-mono">WIN RATE</div>
                    <div className={`text-lg font-mono ${champ.wr >= 50 ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
                      {champ.wr}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#666] font-mono">AVG KDA</div>
                    <div className="text-lg text-[#00ffff] font-mono">{champ.kda}</div>
                  </div>
                </div>

                <p className="text-sm text-[#aaa] font-mono mb-3">{champ.notes}</p>

                <div className="flex gap-6">
                  <div>
                    <div className="text-xs text-[#00ff00] font-mono mb-1">STRENGTHS:</div>
                    <div className="flex flex-wrap gap-2">
                      {champ.strengths.map((s: string, i: number) => (
                        <span key={i} className="text-xs border border-[#00ff00]/30 text-[#00ff00] px-2 py-1 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#ff0000] font-mono mb-1">WEAKNESSES:</div>
                    <div className="flex flex-wrap gap-2">
                      {champ.weaknesses.map((w: string, i: number) => (
                        <span key={i} className="text-xs border border-[#ff0000]/30 text-[#ff0000] px-2 py-1 font-mono">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="border-2 border-[#ffff00] bg-[#ffff00]/10 p-6"
      >
        <h3 className="text-xl text-[#ffff00] uppercase tracking-wider font-mono mb-4">
          POOL OPTIMIZATION
        </h3>
        <div className="space-y-2">
          {data.recommendations.map((rec: string, idx: number) => (
            <div key={idx} className="text-sm text-[#aaa] font-mono flex items-start gap-2">
              <span className="text-[#ffff00]">▸</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Mistakes Content
function MistakesContent({ data }: any) {
  return (
    <div className="space-y-6">
      {/* Error Categories */}
      {data.categories.map((category: any, idx: number) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.15 }}
          className="border-2 border-[#ff0000]/30 bg-[#ff0000]/5 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl text-[#ff0000] uppercase tracking-wider font-mono">
              {category.type}
            </h3>
            <div className="text-right">
              <div className="text-2xl text-[#ff0000] font-mono">{category.count}</div>
              <div className="text-xs text-[#666] font-mono">{category.percentage}% of errors</div>
            </div>
          </div>

          <div className="space-y-3">
            {category.items.map((item: any, iidx: number) => (
              <div key={iidx} className="border-l-2 border-[#ff0000] pl-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm text-[#aaa] font-mono flex-1">{item.error}</p>
                  <span className="text-xs text-[#ff0000] font-mono ml-4">×{item.frequency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#666] font-mono">FIX:</span>
                  <span className="text-xs text-[#00ff00] font-mono">{item.fix}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Priority Issues */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-4 border-[#ffff00] bg-[#ffff00]/10 p-6"
        style={{ boxShadow: '0 0 30px #ffff00' }}
      >
        <h3 className="text-2xl text-[#ffff00] uppercase tracking-wider font-mono mb-4"
          style={{ textShadow: '0 0 10px #ffff00' }}
        >
          ⚠️ TOP PRIORITY FIXES
        </h3>

        <div className="space-y-4">
          {data.priority.map((item: any, idx: number) => (
            <div key={idx} className="border-2 border-[#ff0000] bg-[#0a0e27] p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 border-2 border-[#ff0000] flex items-center justify-center text-2xl font-mono text-[#ff0000]">
                    #{item.rank}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg text-[#ff0000] font-mono uppercase mb-2">{item.issue}</h4>
                  <p className="text-sm text-[#666] font-mono mb-2">Impact: {item.impact}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#00ffff] font-mono">SOLUTION:</span>
                    <span className="text-sm text-[#00ff00] font-mono">{item.solution}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
