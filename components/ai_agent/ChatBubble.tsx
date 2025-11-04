
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ChatMessage, GroundingChunk } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import Button from '../common/Button';

interface ChatBubbleProps {
  message: ChatMessage;
  groundingChunks?: GroundingChunk[];
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, groundingChunks }) => {
  const t = useTranslations();
  const isUser = message.sender === 'user';
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [showCode, setShowCode] = useState(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [diagramId] = useState(() => `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    });
  }, []);

  useEffect(() => {
    if (message.isDiagram && mermaidRef.current && !showCode) {
      const renderDiagram = async () => {
        try {
          setDiagramError(null);
          
          // Clear previous content
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
          }

          // Extract mermaid code from message
          let mermaidCode = message.text.trim();
          
          // Remove code block markers if present
          if (mermaidCode.startsWith('```mermaid')) {
            mermaidCode = mermaidCode.replace(/^```mermaid\s*/, '').replace(/```$/, '').trim();
          } else if (mermaidCode.startsWith('```')) {
            mermaidCode = mermaidCode.replace(/^```\s*/, '').replace(/```$/, '').trim();
          }

          // Validate that it looks like mermaid syntax
          if (!mermaidCode.match(/^(graph|flowchart|pie|sequenceDiagram|classDiagram|stateDiagram|journey|gitgraph)/i)) {
            throw new Error('Not valid Mermaid syntax. Please ask AI to generate proper Mermaid format.');
          }

          // Render the diagram
          const { svg } = await mermaid.render(diagramId, mermaidCode);
          
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (e) {
          console.error("Mermaid rendering error:", e);
          const err = e as Error;
          setDiagramError(`Diagram Error: ${err.message}`);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<div class="p-4 bg-red-50 border border-red-200 rounded">
              <p class="text-red-700 text-sm mb-2">Failed to render diagram</p>
              <pre class="text-xs text-gray-600 overflow-auto">${message.text}</pre>
            </div>`;
          }
        }
      };
      renderDiagram();
    }
  }, [message.isDiagram, message.text, showCode, diagramId]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{part}</a>;
      }
      return part;
    });
  };

  const renderContent = () => {
    if (message.isDiagram) {
      return (
        <div>
          <div className="flex justify-end space-x-2 mb-2">
            <Button size="sm" variant="ghost" onClick={() => setShowCode(false)} disabled={!showCode} className={!showCode ? 'bg-slate-200' : ''}>{t('diagramView')}</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCode(true)} disabled={showCode} className={showCode ? 'bg-slate-200' : ''}>{t('codeView')}</Button>
          </div>
          {diagramError && <div className="p-2 text-xs text-red-700 bg-red-100 rounded mb-2">{diagramError}</div>}
          {showCode ? (
            <pre className="p-2 bg-slate-800 text-white rounded-md text-xs overflow-x-auto">
              <code>{message.text}</code>
            </pre>
          ) : (
             <div ref={mermaidRef} className="mermaid-diagram p-4 bg-white rounded-md border border-gray-200 min-h-[200px] flex justify-center items-center overflow-auto">
               <div className="text-gray-500 text-sm">Rendering diagram...</div>
             </div>
          )}
        </div>
      );
    }
    return <p className="text-sm whitespace-pre-wrap">{renderTextWithLinks(message.text)}</p>;
  };

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-md ${
          isUser
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-white text-slate-700 rounded-bl-none border border-slate-200'
        }`}
      >
        {renderContent()}
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-200 text-right' : 'text-slate-500 text-left'}`}>
          {formatTimestamp(message.timestamp)}
        </div>
        {!isUser && groundingChunks && groundingChunks.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">{t('groundingSources')}</p>
            <ul className="list-disc list-inside space-y-1">
              {groundingChunks.map((chunk, index) => {
                const source = chunk.web || chunk.retrievedContext;
                if (source && source.uri) {
                  return (
                    <li key={index} className="text-xs">
                      <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                        {source.title || source.uri}
                      </a>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;