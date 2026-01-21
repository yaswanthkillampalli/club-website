import { createClient } from '@/utils/supabase/client';

// =======================
// 1. PUBLIC / SHARED
// =======================

export const getAllClubs = async () => {
  const supabase = createClient();
  const { data } = await supabase.from('clubs').select('*').order('name');
  return data || [];
};

export const getClubDetails = async (clubId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase.from('clubs').select('*').eq('id', clubId).single();
  if (error) throw error;
  return data;
};

// Check my status in a specific club
export const getMyClubMembership = async (clubId: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', clubId)
    .eq('user_id', user.id)
    .maybeSingle();
    
  return data; // returns { status: 'pending' | 'active', role: 'member'|'admin' }
};

// =======================
// 2. USER ACTIONS
// =======================

export const applyToClub = async (clubId: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Login required");

  const { error } = await supabase
    .from('club_members')
    .insert([{ club_id: clubId, user_id: user.id, status: 'pending' }]);
    
  if (error) {
     if (error.code === '23505') throw new Error("Already applied or joined.");
     throw error;
  }
};

export const getClubAnnouncements = async (clubId: string) => {
  const supabase = createClient();
  // This will return [] if the user is NOT an active member due to RLS
  const { data } = await supabase
    .from('club_announcements')
    .select('*, author:profiles(full_name, avatar_url)')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });
    
  return data || [];
};

// =======================
// 3. CLUB ADMIN ACTIONS
// =======================

export const getClubApplicants = async (clubId: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('club_members')
    .select('*, profiles(full_name, username, avatar_url, bio)')
    .eq('club_id', clubId)
    .eq('status', 'pending');
  return data || [];
};

export const processApplication = async (membershipId: string, action: 'accept' | 'reject') => {
  const supabase = createClient();
  
  if (action === 'reject') {
     await supabase.from('club_members').delete().eq('id', membershipId);
  } else {
     await supabase.from('club_members').update({ status: 'active' }).eq('id', membershipId);
  }
};

export const postAnnouncement = async (clubId: string, title: string, content: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase.from('club_announcements').insert([{
    club_id: clubId,
    author_id: user?.id,
    title,
    content
  }]);
  
  if (error) throw error;
};

// GET ALL MY MEMBERSHIPS (To toggle buttons efficiently)
export const getMyMemberships = async (userId: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('club_members')
    .select('club_id, status, role')
    .eq('user_id', userId);
    
  return data || []; // Returns [{ club_id: "...", status: "active" }, ...]
};

// GET ACTIVE MEMBERS (Sorted will happen on frontend)
export const getClubMembers = async (clubId: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('club_members')
    .select('*, profiles(full_name, username, avatar_url, bio, tech_stack)')
    .eq('club_id', clubId)
    .eq('status', 'active'); // Only active members
    
  return data || [];
};

// ... existing imports

// =======================
// 4. EVENTS SYSTEM
// =======================
// =======================
// 4. EVENTS SYSTEM (Unified Table)
// =======================

export const getClubEvents = async (clubId: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch events where club_id matches
  const { data, error } = await supabase
    .from('events') // <--- USING YOUR EXISTING TABLE
    .select(`
      *,
      registrations:event_registrations(count),
      my_reg:event_registrations(status)
    `)
    .eq('club_id', clubId)
    .eq('my_reg.user_id', user?.id) // Filter inner join for MY status
    .order('event_date', { ascending: true });

  if (error) throw error;
  
  return data.map((event: any) => ({
    ...event,
    attendees_count: event.registrations?.[0]?.count || 0,
    my_status: event.my_reg?.[0]?.status || null
  }));
};

export const createEvent = async (eventData: any) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Map our frontend fields to your existing schema
  const { error } = await supabase.from('events').insert([{
    title: eventData.title,
    description: eventData.description,
    event_date: eventData.start_time, // Schema uses event_date
    location: eventData.location,
    club_id: eventData.club_id,
    created_by: user?.id,
    max_capacity: eventData.max_capacity, // New field
    is_public: eventData.is_public,       // New field
    event_type: 'workshop' // Default
  }]);
  
  if (error) throw error;
};

// New Function: Handles the Form Data
export const registerForEvent = async (eventId: string, formData: any = {}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('event_registrations').upsert({
    event_id: eventId,
    user_id: user?.id,
    status: 'registered',
    form_data: formData // <--- Saves the Branch/Year/etc.
  }, { onConflict: 'event_id, user_id' });

  if (error) throw error;
};

export const cancelRegistration = async (eventId: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('event_registrations').delete()
    .eq('event_id', eventId).eq('user_id', user?.id);
};

export const toggleRsvp = async (eventId: string, status: 'going' | 'not_going') => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if(status === 'not_going') {
      // If removing RSVP, just delete the row
      await supabase.from('event_rsvps').delete()
        .eq('event_id', eventId).eq('user_id', user?.id);
  } else {
      // Upsert: Create or Update to 'going'
      const { error } = await supabase.from('event_rsvps').upsert({
        event_id: eventId,
        user_id: user?.id,
        status: 'going'
      }, { onConflict: 'event_id, user_id' });
      
      if (error) throw error;
  }
};

// GET REGISTRATIONS (For the Admin Checklist)
export const getEventAttendees = async (eventId: string) => {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('event_registrations')
    .select('*, profiles(full_name, username, avatar_url, global_xp)')
    .eq('event_id', eventId);
    
  return data || [];
};

// MARK PRESENT (Calls the SQL Function)
export const markUserPresent = async (eventId: string, userId: string) => {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('mark_attendance', {
    _event_id: eventId,
    _user_id: userId,
    _xp_amount: 50 // You can change this reward amount!
  });
  
  if (error) throw error;
};