
import React, { useState, KeyboardEvent, useRef } from 'react';
import Button from '../common/Button';
import { useTranslations } from '../../hooks/useTranslations';
import { ICON_SIZE } from '../../constants';
import { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../../types';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SpeechRecognition = (window as Window & { 
  SpeechRecognition?: typeof SpeechRecognition; 
  webkitSpeechRecognition?: typeof SpeechRecognition; 
}).SpeechRecognition || (window as Window & { 
  SpeechRecognition?: typeof SpeechRecognition; 
  webkitSpeechRecognition?: typeof SpeechRecognition; 
}).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const t = useTranslations();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);


  if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // This can be dynamic based on app language later

      recognition.onstart = () => {
          setIsListening(true);
      };

      recognition.onend = () => {
          setIsListening(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setMessage(prev => prev ? `${prev} ${transcript}` : transcript);
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
      }
  }

  const toggleListening = () => {
    if (!recognition) {
        alert(t('voiceNotSupported'));
        return;
    }
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
  };

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200 flex items-start space-x-3 sticky bottom-0">
      <textarea
        ref={textAreaRef}
        value={message}
        onChange={handleInput}
        onKeyPress={handleKeyPress}
        placeholder={t(isListening ? 'listening' : 'typeYourMessage')}
        className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm transition-shadow focus:shadow-md max-h-40"
        rows={1}
        disabled={isLoading}
      />
      <div className="flex flex-col sm:flex-row gap-2">
         {recognition && (
             <Button 
                onClick={toggleListening} 
                disabled={isLoading} 
                variant={isListening ? 'danger' : 'secondary'} 
                size="md" 
                title={t('voiceInput')}
                className="!p-3"
            >
                {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`animate-pulse ${ICON_SIZE}`}><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 13a.5.5 0 01.5.5v1a3.5 3.5 0 007 0v-1a.5.5 0 011 0v1a4.5 4.5 0 01-9 0v-1a.5.5 0 01.5-.5z" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={ICON_SIZE}><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 13a.5.5 0 01.5.5v1a3.5 3.5 0 007 0v-1a.5.5 0 011 0v1a4.5 4.5 0 01-9 0v-1a.5.5 0 01.5-.5z" /></svg>
                )}
            </Button>
         )}
        <Button onClick={handleSubmit} disabled={isLoading || !message.trim()} size="md" className="!p-3">
            {isLoading ? (
            <svg className={`animate-spin ${ICON_SIZE} text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={ICON_SIZE}>
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
                <span className="ml-2 hidden sm:inline">{t('sendMessage')}</span>
            </>
            )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;