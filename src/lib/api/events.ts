import { createClient } from '@/utils/supabase/client';

export const getGlobalEvents = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      clubs(name, banner_url),
      registrations:event_registrations(count),
      my_reg:event_registrations(status)
    `)
    .eq('my_reg.user_id', user?.id)
    // Order: Upcoming events first
    .order('event_date', { ascending: true });

  if (error) throw error;

  return data.map((event: any) => ({
    ...event,
    club_name: event.clubs?.name,
    club_banner: event.clubs?.banner_url,
    attendees_count: event.registrations?.[0]?.count || 0,
    my_status: event.my_reg?.[0]?.status || null
  }));
};