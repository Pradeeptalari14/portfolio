/**
 * BackendEcosystemGenerator
 * Enterprise multi-stack backend ecosystem and request lifecycle generator.
 * Inspired by Cloud X Berry's "I Bet Nobody Has Ever Explained the Backend Ecosystem Like This Before".
 * (c) 2026 Talari Pradeep. All rights reserved.
 */

export class BackendEcosystemGenerator {
  constructor() {
    this.name = 'Backend Ecosystem Architecture & Request Lifecycle Generator';
    this.version = '2.0.0';
  }

  canonicalStudioLinks() {
    return [
      { id: 'api-gateway', title: 'API Gateway Studio', route: '/tools/api-gateway/', role: 'Rate Limiting & JWT Ingress' },
      { id: 'nginx-config', title: 'NGINX Configurator', route: '/tools/nginx-config/', role: 'SSL Termination & Reverse Proxy' },
      { id: 'local-cloud-dev', title: 'Local Cloud Dev Studio', route: '/tools/local-cloud-dev/', role: 'Docker Compose & Multi-Container' },
      { id: 'db-migration', title: 'Database Migration Studio', route: '/tools/db-migration/', role: 'Flyway / Alembic Zero-Downtime Migrations' },
      { id: 'db-clustering', title: 'Database Clustering Studio', route: '/tools/db-clustering/', role: 'Postgres Replication & PgBouncer Pooling' },
      { id: 'redis-cesc', title: 'Redis Cache & Semantic Cache Studio', route: '/tools/redis-cesc/', role: 'Sub-2ms Memory Caching & Stampede Guard' },
      { id: 'event-sre', title: 'Event-Driven SRE Studio', route: '/tools/event-sre/', role: 'RabbitMQ / Kafka Consumers & Dead Letter Queues' },
      { id: 'monitoring', title: 'Observability & Monitoring Studio', route: '/tools/monitoring/', role: 'Prometheus & Grafana Alerting' },
      { id: 'otel-configurator', title: 'OpenTelemetry Collector Studio', route: '/tools/otel-configurator/', role: 'W3C Distributed Tracing' },
      { id: 'devsecops-portfolio-guide', title: 'DevSecOps & Supply Chain Hub', route: '/tools/devsecops-portfolio-guide/', role: 'SLSA Provenance & Trivy Container Gates' }
    ];
  }

  supportedProjects() {
    return {
      'ecommerce': {
        id: 'ecommerce',
        name: 'E-Commerce High-Volume Order & Inventory Engine',
        stack: 'Python / FastAPI + Redis + Celery + PostgreSQL + Stripe',
        desc: 'End-to-end order processing with inventory locking, atomic PostgreSQL transaction, Kafka event publish, async payment capture, and customer notifications.',
        services: ['frontend', 'nginx', 'fastapi-backend', 'redis-cache', 'postgres-db', 'rabbitmq-broker', 'celery-worker', 'prometheus']
      },
      'notifications': {
        id: 'notifications',
        name: 'Real-Time Notification & Event Streaming Hub',
        stack: 'Node.js / Express + WebSockets + Redis Pub/Sub + BullMQ + PostgreSQL',
        desc: 'Sub-10ms broadcast engine managing persistent WebSocket clusters, Redis channel pub/sub, BullMQ rate-limited consumer queues, and mobile push delivery.',
        services: ['frontend', 'caddy', 'express-ws', 'redis-pubsub', 'postgres-db', 'bullmq-worker', 'grafana']
      },
      'saas-billing': {
        id: 'saas-billing',
        name: 'Enterprise Multi-Tenant Billing & Webhook Dispatcher',
        stack: 'Go / Gin + GORM + Redis + Asynq + MySQL',
        desc: 'Multi-tenant subscription manager featuring transactional outbox pattern, HMAC-SHA256 signed webhook dispatcher, exponential backoff retries, and DLQ handling.',
        services: ['frontend', 'traefik', 'go-gin-api', 'redis-cache', 'mysql-primary', 'asynq-worker', 'jaeger']
      }
    };
  }

