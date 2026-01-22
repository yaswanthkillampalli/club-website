import { createClient } from '@/utils/supabase/client';

export const getGlobalEvents = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('events')
    .select(`
      *,
      clubs(name, banner_url),
      registrations:event_registrations(count)
      ${user ? ',my_reg:event_registrations(status)' : ''}
    `);

  // Only filter by user_id if user is logged in
  if (user?.id) {
    query = query.eq('my_reg.user_id', user.id);
  }

  const { data, error } = await query.order('event_date', { ascending: true });

  if (error) throw error;

  return data.map((event: any) => ({
    ...event,
    club_name: event.clubs?.name,
    club_banner: event.clubs?.banner_url,
    attendees_count: event.registrations?.[0]?.count || 0,
    my_status: user && event.my_reg ? event.my_reg?.[0]?.status || null : null
  }));
};