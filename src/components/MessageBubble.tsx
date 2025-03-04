import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import TypeWriter from './TypeWriter';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, isTyping = false }) => {
  const [isComplete, setIsComplete] = useState(!isTyping);
  
  const isAssistant = role === 'assistant';
  
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[70%] rounded-lg p-3 ${
          isAssistant ? 'bg-bolt-gray' : 'bg-bolt-blue text-white'
        }`}
      >
        <div className="flex items-start">
          {isAssistant && (
            <div className="mr-2 mt-0.5 h-5 w-5 flex items-center justify-center text-bolt-blue">
              <Bot size={16} strokeWidth={1.5} />
            </div>
          )}
          <div className="text-sm">
            {isTyping ? (
              <TypeWriter 
                text={content} 
                delay={{ min: 20, max: 70 }}
                onComplete={() => setIsComplete(true)}
              />
            ) : (
              content
            )}
            {isTyping && !isComplete && (
              <span className="inline-flex ml-1">
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse mx-0.5" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse mx-0.5" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse mx-0.5" style={{ animationDelay: '300ms' }}></span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(MessageBubble);