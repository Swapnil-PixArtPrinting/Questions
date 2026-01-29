# Factory & Strategy Patterns

### _(Extensibility and Open–Closed Design — SA perspective)_

## 1. Why these patterns matter for a Solution Architect

As an SA, you care less about _how to write a class_ and more about:

- **How the system evolves**
- **How new business rules are added without breaking old ones**
- **How teams work independently without merge conflicts**
- **How runtime behavior can change without redeploying everything**

Factory + Strategy together form a **core extensibility toolkit**.

---

## 2. Open–Closed Principle (OCP) refresher

> **Software entities should be open for extension, but closed for modification**

### Architecturally, this means:

- New behavior = **new classes / configs**
- Existing, tested code = **untouched**
- Change happens at **composition boundaries**, not inside core logic

Factory and Strategy are two sides of the same OCP coin.

---

## 3. Strategy Pattern – _“Behavior varies”_

### Intent

Encapsulate **algorithms / business rules** so they can be:

- Swapped at runtime
- Extended without modifying consumers

### When to use (architect signals)

- `if / else` or `switch` on **business rules**
- Rules change **per client / region / plan / feature flag**
- Frequent additions of “one more variation”

---

### Strategy – Core structure

```ts
// Strategy interface
interface PricingStrategy {
  calculate(amount: number): number;
}
```

```ts
// Concrete strategies
class RegularPricing implements PricingStrategy {
  calculate(amount: number) {
    return amount;
  }
}

class FestivalDiscountPricing implements PricingStrategy {
  calculate(amount: number) {
    return amount * 0.9;
  }
}

class PremiumCustomerPricing implements PricingStrategy {
  calculate(amount: number) {
    return amount * 0.8;
  }
}
```

```ts
// Context
class CheckoutService {
  constructor(private pricing: PricingStrategy) {}

  checkout(amount: number) {
    return this.pricing.calculate(amount);
  }
}
```

### Key SA insight

- **CheckoutService never changes**
- Business adds 10 new pricing rules → zero modification

✔ OCP achieved

---

### Strategy anti-pattern (what architects must kill)

```ts
if (customer.type === "PREMIUM") {
  price *= 0.8;
} else if (festival === true) {
  price *= 0.9;
}
```

❌ Violates OCP
❌ Merge conflicts
❌ Hard to test
❌ Impossible to feature-toggle cleanly

---

## 4. Factory Pattern – _“Creation varies”_

### Intent

Encapsulate **object creation logic** so:

- Clients don’t know _which_ implementation is used
- New implementations don’t require client changes

### When to use (architect signals)

- Object creation depends on:
  - Config
  - Environment
  - Tenant
  - Feature flag

- Direct `new ClassX()` scattered everywhere

---

### Simple Factory (most practical for real systems)

```ts
class PricingStrategyFactory {
  static create(type: string): PricingStrategy {
    switch (type) {
      case "PREMIUM":
        return new PremiumCustomerPricing();
      case "FESTIVAL":
        return new FestivalDiscountPricing();
      default:
        return new RegularPricing();
    }
  }
}
```

```ts
const strategy = PricingStrategyFactory.create(customer.type);
const checkout = new CheckoutService(strategy);
```

---

### Factory problem (important SA observation)

The `switch` **still violates OCP**
Every new strategy → modify factory

So we evolve it 👇

---

## 5. OCP-compliant Factory (Registry-based)

```ts
class PricingStrategyFactory {
  private static registry = new Map<string, () => PricingStrategy>();

  static register(key: string, creator: () => PricingStrategy) {
    this.registry.set(key, creator);
  }

  static create(key: string): PricingStrategy {
    const creator = this.registry.get(key);
    if (!creator) throw new Error("Strategy not found");
    return creator();
  }
}
```

```ts
// Registration (bootstrapping phase)
PricingStrategyFactory.register("PREMIUM", () => new PremiumCustomerPricing());
PricingStrategyFactory.register(
  "FESTIVAL",
  () => new FestivalDiscountPricing(),
);
```

### Why this matters architecturally

- Factory code **never changes again**
- New behavior = new module + registration
- Enables **plugin architectures**

✔ True Open–Closed compliance

---

## 6. Factory + Strategy together (real-world pattern)

> **Strategy handles behavior variation**
> **Factory handles strategy selection**

### End-to-end flow

```ts
const strategy = PricingStrategyFactory.create(context.rule);
const service = new CheckoutService(strategy);
service.checkout(1000);
```

### Architecturally:

- **Policy** (what rule?) → config / DB / feature flag
- **Mechanism** (how rule works?) → strategy
- **Wiring** → factory / DI container

---

## 7. Mapping to Clean / Hexagonal Architecture

### Strategy

- Lives in **Domain layer**
- Represents **business policies**

### Factory

- Lives in **Application / Composition root**
- Wires domain behaviors

```
[ Controller ]
     |
[ Application ]
     |---- Factory (selects strategy)
     |
[ Domain ]
     |---- Strategy interface
     |---- Concrete strategies
```

✔ Domain has **no if-else logic**
✔ Application decides **which rule applies**

---

## 8. Real production use cases (SA level)

### 1️⃣ Payment processing

- Strategy: UPI, Card, NetBanking, Wallet
- Factory: selects based on country / PSP availability

### 2️⃣ Notification systems

- Strategy: Email, SMS, Push, WhatsApp
- Factory: selects based on user preference & channel health

### 3️⃣ Tax calculation (India/EU/US)

- Strategy per region
- Factory driven by customer geography

### 4️⃣ Cloud providers

- Strategy: S3 / GCS / Azure Blob
- Factory based on deployment environment

---

## 9. Strategy vs Factory (clear distinction)

| Aspect      | Strategy           | Factory                 |
| ----------- | ------------------ | ----------------------- |
| Purpose     | Vary behavior      | Vary object creation    |
| Focus       | Algorithms / rules | Instantiation           |
| Driven by   | Business logic     | Configuration / context |
| OCP benefit | Add new behavior   | Add new implementations |
| Used by     | Domain             | Application / infra     |

---

## 10. What interviewers expect from an SA

You should be able to say:

> “We use Strategy to isolate business rules and Factory at the composition root so new policies can be added without touching existing code. This keeps the core domain closed to modification and supports tenant-specific behavior.”

That sentence alone is **senior-architect level**.

---

## 11. Key SA takeaways (memorize these)

- Strategy = **replace if-else with polymorphism**
- Factory = **move creation out of business logic**
- Together = **extensible systems**
- OCP is achieved at **composition boundaries**, not inside classes
- Factories should **stop changing early** (registry / DI)

---

If you want, next we can:

- Map this to **Dependency Injection containers**
- Compare with **Command pattern**
- Show **anti-patterns in microservices**
- Convert a real if-else heavy service into Strategy + Factory

Just tell me 👍
