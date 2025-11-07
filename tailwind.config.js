/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // --- [V7.0 蓝图!] 1. 我们的“霓虹”调色板 ---
      colors: {
        'space-dark': '#0a0e27',   // 深空背景
        'space-light': '#1a1f3a',  // 卡片背景
        'cyber-cyan': {
          DEFAULT: '#00ffff',
          light: '#7fffff',
          dark: '#0088ff',
        },
        'cyber-magenta': {
          DEFAULT: '#ff00ff',
        },
        'cyber-yellow': {
          DEFAULT: '#ffff00',
        },
        'cyber-green': {
          DEFAULT: '#00ff00',
        },
        'cyber-red': {
          DEFAULT: '#ff0000',
        },
        'cyber-gray': {
          light: '#aaaaaa',
          DEFAULT: '#666666',
        }
      },

      // --- [V7.0 蓝图!] 2. 我们的“动画”关键帧 ---
      keyframes: {
        // “扫描线”动画 (用于全息界面)
        scanline: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        // “脉冲辉光”动画 (用于按钮)
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff',
            opacity: 0.8 
          },
          '50%': { 
            boxShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
            opacity: 1 
          },
        },
        // “故障”动画 (用于 hover)
        glitch: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '50%': { transform: 'translateX(2px)' },
          '75%': { transform: 'translateX(-1px)' },
        }
      },

      // --- [V7.0 蓝图!] 3. 我们的“动画”快捷方式 ---
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'glitch': 'glitch 0.3s'
      },

      // --- [V7.0 蓝图!] 4. 我们的“辉光”特效 ---
      boxShadow: {
        'neon-cyan': '0 0 10px #00ffff, 0 0 20px #00ffff',
        'neon-magenta': '0 0 10px #ff00ff, 0 0 20px #ff00ff',
        'neon-yellow': '0 0 10px #ffff00, 0 0 20px #ffff00',
      },
      textShadow: {
        'neon-cyan': '0 0 5px #00ffff, 0 0 10px #00ffff',
        'neon-magenta': '0 0 5px #ff00ff, 0 0 10px #ff00ff',
      },
    },
  },
  plugins: [
    // 这是一个帮助我们实现“文字辉光”的插件
    require('tailwindcss-textshadow')
  ],
};