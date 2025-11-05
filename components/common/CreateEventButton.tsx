import React from 'react';

interface CreateEventButtonProps {
    onClick: () => void;
    isActive: boolean;
}

const CreateEventButton: React.FC<CreateEventButtonProps> = ({ onClick, isActive }) => {
    return (
        <button
            onClick={onClick}
            className={`text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out hover:scale-110 ${isActive ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 rotate-45' : 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-400'}`}
            aria-label={isActive ? "Cancel event creation" : "Create new event"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    );
};

export default CreateEventButton;
