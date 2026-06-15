# BuildMaster ERP — API Reference

Base URL: `http://localhost:5000/api/v1`

Authentication: Bearer token in `Authorization` header.

---

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new customer account |
| POST | `/auth/login` | Public | Login with email/password |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Required | Invalidate refresh token |
| GET | `/auth/google` | Public | Initiate Google OAuth |
| GET | `/auth/google/callback` | Public | Google OAuth callback |
| GET | `/auth/profile` | Required | Get current user profile |
| PUT | `/auth/profile` | Required | Update profile |

---

## Users (Admin)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/users` | super_admin | List all users |
| GET | `/users/:id` | super_admin | Get user by ID |
| POST | `/users` | super_admin | Create user |
| PUT | `/users/:id` | super_admin | Update user |
| DELETE | `/users/:id` | super_admin | Deactivate user |

---

## Projects

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/projects` | admin, pm | List projects (paginated) |
| GET | `/projects/:id` | admin, pm, customer | Get project details |
| POST | `/projects` | admin, pm | Create project |
| PUT | `/projects/:id` | admin, pm | Update project |
| DELETE | `/projects/:id` | admin | Delete project |
| GET | `/projects/:id/milestones` | admin, pm | List milestones |
| POST | `/projects/:id/milestones` | admin, pm | Add milestone |
| GET | `/projects/:id/updates` | admin, pm, customer | Daily updates |
| POST | `/projects/:id/updates` | admin, pm | Add daily update |
| POST | `/projects/:id/assign-worker` | admin, pm | Assign worker |
| GET | `/projects/:id/gantt` | admin, pm | Gantt chart data |

---

## Customers

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/customers` | admin, pm | List customers |
| GET | `/customers/:id` | admin, pm | Get customer |
| POST | `/customers` | admin, pm | Create customer |
| PUT | `/customers/:id` | admin, pm | Update customer |
| GET | `/customers/:id/projects` | admin, pm, customer | Project history |
| GET | `/customers/leads` | admin | CRM leads |
| POST | `/customers/leads` | admin | Create lead |

---

## Materials

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/materials` | admin, material_mgr | List materials |
| GET | `/materials/:id` | admin, material_mgr | Get material |
| POST | `/materials` | admin, material_mgr | Add material |
| PUT | `/materials/:id` | admin, material_mgr | Update material |
| POST | `/materials/:id/adjust-stock` | admin, material_mgr | Adjust stock |
| GET | `/materials/low-stock` | admin, material_mgr | Low stock alerts |
| GET | `/materials/categories` | all auth | List categories |
| GET | `/materials/barcode/:code` | admin, material_mgr | Lookup by barcode |

---

## Suppliers

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/suppliers` | admin, material_mgr | List suppliers |
| POST | `/suppliers` | admin | Create supplier |
| PUT | `/suppliers/:id` | admin | Update supplier |
| GET | `/suppliers/purchase-orders` | admin, material_mgr, supplier | List POs |
| POST | `/suppliers/purchase-orders` | admin, material_mgr | Create PO |
| PUT | `/suppliers/purchase-orders/:id/status` | admin, material_mgr, supplier | Update PO status |

---

## Workers

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/workers` | admin, pm | List workers |
| POST | `/workers` | admin, pm | Add worker |
| PUT | `/workers/:id` | admin, pm | Update worker |
| POST | `/workers/:id/attendance` | admin, pm | Mark attendance |
| GET | `/workers/:id/attendance` | admin, pm | Attendance history |
| GET | `/workers/payroll` | admin | Payroll records |
| POST | `/workers/payroll/generate` | admin | Generate monthly payroll |

---

## Payments & Invoices

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/payments/invoices` | admin, pm, customer | List invoices |
| POST | `/payments/invoices` | admin, pm | Create invoice |
| GET | `/payments/invoices/:id` | admin, pm, customer | Get invoice |
| GET | `/payments/invoices/:id/pdf` | admin, pm, customer | Download PDF |
| POST | `/payments` | admin, pm, customer | Record payment |
| GET | `/payments` | admin, pm | List payments |
| GET | `/payments/due` | admin, pm | Due payments |

---

## Quotations

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/quotations` | admin, pm, customer | List quotations |
| POST | `/quotations` | admin, pm, customer | Create quotation request |
| POST | `/quotations/calculate` | all auth | Auto-calculate estimate |
| GET | `/quotations/:id` | admin, pm, customer | Get quotation |
| PUT | `/quotations/:id/status` | admin, pm | Update status |
| GET | `/quotations/:id/pdf` | admin, pm, customer | Download PDF |

### Quotation Calculate Body

```json
{
  "projectType": "residential",
  "areaSqft": 1500,
  "location": "Mumbai"
}
```

---

## Documents

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/documents` | admin, pm | List documents |
| POST | `/documents/upload` | admin, pm | Upload document |
| GET | `/documents/:id/download` | admin, pm, customer | Download file |
| GET | `/documents/:id/versions` | admin, pm | Version history |
| POST | `/documents/:id/sign` | admin, pm, customer | E-signature |

---

## Analytics

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/analytics/dashboard` | admin, pm | Dashboard stats |
| GET | `/analytics/revenue` | admin | Revenue chart data |
| GET | `/analytics/projects` | admin, pm | Project progress data |
| GET | `/analytics/materials` | admin, material_mgr | Material usage data |
| GET | `/analytics/customers` | admin | Customer analytics |
| GET | `/analytics/profit` | admin | Monthly profit data |

---

## AI Assistant

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/analytics/ai/cost-estimate` | all auth | Material cost estimation |
| POST | `/analytics/ai/timeline-predict` | admin, pm | Timeline prediction |
| POST | `/analytics/ai/risk-analysis` | admin, pm | Project risk analysis |
| POST | `/analytics/ai/chat` | all auth | General AI chat |

---

## Notifications

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/notifications` | all auth | List notifications |
| PUT | `/notifications/:id/read` | all auth | Mark as read |
| PUT | `/notifications/read-all` | all auth | Mark all read |
| POST | `/notifications/send` | admin | Send notification |

---

## Reports

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/reports` | admin, pm, material_mgr | List generated reports |
| POST | `/reports/project` | admin, pm | Generate project report |
| POST | `/reports/material` | admin, material_mgr | Generate material report |
| POST | `/reports/financial` | admin | Generate financial report |
| POST | `/reports/gst` | admin | Generate GST report |
| GET | `/reports/:id/download` | admin | Download report file |

---

## Website (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/website/projects/completed` | Public | Completed projects |
| GET | `/website/projects/ongoing` | Public | Ongoing projects |
| GET | `/website/testimonials` | Public | Testimonials |
| GET | `/website/services` | Public | Service list |
| POST | `/website/contact` | Public | Contact form submission |
| POST | `/website/chat` | Public | Live chat message |

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | API health check |

---

## Common Response Format

### Success

```json
{
  "success": true,
  "data": { },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden (RBAC) |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
