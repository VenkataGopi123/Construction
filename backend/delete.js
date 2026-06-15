const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Gopi@localhost:5433/buildpro_db' });
async function run() {
  try {
    await pool.query("DELETE FROM material_stock_logs WHERE material_id IN (SELECT id FROM materials WHERE name != 'cement')");
    await pool.query("DELETE FROM materials WHERE name != 'cement'");
    await pool.query('DELETE FROM project_milestones');
    await pool.query('DELETE FROM project_updates');
    await pool.query('DELETE FROM projects');
    console.log('Dummy data deleted successfully!');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
