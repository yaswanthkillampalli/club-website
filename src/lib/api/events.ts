import { createClient } from '@/utils/supabase/client';

type EventWindow = 'upcoming' | 'past' | 'all';

export const getGlobalEvents = async ({ window = 'upcoming' }: { window?: EventWindow } = {}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const nowIso = new Date().toISOString();

  let query = supabase
    .from('events')
    .select(`
      *,
      clubs(name, banner_url),
      registrations:event_registrations(count),
      fires:event_fires(count)
      ${user ? ',my_reg:event_registrations(status),my_fire:event_fires(user_id)' : ''}
    `);

  // Only filter by user_id if user is logged in
  if (user?.id) {
    query = query.eq('my_reg.user_id', user.id);
  }

  // Time window filter using start_at (falls back to event_date for older rows)
  if (window === 'upcoming') {
    query = query.gte('start_at', nowIso).order('start_at', { ascending: true });
  } else if (window === 'past') {
    query = query.lt('start_at', nowIso).order('start_at', { ascending: false });
  } else {
    query = query.order('start_at', { ascending: true });
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((event: any) => {
    const startAt = event.start_at || event.event_date; // Backward compatibility
    return {
      ...event,
      start_at: startAt,
      club_name: event.clubs?.name,
      club_banner: event.clubs?.banner_url,
      attendees_count: event.registrations?.[0]?.count || 0,
      fire_count: event.fires?.[0]?.count || 0,
      my_fire: user && event.my_fire ? event.my_fire.some((f: any) => f.user_id === user.id) : false,
      my_status: user && event.my_reg ? event.my_reg?.[0]?.status || null : null
    };
  });
};

export const addFireToEvent = async (eventId: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('event_fires')
    .upsert({ event_id: eventId, user_id: user.id }, { onConflict: 'event_id,user_id' });

  if (error) throw error;
};

export const removeFireFromEvent = async (eventId: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('event_fires')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const getEventRegistrationFields = async (eventId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('event_registration_fields')
    .select(`
      id,
      event_id,
      display_order,
      is_required,
      field_type:registration_field_types(
        id,
        name,
        label,
        input_type,
        placeholder,
        options
      )
    `)
    .eq('event_id', eventId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};