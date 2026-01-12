# Graphic Designer Application - LLD Solution (Refactored)

## Problem Overview
Design a graphic designer application that allows users to create, manipulate, and arrange different graphical elements (Picture, TextBox, Rectangle) with full undo/redo functionality for all operations.

## 🔄 Architectural Refactoring Summary

This solution has been refactored to improve architecture and support multi-document workflows:

### ✅ What Changed
| **Before** | **After** | **Benefits** |
|------------|-----------|--------------|
| `Editor` + `CommandManager` | `Design` (merged) | Simplified architecture, reduced object interactions |
| Single editor instance | `Workspace` with `designs: Design[]` | Multi-document support, better organization |
| Delegated command management | Integrated command handling | Better encapsulation, improved performance |
| Generic "Editor" naming | Semantic "Design" naming | Clearer domain modeling |

### 🏗️ New Class Structure
```typescript
class Workspace {
    public designs: Design[] = [];  // Multiple design documents
}

class Design {  // Formerly Editor
    private elements: Map<string, DesignElement> = new Map();
    private undoStack: Command[] = [];  // Integrated command management
    private redoStack: Command[] = [];  // No separate CommandManager needed
}
```

## Refactored Solution Approach

This solution implements several key design patterns with an improved architecture:

1. **Command Pattern**: For undo/redo functionality
2. **Prototype Pattern**: For cloning design elements  
3. **Template Method Pattern**: Base DesignElement with abstract methods
4. **Memento Pattern**: State preservation for undo operations
5. **Factory Pattern**: Could be added for element creation

### Key Architectural Changes
- **Merged CommandManager into Design**: Eliminated separate CommandManager class by integrating command management directly into the Design class
- **Renamed Editor to Design**: Better semantic meaning - each Design represents a canvas/design document
- **Added Workspace Class**: Container for multiple Design instances, supporting multi-document workflows
- **Independent Design Operations**: Each Design maintains its own undo/redo stack and element collection

## Complete System Architecture

```mermaid
classDiagram
    class ElementType {
        <<enumeration>>
        PICTURE
        TEXTBOX
        RECTANGLE
    }
    
    class DesignElement {
        <<abstract>>
        +id: string
        +type: ElementType
        +x: number
        +y: number
        +constructor(id: string, type: ElementType, x: number, y: number)
        +clone* DesignElement
        +toString* string
    }
    
    class Picture {
        +constructor(id: string, x: number, y: number)
        +clone Picture
        +toString string
    }
    
    class Rectangle {
        +color: string
        +constructor(id: string, x: number, y: number, color: string)
        +clone Rectangle
        +toString string
    }
    
    class TextBox {
        +color: string
        +text: string
        +constructor(id: string, x: number, y: number, color: string, text: string)
        +clone TextBox
        +toString string
    }
    
    class Command {
        <<interface>>
        +execute void
        +undo void
    }
    
    class InsertCommand {
        -design: Design
        -element: DesignElement
        +execute void
        +undo void
    }
    
    class DeleteCommand {
        -design: Design
        -id: string
        -backup: DesignElement
        +execute void
        +undo void
    }
    
    class MoveCommand {
        -design: Design
        -id: string
        -newX: number
        -newY: number
        -prevX: number
        -prevY: number
        +execute void
        +undo void
    }
    
    class ChangeColorCommand {
        -design: Design
        -id: string
        -newColor: string
        -prevColor: string
        +execute void
        +undo void
    }
    
    class ChangeTextCommand {
        -design: Design
        -id: string
        -newText: string
        -prevText: string
        +execute void
        +undo void
    }
    
    class Design {
        -elements: Map~string, DesignElement~
        -undoStack: Command[]
        -redoStack: Command[]
        +execute(cmd: Command) void
        +undo void
        +redo void
        +addElement(el: DesignElement) void
        +removeElement(id: string) void
        +moveElement(id: string, x: number, y: number) void
        +changeColor(id: string, color: string) void
        +changeText(id: string, text: string) void
        +getElement(id: string) DesignElement
        +printState void
    }
    
    class Workspace {
        +designs: Design[]
        +addDesign(design: Design) void
        +removeDesign(index: number) void
        +getDesign(index: number) Design
        +printAllDesigns void
    }
    
    %% Relationships
    DesignElement --> ElementType
    DesignElement <|-- Picture
    DesignElement <|-- Rectangle
    DesignElement <|-- TextBox
    Command <|-- InsertCommand
    Command <|-- DeleteCommand
    Command <|-- MoveCommand
    Command <|-- ChangeColorCommand
    Command <|-- ChangeTextCommand
    InsertCommand --> Design
    InsertCommand --> DesignElement
    DeleteCommand --> Design
    MoveCommand --> Design
    ChangeColorCommand --> Design
    ChangeTextCommand --> Design
    Design --> Command
    Design --> DesignElement
    Workspace --> Design
```

