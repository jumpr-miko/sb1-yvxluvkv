import React, { useCallback } from 'react';
import { Send, Bot } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface ChatPanelProps {
  messages: Array<{ role: 'user' | 'assistant', content: string, isTyping?: boolean }>;
  input: string;
  setInput: (input: string) => void;
  onSendMessage: () => void;
  loading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  input,
  setInput,
  onSendMessage,
  loading,
  chatEndRef,
  messagesContainerRef
}) => {
  // Memoize the input change handler to prevent unnecessary re-creation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, [setInput]);

  // Memoize the key press handler
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  }, [onSendMessage]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
            isTyping={message.isTyping}
          />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg p-3 bg-bolt-gray">
              <div className="flex items-center space-x-2">
                <div className="mr-2 h-5 w-5 flex items-center justify-center text-bolt-blue">
                  <Bot size={16} strokeWidth={1.5} />
                </div>
                <div className="flex space-x-1">
                  <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} /> {/* Empty div for scrolling to bottom */}
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-border bg-secondary">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="What do you want to do?"
            className="flex-1 p-2 bg-bolt-dark border border-border text-bolt-light rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-sm"
          />
          <button 
            onClick={onSendMessage}
            className="p-2 bg-bolt-blue text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-1 focus:ring-bolt-blue"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ChatPanel);