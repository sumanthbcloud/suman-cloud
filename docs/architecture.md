# SUMAN Architecture Documentation

## 1. Project Context & Philosophy

**SUMAN** is a personal cloud-storage application designed primarily for **DevOps, cloud engineering, and interview practice**.

The core engineering rule is:
> **"Is this actually required for this demo?"**
>
> If not, do not add it. Keep the frontend and backend intentionally small, easy to understand, interview-friendly, and professionally engineered. Avoid production-scale complexity that does not serve the learning objective.

---

## 2. Deployment Architecture (Amazon EC2 + Docker Compose)

The initial deployment runs on a **single Amazon EC2 instance** orchestrated via **Docker Compose**:

```
                              User / Browser
                                    │
                                    │ HTTPS (Port 443 / 80)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Amazon EC2 Instance                             │
│                                                                        │
│   Docker Compose Network                                               │
│   ┌─────────────────────┐       REST / JSON      ┌─────────────────┐   │
│   │  frontend container │ ─────────────────────> │ backend container│  │
│   │  (React build on    │                        │ (Spring Boot /  │   │
│   │   Nginx)            │                        │  Java 21)       │   │
│   └─────────────────────┘                        └────────┬────────┘   │
│                                                           │            │
│                                          JDBC Connection  │            │
│                                                           ▼            │
│                                                  ┌─────────────────┐   │
│                                                  │ postgres        │   │
│                                                  │ container       │   │
│                                                  │ (Official image)│   │
│                                                  └────────┬────────┘   │
│                                                           │            │
│                                        Named Volume       ▼            │
│                                                  [postgres_data]       │
└───────────────────────────────────┬──────────────────────┬─────────────┘
                                    │                      │
                   AWS SDK (IAM Role)                      │ AWS SDK (IAM Role)
                                    ▼                      ▼
                        ┌──────────────────────┐┌──────────────────────┐
                        │      Amazon S3       ││      Amazon SES      │
                        │  (Binary File Store) ││  (OTP / Email Auth)  │
                        └──────────────────────┘└──────────────────────┘
```

### Initial Deployment Rules
- **No Amazon RDS in the initial version**: PostgreSQL runs as an official Docker container inside Compose, with data persisted via a named volume (`postgres_data`). RDS is reserved strictly as a future evolution.
- **External AWS Managed Services**:
  - **Amazon S3**: Stores binary file payloads (photos, videos, audio, documents).
  - **Amazon SES**: Delivers signup and verification OTP emails.
- **AWS Authentication via EC2 IAM Role**:
  - The EC2 instance assumes an IAM Instance Role granting minimal permissions for S3 bucket access and SES email sending.
  - No static AWS access keys or secrets are stored in the codebase or environment files.
- **Network Isolation**: PostgreSQL is on the internal Compose network and not exposed to the public internet.

---

## 3. Data Tier Responsibilities

| Tier | Component | Contents Stored |
|---|---|---|
| **Relational Database** | PostgreSQL Container (`postgres:16-alpine`) | User profiles, authentication records, file metadata (filename, MIME type, category, file size, S3 object key, ownership, timestamps). |
| **Object Storage** | Amazon S3 | Real uploaded binary files (photos, videos, audio, documents). |

> **Critical Rule**: Binary files are **never** stored directly in PostgreSQL. PostgreSQL stores only metadata and object key pointers to S3.

---

## 4. Backend Engineering Structure

The backend is built as **one clean Spring Boot application** (Java 21, Maven).

### Simple Layered Flow:
- **General Database Operations**: `Controller` → `Service` → `Repository` → `PostgreSQL`
- **File Upload / Download**: `Controller` → `Service` → `Amazon S3`
- **Email Verification**: `Controller` → `Service` → `Amazon SES`

### Package Structure:
```
com.suman.cloud
├── config/         # Cross-cutting configs (WebMvc, CORS, Security)
├── health/         # System health endpoint (/api/health)
├── controller/     # REST request endpoints (added as features arrive)
├── service/        # Domain business logic (added as features arrive)
├── repository/     # Spring Data JPA repositories (added as features arrive)
├── entity/         # Database entity models (added as features arrive)
└── dto/            # Request and response data records
```
*Packages are created only when their functionality is actually implemented.*

---

## 5. Frontend Engineering Structure

The frontend is a lightweight **React 19 + TypeScript + Vite + Tailwind CSS** application.

### Simplicity Constraints:
- No complex state management libraries (Redux, Zustand) — standard React component state is sufficient.
- No heavy component design systems or complex factory abstractions.
- Simple, professional consumer UI: light theme, clean typography, generous whitespace, single primary Upload button, simple sidebar navigation.
- In production, built into static assets and served through Nginx inside a lightweight Docker container.

---

## 6. Target CI/CD Direction (Planned)

Small caller workflows in `.github/workflows/`:
- `frontend-ci.yml`
- `backend-ci.yml`

Stages:
```
Checkout → Gitleaks → Setup Runtime → Build/Test → Docker Build → Trivy Scan → Docker Hub Login → Docker Hub Push
```
- Image tags use immutable Git commit SHAs.
- Deployment targets EC2 running Docker Compose.
