# Invoice & Cash Flow Manager | Documentation

## 1. PROJECT OVERVIEW
The **Invoice & Cash Flow Manager** is a professional-grade, full-stack financial ecosystem designed specifically for freelancers and small business owners. It streamlines the entire billing lifecycle—from draft creation and automated delivery via email to secure payment processing through Stripe. Beyond basic accounting, the platform leverages a sophisticated Python-based machine learning service to analyze historical financial data and provide predictive insights, offering 30, 60, and 90-day cash flow forecasts to help users make informed business decisions.

### Core Features
| Feature | Description |
| :--- | :--- |
| **Invoice Management** | Full CRUD capabilities for invoices including line items, tax calculations, and duplication. |
| **Cash Flow Forecasting** | ML-powered predictive analysis using Facebook Prophet to forecast future liquidity. |
| **Stripe Integration** | Native payment link generation and automated status updates via Stripe webhooks. |
| **Client Portal** | Secure, token-based self-service portal for clients to view and pay invoices. |
| **Automated Reminders** | Celery-driven background tasks to send overdue email notifications via Resend. |
| **Expense Tracking** | Categorized expense management to provide a holistic view of net cash flow. |
| **Multi-Currency** | Real-time exchange rate integration for global billing and reporting. |
| **PDF Engine** | Professional PDF generation for invoices and quarterly tax summaries. |

### Invoice Status Flow
```text
      [ CREATE ]          [ SEND ]          [ WEBHOOK / MANUAL ]
          |                  |                      |
          v                  v                      v
    +-----------+      +-----------+         +--------------+
    |   Draft   |----->|   Sent    |-------->|    Paid      |
    +-----------+      +-----------+         +--------------+
          |                  |                      |
          |                  | (Due Date Passed)    | (Partial)
          |                  v                      v
          |            +-----------+         +--------------+
          +----------->|  Overdue  |         | Partially    |
          |            +-----------+         |    Paid      |
          |                  |               +--------------+
          v                  v                      |
    +-----------+      +-----------+                |
    | Cancelled |<-----|  Expired  |<---------------+
    +-----------+      +-----------+
```

---

## 2. TECH STACK

### Frontend
| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix UI) |
| State Management | Zustand |
| Data Fetching | React Query / Server Actions |
| Forms | React Hook Form + Zod |
| Charts | Recharts |

### Backend (Node.js)
| Layer | Technology |
| :--- | :--- |
| API Layer | Next.js API Routes |
| Runtime | Node.js (Vercel Edge/Serverless) |
| ORM | Prisma |
| Auth | NextAuth.js (Google & Email) |
| Payments | Stripe SDK |
| Email | Resend API |
| Validation | Zod |

### Backend (Python)
| Layer | Technology |
| :--- | :--- |
| Framework | FastAPI |
| ML Model | Facebook Prophet |
| Data Analysis | pandas, numpy |
| PDF Engine | ReportLab |
| Background Jobs | Celery |
| Task Queue | Redis |
| Database Ops | SQLAlchemy |

### Infrastructure
| Layer | Technology |
| :--- | :--- |
| Database | PostgreSQL (Primary) |
| Caching/Queue | Redis |
| Hosting (Web) | Vercel |
| Hosting (API/DB) | Railway |
| Monitoring | Sentry |
| CI/CD | GitHub Actions |
| Containerization | Docker & Docker Compose |

---

## 3. PROJECT ROADMAP

### Phase 1: Foundation & Auth (Week 1–2)
- [ ] Initialize Next.js project with TypeScript and Tailwind
- [ ] Configure PostgreSQL with Prisma ORM
- [ ] Implement NextAuth.js with Google OAuth and Magic Link providers
- [ ] Scaffold FastAPI boilerplate with SQLAlchemy models
- [ ] Setup Docker Compose for local development (Postgres, Redis)
- [ ] Configure GitHub Actions for CI/CD linting and testing
- [ ] Design base dashboard layout and navigation sidebar

### Phase 2: Client & Invoice Module (Week 3–5)
- [ ] Build Client CRUD management system
- [ ] Develop Invoice builder with dynamic line items and tax logic
- [ ] Implement invoice status state machine
- [ ] Integrate FastAPI PDF generation service via ReportLab
- [ ] Setup Resend API for transactional emails
- [ ] Implement multi-currency support with Exchange Rate API integration
- [ ] Create automated sequential invoice numbering system

### Phase 3: Payments & Stripe (Week 6–7)
- [ ] Integrate Stripe SDK for payment link generation
- [ ] Build robust Stripe Webhook handler for `payment_intent.succeeded`
- [ ] Add manual payment recording for bank transfers/cash
- [ ] Implement partial payment logic and balance tracking
- [ ] Setup Celery workers for automated overdue reminders
- [ ] Create payment history audit logs for each invoice

