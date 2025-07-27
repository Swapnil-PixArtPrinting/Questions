### Problem 2 (LLD + DSA):

Build a computer simulation of a mobile robot. The robot moves on an infinite plane, starting from position (0, 0). Its movements are described by a command sequence (expressed as a string) consisting of one or more of the following three letters:

G instructs the robot to move forward one step.

L instructs the robot to turn left in place (90 degrees).

R instructs the robot to turn right in place (90 degrees).

The robot performs the instructions in a command sequence in an infinite loop. Determine whether there exists some finite circle such that the robot always moves within the circle.

#### Possible Extensions

* Bounding Box / Circle 
    * Ask the candidate to print out (using Console.WriteLine() or equivalent) the coordinates of the bounding box (or bounding circle) for each command sequence that is bounded (i.e. returns “YES”).  
    * Note: They should not change the returned value because that will cause the test to fail – just print it out.

* Convert an Unbounded Command Sequence to Bounded
    * For command sequences that are not bounded, print out (using Console.WriteLine() or equivalent) a modified command sequence that is bounded by appending the minimal amount of additional commands to the original sequence.  This has a very simple answer if the candidate truly understands the problem.

Absolutely! Here's a corrected and **copy-paste friendly Markdown README** for your TypeScript solution. This version:

* Follows clean formatting
* Includes code highlights, bullet points, and sample output blocks
* Provides structured explanation of logic, features, usage, and UML

---

# 🤖 Robot Bounded Movement Checker

This TypeScript module simulates a robot on an infinite 2D plane that follows a sequence of commands in an **infinite loop**.

## 🚦 Commands

Each character in the command string represents an action:

- `G`: Go forward one step in the current direction
- `L`: Turn left 90 degrees
- `R`: Turn right 90 degrees

---

## 🎯 Goal

Determine if the robot's movement is **bounded** in a circle, i.e., whether it always stays within a finite region when the command sequence is repeated infinitely.

---

## ✅ Bounded Criteria

A command sequence is **bounded** if **either**:

- The robot returns to the origin `(0, 0)` after executing the sequence once
- The robot **does not face North** at the end of the sequence

> If either condition is true, the robot is guaranteed to remain within a bounded circle when repeating the command sequence forever.

---

## 💡 Features

- ✅ Implements the **Command Pattern** using `ICommand` and command classes (`MoveForward`, `TurnLeft`, `TurnRight`)
- ✅ Tracks a **bounding box** using `PositionTracer`
- ✅ Detects **bounded** vs **unbounded** command sequences
- ✅ Suggests a minimal change to fix unbounded sequences (by appending `'L'`)

---

## 🧪 Example Output

Running the following input:

```ts
doesCircleExist(["GLGLGLG", "GRGRGRG", "GG", "GGLLGG"]);
````

Produces:

```
✅ Bounding box for 'GLGLGLG': MinX = -1, MinY = 0, MaxX = 0, MaxY = 1
✅ Bounding box for 'GRGRGRG': MinX = 0, MinY = -1, MaxX = 1, MaxY = 0
❌ Unbounded. Suggest appending 'L' → 'GGL'
✅ Bounding box for 'GGLLGG': MinX = -2, MinY = 0, MaxX = 0, MaxY = 0
[ 'YES', 'YES', 'NO', 'YES' ]
```

---

## 🧱 Architecture Overview (Text-Based UML)

```
+----------------------+
|      Position        |
+----------------------+
| + x: number          |
| + y: number          |
| + direction: Direction|
+----------------------+

+----------------------+
|     ICommand         | <<interface>>
+----------------------+
| + execute(pos): Position |
+----------------------+

        ▲         ▲         ▲
        |         |         |
+----------------+  +------------------+  +-------------------+
| MoveForwardCmd |  | TurnLeftCommand  |  | TurnRightCommand  |
+----------------+  +------------------+  +-------------------+

+------------------------+
|     PositionTracer     |
+------------------------+
| + minX, minY, maxX, maxY|
| + trace(position)       |
+------------------------+

+----------------------------+
| doesCircleExist(commands)  |
| doesSingleCircleExist(seq) |
| getCommandFromLetter(char) |
+----------------------------+
```

---

## 📦 How to Use

1. Copy the TypeScript implementation into your project
2. Call `doesCircleExist(["commands", ...])`
3. Observe console output for bounding info or suggestions
4. Use return values programmatically as `"YES"` or `"NO"`

---

## 🔧 Optional Enhancements

* Add CLI input and output
* Visualize robot path on a grid
* Generate actual bounding circle (radius and center)
* Animate path using canvas/SVG

---
