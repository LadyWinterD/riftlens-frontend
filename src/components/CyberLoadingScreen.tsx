import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Search, Globe, ChevronDown, Zap } from 'lucide-react';
import playerManifest from '../../player_manifest.json';

interface CyberLoadingScreenProps {
  onLoadingComplete?: () => void;
  onSearch?: (name: string, region: string) => void;
  onDemoMode?: () => void;
  minLoadingTime?: number;
}

const REGIONS = [
  { code: 'EUW', name: 'EU West', icon: '🌍' },
];

export function CyberLoadingScreen({
  onLoadingComplete,
  onSearch,
  onDemoMode,
  minLoadingTime = 3000
}: CyberLoadingScreenProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [summonerName, setSummonerName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('EUW');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 修复 hydration 错误
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadingPhases = [
    { text: 'INITIALIZING NEURAL PATHWAYS...', icon: '🧠', duration: 800 },
    { text: 'CONNECTING TO RIOT API...', icon: '🔗', duration: 600 },
    { text: 'ANALYZING SUMMONER DATA...', icon: '📊', duration: 700 },
    { text: 'LOADING MATCH HISTORY...', icon: '🎮', duration: 500 },
    { text: 'CALIBRATING AI ALGORITHMS...', icon: '⚙️', duration: 600 },
    { text: 'SYSTEM READY', icon: '✅', duration: 300 },
  ];

  useEffect(() => {
    if (!isAutoLoading) return;

    let phaseTimeout: NodeJS.Timeout;
    let completionTimeout: NodeJS.Timeout;

    const totalPhaseDuration = loadingPhases.reduce((sum, phase) => sum + phase.duration, 0);
    const totalDuration = Math.max(minLoadingTime, totalPhaseDuration);

    let currentTime = 0;
    loadingPhases.forEach((phase, index) => {
      currentTime += phase.duration;
      phaseTimeout = setTimeout(() => {
        setCurrentPhase(index);
      }, currentTime);
    });

    completionTimeout = setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, totalDuration);

    return () => {
      clearTimeout(phaseTimeout);
      clearTimeout(completionTimeout);
    };
  }, [isAutoLoading, minLoadingTime, onLoadingComplete]);

  const handleSearch = () => {
    if (!summonerName.trim()) return;
    setIsAutoLoading(false);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(summonerName.trim(), selectedRegion);
    }
  };

  const handleDemoMode = () => {
    setIsAutoLoading(false);
    if (onDemoMode) {
      onDemoMode();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // 自动补全逻辑
  const handleInputChange = (value: string) => {
    setSummonerName(value);
    
    if (value.trim().length > 0) {
      // 从 player_manifest.json 中筛选匹配的玩家名
      const filtered = playerManifest
        .filter(player => 
          player.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(player => player.name)
        .slice(0, 10); // 最多显示10个建议
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setSummonerName(name);
    setShowSuggestions(false);
  };

  const selectedRegionData = REGIONS.find(r => r.code === selectedRegion) || REGIONS[0];
  const currentPhaseData = loadingPhases[currentPhase];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-[#0a0e27] flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#00ffff 1px, transparent 1px),
            linear-gradient(90deg, #00ffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Scanlines */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ffff 2px, #00ffff 4px)',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '0px 100px'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating Particles */}
      {isMounted && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#00ffff] rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Main Loading Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-3xl mx-4"
      >
        {/* Main Frame */}
        <div
          className="relative bg-[#0a0e27]/90 border-4 border-[#00ffff] p-8 backdrop-blur-md"
          style={{ boxShadow: '0 0 60px #00ffff, inset 0 0 60px rgba(0,255,255,0.1)' }}
        >
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#ff00ff]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#ff00ff]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#ff00ff]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#ff00ff]" />

          {/* Glitch Overlay */}
          <motion.div
            className="absolute inset-0 bg-[#00ffff]/5 mix-blend-screen pointer-events-none"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
          />

          {/* Logo/Icon */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-block text-8xl filter drop-shadow-[0_0_30px_#00ffff]"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ⚡
            </motion.div>
            <motion.h1
              className="text-4xl text-[#00ffff] uppercase tracking-wider mt-4 font-mono"
              style={{ textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff' }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              RiftLens AI
            </motion.h1>
            <p
              className="text-[#ff00ff] text-sm tracking-widest mt-2 font-mono"
              style={{ textShadow: '0 0 10px #ff00ff' }}
            >
              NEURAL COACH SYSTEM v2.5.7
            </p>
          </div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="border-2 border-[#ff00ff]/40 bg-[#0a0e27]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-[#ff00ff]" />
                <span className="text-[#ff00ff] text-xs uppercase tracking-wider font-mono">
                  Search Summoner
                </span>
              </div>
              <div className="flex gap-2">
                {/* Region Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    className="px-3 py-2 border-2 border-[#00ffff]/40 bg-[#0a0e27] hover:border-[#00ffff] transition-all duration-300 flex items-center gap-2"
                    style={{ boxShadow: showRegionDropdown ? '0 0 15px #00ffff' : 'none' }}
                  >
                    <Globe className="w-4 h-4 text-[#00ffff]" />
                    <span className="text-[#00ffff] font-mono text-sm">
                      {selectedRegionData.icon} {selectedRegion}
                    </span>
                    <motion.div
                      animate={{ rotate: showRegionDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-[#00ffff]" />
                    </motion.div>
                  </button>

                  {/* Region Dropdown */}
                  <AnimatePresence>
                    {showRegionDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-[10000]"
                          onClick={() => setShowRegionDropdown(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-[#0a0e27] border-2 border-[#00ffff] z-[10001] max-h-64 overflow-y-auto"
                          style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}
                        >
                          {REGIONS.map(region => (
                            <button
                              key={region.code}
                              onClick={() => {
                                setSelectedRegion(region.code);
                                setShowRegionDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 border-b border-[#00ffff]/20 hover:bg-[#00ffff]/10 transition-colors flex items-center gap-3 ${
                                selectedRegion === region.code ? 'bg-[#00ffff]/20' : ''
                              }`}
                            >
                              <span className="text-lg">{region.icon}</span>
                              <div className="flex-1">
                                <div className="text-[#00ffff] text-sm font-mono">{region.code}</div>
                                <div className="text-[#666] text-xs">{region.name}</div>
                              </div>
                              {selectedRegion === region.code && (
                                <span className="text-[#00ffff]">✓</span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input with Autocomplete */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={summonerName}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => summonerName && suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Type summoner name..."
                    className="w-full px-4 py-2 bg-[#0a0e27] border-2 border-[#ff00ff]/40 text-[#fff] placeholder-[#666] font-mono text-sm tracking-wider focus:border-[#ff00ff] focus:outline-none transition-all duration-300"
                    style={{
                      boxShadow: summonerName ? '0 0 15px rgba(255, 0, 255, 0.3)' : 'none'
                    }}
                  />
                  
                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <>
                        <div
                          className="fixed inset-0 z-[9998]"
                          onClick={() => setShowSuggestions(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[#0a0e27] border-2 border-[#ff00ff] z-[9999] max-h-64 overflow-y-auto"
                          style={{ boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)' }}
                        >
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full text-left px-4 py-2 border-b border-[#ff00ff]/20 hover:bg-[#ff00ff]/10 transition-colors text-[#fff] font-mono text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Search className="w-3 h-3 text-[#ff00ff]" />
                                <span>{suggestion}</span>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={!summonerName.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-[#ff00ff] to-[#ff00ff]/80 border-2 border-[#ff00ff] text-[#fff] font-mono text-sm uppercase tracking-wider hover:from-[#ff00ff]/90 hover:to-[#ff00ff]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group/btn"
                  style={{
                    boxShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>GO</span>
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Divider with OR */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[#00ffff]/20"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0a0e27] px-4 text-[#666] text-xs font-mono uppercase tracking-wider">
                Or
              </span>
            </div>
          </div>

          {/* Demo Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <button
              onClick={handleDemoMode}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#ffff00] to-[#ffff00]/80 border-2 border-[#ffff00] text-[#0a0e27] font-mono uppercase tracking-wider hover:from-[#ffff00]/90 hover:to-[#ffff00]/70 transition-all duration-300 relative overflow-hidden group/demo"
              style={{
                boxShadow: '0 0 20px rgba(255, 255, 0, 0.5)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/demo:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10 flex items-center justify-center gap-3 text-base">
                <Zap className="w-5 h-5" />
                <span>Load Demo Dashboard</span>
                <Zap className="w-5 h-5" />
              </span>
            </button>
            <p className="text-center text-[#666] text-xs font-mono mt-2">
              View sample data and features instantly
            </p>
          </motion.div>

          {/* Manual Selection Prompt */}


          {/* Auto Loading Section */}
          {isAutoLoading && (
            <>
              {/* Loading Phase Display */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div
                    className="text-4xl"
                    animate={{
                      rotate: currentPhaseData.icon === '⚙️' ? 360 : 0,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 1, repeat: Infinity }
                    }}
                  >
                    {currentPhaseData.icon}
                  </motion.div>
                  <motion.div
                    key={currentPhase}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[#00ffff] text-lg font-mono uppercase tracking-wider"
                    style={{ textShadow: '0 0 10px #00ffff' }}
                  >
                    {currentPhaseData.text}
                  </motion.div>
                </div>

                {/* Status Indicators */}
                <div className="flex justify-center gap-2 mb-4">
                  {loadingPhases.map((_, index) => (
                    <motion.div
                      key={index}
                      className="w-2 h-2 rounded-full border border-[#00ffff]"
                      animate={{
                        backgroundColor: index <= currentPhase ? '#00ffff' : 'transparent',
                        boxShadow: index <= currentPhase ? '0 0 10px #00ffff' : 'none',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>

              {/* Loading Status */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 text-xs font-mono">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#00ff00]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-[#666]">
                    LOADING: <span className="text-[#00ffff]">{currentPhase + 1}/{loadingPhases.length}</span>
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Loading Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="p-4 border-2 border-[#ffff00]/30 bg-[#ffff00]/5"
          >
            <div className="text-center">
              <p
                className="text-[#ffff00] text-xs font-mono uppercase tracking-wider mb-2"
                style={{ textShadow: '0 0 5px #ffff00' }}
              >
                💡 NEURAL TIP
              </p>
              <motion.p
                className="text-[#999] text-xs font-mono"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                "Focus on objectives over kills. Dragon soul wins games." - RiftAI-47
              </motion.p>
            </div>
          </motion.div>

          {/* Version Footer */}
          <div className="mt-6 pt-4 border-t-2 border-[#00ffff]/20">
            <div className="flex items-center justify-between text-xs font-mono text-[#666]">
              <span>RIFTLENS AI SYSTEMS</span>
              <div className="flex gap-4">
                <span>
                  BUILD: <span className="text-[#00ffff]">2.5.7</span>
                </span>
                <span>
                  STATUS: <span className="text-[#00ff00]">ONLINE</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Outer Glow Effect */}
        <motion.div
          className="absolute inset-0 border-4 border-[#00ffff] -z-10 blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Bottom Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-10 left-0 right-0 text-center"
      >
        <p className="text-[#666] text-xs font-mono uppercase tracking-wider">
          POWERED BY RIFTAI-47 NEURAL NETWORK
        </p>
      </motion.div>
    </motion.div>
  );
}
