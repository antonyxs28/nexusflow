# Guia de Testes — NexusFlow API

## Pré-requisitos

```bash
# 1. Subir PostgreSQL
docker compose up -d

# 2. Rodar migrations
pnpm exec drizzle-kit push

# 3. Instalar dependências
pnpm install

# 4. Configurar .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexusflow
JWT_SECRET=supersecret
```

---

## Como Rodar os Testes

```bash
pnpm test
```

Rodar um arquivo específico:

```bash
pnpm vitest src/services/auth/auth-service.test.ts
```

Rodar com watch:

```bash
pnpm vitest --watch
```

---

## O que já existe (21 testes, 3 arquivos)

### 1. `src/services/auth/auth-service.test.ts` — 5 testes

Testa os serviços de autenticação diretamente (sem servidor HTTP).

| Teste | O que verifica |
|---|---|
| `should register a new user successfully` | Cria usuário, verifica `id`, `name`, `email`, `role`, `createdAt` e que `password` não vaza |
| `should reject duplicate email` | Tenta registrar mesmo email, espera `AppError` 409 |
| `should login successfully and return token + user` | Login com credenciais corretas, verifica `token` (JWT) e `user` sem password |
| `should reject invalid password` | Login com senha errada, espera `AppError` 401 |
| `should reject non-existent email` | Login com email inexistente, espera `AppError` 401 |

**Dependências:** PostgreSQL, tabela `users`

### 2. `src/services/clients/client-service.test.ts` — 9 testes

Testa CRUD de clients com escopo por usuário (ownership).

| Teste | O que verifica |
|---|---|
| `should setup test users` | Cria dois usuários (owner + other) |
| `should create a client` | Cria client com todos os campos |
| `should list clients for the owner` | Lista clients do owner, verifica que o criado está na lista |
| `should get client by id` | Busca client por ID |
| `should throw 404 for non-existent client` | ID inexistente → `AppError` 404 |
| `should update a client` | Atualiza `name` e `mrr`, verifica que outros campos não mudaram |
| `should not access another user's client` | Owner tenta acessar client do other → 404, update → 404, delete → 404 |
| `should delete a client` | Deleta e depois verifica que não existe mais |
| `should validate input on create` | Dados inválidos (name curto, email inválido) → erro do Zod |

**Dependências:** PostgreSQL, tabelas `users`, `clients`

### 3. `src/services/analytics/analytics-service.test.ts` — 7 testes

Testa os cálculos de analytics com dados seedados.

| Teste | O que verifica |
|---|---|
| `should setup test user and seed data` | Cria user, client, subscriptions (ativas + cancelada), invoices (paid + pending), traffic_sources (4 fontes), activities (3) |
| `should calculate dashboard overview metrics` | `totalRevenue`, `activeUsers`, `churnRate`, `averageRevenuePerUser`, `mrr` existem e são > 0 |
| `should calculate MRR correctly` | MRR = 99 + 299 = 398 (só subscriptions ativas) |
| `should return revenue analytics` | `monthlyRevenue` com arrays, `mrr` e `arr` > 0 |
| `should return traffic sources with breakdown` | 4+ fontes, visitors, pageViews, leads, conversionRate, percentage |
| `should return recent activities` | 3+ atividades ordenadas por data |
| `should return zeros for a user with no data` | Usuário sem dados → tudo 0 ou array vazio |

**Dependências:** PostgreSQL, tabelas `users`, `clients`, `subscriptions`, `invoices`, `traffic_sources`, `activities`

---

## O que pode ser adicionado

### 4. Testes do Logger — `src/utils/logger.test.ts`

Testes unitários (não precisam de banco):

```typescript
import { describe, expect, it } from "vitest";
import { printStartupBanner, logResponse } from "../utils/logger";

describe("Logger", () => {
  it("should format startup banner without throwing", () => {
    expect(() =>
      printStartupBanner({
        port: 3001,
        host: "localhost",
        env: "test",
        version: "1.0.0",
      }),
    ).not.toThrow();
  });

  it("should format response log without throwing", () => {
    expect(() => logResponse("GET", "/test", 200, 5)).not.toThrow();
    expect(() => logResponse("POST", "/test", 404, 10)).not.toThrow();
    expect(() => logResponse("DELETE", "/test", 500, 100)).not.toThrow();
  });
});
```

### 5. Testes do OpenAPI/Swagger — `src/plugins/docs.test.ts`

Teste de integração que valida a spec gerada:

```typescript
import { describe, expect, it } from "vitest";
import { buildServer } from "../server";

describe("OpenAPI Spec", () => {
  it("should generate valid OpenAPI spec", async () => {
    const app = buildServer();
    await app.ready();

    const spec = app.swagger();
    expect(spec.info.title).toBe("NexusFlow API");
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.paths["/auth/register"]).toBeDefined();
    expect(spec.paths["/clients"]).toBeDefined();
    expect(spec.paths["/analytics/overview"]).toBeDefined();
    expect(spec.components.securitySchemes.bearerAuth).toBeDefined();

    await app.close();
  });
});
```

**Nota:** Precisa de uma função `buildServer()` exportada (atualmente o server é criado e já iniciado no `server.ts`). Sugiro refatorar para:

```typescript
// server.ts
export function buildServer() {
  return fastify({ logger: false });
  // ... plugins, rotas ...
}

// start.ts (ou no próprio server.ts)
if (import.meta.url === process.argv[1]) {
  buildServer().listen(...)
}
```

### 6. Testes de API (End-to-End) — `src/routes/*.test.ts`

Testam as rotas HTTP usando `app.inject()` do Fastify:

```typescript
import { describe, expect, it } from "vitest";
import { buildServer } from "../server";

describe("POST /auth/register", () => {
  it("should register and return 201", async () => {
    const app = buildServer();
    await app.ready();

    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        name: "Test",
        email: `e2e-${Date.now()}@test.com`,
        password: "123456",
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user).toBeDefined();
    expect(body.user.password).toBeUndefined();

    await app.close();
  });

  it("should return 400 for invalid data", async () => {
    const app = buildServer();
    await app.ready();

    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { name: "X", email: "invalid", password: "12" },
    });

    expect(res.statusCode).toBe(400);

    await app.close();
  });
});
```

### 7. Testes do Auth Middleware — `src/middlewares/auth-middleware.test.ts`

Testa o middleware isoladamente:

```typescript
import { describe, expect, it } from "vitest";
import { buildServer } from "../server";

describe("Auth Middleware", () => {
  it("should reject missing authorization header", async () => {
    const app = buildServer();
    await app.ready();

    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
    });

    expect(res.statusCode).toBe(401);

    await app.close();
  });

  it("should reject invalid token", async () => {
    const app = buildServer();
    await app.ready();

    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: "Bearer invalid-token" },
    });

    expect(res.statusCode).toBe(401);

    await app.close();
  });

  it("should reject missing Bearer scheme", async () => {
    const app = buildServer();
    await app.ready();

    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: "Basic dXNlcjpwYXNz" },
    });

    expect(res.statusCode).toBe(401);

    await app.close();
  });
});
```

---

## Fluxo de Teste Completo

```
npm test
    │
    ├── auth-service.test.ts  ────  PostgreSQL ────  serviços de auth
    ├── client-service.test.ts ────  PostgreSQL ────  serviços de client
    ├── analytics-service.test.ts ── PostgreSQL ────  serviços de analytics
    │
    ├── logger.test.ts*  ─────────  (nenhum) ─────  formatação de terminal
    ├── docs.test.ts*  ───────────  Fastify ───────  spec OpenAPI gerada
    ├── routes.test.ts*  ────────  Fastify+PG ────  endpoints HTTP
    └── middleware.test.ts*  ────  Fastify ───────  auth middleware
```

(\* = novo, sugerido)

---

## Resumo

| Tipo | Arquivo | Banco? | O que testa |
|---|---|---|---|
| ✅ Atual | `auth-service.test.ts` | Sim | Register, login, erros |
| ✅ Atual | `client-service.test.ts` | Sim | CRUD client, ownership |
| ✅ Atual | `analytics-service.test.ts` | Sim | Dashboard, revenue, traffic, activity |
| ➕ Sugerido | `logger.test.ts` | Não | Formatação do terminal |
| ➕ Sugerido | `docs.test.ts` | Não | Spec OpenAPI gerada |
| ➕ Sugerido | `routes/*.test.ts` | Sim | Endpoints HTTP completos |
| ➕ Sugerido | `middleware.test.ts` | Não | Auth JWT, headers, tokens |

Os 21 testes atuais são suficientes para garantir que a lógica de negócio (auth, clientes, analytics) funciona. Os testes sugeridos cobririam a camada HTTP e a documentação, mas exigem refatorar o `server.ts` para exportar uma factory `buildServer()`.
