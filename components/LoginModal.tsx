
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { LogoHeart } from './Icons';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (credentialResponse: any) => void;
  clientId: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-[480px] bg-[#1e1f20] rounded-[40px] p-10 md:p-14 shadow-2xl relative border border-[#444746] flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8">
           <LogoHeart className="w-16 h-16" idSuffix="-modal" />
        </div>

        <h2 className="text-3xl font-medium text-white mb-3 tracking-tight">Welcome to MindBloom</h2>
        <p className="text-gray-400 text-base mb-12 leading-relaxed px-4">
            Sign in with your Google account to start your wellness journey.
        </p>

        <div className="w-full flex flex-col items-center justify-center min-h-[50px] mb-8">
            <GoogleLogin
                onSuccess={onSuccess}
                onError={() => console.error('Login Failed')}
                useOneTap
                theme="filled_blue"
                shape="pill"
                size="large"
                width="320px"
            />
        </div>

        <p className="text-[11px] text-gray-500 max-w-[320px] leading-relaxed">
            By continuing, you agree to MindBloom's <span className="underline hover:text-gray-400 cursor-pointer">Terms</span> and <span className="underline hover:text-gray-400 cursor-pointer">Privacy Policy</span>.
        </p>
        
        <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
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