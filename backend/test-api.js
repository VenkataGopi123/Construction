const http = require('http');

const data = JSON.stringify({
  email: 'admin@buildmaster.com',
  password: 'admin'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Login Response:', body);
  });
});
req.write(data);
req.end();
