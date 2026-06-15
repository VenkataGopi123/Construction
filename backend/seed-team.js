const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Gopi@localhost:5433/buildpro_db' });
async function run() {
  try {
    await pool.query('INSERT INTO company_team (name, role, email) VALUES ($1, $2, $3)', ['Gopi', 'Owner', 'owner@buildmaster.com']);
    await pool.query('INSERT INTO company_team (name, role, email) VALUES ($1, $2, $3)', ['Alice', 'Accountant', 'accountant@buildmaster.com']);
    await pool.query('INSERT INTO company_team (name, role, email) VALUES ($1, $2, $3)', ['Bob', 'Tech Head', 'tech@buildmaster.com']);
    console.log('Inserted team members');
  } catch(e) { console.error(e) } finally { await pool.end(); }
}
run();
