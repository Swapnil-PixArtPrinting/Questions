## List of questions from Cimpress Confluence:

### Problem 1 (LLD + DSA):

* Web sites like Vistaprint and Amazon have an online shopping cart that holds the customer's order.
Your goal is to write a program that calculates the total price of the order in the cart.
The catch is that the cart may contain coupons that affect the prices.
There are three kinds of coupons:

    * Take N% off each individual item in the cart
        (e.g. a general "10% off" coupon)
    * Take P% off the next item in the cart
        (e.g. "take 20% off your next product")
    * Take $D off your Nth item of type T
        (e.g. "take $5 off your third business card holder")
    * The cart contents (products and coupons) must be considered in sequence.

* Pricing Examples

    * Cart #1
        1.	Coupon: Take 10% off your next item 
        2.	$10 postcard sorter 
        3.	$20 stationery organizer 

        Total = $29

    * Cart #2 
        1.	$10 postcard sorter 
        2.	Coupon: Take 10% off your next item 
        3.	$20 stationery organizer 

        Total = $28

    * Cart #3
        1.	$10 postcard sorter 
        2.	Coupon: Take $2 off your 2nd postcard sorter
        3.	Coupon: 25% off each individual item
        4.	Coupon: Take 10% off the next item in the cart
        5.	$10 postcard sorter

        Total = ($10 * 75%) + (($10 - $2) * 75% * 90%) = $7.50 + $5.40 = $12.90


    * Example cart:
        * Coupon: Take 5% off all products in the cart
        * $10 postcard sorter
        * $15 stationery organizer
        * Coupon: Take $5 off your 3rd postcard sorter
        * Coupon: Take 50% off the next product in the cart
        * $10 postcard sorter
        * $18 business card holder
        * Coupon: Take $2 off your 2nd postcard sorter
        * $16 postcard sorter
        * $10 postcard sorter

    * Task:

        1. Create the needed class definitions for the internal structure & logic of 
        the cart (e.g., Cart, Item). No UI code.

        2.	Write Cart.TotalPrice() that, given the sequence of items in the cart,  
        computes the total price of the cart. 

    * Remember: 
        * Process items in the cart in sequence. 
        * Apply ALL applicable coupons in the order they appear in the cart.

#### Solution:

