
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  role?: 'user' | 'assistant'; // For API context
  content?: string; // For API context
}

interface ChatbotProps {
  isMobile?: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Olá! Sou o assistente virtual do AgroParaná. Como posso ajudar você hoje?',
    sender: 'bot',
    timestamp: new Date(),
    role: 'assistant',
    content: 'Olá! Sou o assistente virtual do AgroParaná. Como posso ajudar você hoje?'
  }
];

const suggestedQuestions = [
  'Quais são as propriedades mais populares?',
  'Quero conhecer vinícolas na região',
  'Como funciona o agendamento de visitas?',
  'Procuro atividades para crianças',
  'Quais cafés coloniais você recomenda?'
];

const Chatbot = ({ isMobile = false }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prepare context for the API from previous messages
  const prepareContext = () => {
    // Only include the last 10 messages to avoid token limits
    return messages
      .slice(-10)
      .filter(msg => msg.role && msg.content)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  };

  const callAgroAssistant = async (userMessage: string) => {
    try {
      const context = prepareContext();
      console.log("Sending context to API:", context);
      
      const { data, error } = await supabase.functions.invoke('agro-assistant', {
        body: { message: userMessage, context }
      });

      if (error) {
        console.error('Error calling assistant:', error);
        throw new Error(error.message);
      }

      return { 
        response: data.response,
        message: data.message
      };
    } catch (error) {
      console.error('Failed to get assistant response:', error);
      toast({
        title: "Erro na comunicação",
        description: "Não foi possível conectar ao assistente. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return { 
        response: "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde ou entre em contato pelo WhatsApp.",
        message: {
          role: "assistant", 
          content: "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde ou entre em contato pelo WhatsApp."
        }
      };
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      role: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Get response from our assistant
      const result = await callAgroAssistant(inputValue);
      
      // Add bot response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        sender: 'bot',
        timestamp: new Date(),
        role: 'assistant',
        content: result.response
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add fallback response in case of error
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde.",
        sender: 'bot',
        timestamp: new Date(),
        role: 'assistant',
        content: "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde."
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className={cn("flex flex-col", isMobile ? "h-[450px]" : "h-[500px]")}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted flex justify-between items-center">
        <div>
          <h3 className="font-medium">Assistente AgroParaná</h3>
          <p className="text-xs text-muted-foreground">Tire suas dúvidas sobre o agroturismo</p>
        </div>
        {isMobile && (
          <button 
            onClick={toggleExpand} 
            className="text-muted-foreground hover:text-foreground"
            aria-label={isExpanded ? "Minimizar chat" : "Expandir chat"}
          >
            <ChevronDown className={cn("h-5 w-5 transition-transform", !isExpanded && "rotate-180")} />
          </button>
        )}
      </div>
      
      {/* Messages */}
      {(isExpanded || !isMobile) && (
        <div className={cn(
          "flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4", 
          isMobile ? "bg-muted/30" : ""
        )}>
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
                  "max-w-[85%] md:max-w-[80%] rounded-xl p-2 md:p-3 shadow-sm",
                  message.sender === 'user' 
                    ? "bg-nature-600 text-white rounded-tr-none"
                    : "bg-white md:bg-muted rounded-tl-none"
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
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
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
              <div className="bg-white md:bg-muted rounded-xl rounded-tl-none p-3 flex items-center space-x-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-nature-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-nature-400 animate-pulse delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-nature-400 animate-pulse delay-200"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* Suggested questions */}
      {(isExpanded || !isMobile) && messages.length <= 2 && (
        <div className="p-2 md:p-3 border-t border-border bg-background">
          <p className="text-xs text-muted-foreground mb-1 md:mb-2">Perguntas sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="text-xs px-2 py-1 md:px-3 md:py-1.5 border border-border rounded-full hover:bg-muted trans"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className={cn(
        "p-2 md:p-3 border-t border-border bg-background", 
        (!isExpanded && isMobile) && "border-t-0"
      )}>
        <div className="flex items-center space-x-2">
          <Textarea
            className="min-h-[40px] max-h-[100px] md:max-h-[120px] p-2 bg-muted border border-border rounded-md text-sm resize-none focus-visible:ring-1 focus-visible:ring-nature-500 focus-visible:ring-offset-0"
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
