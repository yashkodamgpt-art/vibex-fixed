
import React from 'react';
import type { User } from '../../types';
import Logo from '../common/Logo';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    onOpenSettings: () => void;
    onOpenProfileQuickView: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenSettings, onOpenProfileQuickView }) => {
    return (
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center relative">
                <div className="flex items-center space-x-2">
                    {/* Profile Icon */}
                    <div className="relative">
                        <button onClick={onOpenProfileQuickView} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" aria-label="User Profile">
                            <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <span className="absolute bottom-1 right-1 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" aria-label="Online status"></span>
                    </div>
                    {/* Settings Icon */}
                    <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" aria-label="Settings">
                         <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                
                <div className="absolute left-1/2 -translate-x-1/2">
                  <Logo />
                </div>
                
                <div className="flex items-center space-x-4">
                     <span className="text-gray-600 hidden sm:block">Welcome, {user.profile.username}</span>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
