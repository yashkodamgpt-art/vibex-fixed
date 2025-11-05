
import React, { useState } from 'react';
import type { Event, Topic } from '../../types';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (eventData: Omit<Event, 'id' | 'creator' | 'creator_id' | 'lat' | 'lng' | 'participants'>) => void;
}

const ALL_TOPICS: Topic[] = ['Food', 'Movies', 'Arts', 'Music', 'Sports', 'Tech', 'Social'];

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
    const [isPublic, setIsPublic] = useState(true);
    const [eventTimeOffset, setEventTimeOffset] = useState(5); // in minutes
    const [duration, setDuration] = useState(60); // in minutes
    const [error, setError] = useState('');

    const handleTopicClick = (topic: Topic) => {
        setSelectedTopics(prev => 
            prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || selectedTopics.length === 0) {
            setError('Please provide a title and select at least one topic.');
            return;
        }

        const eventTime = new Date(Date.now() + eventTimeOffset * 60 * 1000).toISOString();

        onSubmit({
            title,
            description,
            topics: selectedTopics,
            is_public: isPublic,
            event_time: eventTime,
            duration,
            status: 'active',
        });
        // Reset form for next time
        setTitle('');
        setDescription('');
        setSelectedTopics([]);
        setIsPublic(true);
        setEventTimeOffset(5);
        setDuration(60);
    };

    if (!isOpen) return null;

    return (
        <>
            <div 
                onClick={onClose}
                className="fixed inset-0 bg-black/50 z-[2000] transition-opacity duration-300 opacity-100" 
                aria-hidden="true"
            />
            <div 
                className="fixed inset-0 z-[2010] flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-event-title"
            >
                <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 transform transition-all duration-300 scale-100">
                    <h2 id="create-event-title" className="text-2xl font-bold text-gray-800">Create a New Vibe</h2>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <div>
                        <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g., Sunset Movie Night" />
                    </div>

                    <div>
                        <label htmlFor="description" className="text-sm font-medium text-gray-700">Description (Optional)</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} placeholder="Add a few details..."></textarea>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-700">Topics</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {ALL_TOPICS.map(topic => (
                                <button type="button" key={topic} onClick={() => handleTopicClick(topic)} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${selectedTopics.includes(topic) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                         <div>
                            <span className="text-sm font-medium text-gray-700">When?</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {[5, 10, 15, 20, 25, 30].map(min => (
                                    <button type="button" key={min} onClick={() => setEventTimeOffset(min)} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${eventTimeOffset === min ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                        In {min} min
                                    </button>
                                ))}
                            </div>
                         </div>
                         <div>
                            <span className="text-sm font-medium text-gray-700">For how long?</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {[30, 60, 90, 120].map(d => (
                                    <button type="button" key={d} onClick={() => setDuration(d)} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${duration === d ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                        {d < 60 ? `${d}m` : `${d / 60}h`}
                                    </button>
                                ))}
                            </div>
                         </div>
                    </div>


                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Visibility</span>
                        <button type="button" onClick={() => setIsPublic(!isPublic)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isPublic ? 'bg-purple-600' : 'bg-gray-300'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">Create Vibe</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateEventModal;
