
import React from 'react';
import { LogoHeart, ChatBubbleIcon, ChartIcon, MapPinIcon, SparkleIcon } from './Icons';

interface HeroProps {
  isVisible: boolean;
  onSuggestionClick: (text: string) => void;
  userName?: string;
}

const Hero: React.FC<HeroProps> = ({ isVisible, onSuggestionClick, userName }) => {
  if (!isVisible) return null;

  const suggestions = [
    {
      text: "How can I manage stress at work?",
      icon: <SparkleIcon className="w-5 h-5 text-pink-400" />,
      label: "Stress Help"
    },
    {
      text: "Guide me through a quick breathing exercise",
      icon: <ChatBubbleIcon className="w-5 h-5 text-purple-400" />,
      label: "Relaxation"
    },
    {
      text: "What are some signs of burnout?",
      icon: <ChartIcon className="w-5 h-5 text-coral-400" />,
      label: "Wellness Check"
    },
    {
      text: "Help me find a nearby therapist",
      icon: <MapPinIcon className="w-5 h-5 text-blue-400" />,
      label: "Support"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] animate-fade-in p-4 text-center max-w-6xl mx-auto">
      {/* 3D Animated Heart Container - Scaled down slightly to match Gemini layout */}
      <div className="mb-8 relative w-24 h-24 animate-float-3d" style={{ perspective: '500px' }}>
        <div className="absolute inset-0 opacity-40 blur-lg scale-110">
             <LogoHeart className="w-full h-full text-pink-700" idSuffix="-back" />
        </div>
        <div className="absolute inset-0 z-10 animate-pulse-inner">
             <LogoHeart className="w-full h-full drop-shadow-2xl" idSuffix="-main" />
        </div>
      </div>

      <div className="space-y-1 mb-12">
        <h1 className="text-4xl md:text-[56px] leading-[1.2] tracking-tight font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 bg-clip-text text-transparent">
            Hello,
          </span>
        </h1>
        <h2 className="text-3xl md:text-[48px] leading-[1.2] tracking-tight font-medium text-[#7E8085] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          How can I help you bloom today?
        </h2>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl px-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group flex flex-col items-start text-left p-5 bg-[#1e1f20] hover:bg-[#28292c] border border-[#444746] rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-1"
          >
            <div className="mb-auto pb-4 text-[#E3E3E3] text-[15px] leading-relaxed font-medium">
              {suggestion.text}
            </div>
            <div className="w-10 h-10 rounded-full bg-[#131314] flex items-center justify-center group-hover:bg-[#1e1f20] transition-colors">
              {suggestion.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Hero;
