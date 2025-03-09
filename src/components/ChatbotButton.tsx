
import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Bot, Send } from 'lucide-react';
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
          "fixed z-[1000] flex items-center justify-center shadow-lg transition-all duration-300",
          isOpen 
            ? "bg-foreground text-background rounded-full" 
            : "bg-gradient-to-r from-nature-500 to-nature-600 text-white hover:from-nature-600 hover:to-nature-700 hover:shadow-xl",
          isMobile 
            ? isOpen 
              ? "bottom-4 right-4 h-12 w-12" 
              : "bottom-4 right-4 h-14 w-14 rounded-xl"
            : isOpen 
              ? "bottom-6 right-6 h-14 w-14" 
              : "bottom-6 right-6 h-16 px-5 rounded-full"
        )}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? (
          <X className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
        ) : (
          <div className={cn(
            "flex items-center justify-center",
            !isMobile && "gap-2"
          )}>
            {isMobile ? (
              <Bot className="h-6 w-6" />
            ) : (
              <>
                <Bot className="h-6 w-6" />
                <span className="font-medium">AgroGuia</span>
              </>
            )}
          </div>
        )}
      </button>

      {/* Chatbot panel */}
      <div 
        className={cn(
          "fixed z-[999] rounded-xl shadow-xl bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden",
          "border border-nature-200 dark:border-nature-800",
          isOpen 
            ? "opacity-100 scale-100" 
            : "opacity-0 scale-95 pointer-events-none",
          isMobile
            ? "bottom-20 right-4 left-4 w-auto max-w-none h-[70vh]"
            : "bottom-24 right-6 w-full max-w-md h-[500px]"
        )}
      >
        {isOpen && <Chatbot isMobile={isMobile} />}
      </div>

      {/* Pulse animation when closed */}
      {!isOpen && (
        <span 
          className={cn(
            "absolute rounded-full bg-nature-400 opacity-75",
            "animate-ping",
            isMobile 
              ? "h-5 w-5 right-4 bottom-4" 
              : "h-6 w-6 right-6 bottom-6"
          )}
        />
      )}
    </>
  );
};

export default ChatbotButton;
