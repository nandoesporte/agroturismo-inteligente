
import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import Chatbot from './Chatbot';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleChat = () => {
    setIsAnimating(true);
    if (isOpen) {
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 300);
    } else {
      setIsOpen(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <>
      {/* Chatbot toggle button */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed z-[1000] flex items-center justify-center rounded-full shadow-lg transition-colors duration-200",
          isOpen ? "bg-foreground text-background" : "bg-nature-600 text-white hover:bg-nature-700",
          isMobile 
            ? "bottom-4 right-4 h-14 w-14"
            : "bottom-6 right-6 h-16 w-16"
        )}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? (
          <X className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Smile className={isMobile ? "h-6 w-6" : "h-7 w-7"} />
            <span className="text-xs mt-0.5">AgroGuia</span>
          </div>
        )}
      </button>

      {/* Chatbot panel */}
      <div 
        className={cn(
          "fixed z-[999] rounded-xl shadow-xl bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden",
          "border border-nature-200 dark:border-nature-800",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          isMobile
            ? "bottom-20 right-4 left-4 w-auto max-w-none h-[70vh]"
            : "bottom-24 right-6 w-full max-w-md h-[500px]"
        )}
      >
        {isOpen && <Chatbot isMobile={isMobile} />}
      </div>
    </>
  );
};

export default ChatbotButton;
