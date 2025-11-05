
import React, { useState, useEffect, useCallback } from 'react';
import type { User, Note } from '../../types';
import NoteCard from './NoteCard';
import AddNoteForm from './AddNoteForm';
import { supabase } from '../../lib/supabaseClient';

interface NotesDashboardProps {
  user: User;
}

const NotesDashboard: React.FC<NotesDashboardProps> = ({ user }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      setNotes(data as Note[]);
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async (content: string) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ content, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error("Error adding note:", error);
    } else if (data) {
      setNotes(prevNotes => [data as Note, ...prevNotes]);
    }
  };

  return (
    <div className="space-y-8">
      <AddNoteForm onAddNote={handleAddNote} />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Vibes History</h2>
        {loading ? (
            <div className="text-center py-16"><p>Loading your vibes...</p></div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              // FIX: The 'note' object is passed directly. The property 'createdAt' does not exist on the Note type.
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">No vibes yet!</h3>
            <p className="text-gray-500 mt-2">Use the form above to add your first note.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesDashboard;
