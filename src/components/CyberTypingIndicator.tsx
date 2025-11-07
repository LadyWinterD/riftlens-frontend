"use client";

const AIIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 16.5V21m3.75-18v1.5m0 16.5V21m-7.5 0h7.5m-7.5-18h7.5" />
  </svg>
);

export default function CyberTypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mt-1 text-cyan-400">
          <AIIcon />
        </div>
        <div className="typing-indicator p-3 bg-gray-800/60 rounded-lg border border-gray-700">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

