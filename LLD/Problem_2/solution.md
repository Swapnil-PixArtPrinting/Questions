# Elevator System - LLD Solution

## Problem Overview
Design a customizable, reusable elevator system that supports multiple buildings with multiple elevators and floors. The system should efficiently handle elevator requests and optimize elevator dispatching.

## Solution Approach

This solution implements a **comprehensive elevator control system** using several design patterns:

1. **State Machine Pattern**: Elevator status and direction management
2. **Command Pattern**: Button presses create requests
3. **Strategy Pattern**: Elevator assignment strategies
4. **Observer Pattern**: Request handling and notifications
5. **Singleton Pattern**: Central controller for the building

## Complete System Architecture

```mermaid
classDiagram
    class Direction {
        <<enumeration>>
        UP
        DOWN
        IDLE
    }
    
    class ElevatorStatus {
        <<enumeration>>
        MOVING
        IDLE
        MAINTENANCE
    }
    
    class ElevatorRequest {
        +floor: number
        +direction: Direction
        +constructor(floor: number, direction: Direction)
    }
    
    class Button {
        -floor: number
        -direction: Direction
        -controller: ElevatorController
        +press() void
    }
    
    class Floor {
        +number: number
        +upButton: Button
        +downButton: Button
        +constructor(number: number, controller: ElevatorController)
    }
    
    class Elevator {
        +id: number
        +currentFloor: number
        +direction: Direction
        +status: ElevatorStatus
        -stopsQueue: number[]
        +addStop(floor: number) void
        +step() void
        +isIdle() boolean
        -updateDirection() void
    }
    
    class ElevatorController {
        -requestQueue: ElevatorRequest[]
        -elevators: Elevator[]
        +handleRequest(request: ElevatorRequest) void
        +assignElevator(request: ElevatorRequest) Elevator
        +stepAllElevators() void
    }
    
    class Building {
        +totalFloors: number
        +totalElevators: number
        +elevators: Elevator[]
        +floors: Floor[]
        +controller: ElevatorController
        +stepSystem() void
    }
    
    ElevatorRequest --> Direction
    Button --> Direction
    Button --> ElevatorController
    Floor --> Button
    Elevator --> Direction
    Elevator --> ElevatorStatus
    ElevatorController --> Elevator
    ElevatorController --> ElevatorRequest
    Building --> Elevator
    Building --> Floor
    Building --> ElevatorController
```

## Elevator State Machine

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> MOVING: Request Received
    MOVING --> IDLE: No More Stops
    MOVING --> MOVING: Continue to Next Stop
    IDLE --> MAINTENANCE: Maintenance Required
    MAINTENANCE --> IDLE: Maintenance Complete
    MOVING --> MAINTENANCE: Emergency Stop
```

## Request Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Button
    participant F as Floor
    participant EC as ElevatorController
    participant E as Elevator
    
    U->>B: Press button (floor 5, UP)
    B->>EC: handleRequest(ElevatorRequest)
    EC->>EC: assignElevator(request)
    
    alt Idle Elevator Available
        EC->>E: addStop(floor 5)
        E->>E: Update stops queue & direction
    else No Idle Elevator
        EC->>EC: Find nearest elevator
        EC->>E: addStop(floor 5)
    else All Elevators Busy
        EC->>EC: Queue request
    end
    
    loop System Step
        EC->>E: step()
        E->>E: Move toward next stop
        alt Reached Stop
            E->>E: Remove stop from queue
            E->>U: Door opens at floor 5
        end
    end
```

## Elevator Movement Algorithm

```mermaid
flowchart TD
    A[Elevator.step] --> B{Has stops in queue?}
    B -->|No| C[Set status to IDLE]
    B -->|Yes| D[Get next stop]
    
    D --> E{Current floor vs Next stop}
    E -->|Below| F[Move up one floor]
    E -->|Above| G[Move down one floor]
    E -->|Equal| H[Stop at floor & open doors]
    
    F --> I[Set direction to UP]
    G --> J[Set direction to DOWN]
    H --> K[Remove stop from queue]
    
    I --> L[Continue movement]
    J --> L
    K --> L
    L --> M[Update direction based on remaining stops]
```

## Elevator Assignment Strategy

```mermaid
flowchart TD
    A[New Request Received] --> B{Any idle elevators?}
    B -->|Yes| C[Assign idle elevator]
    B -->|No| D[Find nearest elevator]
    
    D --> E[Calculate distance for each elevator]
    E --> F[Select elevator with minimum distance]
    F --> G[Add stop to selected elevator]
    C --> G
    
    G --> H{Elevator available?}
    H -->|Yes| I[Process immediately]
    H -->|No| J[Add to request queue]
```

## Queue Management System

```mermaid
graph TD
    subgraph "Elevator Internal Queue"
        A1[Stop 1] --> A2[Stop 2]
        A2 --> A3[Stop N]
    end
    
    subgraph "Controller Request Queue"
        B1[Request 1] --> B2[Request 2]
        B2 --> B3[Request N]
    end
    
    subgraph "Processing Logic"
        C[Process Internal Queue First]
        D[Then Process Waiting Requests]
    end
    
    A1 --> C
    B1 --> D
    C --> D
```

## Building System Integration

