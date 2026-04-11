const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function initializeDatabase() {
  const dbPath = path.join(__dirname, '../../inservicehub.db');
  console.log('Database path:', dbPath);

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log('Connected to SQLite database.');

  // Create tables one at a time to avoid multi-statement issues
  await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
            city TEXT,
            is_online INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

  await db.exec(`
        CREATE TABLE IF NOT EXISTS provider_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            service_category TEXT,
            experience INTEGER DEFAULT 0,
            description TEXT,
            rating REAL DEFAULT 0,
            total_reviews INTEGER DEFAULT 0,
            verified INTEGER DEFAULT 0
        )
    `);

  await db.exec(`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            service_name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL
        )
    `);

  await db.exec(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
            date TEXT,
            time TEXT,
            address TEXT,
            description TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

  await db.exec(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT
        )
    `);

  // Verify
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables created:', tables.map(t => t.name));

  await db.close();
  console.log('Database initialized successfully.');
}

initializeDatabase().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
