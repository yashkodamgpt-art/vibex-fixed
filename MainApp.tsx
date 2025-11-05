
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User, Event, VibeMessage, Profile } from './types';
import Header from './components/layout/Header';
import MapView, { type MapViewRef } from './components/map/MapView';
import HistoryPanel from './components/history/HistoryPanel';
import FloatingActionButton from './components/common/FloatingActionButton';
import CreateEventButton from './components/common/CreateEventButton';
import CreateEventModal from './components/events/CreateEventModal';
import MyLocationButton from './components/common/MyLocationButton';
import VibeChatPanel from './components/vibes/VibeChatPanel';
import SettingsModal from './components/profile/SettingsModal';
import ProfileModal from './components/profile/ProfileModal';
import ProfileQuickView from './components/layout/ProfileQuickView';
import { supabase } from './lib/supabaseClient';

interface MainAppProps {
  user: User;
  onLogout: () => void;
  onProfileUpdate: (profile: User['profile']) => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, onProfileUpdate }) => {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEventCoords, setNewEventCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeVibe, setActiveVibe] = useState<Event | null>(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<VibeMessage[]>([]);
  const [activeVibeParticipants, setActiveVibeParticipants] = useState<Profile[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProfileQuickViewOpen, setIsProfileQuickViewOpen] = useState(false);
  const mapViewRef = useRef<MapViewRef>(null);
  const [sessionValid, setSessionValid] = useState(true);

  // REMOVED: Redundant session heartbeat - App.tsx already handles this
  // MainApp only renders when session is valid, so we start with sessionValid = true
  useEffect(() => {
    console.log('🎯 MainApp mounted for user:', user.profile.username);
    // No need to check session here - App.tsx already validated it
  }, [user]);

  // Fetch events with better error handling
  useEffect(() => {
    if (!sessionValid) return;
    
    const fetchEvents = async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('events')
                .select('*, creator:profiles(username)')
                .eq('status', 'active');
            
            if (fetchError) {
                console.error("Error fetching events", fetchError);
                
                // Check if it's an auth error
                if (fetchError.message.includes('JWT') || fetchError.message.includes('session')) {
                  setError("Session expired. Please log in again.");
                  setTimeout(() => onLogout(), 2000);
                } else {
                  setError("Failed to load events. Please refresh the page.");
                }
            } else {
                setEvents(data as Event[]);
                setError(null);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("An unexpected error occurred while loading events.");
        }
    };
    fetchEvents();

    const eventsSubscription = supabase.channel('public:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
        console.log('Change received!', payload)
        fetchEvents();
      })
      .subscribe();
      
    return () => {
        supabase.removeChannel(eventsSubscription);
    };
  }, [sessionValid, onLogout]);
  
  useEffect(() => {
    if (!sessionValid) return;
    
    let messagesSubscription: any = null;
    if (isChatVisible && activeVibe) {
        const fetchMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*, sender:profiles(username)')
                    .eq('event_id', activeVibe.id)
                    .order('created_at');
                    
                if (error) {
                    console.error("Error fetching messages", error);
                    if (error.message.includes('JWT') || error.message.includes('session')) {
                      setError("Session expired. Please log in again.");
                      setTimeout(() => onLogout(), 2000);
                    }
                } else {
                    setChatMessages(data as any[] as VibeMessage[]);
                }
            } catch (err) {
                console.error("Unexpected error fetching messages:", err);
            }
        };
        fetchMessages();

        messagesSubscription = supabase.channel(`public:messages:event_id=eq.${activeVibe.id}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages', 
                filter: `event_id=eq.${activeVibe.id}` 
            }, 
            async (payload) => {
                try {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('username')
                        .eq('id', payload.new.sender_id)
                        .single();
                        
                    if (error) {
                        console.error(error);
                        setChatMessages(msgs => [...msgs, { 
                            ...payload.new, 
                            sender: { username: 'Unknown' } 
                        } as VibeMessage]);
                    } else {
                        setChatMessages(msgs => [...msgs, { 
                            ...payload.new, 
                            sender: { username: profile.username } 
                        } as VibeMessage]);
                    }
                } catch (err) {
                    console.error('Error handling new message:', err);
                }
            })
            .subscribe();
    }
    return () => {
        if(messagesSubscription) {
            supabase.removeChannel(messagesSubscription);
        }
    };
  }, [isChatVisible, activeVibe, sessionValid, onLogout]);

  const handleMapClickInCreateMode = (coords: { lat: number; lng: number }) => {
    if (activeVibe) {
        alert("You are already in a Vibe. Leave or close your current Vibe to create a new one.");
        setIsCreateMode(false);
        return;
    }
    setNewEventCoords(coords);
    setIsCreateModalOpen(true);
  };

  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'creator' | 'creator_id' | 'lat' | 'lng' | 'participants'>) => {
    if (!newEventCoords || !sessionValid) return;

    try {
        const { data: newEvent, error } = await supabase
            .from('events')
            .insert({
                ...eventData,
                status: 'active',
                lat: newEventCoords.lat,
                lng: newEventCoords.lng,
                creator_id: user.id,
                participants: [user.id],
            })
            .select('*, creator:profiles(username)')
            .single();
        
        if (error) {
            console.error("Error creating event:", error);
            if (error.message.includes('JWT') || error.message.includes('session')) {
              setError("Session expired. Please log in again.");
              setTimeout(() => onLogout(), 2000);
            } else {
              setError("Failed to create event. Please try again.");
            }
        } else if (newEvent) {
            setActiveVibe(newEvent as Event);
            setIsCreateModalOpen(false);
            setNewEventCoords(null);
            setIsCreateMode(false);
            setError(null);
        }
    } catch (err) {
        console.error("Unexpected error creating event:", err);
        setError("Failed to create event. Please try again.");
    }
  };
  
  const handleRecenterMap = () => {
    mapViewRef.current?.recenter();
  };

  const handleCloseEvent = async (eventId: number) => {
    if (!sessionValid) return;
    
    try {
        const { error } = await supabase
            .from('events')
            .update({ status: 'closed' })
            .eq('id', eventId);
            
        if (error) {
            console.error("Error closing event:", error);
            if (error.message.includes('JWT') || error.message.includes('session')) {
              setError("Session expired. Please log in again.");
              setTimeout(() => onLogout(), 2000);
            }
        } else {
            if (activeVibe?.id === eventId) {
              setActiveVibe(null);
              setIsChatVisible(false);
            }
        }
    } catch (err) {
        console.error("Unexpected error closing event:", err);
    }
  };

  const handleExtendEvent = async (eventId: number) => {
      if (!sessionValid) return;
      
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      
      try {
          const { error } = await supabase
              .from('events')
              .update({ duration: event.duration + 15 })
              .eq('id', eventId);
              
          if (error) {
              console.error("Error extending event:", error);
              if (error.message.includes('JWT') || error.message.includes('session')) {
                setError("Session expired. Please log in again.");
                setTimeout(() => onLogout(), 2000);
              }
          }
      } catch (err) {
          console.error("Unexpected error extending event:", err);
      }
  };

  const handleJoinVibe = async (eventId: number) => {
    if (!sessionValid) return;
    
    if (activeVibe) {
        alert("You're already in a Vibe. Please leave it before joining another.");
        return;
    }
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
        const newParticipants = [...event.participants, user.id];
        const { data, error } = await supabase
            .from('events')
            .update({ participants: newParticipants })
            .eq('id', eventId)
            .select('*, creator:profiles(username)')
            .single();
            
        if (error) {
            console.error("Error joining vibe:", error);
            if (error.message.includes('JWT') || error.message.includes('session')) {
              setError("Session expired. Please log in again.");
              setTimeout(() => onLogout(), 2000);
            }
        } else {
            setActiveVibe(data as Event);
        }
    } catch (err) {
        console.error("Unexpected error joining vibe:", err);
    }
  };

  const handleLeaveVibe = async (eventId: number) => {
      if (!sessionValid) return;
      
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      try {
          const newParticipants = event.participants.filter(p => p !== user.id);
          const { error } = await supabase
              .from('events')
              .update({ participants: newParticipants })
              .eq('id', eventId);
              
          if (error) {
              console.error("Error leaving vibe:", error);
              if (error.message.includes('JWT') || error.message.includes('session')) {
                setError("Session expired. Please log in again.");
                setTimeout(() => onLogout(), 2000);
              }
          } else {
              setActiveVibe(null);
              setIsChatVisible(false);
          }
      } catch (err) {
          console.error("Unexpected error leaving vibe:", err);
      }
  };

  const handleSendMessage = async (text: string) => {
      if (!activeVibe || !sessionValid) return;

      try {
          const { error } = await supabase
              .from('messages')
              .insert({
                  text,
                  sender_id: user.id,
                  event_id: activeVibe.id,
              });
              
          if (error) {
              console.error("Error sending message:", error);
              if (error.message.includes('JWT') || error.message.includes('session')) {
                setError("Session expired. Please log in again.");
                setTimeout(() => onLogout(), 2000);
              }
          }
      } catch (err) {
          console.error("Unexpected error sending message:", err);
      }
  };

  const handleOpenProfile = async (username: string) => {
      if (!sessionValid) return;
      
      try {
          const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('username', username)
              .single();
              
          if(error) {
               console.error("Could not find user to view profile for:", username, error);
               if (error.message.includes('JWT') || error.message.includes('session')) {
                 setError("Session expired. Please log in again.");
                 setTimeout(() => onLogout(), 2000);
               }
               return;
          }
          if (profile) {
              const userToView: User = {
                  id: profile.id,
                  profile: {
                    username: profile.username,
                    bio: profile.bio,
                    privacy: profile.privacy,
                  }
              };
              setViewedUser(userToView);
              setIsProfileModalOpen(true);
          }
      } catch (err) {
          console.error("Unexpected error opening profile:", err);
      }
  };

  if (!sessionValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="text-center p-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 text-lg mb-4">Session validation failed...</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-green-50 flex flex-col">
      <Header 
        user={user} 
        onLogout={onLogout} 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenProfileQuickView={() => setIsProfileQuickViewOpen(true)}
      />
      <main className="flex-grow relative">
        {error && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[2000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-md w-11/12" role="alert">
                <div className="flex justify-between items-center">
                    <div className="flex-grow">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                    <button 
                        onClick={() => setError(null)} 
                        className="text-red-700 hover:text-red-900 ml-4 flex-shrink-0"
                        aria-label="Dismiss error"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        )}
        <MapView 
          ref={mapViewRef}
          isCreateMode={isCreateMode}
          userLocation={userLocation}
          onSetUserLocation={setUserLocation}
          onMapClick={handleMapClickInCreateMode}
          events={events}
          user={user}
          activeVibe={activeVibe}
          onCloseEvent={handleCloseEvent}
          onExtendEvent={handleExtendEvent}
          onJoinVibe={handleJoinVibe}
          onViewChat={() => setIsChatVisible(true)}
        />
        
        <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-center space-y-4">
          <MyLocationButton 
            onClick={handleRecenterMap} 
            disabled={!userLocation} 
          />
          <CreateEventButton 
            onClick={() => setIsCreateMode(!isCreateMode)} 
            isActive={isCreateMode} 
          />
           <FloatingActionButton onClick={() => setIsHistoryVisible(true)} />
        </div>

        <HistoryPanel 
            user={user} 
            isOpen={isHistoryVisible} 
            onClose={() => setIsHistoryVisible(false)} 
        />
        {newEventCoords && (
          <CreateEventModal 
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setNewEventCoords(null);
              setIsCreateMode(false);
            }}
            onSubmit={handleCreateEvent}
          />
        )}
        {activeVibe && (
            <VibeChatPanel
                isOpen={isChatVisible}
                onClose={() => setIsChatVisible(false)}
                vibe={activeVibe}
                messages={chatMessages}
                user={user}
                onSendMessage={handleSendMessage}
                onLeaveVibe={handleLeaveVibe}
                onViewProfile={handleOpenProfile}
            />
        )}
        <SettingsModal 
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            user={user}
            onSave={onProfileUpdate}
        />
        {viewedUser && (
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userToView={viewedUser}
            />
        )}
        <ProfileQuickView 
            isOpen={isProfileQuickViewOpen}
            onClose={() => setIsProfileQuickViewOpen(false)}
            user={user}
            onEditProfile={() => {
                setIsProfileQuickViewOpen(false);
                setIsSettingsModalOpen(true);
            }}
        />
      </main>
    </div>
  );
};

export default MainApp;
