
import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, SendIcon, PlusCircleIcon, CameraIcon } from './Icons';
import { Attachment } from '../types';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { analyzeVoiceToneAndIntent, wrapVoicePrompt } from '../services/voiceService';

interface InputAreaProps {
  onSend: (message: string, attachment?: Attachment) => void;
  isLoading: boolean;
  hasStarted: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  isLoading, 
  hasStarted, 
}) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Voice Hook
  const { isListening, transcript, error, startListening, stopListening, resetTranscript } = useSpeechToText();

  // Sync transcript to text area
  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  const handleSendClick = () => {
    if ((!text.trim() && !attachment) || isLoading) return;
    
    let finalMessage = text;
    
    // If we just finished a voice recording, wrap it with context
    if (transcript && text === transcript) {
      const context = analyzeVoiceToneAndIntent(text);
      finalMessage = wrapVoicePrompt(text, context);
      resetTranscript();
    }

    onSend(finalMessage, attachment || undefined);
    setText('');
    setAttachment(null);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please choose a file smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      const isImage = file.type.startsWith('image/');
      
      setAttachment({
        name: file.name || (isImage ? 'pasted-image.png' : 'pasted-file'),
        mimeType: file.type,
        data: base64Data,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          break;
        }
      }
    }
  };

  const removeAttachment = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachment(null);
  };

  // --- Camera Logic ---
  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Could not access camera. Please check permissions.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        
        setAttachment({
          name: `camera-capture-${Date.now()}.png`,
          mimeType: 'image/png',
          data: base64Data,
          previewUrl: dataUrl
        });
        closeCamera();
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  return (
    <div className={`w-full max-w-3xl px-4 flex flex-col items-center transition-all duration-500 ${hasStarted ? 'pb-2' : 'pb-6'}`}>
      
      {/* Recording / Camera State Overlay / Error */}
      {(error || cameraError) && (
        <div className="mb-2 text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full animate-fade-in-up">
          {error || cameraError}
        </div>
      )}

      {/* Camera Preview Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#1e1f20] rounded-[32px] overflow-hidden border border-[#444746] shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full aspect-video object-cover bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="p-6 flex items-center justify-center gap-6">
              <button 
                onClick={closeCamera}
                className="px-6 py-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95 group"
              >
                <div className="w-12 h-12 rounded-full border-2 border-black/10 group-active:border-black/30"></div>
              </button>
              <div className="w-[72px]"></div> {/* Spacer for alignment */}
            </div>
          </div>
        </div>
      )}

      {/* File Preview */}
      {attachment && (
        <div className="w-full flex justify-start mb-3 animate-fade-in-up">
           <div className="relative group p-2 bg-[#28292c] rounded-2xl border border-[#444746] flex items-center gap-3 pr-8">
              {attachment.previewUrl ? (
                <img src={attachment.previewUrl} alt="Upload preview" className="w-12 h-12 object-cover rounded-lg" />
              ) : (
                <div className="w-12 h-12 bg-[#131314] rounded-lg flex items-center justify-center text-[10px] text-gray-500 text-center p-1 leading-tight overflow-hidden">
                  {attachment.mimeType.split('/')[1].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs text-white font-medium truncate max-w-[150px]">{attachment.name}</span>
                <span className="text-[10px] text-gray-500 uppercase">Ready to analyze</span>
              </div>
              <button 
                onClick={removeAttachment}
                className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full p-1 shadow-lg hover:bg-pink-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
           </div>
        </div>
      )}

      {/* Input Container */}
      <div className={`
        relative w-full bg-[#1e1f20] 
        rounded-[32px] 
        border border-transparent
        hover:bg-[#28292c]
        focus-within:bg-[#28292c] 
        focus-within:border-[#444746]/50
        shadow-lg
        transition-all duration-200
        flex flex-col
        ${isListening ? 'border-pink-500/30 bg-[#28292c]' : ''}
      `}>
        
        <div className="flex items-end px-3 py-3 min-h-[64px]">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,.pdf,.txt,.docx"
          />
          
          <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 mr-2 text-gray-400 hover:text-pink-400 hover:bg-white/10 rounded-full transition-colors self-end mb-1"
              title="Add context (Images, PDF, TXT)"
          >
              <PlusCircleIcon className="w-6 h-6" />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={isListening ? "Listening..." : (attachment ? "What should I analyze in this file?" : "Talk to MindBloom...")}
            rows={1}
            className="w-full bg-transparent text-[#E3E3E3] placeholder-gray-400 focus:outline-none resize-none overflow-hidden leading-6 py-2 max-h-[200px] mb-1 text-[16px]"
          />

          <div className="flex items-center gap-1 mb-1 ml-2 self-end">
            <button 
              onClick={openCamera}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
              title="Take a photo"
            >
              <CameraIcon className="w-6 h-6" />
            </button>

            <button 
              onClick={handleMicToggle}
              className={`p-2 rounded-full transition-all duration-300 relative ${isListening ? 'text-pink-500 bg-pink-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              title={isListening ? "Stop recording" : "Voice input"}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-full bg-pink-500/20 animate-ping"></span>
              )}
              <MicIcon className="w-6 h-6" />
            </button>
            
            {(text.trim() || attachment) ? (
               <button 
                 onClick={handleSendClick}
                 disabled={isLoading}
                 className={`p-2.5 rounded-full transition-all duration-200 ${
                   isLoading 
                     ? 'bg-gray-700 text-gray-500' 
                     : 'bg-white text-black hover:bg-gray-200 shadow-lg'
                 }`}
               >
                 <SendIcon className="w-5 h-5" />
               </button>
            ) : null}
          </div>
        </div>
      </div>
      
      {!hasStarted && (
        <p className="mt-4 text-[11px] text-gray-500 font-medium">
          MindBloom may display inaccurate info, so double-check its responses.
        </p>
      )}
    </div>
  );
};

export default InputArea;
