type Direction = 'North' | 'East' | 'South' | 'West';

class Position {
    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly direction: Direction
    ) { }
}

interface ICommand {
    execute(input: Position): Position;
}

class MoveForwardCommand implements ICommand {
    execute(input: Position): Position {
        let xDisplacement = 0;
        let yDisplacement = 0;

        switch (input.direction) {
            case 'North':
                yDisplacement = 1;
                break;
            case 'East':
                xDisplacement = 1;
                break;
            case 'South':
                yDisplacement = -1;
                break;
            case 'West':
                xDisplacement = -1;
                break;
            default:
                throw new Error(`Unsupported Direction value '${input.direction}'`);
        }

        return new Position(
            input.x + xDisplacement,
            input.y + yDisplacement,
            input.direction
        );
    }
}

class TurnLeftCommand implements ICommand {
    execute(input: Position): Position {
        const newDirection: Direction = (() => {
            switch (input.direction) {
                case 'North': return 'West';
                case 'East': return 'North';
                case 'South': return 'East';
                case 'West': return 'South';
                default: throw new Error(`Unsupported Direction value '${input.direction}'`);
            }
        })();

        return new Position(input.x, input.y, newDirection);
    }
}

class TurnRightCommand implements ICommand {
    execute(input: Position): Position {
        const newDirection: Direction = (() => {
            switch (input.direction) {
                case 'North': return 'East';
                case 'East': return 'South';
                case 'South': return 'West';
                case 'West': return 'North';
                default: throw new Error(`Unsupported Direction value '${input.direction}'`);
            }
        })();

        return new Position(input.x, input.y, newDirection);
    }
}

class PositionTracer {
    public minX: number = Number.POSITIVE_INFINITY;
    public minY: number = Number.POSITIVE_INFINITY;
    public maxX: number = Number.NEGATIVE_INFINITY;
    public maxY: number = Number.NEGATIVE_INFINITY;

    tracePosition(position: Position): void {
        this.minX = Math.min(position.x, this.minX);
        this.maxX = Math.max(position.x, this.maxX);
        this.minY = Math.min(position.y, this.minY);
        this.maxY = Math.max(position.y, this.maxY);
    }
}

function getCommandFromLetter(letter: string): ICommand {
    switch (letter) {
        case 'G': return new MoveForwardCommand();
        case 'L': return new TurnLeftCommand();
        case 'R': return new TurnRightCommand();
        default: throw new Error(`Unknown command letter '${letter}'`);
    }
}

function doesCircleExist(commands: string[]): string[] {
    return commands.map(doesSingleCircleExist);
}

function doesSingleCircleExist(commandSequence: string): string {
    const initialPosition = new Position(0, 0, 'North');
    let resultPosition = initialPosition;
    const positionTracer = new PositionTracer();

    const commandList: ICommand[] = commandSequence.split('').map(getCommandFromLetter);

    for (let i = 0; i < 4; i++) {
        resultPosition = commandList.reduce((currPos, command) => {
            const newPos = command.execute(currPos);
            positionTracer.tracePosition(newPos);
            return newPos;
        }, resultPosition);
    }

    const hasCircle = resultPosition.x === initialPosition.x && resultPosition.y === initialPosition.y;

    if (hasCircle) {
        console.log(
            `Bounding box for command sequence '${commandSequence}' is: MinX = ${positionTracer.minX}, MinY = ${positionTracer.minY}, MaxX = ${positionTracer.maxX}, MaxY = ${positionTracer.maxY} `
        );
    }

    return hasCircle ? "YES" : "NO";
}

// Example usage:
// const results = doesCircleExist(["GLGLGLG", "GRGRGRG"]);
// console.log(results); // Output: ["YES", "NO"]
