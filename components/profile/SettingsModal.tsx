
import React, { useState, useEffect } from 'react';
import type { User } from '../../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedProfile: User['profile']) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [bio, setBio] = useState('');
    const [privacy, setPrivacy] = useState<User['profile']['privacy']>('public');

    useEffect(() => {
        if (user) {
            setBio(user.profile.bio);
            setPrivacy(user.profile.privacy);
        }
    }, [user, isOpen]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: The 'Profile' type requires a username. Since it is not editable here, we pass the existing username.
        onSave({ username: user.profile.username, bio, privacy });
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
                aria-labelledby="settings-title"
            >
                <form onSubmit={handleSave} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 transform transition-all duration-300 scale-100">
                    <h2 id="settings-title" className="text-2xl font-bold text-gray-800">Profile & Settings</h2>
                    
                    <div>
                        <label htmlFor="bio" className="text-sm font-medium text-gray-700">Your Bio</label>
                        <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} placeholder="Tell others a little about yourself..."></textarea>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-700">Profile Privacy</span>
                        <div className="mt-2 space-y-2">
                           { (['public', 'community', 'private'] as const).map(p => (
                             <label key={p} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                <input type="radio" name="privacy" value={p} checked={privacy === p} onChange={() => setPrivacy(p)} className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" />
                                <span className="ml-3 text-sm text-gray-800 capitalize">{p}</span>
                            </label>
                           ))}
                        </div>
                         <p className="mt-2 text-xs text-gray-500">
                            {privacy === 'public' && 'Anyone can view your profile.'}
                            {privacy === 'community' && 'Only other Vibex users can view your profile.'}
                            {privacy === 'private' && 'Only you can see your profile.'}
                        </p>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Save Changes</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default SettingsModal;
