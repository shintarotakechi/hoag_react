# AI-Accelerated Full Stack Engineer - Local Development System Design

## System Overview

This is a local-first, event-driven full-stack application designed to demonstrate end-to-end ownership from frontend to backend to infrastructure. The system is built to run entirely on localhost, using local alternatives to cloud services, with a clear migration path to production-ready cloud infrastructure.

## Core Principles

- **Local-First Development**: Everything runs on localhost (no external dependencies)
- **Event-Driven Architecture**: Decoupled, scalable systems using local message queues
- **Full-Stack Ownership**: Single engineer responsible for architecture, development, testing, deployment, and monitoring
- **AI-Accelerated Workflow**: Leverage AI tools to 10x development speed without cutting corners
- **Startup Mindset**: Move fast, iterate on MVPs, make sound tradeoffs under uncertainty

## Tech Stack (Local Implementation)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS or CSS Modules
- **State Management**: Zustand or React Context (local state, no Redux needed initially)
- **Form Handling**: React Hook Form + Zod validation

### Backend Services
- **Primary API**: Node.js with Express or Fastify
- **Language**: TypeScript (for consistency)
- **Alternative**: Python FastAPI (for ML/AI features or specific use cases)
- **API Design**: RESTful APIs with OpenAPI/Swagger documentation
- **Validation**: Zod schemas (shared between frontend/backend)

### Event-Driven Architecture (Local)
- **Message Queue**: RabbitMQ (via Docker) or Redis Pub/Sub
- **Alternative**: Redis Streams for simple pub/sub
- **Event Store**: Local file-based event log or SQLite for development
- **Event Bus**: Custom event emitter pattern or BullMQ (Redis-based)

### Database
- **Primary**: PostgreSQL (via Docker)
- **Alternative**: SQLite for ultra-simple local dev
- **ORM**: Prisma (TypeScript) or SQLAlchemy (Python)
- **Migrations**: Prisma Migrate or Alembic

### Vector Database (Future AI Features)
- **Local Option**: ChromaDB (local embedding storage)
- **Alternative**: PostgreSQL with pgvector extension
- **For RAG**: Local embedding models (via transformers.js or Ollama)

### Infrastructure (Local)
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Docker Compose for multi-service setup
- **Local Development**: Hot reload for both frontend and backend
- **Environment Management**: `.env` files with different configs per environment

### AI/ML Tools Integration
- **LangChain**: For AI workflows (runs locally or via API)
- **Embeddings**: Local models (Ollama, transformers.js) or OpenAI API (when needed)
- **Vector Search**: ChromaDB or pgvector for local RAG
- **AI-Assisted Development**: GitHub Copilot, Cursor AI integration

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Pages/     │  │  Components  │  │   API Routes │        │
│  │   Routes     │  │              │  │   (Server)   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└───────────────────────────┬───────────────────────────────────┘
                             │ HTTP/REST
┌───────────────────────────▼───────────────────────────────────┐
│                  API Gateway Layer (Node.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Auth       │  │  Validation  │  │   Routing    │        │
│  │   Middleware │  │  Middleware  │  │   Handler    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└───────────────────────────┬───────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  Business      │  │  Event          │  │  External      │
│  Logic         │  │  Publisher      │  │  Service      │
│  Services      │  │                 │  │  (Future)      │
└───────┬────────┘  └────────┬────────┘  └────────────────┘
        │                    │
        │                    │ Events
        │            ┌───────▼────────┐
        │            │  Message Queue │
        │            │  (RabbitMQ/    │
        │            │   Redis)       │
        │            └───────┬────────┘
        │                    │
        └────────────────────┼────────────────────┐
                             │                    │
                    ┌────────▼────────┐  ┌───────▼────────┐
                    │  Event           │  │  Background     │
                    │  Consumers       │  │  Workers        │
                    │                  │  │  (Python/Node)  │
                    └────────┬─────────┘  └───────┬────────┘
                             │                    │
                    ┌────────▼────────────────────▼────────┐
                    │         Data Layer                    │
                    │  ┌──────────┐  ┌──────────────┐    │
                    │  │PostgreSQL │  │  Vector DB   │    │
                    │  │           │  │  (ChromaDB/  │    │
                    │  │           │  │  pgvector)   │    │
                    │  └──────────┘  └──────────────┘    │
                    └─────────────────────────────────────┘
```

## Project Structure

```
hoag/
├── frontend/                 # Next.js application
│   ├── app/                  # App Router (Next.js 13+)
│   │   ├── (routes)/          # Route groups
│   │   ├── api/             # API routes
│   │   └── layout.tsx
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   └── features/        # Feature-specific components
│   ├── lib/                 # Utilities, helpers
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   ├── styles/              # Global styles
│   └── public/              # Static assets
│
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── events/          # Event publishers/consumers
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utilities
│   │   └── types/           # TypeScript types
│   └── tests/               # Backend tests
│
├── services/                 # Microservices (Python/Node)
│   ├── event-processor/     # Event consumer service
│   ├── background-worker/   # Background job processor
│   └── ai-service/          # AI/ML service (future)
│
├── shared/                   # Shared code
│   ├── types/               # Shared TypeScript types
│   ├── schemas/             # Zod validation schemas
│   └── constants/           # Shared constants
│
├── database/                 # Database related
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Seed data
│   └── prisma/              # Prisma schema & client
│
├── docker/                   # Docker configuration
│   ├── docker-compose.yml   # Local development stack
│   └── Dockerfile.*         # Service-specific Dockerfiles
│
├── scripts/                  # Utility scripts
│   ├── setup.sh             # Initial setup script
│   ├── dev.sh               # Start development environment
│   └── seed.sh              # Seed database
│
├── docs/                     # Documentation
│   ├── api/                 # API documentation
│   ├── architecture/        # Architecture decisions
│   └── deployment/          # Deployment guides
│
├── .env.example              # Environment variables template
├── .gitignore
├── package.json              # Root package.json (workspace)
├── tsconfig.json             # TypeScript config
└── README.md
```

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- Docker & Docker Compose
- Python 3.11+ (optional, for Python services)
- Git

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repo>
   cd hoag
   npm install  # or pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with local configuration
   ```

3. **Start Infrastructure (Docker)**
   ```bash
   docker-compose up -d
   # Starts: PostgreSQL, RabbitMQ/Redis, etc.
   ```

4. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:seed  # Optional
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev:frontend
   
   # Terminal 2: Backend API
   npm run dev:backend
   
   # Terminal 3: Event Workers (optional)
   npm run dev:workers
   ```

## Event-Driven Architecture (Local)

### Event Flow Example

1. **Frontend Action** → User creates a resource via Next.js form
2. **API Call** → Next.js API route or external API server receives request
3. **Business Logic** → Service processes request, saves to database
4. **Event Published** → Service publishes event to message queue
5. **Event Consumed** → Worker service consumes event
6. **Side Effects** → Worker performs async operations (notifications, analytics, etc.)

### Local Message Queue Setup

**Option 1: RabbitMQ (Docker)**
```yaml
# docker-compose.yml
rabbitmq:
  image: rabbitmq:3-management
  ports:
    - "5672:5672"  # AMQP
    - "15672:15672"  # Management UI
```

**Option 2: Redis Streams (Redis)**
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

### Event Schema
```typescript
// shared/types/events.ts
interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  version: string;
}

