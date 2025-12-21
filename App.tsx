
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InputArea from './components/InputArea';
import Footer from './components/Footer';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import MoodTracker from './components/MoodTracker';
import TherapistConnect from './components/TherapistConnect';
import AboutMindBloom from './components/AboutMindBloom';
import LoginModal from './components/LoginModal';
import { ChatSession, Message, Attachment } from './types';
import { sendMessageToGemini, generateChatTitle } from './services/geminiService';

export interface User {
    name: string;
    email: string;
    avatar?: string;
    googleId?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'mood-tracker' | 'therapists' | 'home' | 'about'>('home');

  const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || "844389175436-flr9gltj1fami94bccill1us3phdla3q.apps.googleusercontent.com";

  useEffect(() => {
    const storedUser = sessionStorage.getItem('mindbloom_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        sessionStorage.removeItem('mindbloom_user');
      }
    }
  }, []);

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT Decode Error:", e);
      return null;
    }
  };

  const handleLoginSuccess = (response: any) => {
    if (response.credential) {
      const payload = decodeJwt(response.credential);
      if (payload) {
        const newUser: User = {
          name: payload.name,
          email: payload.email,
          avatar: payload.picture,
          googleId: payload.sub
        };
        console.log("User Authenticated:", newUser);
        saveUser(newUser);
      }
    }
  };

  const saveUser = (userData: User) => {
    sessionStorage.setItem('mindbloom_user', JSON.stringify(userData));
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('mindbloom_user');
    setUser(null);
    setCurrentView('home');
    setCurrentSessionId(null);
  };

  const handleSend = async (text: string, attachment?: Attachment) => {
    if (!text.trim() && !attachment) return;
    setIsLoading(true);
    setCurrentView('chat');
    
    let sessionId = currentSessionId || Date.now().toString();
    const isNewSession = !currentSessionId;
    if (isNewSession) setCurrentSessionId(sessionId);
    
    const userMessage: Message = { role: 'user', text, attachment };
    
    setSessions(prev => {
      const existing = prev.find(s => s.id === sessionId);
      if (!existing) {
        return [...prev, { id: sessionId, title: text.slice(0, 30) || attachment?.name || "New Chat", messages: [userMessage], createdAt: Date.now() }];
      }
      return prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, userMessage] } : s);
    });

    try {
      const currentSession = sessions.find(s => s.id === sessionId);
      const history = currentSession?.messages || [];
      const responseText = await sendMessageToGemini(history, text, attachment);
      const modelMessage: Message = { role: 'model', text: responseText };
      
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, modelMessage] } : s));

      if (isNewSession && text.trim()) {
          const newTitle = await generateChatTitle(text);
          setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasStarted = currentSessionId !== null && (sessions.find(s => s.id === currentSessionId)?.messages.length || 0) > 0;

  return (
    <div className="min-h-screen bg-[#131314] flex flex-col font-sans overflow-hidden selection:bg-pink-500/30">
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSuccess={handleLoginSuccess}
          clientId={GOOGLE_CLIENT_ID}
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId || ''}
        onNewChat={() => { setCurrentSessionId(null); setCurrentView('home'); }}
        onSelectSession={(id) => { setCurrentSessionId(id); setCurrentView('chat'); }}
      />

      <div className={`flex-1 flex flex-col relative transition-all duration-500 ease-in-out ${isSidebarOpen ? 'md:pl-[280px]' : 'pl-0'}`}>
        <Navbar 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onNavigate={(v) => setCurrentView(v as any)}
            currentView={currentView}
            user={user}
            onSignIn={() => setShowLoginModal(true)}
            onSignOut={handleSignOut}
        />

        <main className="flex-1 flex flex-col relative w-full h-full pt-16">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {currentView === 'mood-tracker' && <MoodTracker />}
            {currentView === 'therapists' && <TherapistConnect />}
            {currentView === 'about' && <AboutMindBloom />}
            {currentView === 'home' && (
              <Hero 
                isVisible={true} 
                userName={user?.name.split(' ')[0]} 
                onSuggestionClick={(suggestion) => {
                  if (suggestion === "Help me find a nearby therapist") {
                    setCurrentView('therapists');
                  } else {
                    handleSend(suggestion);
                  }
                }}
              />
            )}
            {currentView === 'chat' && (
              <ChatInterface 
                messages={sessions.find(s => s.id === currentSessionId)?.messages || []} 
                isLoading={isLoading} 
              />
            )}
          </div>
          
          {(currentView === 'chat' || currentView === 'home') && (
            <div className="w-full flex flex-col items-center">
                <InputArea onSend={handleSend} isLoading={isLoading} hasStarted={hasStarted} />
                <div className="py-2 w-full">
                  <Footer />
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
