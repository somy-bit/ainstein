
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

  useEffect(() => {
    if (message.isDiagram && mermaidRef.current && !showCode) {
      const renderDiagram = async () => {
        try {
          mermaidRef.current!.innerHTML = message.text; // Use the raw mermaid text
          await mermaid.run({ nodes: [mermaidRef.current!] });
          setDiagramError(null);
        } catch (e) {
          console.error("Mermaid rendering error:", e);
          const err = e as Error;
          setDiagramError(`Diagram Error: ${err.message}`);
          if (mermaidRef.current) {
             mermaidRef.current.innerHTML = `<pre><code>${message.text}</code></pre>`;
          }
        }
      };
      renderDiagram();
    }
  }, [message.isDiagram, message.text, showCode]);

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
          {diagramError && <div className="p-2 text-xs text-red-700 bg-red-100 rounded">{diagramError}</div>}
          {showCode ? (
            <pre className="p-2 bg-slate-800 text-white rounded-md text-xs overflow-x-auto">
              <code>{message.text}</code>
            </pre>
          ) : (
             <div ref={mermaidRef} className="mermaid-diagram p-2 bg-white rounded-md flex justify-center items-center overflow-auto">
               {message.text}
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