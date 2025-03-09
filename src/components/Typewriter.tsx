
import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 30 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      // Add random variation to typing speed to make it look more natural
      const randomizedSpeed = speed + Math.random() * 15 - 5;
      
      // Pause longer at punctuation
      const currentChar = text[currentIndex];
      const shouldPause = ['.', '!', '?', ',', ';', ':'].includes(currentChar) && !isPaused;
      
      if (shouldPause) {
        setIsPaused(true);
        const pauseTime = ['.', '!', '?'].includes(currentChar) ? 400 : 200;
        
        const pauseTimer = setTimeout(() => {
          setIsPaused(false);
          setDisplayText(prev => prev + currentChar);
          setCurrentIndex(prev => prev + 1);
        }, pauseTime);
        
        return () => clearTimeout(pauseTimer);
      }
      
      if (!isPaused) {
        const timer = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, randomizedSpeed);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, text, speed, isPaused]);

  return (
    <p className="text-sm whitespace-pre-wrap break-words">
      {displayText}
      {currentIndex < text.length && (
        <span className="inline-block w-1 h-4 ml-0.5 bg-nature-400 animate-pulse"></span>
      )}
    </p>
  );
};

export default Typewriter;
