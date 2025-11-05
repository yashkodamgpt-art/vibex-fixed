import React, { useState } from 'react';

interface AddNoteFormProps {
  onAddNote: (content: string) => void;
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({ onAddNote }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAddNote(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add a new Vibe</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full h-32 p-4 bg-green-50 border border-green-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
        required
      />
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Save Note
        </button>
      </div>
    </form>
  );
};

export default AddNoteForm;