### Phase 4: Cash Flow & ML Forecast (Week 8–10)
- [ ] Develop expense tracking module with receipt uploads
- [ ] Build Cash Flow dashboard with Recharts visualization
- [ ] Implement Prophet ML model for time-series forecasting
- [ ] Create FastAPI endpoints for 30/60/90-day predictions
- [ ] Integrate revenue vs. expense analytics
- [ ] Optimize Prophet parameters for seasonality (weekly/monthly)

### Phase 5: Client Portal & Polish (Week 11–12)
- [ ] Build secure token-based Client Portal (read-only access)
- [ ] Generate quarterly tax summary PDF reports
- [ ] Implement recurring invoice templates and scheduling
- [ ] Configure Role-Based Access Control (Admin vs. Accountant)
- [ ] Perform mobile responsiveness audit and UI optimization
- [ ] Deploy to Vercel/Railway and configure Sentry error tracking

---

## 4. FOLDER STRUCTURE

```text
invoice-app/ (Next.js)                  api-service/ (Python Backend)
├── app/                                ├── app/
│   ├── (auth)/                         │   ├── db/                     # DB Session & Queries
│   │   ├── login/                      │   │   ├── session.py
│   │   └── register/                   │   │   └── queries.py
│   ├── (dashboard)/                    │   ├── models/                 # SQLAlchemy Models
│   │   ├── layout.tsx                  │   │   └── forecast.py
│   │   ├── page.tsx                    │   ├── routers/                # API Endpoints
│   │   ├── invoices/                   │   │   ├── forecast.py
│   │   │   ├── page.tsx                │   │   ├── reports.py
│   │   │   ├── new/                    │   │   └── health.py
│   │   │   └── [id]/                   │   ├── services/               # Logic & ML
│   │   ├── clients/                    │   │   ├── forecast/
│   │   │   └── [id]/                   │   │   │   ├── prophet_model.py
│   │   ├── expenses/                   │   │   │   └── preprocessor.py
│   │   └── cashflow/                   │   │   ├── pdf_generator.py    # ReportLab Logic
│   ├── portal/                         │   │   └── email_service.py
│   │   └── [token]/page.tsx            │   ├── tasks/                  # Celery Background Jobs
│   │                                   │   │   ├── celery_app.py
│   │                                   │   │   └── reminder_tasks.py
│   └── api/                            │   └── main.py                 # FastAPI Entry
│       ├── auth/[...nextauth]/         ├── tests/                      # Pytest Suite
│       ├── invoices/                   ├── requirements.txt
│       ├── payments/                   ├── Dockerfile
│       └── webhook/stripe/             └── .env
├── components/                         
│   ├── ui/                             infra/ (Orchestration)
│   ├── invoices/                       ├── docker-compose.yml          # Local Stack
│   │   ├── InvoiceForm.tsx             ├── docker-compose.prod.yml     # Production Stack
│   │   └── LineItemsEditor.tsx         └── nginx/
│   ├── cashflow/                       └── nginx.conf              # Reverse Proxy
│   │   └── ForecastChart.tsx           
│   └── shared/                         
│       ├── Sidebar.tsx
│       ├── PageHeader.tsx
│       └── CurrencyInput.tsx
├── lib/                                
│   ├── prisma.ts                       
│   ├── stripe.ts                       
│   └── fastapi.ts                      
├── prisma/                             
│   └── schema.prisma                   
└── types/                              
    └── index.ts                        
```

---

## 5. DATABASE SCHEMA

| Table | Columns | Type | Notes |
| :--- | :--- | :--- | :--- |
| **users** | id, email, name, password_hash, role, currency, created_at | UUID, VARCHAR, ENUM, TIMESTAMP | Role: admin/accountant |
| **user_settings**| id, user_id, company_name, logo_url, tax_number, address, payment_terms | UUID, FK, VARCHAR, TEXT | 1:1 with users |
| **clients** | id, user_id, name, email, phone, address, currency, created_at | UUID, FK, VARCHAR, TEXT | Multi-currency per client |
| **invoices** | id, user_id, client_id, invoice_number, status, subtotal, tax_rate, total, currency, due_date, portal_token | UUID, FK, ENUM, DECIMAL, DATE | token for public portal access |
| **invoice_items**| id, invoice_id, description, quantity, unit_price, amount | UUID, FK, TEXT, DECIMAL | Line item details |
| **payments** | id, invoice_id, amount, method, status, stripe_payment_id, paid_at | UUID, FK, DECIMAL, ENUM | Stripe or Manual recording |
| **expenses** | id, user_id, category, description, amount, currency, expense_date, receipt_url | UUID, FK, VARCHAR, DECIMAL | Outflow tracking |
| **invoice_reminders**| id, invoice_id, type, scheduled_at, sent_at, is_sent | UUID, FK, ENUM, TIMESTAMP | Celery task tracking |

