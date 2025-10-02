# Robot Restaurant System - LLD Solution

## Problem Overview
Design a restaurant management system where robot waiters handle customer orders, interact with a third-party kitchen API, and ensure high customer satisfaction through efficient task management.

## Solution Approach

This solution implements an **event-driven architecture** with the **Observer Pattern** and **Command Pattern** to manage restaurant operations efficiently:

1. **Event-Driven Design**: Uses EventEmitter for asynchronous order notifications
2. **Observer Pattern**: OrderManager notifies WaiterRobots when orders are ready
3. **Command Pattern**: Tasks are queued and processed by robot waiters
4. **Adapter Pattern**: KitchenAdapter wraps the third-party Kitchen API

## Complete System Architecture

```mermaid
classDiagram
    class KitchenAPI {
        <<interface>>
        +Make(order: Order) void
        +IsReady(order: Order) boolean
        +Get(order: Order) Order
    }
    
    class KitchenAdapter {
        -kitchen: KitchenAPI
        +makeOrder(order: Order) void
        +isReady(order: Order) boolean
        +getOrder(order: Order) Order
    }
    
    class OrderManager {
        -pendingOrders: Order[]
        -kitchen: KitchenAdapter
        +placeOrder(order: Order) void
        -pollOrders() void
        +emit(event: string, order: Order) boolean
        +on(event: string, callback: Function) this
    }
    
    class Order {
        +id: number
        +item: string
        +tableId: number
        +status: OrderStatus
        +constructor(item: string, tableId: number)
    }
    
    class WaiterRobot {
        +id: number
        -taskQueue: WaiterTask[]
        -busy: boolean
        -orderManager: OrderManager
        +takeOrder(item: string, tableId: number) boolean
        +enqueueTask(task: WaiterTask) void
        +isFree() boolean
        -processQueue() void
        -deliverFood(order: Order) void
        -serveWater(tableId: number) void
    }
    
    class Customer {
        +name: string
        +tableId: number
        -waiter: WaiterRobot
        -menu: Menu
        +orderFood(item: string) boolean
        +requestWater() void
    }
    
    class Table {
        +id: number
        +customers: Customer[]
    }
    
    class MenuItem {
        +name: string
        +price: number
        +description: string
        +preparationTime: number
    }
    
    class Menu {
        -items: Map~string, MenuItem~
        +addItem(item: MenuItem) void
        +getItem(name: string) MenuItem
        +getAllItems() MenuItem[]
        +hasItem(name: string) boolean
    }
    
    class Restaurant {
        -kitchen: KitchenAdapter
        -orderManager: OrderManager
        -waiters: WaiterRobot[]
        -tables: Table[]
        -menu: Menu
        +addCustomerToTable(name: string, tableId: number) Customer
        -initializeMenu() void
    }
    
    %% Relationships
    KitchenAdapter --> KitchenAPI
    OrderManager --> KitchenAdapter
    OrderManager --> Order
    WaiterRobot --> OrderManager
    WaiterRobot --> Order
    Customer --> WaiterRobot
    Customer --> Menu
    Table --> Customer
    Restaurant --> KitchenAdapter
    Restaurant --> OrderManager
    Restaurant --> WaiterRobot
    Restaurant --> Table
    Restaurant --> Menu
    Menu --> MenuItem
```

## Order Processing Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant WR as WaiterRobot
    participant OM as OrderManager
    participant KA as KitchenAdapter
    participant K as Kitchen (3rd Party)
    
    C->>WR: orderFood("Ratatouille")
    WR->>WR: Create Order object
    WR->>OM: placeOrder(order)
    OM->>KA: makeOrder(order)
    KA->>K: Make(order)
    K-->>KA: Order sent to kitchen
    OM->>OM: Add to pendingOrders[]
    
    Note over OM: Polling every 1 second
    loop Order Polling
        OM->>KA: isReady(order)
        KA->>K: IsReady(order)
        K-->>KA: boolean response
        alt Order Ready
            OM->>KA: getOrder(order)
            KA->>K: Get(order)
            K-->>KA: Return completed order
            OM->>OM: Remove from pendingOrders
            OM->>WR: emit('orderReady', order)
            WR->>WR: enqueueTask({type: 'deliver', order})
            WR->>WR: processQueue()
            WR->>C: deliverFood(order)
        end
    end
```

## Task Management System

```mermaid
stateDiagram-v2
    [*] --> TaskQueue: New Task Added
    TaskQueue --> Processing: Robot Available
    TaskQueue --> Waiting: Robot Busy
    
    Processing --> DeliverFood: Task Type = deliver
    Processing --> ServeWater: Task Type = water
    
    DeliverFood --> TaskComplete: Order Delivered
    ServeWater --> TaskComplete: Water Served
    
    TaskComplete --> TaskQueue: Process Next Task
    TaskComplete --> [*]: Queue Empty
    
    Waiting --> Processing: Robot Becomes Free
