// src/app/api/test-github/route.ts
import { NextResponse } from 'next/server';
import { fetchGitHubRepoDetails } from '@/lib/github'; // Ensure this matches where you saved the previous code

export async function GET() {
  // 1. Let's pick a famous repo to test
  const testUrl = "https://github.com/yaswanthkillampalli/task-tracker";

  console.log(`Testing fetch for: ${testUrl}...`);

  // 2. Run your function
  const data = await fetchGitHubRepoDetails(testUrl);

  // 3. Return the result to the browser as JSON
  if (data) {
    return NextResponse.json({ 
      success: true, 
      message: "It works! Here is the data we fetched:", 
      data: data 
    });
  } else {
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch data. Check the console for details." 
    }, { status: 404 });
  }
}