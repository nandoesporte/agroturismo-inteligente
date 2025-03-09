
import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
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
          "fixed z-40 flex items-center justify-center rounded-full shadow-lg trans",
          isOpen ? "bg-foreground text-background" : "bg-nature-600 text-white hover:bg-nature-700",
          isMobile 
            ? "bottom-4 right-4 w-12 h-12"
            : "bottom-6 right-6 w-14 h-14"
        )}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? (
          <X className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
        ) : (
          <MessageSquare className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
        )}
      </button>

      {/* Chatbot panel */}
      <div 
        className={cn(
          "fixed z-40 rounded-xl shadow-lg bg-white trans overflow-hidden",
          "border border-border",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          isAnimating && "transition-all duration-300",
          isMobile
            ? "bottom-20 right-4 left-4 w-auto max-w-none"
            : "bottom-24 right-6 w-full max-w-md"
        )}
        style={{ maxHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 150px)' }}
      >
        {isOpen && <Chatbot isMobile={isMobile} />}
      </div>
    </>
  );
};

export default ChatbotButton;
