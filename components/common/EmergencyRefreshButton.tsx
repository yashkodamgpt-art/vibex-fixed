
import React from 'react';
import { supabase } from '../../lib/supabaseClient';

const EmergencyRefreshButton: React.FC = () => {
    const handleEmergencyRefresh = async () => {
        console.log('Emergency Refresh: Signing out and clearing all storage...');
        alert("Performing an emergency session reset. The app will reload.");
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Sign out failed, proceeding with storage clear.', e);
        }
        localStorage.clear();
        sessionStorage.clear();
        console.log('Storage cleared. Reloading window.');
        window.location.reload();
    };

    return (
        <button
            onClick={handleEmergencyRefresh}
            className="fixed bottom-6 left-6 z-[1000] bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-lg opacity-50 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 ease-in-out hover:scale-110"
            aria-label="Emergency Session Refresh"
            title="Emergency Session Refresh"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
        </button>
    );
};

export default EmergencyRefreshButton;
