// src/app/api/test-leaderboard/route.ts
import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/api/leaderboard';

export async function GET() {
  console.log("Fetching Global Hall of Fame...");

  try {
    // 1. Fetch Global Rankings
    const data = await getLeaderboard('global');

    // 2. Return the JSON
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      leaderboard: data
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}