const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkDb() {
    const db = await open({
        filename: path.join(__dirname, '../../inservicehub.db'),
        driver: sqlite3.Database
    });
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', tables.map(t => t.name));
    await db.close();
}

checkDb();
