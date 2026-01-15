---
NODE.JS RUNTIME BASICS — SOFTWARE ARCHITECT REFERENCE
(Event Loop, Async Execution Model, Performance Implications)
---

# 1. OVERVIEW

Node.js is a single-threaded, event-driven JavaScript runtime optimized for high-concurrency I/O workloads.

Core components:

- V8: Executes JavaScript
- libuv: Manages the event loop and async I/O
- OS async APIs: Handle network operations

Architectural trade-off:
Node.js provides excellent I/O concurrency but limited CPU parallelism.

---

# 2. EVENT LOOP (CORE CONCEPT)

The event loop schedules and executes all callbacks in Node.js.

Event loop phases:

1. Timers (setTimeout, setInterval)
2. I/O callbacks
3. Poll phase (most backend work happens here)
4. Check phase (setImmediate)
5. Close callbacks

Microtasks vs Macrotasks:

Microtasks:

- process.nextTick
- Promise.then / catch

Macrotasks:

- Timers
- I/O callbacks

Execution priority:

1. process.nextTick
2. Promise microtasks
3. Event loop phase callbacks

Important note:
Excessive microtasks can starve the event loop and block I/O.

---

# 3. ASYNC EXECUTION MODEL

Node.js is not magically async. Different operations execute in different places.

Execution locations:

- JavaScript logic runs on the event loop (single thread)
- Network I/O uses OS-level async
- File system operations use libuv thread pool
- Crypto and DNS also use libuv thread pool

libuv thread pool:

- Default size: 4
- Shared across file system, crypto, and DNS
- Can become an invisible bottleneck

Thread pool size can be increased using:
UV_THREADPOOL_SIZE

Increase only after measuring saturation.

---

# 4. SINGLE THREAD DOES NOT MEAN SINGLE CORE

JavaScript execution:

- Single thread

Supporting execution:

- libuv thread pool uses multiple threads
- OS kernel uses multiple cores

CPU-bound work is a weakness in Node.js.

Examples of CPU-bound tasks:

- Image processing
- PDF generation
- Large JSON parsing or serialization
- Tight computation loops

Architectural solutions:

- Worker threads
- Queue-based async jobs
- Offloading to separate compute services

---

# 5. PERFORMANCE IMPLICATIONS

## 5.1 Event Loop Blocking

Any long-running synchronous code blocks the entire server.

Impact:

- All requests stall
- Latency spikes across users
- Cascading timeouts

Key rule:
One blocking request can degrade the entire instance.

---

5.2 Memory and Garbage Collection

Node.js uses V8 garbage collection.

Problems:

- Large objects cause long GC pauses
- High object churn reduces throughput
- Memory leaks cause out-of-memory crashes

Mitigations:

- Use streaming APIs
- Avoid large in-memory buffers
- Control object lifetimes carefully

---

## 5.3 Backpressure

Problem:

- Fast producer
- Slow consumer

Effects:

- Memory growth
- Increased latency
- Event loop pressure

Solutions:

- Node.js streams
- Queue-based buffering
- Rate limiting

---

# 6. SCALING NODE.JS

Vertical scaling:

- Limited due to single-threaded JavaScript execution
- CPU-heavy workloads do not scale vertically

Horizontal scaling:

- Multiple Node.js processes
- Cluster mode or process managers
- Kubernetes pods (one core per pod)
- Stateless services are mandatory

---

# 7. COMMON FAILURE SCENARIOS

Scenario 1: Latency spike with low CPU usage

Possible causes:

- Event loop blocking
- libuv thread pool saturation
- Garbage collection pauses

What to check:

- Event loop delay metrics
- Thread pool utilization
- Heap memory usage

---

Scenario 2: Throughput drop with no code changes

Possible cause:

- Increased file system or crypto workload
- Thread pool exhaustion

Fix strategies:

- Increase thread pool size temporarily
- Scale horizontally
- Offload heavy tasks

---

# 8. INTERVIEW SOUND BITES (MEMORIZE)

- Async does not mean parallel
- Node.js trades CPU parallelism for I/O concurrency
- Protecting the event loop is an architectural responsibility
- CPU-heavy work must be isolated from the request lifecycle

---

# 9. WHEN TO USE NODE.JS

Good fit:

- APIs
- Backend-for-Frontend layers
- Real-time systems
- High-concurrency I/O services

Poor fit:

- CPU-heavy workloads
- Deterministic low-latency compute systems

---

# 10. ONE-LINE ARCHITECT SUMMARY

Node.js is ideal for high-concurrency I/O systems. A software architect must protect the event loop, isolate CPU-heavy work, and scale horizontally to ensure predictable performance.

---
