
import React from 'react';
import type { User } from '../../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToView: User;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userToView }) => {
    if (!isOpen) return null;

    const canViewProfile = userToView.profile.privacy === 'public' || userToView.profile.privacy === 'community';

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
                aria-labelledby="profile-title"
            >
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-4 transform transition-all duration-300 scale-100 text-center">
                    <div className="flex justify-center">
                         <div className="h-20 w-20 bg-green-200 rounded-full flex items-center justify-center">
                             <span className="text-3xl font-bold text-green-700">{userToView.profile.username.charAt(0).toUpperCase()}</span>
                         </div>
                    </div>

                    <h2 id="profile-title" className="text-2xl font-bold text-gray-800">{userToView.profile.username}</h2>
                    
                    <div className="py-4 border-t border-b border-gray-200">
                        {canViewProfile ? (
                            <p className="text-gray-600 italic">
                                {userToView.profile.bio || 'This user hasn\'t set a bio yet.'}
                            </p>
                        ) : (
                            <p className="text-gray-500 bg-gray-100 p-3 rounded-lg">
                                This user's profile is private.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <button type="button" onClick={onClose} className="px-8 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">Close</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileModal;
