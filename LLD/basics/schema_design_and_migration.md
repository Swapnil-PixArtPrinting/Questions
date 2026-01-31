# Schema Design & Backward-Compatible Migrations: SA Deep Dive

## 1. Why This Matters for a Solution Architect 🧠

As an SA, **schema design is not a DB task**—it’s a **system stability and velocity decision**.

Poor schema & migration strategy leads to:

- 🚨 Downtime during releases
- ❌ Breaking older services or mobile apps
- 🐌 Slow queries and scale failures
- 🔄 Rollback nightmares

Your responsibility:

> **Enable independent service evolution without data breakage**

---

## 2. Schema Design Principles (SA Perspective)

### 2.1 Design for Change, Not for Today

**Assume schema will evolve every quarter.**

Bad thinking:

> “We’ll never need this field”

Good thinking:

> “How do we add/remove fields safely?”

Key techniques:

- Nullable columns
- Default values
- Versioned entities
- Flexible attributes (JSON / EAV where justified)

---

### 2.2 Normalize vs Denormalize (Strategic Choice)

| Aspect               | Normalize             | Denormalize     |
| -------------------- | --------------------- | --------------- |
| Data consistency     | ✅ Strong             | ⚠️ Weaker       |
| Query performance    | ❌ Slower joins       | ✅ Faster reads |
| Schema change impact | ❌ Wider blast radius | ✅ Localized    |
| Microservices        | ❌ Risky              | ✅ Preferred    |

👉 **SA rule**:

- **OLTP / Core business logic → normalized**
- **Read-heavy / APIs / analytics → denormalized**

---

### 2.3 Strong Contracts Between Schema & Services

Treat DB schema like an **API contract**.

Bad:

- Renaming column directly
- Changing enum values
- Altering data meaning silently

Good:

- Add new column
- Migrate data
- Deprecate old column later

---

## 3. Backward-Compatible Migrations (Core Topic)

### 3.1 What Is Backward Compatibility?

> A schema change is backward-compatible if **old application versions continue to work without errors**.

This is **mandatory** in:

- Microservices
- Mobile apps
- Blue–green or canary deployments
- Multi-region deployments

---

## 4. Golden Rules of Backward-Compatible Migrations 🏆

### Rule 1: **Expand → Migrate → Contract**

This is the most important SA pattern.

#### Step 1: Expand (Safe)

- Add new column/table
- Keep old schema intact

```sql
ALTER TABLE orders ADD COLUMN order_status_v2 VARCHAR(20);
```

#### Step 2: Migrate (Dual Write / Backfill)

- Application writes to **both old and new**
- Backfill historical data

```sql
UPDATE orders
SET order_status_v2 = order_status;
```

#### Step 3: Contract (Cleanup)

- Remove old column **only after all consumers migrate**

```sql
ALTER TABLE orders DROP COLUMN order_status;
```

👉 **Never skip steps**

---

### Rule 2: Never Rename or Drop in One Release ❌

❌ Dangerous:

```sql
ALTER TABLE users RENAME COLUMN name TO full_name;
```

✅ Safe:

```sql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
-- migrate data
-- update apps
-- later drop name
```

---

### Rule 3: Columns Are Easier Than Rows

| Operation               | Risk              |
| ----------------------- | ----------------- |
| Add nullable column     | 🟢 Safe           |
| Add column with default | 🟡 May lock table |
| Drop column             | 🔴 Dangerous      |
| Change datatype         | 🔴 Very dangerous |
| Add new table           | 🟢 Safe           |

SA insight:

> **Prefer additive changes over mutative ones**

---

## 5. Common Migration Patterns (Interview Gold)

### 5.1 Dual Write Pattern

Application writes to:

- Old schema (for old services)
- New schema (for new services)

Used when:

- Gradual rollout
- Multiple consumers

Risk:

- Inconsistency → needs reconciliation

---

### 5.2 Read-Old / Write-New

- Reads fallback to old if new data missing
- Writes only to new schema

Used when:

- You want fast migration
- Old data is static or rarely updated

---

### 5.3 Shadow Columns / Tables

Create:

- `user_v2`
- `orders_new`

Validate:

- Data parity
- Performance
- Query correctness

Only then switch traffic.

---

## 6. Zero-Downtime Migration Strategy (Very Important)

### 6.1 Why DDL Is Dangerous

Some DBs lock tables:

- MySQL (older versions)
- Postgres (certain alters)

As SA, you must:

- Choose online schema tools
- Plan migration windows

Examples:

- `pt-online-schema-change`
- `gh-ost`
- Native Postgres `CONCURRENTLY`

---

### 6.2 Index Changes (Classic Pitfall)

❌

```sql
CREATE INDEX idx_email ON users(email);
```

✅

```sql
CREATE INDEX CONCURRENTLY idx_email ON users(email);
```

---

## 7. Microservices & Schema Evolution

### 7.1 Database per Service (Ideal)

- Each service owns its schema
- No cross-service joins
- Versioned APIs instead of shared DB

👉 Backward compatibility moves to **API layer**

---

### 7.2 Shared Database (Reality)

If unavoidable:

- Read-only access for consumers
- Schema change approvals
- Contract testing on DB schema

SA red flag 🚩:

> Multiple services writing to same table

---

## 8. Handling Enums & Reference Data

❌ Hard-coded enums:

```sql
status ENUM('NEW','PAID','CANCELLED');
```

Why bad:

- Requires DDL for new value
- Breaks older apps

✅ Better:

- Lookup table
- String with validation in app

---

## 9. Rollback Strategy (Often Missed)

SA-level question:

> “What if deployment fails halfway?”

You must ensure:

- Schema change is reversible
- App can run on both schemas

Rules:

- Never delete data in same release
- Backward-compatible schema first
- App rollback should still work

---

## 10. Observability & Validation

Before final cutover:

- Compare row counts
- Checksums / hashes
- Shadow reads
- Metrics on read/write paths

---

## 11. SA Interview Talking Points (Use These)

You should say things like:

> “I treat database schema as a versioned contract and always follow expand–migrate–contract to guarantee backward compatibility.”

> “I optimize schema design for **change velocity**, not just normalization.”

> “I avoid destructive DDL in the same release and prefer additive changes with observability.”

---

## 12. Quick Cheat Sheet 📝

| Do                   | Don’t                   |
| -------------------- | ----------------------- |
| Add nullable columns | Rename columns directly |
| Version schemas      | Share writable DBs      |
| Use expand–contract  | Drop data early         |
| Plan rollback        | Assume single deploy    |
| Validate data parity | Trust migration blindly |

---

## 13. Want This as SA Notes / PDF?

If you want, I can:

- Convert this into **SA interview notes**
- Add **real-world case studies (eCommerce, payments, ERP)**
- Create **LLD + migration diagram**
- Map answers to **system design interview questions**

Just tell me 👍
