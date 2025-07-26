### Problem 5 (LLD):

At Vistaprint, we allow users to create their own designs. In designer, users can create their own designs by arranging different graphical elements. Elements can be created and deleted; they can be manipulated in different ways.

* Supported elements:
    * Picture
    * Text box
    * Rectangle

* Supported operations:
    * Insert a new element
    * Delete existing element
    * Any element: move
    * Text box, rectangle: change color
    * Text box: change text

In order to allow pleasant user experience, we need to support **undo and redo** for all supported operations.

* Your task is to:
    * Design an OO solution. Outline essential objects and data involved.
    * Describe interactions between the objects; describe the state of the system.
    * Run through simple scenarios to verify the design.

**Example scenarios**

* Pre
    * Insert a text box
    * Move the text box

* Scenario A
    * Undo

* Scenario B
    * Delete the text box
    * Undo
    * Redo

* Scenario C
    * Undo
    * Redo
    * Insert a rectangle
    * Undo

* Scenario D
    * Undo
    * Insert a rectangle
    * Move the rectangle
    * Undo

* Script extensions
    * Support multi-selection.
    * Support persistence.

* Scenarios for script extensions
    * Undo deletion of multiple selected elements.
    * Undo an operation after the design has been saved and restored from storage.

* Scenarios for script extensions for experienced candidates
    * Support changes made by help desk personnel on behalf of the user simultaneously to the changes made by the user.

---
# 🎨 Design Editor with Undo/Redo – LLD Solution

## ✅ Problem Statement

Design an OO system for a design editor where users can:
- Insert, delete, move, and modify graphical elements.
- Undo and redo any operation.
- Handle different element types:
  - Picture
  - TextBox
  - Rectangle

---

## 🧱 Core Components

| Class             | Responsibility                                                                 |
|-------------------|----------------------------------------------------------------------------------|
| `Element` (abstract) | Base class for all graphical elements (position, type, ID)                      |
| `TextBox`, `Picture`, `Rectangle` | Specialized elements with additional properties (e.g. text, color)          |
| `Editor`          | Manages all elements and performs changes                                        |
| `Command`         | Command pattern interface (supports `execute()` and `undo()`)                    |
| `InsertCommand`, `MoveCommand`, etc. | Concrete commands implementing specific operations                       |
| `CommandManager`  | Tracks history stacks for undo and redo                                          |

---

## ⚙️ Design Principles Used

| Principle              | Application                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| **Command Pattern**    | All actions are encapsulated as objects, enabling undo/redo.                |
| **Open/Closed Principle** | Easy to add new commands (e.g., resize) without touching existing logic.     |
| **Encapsulation**      | `Editor` hides internal element handling, exposing a controlled interface.  |
| **Prototype Pattern**  | `clone()` methods help restore previous element states on undo.             |

---

## 📌 Supported Commands

- `InsertCommand`: Adds an element to the canvas.
- `DeleteCommand`: Removes an element.
- `MoveCommand`: Changes x/y position of an element.
- `ChangeColorCommand`: Modifies color of `Rectangle` or `TextBox`.
- `ChangeTextCommand`: Modifies text in a `TextBox`.

---

## ✅ Scenarios Walkthrough

### Pre-Step:
```ts
editor.execute(new InsertCommand(editor, new TextBox("txt1", 0, 0, "red", "Hello")));
editor.execute(new MoveCommand(editor, "txt1", 100, 200));
````

### A: Undo

```ts
editor.undo(); // Moves txt1 back to original position
```

### B: Delete and Undo/Redo

```ts
editor.execute(new DeleteCommand(editor, "txt1"));
editor.undo();  // Brings back txt1
editor.redo();  // Deletes again
```

### C: Undo → Redo → Insert → Undo

```ts
editor.undo();                      // Undo delete
editor.redo();                      // Redo delete
editor.execute(new InsertCommand(editor, new Rectangle("rect1", 10, 10, "blue")));
editor.undo();                      // Undo insert of rect1
```

### D: Undo → Insert → Move → Undo

```ts
editor.undo();                      // Undo previous insert
editor.execute(new InsertCommand(editor, new Rectangle("rect2", 20, 20, "green")));
editor.execute(new MoveCommand(editor, "rect2", 200, 300));
editor.undo();                      // Undo move of rect2
```

---

## 🔁 Undo/Redo Stack Behavior

| Action      | Undo Stack           | Redo Stack |
| ----------- | -------------------- | ---------- |
| Insert txt1 | Insert               |            |
| Move txt1   | Insert, Move         |            |
| Undo        | Insert               | Move       |
| Redo        | Insert, Move         |            |
| Delete txt1 | Insert, Move, Delete |            |
| Undo        | Insert, Move         | Delete     |
| Redo        | Insert, Move, Delete |            |

---

## 📦 Extensibility Options

* ✅ Multi-selection:

  * Use `GroupCommand` to wrap commands for multiple elements.
* ✅ Persistence:

  * Serialize `Editor.elements` and command stack as JSON.
* ✅ Multi-user edits:

  * Use event-sourced or CRDT model with timestamps for conflict resolution.

---

## 🧭 UML Class Diagram (Text-based)

```
+---------------------+
|  Element (abstract) |
+---------------------+
| - id: string        |
| - x: number         |
| - y: number         |
| - type: ElementType |
+---------------------+
| + clone(): Element  |
| + toString(): string|
+--------+------------+
         |
    +----+--------------------------+
    |            |                 |
+--------+  +------------+   +-------------+
| Picture|  | Rectangle  |   | TextBox     |
|        |  | - color    |   | - color     |
|        |  |            |   | - text      |
+--------+  +------------+   +-------------+

+----------------------+
| Command (interface)  |
+----------------------+
| + execute(): void    |
| + undo(): void       |
+----------+-----------+
           |
     +-----+------------------------------------------+
     | InsertCommand, DeleteCommand, MoveCommand, etc |
     +------------------------------------------------+

+----------------------+
| CommandManager       |
+----------------------+
| - undoStack: Command[]|
| - redoStack: Command[]|
+----------------------+
| + executeCommand()   |
| + undo()             |
| + redo()             |
+----------------------+

+----------------------+
| Editor               |
+----------------------+
| - elements: Map      |
| - commandManager     |
+----------------------+
| + execute(cmd)       |
| + undo(), redo()     |
| + add/removeElement  |
| + moveElement()      |
| + changeColor(), text|
+----------------------+
```

---

Let me know if you'd like:

* 💾 JSON-based save/load
* 🎯 Multi-selection implementation
* 🖼️ This UML diagram as an image

---

