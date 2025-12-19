
import React from 'react';
import { LogoHeart, SparkleIcon, CheckBadgeIcon, UserIcon } from './Icons';

const creators = [
  {
    name: "Alex Rivers",
    role: "Founder & Lead Visionary",
    contribution: "A mental health advocate passionate about bridging the gap between technology and human empathy. Alex designed the core philosophy and mission of MindBloom.",
    avatarColor: "bg-pink-500/20 text-pink-400"
  },
  {
    name: "Sarah Chen",
    role: "Head of AI Wellness",
    contribution: "A machine learning engineer specializing in empathetic response systems. Sarah ensures that every conversation with Bloom feels supportive, safe, and human.",
    avatarColor: "bg-purple-500/20 text-purple-400"
  },
  {
    name: "Jordan Lee",
    role: "Lead Product Designer",
    contribution: "With a focus on calming aesthetics, Jordan crafted the dark-themed interface to minimize sensory overload and create a space of total tranquility.",
    avatarColor: "bg-orange-500/20 text-orange-400"
  },
  {
    name: "Dr. Elena Rodriguez",
    role: "Clinical Advisor",
    contribution: "A licensed psychologist who oversees the therapeutic frameworks within MindBloom to ensure our AI follows professional wellness standards.",
    avatarColor: "bg-blue-500/20 text-blue-400"
  }
];

const AboutMindBloom: React.FC = () => {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 mt-16 pb-24 animate-fade-in-up">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <div className="inline-block p-4 rounded-full bg-pink-500/5 mb-6 border border-pink-500/10 shadow-[0_0_20px_rgba(255,20,147,0.1)]">
          <LogoHeart className="w-16 h-16" />
        </div>
        <h1 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
          Nurturing your digital <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-semibold">well-being.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          MindBloom is more than just an app; it's a dedicated companion for your mental wellness journey, 
          designed to bring clarity, calm, and connection to your daily life.
        </p>
      </section>

      {/* What is MindBloom? */}
      <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <SparkleIcon className="w-6 h-6 text-pink-400" />
            What is MindBloom?
          </h2>
          <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
            <p>
              In a world that never stops, MindBloom provides a safe, judgment-free sanctuary where you can 
              unplug and check in with yourself. We combine the power of empathetic AI with proven 
              wellness tracking to help you navigate the complexities of modern mental health.
            </p>
            <p>
              Our platform bridges the gap between digital mindfulness and professional care, offering a 
              holistic ecosystem that supports your growth—from daily mood logs to discovering 
              licensed therapists in your local community.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1e1f20] p-6 rounded-3xl border border-[#444746] shadow-xl">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center mb-4">
              <LogoHeart className="w-5 h-5 text-pink-500" />
            </div>
            <h3 className="text-white font-medium mb-2">Empathetic AI</h3>
            <p className="text-xs text-gray-500">Conversations designed to soothe, support, and uplift.</p>
          </div>
          <div className="bg-[#1e1f20] p-6 rounded-3xl border border-[#444746] shadow-xl mt-8">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
              <CheckBadgeIcon className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-white font-medium mb-2">Track Growth</h3>
            <p className="text-xs text-gray-500">Visualize your mood trends and emotional evolution.</p>
          </div>
        </div>
      </section>

      {/* Meet the Creators */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medium text-white mb-4">Meet the Creators</h2>
          <p className="text-gray-500">The team behind your wellness companion.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {creators.map((creator, idx) => (
            <div key={idx} className="bg-[#1e1f20] rounded-3xl border border-[#444746] p-8 transition-all duration-300 hover:border-pink-500/20 hover:shadow-2xl hover:shadow-pink-500/5">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner ${creator.avatarColor}`}>
                  {creator.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">{creator.name}</h3>
                  <p className="text-pink-500 text-sm font-medium">{creator.role}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed italic">
                "{creator.contribution}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Footer */}
      <section className="mt-24 text-center p-12 bg-gradient-to-tr from-pink-500/5 to-purple-500/5 rounded-[40px] border border-[#444746]">
        <h3 className="text-2xl font-medium text-white mb-4">Our Commitment</h3>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
          At MindBloom, your privacy and well-being are our only priorities. We are committed to 
          creating technology that serves humanity, fostering a world where mental support is 
          accessible, empathetic, and always within reach.
        </p>
      </section>
    </div>
  );
};

export default AboutMindBloom;
