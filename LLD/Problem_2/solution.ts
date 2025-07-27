// --- Enums ---
enum Direction {
    UP = 'UP',
    DOWN = 'DOWN',
    IDLE = 'IDLE'
}

enum ElevatorStatus {
    MOVING = 'MOVING',
    IDLE = 'IDLE',
    MAINTENANCE = 'MAINTENANCE'
}

// --- Elevator Request Model ---
class ElevatorRequest {
    constructor(public floor: number, public direction: Direction) { }
}

// --- Button ---
class Button {
    constructor(private floor: number, private direction: Direction, private controller: ElevatorController) { }

    press() {
        console.log(`Button pressed at floor ${this.floor} to go ${this.direction}`);
        const request = new ElevatorRequest(this.floor, this.direction);
        this.controller.handleRequest(request);
    }
}

// --- Floor ---
class Floor {
    public upButton: Button;
    public downButton: Button;

    constructor(public number: number, controller: ElevatorController) {
        this.upButton = new Button(number, Direction.UP, controller);
        this.downButton = new Button(number, Direction.DOWN, controller);
    }
}

// --- Elevator ---
class Elevator {
    public currentFloor: number = 0;
    public direction: Direction = Direction.IDLE;
    public status: ElevatorStatus = ElevatorStatus.IDLE;
    private stopsQueue: number[] = [];

    constructor(public id: number) { }

    addStop(floor: number) {
        if (!this.stopsQueue.includes(floor)) {
            this.stopsQueue.push(floor);
            this.stopsQueue.sort((a, b) => this.direction === Direction.DOWN ? b - a : a - b);
        }
        this.updateDirection();
    }

    step() {
        if (this.stopsQueue.length === 0) {
            this.status = ElevatorStatus.IDLE;
            this.direction = Direction.IDLE;
            return;
        }

        const nextStop = this.stopsQueue[0];
        if (this.currentFloor < nextStop) {
            this.currentFloor++;
            this.direction = Direction.UP;
        } else if (this.currentFloor > nextStop) {
            this.currentFloor--;
            this.direction = Direction.DOWN;
        } else {
            console.log(`Elevator ${this.id} stopping at floor ${nextStop}`);
            this.stopsQueue.shift();
        }
    }

    private updateDirection() {
        if (this.stopsQueue.length === 0) {
            this.direction = Direction.IDLE;
        } else {
            this.direction = this.stopsQueue[0] > this.currentFloor ? Direction.UP : Direction.DOWN;
        }
    }

    isIdle(): boolean {
        return this.status === ElevatorStatus.IDLE && this.stopsQueue.length === 0;
    }
}

// --- Elevator Controller ---
class ElevatorController {
    private requestQueue: ElevatorRequest[] = [];

    constructor(private elevators: Elevator[]) { }

    handleRequest(request: ElevatorRequest) {
        const assigned = this.assignElevator(request);
        if (assigned) {
            assigned.addStop(request.floor);
        } else {
            console.log("No elevator available, queuing request");
            this.requestQueue.push(request);
        }
    }

    assignElevator(request: ElevatorRequest): Elevator | null {
        // Simple strategy: find first idle elevator or nearest one
        let idle = this.elevators.find(e => e.isIdle());
        if (idle) return idle;

        let nearest: Elevator | null = null;
        let minDistance = Infinity;
        for (const elevator of this.elevators) {
            const dist = Math.abs(elevator.currentFloor - request.floor);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = elevator;
            }
        }
        return nearest;
    }

    stepAllElevators() {
        for (const elevator of this.elevators) {
            elevator.step();
        }
    }
}

// --- Building ---
class Building {
    public elevators: Elevator[] = [];
    public floors: Floor[] = [];
    public controller: ElevatorController;

    constructor(public totalFloors: number, public totalElevators: number) {
        this.elevators = Array.from({ length: totalElevators }, (_, i) => new Elevator(i));
        this.controller = new ElevatorController(this.elevators);
        this.floors = Array.from({ length: totalFloors }, (_, i) => new Floor(i, this.controller));
    }

    stepSystem() {
        this.controller.stepAllElevators();
    }
}

// --- Example Usage ---
const building = new Building(10, 2);

building.floors[3].upButton.press(); // Request elevator at floor 3 going UP
building.floors[7].downButton.press(); // Request elevator at floor 7 going DOWN

// Simulate time steps
setInterval(() => {
    building.stepSystem();
}, 1000);
