# 1. Adapter Pattern

## Intent (Architect’s View)

> **Make incompatible interfaces work together without changing existing code.**

Think of Adapter as:

> **“Protocol / interface translator at system boundaries.”**

---

## When an SA Thinks “Adapter”

- Integrating **legacy systems**
- Consuming **third-party APIs**
- Switching vendors without rewriting core logic
- Enforcing **dependency inversion** in Clean Architecture
- Supporting **multiple implementations** behind one contract

---

## Real-World Analogy

🔌 **Power adapter**
Wall socket ≠ laptop plug
Adapter converts **interface**, not behavior.

---

## Typical Use Cases

| Scenario                             | Why Adapter               |
| ------------------------------------ | ------------------------- |
| Old REST API → New GraphQL service   | Interface mismatch        |
| AWS SDK → Azure SDK                  | Vendor abstraction        |
| Legacy DB → New repository interface | Gradual migration         |
| External payment gateway             | Normalize API differences |

---

## Adapter in Clean / Hexagonal Architecture

```
Domain
 └── Port (Interface)
      ↑
 Adapter (Infrastructure Layer)
      ↑
 External System
```

👉 **Adapters sit at the edge**, never inside domain logic.

---

## Types of Adapter

### 1️⃣ Object Adapter (Most Common)

Uses **composition**

### 2️⃣ Class Adapter

Uses inheritance (rare in JS/TS, common in Java/C++)

---

## Code Example (TypeScript)

### Step 1: Domain Port

```ts
// domain/ports/PaymentPort.ts
export interface PaymentPort {
  pay(amount: number): Promise<boolean>;
}
```

---

### Step 2: External System (Incompatible API)

```ts
// external/StripeSDK.ts
export class StripeSDK {
  async chargeInCents(cents: number): Promise<{ success: boolean }> {
    return { success: true };
  }
}
```

---

### Step 3: Adapter

```ts
// infrastructure/adapters/StripePaymentAdapter.ts
import { PaymentPort } from "../../domain/ports/PaymentPort";
import { StripeSDK } from "../../external/StripeSDK";

export class StripePaymentAdapter implements PaymentPort {
  constructor(private stripe: StripeSDK) {}

  async pay(amount: number): Promise<boolean> {
    const cents = amount * 100;
    const result = await this.stripe.chargeInCents(cents);
    return result.success;
  }
}
```

---

### Step 4: Domain Service (Unaware of Stripe)

```ts
// domain/services/CheckoutService.ts
import { PaymentPort } from "../ports/PaymentPort";

export class CheckoutService {
  constructor(private payment: PaymentPort) {}

  async checkout(amount: number) {
    return this.payment.pay(amount);
  }
}
```

✅ **Vendor swap requires zero domain change**

---

## Adapter – SA-Level Pros & Cons

### ✅ Pros

- Enables **loose coupling**
- Protects domain from vendor churn
- Enables parallel migrations
- Improves testability (mock the port)

### ❌ Cons

- Too many adapters = complexity
- Poor naming → “Adapter soup”
- Can hide poor domain modeling

---

# 2. Decorator Pattern

## Intent (Architect’s View)

> **Add behavior dynamically without modifying the original object.**

Think of Decorator as:

> **“Composable cross-cutting behavior.”**

---

## When an SA Thinks “Decorator”

- Logging
- Metrics
- Caching
- Authorization
- Retry / circuit breaker
- Feature toggles

---

## Real-World Analogy

🎁 **Gift wrapping**

- Gift stays same
- Layers add value
- Order matters

---

## Key Difference from Adapter

| Adapter                | Decorator            |
| ---------------------- | -------------------- |
| Changes interface      | Keeps same interface |
| Solves incompatibility | Adds responsibility  |
| One-time translation   | Stackable behaviors  |

---

## Decorator in Clean Architecture

```
Client
 ↓
Decorator (Logging)
 ↓
Decorator (Caching)
 ↓
Concrete Service
```

👉 **Same interface, different behavior**

---

## Code Example (TypeScript)

### Step 1: Common Interface

```ts
export interface UserService {
  getUser(id: string): Promise<string>;
}
```

---

### Step 2: Concrete Implementation

```ts
export class UserServiceImpl implements UserService {
  async getUser(id: string): Promise<string> {
    return `User:${id}`;
  }
}
```

---

### Step 3: Logging Decorator

```ts
export class LoggingUserService implements UserService {
  constructor(private wrapped: UserService) {}

  async getUser(id: string): Promise<string> {
    console.log("Fetching user", id);
    return this.wrapped.getUser(id);
  }
}
```

---

### Step 4: Caching Decorator

```ts
export class CachingUserService implements UserService {
  private cache = new Map<string, string>();

  constructor(private wrapped: UserService) {}

  async getUser(id: string): Promise<string> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    const result = await this.wrapped.getUser(id);
    this.cache.set(id, result);
    return result;
  }
}
```

---

### Step 5: Composition

```ts
const service = new LoggingUserService(
  new CachingUserService(new UserServiceImpl()),
);

await service.getUser("123");
```

---

## Decorator vs Middleware vs AOP

| Concept               | Decorator |
| --------------------- | --------- |
| Explicit composition  | ✅        |
| Order controlled      | ✅        |
| Language agnostic     | ✅        |
| Framework independent | ✅        |

Decorator is **AOP without magic** – great for architects.

---

## Anti-Patterns to Watch

### ❌ Adapter Abuse

- Adapter starts adding business logic → violation of SRP

### ❌ Decorator Over-Stacking

- 6–7 layers → debugging hell
- Solution: **policy-based decorators** or **composite decorators**

---

## Adapter vs Decorator – SA Comparison

| Aspect            | Adapter                  | Decorator             |
| ----------------- | ------------------------ | --------------------- |
| Primary Goal      | Compatibility            | Extend behavior       |
| Interface         | Changes                  | Same                  |
| Typical Layer     | Infrastructure           | Application           |
| Clean Arch Role   | Inbound/Outbound Adapter | Cross-cutting concern |
| Runtime Stackable | ❌                       | ✅                    |

---

## Interview-Ready Summary (SA Level)

> **Adapter** protects the domain from external changes by translating interfaces at boundaries.
> **Decorator** protects core logic from cross-cutting concerns by layering behaviors transparently.

---

If you want, next we can:

- Map these patterns to **NestJS interceptors vs providers**
- Show **anti-corruption layers using adapters**
- Compare **Decorator vs Proxy vs Chain of Responsibility**
- Convert this into **interview cheat notes or diagrams**

Just tell me how deep you want to go.
