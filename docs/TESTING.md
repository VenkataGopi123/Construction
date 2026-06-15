# BuildMaster ERP — Testing Strategy

## Overview

Multi-layer testing strategy covering unit, integration, end-to-end, security, and performance testing.

---

## Testing Pyramid

```
        ┌─────────┐
        │   E2E   │  10%
        ├─────────┤
        │ Integr. │  30%
        ├─────────┤
        │  Unit   │  60%
        └─────────┘
```

---

## 1. Unit Tests

### Backend (Jest + ts-jest)

**Location:** `backend/tests/`

**Run:**
```bash
cd backend
npm test
npm run test:watch
```

**Coverage targets:**
| Module | Target |
|--------|--------|
| Auth utilities | 90% |
| Helpers (GST, quotation calc) | 95% |
| Controllers | 80% |
| Services | 85% |

**Example test areas:**
- Password hashing and comparison
- JWT token generation/validation
- Quotation auto-calculation (area × rates + labor + transport + GST)
- Pagination helper
- Code generators (project_code, invoice_number)
- RBAC role authorization

### Frontend (Jest + React Testing Library)

**Run:**
```bash
cd frontend
npm test
```

**Test areas:**
- Component rendering (Button, Card, Table)
- Form validation (login, register, project form)
- Auth store state management
- API client interceptors
- Utility functions (formatCurrency, formatDate)

---

## 2. Integration Tests

### API Integration (Supertest)

**Location:** `backend/tests/integration/`

```bash
cd backend
npm run test:integration
```

**Test scenarios:**

| Module | Tests |
|--------|-------|
| Auth | Register → Login → Refresh → Logout flow |
| Projects | Create → Update status → Add milestone → Assign worker |
| Materials | Create → Adjust stock → Low stock alert |
| Quotations | Request → Auto-calculate → Accept |
| Payments | Create invoice → Record payment → Verify balance |
| Documents | Upload → Download → Version increment |

**Setup:**
- Use test database (`buildmaster_erp_test`)
- Reset database before each test suite
- Seed minimal test data

### Database Tests

- Foreign key constraint validation
- Trigger execution (updated_at)
- View queries (v_low_stock_materials, v_revenue_analytics)
- Index usage on large datasets

---

## 3. End-to-End Tests

### Recommended: Playwright

```bash
npx playwright install
npx playwright test
```

**Critical user flows:**

| Flow | Steps |
|------|-------|
| Admin login | Login → Dashboard → View analytics |
| Project lifecycle | Create project → Assign workers → Update progress → Complete |
| Material management | Add material → Adjust stock → Generate report |
| Customer portal | Register → Request quotation → View invoice → Make payment |
| Supplier portal | View PO → Update delivery status |
| AI assistant | Ask cost estimation → Verify response |

**Browsers:** Chromium, Firefox, WebKit
**Viewports:** Desktop (1920×1080), Tablet (768×1024), Mobile (375×667)

---

## 4. Security Testing

### Automated

```bash
# Dependency audit
npm audit --prefix backend
npm audit --prefix frontend

# OWASP ZAP scan (against staging)
zap-cli quick-scan http://staging.buildmaster.com
```

### Manual Checklist

- [ ] JWT tokens expire correctly
- [ ] Refresh token rotation works
- [ ] RBAC blocks unauthorized endpoints (403)
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (input sanitization)
- [ ] Rate limiting triggers at threshold
- [ ] File upload rejects non-allowed types
- [ ] Passwords never returned in API responses
- [ ] Audit logs capture all mutations
- [ ] CORS rejects unauthorized origins

### Role-Based Access Matrix

| Endpoint | super_admin | project_manager | material_manager | supplier | customer |
|----------|:-----------:|:---------------:|:----------------:|:--------:|:--------:|
| GET /users | ✅ | ❌ | ❌ | ❌ | ❌ |
| POST /projects | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /materials | ✅ | ❌ | ✅ | ❌ | ❌ |
| GET /purchase-orders | ✅ | ✅ | ✅ | ✅ | ❌ |
| POST /quotations | ✅ | ✅ | ❌ | ❌ | ✅ |
| GET /portal/invoices | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 5. Performance Testing

### Tools: k6 or Artillery

```bash
# Install k6
npm install -g k6

# Run load test
k6 run tests/load/api-load.js
```

**Targets:**

| Metric | Target |
|--------|--------|
| API response (p95) | < 200ms |
| Dashboard page load | < 2s |
| Concurrent users | 500+ |
| Database queries (p95) | < 50ms |
| Error rate under load | < 0.1% |

**Load test scenarios:**
- 100 concurrent login requests
- 50 concurrent project list queries
- 30 concurrent material stock updates
- Sustained 200 req/s for 5 minutes

---

## 6. CI/CD Pipeline

### GitHub Actions Example

```yaml
name: CI
on: [push, pull_request]
jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: buildmaster_erp_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd backend && npm ci && npm test

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd frontend && npm ci && npm run build
```

---

## 7. Test Data Management

### Seed Script

```bash
cd backend
npm run seed
```

Creates users with known passwords for each role.

### Test Database Reset

```bash
dropdb buildmaster_erp_test
createdb buildmaster_erp_test
psql -d buildmaster_erp_test -f database/schema.sql
```

---

## 8. QA Checklist (Pre-Release)

### Functional
- [ ] All CRUD operations work for each module
- [ ] Quotation auto-calculation is accurate
- [ ] Invoice PDF generates correctly
- [ ] GST calculation matches Indian tax rules (18% default)
- [ ] Dark/light mode toggles correctly
- [ ] Mobile responsive on all pages
- [ ] Customer portal shows only own data
- [ ] Supplier sees only assigned POs

### Non-Functional
- [ ] Page load < 3s on 3G
- [ ] No console errors in production build
- [ ] Lighthouse score > 90 (Performance, Accessibility)
- [ ] All API endpoints return proper error codes
- [ ] Graceful degradation when AI API unavailable

---

## Test Reporting

- **Coverage reports:** Generated in `backend/coverage/`
- **E2E reports:** Playwright HTML report
- **CI badges:** Add to README after pipeline setup

---

## Recommended Test Schedule

| Type | Frequency |
|------|-----------|
| Unit tests | Every commit (CI) |
| Integration tests | Every PR |
| E2E tests | Nightly |
| Security scan | Weekly |
| Load test | Before major releases |
| Full QA checklist | Before production deploy |