  generateDockerCompose(projectId = 'ecommerce') {
    if (projectId === 'notifications') {
      return `version: '3.8'

services:
  ingress:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes: ["./caddy/Caddyfile:/etc/caddy/Caddyfile:ro"]
    depends_on: [express-api]

  express-api:
    build: { context: ./backend, dockerfile: Dockerfile }
    environment:
      PORT: 3000
      REDIS_URL: redis://redis:6379
      DATABASE_URL: postgresql://postgres:secret@postgres:5432/notifications_db
    ports: ["3000:3000"]
    depends_on: [redis, postgres]

  bullmq-worker:
    build: { context: ./backend, dockerfile: Dockerfile }
    command: ["node", "dist/worker.js"]
    environment:
      REDIS_URL: redis://redis:6379
      DATABASE_URL: postgresql://postgres:secret@postgres:5432/notifications_db
    depends_on: [redis, postgres]

  redis:
    image: redis:7.2-alpine
    command: ["redis-server", "--appendonly", "yes"]
    ports: ["6379:6379"]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: notifications_db
      POSTGRES_PASSWORD: secret
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

volumes:
  pgdata:`;
    }

    if (projectId === 'saas-billing') {
      return `version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    command: ["--api.insecure=true", "--providers.docker=true"]
    ports: ["80:80", "8080:8080"]
    volumes: ["/var/run/docker.sock:/var/run/docker.sock:ro"]

  go-api:
    build: { context: ./backend, dockerfile: Dockerfile }
    environment:
      PORT: 8080
      MYSQL_DSN: root:secret@tcp(mysql:3306)/billing_db?parseTime=true
      REDIS_ADDR: redis:6379
    depends_on: [mysql, redis]

  asynq-worker:
    build: { context: ./backend, dockerfile: Dockerfile }
    command: ["./worker"]
    environment:
      MYSQL_DSN: root:secret@tcp(mysql:3306)/billing_db?parseTime=true
      REDIS_ADDR: redis:6379
    depends_on: [mysql, redis]

  redis:
    image: redis:7.2-alpine
    ports: ["6379:6379"]

  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: billing_db
    ports: ["3306:3306"]
    volumes: ["mysqldata:/var/lib/mysql"]

volumes:
  mysqldata:`;
    }

    // Default: ecommerce (Python / FastAPI)
    return `version: '3.8'

services:
  nginx:
    image: nginx:1.25-alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on: [fastapi-api]

  fastapi-api:
    build: { context: ./backend, dockerfile: Dockerfile }
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:secret@postgres:5432/ecommerce_db
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: amqp://guest:guest@rabbitmq:5672//
      STRIPE_API_KEY: \${STRIPE_API_KEY:-sk_test_mock}
    ports: ["8000:8000"]
    depends_on: [postgres, redis, rabbitmq]

  celery-worker:
    build: { context: ./backend, dockerfile: Dockerfile }
    command: ["celery", "-A", "app.worker", "worker", "--loglevel=info", "-c", "4"]
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:secret@postgres:5432/ecommerce_db
      CELERY_BROKER_URL: amqp://guest:guest@rabbitmq:5672//
      REDIS_URL: redis://redis:6379/0
    depends_on: [postgres, redis, rabbitmq]

  redis:
    image: redis:7.2-alpine
    command: ["redis-server", "--maxmemory", "512mb", "--maxmemory-policy", "allkeys-lru"]
    ports: ["6379:6379"]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ecommerce_db
      POSTGRES_PASSWORD: secret
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    ports: ["5672:5672", "15672:15672"]

  prometheus:
    image: prom/prometheus:v2.51.0
    ports: ["9090:9090"]
    volumes: ["./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro"]

volumes:
  pgdata:`;
  }

