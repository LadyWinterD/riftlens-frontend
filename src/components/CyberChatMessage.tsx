"use client";

import type { ChatMessage } from '@/services/awsService';

const AIIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 16.5V21m3.75-18v1.5m0 16.5V21m-7.5 0h7.5m-7.5-18h7.5" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
  </svg>
);

export default function CyberChatMessage({ role, content }: ChatMessage) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-xs lg:max-w-md p-3 bg-cyan-800/80 rounded-lg shadow-md border border-cyan-700">
          <p className="text-white whitespace-pre-line">{content.trim()}</p>
        </div>
      </div>
    );
  }

  if (role === 'error') {
    return (
      <div className="flex justify-start">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-900 flex items-center justify-center mt-1 text-red-300">
            <ErrorIcon />
          </div>
          <div className="max-w-xs lg:max-w-md p-3 bg-red-800/50 rounded-lg shadow-md border border-red-700">
            <p className="text-red-200 whitespace-pre-line">{content.trim()}</p>
          </div>
        </div>
      </div>
    );
  }

  // (role === 'assistant')
  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mt-1 text-cyan-400">
          <AIIcon />
        </div>
        <div className="max-w-xs lg:max-w-md p-3 bg-gray-800/60 rounded-lg shadow-md border border-gray-700">
          <p className="text-gray-200 whitespace-pre-line">{content.trim()}</p>
        </div>
      </div>
    </div>
  );
}

