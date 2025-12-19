import React from 'react';
import { PlusIcon, ChatBubbleIcon, MenuIcon } from './Icons';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession 
}) => {
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-[#1e1f20] z-50 transform transition-transform duration-300 ease-in-out border-r border-[#444746] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <button 
             onClick={onClose}
             className="p-2 hover:bg-[#333] rounded-full text-gray-400 hover:text-white transition-colors"
          >
             <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-4">
           <button 
             onClick={() => {
                 onNewChat();
                 if (window.innerWidth < 768) onClose();
             }}
             className="w-full flex items-center gap-3 bg-[#1a1b1c] hover:bg-[#2d2e2f] border border-[#444746] text-gray-300 hover:text-pink-400 py-3 px-4 rounded-xl transition-all duration-200 group"
           >
              <div className="bg-[#2d2e2f] group-hover:bg-[#1e1f20] p-1 rounded-full transition-colors">
                <PlusIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">New Chat</span>
           </button>
        </div>

        {/* Recent Label */}
        <div className="px-6 py-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent</span>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
           {sessions.length === 0 ? (
               <div className="px-4 py-8 text-center text-sm text-gray-500 italic">
                   No chat history yet. Start a new conversation!
               </div>
           ) : (
               sessions.slice().reverse().map(session => (
                   <button
                     key={session.id}
                     onClick={() => {
                         onSelectSession(session.id);
                         if (window.innerWidth < 768) onClose();
                     }}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors duration-200 mb-1 ${
                         currentSessionId === session.id 
                            ? 'bg-[#004a77] text-white font-medium' 
                            : 'text-gray-300 hover:bg-[#2d2e2f] hover:text-white'
                     }`}
                   >
                       <ChatBubbleIcon className="w-4 h-4 flex-shrink-0" />
                       <span className="truncate text-left w-full">{session.title}</span>
                   </button>
               ))
           )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#444746] text-[10px] text-gray-500 text-center">
            MindBloom v1.0
        </div>
      </div>
    </>
  );
};

export default Sidebar;