```typescript

interface ICartItem {
    id: string;
};

class Product implements ICartItem {
    id: string;
    productId: string;
    currentCost: number;
    originalCost: number;

    constructor(id: string, cost: number, productId: string) {
        this.id = id;
        this.productId = productId;
        this.currentCost = cost;
        this.originalCost = cost;
    }

    updateCost(cost: number) {
        this.currentCost = cost;
    }
}

interface ICoupon extends ICartItem {
    apply(cart: ICartItem[]): void;
}

class PercentOffAllCoupon implements ICoupon {
    id: string;
    percentageOff: number;

    constructor(id: string, percentageOff: number) {
        this.id = id;
        this.percentageOff = percentageOff;
    }

    apply(cart: ICartItem[]) {
        cart.forEach((cartItem) => {
            if (cartItem instanceof Product) {
                cartItem.updateCost(cartItem.currentCost - (cartItem.currentCost * (this.percentageOff / 100)));
            }
        });
    }
}

class PercentOffNextCoupon implements ICoupon {
    id: string;
    percentageOff: number;

    constructor(id: string, percentageOff: number) {
        this.id = id;
        this.percentageOff = percentageOff;
    }

    apply(cart: ICartItem[]) {
        let foundCoupon = false;
        for (let i = 0; i < cart.length; i++) {
            const cartItem = cart[i];
            if (foundCoupon && cartItem instanceof Product) {
                cartItem.updateCost(cartItem.currentCost - (cartItem.currentCost * (this.percentageOff / 100)));
                break;
            } else if (cartItem.id === this.id) {
                foundCoupon = true;
            }
        }
    }
}

class DollarOffCoupon implements ICoupon {
    id: string;
    dollarsOff: number;
    instances: number;
    productId: string;

    constructor(id: string, dollarsOff: number, instances: number, productId: string) {
        this.id = id;
        this.dollarsOff = dollarsOff;
        this.instances = instances;
        this.productId = productId;
    }

    apply(cart: ICartItem[]) {
        let timesProductSeen = 0;
        for (let i = 0; i < cart.length; i++) {
            const cartItem = cart[i];
            if (cartItem instanceof Product) {
                if (cartItem.productId === this.productId) {
                    timesProductSeen = timesProductSeen + 1;

                    if (timesProductSeen === this.instances) {
                        cartItem.updateCost(Math.max(cartItem.currentCost - this.dollarsOff, 0));
                        break;
                    }
                }
            }
        }
    }
}

// javascript's instanceof doesn't work with interfaces :(
const instanceOfCoupon = (object: any): object is ICoupon => {
    return 'apply' in object;
};

class Cart {
    private cartItems: ICartItem[];

    constructor(cartItems: ICartItem[]) {
        this.cartItems = cartItems;
    }

    totalPrice(): number {
        this.cartItems.forEach((cartItem) => {
            if (instanceOfCoupon(cartItem)) {
                cartItem.apply(this.cartItems);
            }
        });

        return this.cartItems.reduce((total, cartItem) => (cartItem instanceof Product ? total + cartItem.currentCost : total), 0);
    }
}

// Cart 1
const runCart1 = () => {
    const coupon1 = new PercentOffNextCoupon('coup1', 10);
    const item1 = new Product('item1', 10, 'postcardsorter');
    const item2 = new Product('item2', 20, 'stationaryorganizer');

    const cart = new Cart([coupon1, item1, item2]);
    console.log('Cart 1 total should be $29');
    console.log(`Actual total: $${cart.totalPrice()}`);
};

// Cart 2
const runCart2 = () => {
    const coupon1 = new PercentOffNextCoupon('coup1', 10);
    const item1 = new Product('item1', 10, 'postcardsorter');
    const item2 = new Product('item2', 20, 'stationaryorganizer');

    const cart = new Cart([item1, coupon1, item2]);
    console.log('Cart 2 total should be $28');
    console.log(`Actual total: $${cart.totalPrice()}`);
};

// Cart 3
const runCart3 = () => {
    const item1 = new Product('item1', 10, 'postcardsorter');
    const coupon1 = new DollarOffCoupon('coup1', 2, 2, 'postcardsorter');
    const coupon2 = new PercentOffAllCoupon('coup2', 25);
    const coupon3 = new PercentOffNextCoupon('coup3', 10);
    const item2 = new Product('item2', 10, 'postcardsorter');

    const cart = new Cart([item1, coupon1, coupon2, coupon3, item2]);
    console.log('Cart 3 total should be $12.90');
    console.log(`Actual total: $${cart.totalPrice()}`);
};


runCart1();
runCart2();
runCart3();

```

#### Follow up questions:

* Lots of coupon types
    * You hear that the Marketing department is planning to introduce 20 new kinds of coupons over the next few months. How does this knowledge affect your implementation? If they have a good implementation, it should not affect it at all, perhaps with the exception of adding factory methods.

* Sorting the list
    * Another good follow-up question is "If allowed to sort the list to get the best price, how would you implement this?". Implementing an exact solution for this problem is pretty tricky, so don't expect even a strong candidate to complete it within the hour's time. 

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

#### Solution:

```typescript

type Direction = 'North' | 'East' | 'South' | 'West';

class Position {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly direction: Direction
  ) {}
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
      `Bounding box for command sequence '${commandSequence}' is: MinX=${positionTracer.minX}, MinY=${positionTracer.minY}, MaxX=${positionTracer.maxX}, MaxY=${positionTracer.maxY}`
    );
  }

  return hasCircle ? "YES" : "NO";
}

// Example usage:
// const results = doesCircleExist(["GLGLGLG", "GRGRGRG"]);
// console.log(results); // Output: ["YES", "NO"]

```

### Problem 3 (LLD):

An exclusive French restaurant in Boston has decided to replace its waitstaff with robots. They take orders, serve food, and do all the other things that waiters do. However, the restaurant does not want to compromise on quality. Robot waiters must run efficiently and achieve high customer satisfaction.

