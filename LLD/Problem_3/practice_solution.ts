/**
 * 
At Vistaprint, we allow users to create their own designs. 
In designer, users can create their own designs by arranging different graphical elements. 
Elements can be created and deleted; they can be manipulated in different ways.

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

 */

class Designer {
    designs: Design[] = [];
    addDesign(design: Design){
        this.designs.push(design);
    }
    removeDesign(){
        //Remove design code here
    }

    printAllDesigns(): void {
        console.log('=== Workspace Designs ===');
        this.designs.forEach((design, index) => {
            console.log(`--- Design ${index} ---`);
            design.printState();
        });
    }
}

class Design {
    elements: Map<string, DesignElement> = new Map();
    undoStack: ICommand[] = [];
    redoStack: ICommand[] = [];

    execute(cmd: ICommand) {
        cmd.execute();
        this.undoStack.push(cmd);
        this.redoStack = [];
    }

    undo(){
        const cmd = this.undoStack.pop();
        if(!cmd) return;
        cmd.execute();
        this.redoStack.push(cmd);
    }

    redo() {
        const cmd = this.redoStack.pop();
        if(!cmd) return;
        cmd.execute();
        this.undoStack.push(cmd);
    }

    addElement(element: DesignElement) {
        this.elements.set(element.id, element)
    }

    removeElement(id: string){
        this.elements.delete(id);
    }

    getElement(id: string) {
        return this.elements.get(id)
    }

    moveElement(id: string, x: number, y: number){
        const element = this.getElement(id);
        if (element) {
            element.x = x;
            element.y = y;
        }
    }

    changeColor(id: string, newColor: string) {
        const element = this.getElement(id);
        if(element instanceof TextBox || element instanceof Rectangle) {
            element.color = newColor;
        }
    }

    changeText(id: string, newText: string) {
        const element = this.getElement(id);
        if(element instanceof TextBox) {
            element.text = newText;
        }
    }

    printState() {
        console.log('--- Current State ---');
        for (const el of this.elements.values()) {
            console.log(el.toString());
        }
    }

}

abstract class DesignElement {
    constructor(public id: string, public x: number, public y: number) {
    }

    abstract clone(): DesignElement;
}

class Picture extends DesignElement {
    constructor(public id: string, public x: number, public y: number){
        super(id, x, y)
    }

    clone(): DesignElement {
        return new Picture(this.id, this.x, this.y);
    }
}

class TextBox extends DesignElement {
    constructor(public id: string, public x: number, public y: number, public color: string, public text: string){
        super(id, x, y)
    }

    clone(): DesignElement {
        return new TextBox(this.id, this.x, this.y, this.color, this.text);
    }
}

class Rectangle extends DesignElement {
    constructor(public id: string, public x: number, public y: number, public color: string){
        super(id, x, y)
    }

    clone(): DesignElement {
        return new Rectangle(this.id, this.x, this.y, this.color);
    }
}

interface ICommand {
    execute(): void;
    undo(): void
}

class InsertCommand implements ICommand {
    constructor(public design: Design, public element: DesignElement){

    }
    execute(): void {
        this.design.addElement(this.element);
    }
    undo(): void {
        this.design.removeElement(this.element.id);
    }
}

class DeleteCommand implements ICommand {
    backup: DesignElement | undefined;
    constructor(public design: Design, public elementId: string) {
        this.backup = design.getElement(elementId)?.clone();
    }
    execute(): void {
        this.design.removeElement(this.elementId);
    }
    undo(): void {
        if(this.backup) {
            this.design.addElement(this.backup);
        }
    }
}

class MoveCommand implements ICommand {
    oldX: number;
    oldY:  number;
    constructor(public design: Design, public elementId: string, public newX: number, public newY: number) {
        const element = design.getElement(elementId);
        this.oldX = element?.x || 0;
        this.oldY = element?.y || 0;
    }

    execute(): void {
        this.design.moveElement(this.elementId, this.newX, this.newY);
    }
    undo(): void {
        this.design.moveElement(this.elementId, this.oldX, this.oldY);
    }
}

const designer = new Designer();

const design1 = new Design();
const design2 = new Design();

const txt1 = new TextBox("t1", 200, 300, "red", "demo");
design1.execute(new InsertCommand(design1, txt1));
design1.execute(new MoveCommand(design1, "t1", 0, 0));

const rect = new Rectangle("r1", 400, 400, "blue");
design2.execute(new InsertCommand(design1, rect));

designer.addDesign(design1);
designer.addDesign(design2);

// Undo move
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

designer.printAllDesigns();