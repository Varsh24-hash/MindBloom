
import React, { useState, useRef, useEffect } from 'react';
import { LogoHeart, MenuIcon, LogoutIcon, DropdownIcon } from './Icons';
import { User } from '../App';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (view: 'chat' | 'mood-tracker' | 'therapists' | 'home' | 'about') => void;
  currentView: string;
  user: User | null;
  onSignIn: () => void;
  onSignOut?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
    onToggleSidebar, 
    onNavigate, 
    currentView, 
    user, 
    onSignIn,
    onSignOut
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [
      { label: 'About MindBloom', id: 'about' },
      { label: 'Mood Tracker', id: 'mood-tracker' },
      { label: 'For Therapists', id: 'therapists' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-4 w-full fixed top-0 left-0 z-40 bg-[#131314]/90 backdrop-blur-md transition-all duration-300 border-b border-[#444746]/10">
      {/* Left: Branding */}
      <div className="flex items-center gap-2 select-none">
        <button 
           onClick={onToggleSidebar}
           className="p-2 mr-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        
        <div 
            className="flex items-center gap-2.5 group cursor-pointer"
            onClick={() => onNavigate('home')}
        >
            <div className="transition-transform duration-500 group-hover:scale-110">
                <LogoHeart className="w-8 h-8" />
            </div>
            <span className="text-xl font-medium tracking-tight text-gray-200 transition-colors group-hover:text-white">
            MindBloom
            </span>
        </div>
      </div>

      {/* Right: Actions & Links */}
      <div className="flex items-center gap-2 md:gap-6">
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-400">
            {navItems.map((item) => (
                <button 
                    key={item.id} 
                    onClick={() => onNavigate(item.id as any)}
                    className={`relative px-4 py-2 rounded-xl hover:text-white transition-all duration-300 group ${currentView === item.id ? 'text-white bg-white/5' : ''}`}
                >
                    {item.label}
                    <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 transition-transform duration-300 origin-center ${currentView === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </button>
            ))}
        </div>
        
        {user ? (
            <div className="relative" ref={profileRef}>
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-white/5 transition-all border border-[#444746] bg-[#1e1f20] group"
                >
                     <span className="hidden sm:block text-[14px] text-gray-200 font-medium max-w-[120px] truncate group-hover:text-white">
                        {user.name}
                     </span>
                     {user.avatar ? (
                         <img src={user.avatar} alt="Profile" className="w-7 h-7 rounded-full border border-gray-700 shadow-sm" />
                     ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                            {user.name.charAt(0)}
                        </div>
                     )}
                     <DropdownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-[#1e1f20] border border-[#444746] rounded-[24px] shadow-2xl overflow-hidden py-2 z-50 animate-fade-in-up">
                        <div className="px-5 py-4 border-b border-[#333] bg-[#2d2e2f]/20">
                            <p className="text-sm text-white font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                        </div>
                        <div className="py-2">
                            <button 
                                onClick={() => {
                                    setIsProfileOpen(false);
                                    onSignOut?.();
                                }}
                                className="w-full text-left px-5 py-3.5 text-[14px] text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors font-medium"
                            >
                                <LogoutIcon className="w-4 h-4" />
                                Sign out of MindBloom
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <button 
                onClick={onSignIn}
                className="bg-[#1a73e8] hover:bg-[#1b66c9] text-white px-7 py-2.5 rounded-full text-[14px] font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
                Sign in
            </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
