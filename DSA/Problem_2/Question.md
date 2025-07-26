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