* Your job is to: 
    * Use good design principles to outline the major components and data involved.
    * If doing object-oriented design, this is usually going to be a class diagram of some kind.
    * If doing service-oriented design, this will usually be a set of self-contained services with API routes.
    * Run through some use cases, producing specific traces using the exact entities defined in #1, not just hand-waving.

**Note:** 
    You do not have to model the kitchen, which is provided by a third party. 
    It supports the basic interface 
        Kitchen.Make(...) (asynchronous), 
        Kitchen.IsReady(...) and 
        Kitchen.Get(...). 
    The third party is happy to set the method or service parameters to match whatever you design

```

Kitchen methods (third-party)

Kitchen.Make(…)  Make something

Kitchen.IsReady(…)  Is something ready?

Kitchen.Get(…)  Retrieve something

```

**Use case #1**

A customer selects an item from the menu. A waiter delivers the order to the kitchen. Time passes. The meal is ready. A waiter delivers it to the customer's table.

Your method trace must look like


Caller                 |         Method Called
-----------------------|--------------------------------
Caller’s class name    |         ClassName.MethodName()
Caller’s class name    |         ClassName.MethodName()
…etc…                  |         …etc…

**Use Case #2**

Same as Use Case #1, but…

As the waiter is delivering the order to the kitchen, a customer at another table says “excuse me” and asks for a glass of water. Another customer at another table adds, “Oh, I'd like a glass of water too.”

#### Solution:

![Robot restaurant class diagram](../Questions/Robot-restaurant-class-diagram.jpg)
*Add Image here*

There are many approaches to this problem. This is just one.

An interface `IRestaurantItem` is for any object in the restaurant that can be manipulated (say, carried by a waiter), such as a food item, a table, a menu, or an order.

We get commonality between menus, orders, bills, and receipts as lists of priced order items, some with totals.

Jobs for waiters and chefs are different, but they're all jobs and therefore can all be queued as work in a WorkAllocator. The master Scheduler receives all requests and assigns all work.

*Different candidates, however, might focus on very different things. The most important goal is to judge their OOD or general Design skills, not for them to come up with a particular set of classes. Give the candidate some flexibility in solving the problem, but only if their chosen direction lets you fairly judge their skills.*

### Problem 4 (LLD):

* The elevator interview question: 
    * Draw a class diagram for a piece of software that controls a building’s elevator system. Your software should be able to be applied to many buildings, and should be customizable per building. 

#### Solution:
*Put solution here*

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

#### Solution:
![Class Diagram Graphic Designer](../Questions/ClassDiagram_Graphic_Designer.png) 

### Problem 6 (HLD):

* We want to build a product catalog for our ecommerce platform to enable our customers to easily find products based on different criteria. We need to fetch the product data from different services on the platform. For example, the product description, variants, availability, pricing, URL, images, etc. Each of these services is owned by a different team and some may scale better than others. You may assume that there is another service (a product store) that is a black box, where you store the data which provide an interface for searching the products using free text search.

    * Design a system to gather product data for different products and to make them indexable.
    * We need to be able to index all products as a batch.
    * We need to be able to index a specific product on demand.
    * We need to be able to delete a product.

* Questions:
    * To start the interview the candidate will need to figure out what product data is needed and what dependencies provide that data. Here the interviewer can push the candidate to continue exploring possible dependencies if the candidate is stuck. For example, merchandising data (text, product name), pricing, product attributes/variants, product availability, stock info, etc. See 
    https://vistaprint.atlassian.net/wiki/spaces/LAT/pages/405438716/Dependencies for examples.

    * How often can we run this (how many times a day) if we have 100 products? What about 1000 products? Or 10000? What does this mean for the requirements on the scalability of the underlying dependencies?

    * The candidate should estimate the response time for each dependency, and based on the number of dependencies and the number of products, figure out how long it takes to index all products, and from that, how often it can run.

    * Another good question to ask is “how often does it make sense to index all products?” Ask the candidate to think about how often the data changes. Does some data change more often? What do we do if we need to have more up to date stock information compared to merchandising data? Does the candidates design force a full reindex of all data if we only want to update one part of it? How can the candidate adapt their design to enable the system to index some data more frequently?

    * How can we scale this to a larger number of products? How can we make this an event driven architecture?

#### Solution:
*Put solution here*