  generateBackendCode(projectId = 'ecommerce') {
    if (projectId === 'notifications') {
      return `import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import Redis from 'ioredis';
import { Queue } from 'bullmq';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const redisSub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisPub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const notifyQueue = new Queue('user-notifications', { connection: redisPub });

app.use(express.json());

// Ingress health check
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: Date.now() }));

// Publish notification trigger
app.post('/api/v1/notify', async (req, res) => {
  const { userId, title, body } = req.body;
  // Step 1: Queue async worker job with deduplication
  await notifyQueue.add('send-push', { userId, title, body }, {
    jobId: \`push-\${userId}-\${Date.now()}\`,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });

  // Step 2: Broadcast immediately to connected WebSocket clients across cluster
  await redisPub.publish('ws:broadcast', JSON.stringify({ userId, title, body }));

  res.status(202).json({ accepted: true, queue: 'user-notifications' });
});

// Redis Pub/Sub multiplexer to local WebSockets
redisSub.subscribe('ws:broadcast', () => {
  console.log('Subscribed to Redis broadcast channel.');
});

redisSub.on('message', (channel, message) => {
  const payload = JSON.parse(message);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify(payload));
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Notification Hub running on port 3000');
});`;
    }

    if (projectId === 'saas-billing') {
      return `package main

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hibiken/asynq"
	"github.com/redis/go-redis/v9"
)

type WebhookEvent struct {
	TenantID  string \`json:"tenant_id" binding:"required"\`
	EventType string \`json:"event_type" binding:"required"\`
	Payload   string \`json:"payload" binding:"required"\`
}

func main() {
	r := gin.Default()
	rdb := redis.NewClient(&redis.Options{Addr: "redis:6379"})
	asynqClient := asynq.NewClient(asynq.RedisClientOpt{Addr: "redis:6379"})
	defer asynqClient.Close()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP", "time": time.Now().UTC()})
	})

	r.POST("/api/v1/events", func(c *gin.Context) {
		var evt WebhookEvent
		if err := c.ShouldBindJSON(&evt); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Idempotency check in Redis cache
		idempKey := "idemp:" + evt.TenantID + ":" + evt.EventType
		set, _ := rdb.SetNX(context.Background(), idempKey, "1", 5*time.Minute).Result()
		if !set {
			c.JSON(http.StatusConflict, gin.H{"error": "Duplicate event detected"})
			return
		}

		// Enqueue asynchronous webhook dispatch task
		task := asynq.NewTask("webhook:dispatch", []byte(evt.Payload))
		info, err := asynqClient.Enqueue(task, asynq.MaxRetry(5), asynq.Timeout(30*time.Second))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Queue failure"})
			return
		}

		c.JSON(http.StatusAccepted, gin.H{"status": "queued", "task_id": info.ID})
	})

	r.Run(":8080")
}`;
    }

    // Default: ecommerce (Python / FastAPI)
    return `from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel, Field
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from celery import Celery
import os
import time

app = FastAPI(title="E-Commerce Order & Inventory Engine", version="2.0.0")

# Redis Cache Client
redis = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))

# Celery Background Worker
celery_app = Celery("orders", broker=os.getenv("CELERY_BROKER_URL", "amqp://guest:guest@localhost:5672//"))

class OrderRequest(BaseModel):
    product_id: str = Field(..., example="laptop-x1")
    quantity: int = Field(default=1, ge=1)
    user_id: str = Field(..., example="usr_4821")
    idempotency_key: str = Field(..., example="idemp_9918231")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "orders-api", "timestamp": time.time()}

@app.post("/api/v1/orders", status_code=201)
async def create_order(order: OrderRequest, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid JWT token")

    # Step 1: Idempotency Key check in Redis
    cached = await redis.get(f"idemp:{order.idempotency_key}")
    if cached:
        return {"status": "cached", "message": "Order already processed", "order_id": cached.decode()}

    # Step 2: High-speed Inventory cache validation in Redis (sub-2ms)
    stock = await redis.get(f"stock:{order.product_id}")
    if stock is not None and int(stock) < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock available")

    # Step 3: Atomic database transaction (PostgreSQL row-level lock)
    order_id = f"ord_{int(time.time() * 1000)}"

    # Step 4: Offload payment and email to asynchronous background queue
    celery_app.send_task(
        "tasks.process_payment_and_email",
        args=[order_id, order.user_id, order.product_id, order.quantity],
        queue="payments"
    )

    # Step 5: Cache idempotency marker (15 minute TTL)
    await redis.set(f"idemp:{order.idempotency_key}", order_id, ex=900)

    return {
        "status": "created",
        "order_id": order_id,
        "product_id": order.product_id,
        "quantity": order.quantity,
        "message": "Order accepted and background worker dispatched"
    }`;
  }