### Entity Relationship Summary
- **users** 1:1 **user_settings**
- **users** 1:N **clients**, **invoices**, **expenses**
- **clients** 1:N **invoices**
- **invoices** 1:N **invoice_items**, **payments**, **invoice_reminders**

---

## 6. API DESIGN

**Base URLs:**
- Next.js API: `/api/v1`
- FastAPI: `http://localhost:8000/api`

> **Note:** All routes require `Authorization: Bearer <JWT>` except `GET /portal/:token`.

### Invoices
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/invoices` | Create a new invoice with items |
| GET | `/invoices` | List invoices with filtering/search |
| GET | `/invoices/:id` | Get detailed invoice data |
| PUT | `/invoices/:id` | Update invoice/items |
| DELETE | `/invoices/:id` | Soft delete invoice |
| GET | `/invoices/:id/pdf` | Proxy to FastAPI PDF generator |
| POST | `/invoices/:id/send` | Trigger email delivery to client |
| POST | `/invoices/:id/duplicate`| Clone an existing invoice |

### Cash Flow (FastAPI)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/forecast` | Get 30/60/90 day Prophet predictions |
| GET | `/reports/tax-summary` | Generate quarterly tax PDF data |
| GET | `/reports/revenue` | Aggregate revenue by month/category |

### JSON Examples

**POST /api/v1/invoices (Request Body)**
```json
{
  "clientId": "c7b3d8e0-...",
  "invoiceNumber": "INV-2024-001",
  "dueDate": "2024-12-31",
  "currency": "USD",
  "taxRate": 10.0,
  "items": [
    {
      "description": "Software Development",
      "quantity": 40,
      "unitPrice": 120.0
    }
  ],
  "notes": "Thank you for your business!"
}
```

**GET /api/forecast (Response)**
```json
{
  "summary": {
    "trend": "upward",
    "growth_rate": 0.12,
    "confidence_score": 0.89
  },
  "data": [
    { "date": "2024-11-01", "predicted_income": 12500.50, "lower_bound": 11800, "upper_bound": 13200 },
    { "date": "2024-12-01", "predicted_income": 14200.00, "lower_bound": 13000, "upper_bound": 15500 }
  ]
}
```

---

## 7. ENVIRONMENT VARIABLES

### Next.js (.env.local)
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/invoice_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
RESEND_API_KEY="re_..."
FASTAPI_URL="http://localhost:8000"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

### FastAPI (.env)
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/invoice_db"
REDIS_URL="redis://localhost:6373/0"
SECRET_KEY="your-python-secret"
RESEND_API_KEY="re_..."
EXCHANGE_RATE_API_KEY="your-ex-key"
```

---

## 8. GETTING STARTED

### Prerequisites
- **Node.js** 20.x or higher
- **Python** 3.11+
- **Docker** & Docker Compose
- **PostgreSQL** 15+ (if not using Docker)

### Installation Steps
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-org/invoice-manager.git
    cd invoice-manager
    ```
2.  **Start Infrastructure:**
    ```bash
    docker-compose up -d  # Starts Postgres & Redis
    ```
3.  **Setup Next.js:**
    ```bash
    cd invoice-app
    npm install
    cp .env.example .env.local
    npx prisma migrate dev
    npx prisma db seed
    npm run dev
    ```
4.  **Setup FastAPI:**
    ```bash
    cd ../api-service
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    cp .env.example .env
    uvicorn app.main:app --reload
    ```
5.  **Setup Stripe Webhook:**
    ```bash
    stripe listen --forward-to localhost:3000/api/webhook/stripe
    ```

---

## 9. DEVELOPMENT COMMANDS

### Next.js & Prisma
```bash
npm run dev          # Start development server
npm run build        # Build for production
npx prisma studio    # UI to view database
npx prisma migrate   # Push schema changes
```

### FastAPI & Python
```bash
uvicorn app.main:app --reload            # Start API
pytest                                   # Run test suite
celery -A app.tasks.celery_app worker    # Start Celery worker
```

### Docker
```bash
docker-compose up -d    # Spin up stack
docker-compose logs -f  # Tail logs
docker-compose down     # Stop all services
```

---

## 10. DEPLOYMENT

### Vercel (Next.js)
1. Link your GitHub repository to Vercel.
2. Add all `.env.local` variables in the Project Settings.
3. Set the build command: `npx prisma generate && next build`.
4. Deploy from the `main` branch.

### Railway (FastAPI + DB)
1. Create a new project and provision a **PostgreSQL** and **Redis** instance.
2. Deploy the `api-service` folder as a separate service.
3. Configure the `PORT` variable to `8000`.
4. Railway will automatically detect the `Dockerfile` and deploy.
5. Link the DB URL from the provisioned Postgres instance to both Next.js and FastAPI services.

---
*Built with Next.js 14, FastAPI, Facebook Prophet, Prisma, and Stripe.*
