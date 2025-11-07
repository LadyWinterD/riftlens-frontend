"use client";
// (Day 6-7 我们会在这里复刻你的“八角形”按钮和“全息界面”)
export default function AIAssistant({ report }) {
  return (
    <div className="fixed bottom-10 right-10 z-50">
      <div className="w-20 h-20 bg-cyan-400/80 rounded-full flex items-center justify-center 
                    text-black text-4xl shadow-lg cursor-pointer 
                    border-4 border-cyan-400 shadow-cyan-400/50
                    animate-pulse">
        🤖
      </div>
    </div>
  );
}