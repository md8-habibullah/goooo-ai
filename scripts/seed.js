const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

async function seed() {
  const db = await open({
    filename: path.join(__dirname, '../database.sqlite'),
    driver: sqlite3.Database
  });

  console.log('Opened database.');

  // Read schema
  const schemaPath = path.join(__dirname, '../lib/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema creation
  await db.exec(schemaSql);
  console.log('Schema created.');

  // Dummy Bangladesh Data (Institutions)
  const institutions = [
    { name: 'Dhaka Medical College Hospital', type: 'hospital', location: 'Dhaka', phone: '16263' },
    { name: 'Kurmitola General Hospital', type: 'hospital', location: 'Dhaka', phone: '01712345678' },
    { name: 'Gulshan Police Station', type: 'police', location: 'Gulshan, Dhaka', phone: '999' },
    { name: 'Dhanmondi Model Thana', type: 'police', location: 'Dhanmondi, Dhaka', phone: '999' },
    { name: 'Fire Service Headquarters', type: 'govt', location: 'Kazi Alauddin Road, Dhaka', phone: '16163' },
    { name: 'Dhaka North City Corporation', type: 'govt', location: 'Gulshan, Dhaka', phone: '16106' }
  ];

  // Insert dummy institutions if empty
  const instCount = await db.get('SELECT COUNT(*) as count FROM institutions');
  if (instCount.count === 0) {
    const stmt = await db.prepare('INSERT INTO institutions (name, type, location, phone) VALUES (?, ?, ?, ?)');
    for (const inst of institutions) {
      await stmt.run(inst.name, inst.type, inst.location, inst.phone);
    }
    await stmt.finalize();
    console.log('Institutions seeded.');
  }

  // Dummy Events
  const events = [
    { title: 'National Mourning Day', type: 'holiday', date: '2026-08-15', description: 'Public holiday marking the assassination of Sheikh Mujibur Rahman.' },
    { title: 'Severe Cyclone Alert', type: 'alert', date: '2026-05-20', description: 'A severe cyclone is expected to hit the coastal regions. Please take precautions.' },
    { title: 'Victory Day', type: 'holiday', date: '2026-12-16', description: 'National holiday commemorating the victory of the Allied forces over the Pakistani forces.' }
  ];

  const eventsCount = await db.get('SELECT COUNT(*) as count FROM events');
  if (eventsCount.count === 0) {
    const stmt = await db.prepare('INSERT INTO events (title, type, date, description) VALUES (?, ?, ?, ?)');
    for (const ev of events) {
      await stmt.run(ev.title, ev.type, ev.date, ev.description);
    }
    await stmt.finalize();
    console.log('Events seeded.');
  }

  // Sample Reports (to show some history if needed)
  const reportsCount = await db.get('SELECT COUNT(*) as count FROM reports');
  if (reportsCount.count === 0) {
    await db.run(`INSERT INTO reports (intent, category, priority, location, summary, confidence, status) 
      VALUES ('Police Report', 'Theft', 'High', 'Mirpur 10, Dhaka', 'Robbery reported at local market.', 0.95, 'Action Completed')`);
    console.log('Sample report seeded.');
  }

  console.log('Database seeding complete.');
}

seed().catch(console.error);
