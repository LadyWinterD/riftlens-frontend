'use client';

import { motion } from 'framer-motion';
import { Terminal, Zap, Brain, TrendingUp, Users, Code, Database, Activity, Github, Heart } from "lucide-react";

export function AboutTab() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="inline-block px-4 py-2 border-2 border-[#00ffff]/30 rounded-full mb-4">
          <span className="text-[#00ffff] text-sm font-mono uppercase tracking-wider">
            ⚡ ABOUT THE PROJECT
          </span>
        </div>
        
        <h1 
          className="text-5xl font-bold font-mono uppercase tracking-wider"
          style={{
            background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0,255,255,0.5)'
          }}
        >
          RIFT REWIND
        </h1>
        
        <p className="text-[#00ffff] text-sm font-mono uppercase tracking-wider">
          POWERED BY AWS × RIOT GAMES
        </p>
        
        <p className="text-[#ccc] text-lg max-w-3xl mx-auto leading-relaxed">
          An AI-powered analysis agent that transforms League of Legends match data from{' '}
          <span className="text-[#00ffff] font-bold">500 EUW summoners</span> into personalized 
          insights and performance analytics using cutting-edge AWS AI services.
        </p>
        
        <div className="flex justify-center gap-6 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#00ffff]">●</span>
            <span className="text-[#888]">500 Summoners</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#ff00ff]">●</span>
            <span className="text-[#888]">Europe West Server</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#ffff00]">●</span>
            <span className="text-[#888]">Last 20 Matches</span>
          </div>
        </div>
      </motion.div>

      {/* The Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-2 rounded-lg p-6"
        style={{
          borderColor: '#ff00ff40',
          background: 'linear-gradient(135deg, #1a0a27 0%, #0a1a27 100%)'
        }}
      >
        <h2 className="text-2xl font-bold font-mono uppercase tracking-wider text-[#ff00ff] mb-4 flex items-center gap-3">
          <span>⚡</span>
          THE MISSION
        </h2>
        <p className="text-[#ccc] text-base leading-relaxed">
          Analyzing match data from{' '}
          <span className="text-[#00ffff] font-bold">500 summoners</span> on the{' '}
          <span className="text-[#ff00ff] font-bold">Europe West server</span>, this AI agent 
          processes the{' '}
          <span className="text-[#ffff00] font-bold">last 20 matches</span> for each player 
          to deliver insights that help them{' '}
          <span className="text-[#00ffff] font-bold">reflect</span>,{' '}
          <span className="text-[#ff00ff] font-bold">learn</span>, and{' '}
          <span className="text-[#ffff00] font-bold">improve</span> their gameplay.
        </p>
      </motion.div>

      {/* Core Capabilities */}
      <div>
        <h2 className="text-3xl font-bold font-mono uppercase tracking-wider text-center mb-6"
          style={{
            background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          CORE CAPABILITIES
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: Brain,
              title: "AI-Powered Insights",
              description: "Leverage Amazon Bedrock & SageMaker to analyze recent match patterns and identify strengths",
              color: "cyan",
              delay: 0.3
            },
            {
              icon: TrendingUp,
              title: "Recent Performance",
              description: "Track trends across your last 20 matches with data-driven visualizations",
              color: "fuchsia",
              delay: 0.4
            },
            {
              icon: Activity,
              title: "Match Analytics",
              description: "Deep dive into champion picks, performance metrics, and standout matches",
              color: "yellow",
              delay: 0.5
            },
            {
              icon: Users,
              title: "EUW Player Pool",
              description: "Compare performance across 500 Europe West summoners to benchmark your skills",
              color: "green",
              delay: 0.6
            },
            {
              icon: Code,
              title: "Smart Analytics",
              description: "Go beyond basic stats with AI-generated insights from recent match history",
              color: "orange",
              delay: 0.7
            }
          ].map((feature, idx) => {
            const colorMap: Record<string, string> = {
              cyan: '#00ffff',
              fuchsia: '#ff00ff',
              yellow: '#ffff00',
              green: '#00ff00',
              orange: '#ff9900'
            };
            const color = colorMap[feature.color] || '#00ffff';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                className="border-2 rounded-lg p-6 hover:scale-105 transition-all cursor-pointer relative overflow-hidden group"
                style={{
                  borderColor: `${color}40`,
                  background: 'linear-gradient(135deg, #0a0e27 0%, #000000 100%)'
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${color}05 0%, transparent 100%)`
                  }}
                />
                <div className="relative z-10">
                  <feature.icon 
                    className="w-10 h-10 mb-4" 
                    style={{ 
                      color: color,
                      filter: `drop-shadow(0 0 8px ${color})`
                    }} 
                  />
                  <h3 className="text-xl font-bold font-mono uppercase mb-2" style={{ color }}>
                    {feature.title}
                  </h3>
                  <p className="text-[#888] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div 
                  className="absolute bottom-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="border-2 rounded-lg p-8 relative overflow-hidden"
        style={{
          borderColor: '#00ffff40',
          background: 'linear-gradient(135deg, #0a1a27 0%, #000000 100%)'
        }}
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(45deg, transparent 25%, rgba(0,255,255,0.05) 50%, transparent 75%)',
            backgroundSize: '250% 250%',
            animation: 'shimmer 3s linear infinite'
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-[#00ffff]" />
            <h2 className="text-3xl font-bold font-mono uppercase tracking-wider text-[#00ffff]">
              TECH STACK
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {[
              { name: "AWS Bedrock", type: "AI" },
              { name: "League API", type: "Data" },
              { name: "Figma", type: "Design" },
              { name: "500 EUW Summoners", type: "Dataset" },
              { name: "Last 20 Matches", type: "Scope" },
              { name: "React", type: "Frontend" },
              { name: "Tailwind CSS", type: "Styling" }
            ].map((tech, idx) => (
              <div
                key={idx}
                className="px-4 py-2 border rounded-lg transition-all cursor-default hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, rgba(0,255,255,0.2), rgba(255,0,255,0.2))',
                  borderColor: 'rgba(0,255,255,0.5)',
                  boxShadow: '0 0 10px rgba(0,255,255,0.3)'
                }}
              >
                <span className="text-[#ff00ff] mr-2 font-mono text-sm">[{tech.type}]</span>
                <span className="text-[#00ffff] font-mono text-sm">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* About Developer & Project Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* About the Developer */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="border-2 rounded-lg p-8 relative overflow-hidden group hover:border-[#00ffff]/60 transition-all"
          style={{
            borderColor: '#00ffff40',
            background: 'linear-gradient(135deg, #0a1a27 0%, #000000 100%)'
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffff]/10 rounded-full blur-[60px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-5 h-5 text-[#00ffff]" />
              <h3 className="text-2xl font-bold font-mono text-[#00ffff]">About the Developer</h3>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #00ffff, #ff00ff)'
                  }}
                >
                  <span className="text-xl">👩‍💻</span>
                </div>
                <div>
                  <h4 className="text-xl text-white font-bold">LadyWinterD</h4>
                  <p className="text-[#666] text-sm font-mono">Developer & Designer</p>
                </div>
              </div>
              
              <p className="text-[#ccc] leading-relaxed mb-4">
                A passionate <span className="text-[#00ffff] font-bold">League of Legends fan</span> combining 
                AI and design to create meaningful player experiences. Designed in{' '}
                <span className="text-[#ff00ff] font-bold">Figma</span>, built with ❤️.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1 border rounded-full"
                  style={{
                    background: 'rgba(255,0,255,0.2)',
                    borderColor: 'rgba(255,0,255,0.3)'
                  }}
                >
                  <Heart className="w-4 h-4 text-[#ff00ff]" />
                  <span className="text-sm text-[#ff00ff] font-mono">Faker Fan</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 border rounded-full"
                  style={{
                    background: 'rgba(255,255,0,0.2)',
                    borderColor: 'rgba(255,255,0,0.3)'
                  }}
                >
                  <span className="text-sm text-[#ffff00] font-mono">I LOVE T1</span>
                </div>
              </div>
              
              <a 
                href="https://github.com/LadyWinterD" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-all group/link"
                style={{
                  background: 'rgba(0,255,255,0.1)',
                  borderColor: 'rgba(0,255,255,0.5)'
                }}
              >
                <Github className="w-4 h-4 text-[#00ffff]" />
                <span className="text-[#00ffff] font-mono text-sm">github.com/LadyWinterD</span>
                <span className="opacity-0 group-hover/link:opacity-100 transition-opacity text-[#00ffff]">→</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Project Vision */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="border-2 rounded-lg p-8 relative overflow-hidden"
          style={{
            borderColor: '#ffff0040',
            background: 'linear-gradient(135deg, #1a1f0a 0%, #000000 100%)'
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffff00]/10 rounded-full blur-[60px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-[#ffff00]" />
              <h3 className="text-2xl font-bold font-mono text-[#ffff00]">Project Vision</h3>
            </div>
            
            <p className="text-[#ccc] leading-relaxed mb-4">
              This project demonstrates the power of combining{' '}
              <span className="text-[#00ffff] font-bold">AWS AI services</span> with{' '}
              <span className="text-[#ff00ff] font-bold">real-world gaming data</span> from the 
              Europe West server. By analyzing the last 20 matches of 500 summoners, Rift Rewind 
              showcases how AI can transform recent gameplay into{' '}
              <span className="text-[#ffff00] font-bold">actionable insights</span> and personalized analytics.
            </p>
            
            <div className="flex items-center gap-2 text-sm text-[#666] font-mono">
              <div className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse" />
              <span>Built for AWS × Riot Games Hackathon 2025</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        className="mt-16 text-center"
      >
        <div className="inline-flex items-center gap-3 text-[#666]">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#333]" />
          <span className="text-sm tracking-wider font-mono">DIVE INTO THE DATA • DISCOVER YOUR STORY</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#333]" />
        </div>
      </motion.div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -250% 0; }
          100% { background-position: 250% 0; }
        }
      `}</style>
    </div>
  );
}