## Command Pattern Implementation (Refactored)

```mermaid
sequenceDiagram
    participant U as User
    participant W as Workspace
    participant D as Design
    participant C as Command
    participant EL as Element
    
    U->>W: Select Design
    W->>D: Get Design Instance
    U->>D: Perform operation (e.g., move element)
    D->>C: Create Command (MoveCommand)
    D->>C: execute
    C->>EL: Modify element state
    D->>D: Push to undoStack
    D->>D: Clear redoStack
    
    Note over U,EL: User wants to undo
    U->>D: undo
    D->>D: Pop from undoStack
    D->>C: undo
    C->>EL: Restore previous state
    D->>D: Push to redoStack
```

## Undo/Redo State Management

```mermaid
stateDiagram-v2
    [*] --> EmptyState
    EmptyState --> HasCommands: Execute Command
    HasCommands --> HasCommands: Execute More Commands
    HasCommands --> UndoAvailable: Command Executed
    
    UndoAvailable --> UndoRedoAvailable: Undo Operation
    UndoRedoAvailable --> UndoAvailable: Undo More
    UndoRedoAvailable --> HasCommands: Execute New Command
    UndoRedoAvailable --> UndoRedoAvailable: Redo Operation
    
    UndoAvailable --> HasCommands: Execute New Command
    HasCommands --> EmptyState: Clear All
```

## Element Lifecycle Management

```mermaid
flowchart TD
    A[Create Element] --> B[Add to Editor]
    B --> C{Operation Type}
    
    C -->|Insert| D[InsertCommand]
    C -->|Delete| E[DeleteCommand] 
    C -->|Move| F[MoveCommand]
    C -->|Change Color| G[ChangeColorCommand]
    C -->|Change Text| H[ChangeTextCommand]
    
    D --> I[Store in Elements Map]
    E --> J[Remove from Elements Map + Backup]
    F --> K[Update Position]
    G --> L[Update Color Property]
    H --> M[Update Text Content]
    
    I --> N[Push to Undo Stack]
    J --> N
    K --> N
    L --> N
    M --> N
```

## Design Element Hierarchy

```mermaid
graph TD
    A[DesignElement Abstract Base] --> B[Common Properties: id, type, x, y]
    A --> C[Abstract Methods: clone, toString]
    
    D[Picture] --> E[Image-specific properties]
    F[Rectangle] --> G[Color property]
    H[TextBox] --> I[Color + Text properties]
    
    A --> D
    A --> F
    A --> H
    
    E --> J[clone implementation]
    G --> K[clone implementation]
    I --> L[clone implementation]
```

## Workspace Architecture

```mermaid
flowchart TD
    A[Workspace] --> B[Design 1]
    A --> C[Design 2]
    A --> D[Design N...]
    
    B --> B1[Elements Map]
    B --> B2[Undo Stack]
    B --> B3[Redo Stack]
    
    C --> C1[Elements Map]
    C --> C2[Undo Stack]
    C --> C3[Redo Stack]
    
    D --> D1[Elements Map]
    D --> D2[Undo Stack]
    D --> D3[Redo Stack]
    
    B1 --> E1[Picture Elements]
    B1 --> E2[Rectangle Elements]
    B1 --> E3[TextBox Elements]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#f3e5f5
    style D fill:#f3e5f5
```

### Multi-Design Management Benefits
- **Independent Operation Histories**: Each design maintains its own undo/redo stack
- **Parallel Editing**: Multiple designs can be worked on simultaneously
- **Resource Isolation**: Changes in one design don't affect others
- **Scalable Architecture**: Easy to add/remove designs from workspace

