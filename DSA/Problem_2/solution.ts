export enum Direction {
    North = 'North',
    East = 'East',
    South = 'South',
    West = 'West'
}

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
        let [x, y] = [input.x, input.y];

        switch (input.direction) {
            case Direction.North: y += 1; break;
            case Direction.South: y -= 1; break;
            case Direction.East: x += 1; break;
            case Direction.West: x -= 1; break;
            default: throw new Error(`Invalid direction ${input.direction}`);
        }

        return new Position(x, y, input.direction);
    }
}

class TurnLeftCommand implements ICommand {
    execute(input: Position): Position {
        const newDirection = {
            [Direction.North]: Direction.West,
            [Direction.West]: Direction.South,
            [Direction.South]: Direction.East,
            [Direction.East]: Direction.North
        }[input.direction];

        return new Position(input.x, input.y, newDirection);
    }
}

class TurnRightCommand implements ICommand {
    execute(input: Position): Position {
        const newDirection = {
            [Direction.North]: Direction.East,
            [Direction.East]: Direction.South,
            [Direction.South]: Direction.West,
            [Direction.West]: Direction.North
        }[input.direction];

        return new Position(input.x, input.y, newDirection);
    }
}

function getCommandFromLetter(letter: string): ICommand {
    switch (letter) {
        case 'G': return new MoveForwardCommand();
        case 'L': return new TurnLeftCommand();
        case 'R': return new TurnRightCommand();
        default: throw new Error(`Unknown command '${letter}'`);
    }
}

function doesSingleCircleExist(commandSequence: string): string {
    const initial = new Position(0, 0, Direction.North);
    let current = initial;
    // const tracer = new PositionTracer();
    const commands = commandSequence.split('').map(getCommandFromLetter);

    for (const cmd of commands) {
        current = cmd.execute(current);
        // tracer.trace(current);
    }

    const backToOrigin = current.x === 0 && current.y === 0;
    const sameDirection = current.direction !== Direction.North;
    const isBounded = backToOrigin && sameDirection;

    // Extended Output for clarity
    // if (isBounded) {
    //     console.log(`✅ Bounding box for '${commandSequence}': MinX=${tracer.minX}, MinY=${tracer.minY}, MaxX=${tracer.maxX}, MaxY=${tracer.maxY}`);
    // } else {
    //     console.log(`❌ Unbounded. Suggest appending 'L' → '${commandSequence + "L"}'`);
    // }

    return isBounded ? 'YES' : 'NO';
}

function doesCircleExist(commands: string[]): string[] {
    const output: string[] = [];
    commands.forEach(cmd => {
        output.push(doesSingleCircleExist(cmd));
    });
    return output;
}

// class PositionTracer {
//     public minX = Infinity;
//     public minY = Infinity;
//     public maxX = -Infinity;
//     public maxY = -Infinity;

//     trace(position: Position): void {
//         this.minX = Math.min(this.minX, position.x);
//         this.maxX = Math.max(this.maxX, position.x);
//         this.minY = Math.min(this.minY, position.y);
//         this.maxY = Math.max(this.maxY, position.y);
//     }
// }

// --- Test Example ---
const results = doesCircleExist(["GLGLGLG", "GRGRGRG", "GG", "GGLLGG", "GLGRGL"]);
console.log(results); // ["YES", "YES", "NO", "YES", "NO"]
