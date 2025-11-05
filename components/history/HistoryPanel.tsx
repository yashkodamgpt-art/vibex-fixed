import React from 'react';
import type { User } from '../../types';
import NotesDashboard from '../notes/NotesDashboard';

interface HistoryPanelProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ user, isOpen, onClose }) => {
    return (
        <>
            {/* Backdrop */}
            <div 
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-[2000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                aria-hidden="true"
            />
            
            {/* Panel */}
            <div className={`fixed bottom-0 left-0 right-0 z-[2010] bg-green-50 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                 style={{ maxHeight: '90vh' }}
                 role="dialog"
                 aria-modal="true"
                 aria-labelledby="history-panel-title"
            >
                <div className="p-4 flex flex-col h-full" style={{ maxHeight: '90vh' }}>
                    {/* Header */}
                    <div className="flex-shrink-0 text-center mb-2 relative">
                        <div className="mx-auto w-12 h-1.5 bg-gray-300 rounded-full" />
                        <h2 id="history-panel-title" className="text-xl font-bold text-gray-800 sr-only">
                            History
                        </h2>
                         <button onClick={onClose} className="absolute -top-1 right-2 p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100" aria-label="Close history">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto px-4 pb-4">
                        <NotesDashboard user={user} />
                    </div>
                </div>
            </div>
        </>
    );
};
export default HistoryPanel;