### Example Usage
```typescript
// Create workspace
const workspace = new Workspace();

// Create multiple designs
const logo = new Design();
const banner = new Design();

// Add elements to different designs
logo.execute(new InsertCommand(logo, new Picture("logo1", 0, 0)));
banner.execute(new InsertCommand(banner, new TextBox("title", 10, 10, "blue", "Welcome")));

// Add designs to workspace
workspace.addDesign(logo);
workspace.addDesign(banner);

// Independent undo operations
logo.undo();    // Only affects logo design
banner.undo();  // Only affects banner design

// View all designs
workspace.printAllDesigns();
```

## Design Operations Flow (Refactored)

```mermaid
flowchart TD
    A[User Action] --> B{Action Type}
    
    B -->|Create| C[New Element Creation]
    B -->|Modify| D[Element Modification]
    B -->|Delete| E[Element Removal]
    B -->|Undo/Redo| F[History Navigation]
    
    C --> G[Create InsertCommand]
    D --> H{Modification Type}
    E --> I[Create DeleteCommand]
    F --> J[Design Internal Operation]
    
    H -->|Move| K[Create MoveCommand]
    H -->|Color| L[Create ChangeColorCommand]
    H -->|Text| M[Create ChangeTextCommand]
    
    G --> N[Execute via Design.execute]
    I --> N
    K --> N
    L --> N
    M --> N
    J --> O[Update Design State]
    N --> O
```

## State Preservation Strategy

```mermaid
graph LR
    subgraph "Before Command"
        A1[Element State A]
    end
    
    subgraph "Command Execution"
        B1[Capture Previous State]
        B2[Apply Changes]
        B3[Store Command in Stack]
    end
    
    subgraph "After Command"
        C1[Element State B]
    end
    
    subgraph "Undo Operation"
        D1[Restore Previous State]
        D2[Move Command to Redo Stack]
    end
    
    A1 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> C1
    C1 --> D1
    D1 --> D2
```

## Memory Management for Undo/Redo

```mermaid
pie title Command Stack Memory Usage
    "Active Commands" : 40
    "Undo Stack" : 35
    "Redo Stack" : 15
    "Available Memory" : 10
```

## Element Cloning Strategy (Prototype Pattern)

```mermaid
sequenceDiagram
    participant C as Command
    participant E as Element
    participant N as New Element
    
    Note over C: Need to backup element state
    C->>E: clone
    E->>N: Create new instance
    E->>N: Copy all properties
    N-->>C: Return cloned element
    
    Note over C: Store backup for undo operation
    C->>C: Store cloned element as backup
```

## Scenario Walkthrough: Complete User Interaction

```mermaid
journey
    title Design Element Manipulation Journey
    section Create
      User creates TextBox: 5: User
      Insert command executed: 4: System
      Element added to canvas: 5: User
    section Modify
      User moves TextBox: 4: User
      Move command executed: 4: System
      Position updated: 4: User
      User changes text color: 3: User
      Color command executed: 4: System
    section Undo/Redo
      User hits undo: 5: User
      Color change reverted: 5: System
      User hits redo: 4: User
      Color change reapplied: 4: System
    section Clean Up
      User deletes element: 3: User
      Delete command executed: 4: System
      Element removed: 3: User
```

## Error Handling and Validation

```mermaid
flowchart TD
    A[Command Execution] --> B{Validation Check}
    B -->|Valid| C[Execute Command]
    B -->|Invalid| D[Log Error & Skip]
    
    C --> E{Execution Successful?}
    E -->|Yes| F[Add to Undo Stack]
    E -->|No| G[Rollback Changes]
    
    F --> H[Clear Redo Stack]
    G --> I[Maintain Previous State]
    D --> I
    H --> J[Operation Complete]
    I --> J
```

## Performance Optimization Strategies

### 1. Command Batching
```mermaid
graph TD
    A[Multiple Rapid Operations] --> B[Batch Commands]
    B --> C[Single Composite Command]
    C --> D[Reduce Stack Size]
    D --> E[Improve Performance]
```

### 2. Memory Limit Management
```mermaid
flowchart TD
    A[Check Stack Size] --> B{Exceeds Limit?}
    B -->|No| C[Add Command]
    B -->|Yes| D[Remove Oldest Commands]
    D --> E[Compact Stack]
    E --> C
    C --> F[Update Memory Usage]
```

