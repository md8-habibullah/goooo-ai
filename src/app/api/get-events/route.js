import { NextResponse } from 'next/server';
import { openDb } from '@/../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await openDb();
    const events = await db.all('SELECT * FROM events ORDER BY date DESC');
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
