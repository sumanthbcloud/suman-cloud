# SUMAN — Personal Cloud Storage

A modern, interview-friendly personal cloud storage web application built primarily for **DevOps, cloud engineering, Docker Compose, and AWS practice**.

---

## Architecture Overview

The initial deployment architecture is intentionally simple, small, and robust:

- **Host**: Single Amazon EC2 instance running Docker Compose
- **Docker Compose Services**:
  1. `frontend` (React + TypeScript + Vite, served via Nginx with `/api/` reverse proxy)
  2. `backend` (Java 21 + Spring Boot + Maven REST service)
  3. `postgres` (Official `postgres:16-alpine` container persisted with named volume `postgres_data`)
- **External AWS Services**:
  - **Amazon S3**: For uploaded user binary objects (photos, videos, audio, documents)
- **AWS Authentication**: EC2 IAM Instance Role (no static AWS keys stored in code or config)

> **Important**: Amazon RDS is NOT used in the initial architecture. PostgreSQL is the application database and will run as the PostgreSQL Docker Compose service on EC2. RDS is reserved only as a future architecture evolution.

---

## Monorepo Layout

```
SUMAN/
├── frontend/             # React + TypeScript + Vite + Tailwind CSS UI
│   ├── src/
│   │   ├── components/   # Simple, reusable UI components & modal preview
│   │   ├── layouts/      # AppLayout, Sidebar, Topbar
│   │   ├── pages/        # LoginPage, SignupPage, DashboardPage
│   │   ├── services/     # API client, authService, fileService
│   │   └── types/        # TypeScript interfaces & domain types
│   ├── Dockerfile        # Multi-stage Node 20 build -> Nginx Alpine
│   ├── nginx.conf        # Nginx proxy config (/api/ -> backend:8080)
│   ├── package.json
│   └── vite.config.ts
├── backend/              # Java 21 Spring Boot REST service
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/suman/cloud/
│   │   │   │   ├── auth/            # Signup & Login endpoints and service
│   │   │   │   ├── config/          # WebMvc, CORS, GlobalExceptionHandler
│   │   │   │   ├── file/            # FileController, FileService, FileRecord
│   │   │   │   ├── health/          # Health check endpoint (/api/health)
│   │   │   │   ├── security/        # JWT service, filter, SecurityConfig
│   │   │   │   ├── user/            # User entity & UserRepository
│   │   │   │   └── SumanApplication.java
│   │   │   └── resources/
│   │   │       └── application.yml  # Datasource & AWS configuration
│   │   └── test/java/com/suman/cloud/
│   ├── Dockerfile        # Multi-stage Temurin 21 JDK build -> JRE Alpine
│   ├── mvnw
│   └── pom.xml
├── .github/
│   └── workflows/
│       ├── reusable-ci.yml  # Checkout -> Gitleaks -> Build/Test -> Docker -> Trivy -> Push
│       ├── frontend-ci.yml  # Caller workflow for frontend
│       └── backend-ci.yml   # Caller workflow for backend
├── docker-compose.yml    # Single EC2 orchestration running frontend, backend, postgres
├── .env.example          # Safe environment variable template
├── docs/                 # System architecture and specifications
│   └── architecture.md
├── README.md
└── .gitignore
```

---

## EC2 Production Deployment

Docker images are built, tested, vulnerability-scanned by Trivy, and pushed to Docker Hub by GitHub Actions. EC2 pulls and runs these verified container images directly.

### 1. Initial Setup on EC2

```bash
# Clone the repository
git clone <repo-url> suman-cloud
cd suman-cloud

# Prepare environment configuration
cp .env.example .env
nano .env  # Enter your JWT_SECRET, S3_BUCKET, and DOCKERHUB_USERNAME
```

### 2. Run Application

```bash
docker compose pull
docker compose up -d
```

### 3. Deploy Updates

When updates are pushed and published by CI:

```bash
docker compose pull
docker compose up -d
```

---

## Local Development

### 1. Running the Backend

```bash
cd backend

# Run tests
./mvnw clean test

# Run Spring Boot (port 8080)
./mvnw spring-boot:run
```

Health check:
```bash
curl http://localhost:8080/api/health
# {"status":"UP"}
```

### 2. Running the Frontend

```bash
cd frontend

npm install
npm run dev
```

---

## Environment Configuration

| Variable | Default Value | Description |
|---|---|---|
| `POSTGRES_DB` | `suman` | Database name |
| `POSTGRES_USER` | `suman` | Database username |
| `POSTGRES_PASSWORD` | `change-me` | Database password |
| `DB_HOST` | `postgres` | Database hostname (`localhost` for local dev outside Docker) |
| `DB_PORT` | `5432` | Database port |
| `JWT_SECRET` | *(random secret)* | Key for signing JWTs (256-bit or longer) |
| `AWS_REGION` | `us-east-1` | AWS Region for S3 |
| `S3_BUCKET` | `your-suman-bucket` | Amazon S3 bucket name |
| `DOCKERHUB_USERNAME`| `sumanthb9908` | Docker Hub username for pulling images |
| `IMAGE_TAG` | *(git-commit-sha)* | Image version tag (Git commit SHA) |

---

## GitHub Actions CI Configuration

Configured under GitHub repository **Settings** → **Secrets and variables** → **Actions**:

- **Repository Variable**: `DOCKERHUB_USERNAME = sumanthb9908`
- **Repository Secret**: `DOCKERHUB_TOKEN = <dockerhub-access-token>`
