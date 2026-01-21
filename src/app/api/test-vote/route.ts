// src/app/api/test-vote/route.ts
import { NextResponse } from 'next/server';
import { voteOnPoll } from '@/lib/api/polls';

export async function GET() {
  // 1. HARDCODE DATA FOR TESTING
  // REPLACE THIS with the real UUID from your 'polls' table in Supabase
  const POLL_ID = "4f0c736b-9314-4b17-86a0-de9e2fe70233"; 
  
  // We generate a random fake user ID for testing so it works every time we refresh
  // In the real app, this comes from the logged-in user
  const FAKE_USER_ID = 'b5b70b3d-b4b3-490f-abb5-a51db153fad0'
  
  const OPTION_CHOSEN = "a"; // They voted for Option A

  console.log(`Testing vote for User ${FAKE_USER_ID} on Poll ${POLL_ID}...`);

  // 2. Run the logic
  const result = await voteOnPoll(POLL_ID, FAKE_USER_ID, OPTION_CHOSEN);

  // 3. Return result
  return NextResponse.json(result);
}