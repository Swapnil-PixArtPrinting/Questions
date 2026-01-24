## 1. Core Definitions (Architect View)

### Inheritance (IS-A relationship)

Inheritance models **classification and specialization**.

```ts
class Vehicle {
  move() {}
}

class Car extends Vehicle {
  openTrunk() {}
}
```

- `Car IS-A Vehicle`
- Behavior is **fixed at compile time**
- Strong coupling to parent

---

### Composition (HAS-A relationship)

Composition models **capabilities and collaboration**.

```ts
class Engine {
  start() {}
}

class Car {
  constructor(private engine: Engine) {}

  drive() {
    this.engine.start();
  }
}
```

- `Car HAS-A Engine`
- Behavior can be **changed by substitution**
- Loose coupling

---

## 2. Why Architects Say

> **“Prefer composition over inheritance”**

This is **not a rule**, it’s a **risk-management principle**.

### Problems with Inheritance at Scale

| Problem            | Why it hurts architecture              |
| ------------------ | -------------------------------------- |
| Fragile base class | Small change in parent breaks children |
| Deep hierarchies   | Hard to reason about behavior          |
| Forced behavior    | Child inherits methods it shouldn’t    |
| Compile-time lock  | Cannot change behavior at runtime      |

❌ Classic failure:

```ts
class Bird {
  fly() {}
}

class Penguin extends Bird {} // ❌ logically wrong
```

---

## 3. Composition Solves Domain Evolution

### Using Role-based Composition

```ts
interface FlyBehavior {
  fly(): void;
}

class CanFly implements FlyBehavior {
  fly() {}
}

class CannotFly implements FlyBehavior {
  fly() {
    throw new Error("Cannot fly");
  }
}

class Bird {
  constructor(private flyBehavior: FlyBehavior) {}

  fly() {
    this.flyBehavior.fly();
  }
}
```

✔ Behavior is **pluggable**
✔ Domain evolves without breaking classes

---

## 4. Domain Modeling: Where This Really Matters

### Domain Modeling ≠ Class Modeling

**Wrong approach (anemic thinking):**

```
User
 ├── AdminUser
 ├── SellerUser
 └── BuyerUser
```

This explodes when:

- Roles change
- Users have multiple roles
- Permissions evolve

---

### Correct Domain Modeling (Composition-first)

```ts
class User {
  constructor(
    private roles: Role[],
    private permissions: PermissionSet,
  ) {}
}
```

```ts
interface Role {
  name: string;
  permissions(): Permission[];
}
```

✔ User can be Buyer + Seller
✔ Roles can change dynamically
✔ Matches real-world business rules

---

## 5. Aggregates & Composition (DDD Perspective)

In **Domain-Driven Design**, composition is dominant.

### Aggregate Root Example

```ts
class Order {
  private items: OrderItem[];
  private payment: Payment;
  private shipment: Shipment;
}
```

- `Order` is the **Aggregate Root**
- `OrderItem`, `Payment`, `Shipment` **do not exist independently**
- This is **composition with invariants**

🧠 Architectural rule:

> Changes inside an aggregate must maintain consistency boundaries.

---

## 6. When Inheritance _IS_ Correct

Inheritance is valid when **all** are true:

✅ Strong IS-A relationship
✅ Behavior is truly shared
✅ Parent is stable
✅ No need for runtime variation

### Good example

```ts
abstract class DomainEvent {
  occurredAt: Date;
}

class OrderPlaced extends DomainEvent {}
class PaymentFailed extends DomainEvent {}
```

Why inheritance works here:

- Events are immutable
- Behavior is minimal
- Taxonomy is stable

---

## 7. Anti-patterns Architects Watch For

### ❌ Inheritance for Reuse

```ts
class BaseService {
  log() {}
  validate() {}
  save() {}
}
```

This becomes:

- God class
- Hidden coupling
- Hard to refactor

✔ Instead:

```ts
class Service {
  constructor(
    private logger: Logger,
    private validator: Validator,
    private repo: Repository,
  ) {}
}
```

---

## 8. Composition + Interfaces = Power Combo

```ts
interface PricingStrategy {
  calculate(price: number): number;
}

class RegularPricing implements PricingStrategy {}
class DiscountPricing implements PricingStrategy {}

class Checkout {
  constructor(private pricing: PricingStrategy) {}
}
```

This enables:

- Open/Closed Principle
- Strategy pattern
- Feature flags
- A/B testing

---

## 9. Interview-Ready Summary (Say This)

> “Inheritance models **taxonomy**, composition models **capability**.
> In domain modeling, capabilities change more often than taxonomies, so I default to composition.
> I use inheritance only when the IS-A relationship is stable and behavior is minimal.
> Aggregates in DDD naturally favor composition to enforce invariants.”

---

## 10. Decision Checklist (Architect Tool)

Ask yourself:

- ❓ Will this behavior change independently?
- ❓ Can objects have multiple roles?
- ❓ Do I need runtime flexibility?
- ❓ Will the domain evolve?

👉 If **yes**, choose **composition**
👉 If **no**, inheritance is acceptable

---

If you want next:

- Composition vs inheritance **in microservices**
- How this maps to **Clean Architecture**
- Refactoring inheritance-heavy legacy code
- Real interview questions & model answers

Just tell me.
