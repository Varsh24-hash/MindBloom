
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { LogoHeart, UserIcon } from './Icons';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) return null;

  // Clean the text of internal context headers before displaying to user
  const formatText = (text: string, role: string) => {
    if (role === 'user' && text.includes('[VOICE INPUT CONTEXT]')) {
      const parts = text.split('Transcribed Text: "');
      if (parts.length > 1) {
        return parts[1].replace(/"$/, '').replace(/\nPlease respond with extra warmth and empathy, acknowledging the spoken nature of this message.$/, '');
      }
    }
    return text;
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4 py-8 space-y-8 mt-16 pb-32 scroll-smooth">
      {messages.map((msg, idx) => (
        <div 
          key={idx} 
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          style={{ animationDelay: `${idx === messages.length - 1 ? 0 : 0}ms` }}
        >
          <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1">
              {msg.role === 'user' ? (
                <div className="w-8 h-8 rounded-full bg-[#444746] flex items-center justify-center text-white shadow-sm">
                  <UserIcon className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#444746] bg-[#1e1f20] shadow-[0_0_10px_rgba(255,20,147,0.1)]">
                   <LogoHeart className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start pt-1'}`}>
               
               {/* Attachment Preview in Chat */}
               {msg.attachment && (
                 <div className={`
                    overflow-hidden rounded-2xl border border-[#444746] mb-1
                    ${msg.role === 'user' ? 'bg-[#28292c]' : 'bg-[#1e1f20]'}
                 `}>
                    {msg.attachment.mimeType.startsWith('image/') ? (
                      <img 
                        src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} 
                        alt="User upload" 
                        className="max-w-[240px] max-h-[300px] object-contain block"
                      />
                    ) : (
                      <div className="p-3 flex items-center gap-3 min-w-[180px]">
                        <div className="w-10 h-10 bg-[#131314] rounded-lg flex items-center justify-center text-[10px] text-pink-400 font-bold">
                          {msg.attachment.mimeType.split('/')[1].toUpperCase()}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-xs text-white truncate max-w-[120px]">{msg.attachment.name}</span>
                          <span className="text-[10px] text-gray-500">Document context</span>
                        </div>
                      </div>
                    )}
                 </div>
               )}

               {msg.text && (
                <div className={`
                  text-[15px] md:text-[16px] leading-7 text-[#E3E3E3] whitespace-pre-wrap
                  ${msg.role === 'user' 
                    ? 'bg-[#1e1f20] px-5 py-3 rounded-2xl rounded-tr-sm shadow-md' 
                    : ''
                  }
                `}>
                  {formatText(msg.text, msg.role)}
                </div>
               )}
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex w-full justify-start animate-fade-in-up">
           <div className="flex max-w-[80%] gap-4 flex-row">
             <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#444746]">
                <LogoHeart className="w-5 h-5 opacity-50" />
             </div>
             <div className="pt-2">
               <div className="h-2 w-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce inline-block mr-1"></div>
               <div className="h-2 w-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce inline-block mr-1 delay-100" style={{ animationDelay: '0.2s' }}></div>
               <div className="h-2 w-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce inline-block delay-200" style={{ animationDelay: '0.4s' }}></div>
             </div>
           </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatInterface;