```mermaid
graph TB
    subgraph "Building System"
        subgraph "Floor Level"
            F1[Floor 1] --> FB1[Up/Down Buttons]
            F2[Floor 2] --> FB2[Up/Down Buttons]
            FN[Floor N] --> FBN[Up/Down Buttons]
        end
        
        subgraph "Elevator Pool"
            E1[Elevator 1]
            E2[Elevator 2]
            EN[Elevator N]
        end
        
        subgraph "Control System"
            EC[ElevatorController]
        end
    end
    
    FB1 --> EC
    FB2 --> EC
    FBN --> EC
    
    EC --> E1
    EC --> E2
    EC --> EN
```

## Optimization Strategies

### 1. Direction-Based Optimization
```mermaid
graph LR
    A[Request: Floor 7, UP] --> B{Elevator Direction}
    B -->|Moving UP| C[High Priority - Same direction]
    B -->|Moving DOWN| D[Lower Priority - Opposite direction]
    B -->|IDLE| E[Medium Priority - Available]
```

### 2. Load Balancing
```mermaid
pie title Elevator Load Distribution
    "Elevator 1 Load" : 30
    "Elevator 2 Load" : 25
    "Elevator 3 Load" : 20
    "Available Capacity" : 25
```

## Advanced Features Implementation

### 1. Priority Requests (VIP, Emergency)
```mermaid
classDiagram
    class PriorityRequest {
        +floor: number
        +direction: Direction
        +priority: Priority
        +timestamp: Date
    }
    
    class Priority {
        <<enumeration>>
        EMERGENCY
        VIP
        NORMAL
    }
    
    PriorityRequest --> Priority
```

### 2. Energy Optimization
```mermaid
flowchart TD
    A[Request Received] --> B{Multiple Elevators Available?}
    B -->|Yes| C[Calculate Energy Cost]
    B -->|No| D[Use Available Elevator]
    
    C --> E[Distance Factor]
    C --> F[Current Load Factor]
    C --> G[Direction Alignment]
    
    E --> H[Select Most Efficient]
    F --> H
    G --> H
    
    H --> I[Assign Elevator]
    D --> I
```

## Error Handling and Recovery

```mermaid
flowchart TD
    A[System Operation] --> B{Error Detected?}
    B -->|No| A
    B -->|Yes| C{Error Type}
    
    C -->|Elevator Stuck| D[Switch to Maintenance Mode]
    C -->|Overload| E[Reject Additional Requests]
    C -->|Sensor Failure| F[Use Backup Systems]
    
    D --> G[Redistribute Requests]
    E --> H[Queue Management]
    F --> I[Safe Mode Operation]
    
    G --> J[Resume Normal Operation]
    H --> J
    I --> J
    J --> A
```

## Performance Metrics Dashboard

```mermaid
graph TD
    subgraph "Key Metrics"
        A[Average Wait Time]
        B[Elevator Utilization]
        C[Energy Consumption]
        D[Request Queue Length]
    end
    
    subgraph "Real-time Monitoring"
        E[Floor Traffic Patterns]
        F[Peak Hours Analysis]
        G[Maintenance Alerts]
    end
    
    A --> M[System Dashboard]
    B --> M
    C --> M
    D --> M
    E --> M
    F --> M
    G --> M
```

## Scalability Considerations

### 1. Multi-Building Support
```mermaid
classDiagram
    class BuildingManager {
        -buildings: Building[]
        +addBuilding(building: Building) void
        +getBuildingById(id: string) Building
    }
    
    class Building {
        +id: string
        +elevators: Elevator[]
        +floors: Floor[]
    }
    
    BuildingManager --> Building
```

### 2. Distributed System Architecture
```mermaid
graph TD
    subgraph "Building A"
        A1[Elevator Controller A]
        A2[Elevators A1-A3]
    end
    
    subgraph "Building B"
        B1[Elevator Controller B]
        B2[Elevators B1-B4]
    end
    
    subgraph "Central Management"
        C[Master Controller]
        D[Analytics Service]
        E[Maintenance Service]
    end
    
    A1 --> C
    B1 --> C
    C --> D
    C --> E
```

## Testing Strategy

### 1. Unit Tests
- Individual elevator movement logic
- Request queue management
- Button press handling
- State transitions

### 2. Integration Tests
- End-to-end request processing
- Multiple elevator coordination
- Load balancing verification

### 3. Load Tests
- Peak hour simulation
- Stress testing with multiple concurrent requests
- Performance under high load

## Key Features

### 1. **Intelligent Dispatching**
- Nearest elevator assignment
- Direction-based optimization
- Load balancing across elevators

### 2. **Queue Management**
- Priority-based request handling
- Efficient stop sorting
- Request queuing for busy periods

### 3. **State Management**
- Clear elevator state transitions
- Direction tracking
- Status monitoring

### 4. **Scalable Architecture**
- Multiple building support
- Configurable elevator count
- Flexible floor configuration

## Performance Characteristics

- **Request Processing**: O(n) where n = number of elevators
- **Stop Queue Management**: O(log n) for sorted insertion
- **Elevator Assignment**: O(n) for distance calculation
- **Memory Usage**: O(f + e + r) where f=floors, e=elevators, r=requests

This design provides a robust, scalable elevator system that can efficiently handle multiple requests while optimizing for user experience and energy efficiency.