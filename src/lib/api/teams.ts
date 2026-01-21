import { createClient } from '@/utils/supabase/client';

// ==========================================
// 1. NOTIFICATIONS (Invites & Applications)
// ==========================================

// USER -> CAPTAIN: "I want to join your team"
export const requestToJoinTeam = async (
  teamId: string, 
  teamName: string, 
  captainId: string, 
  candidateName: string, 
  candidateId: string
) => {
  const supabase = createClient();
  
  // 1. Check if already a member
  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('user_id', candidateId)
    .single();

  if (existing) throw new Error("You are already in this team.");

  // 2. Create Notification for the Captain
  const { error } = await supabase.from('notifications').insert([{
    user_id: captainId, // Captain gets the alert
    type: 'application',
    message: `${candidateName} wants to join ${teamName}`,
    data: { team_id: teamId, candidate_id: candidateId }, // Store IDs for logic later
    is_read: false
  }]);

  if (error) throw error;
};

// GET MY NOTIFICATIONS (Inbox)
export const getMyNotifications = async (userId: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false });
    
  return data || [];
};

// ==========================================
// 2. RESPONSE ACTIONS (Accept/Reject)
// ==========================================

// CAPTAIN ACCEPTS APPLICATION
export const acceptApplication = async (notificationId: string, teamId: string, candidateId: string) => {
  const supabase = createClient();

  // 1. Add user to team
  const { error } = await supabase.from('team_members').insert([
    { team_id: teamId, user_id: candidateId, role: 'member', status: 'active' }
  ]);
  
  if (error) throw error;

  // 2. Mark notification as read
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
};


// REJECT / DISMISS
export const markNotificationRead = async (id: string) => {
  const supabase = createClient();
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
};

// ==========================================
// 3. TEAM MANAGEMENT (CRUD)
// ==========================================

export const createTeam = async (name: string, desc: string, userId: string) => {
  const supabase = createClient();
  
  // 1. Create Team
  const { data: team, error } = await supabase
    .from('teams')
    .insert([{ name, description: desc, captain_id: userId }])
    .select()
    .single();

  if (error) throw error;

  // 2. Auto-add Creator as Captain
  await supabase.from('team_members').insert([
    { team_id: team.id, user_id: userId, role: 'captain', status: 'active' }
  ]);

  return team;
};

export const getMyTeam = async (userId: string) => {
  const supabase = createClient();
  
  // This JOIN (teams(*)) requires the Foreign Key we just added in SQL!
  const { data, error } = await supabase
    .from('team_members')
    .select('*, teams(*)') 
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle(); // Use maybeSingle to avoid 406 if no rows found
    
  if (error && error.code !== 'PGRST116') console.error(error);
  return data?.teams || null;
};

export const getTeamMembers = async (teamId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          bio,
          tech_stack,
          github_handle,
          global_xp
        )
      `)
      .eq('team_id', teamId);
    return data || [];
};

export const removeMember = async (teamId: string, userId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
      
    if (error) throw error;
};

export const getAllTeams = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
};


// 1. SEARCH USERS (For Invites)
export const searchUsers = async (query: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .ilike('username', `%${query}%`) // Search by username
    .limit(5);
  return data || [];
};

// 2. KICK MEMBER
export const kickMember = async (teamId: string, userId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId); // The RLS policy we added allows this for Captains
    
  if (error) throw error;
};

// 3. EDIT TEAM
export const updateTeam = async (teamId: string, updates: { name: string, description: string }) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId);
    
  if (error) throw error;
};


export const inviteUserToTeam = async (
  teamId: string, 
  teamName: string, 
  candidateId: string
) => {
  const supabase = createClient();
  
  // A. Create the persistent invitation record
  const { error: inviteError } = await supabase
    .from('team_invitations')
    .insert([{ team_id: teamId, user_id: candidateId }]);

  if (inviteError) {
    if (inviteError.code === '23505') throw new Error("Invite already sent.");
    throw inviteError;
  }

  // B. Send the alert to the user's inbox
  const { error: notifError } = await supabase.from('notifications').insert([{
    user_id: candidateId,
    type: 'invite',
    message: `You have been invited to join ${teamName}`,
    data: { team_id: teamId },
    is_read: false
  }]);

  if (notifError) console.error("Notification failed:", notifError);
};

export const getPendingInvites = async (teamId: string) => {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('team_invitations')
    .select('user_id')
    .eq('team_id', teamId);
    
  // Returns array of IDs: ['user_123', 'user_456']
  return data?.map((i: any) => i.user_id) || [];
};

export const acceptInvite = async (notificationId: string, teamId: string, userId: string) => {
  const supabase = createClient();

  // A. Add to Members
  const { error } = await supabase.from('team_members').insert([
    { team_id: teamId, user_id: userId, role: 'member', status: 'active' }
  ]);

  if (error) throw error;

  // B. Delete the Invitation (It's no longer pending)
  await supabase
    .from('team_invitations')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  // C. Mark Notification Read
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
};

// 4. REJECT INVITE (New)
export const rejectInvite = async (notificationId: string, teamId: string, userId: string) => {
  const supabase = createClient();
  
  // Remove invitation
  await supabase
    .from('team_invitations')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  // Mark notification read
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
};

// DELETE TEAM (Captain Only)
export const deleteTeam = async (teamId: string) => {
  const supabase = createClient();
  
  // 1. Delete the team (Cascade will remove members, invites, etc.)
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);

  if (error) throw error;
};  