
import React from 'react';
import { FlashMessage } from '../types';

interface FlashMessageDisplayProps {
  messages: FlashMessage[];
  onClose: (id: string) => void;
}

const typeClasses = {
  success: 'bg-green-600/30 border-green-400 text-green-100', // More vibrant border
  error: 'bg-red-600/30 border-red-400 text-red-100',     // More vibrant border
  info: 'bg-blue-600/30 border-blue-400 text-blue-100',       // More vibrant border
};

export const FlashMessageDisplay: React.FC<FlashMessageDisplayProps> = ({ messages, onClose }) => {
  if (!messages.length) return null;

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3 w-full max-w-sm">
      {messages.map((msg, index) => (
        <div
          key={msg.id}
          className={`p-4 rounded-xl shadow-xl border text-sm flex justify-between items-start glass-card ${typeClasses[msg.type]}`} // Added rounded-xl
          style={{ animation: `slideInFromRight 0.5s ${index * 0.1}s ease-out forwards`, opacity: 0 }}
        >
          <p>{msg.message}</p>
          <button
            onClick={() => onClose(msg.id)}
            className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      {/* Fix: Use dangerouslySetInnerHTML for inline styles in React */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
};