
export interface Profile {
  username: string;
  bio: string;
  privacy: 'public' | 'community' | 'private';
}

// This is our app's user object, combining Supabase auth user and our public profile
export interface User {
  id: string; // from supabase.auth.user
  email?: string; // from supabase.auth.user
  profile: Profile;
}

export interface Note {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
}

export type Topic = 'Food' | 'Movies' | 'Arts' | 'Music' | 'Sports' | 'Tech' | 'Social';

export interface VibeMessage {
  id: number;
  sender_id: string;
  event_id: number;
  text: string;
  created_at: string;
  sender: { username: string }; // Joined from profiles table
}

export interface Event {
  id: number;
  title: string;
  description: string;
  lat: number;
  lng: number;
  topics: Topic[];
  is_public: boolean;
  event_time: string; // ISO String for the event start time
  duration: number; // Duration in minutes
  status: 'active' | 'closed';
  creator_id: string;
  participants: string[]; // Array of user UUIDs
  creator: { username: string }; // Joined from profiles table
}
