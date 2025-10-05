export enum Direction {
    North = "North",
    South = "South",
    West = "West",
    East = "East"
}

class Position {
    constructor(
        public x: number,
        public y: number,
        public direction: Direction
    ) {}
}


interface ICommand {
    apply(position: Position): Position
}

class MoveForwardCommand implements ICommand {
    apply(currentPosition: Position) {
        let x = currentPosition.x;
        let y = currentPosition.y;
        const direction = currentPosition.direction;
        switch(direction) {
            case Direction.North:
                y += 1;
                break;
            case Direction.East:
                x += 1;
                break;
            case Direction.West:
                x -= 1;
                break;
            case Direction.South:
                y -= 1;
                break;
        }
        return new Position(x, y, direction);
    }
}

class MoveLeftCommand implements ICommand {
    apply(currentPosition: Position): Position {
        const x = currentPosition.x;
        const y = currentPosition.y;
        let direction = currentPosition.direction;
        switch(direction) {
            case Direction.North:
                direction = Direction.West;
                break;
            case Direction.West:
                direction = Direction.South;
                break;
            case Direction.South:
                direction = Direction.East;
                break;
            case Direction.East:
                direction = Direction.North;
                break;
        }
        return new Position(x, y, direction);
    }
}

class MoveRightCommand implements ICommand {
    apply(currentPosition: Position): Position {
        const x = currentPosition.x;
        const y = currentPosition.y;
        let direction = currentPosition.direction;
        switch(direction) {
            case Direction.North:
                direction = Direction.East;
                break;
            case Direction.West:
                direction = Direction.North;
                break;
            case Direction.South:
                direction = Direction.West;
                break;
            case Direction.East:
                direction = Direction.South;
                break;
        }
        return new Position(x, y, direction);
    }
}

function getCommandFromLetter(letter: string): ICommand {
    switch(letter) {
        case "G": return new MoveForwardCommand();
        case "L": return new MoveLeftCommand();
        case "R": return new MoveRightCommand();
        default: throw new Error("Invalid command");
    }
}

function doesSingleCircleExist(commandString: string) {
    const defaultPosition = new Position(0,0, Direction.North);
    const commands = commandString.split("").map(getCommandFromLetter);
    let position = defaultPosition;
    for(const command of commands) {
        position = command.apply(position);
    }
    const backToOrigin = position.x === 0 && position.y === 0;
    const notFacingNorth = position.direction !== Direction.North;
    if(backToOrigin && notFacingNorth) {
        return "Yes";
    }
    return "No";
}

function doesCircleExist(commands: string[]): string[] {
    const output: string[] = [];
    commands.forEach(cmd => {
        output.push(doesSingleCircleExist(cmd));
    })
    return output;
}

const result = doesCircleExist([ "GLGLGLG", "GRGRGRG", "GG", "GGLLGG", "GLGRGL" ]);
console.log(result);