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
    constructor(private editor: Editor, private element: DesignElement) { }

    execute() {
        this.editor.addElement(this.element);
    }

    undo() {
        this.editor.removeElement(this.element.id);
    }
}

class DeleteCommand implements Command {
    private backup: DesignElement | undefined;
    constructor(private editor: Editor, private id: string) {
        this.backup = editor.getElement(id)?.clone();
    }

    execute() {
        this.editor.removeElement(this.id);
    }

    undo() {
        if (this.backup) {
            this.editor.addElement(this.backup);
        }
    }
}

class MoveCommand implements Command {
    private prevX: number = 0;
    private prevY: number = 0;
    constructor(private editor: Editor, private id: string, private newX: number, private newY: number) {
        const el = editor.getElement(id);
        if (el) {
            this.prevX = el.x;
            this.prevY = el.y;
        }
    }

    execute() {
        this.editor.moveElement(this.id, this.newX, this.newY);
    }

    undo() {
        this.editor.moveElement(this.id, this.prevX, this.prevY);
    }
}

class ChangeColorCommand implements Command {
    private prevColor: string = '';
    constructor(private editor: Editor, private id: string, private newColor: string) {
        const el = editor.getElement(id);
        if (el && 'color' in el) {
            this.prevColor = (el as Rectangle | TextBox).color;
        }
    }

    execute() {
        this.editor.changeColor(this.id, this.newColor);
    }

    undo() {
        this.editor.changeColor(this.id, this.prevColor);
    }
}

class ChangeTextCommand implements Command {
    private prevText: string = '';
    constructor(private editor: Editor, private id: string, private newText: string) {
        const el = editor.getElement(id);
        if (el instanceof TextBox) {
            this.prevText = el.text;
        }
    }

    execute() {
        this.editor.changeText(this.id, this.newText);
    }

    undo() {
        this.editor.changeText(this.id, this.prevText);
    }
}

// --- Command Manager ---
class CommandManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    executeCommand(cmd: Command) {
        cmd.execute();
        this.undoStack.push(cmd);
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
}

// --- Editor ---
class Editor {
    private elements: Map<string, DesignElement> = new Map();
    private commandManager: CommandManager = new CommandManager();

    execute(cmd: Command) {
        this.commandManager.executeCommand(cmd);
    }

    undo() {
        this.commandManager.undo();
    }

    redo() {
        this.commandManager.redo();
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

// --- Example Usage ---
const editor = new Editor();

const txt = new TextBox("txt1", 0, 0, "red", "Hello");
editor.execute(new InsertCommand(editor, txt));
editor.execute(new MoveCommand(editor, "txt1", 100, 200));

editor.undo();
editor.redo();
editor.execute(new DeleteCommand(editor, "txt1"));
editor.undo();
editor.redo();
editor.undo();
editor.execute(new InsertCommand(editor, new Rectangle("rect1", 10, 10, "blue")));
editor.undo();
editor.undo();
editor.execute(new InsertCommand(editor, new Rectangle("rect2", 20, 20, "green")));
editor.execute(new MoveCommand(editor, "rect2", 200, 300));
editor.undo();

editor.printState();
