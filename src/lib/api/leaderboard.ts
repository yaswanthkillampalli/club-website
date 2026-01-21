// src/lib/api/leaderboard.ts
import { supabase } from '@/utils/supabase/client'; // Use the client we just made

export type LeaderboardType = 'global' | 'event';

export const getLeaderboard = async (type: LeaderboardType, eventId?: string) => {
  
  // CASE 1: The Global Hall of Fame (Users)
  if (type === 'global') {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url, global_xp, badges')
      .order('global_xp', { ascending: false }) // Highest XP first
      .limit(10); // Top 10 only

    if (error) throw error;
    return data;
  }

  // CASE 2: The Hackathon Live Board (Teams)
  if (type === 'event' && eventId) {
    const { data, error } = await supabase
      .from('teams')
      .select('name, event_score, repo_link')
      .eq('event_id', eventId) // Only teams for THIS hackathon
      .order('event_score', { ascending: false }) // Highest Score first
      .limit(20);

    if (error) throw error;
    return data;
  }

  return [];
};