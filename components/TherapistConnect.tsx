
import React, { useState } from 'react';
import { VideoCameraIcon, CheckBadgeIcon, StarIcon, MapPinIcon } from './Icons';
import { searchNearbyTherapists } from '../services/geminiService';

interface Therapist {
  id?: number;
  name: string;
  specialty?: string;
  specialization?: string; // API field
  rating: number | string;
  status: string; // online/busy/offline OR "Open now"/"Closed"
  experience?: string;
  nextAvailable?: string;
  avatarColor?: string;
  address?: string;
  distance_km?: string;
  closing_time?: string;
  contact?: string;
  maps_link?: string;
}

const TherapistConnect: React.FC = () => {
  const [connectingId, setConnectingId] = useState<number | string | null>(null);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingLocation, setIsUsingLocation] = useState(false);

  const handleConnect = (id: number | string) => {
    setConnectingId(id);
    // Simulate connection delay
    setTimeout(() => {
        setConnectingId(null);
        alert("Connecting you to the secure session...");
    }, 2000);
  };

  const handleFindNearby = () => {
      if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser.");
          return;
      }

      setIsLoading(true);
      setIsUsingLocation(true);

      navigator.geolocation.getCurrentPosition(
          async (position) => {
              const { latitude, longitude } = position.coords;
              const results = await searchNearbyTherapists(latitude, longitude);
              
              if (results && results.length > 0) {
                  setTherapists(results);
              } else {
                  alert("No therapists found nearby. Please try again or check your permission settings.");
                  setTherapists([]); 
                  setIsUsingLocation(false);
              }
              setIsLoading(false);
          },
          (error) => {
              console.error("Geolocation Error:", error);
              alert("Unable to retrieve your location. Please allow location access to find nearby therapists.");
              setIsLoading(false);
              setIsUsingLocation(false);
          }
      );
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 mt-16 pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-block py-1 px-3 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold tracking-wide uppercase mb-3">
            Real-Time Support
        </span>
        <h2 className="text-3xl md:text-4xl font-medium text-[#E3E3E3] mb-4">
          Connect with a Professional
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6">
          Find licensed therapists near you.
        </p>
        
        <button 
            onClick={handleFindNearby}
            disabled={isLoading}
            className="flex items-center gap-2 mx-auto bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>Searching Nearby...</span>
                </>
            ) : (
                <>
                   <MapPinIcon className="w-5 h-5" />
                   <span>Find Nearby Therapists</span>
                </>
            )}
        </button>
      </div>

      {/* Empty State */}
      {therapists.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-12">
              <div className="inline-block p-4 rounded-full bg-[#1e1f20] mb-4">
                  <MapPinIcon className="w-8 h-8 opacity-50" />
              </div>
              <p>Press the button above to locate specialists in your area.</p>
          </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map((therapist, index) => {
           // Helper to determine status color
           const isOnline = therapist.status?.toLowerCase().includes('online') || therapist.status?.toLowerCase().includes('open now');
           const isBusy = therapist.status?.toLowerCase().includes('busy') || therapist.status?.toLowerCase().includes('closes');
           
           return (
            <div 
                key={therapist.id || index} 
                className="group bg-[#1e1f20] border border-[#444746] hover:border-pink-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-1"
            >
                {/* Card Header: Avatar, Name, Status */}
                <div className="flex justify-between items-start gap-3 mb-4">
                    
                    {/* Left: Avatar & Details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-14 h-14 rounded-full ${therapist.avatarColor || 'bg-gray-700'} flex items-center justify-center text-xl text-white font-medium shadow-lg shrink-0`}>
                            {therapist.name ? therapist.name.charAt(0) : '?'}
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-lg font-medium text-gray-200 flex items-center gap-1 truncate pr-1">
                                {therapist.name}
                                {isUsingLocation && <CheckBadgeIcon className="w-4 h-4 text-blue-400 shrink-0" />}
                            </h3>
                            <p className="text-sm text-gray-400 truncate">{therapist.specialty || therapist.specialization || "Mental Health Specialist"}</p>
                            
                            {/* Rating Row */}
                            <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                                <StarIcon className="w-3 h-3 fill-current" />
                                <span>{therapist.rating || "N/A"}</span>
                                {therapist.distance_km && (
                                    <>
                                        <span className="text-gray-600">•</span>
                                        <span className="text-gray-400">{therapist.distance_km}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Status Badge (Flexible) */}
                    <div className={`shrink-0 flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${
                        isOnline ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        isBusy ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-green-500 animate-pulse' : 
                            isBusy ? 'bg-yellow-500' : 
                            'bg-gray-500'
                        }`}></span>
                        <span className="capitalize hidden sm:inline">{therapist.status || "Unknown"}</span>
                        <span className="capitalize sm:hidden">{isOnline ? 'Open' : 'Closed'}</span>
                    </div>
                </div>

                {/* Address / Next Available */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-6 bg-[#131314] rounded-lg p-3">
                {therapist.address ? (
                    <div className="truncate w-full" title={therapist.address}>
                        <MapPinIcon className="w-3 h-3 inline mr-1" />
                        {therapist.address}
                    </div>
                ) : (
                    <>
                        <span>Next available:</span>
                        <span className="text-gray-300 font-medium">{therapist.nextAvailable || "Inquire"}</span>
                    </>
                )}
                </div>

                {/* Action */}
                <div className="flex gap-2">
                    {therapist.maps_link ? (
                        <a 
                            href={therapist.maps_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-[#28292c] text-white border border-[#444746] hover:bg-[#333] transition-colors"
                        >
                            <MapPinIcon className="w-4 h-4" />
                            Directions
                        </a>
                    ) : (
                        <button
                            onClick={() => handleConnect(therapist.id || index)}
                            disabled={!isOnline}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
                                isOnline 
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40'
                                : 'bg-[#28292c] text-gray-500 opacity-50 cursor-not-allowed border border-transparent'
                            }`}
                        >
                            {connectingId === (therapist.id || index) ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <VideoCameraIcon className="w-5 h-5" />
                                    {isOnline ? 'Connect' : 'Closed'}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default TherapistConnect;
