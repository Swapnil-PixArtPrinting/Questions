/**
 * Graphic Designer Application - Refactored Architecture
 * 
 * Key Changes:
 * 1. Merged CommandManager functionality into Design class (formerly Editor)
 * 2. Renamed Editor to Design for better semantic meaning
 * 3. Added Workspace class to manage multiple Design instances
 * 4. Workspace contains `public designs: Design[]` as requested
 * 
 * Architecture Benefits:
 * - Simplified class hierarchy by eliminating separate CommandManager
 * - Multiple design instances can be managed within a single workspace
 * - Each Design maintains its own undo/redo stack independently
 * - Clear separation between workspace management and design operations
 */

(function(){
    
// --- Enums ---
enum ElementType {
    PICTURE = 'PICTURE',
    TEXTBOX = 'TEXTBOX',
    RECTANGLE = 'RECTANGLE'
}

// --- Design Element Base ---
abstract class DesignElement {
    public id: string;
    public type: ElementType;
    public x: number;
    public y: number;

    constructor(id: string, type: ElementType, x: number, y: number) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
    }

    abstract clone(): DesignElement;
    abstract toString(): string;
}

// --- Picture Element ---
class Picture extends DesignElement {
    constructor(id: string, x: number, y: number) {
        super(id, ElementType.PICTURE, x, y);
    }

    clone() {
        return new Picture(this.id, this.x, this.y);
    }

    toString() {
        return `Picture ${this.id} at (${this.x}, ${this.y})`;
    }
}

// --- Rectangle Element ---
class Rectangle extends DesignElement {
    constructor(id: string, x: number, y: number, public color: string) {
        super(id, ElementType.RECTANGLE, x, y);
    }

    clone() {
        return new Rectangle(this.id, this.x, this.y, this.color);
    }

    toString() {
        return `Rectangle ${this.id} at (${this.x}, ${this.y}), color: ${this.color}`;
    }
}

// --- TextBox Element ---
class TextBox extends DesignElement {
    constructor(id: string, x: number, y: number, public color: string, public text: string) {
        super(id, ElementType.TEXTBOX, x, y);
    }

    clone() {
        return new TextBox(this.id, this.x, this.y, this.color, this.text);
    }

    toString() {
        return `TextBox ${this.id} at (${this.x}, ${this.y}), color: ${this.color}, text: "${this.text}"`;
    }
}

// --- Command Pattern ---
interface Command {
    execute(): void;
    undo(): void;
}

// --- Command Implementations ---
class InsertCommand implements Command {
    constructor(private design: Design, private element: DesignElement) { }

    execute() {
        this.design.addElement(this.element);
    }

    undo() {
        this.design.removeElement(this.element.id);
    }
}

class DeleteCommand implements Command {
    private backup: DesignElement | undefined;
    constructor(private design: Design, private id: string) {
        this.backup = design.getElement(id)?.clone();
    }

    execute() {
        this.design.removeElement(this.id);
    }

    undo() {
        if (this.backup) {
            this.design.addElement(this.backup);
        }
    }
}

class MoveCommand implements Command {
    private prevX: number = 0;
    private prevY: number = 0;
    constructor(private design: Design, private id: string, private newX: number, private newY: number) {
        const el = design.getElement(id);
        if (el) {
            this.prevX = el.x;
            this.prevY = el.y;
        }
    }

    execute() {
        this.design.moveElement(this.id, this.newX, this.newY);
    }

    undo() {
        this.design.moveElement(this.id, this.prevX, this.prevY);
    }
}

class ChangeColorCommand implements Command {
    private prevColor: string = '';
    constructor(private design: Design, private id: string, private newColor: string) {
        const el = design.getElement(id);
        if (el && 'color' in el) {
            this.prevColor = (el as Rectangle | TextBox).color;
        }
    }

    execute() {
        this.design.changeColor(this.id, this.newColor);
    }

    undo() {
        this.design.changeColor(this.id, this.prevColor);
    }
}

class ChangeTextCommand implements Command {
    private prevText: string = '';
    constructor(private design: Design, private id: string, private newText: string) {
        const el = design.getElement(id);
        if (el instanceof TextBox) {
            this.prevText = el.text;
        }
    }

    execute() {
        this.design.changeText(this.id, this.newText);
    }

    undo() {
        this.design.changeText(this.id, this.prevText);
    }
}

// --- Design (formerly Editor with integrated CommandManager) ---
class Design {
    private elements: Map<string, DesignElement> = new Map();
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    execute(cmd: Command) {
        cmd.execute();
        this.undoStack.push(cmd);
        /**
         * The most important gotcha here is the line this.redoStack = []; 
         * this completely clears the redo stack whenever a new command is executed. 
         * This behavior is standard in most applications: when you perform a new action after undoing something, you lose the ability to redo those previously undone actions. 
         * For example, if you type "Hello", undo it, then type "World", you can't redo the "Hello" anymore.
         */
        this.redoStack = [];
    }

    undo() {
        const cmd = this.undoStack.pop();
        if (cmd) {
            cmd.undo();
            this.redoStack.push(cmd);
        }
    }

    redo() {
        const cmd = this.redoStack.pop();
        if (cmd) {
            cmd.execute();
            this.undoStack.push(cmd);
        }
    }

    addElement(el: DesignElement) {
        this.elements.set(el.id, el);
        console.log(`Added: ${el.toString()}`);
    }

    removeElement(id: string) {
        const el = this.elements.get(id);
        if (el) {
            this.elements.delete(id);
            console.log(`Removed: ${el.toString()}`);
        }
    }

    moveElement(id: string, x: number, y: number) {
        const el = this.elements.get(id);
        if (el) {
            el.x = x;
            el.y = y;
            console.log(`Moved: ${el.toString()}`);
        }
    }

    changeColor(id: string, color: string) {
        const el = this.elements.get(id);
        if (el && 'color' in el) {
            (el as Rectangle | TextBox).color = color;
            console.log(`Changed Color: ${el.toString()}`);
        }
    }

    changeText(id: string, text: string) {
        const el = this.elements.get(id);
        if (el instanceof TextBox) {
            el.text = text;
            console.log(`Changed Text: ${el.toString()}`);
        }
    }

    getElement(id: string): DesignElement | undefined {
        return this.elements.get(id);
    }

    printState() {
        console.log('--- Current State ---');
        for (const el of this.elements.values()) {
            console.log(el.toString());
        }
    }
}

// --- Workspace ---
class Workspace {
    public designs: Design[] = [];

    addDesign(design: Design): void {
        this.designs.push(design);
    }

    removeDesign(index: number): void {
        if (index >= 0 && index < this.designs.length) {
            this.designs.splice(index, 1);
        }
    }

    getDesign(index: number): Design | undefined {
        return this.designs[index];
    }

    printAllDesigns(): void {
        console.log('=== Workspace Designs ===');
        this.designs.forEach((design, index) => {
            console.log(`--- Design ${index} ---`);
            design.printState();
        });
    }
}

// --- Example Usage ---
const workspace = new Workspace();

// Create first design
const design1 = new Design();
const txt = new TextBox("txt1", 0, 0, "red", "Hello");
design1.execute(new InsertCommand(design1, txt));
design1.execute(new MoveCommand(design1, "txt1", 100, 200));

// Create second design
const design2 = new Design();
const rect = new Rectangle("rect1", 50, 50, "blue");
design2.execute(new InsertCommand(design2, rect));

// Add designs to workspace
workspace.addDesign(design1);
workspace.addDesign(design2);

// Perform operations on first design
design1.undo();
design1.redo();
design1.execute(new DeleteCommand(design1, "txt1"));
design1.undo();
design1.redo();
design1.undo();
design1.execute(new InsertCommand(design1, new Rectangle("rect2", 10, 10, "green")));
design1.undo();
design1.undo();
design1.execute(new InsertCommand(design1, new Rectangle("rect3", 20, 20, "yellow")));
design1.execute(new MoveCommand(design1, "rect3", 200, 300));
design1.undo();

// Print all designs in workspace
workspace.printAllDesigns();

})();