
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
  isAuthLoading?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
    onToggleSidebar, 
    onNavigate, 
    currentView, 
    user, 
    onSignIn,
    onSignOut,
    isAuthLoading = false
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [
      { label: 'About MindBloom', id: 'about' },
      { label: 'Mood Tracker', id: 'mood-tracker' },
      { label: 'For Therapists', id: 'therapists' }
  ];

  // Close dropdown when clicking outside
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
    <nav className="flex items-center justify-between px-6 py-4 w-full fixed top-0 left-0 z-40 bg-[#131314]/95 backdrop-blur-sm transition-all duration-300 border-b border-transparent hover:border-[#444746]/30">
      {/* Left: Branding */}
      <div className="flex items-center gap-2 select-none">
        <button 
           onClick={onToggleSidebar}
           className="p-1 mr-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        
        <div 
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => onNavigate('home')}
        >
            <div className="transition-transform duration-500 group-hover:scale-110">
                <LogoHeart className="w-7 h-7" />
            </div>
            <span className="text-xl font-medium tracking-tight text-gray-200 transition-colors group-hover:text-white">
            MindBloom
            </span>
        </div>
      </div>

      {/* Right: Actions & Links */}
      <div className="flex items-center gap-2 md:gap-6">
        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-300">
            {navItems.map((item) => (
                <button 
                    key={item.id} 
                    onClick={() => {
                        if (item.id === 'mood-tracker') {
                            onNavigate('mood-tracker');
                        } else if (item.id === 'therapists') {
                            onNavigate('therapists');
                        } else if (item.id === 'about') {
                            onNavigate('about');
                        }
                    }}
                    className={`relative px-3 py-2 rounded-lg hover:text-white transition-colors duration-300 group ${currentView === item.id ? 'text-white' : ''}`}
                >
                    {item.label}
                    <span className={`absolute bottom-1 left-3 right-3 h-[2px] bg-gradient-to-r from-pink-500 to-purple-500 transition-transform duration-300 origin-center opacity-70 ${currentView === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </button>
            ))}
        </div>
        
        {user ? (
            <div className="relative" ref={profileRef}>
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/5 transition-all border border-[#444746] bg-[#1e1f20]"
                >
                     <span className="hidden sm:block text-sm text-gray-200 font-medium">{user.name}</span>
                     {user.avatar ? (
                         <img src={user.avatar} alt="Profile" className="w-7 h-7 rounded-full border border-gray-600 shadow-sm" />
                     ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-[10px]">
                            {user.name.charAt(0)}
                        </div>
                     )}
                     <DropdownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#1e1f20] border border-[#444746] rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-fade-in-up">
                        <div className="px-4 py-4 border-b border-[#333] bg-[#2d2e2f]/30">
                            <p className="text-sm text-white font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="py-1">
                            <button 
                                onClick={() => {
                                    setIsProfileOpen(false);
                                    onSignOut?.();
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                            >
                                <LogoutIcon className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <button 
                onClick={onSignIn}
                className="bg-[#1a73e8] hover:bg-[#1b66c9] text-white px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
            >
                Sign in
            </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
