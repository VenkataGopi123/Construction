const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Gopi@localhost:5433/buildpro_db' });

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 12);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING email`,
      ['admin@harshithram.com', passwordHash, 'Admin', 'User', 'super_admin']
    );
    console.log('Admin created:', result.rows[0].email);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
createAdmin();
