import { supabase } from '@/utils/supabase/client';

export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  user_id: string;
  created_at: string;
  profiles?: { username: string; avatar_url: string };
};

// 1. GET ALL RESOURCES
export const getResources = async (categoryFilter?: string) => {

  let query = supabase
    .from('resources')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false });

  if (categoryFilter && categoryFilter !== 'all') {
    query = query.eq('category', categoryFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Resource[];
};

// 2. ADD RESOURCE
export const addResource = async (
  title: string, 
  desc: string, 
  url: string, 
  category: string, 
  tags: string[], 
  userId: string
) => { // <--- FIX: Create client instance here

  const { error } = await supabase.from('resources').insert([{
    title,
    description: desc,
    url,
    category,
    tags,
    user_id: userId
  }]);
  
  if (error) throw error;
};