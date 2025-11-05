
import React, { useEffect, useRef, useState } from 'react';
import type { User, Event, VibeMessage } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface VibeChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    vibe: Event;
    messages: VibeMessage[];
    user: User;
    onSendMessage: (text: string) => void;
    onLeaveVibe: (eventId: number) => void;
    onViewProfile: (username: string) => void;
}

const QUICK_REPLIES = ["On my way!", "Here!", "Running late", "Where are you?", "Let's go!"];

const VibeChatPanel: React.FC<VibeChatPanelProps> = ({ isOpen, onClose, vibe, messages, user, onSendMessage, onLeaveVibe, onViewProfile }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messageText, setMessageText] = useState('');
    const [participants, setParticipants] = useState<{id: string; username: string}[]>([]);
    const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
    const isCreator = user.id === vibe.creator_id;

    useEffect(() => {
        if (vibe?.participants.length > 0) {
            const fetchParticipants = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, username')
                    .in('id', vibe.participants);
                if (error) console.error("Error fetching participants:", error);
                else setParticipants(data);
            };
            fetchParticipants();
        }
    }, [vibe]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageText.trim()) {
            onSendMessage(messageText);
            setMessageText('');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if(isOpen) {
            setActiveTab('chat');
        }
    }, [isOpen]);

    useEffect(() => {
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, activeTab]);

    const renderChat = () => (
        <>
            <div className="flex-grow overflow-y-auto py-4 px-2 space-y-4">
                {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender_id === user.id ? 'bg-purple-600 text-white rounded-br-lg' : 'bg-white text-gray-800 rounded-bl-lg shadow-sm'}`}>
                            <p className="font-bold text-sm">{msg.sender_id === user.id ? 'You' : (msg.sender?.username || 'Unknown')}</p>
                            <p className="text-md">{msg.text}</p>
                            <p className="text-xs opacity-70 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-500 pt-16">No messages yet. Say hi!</div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                    {QUICK_REPLIES.map(reply => (
                        <button key={reply} onClick={() => onSendMessage(reply)} className="px-4 py-2 text-sm font-medium rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors">
                            {reply}
                        </button>
                    ))}
                </div>
                 <form onSubmit={handleFormSubmit} className="flex items-center gap-2 p-2">
                    <input 
                        type="text" 
                        value={messageText} 
                        onChange={e => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button type="submit" className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );

    const renderParticipants = () => (
        <div className="flex-grow overflow-y-auto py-4 px-2">
            <ul className="space-y-2">
                {participants.map(participant => (
                    <li key={participant.id}>
                        <button onClick={() => onViewProfile(participant.username)} className="w-full text-left flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                            <span className="font-semibold text-gray-800">{participant.username} {participant.id === user.id && '(You)'} {participant.id === vibe.creator_id && '👑'}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <>
            <div 
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-[2000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                aria-hidden="true"
            />
            
            <div className={`fixed bottom-0 left-0 right-0 z-[2010] bg-gray-50 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                 style={{ height: '75vh' }}
                 role="dialog"
                 aria-modal="true"
                 aria-labelledby="vibe-chat-title"
            >
                <div className="p-4 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex-shrink-0 text-center pb-2 relative">
                        <div className="mx-auto w-12 h-1.5 bg-gray-300 rounded-full mb-2" />
                        <h2 id="vibe-chat-title" className="text-xl font-bold text-gray-800 truncate px-12">
                            {vibe.title}
                        </h2>
                        <button onClick={onClose} className="absolute top-1 right-2 p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100" aria-label="Close chat">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex-shrink-0 border-b border-gray-200">
                        <nav className="flex justify-around -mb-px">
                            <button onClick={() => setActiveTab('chat')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'chat' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Chat
                            </button>
                            <button onClick={() => setActiveTab('participants')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'participants' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Participants ({vibe.participants.length})
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-grow flex flex-col overflow-hidden">
                        {activeTab === 'participants' ? renderParticipants() : renderChat()}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex-shrink-0 pt-2 border-t border-gray-200">
                        {!isCreator && (
                             <button onClick={() => onLeaveVibe(vibe.id)} className="w-full mt-2 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">
                                Leave Vibe
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
export default VibeChatPanel;