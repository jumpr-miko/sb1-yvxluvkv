import React, { useState, useEffect } from 'react';

interface TypeWriterProps {
  text: string;
  delay?: {
    min: number;
    max: number;
  };
  onComplete?: () => void;
  className?: string;
}

const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  delay = { min: 15, max: 45 },
  onComplete,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      // Random delay to simulate thinking/typing
      const randomDelay = Math.floor(Math.random() * (delay.max - delay.min + 1)) + delay.min;
      
      // Apply longer delays for punctuation to make it feel more natural
      const currentChar = text[currentIndex];
      const extraDelay = ['.', '!', '?', ',', ';', ':'].includes(currentChar) ? 150 : 0;
      
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, randomDelay + extraDelay);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, delay, isComplete, onComplete]);

  return <span className={className}>{displayedText}</span>;
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(TypeWriter);