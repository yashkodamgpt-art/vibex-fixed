import React from 'react';

interface MyLocationButtonProps {
    onClick: () => void;
    disabled: boolean;
}

const MyLocationButton: React.FC<MyLocationButtonProps> = ({ onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Center map on my location"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-2.25m0-13.5V3M21 12h-2.25m-13.5 0H3" />
            </svg>
        </button>
    );
};

export default MyLocationButton;