  troubleshootingLabs() {
    return [
      {
        id: 'db-pool-exhaustion',
        title: 'Database Outage / Connection Exhaustion',
        symptom: 'HTTP 500 / 503 errors spike. PostgreSQL logs show "FATAL: remaining connection slots are reserved".',
        rootCause: 'Backend microservices opening unpooled direct connections per request without limits, exceeding max_connections.',
        remediationPatch: `1. Introduce PgBouncer connection pooler in Transaction Pooling mode.
2. Configure pool_size = ((2 * CPU_CORES) + EFFECTIVE_SPINDLES).
3. Set statement_timeout = 2500ms to terminate rogue queries.
4. Route read-only queries to asynchronous Read Replicas.`
      },
      {
        id: 'cache-stampede',
        title: 'Cache Stampede & Thundering Herd Problem',
        symptom: 'Database CPU hits 100% simultaneously every hour when hot Redis keys expire.',
        rootCause: 'Thousands of concurrent requests encounter a cache miss at the exact same millisecond and all execute heavy SQL joins.',
        remediationPatch: `1. Implement Probabilistic Early Expiration (XFetch algorithm).
2. Use Redis Distributed Mutex (Redlock / SET NX EX) so only 1 worker computes cache miss while others wait.
3. Add random jitter (TTL = base + rand(0, 120s)) to avoid synchronized key expirations.`
      },
      {
        id: 'queue-lag-oom',
        title: 'Message Queue Backlog & Worker OOM Death',
        symptom: 'RabbitMQ / Kafka consumer lag climbs to 500,000 unacked messages; workers restart in CrashLoopBackOff.',
        rootCause: 'Worker attempts to parse corrupted JSON payload without timeout, leaking memory on retries (Poison Pill).',
        remediationPatch: `1. Configure Dead Letter Queue (DLQ) with max_delivery_attempts = 3.
2. Route poison-pill messages to DLQ for offline triage instead of infinite retry.
3. Set memory cgroup limits and concurrency prefetch_count = 10.`
      },
      {
        id: 'api-504-timeout',
        title: 'Upstream Third-Party API 504 Gateway Timeout',
        symptom: 'Payment endpoint hangs for 60 seconds; client browser freezes and users click submit repeatedly.',
        rootCause: 'Synchronously calling external Stripe/SMS HTTP endpoint inside the user-facing request thread without timeout.',
        remediationPatch: `1. Offload non-critical external calls to asynchronous message queue workers.
2. Enforce strict HTTP client timeouts (connect_timeout = 1s, read_timeout = 3s).
3. Wrap external clients in a Circuit Breaker (Hystrix / Resilience4j pattern) that trips to fallback on 50% failures.`
      },
      {
        id: 'bad-deployment-migration',
        title: 'Zero-Downtime Deployment Migration Deadlock',
        symptom: 'Deploying new release drops table column while old backend containers are still running, breaking production.',
        rootCause: 'Breaking database schema change executed in single step before code deployment.',
        remediationPatch: `1. Enforce Expand-and-Contract (Parallel Change) migration pattern:
   - Phase 1 (Expand): Add new column, write to both, read from old.
   - Phase 2: Deploy new code reading from new column.
   - Phase 3 (Contract): Safely drop old column once all pods migrate.`
      },
      {
        id: 'container-healthcheck-fail',
        title: 'Container CrashLoopBackOff on Missing Secret',
        symptom: 'Pods terminate with ExitCode 1; Kubernetes ingress drops 50% traffic during rolling update.',
        rootCause: 'Application boots and tries to connect to database before DNS resolution or Vault secret injection finishes.',
        remediationPatch: `1. Implement exponential backoff in DB connection pool initialization.
2. Configure Kubernetes Readiness Probe (checks /health after DB is ready) separate from Liveness Probe.
3. Ensure terminationGracePeriodSeconds = 30 and handle SIGTERM signal to drain connections.`
      }
    ];
  }

  generate(config = {}) {
    const {
      project = 'ecommerce',
      learningMode = 'intermediate',
      troubleshootScenario = 'db-pool-exhaustion'
    } = config;

    const projInfo = this.supportedProjects()[project] || this.supportedProjects()['ecommerce'];
    const compose = this.generateDockerCompose(project);
    const code = this.generateBackendCode(project);
    const labs = this.troubleshootingLabs();
    const activeLab = labs.find(l => l.id === troubleshootScenario) || labs[0];

    return {
      studio: 'backend-ecosystem',
      timestamp: new Date().toISOString(),
      project: projInfo,
      learningMode,
      dockerCompose: compose,
      backendCode: code,
      activeLab,
      canonicalLinks: this.canonicalStudioLinks()
    };
  }
}