## Extensibility Features

### 1. New Element Types
```mermaid
classDiagram
    class DesignElement {
        <<abstract>>
    }
    
    class Circle {
        +radius: number
        +color: string
    }
    
    class Line {
        +startX: number
        +startY: number
        +endX: number
        +endY: number
        +color: string
    }
    
    DesignElement <|-- Circle
    DesignElement <|-- Line
```

### 2. Complex Operations
```mermaid
classDiagram
    class CompositeCommand {
        -commands: Command[]
        +addCommand(cmd: Command) void
        +execute void
        +undo void
    }
    
    class GroupCommand {
        -elementIds: string[]
        +execute void
        +undo void
    }
    
    Command <|-- CompositeCommand
    Command <|-- GroupCommand
```

## Refactored Architecture Benefits

### 1. **Simplified Command Management**
- **Before**: Separate `CommandManager` class with delegation pattern
- **After**: Integrated command management directly into `Design` class
- **Benefit**: Reduced complexity, fewer object interactions, better encapsulation

### 2. **Enhanced Multi-Document Support**
- **New Feature**: `Workspace` class managing multiple `Design` instances
- **Benefit**: Support for multiple concurrent design documents
- **Use Case**: Users can work on multiple projects simultaneously

### 3. **Independent Design Operations**
- **Architecture**: Each `Design` maintains its own undo/redo stacks
- **Benefit**: Operations in one design don't affect others
- **Memory**: Isolated command histories prevent cross-design interference

### 4. **Improved Semantic Clarity**
- **Naming**: `Editor` → `Design` better represents individual design documents
- **Structure**: `Workspace.designs: Design[]` clearly expresses the relationship
- **API**: More intuitive method calls and class responsibilities

### 5. **Better Scalability**
```mermaid
graph TB
    subgraph "Old Architecture"
        A1[Editor] --> A2[CommandManager]
        A1 --> A3[Elements]
    end
    
    subgraph "New Architecture"
        B1[Workspace] --> B2[Design 1]
        B1 --> B3[Design 2]
        B1 --> B4[Design N]
        B2 --> B5[Elements + Commands]
        B3 --> B6[Elements + Commands]
        B4 --> B7[Elements + Commands]
    end
```

## Key Features

### 1. **Full Undo/Redo Support**
- Command pattern ensures every operation is reversible
- Separate undo and redo stacks maintain operation history
- State preservation through element cloning

### 2. **Extensible Element System**
- Abstract base class allows easy addition of new element types
- Prototype pattern enables deep copying of complex elements
- Type-safe operations through inheritance hierarchy

### 3. **Integrated Command Management**
- Each operation encapsulated as a command object
- Direct command management within Design class (no separate CommandManager)
- Consistent execute/undo interface across all operations
- Automatic redo stack clearing on new operations

### 4. **Multi-Design Workspace**
- Support for multiple concurrent design documents
- Independent undo/redo stacks per design
- Workspace-level design management operations
- Isolated element collections per design

### 5. **Memory Efficient Design**
- Elements stored in efficient Map structure per design
- Minimal memory overhead for command storage
- Lazy evaluation of backup states
- Independent memory management per design instance

## Performance Characteristics

### Single Design Operations
- **Element Access**: O(1) with Map-based storage per design
- **Command Execution**: O(1) for single operations
- **Undo/Redo**: O(1) stack operations per design
- **Memory Usage per Design**: O(n + c) where n = elements, c = command history

### Workspace Operations  
- **Design Access**: O(1) array-based access to designs
- **Multi-Design Memory**: O(d × (n + c)) where d = number of designs
- **Design Isolation**: Independent performance per design instance
- **Scalability**: Linear scaling with number of designs

### Architecture Benefits
- **Reduced Object Creation**: Eliminated CommandManager delegation overhead
- **Better Cache Locality**: Commands and elements co-located in Design class  
- **Independent Scaling**: Each design's performance is isolated
- **Memory Efficiency**: No shared state between designs reduces contention

This refactored design provides a robust foundation for a multi-document graphic design application with professional-grade undo/redo functionality, improved performance characteristics, and enhanced scalability for concurrent design workflows.