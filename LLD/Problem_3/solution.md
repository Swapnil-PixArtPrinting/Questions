# Graphic Designer Application - LLD Solution

## Problem Overview
Design a graphic designer application that allows users to create, manipulate, and arrange different graphical elements (Picture, TextBox, Rectangle) with full undo/redo functionality for all operations.

## Solution Approach

This solution implements several key design patterns to create a robust, extensible graphic design system:

1. **Command Pattern**: For undo/redo functionality
2. **Prototype Pattern**: For cloning design elements  
3. **Template Method Pattern**: Base DesignElement with abstract methods
4. **Memento Pattern**: State preservation for undo operations
5. **Factory Pattern**: Could be added for element creation

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
        -editor: Editor
        -element: DesignElement
        +execute void
        +undo void
    }
    
    class DeleteCommand {
        -editor: Editor
        -id: string
        -backup: DesignElement
        +execute void
        +undo void
    }
    
    class MoveCommand {
        -editor: Editor
        -id: string
        -newX: number
        -newY: number
        -prevX: number
        -prevY: number
        +execute void
        +undo void
    }
    
    class ChangeColorCommand {
        -editor: Editor
        -id: string
        -newColor: string
        -prevColor: string
        +execute void
        +undo void
    }
    
    class ChangeTextCommand {
        -editor: Editor
        -id: string
        -newText: string
        -prevText: string
        +execute void
        +undo void
    }
    
    class CommandManager {
        -undoStack: Command[]
        -redoStack: Command[]
        +executeCommand(cmd: Command) void
        +undo void
        +redo void
    }
    
    class Editor {
        -elements: Map~string, DesignElement~
        -commandManager: CommandManager
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
    InsertCommand --> Editor
    InsertCommand --> DesignElement
    DeleteCommand --> Editor
    MoveCommand --> Editor
    ChangeColorCommand --> Editor
    ChangeTextCommand --> Editor
    CommandManager --> Command
    Editor --> CommandManager
    Editor --> DesignElement
```

## Command Pattern Implementation

```mermaid
sequenceDiagram
    participant U as User
    participant E as Editor
    participant CM as CommandManager
    participant C as Command
    participant EL as Element
    
    U->>E: Perform operation (e.g., move element)
    E->>C: Create Command (MoveCommand)
    E->>CM: executeCommand(cmd)
    CM->>C: execute
    C->>EL: Modify element state
    CM->>CM: Push to undoStack
    CM->>CM: Clear redoStack
    
    Note over U,EL: User wants to undo
    U->>E: undo
    E->>CM: undo
    CM->>CM: Pop from undoStack
    CM->>C: undo
    C->>EL: Restore previous state
    CM->>CM: Push to redoStack
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

## Editor Operations Flow

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
    F --> J[CommandManager Operation]
    
    H -->|Move| K[Create MoveCommand]
    H -->|Color| L[Create ChangeColorCommand]
    H -->|Text| M[Create ChangeTextCommand]
    
    G --> N[Execute via CommandManager]
    I --> N
    K --> N
    L --> N
    M --> N
    J --> O[Update Editor State]
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

## Key Features

### 1. **Full Undo/Redo Support**
- Command pattern ensures every operation is reversible
- Separate undo and redo stacks maintain operation history
- State preservation through element cloning

### 2. **Extensible Element System**
- Abstract base class allows easy addition of new element types
- Prototype pattern enables deep copying of complex elements
- Type-safe operations through inheritance hierarchy

### 3. **Robust Command Management**
- Each operation encapsulated as a command object
- Consistent execute/undo interface across all operations
- Automatic redo stack clearing on new operations

### 4. **Memory Efficient Design**
- Elements stored in efficient Map structure
- Minimal memory overhead for command storage
- Lazy evaluation of backup states

## Performance Characteristics

- **Element Access**: O(1) with Map-based storage
- **Command Execution**: O(1) for single operations
- **Undo/Redo**: O(1) stack operations
- **Memory Usage**: O(n + c) where n = elements, c = command history

This design provides a solid foundation for a graphic design application with professional-grade undo/redo functionality while maintaining clean separation of concerns and extensibility.