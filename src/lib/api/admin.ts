import { createClient } from '@/utils/supabase/client';
import { error } from 'console';

// CHECK IF I AM SUPER ADMIN
export const checkIsSuperAdmin = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single();

  return data?.is_super_admin || false;
};

// CREATE A NEW CLUB
export const createClub = async (clubData: { name: string, description: string, category: string, banner_url: string }) => {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('clubs')
    .insert([clubData]);

  if (error) {
    if (error.code === '23505') throw new Error("A club with this name already exists.");
    throw error;
  }
};

// DELETE A CLUB (The Nuclear Option)
export const deleteClub = async (clubId: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('clubs').delete().eq('id', clubId);
  if (error) throw error;
};

// ... existing imports

// 1. GET CURRENT LEADERS (To show who is in charge)
export const getClubLeaders = async (clubId: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('club_members')
    .select('id, user_id, role, profiles(full_name, username, avatar_url)')
    .eq('club_id', clubId)
    .in('role', ['admin', 'moderator']);

  return data || [];
};

// 2. SEARCH USERS (Reuse the logic from teams, but explicit here)
export const searchUsersAdmin = async (query: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .ilike('username', `%${query}%`)
    .limit(5);
  return data || [];
};

// 3. ASSIGN ADMIN ROLE
export const assignClubRole = async (clubId: string, userId: string, role: 'admin' | 'moderator') => {
  const supabase = createClient();
  
  // Upsert: If they are already a member, update role. If not, insert them.
  const { error } = await supabase
    .from('club_members')
    .upsert({
      club_id: clubId,
      user_id: userId,
      role: role,
      status: 'active' // Auto-activate them
    }, { onConflict: 'club_id, user_id' });

  if (error) throw error;
};

// 4. REMOVE LEADER (Demote or Kick)
export const removeClubLeader = async (membershipId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('club_members').delete().eq('id', membershipId);
    if (error) throw error;
};