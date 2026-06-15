# BuildMaster ERP — Deployment Guide

## Overview

This guide covers deployment to production environments on AWS, Azure, or any Docker-compatible infrastructure.

---

## Architecture

```
                    ┌─────────────┐
                    │   CDN/WAF   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  Frontend   │          │   Backend   │
       │  (Next.js)  │◄────────►│  (Express)  │
       │  Port 3000  │   REST   │  Port 5000  │
       └─────────────┘          └──────┬──────┘
                                       │
                              ┌────────▼────────┐
                              │   PostgreSQL    │
                              │   Port 5432     │
                              └─────────────────┘
```

---

## Prerequisites

- Docker 24+ and Docker Compose 2+
- Node.js 20 LTS (for manual deployment)
- PostgreSQL 16+
- SSL certificate (Let's Encrypt or cloud provider)
- Domain name configured with DNS

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `5000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 32 characters, cryptographically random |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `FRONTEND_URL` | Yes | Production frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | No | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth |
| `OPENAI_API_KEY` | No | AI features |
| `GEMINI_API_KEY` | No | AI fallback |
| `SMTP_*` | No | Email notifications |
| `TWILIO_*` | No | SMS/WhatsApp |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |

---

## Option 1: Docker Compose (Recommended)

### 1. Clone and configure

```bash
git clone <repository-url> buildmaster-erp
cd buildmaster-erp
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit environment files with production values.

### 2. Generate JWT secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start services

```bash
docker-compose up -d --build
```

### 4. Seed passwords (first run)

```bash
docker exec buildmaster-api npm run seed
```

### 5. Verify

- Frontend: `http://localhost:3000`
- API health: `http://localhost:5000/api/v1/health`
- Database: `docker exec -it buildmaster-db psql -U buildmaster -d buildmaster_erp`

---

## Option 2: AWS Deployment

### Services Used

| Service | Purpose |
|---------|---------|
| **ECS Fargate** | Container orchestration |
| **RDS PostgreSQL** | Managed database |
| **S3** | Document/file storage |
| **CloudFront** | CDN for frontend |
| **ALB** | Load balancing |
| **Secrets Manager** | Environment secrets |
| **Route 53** | DNS |

### Steps

1. **RDS**: Create PostgreSQL 16 instance, run `database/schema.sql`
2. **ECR**: Push backend and frontend Docker images
3. **ECS**: Deploy task definitions with env from Secrets Manager
4. **S3 + CloudFront**: Deploy Next.js static export or SSR via Amplify
5. **ALB**: Route `/api/*` to backend, `/*` to frontend
6. **Configure** `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` with production domains

### AWS CLI Example

```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.ap-south-1.amazonaws.com
docker tag buildmaster-api:latest <account>.dkr.ecr.ap-south-1.amazonaws.com/buildmaster-api:latest
docker push <account>.dkr.ecr.ap-south-1.amazonaws.com/buildmaster-api:latest
```

---

## Option 3: Azure Deployment

### Services Used

| Service | Purpose |
|---------|---------|
| **Azure Container Apps** | Backend/frontend containers |
| **Azure Database for PostgreSQL** | Managed database |
| **Azure Blob Storage** | File uploads |
| **Azure Front Door** | CDN + WAF |
| **Azure Key Vault** | Secrets |

### Steps

1. Create Azure Database for PostgreSQL Flexible Server
2. Run schema migration via Azure Cloud Shell
3. Deploy containers to Azure Container Apps
4. Configure Key Vault references for secrets
5. Set up Front Door with custom domain and SSL

---

## Option 4: Manual VPS Deployment

### Backend

```bash
cd backend
npm ci --production=false
npm run build
npm run seed
NODE_ENV=production pm2 start dist/index.js --name buildmaster-api
```

### Frontend

```bash
cd frontend
npm ci
npm run build
NODE_ENV=production pm2 start npm --name buildmaster-web -- start
```

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name app.buildmaster.com;

    ssl_certificate /etc/letsencrypt/live/app.buildmaster.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.buildmaster.com/privkey.pem;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

---

## Database Migration

```bash
# Fresh install
psql -h <host> -U buildmaster -d buildmaster_erp -f database/schema.sql
psql -h <host> -U buildmaster -d buildmaster_erp -f database/seed.sql

# Backup before updates
pg_dump -h <host> -U buildmaster buildmaster_erp > backup_$(date +%Y%m%d).sql
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong `JWT_SECRET` (64+ random bytes)
- [ ] Enable HTTPS everywhere
- [ ] Restrict database to private subnet
- [ ] Configure WAF rules on CDN
- [ ] Enable audit log monitoring
- [ ] Set up rate limiting at reverse proxy level
- [ ] Rotate secrets quarterly
- [ ] Enable PostgreSQL SSL connections
- [ ] Restrict CORS to production domain only

---

## Monitoring

| Tool | Purpose |
|------|---------|
| **CloudWatch / Azure Monitor** | Infrastructure metrics |
| **Sentry** | Error tracking |
| **Datadog / New Relic** | APM |
| **Uptime Robot** | Availability checks |

Health endpoint: `GET /api/v1/health`

---

## Scaling

- **Horizontal**: Run multiple backend containers behind load balancer
- **Database**: Read replicas for analytics queries
- **Cache**: Add Redis for session/token caching
- **CDN**: Cache static assets via CloudFront/Front Door

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Verify `FRONTEND_URL` matches frontend domain |
| DB connection refused | Check security groups / firewall rules |
| JWT expired | Client should refresh token via `/auth/refresh` |
| File upload fails | Check `UPLOAD_DIR` permissions and `MAX_FILE_SIZE` |
| AI features unavailable | Verify `OPENAI_API_KEY` or `GEMINI_API_KEY` |

---

## Rollback Procedure

1. Stop current deployment
2. Restore database from backup if schema changed
3. Deploy previous Docker image tag
4. Verify health endpoint
5. Monitor error rates for 15 minutes
