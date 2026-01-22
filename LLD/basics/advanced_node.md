# Advanced Node.js

## Worker Threads vs Child Processes for CPU-Bound Tasks

_(Architectural Perspective)_

---

## 1. Core architectural problem

Node.js has:

- **Single-threaded JS execution**
- **Shared event loop per process**

CPU-bound tasks:

- Block the event loop
- Degrade latency for _all_ requests
- Break Node’s concurrency model

Architectural question is **not**:

> “How do I run CPU code?”

It is:

> **“How do I isolate CPU work without hurting the rest of the system?”**

---

## 2. Two isolation mechanisms in Node.js

| Mechanism       | Isolation level         |
| --------------- | ----------------------- |
| Worker Threads  | Thread-level isolation  |
| Child Processes | Process-level isolation |

Both move CPU work **off the main event loop**, but with **very different trade-offs**.

---

## 3. Worker Threads — shared process, shared memory

### 3.1 What Worker Threads really are

- Multiple JS threads
- Same Node.js process
- Same binary, same heap space (optionally shared)
- Communicate via:
  - Message passing
  - SharedArrayBuffer

Think of them as:

> **“CPU helpers inside the same service instance.”**

---

### 3.2 Architectural strengths

✔ Lower startup cost than processes
✔ Faster communication
✔ Shared memory possible
✔ Ideal for **moderate CPU workloads**

Example use cases:

- Password hashing
- PDF generation
- Data aggregation
- Medium JSON transformations

---

### 3.3 Architectural risks

❌ Shared memory = shared failure risk
❌ Memory leaks affect entire process
❌ Crashes can take down the whole service
❌ Harder debugging & concurrency issues

> Worker Threads improve performance but **reduce fault isolation**.

---

## 4. Child Processes — full isolation boundary

### 4.1 What Child Processes really are

- Separate OS process
- Separate V8 instance
- Separate memory & GC
- Communicate via IPC

Think of them as:

> **“Microservices without network hops.”**

---

### 4.2 Architectural strengths

✔ Strong isolation
✔ Independent crashes
✔ Separate memory limits
✔ Easier to reason about failure modes

Ideal for:

- Heavy CPU workloads
- Untrusted logic
- Long-running jobs
- ML / image / video processing

---

### 4.3 Architectural costs

❌ Higher startup overhead
❌ Slower IPC
❌ Higher memory usage
❌ More operational complexity

> Child processes trade performance for **stability and safety**.

---

## 5. Side-by-side architectural comparison

| Dimension    | Worker Threads    | Child Processes |
| ------------ | ----------------- | --------------- |
| Isolation    | Medium            | Strong          |
| Startup cost | Low               | High            |
| Memory       | Shared / optional | Fully separate  |
| Crash impact | Whole process     | Single worker   |
| IPC speed    | Fast              | Slower          |
| Debugging    | Harder            | Easier          |
| Scaling      | In-process        | OS-level        |

---

## 6. Decision framework (architect-level)

### Use **Worker Threads** when:

- CPU tasks are **short-lived**
- Code is **trusted**
- Low latency matters
- You want to keep everything in one service
- Failure impact is acceptable

### Use **Child Processes** when:

- CPU tasks are **heavy or unpredictable**
- You need **fault isolation**
- Memory usage is high
- Tasks can be retried
- Stability > raw performance

> Architect rule:
> **“If failure must not impact request handling, use processes.”**

---

## 7. Scaling implications

### 7.1 Worker Threads scaling

- Bound by:
  - CPU cores
  - Shared memory
  - Event loop coordination

Works best:

- Inside horizontally scaled services
- With thread pools
- For predictable workloads

---

### 7.2 Child Process scaling

- Scale via:
  - OS scheduler
  - Process pools
  - Kubernetes jobs
  - Queue consumers

Enables:

- Backpressure
- Rate limiting
- Retry policies
- Independent autoscaling

---

## 8. Worker Threads are NOT a silver bullet

Common mistake:

> “We added worker threads, Node is now multithreaded.”

Reality:

- Main thread still schedules work
- Bad orchestration still blocks
- Poor pooling causes thrashing

Architectural requirement:

- Controlled concurrency
- Bounded pools
- Backpressure awareness

---

## 9. When neither is enough

At some scale:

- Node.js should **delegate**, not compute

Architectural escape hatches:

- Dedicated compute services (Go / Java / Python)
- Message queues (SQS, RabbitMQ, Kafka)
- Batch jobs
- Serverless workers

> Node.js shines as a **control plane**, not a compute plane.

---

## 10. Observability & operations (often ignored)

Architects must monitor:

- CPU saturation per worker
- Event loop lag
- Memory per process
- IPC latency

Without observability:

- Worker threads silently degrade performance
- Child processes turn into zombies

---

## 11. Interview-ready summary

> _In Node.js, worker threads and child processes are architectural tools for isolating CPU-bound work from the event loop. Worker threads provide low-latency, in-process parallelism with shared memory and lower overhead but weaker fault isolation. Child processes offer strong isolation and independent failure domains at the cost of higher startup and communication overhead. Architecturally, worker threads suit moderate, trusted workloads, while child processes are preferred for heavy, unpredictable, or safety-critical computation._

---

## 12. Architect mindset takeaway

> **Concurrency is not the goal — isolation is.**
> Choose the model based on **failure impact**, not just speed.

---

If you want next:

- Decision flowchart (1-page)
- Sample **ADR** for choosing workers vs processes
- Kubernetes + Node CPU strategy
- Real production failure stories & lessons

Just tell me how deep you want to go 🚀
