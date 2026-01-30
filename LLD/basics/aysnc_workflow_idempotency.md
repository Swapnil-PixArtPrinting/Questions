# 1. Async Workflows (Architect’s View)

## What an SA really means by “Async”

> **The caller and callee do not share the same lifetime, failure domain, or clock.**

Async is not just `async/await`.
It means:

- **Decoupled execution**
- **Eventual consistency**
- **Failure is normal**

---

## Why Architects Choose Async

| Problem                     | Async Benefit               |
| --------------------------- | --------------------------- |
| Long-running tasks          | Don’t block request threads |
| Cross-service orchestration | Isolate failures            |
| Traffic spikes              | Natural buffering           |
| External dependencies       | Reduce blast radius         |
| User experience             | Fast responses              |

---

## Async Workflow Patterns

### 1️⃣ Fire-and-Forget

```
API → Queue → Worker
```

- No response guarantee
- Logging & monitoring critical
- Used for: emails, analytics, notifications

---

### 2️⃣ Request → Acknowledge → Process

```
Client → API → 202 Accepted
                 ↓
              Async Processor
```

- Client polls or receives webhook
- Used for: payments, report generation

---

### 3️⃣ Orchestration (Saga Pattern)

```
Order → Payment → Inventory → Shipping
```

- Multiple steps
- Compensations on failure
- Strong SA topic

---

### 4️⃣ Choreography (Event-Driven)

```
OrderPlaced → PaymentService listens
            → InventoryService listens
```

- No central coordinator
- Harder to reason, scales better

---

## Async in Clean / Hexagonal Architecture

```
Domain
 └── Use Case
      ↓
 Outbound Port
      ↓
 Message Broker / Queue (Adapter)
```

👉 **Domain never waits for async completion**

---

# 2. Retries (Where Most Systems Break)

## Architect’s Definition

> **Retries are controlled re-executions under failure assumptions.**

Key insight:

> **Retries multiply traffic and side effects.**

---

## When Retries Are Safe vs Dangerous

| Scenario                          | Retry?                 |
| --------------------------------- | ---------------------- |
| Network timeout                   | ✅                     |
| 5xx server error                  | ✅ (with backoff)      |
| Validation error                  | ❌                     |
| Payment charged but response lost | ❌ without idempotency |

---

## Retry Design Dimensions

### 1️⃣ Retry Strategy

- Immediate retry ❌
- Fixed delay ⚠️
- **Exponential backoff ✅**
- **Jitter (randomness) ✅**

```ts
delay = (base * 2) ^ (attempt + random());
```

---

### 2️⃣ Retry Budget (Architect-Level Concept)

> “How many retries is the system allowed before it hurts itself?”

- Per request
- Per service
- Per dependency

---

### 3️⃣ Retry Placement

| Layer       | Should Retry?     |
| ----------- | ----------------- |
| UI          | ❌                |
| API Gateway | ⚠️ limited        |
| Service     | ✅                |
| Worker      | ✅                |
| DB client   | ⚠️ very carefully |

---

## Code Example (Retry with Backoff)

```ts
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 100,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((res) =>
        setTimeout(res, delayMs * Math.pow(2, attempt)),
      );
      attempt++;
    }
  }
}
```

🚨 **Architect rule**:

> Never retry blindly without idempotency.

---

# 3. Idempotency (The Safety Net)

## Architect’s Definition

> **An operation can be safely repeated without changing the final result.**

This is the **cornerstone** of reliable async systems.

---

## Why Idempotency Exists

- Retries happen
- Messages are duplicated
- Responses are lost
- Networks lie

---

## Types of Idempotency

### 1️⃣ Natural Idempotency

```
PUT /users/123
```

- Same input → same result

---

### 2️⃣ Explicit Idempotency (Most Important)

- Client provides **Idempotency-Key**
- Server guarantees _exactly-once effect_

---

## Idempotency Flow (SA View)

```
Request
 └── Idempotency Key
      ↓
Check Store
 ├── Exists → return stored result
 └── Not exists → execute → store result
```

---

## Code Example (API Idempotency)

```ts
const idempotencyStore = new Map<string, any>();

async function createPayment(key: string, amount: number) {
  if (idempotencyStore.has(key)) {
    return idempotencyStore.get(key);
  }

  const result = await charge(amount);
  idempotencyStore.set(key, result);
  return result;
}
```

🔴 In production:

- Redis / DynamoDB
- TTL on keys
- Atomic writes

---

## Idempotency in Async Messaging

### Problem

Message broker may deliver **same message multiple times**

### Solution

- Message ID
- Deduplication store

```ts
if (processedMessageIds.has(msg.id)) return;
process(msg);
processedMessageIds.add(msg.id);
```

---

# 4. Async + Retry + Idempotency (Together)

## Architect’s Golden Rule

> **Retries without idempotency cause data corruption.**

---

## Safe Async Execution Model

```
Client
 └── Request (Idempotency Key)
      ↓
API
 └── Enqueue Message
      ↓
Worker
 ├── Deduplicate
 ├── Retry on failure
 └── Commit result once
```

---

## Payment Example (Classic Interview Scenario)

### ❌ Bad Design

- Client retries payment API
- API charges card again

### ✅ Good Design

- Idempotency key = orderId
- Multiple retries → single charge

---

# 5. Common Failure Scenarios (SA Must Know)

| Failure                  | Fix                       |
| ------------------------ | ------------------------- |
| Message processed twice  | Idempotent consumer       |
| Partial workflow failure | Saga + compensation       |
| Retry storm              | Backoff + circuit breaker |
| Stuck async job          | DLQ (Dead Letter Queue)   |
| Lost response            | Idempotency + polling     |

---

# 6. Architectural Patterns Involved

| Pattern             | Role                      |
| ------------------- | ------------------------- |
| Saga                | Async workflows           |
| Outbox              | Reliable event publishing |
| Idempotent Consumer | Safe message handling     |
| Circuit Breaker     | Retry control             |
| Bulkhead            | Failure isolation         |

---

# 7. Mapping to NestJS (Contextual)

| NestJS Feature | Concept                |
| -------------- | ---------------------- |
| Queue (BullMQ) | Async workflow         |
| Interceptors   | Retry / logging        |
| Guards         | Idempotency validation |
| Providers      | Orchestration logic    |

---

# 8. Interview-Ready Summary (SA Level)

> Async workflows accept that failures happen.
> Retries assume failures are temporary.
> Idempotency guarantees retries are safe.

Or in one line:

> **Async enables scale, retries enable resilience, idempotency enables correctness.**

---

If you want next:

- **Saga vs Orchestration vs Choreography (deep dive)**
- **Exactly-once vs at-least-once delivery**
- **Design a payment system (end-to-end)**
- **Retry + circuit breaker + bulkhead code**

Just say which one you want.
