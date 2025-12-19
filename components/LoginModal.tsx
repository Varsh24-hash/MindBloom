
import React, { useEffect, useState } from 'react';
import { GoogleIcon, LogoHeart } from './Icons';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (credentialResponse: any) => void;
  clientId: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess, clientId }) => {
  const [isError, setIsError] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Determine if we are in development mode to show console instructions
    const isDev = typeof window !== 'undefined' && 
                 (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // 1. Validate Client ID
    if (!clientId || clientId.trim() === "") {
      if (isDev) {
        console.error(
          "MindBloom Developer Notice:\n" +
          "Google Authentication is currently disabled because NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing.\n" +
          "To enable it, add the following to your .env.local file:\n" +
          "NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here\n" +
          "Then restart your development server."
        );
      }
      return;
    }

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: onSuccess,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          
          const buttonElement = document.getElementById("google-signin-button");
          if (buttonElement) {
            window.google.accounts.id.renderButton(
              buttonElement,
              { 
                theme: "filled_blue", 
                size: "large", 
                shape: "pill", 
                width: 280,
                text: "continue_with"
              }
            );
            setIsScriptLoaded(true);
          }
        } catch (err) {
          console.error("Google Identity Services Initialization Error:", err);
          setIsError(true);
        }
      }
    };

    // Retry mechanism to wait for the Google GSI script to load from index.html
    let retryCount = 0;
    const checkGoogleLoaded = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleLoaded);
        initializeGoogle();
      } else if (retryCount > 15) {
        clearInterval(checkGoogleLoaded);
        setIsError(true);
        if (isDev) {
          console.error("Google Identity Services script failed to initialize. Check your internet connection or script source in index.html.");
        }
      }
      retryCount++;
    }, 500);

    return () => clearInterval(checkGoogleLoaded);
  }, [clientId, onSuccess]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-[450px] bg-[#1e1f20] rounded-[28px] p-10 md:p-12 shadow-2xl relative border border-[#444746] flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
           <LogoHeart className="w-12 h-12" idSuffix="-modal" />
        </div>

        <h2 className="text-2xl md:text-3xl font-medium text-[#e3e3e3] mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-base mb-10">Continue your wellness journey with MindBloom.</p>

        <div className="mb-8 w-full flex flex-col items-center justify-center min-h-[50px]">
            {(!clientId || clientId.trim() === "") ? (
              <div className="p-4 bg-white/5 border border-[#444746]/50 rounded-2xl text-gray-400 text-sm">
                Sign in is currently unavailable.
                <p className="text-[10px] mt-1 opacity-50 uppercase tracking-tighter font-semibold">Please try again later</p>
              </div>
            ) : isError ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                Something went wrong connecting to Google.
              </div>
            ) : (
              <div className="relative min-h-[44px] flex items-center justify-center">
                {!isScriptLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1e1f20] z-10">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                <div id="google-signin-button" className="animate-fade-in-up"></div>
              </div>
            )}
        </div>

        <p className="text-xs text-gray-500 max-w-[280px] leading-relaxed">
            By continuing, you agree to MindBloom's Terms of Service and Privacy Policy.
        </p>
        
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Close modal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
