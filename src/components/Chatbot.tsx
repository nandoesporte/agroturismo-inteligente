
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Olá! Sou o assistente virtual do AgroParaná. Como posso ajudar você hoje?',
    sender: 'bot',
    timestamp: new Date()
  }
];

const suggestedQuestions = [
  'Quais são as propriedades mais populares?',
  'Quero conhecer vinícolas na região',
  'Como funciona o agendamento de visitas?',
  'Procuro atividades para crianças',
  'Quais cafés coloniais você recomenda?'
];

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callAgroAssistant = async (userMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('agro-assistant', {
        body: { message: userMessage }
      });

      if (error) {
        console.error('Error calling assistant:', error);
        throw new Error(error.message);
      }

      return data.response;
    } catch (error) {
      console.error('Failed to get assistant response:', error);
      toast({
        title: "Erro na comunicação",
        description: "Não foi possível conectar ao assistente. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde ou entre em contato pelo WhatsApp.";
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Get response from our assistant
      const assistantResponse = await callAgroAssistant(inputValue);
      
      // Add bot response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: assistantResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add fallback response in case of error
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      handleSend();
    }, 100);
  };
  
  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted">
        <h3 className="font-medium">Assistente AgroParaná</h3>
        <p className="text-xs text-muted-foreground">Tire suas dúvidas sobre o agroturismo</p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id}
            className={cn(
              "flex",
              message.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div 
              className={cn(
                "max-w-[80%] rounded-xl p-3",
                message.sender === 'user' 
                  ? "bg-nature-600 text-white rounded-tr-none"
                  : "bg-muted rounded-tl-none"
              )}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div 
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    message.sender === 'user' ? "bg-white/20" : "bg-nature-100"
                  )}
                >
                  {message.sender === 'user' ? (
                    <User className="w-3 h-3 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 text-nature-600" />
                  )}
                </div>
                <span className="text-xs font-medium">
                  {message.sender === 'user' ? 'Você' : 'Assistente'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <div className="text-right mt-1">
                <span className="text-xs opacity-70">
                  {`${message.timestamp.getHours().toString().padStart(2, '0')}:${message.timestamp.getMinutes().toString().padStart(2, '0')}`}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl rounded-tl-none p-3 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-nature-400 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-nature-400 animate-pulse delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-nature-400 animate-pulse delay-200"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggested questions */}
      {messages.length <= 2 && (
        <div className="p-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Perguntas sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="text-xs px-3 py-1.5 border border-border rounded-full hover:bg-muted trans"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <textarea
            className="flex-1 min-h-[40px] max-h-[120px] p-2 bg-muted border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-nature-500"
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={inputValue.trim() === ''}
            className={cn(
              "p-2 rounded-md transition-colors",
              inputValue.trim() !== ''
                ? "bg-nature-600 text-white hover:bg-nature-700"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            aria-label="Enviar mensagem"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
