import React from 'react';

interface FabProps {
    onClick: () => void;
}

const FloatingActionButton: React.FC<FabProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-transform duration-200 ease-in-out hover:scale-110"
            aria-label="Show History"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
    );
};

export default FloatingActionButton;