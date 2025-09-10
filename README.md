# Bank Recon Service

## 1. Overview

This project is a **Bank Reconciliation Service** that follows modern software development principles and best practices. Key principles applied include:

* **SOLID Principles:** Ensuring maintainable and extensible code.
* **DRY (Don't Repeat Yourself):** Avoiding redundant code.
* **KISS (Keep It Simple, Stupid):** Keeping code simple and clear.
* **Modular Design:** Each module has a single responsibility, making testing and maintenance easier.

Design patterns used:

* **Repository Pattern:** Abstracts database operations.
* **Factory Pattern:** Creates objects without exposing creation logic.
* **Middleware Pattern:** Handles request/response pipelines.

---
## 2. Solution diagram 

| Bank ABC (Client User) | Bank Reconciliation System (API) | PostgreSQL DB (Render) |
|------------------------|---------------------------------|------------------------|
| - Upload CSV/XLS       | - Auth Middleware               | - Transactions         |
| - List Transactions    | - Token validation              | - User Accounts        |
|                        | - Import Service                |                        |
|                        | - Transaction Service           |                        |
|                        | - CSV/XLS Parser                |                        |
|                        | - Batch Processing              |                        |
|                        | - API Endpoints:                |                        |
|                        |    - /register                  |                        |
|                        |    - /login                     |                        |
|                        |    - /import-transactions       |                        |
|                        |    - /list-transactions         |                        |
|                        | - Redis (Upstash)               |                        |
|                        |    - Store session tokens       |                        |
|                        |    - Token expiration           |                        |

### Flow

1. **User Registration/Login**  
   - User registers or logs in → API validates → token stored in Redis → returned to user.

2. **Upload CSV/XLS**  
   - User uploads CSV/XLS → API validates token → CSV parsed → Transactions stored in PostgreSQL in batches.

3. **List Transactions**  
   - User calls list transactions → API validates token → fetch from PostgreSQL → return result.

---

## 2. Folder Structure (Monorepo)

This project uses a **monorepo** structure with `apps` and `packages` folders as follows:

```
project-root/
│
├─ apps/
│   └─ bank-recon-service/        # Main API service
│       ├─ dist/                  # Compiled output
│       ├─ node_modules/          # Dependencies
│       ├─ prisma/                # Prisma models and migrations
│       ├─ src/                   # Source code
│       ├─ test/                  # Unit and integration tests
│       ├─ .env                   # Environment variables
│       ├─ package.json            # App-specific dependencies and scripts
│       ├─ tsconfig.json           # TypeScript configuration
│       └─ jest.config.js          # Test configuration
│
├─ packages/
│   └─ zod-validator              # Shared validator package
|
├─ node_modules/
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ .prettierrc
└─ .editorconfig
└─ README.md                      # Project documentation
```

### Key Libraries and Frameworks

* **Node.js + TypeScript** – Backend runtime and language.
* **Hono** – Framework for building APIs.
* **Prisma** – ORM for PostgreSQL database access.
* **PostgreSQL** – Relational database.
* **Redis** – In-memory cache for fast data retrieval.
* **Zod** – Schema validation for request/response data.
* **Supertest / Jest** – Testing framework for APIs.

---

## 3. Getting Started

Follow these steps to run the application locally:

1. **Clone the repository**

```bash
git clone https://github.com/LeQuocMiinh/bank-recon-service.git
cd bank-recon-service
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set environment variables**

Create a `.env` file in the `apps/bank-recon-service` folder:

```env
DATABASE_URL="<YOUR DB URL>"

JWT_SECRET="<YOUR JWT SECRECT>"
EXPIRES_IN="1h"

REDIS_URL="<YOUR REDIS URL>"
 
```

4. **Run database migrations**

```bash
pnpm migrate
```

5. **Start the development server**

```bash
pnpm start
```
The server should now be running at `http://localhost:3000`.

6. **Run test e2e**

```bash
pnpm test
```

---

## 4. Testing APIs with CURL

### POST /auth/register

```bash
curl --location 'http://localhost:3000/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "minh@gmail.com",
    "password": "123456"
}'
```

### POST /auth/login

```bash
curl --location 'http://localhost:3000/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "minh@gmail.com",
    "password": "123456"
}'
```

### POST /transactions/import (Upload CSV)

```bash
curl --location 'http://localhost:3000/transaction/import' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWluaEBnbWFpbC5jb20iLCJpYXQiOjE3NTc1MTQwOTUsImV4cCI6MTc1NzUxNzY5NX0.-O7kVq-gR6oZ2uS0118Ia200BjVzsUII_Ou_tD1-xzo' \
--form 'file=@"/home/mistake/Desktop/data - Trang tính1.csv"'
```

### GET /transactions/list

```bash
curl --location 'http://localhost:3000/transaction/list?limit=1&page=1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWluaEBnbWFpbC5jb20iLCJpYXQiOjE3NTc1MDg0MjAsImV4cCI6MTc1NzUxMjAyMH0.629hlX3MVQcetqjZ-DJqkqiXb9k0IBLoox_pc2kbSo0'
```

## 5. API Documentation (Swagger / OpenAPI)
### Access Swagger UI 
```bash
http://localhost:3000/swagger/ui
```
### Access Swagger Documents
```bash
http://localhost:3000/swagger/docs
```
### Access Swagger OpenAPI 
```bash
http://localhost:3000/swagger/openapi
```