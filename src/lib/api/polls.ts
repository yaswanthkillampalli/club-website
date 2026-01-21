// src/lib/api/polls.ts
import { supabase } from '@/utils/supabase/client'; // Make sure you have your supabase client set up here

export const voteOnPoll = async (pollId: string, userId: string, optionId: string) => {
  
  // 1. Try to insert the vote
  const { data, error } = await supabase
    .from('poll_votes')
    .insert([
      { 
        poll_id: pollId, 
        user_id: userId, 
        option_id: optionId 
      }
    ])
    .select()
    .single();

  // 2. Handle the "Cheating" attempt
  if (error) {
    // Postgres Error 23505 = Unique Violation (Duplicate Key)
    if (error.code === '23505') {
      return { success: false, message: "You have already voted on this poll!" };
    }
    
    console.error("Voting Error:", error);
    return { success: false, message: "System error. Try again later." };
  }

  return { success: true, message: "Vote recorded!", data };
};