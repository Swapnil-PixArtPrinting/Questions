# Hexagonal / Clean Architecture

### Dependency Inversion at Scale – Architect’s Perspective

---

## 1. Why This Architecture Exists (Problem Framing)

As systems grow, **business logic becomes hostage to frameworks**:

- Controllers call services
- Services call ORM repositories
- ORM leaks everywhere
- Changing DB, messaging system, or UI becomes expensive
- Tests become slow and brittle

**Hexagonal / Clean Architecture solves this by enforcing one rule:**

> **Business rules must not depend on external details.
> External details must depend on business rules.**

This is **Dependency Inversion Principle (DIP)** applied **system-wide**, not just at class level.

---

## 2. Hexagonal vs Clean Architecture (Clarified)

| Aspect     | Hexagonal (Ports & Adapters)               | Clean Architecture              |
| ---------- | ------------------------------------------ | ------------------------------- |
| Origin     | Alistair Cockburn                          | Robert C. Martin                |
| Core idea  | Application in the center, adapters around | Concentric circles              |
| Focus      | Interaction boundaries                     | Dependency direction            |
| Vocabulary | Ports, Adapters                            | Entities, Use Cases, Interfaces |
| Reality    | They are **the same philosophy**           |                                 |

👉 **In practice:**
Most modern systems use a **hybrid** of both.

---

## 3. The Dependency Rule (Non-Negotiable)

> **Source code dependencies can only point inward.**

```
Frameworks / DB / UI / Messaging
        ↓
   Adapters (Controllers, Repos)
        ↓
   Application / Use Cases
        ↓
   Domain (Entities, Rules)
```

### What this means at scale

- No Spring / Nest / Express imports in domain
- No ORM annotations in entities
- No HTTP concepts in use cases
- Infrastructure code implements interfaces defined inward

This is **not optional** if you want architectural longevity.

---

## 4. Core Layers (Architect View)

### 1️⃣ Domain Layer (Enterprise Business Rules)

**Purpose:**
Encapsulate _what the business is_, not how it runs.

**Contains**

- Entities
- Value Objects
- Domain Services (pure business logic)

**Rules**

- Zero framework dependencies
- No IO
- No database assumptions

```ts
// domain/order/Order.ts
export class Order {
  constructor(
    private readonly id: OrderId,
    private items: OrderItem[]
  ) {}

  total(): Money {
    return this.items.reduce(...)
  }
}
```

📌 **Architect insight**
If this layer changes often → your business is unstable
If outer layers change often → your system is flexible

---

### 2️⃣ Application Layer (Use Cases)

**Purpose:**
Orchestrate business rules to fulfill **user intent**

**Contains**

- Use cases / Interactors
- Input / Output DTOs
- Interfaces (Ports)

```ts
// application/ports/OrderRepository.ts
export interface OrderRepository {
  save(order: Order): Promise<void>;
}
```

```ts
// application/usecases/CreateOrder.ts
export class CreateOrder {
  constructor(private orderRepo: OrderRepository) {}

  async execute(cmd: CreateOrderCommand) {
    const order = Order.create(cmd);
    await this.orderRepo.save(order);
  }
}
```

📌 **Key insight**
This layer is where **dependency inversion becomes visible**:

- Defines _what it needs_
- Does not care _who provides it_

---

### 3️⃣ Adapters Layer (Interface Adapters)

**Purpose:**
Translate external formats into internal models and vice versa

**Examples**

- REST controllers
- GraphQL resolvers
- CLI handlers
- ORM repositories

```ts
// adapters/db/PrismaOrderRepository.ts
export class PrismaOrderRepository implements OrderRepository {
  async save(order: Order) {
    await prisma.order.create(...)
  }
}
```

📌 **Important**
Adapters depend on **application ports**, never the other way around.

---

### 4️⃣ Infrastructure Layer (Frameworks & Drivers)

**Purpose:**
Everything volatile and replaceable

- Databases
- Message brokers
- Cloud SDKs
- Framework configuration

This layer should be **easy to throw away**.

---

## 5. Dependency Inversion at Scale (Real Meaning)

At scale, DIP is not about `interface` keywords.
It’s about **organizational control**.

### 1️⃣ Direction of change

| Change               | Who feels it?       |
| -------------------- | ------------------- |
| DB migration         | Infrastructure only |
| API protocol change  | Adapter only        |
| Business rule change | Domain + Use cases  |
| Framework upgrade    | Infrastructure      |

If business logic changes when DB changes → architecture failed.

---

### 2️⃣ Team scaling advantage

- Domain team works without infra knowledge
- Infra team can optimize without breaking business rules
- Parallel development becomes safe

This is why **large companies** adopt this style.

---

## 6. How This Looks in a Real Monorepo (Node / TS)

```
src/
 ├─ domain/
 │   ├─ order/
 │   │   ├─ Order.ts
 │   │   └─ OrderPolicy.ts
 │
 ├─ application/
 │   ├─ usecases/
 │   │   └─ CreateOrder.ts
 │   └─ ports/
 │       └─ OrderRepository.ts
 │
 ├─ adapters/
 │   ├─ http/
 │   │   └─ OrderController.ts
 │   └─ persistence/
 │       └─ PrismaOrderRepository.ts
 │
 └─ infrastructure/
     ├─ prisma/
     ├─ express/
     └─ di/
         └─ container.ts
```

📌 **Dependency graph is one-way**
Nothing inside imports from outside.

---

## 7. Dependency Injection: Composition Root

**All wiring happens at the edges**

```ts
// infrastructure/di/container.ts
const orderRepo = new PrismaOrderRepository();
const createOrder = new CreateOrder(orderRepo);
```

- No service locator in domain
- No framework injection inside use cases
- Explicit dependencies → readable architecture

---

## 8. Testing Strategy (Huge Win)

| Test Type      | What you mock |
| -------------- | ------------- |
| Domain tests   | Nothing       |
| Use case tests | Ports         |
| Adapter tests  | Framework     |
| E2E tests      | Full stack    |

```ts
const fakeRepo: OrderRepository = {
  save: async () => {},
};
```

📌 **Result**

- Fast tests
- Deterministic
- No DB needed for business validation

---

## 9. Common Architect Mistakes

❌ Entity contains ORM annotations
❌ Use case returns HTTP response
❌ Controller contains business logic
❌ DI container leaking into domain
❌ Too many layers for CRUD-only systems

---

## 10. When NOT to Use It

Be honest as an architect.

Avoid full Clean Architecture when:

- Simple CRUD admin panel
- Short-lived MVP
- Single developer project
- No complex business rules

Use **modular layering**, not full hexagon.

---

## 11. Clean Architecture vs Microservices

Important distinction:

- Clean Architecture = **code-level boundaries**
- Microservices = **deployment boundaries**

You should apply **Clean Architecture inside each microservice**.

---

## 12. Architect-Level Interview Talking Points

If asked _“Why Clean Architecture?”_, answer:

> “It enforces dependency inversion at a system level, allowing business rules to evolve independently of frameworks, databases, and delivery mechanisms. It optimizes for long-term maintainability, testability, and team scalability rather than short-term velocity.”

That answer signals **architect thinking**, not tutorial knowledge.

---

## 13. Mental Model to Remember

> **The business does not know it runs on HTTP,
> does not know it uses SQL,
> does not know it runs in the cloud.**

Everything else is a plugin.

---

If you want next:

- **Clean Architecture vs DDD (how they complement)**
- **How to apply this in NestJS without fighting the framework**
- **Refactoring an existing service into Hexagonal style**
- **How much Clean Architecture is “enough” for real projects**

Just tell me your preference.
