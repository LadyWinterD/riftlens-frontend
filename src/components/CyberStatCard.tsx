interface CyberStatCardProps {
  label: string;
  value: string;
  color: 'cyan' | 'magenta' | 'yellow' | 'green';
  icon: string;
}

const colorMap = {
  cyan: {
    border: '#00ffff',
    text: '#00ffff',
    glow: '0 0 10px #00ffff, 0 0 20px #00ffff',
    bg: '#00ffff'
  },
  magenta: {
    border: '#ff00ff',
    text: '#ff00ff',
    glow: '0 0 10px #ff00ff, 0 0 20px #ff00ff',
    bg: '#ff00ff'
  },
  yellow: {
    border: '#ffff00',
    text: '#ffff00',
    glow: '0 0 10px #ffff00, 0 0 20px #ffff00',
    bg: '#ffff00'
  },
  green: {
    border: '#00ff00',
    text: '#00ff00',
    glow: '0 0 10px #00ff00, 0 0 20px #00ff00',
    bg: '#00ff00'
  }
};

export function CyberStatCard({ label, value, color, icon }: CyberStatCardProps) {
  const colors = colorMap[color];

  return (
    <div 
      className="relative bg-[#0a0e27]/80 border-2 p-6 backdrop-blur-sm overflow-hidden group hover:scale-105 transition-all duration-300"
      style={{ borderColor: colors.border }}
    >
      {/* Animated corner accent */}
      <div 
        className="absolute top-0 right-0 w-0 h-0 border-t-8 border-r-8 opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ 
          borderTopColor: colors.bg,
          borderRightColor: colors.bg
        }}
      ></div>

      {/* Scanline effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, ' + colors.bg + ' 2px, ' + colors.bg + ' 4px)'
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="text-4xl mb-3 filter transition-all duration-300"
          style={{
            filter: `drop-shadow(0 0 10px ${colors.bg})`
          }}
        >
          {icon}
        </div>
        <div 
          className="text-xs mb-2 uppercase tracking-widest opacity-70 font-mono"
          style={{ color: colors.text }}
        >
          {label}
        </div>
        <div 
          className="text-4xl tracking-wider"
          style={{ 
            color: colors.text,
            textShadow: colors.glow
          }}
        >
          {value}
        </div>
      </div>

      {/* Glowing bottom border */}
      <div 
        className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.bg}, transparent)`
        }}
      ></div>
    </div>
  );
}
