const http = require('http');

const data = JSON.stringify({
  email: 'admin@buildmaster.com',
  password: 'admin' // or admin123
});

// actually, let's just generate the JWT correctly using type: 'access' and sub: user.id
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Gopi@localhost:5433/buildpro_db' });

async function run() {
  const res = await pool.query("SELECT id FROM users WHERE email = 'admin@buildmaster.com'");
  const adminId = res.rows[0].id;
  pool.end();

  const token = jwt.sign({ sub: adminId, type: 'access', role: 'super_admin' }, 'your-super-secret-jwt-key-change-in-production-min-32-chars', { expiresIn: '1h' });

  const matData = JSON.stringify({
    name: 'Test Material API 3',
    quantity: 50,
    unit: 'bags',
    cost_price: 0,
    selling_price: 0,
    min_stock_level: 10,
    sku: 'MAT-8888'
  });

  const matOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/materials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': matData.length,
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(matOptions, (res2) => {
    let b2 = '';
    res2.on('data', d => b2 += d);
    res2.on('end', () => console.log('STATUS:', res2.statusCode, 'BODY:', b2));
  });
  req.on('error', console.error);
  req.write(matData);
  req.end();
}
run();
