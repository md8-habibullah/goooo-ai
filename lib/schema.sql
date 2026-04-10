CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intent TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  location TEXT,
  summary TEXT,
  confidence REAL,
  status TEXT DEFAULT 'Pending' -- 'Pending', 'Action Completed', etc.
);

CREATE TABLE IF NOT EXISTS institutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'police', 'hospital', 'govt'
  location TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'holiday', 'alert'
  date TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS form_schemas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intent TEXT NOT NULL UNIQUE,
  schema_json TEXT NOT NULL
);
