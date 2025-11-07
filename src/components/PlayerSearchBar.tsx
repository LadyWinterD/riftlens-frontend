import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Loader2, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchHistory {
  summonerName: string;
  region: string;
  timestamp: number;
}

interface PlayerSearchBarProps {
  onSearch: (summonerName: string, region: string) => void;
  isLoading?: boolean;
}

const REGIONS = [
  { code: 'EUW', name: 'EU West', icon: '🌍' }
];

// Popular summoner names for autocomplete
const POPULAR_SUMMONERS = [
  'Faker', 'Deft', 'Chovy', 'Keria', 'Zeus',
  'Doublelift', 'Bjergsen', 'Caps', 'Rekkles', 'Perkz',
  'TheShy', 'Rookie', 'JackeyLove', 'Knight', 'Uzi',
  'ShowMaker', 'Canyon', 'Ruler', 'BeryL', 'Gumayusi',
  'Tyler1', 'Yassuo', 'TFBlade', 'IWDominate', 'Sneaky',
  'Bwipo', 'Jankos', 'Inspired', 'Hans Sama', 'Hylissang'
];

export function PlayerSearchBar({ onSearch, isLoading = false }: PlayerSearchBarProps) {
  const [summonerName, setSummonerName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('NA');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const regionButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0, width: 0 });
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>(() => {
    const saved = localStorage.getItem('riftai_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Update dropdown positions
  const updatePositions = () => {
    if (showRegionDropdown && regionButtonRef.current) {
      const rect = regionButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: 224 // w-56 = 14rem = 224px
      });
    }
    if (showAutocomplete && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setAutocompletePosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    updatePositions();
  }, [showRegionDropdown, showAutocomplete]);

  // Update positions on scroll/resize
  useEffect(() => {
    if (showRegionDropdown || showAutocomplete) {
      window.addEventListener('scroll', updatePositions, true);
      window.addEventListener('resize', updatePositions);
      return () => {
        window.removeEventListener('scroll', updatePositions, true);
        window.removeEventListener('resize', updatePositions);
      };
    }
  }, [showRegionDropdown, showAutocomplete]);

  // Generate suggestions based on input
  useEffect(() => {
    if (summonerName.length > 0) {
      const lowerInput = summonerName.toLowerCase();
      
      // Combine history and popular summoners
      const historyNames = searchHistory.map(h => h.summonerName);
      const allNames = [...new Set([...historyNames, ...POPULAR_SUMMONERS])];
      
      const filtered = allNames
        .filter(name => name.toLowerCase().startsWith(lowerInput))
        .slice(0, 8);
      
      setSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowAutocomplete(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [summonerName, searchHistory]);

  const handleSearch = (nameOverride?: string) => {
    const searchName = nameOverride || summonerName.trim();
    if (!searchName) return;
    
    // Add to history
    const newHistory: SearchHistory = {
      summonerName: searchName,
      region: selectedRegion,
      timestamp: Date.now()
    };
    
    const updatedHistory = [newHistory, ...searchHistory.filter(
      h => !(h.summonerName === newHistory.summonerName && h.region === newHistory.region)
    )].slice(0, 10);
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('riftai_search_history', JSON.stringify(updatedHistory));
    setShowAutocomplete(false);
    
    // Trigger search
    onSearch(searchName, selectedRegion);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSummonerName(suggestion);
    setShowAutocomplete(false);
    handleSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setSelectedSuggestionIndex(-1);
        break;
      case 'Tab':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          setSummonerName(suggestions[selectedSuggestionIndex]);
          setShowAutocomplete(false);
        } else if (suggestions.length > 0) {
          e.preventDefault();
          setSummonerName(suggestions[0]);
        }
        break;
    }
  };

  const selectedRegionData = REGIONS.find(r => r.code === selectedRegion) || REGIONS[0];

  return (
    <div className="relative mb-6">
      {/* Main Search Container */}
      <div className="bg-[#0a0e27]/95 border-2 border-[#ff00ff]/40 p-4 backdrop-blur-sm relative group">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00ffff] z-10"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00ffff] z-10"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00ffff] z-10"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00ffff] z-10"></div>

        {/* Animated Border Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff00ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-20 flex items-center gap-3">
          {/* Icon */}
          <div className="text-2xl filter drop-shadow-[0_0_10px_#ff00ff] flex-shrink-0">
            🔍
          </div>

          {/* Title */}
          <div className="hidden md:block flex-shrink-0">
            <div className="text-[#ff00ff] uppercase tracking-wider text-sm font-mono whitespace-nowrap"
              style={{ textShadow: '0 0 10px #ff00ff' }}
            >
              SUMMONER SEARCH
            </div>
            <div className="text-[#666] text-xs font-mono whitespace-nowrap">
              TYPE TO AUTO-COMPLETE
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-gradient-to-b from-transparent via-[#ff00ff] to-transparent flex-shrink-0"></div>

          {/* Region Selector */}
          <div className="relative flex-shrink-0">
            <button
              ref={regionButtonRef}
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              disabled={isLoading}
              className="px-3 py-2 border-2 border-[#00ffff]/40 bg-[#0a0e27] hover:border-[#00ffff] transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: showRegionDropdown ? '0 0 15px #00ffff' : 'none' }}
            >
              <Globe className="w-4 h-4 text-[#00ffff]" />
              <span className="text-[#00ffff] font-mono text-sm tracking-wider">
                {selectedRegionData.icon} {selectedRegion}
              </span>
              <motion.div
                animate={{ rotate: showRegionDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-[#00ffff]" />
              </motion.div>
            </button>
          </div>

          {/* Search Input with Autocomplete */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => summonerName && setSuggestions([])}
              placeholder="Type summoner name..."
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#0a0e27] border-2 border-[#ff00ff]/40 text-[#fff] placeholder-[#666] font-mono text-sm tracking-wider focus:border-[#ff00ff] focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: summonerName ? '0 0 15px rgba(255, 0, 255, 0.3)' : 'none'
              }}
            />
          </div>

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !summonerName.trim()}
            className="px-6 py-2 bg-gradient-to-r from-[#ff00ff] to-[#ff00ff]/80 border-2 border-[#ff00ff] text-[#fff] font-mono text-sm uppercase tracking-wider hover:from-[#ff00ff]/90 hover:to-[#ff00ff]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group/search flex-shrink-0"
            style={{
              boxShadow: isLoading ? '0 0 20px #ff00ff' : '0 0 10px rgba(255, 0, 255, 0.5)'
            }}
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/search:translate-x-full transition-transform duration-1000"></div>
            
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">SCANNING...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">SEARCH</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {isLoading && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#ff00ff] origin-left"
          style={{ boxShadow: '0 0 10px #ff00ff, 0 0 20px #00ffff' }}
        />
      )}

      {/* Click outside to close dropdowns */}
      {(showRegionDropdown || showAutocomplete) && (
        <div 
          className="fixed inset-0 z-[9998]"
          onClick={() => {
            setShowRegionDropdown(false);
            setShowAutocomplete(false);
          }}
        />
      )}

      {/* Portal Dropdowns */}
      {typeof window !== 'undefined' && createPortal(
        <>
          {/* Region Dropdown Portal */}
          <AnimatePresence>
            {showRegionDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed bg-[#0a0e27] border-2 border-[#00ffff] z-[9999] max-h-64 overflow-y-auto"
                style={{ 
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`
                }}
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
            )}
          </AnimatePresence>

          {/* Autocomplete Dropdown Portal */}
          <AnimatePresence>
            {showAutocomplete && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed bg-[#0a0e27] border-2 border-[#ff00ff] z-[9999] max-h-72 overflow-y-auto"
                style={{ 
                  boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
                  top: `${autocompletePosition.top}px`,
                  left: `${autocompletePosition.left}px`,
                  width: `${autocompletePosition.width}px`
                }}
              >
                {suggestions.map((suggestion, idx) => {
                  const isHistory = searchHistory.some(h => h.summonerName === suggestion);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                      className={`w-full text-left px-4 py-3 border-b border-[#ff00ff]/10 hover:bg-[#ff00ff]/10 transition-colors flex items-center justify-between group ${
                        selectedSuggestionIndex === idx ? 'bg-[#ff00ff]/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{isHistory ? '🕐' : '⭐'}</span>
                        <span className="text-[#00ffff] font-mono text-sm">
                          {suggestion}
                        </span>
                      </div>
                      <span className="text-[#666] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {isHistory ? 'Recent' : 'Popular'}
                      </span>
                    </button>
                  );
                })}
                
                {/* Hint */}
                <div className="px-4 py-2 bg-[#0a0e27]/50 border-t border-[#ff00ff]/20">
                  <div className="text-[#666] text-xs font-mono flex items-center justify-between">
                    <span>↑↓ Navigate</span>
                    <span>↵ Select</span>
                    <span>Tab Complete</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  );
}
