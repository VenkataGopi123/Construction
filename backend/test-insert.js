const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Gopi@localhost:5433/buildpro_db' });
async function run() {
  try {
    const res = await pool.query('INSERT INTO materials (sku, name, category_id, unit, quantity, min_stock_level, cost_price, selling_price) VALUES ($1, $2, null, $3, $4, $5, $6, $7) RETURNING *', ['MAT-9999', 'Test Material', 'bags', 50, 10, 0, 0]);
    console.log(res.rows[0]);
  } catch(e) { console.error(e) } finally { await pool.end(); }
}
run();
