import { NextResponse } from 'next/server';
import { openDb } from '@/../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const db = await openDb();
    
    let query = 'SELECT * FROM institutions';
    let params = [];
    
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    const institutions = await db.all(query, ...params);
    return NextResponse.json(institutions);
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json({ error: 'Failed to fetch institutions' }, { status: 500 });
  }
}
