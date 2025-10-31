import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Language, GroundingChunk } from '../types';
import ChatBubble from './ai_agent/ChatBubble';
import MessageInput from './ai_agent/MessageInput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { startChat, sendMessageToChat, ProxiedChat } from '../services/geminiService';

const PartnerNavigatorAI: React.FC = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatInstanceRef = useRef<ProxiedChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentGroundingChunks, setCurrentGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);

  const initializeChat = useCallback(() => {
    try {
      // Creates a local chat object, not a connection to Google.
      chatInstanceRef.current = startChat(language);
      setMessages([
        {
          id: 'init',
          text: t('aiAgentWelcome'),
          sender: 'ai',
          timestamp: new Date(),
          language: language,
        },
      ]);
      setError(null);
    } catch (e) {
      console.error("Failed to initialize chat object:", e);
      setError("Failed to initialize AI Agent.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, t]);
  
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'ai', groundingChunks?: GroundingChunk[], isDiagram: boolean = false) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      language: language,
      isDiagram,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    if (sender === 'ai') {
        setCurrentGroundingChunks(groundingChunks);
    } else {
        setCurrentGroundingChunks(undefined); // Clear for user messages or if AI response has no grounding
    }
  };
  
  const isMermaidDiagram = (text: string): string | false => {
    const trimmedText = text.trim();
    const mermaidRegex = /^```(?:mermaid)?\s*\n(.*?)\n\s*```$/s;
    const match = trimmedText.match(mermaidRegex);
    if (match && match[1]) {
      return match[1].trim();
    }
    if (trimmedText.startsWith('graph') || trimmedText.startsWith('sequenceDiagram') || trimmedText.startsWith('gantt') || trimmedText.startsWith('pie')) {
      return trimmedText;
    }
    return false;
  };


  const handleSendMessage = async (userMessageText: string) => {
    if (!chatInstanceRef.current) {
        initializeChat();
        if(!chatInstanceRef.current) {
            setError("AI Agent is not available. Please try again later.");
            addMessage("AI Agent is not available. Please try again later.", 'ai');
            return;
        }
    }

    addMessage(userMessageText, 'user');
    setIsLoading(true);
    setError(null);
    
    const lowerUserMessage = userMessageText.toLowerCase();
    
    // Check for "search" keyword for Google Search grounding
    const useGoogleSearch = lowerUserMessage.includes("search news about") || 
                            lowerUserMessage.includes("latest on") ||
                            lowerUserMessage.includes("what's new with") ||
                            lowerUserMessage.includes("current events") ||
                            lowerUserMessage.includes("olympics 2024");
                            
    let promptText = userMessageText;
    if (lowerUserMessage.includes('diagram') || lowerUserMessage.includes('graph') || lowerUserMessage.includes('chart')) {
        promptText = `IMPORTANT: Generate the response as a Mermaid.js graph code block. Do not include any other text or explanation outside the code block. \n\nPROMPT: ${userMessageText}`;
    }

    try {
        // The service now sends the message and history to the backend proxy
        const { text: aiResponse, groundingChunks } = await sendMessageToChat(chatInstanceRef.current, promptText);
        const diagramCode = isMermaidDiagram(aiResponse);
        if (diagramCode) {
            addMessage(diagramCode, 'ai', groundingChunks, true);
        } else {
            addMessage(aiResponse, 'ai', groundingChunks);
        }
    } catch (e) {
        console.error(e);
        const err = e as Error;
        const errorMessage = `Sorry, I encountered an error. Please try again. (${err.message})`;
        addMessage(errorMessage, 'ai');
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col h-[calc(100vh-var(--navbar-height,80px)-52px)] bg-slate-50">
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <ChatBubble key={msg.id} message={msg} groundingChunks={index === messages.length - 1 ? currentGroundingChunks : undefined} />
        ))}
        {isLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default PartnerNavigatorAI;