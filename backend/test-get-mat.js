const http = require('http');

const data = JSON.stringify({
  email: 'admin@buildmaster.com',
  password: 'admin' // or admin123
});

const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Gopi@localhost:5433/buildpro_db' });

async function run() {
  const res = await pool.query("SELECT id FROM users WHERE email = 'admin@buildmaster.com'");
  if (!res.rows[0]) {
    console.log("No admin found");
    pool.end();
    return;
  }
  const adminId = res.rows[0].id;
  pool.end();

  const token = jwt.sign({ sub: adminId, type: 'access', role: 'super_admin' }, 'your-super-secret-jwt-key-change-in-production-min-32-chars', { expiresIn: '1h' });

  const matOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/materials',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(matOptions, (res2) => {
    let b2 = '';
    res2.on('data', d => b2 += d);
    res2.on('end', () => console.log('STATUS:', res2.statusCode, 'BODY:', b2));
  });
  req.on('error', console.error);
  req.end();
}
run();
