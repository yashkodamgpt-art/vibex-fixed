
import React from 'react';
import type { Note } from '../../types';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  // FIX: Changed note.createdAt to note.created_at to match the Note type definition.
  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
      <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
      <p className="text-right text-xs text-gray-400 mt-4">{formattedDate}</p>
    </div>
  );
};

export default NoteCard;