```

## Event-Driven Architecture Flow

```mermaid
flowchart TD
    A[Customer Places Order] --> B[WaiterRobot.takeOrder]
    B --> C[OrderManager.placeOrder]
    C --> D[KitchenAdapter.makeOrder]
    D --> E[Kitchen.Make - 3rd Party]
    
    F[OrderManager Polling] --> G{Kitchen.IsReady?}
    G -->|No| F
    G -->|Yes| H[Kitchen.Get]
    H --> I[OrderManager emits 'orderReady']
    I --> J[WaiterRobot receives event]
    J --> K[Add delivery task to queue]
    K --> L[Process task queue]
    L --> M[Deliver food to customer]
    M --> N[Order complete]
```

## Key Design Patterns

### 1. Observer Pattern
```mermaid
classDiagram
    class Subject {
        <<interface>>
        +on(event: string, callback: Function)
        +emit(event: string, data: any)
    }
    
    class OrderManager {
        +on(event, callback)
        +emit(event, data)
    }
    
    class WaiterRobot {
        +handleOrderReady(order: Order)
    }
    
    Subject <|-- OrderManager
    OrderManager --> WaiterRobot : notifies
```

### 2. Adapter Pattern
```mermaid
classDiagram
    class KitchenAPI {
        <<3rd Party Interface>>
        +Make(order)
        +IsReady(order)
        +Get(order)
    }
    
    class KitchenAdapter {
        +makeOrder(order)
        +isReady(order)
        +getOrder(order)
    }
    
    class OrderManager {
        +placeOrder(order)
    }
    
    KitchenAdapter --> KitchenAPI
    OrderManager --> KitchenAdapter
```

### 3. Command Pattern (Task Queue)
```mermaid
classDiagram
    class WaiterTask {
        <<union type>>
        +type: 'deliver' | 'water'
        +order?: Order
        +tableId?: number
    }
    
    class WaiterRobot {
        -taskQueue: WaiterTask[]
        +enqueueTask(task: WaiterTask)
        -processQueue()
        -deliverFood(order: Order)
        -serveWater(tableId: number)
    }
    
    WaiterRobot --> WaiterTask
```

## System State Management

```mermaid
graph TD
    subgraph "Order States"
        OS1[pending] --> OS2[ready]
        OS2 --> OS3[delivered]
    end
    
    subgraph "Robot States"
        RS1[free] --> RS2[busy]
        RS2 --> RS1
    end
    
    subgraph "Task States"
        TS1[queued] --> TS2[processing]
        TS2 --> TS3[completed]
    end
```

## Restaurant Workflow

```mermaid
journey
    title Customer Restaurant Experience
    section Arrival
      Customer sits at table: 5: Customer
      Waiter robot assigned: 3: System
    section Ordering
      Customer views menu: 4: Customer
      Customer places order: 5: Customer
      Robot takes order: 4: WaiterRobot
      Order sent to kitchen: 3: OrderManager
    section Waiting
      Kitchen prepares food: 2: Kitchen
      System polls for readiness: 3: System
      Robot receives notification: 4: WaiterRobot
    section Service
      Robot delivers food: 5: WaiterRobot
      Customer enjoys meal: 5: Customer
```

## Scalability Considerations

### Robot Pool Management
```mermaid
graph LR
    subgraph "Load Balancing"
        A[New Order] --> B{Free Robot Available?}
        B -->|Yes| C[Assign to Free Robot]
        B -->|No| D[Assign to Least Busy Robot]
        C --> E[Process Order]
        D --> E
    end
```

### Concurrent Order Processing
```mermaid
gantt
    title Robot Task Timeline
    dateFormat X
    axisFormat %L
    
    section Robot 1
    Take Order 1    :0, 1
    Deliver Order 1 :4, 5
    Serve Water     :6, 7
    
    section Robot 2
    Take Order 2    :1, 2
    Take Order 3    :2, 3
    Deliver Order 2 :5, 6
    Deliver Order 3 :7, 8
```

## Error Handling & Recovery

```mermaid
flowchart TD
    A[Order Processing] --> B{Kitchen Error?}
    B -->|Yes| C[Log Error]
    C --> D[Retry Order]
    D --> E{Retry Successful?}
    E -->|No| F[Notify Customer]
    E -->|Yes| G[Continue Processing]
    B -->|No| G
    
    G --> H{Robot Error?}
    H -->|Yes| I[Reassign to Another Robot]
    H -->|No| J[Normal Processing]
    I --> J
```

## Key Features

### 1. **Asynchronous Order Management**
- Non-blocking order processing
- Event-driven notifications
- Efficient polling of kitchen status

### 2. **Task Queue System**
- Prioritized task processing
- Robot availability tracking
- Concurrent task handling

### 3. **Flexible Menu System**
- Dynamic menu management
- Item validation
- Preparation time tracking

### 4. **Scalable Robot Pool**
- Multiple robot support
- Load distribution
- Fault tolerance

## Performance Characteristics

- **Order Processing**: O(1) for order placement
- **Task Queue**: O(n) for queue processing where n = number of tasks
- **Kitchen Polling**: O(m) where m = number of pending orders
- **Robot Assignment**: O(k) where k = number of robots

This design ensures efficient restaurant operations while maintaining high customer satisfaction through systematic task management and event-driven coordination.