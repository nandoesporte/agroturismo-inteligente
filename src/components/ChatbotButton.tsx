
import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Chatbot from './Chatbot';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
          "fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full shadow-lg w-14 h-14 trans",
          isOpen ? "bg-foreground text-background" : "bg-nature-600 text-white hover:bg-nature-700"
        )}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>

      {/* Chatbot panel */}
      <div 
        className={cn(
          "fixed bottom-24 right-6 z-40 w-full max-w-md rounded-xl shadow-lg bg-white trans overflow-hidden",
          "border border-border",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          isAnimating && "transition-all duration-300"
        )}
        style={{ maxHeight: 'calc(100vh - 150px)' }}
      >
        {isOpen && <Chatbot />}
      </div>
    </>
  );
};

export default ChatbotButton;