interface UserCreatedEvent extends BaseEvent {
  type: 'user.created';
  data: {
    userId: string;
    email: string;
  };
}
```

## Development Workflow

### Feature Development Cycle

1. **Define MVP** → Quick architecture sketch, identify core user flow
2. **Implement** → Build feature end-to-end (frontend → backend → events)
3. **Test Locally** → Manual testing + unit tests + integration tests
4. **Iterate** → Refine based on feedback, optimize performance
5. **Document** → Update API docs, add code comments

### AI-Accelerated Practices

- **Code Generation**: Use AI to scaffold components, API routes, tests
- **Debugging**: AI-assisted error analysis and solution generation
- **Refactoring**: AI suggestions for code improvement
- **Documentation**: Auto-generate API docs, code comments
- **Testing**: Generate test cases from specifications

## Testing Strategy (Local)

### Unit Tests
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest or Vitest
- **Services**: pytest (Python) or Jest (Node)

### Integration Tests
- **API Tests**: Supertest (Node.js) or pytest (Python)
- **Database Tests**: Test database with migrations
- **Event Tests**: Mock message queue or use test instance

### E2E Tests (Optional)
- **Playwright**: Browser-based testing
- **Test Database**: Separate test PostgreSQL instance

## Monitoring & Observability (Local)

### Logging
- **Frontend**: Console logs + structured logging
- **Backend**: Winston or Pino (structured JSON logs)
- **Services**: Python logging with structured format

### Metrics (Future)
- **Prometheus**: Local metrics collection
- **Grafana**: Local dashboard (via Docker)

### Error Tracking
- **Local Log Files**: Structured error logging
- **Future**: Sentry or similar (when moving to production)

## Migration Path to Production

### Phase 1: Local Development ✅ (Current)
- Everything runs on localhost
- Docker Compose for services
- Local databases and message queues

### Phase 2: Containerized Local → Cloud
- Replace Docker Compose with Kubernetes (local)
- Add CI/CD pipelines
- Container registry setup

### Phase 3: Cloud Migration
- **AWS Services**:
  - RDS (PostgreSQL)
  - ElastiCache (Redis) or Amazon MQ (RabbitMQ)
  - EventBridge (event bus)
  - SQS/SNS (message queues)
  - Lambda (serverless workers)
  - ECS/EKS (container orchestration)

### Phase 4: Production Features
- HIPAA/PHI compliance (healthcare use case)
- Multi-region deployment
- Advanced monitoring (CloudWatch, Datadog)
- Security hardening
- Performance optimization

## Key Deliverables

### MVP Features
1. **Authentication System**: Local JWT-based auth
2. **CRUD Operations**: Full-stack feature with validation
3. **Event-Driven Flow**: Async processing via message queue
4. **Database Integration**: Prisma + PostgreSQL
5. **API Documentation**: OpenAPI/Swagger

### Future Enhancements
1. **AI/ML Integration**: LangChain, RAG pipelines
2. **Vector Search**: Semantic search capabilities
3. **Real-time Features**: WebSockets or Server-Sent Events
4. **Background Jobs**: Scheduled tasks, batch processing
5. **File Storage**: Local storage → S3 migration path

## Success Metrics

- **Development Velocity**: Fast iteration cycles (hours, not days)
- **Code Quality**: Type-safe, well-tested, documented
- **System Reliability**: Handles errors gracefully
- **Performance**: Sub-200ms API responses, fast page loads
- **Developer Experience**: Easy local setup, clear documentation

## Next Steps

1. Set up project structure
2. Configure Docker Compose for local services
3. Initialize Next.js frontend and Node.js backend
4. Set up Prisma with PostgreSQL
5. Implement basic event-driven flow
6. Add AI/ML capabilities (LangChain, vector DB)
7. Document and iterate

---

**Note**: This system is designed to be built incrementally. Start with the MVP, validate, then add complexity. The local-first approach ensures rapid development without external dependencies blocking progress.

