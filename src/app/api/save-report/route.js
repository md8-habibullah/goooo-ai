import { NextResponse } from 'next/server';
import { openDb } from '@/../lib/db';

export async function POST(req) {
  try {
    const reportData = await req.json();
    const { intent, category, priority, location, summary, confidence } = reportData;

    const db = await openDb();
    
    const stmt = await db.prepare(
      `INSERT INTO reports (intent, category, priority, location, summary, confidence, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    
    const result = await stmt.run(
      intent,
      category,
      priority,
      location,
      summary,
      confidence,
      'Action Completed'
    );
    
    await stmt.finalize();

    return NextResponse.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error("Error saving report:", error);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}
