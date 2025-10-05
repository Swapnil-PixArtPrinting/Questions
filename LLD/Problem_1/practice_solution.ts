/**
 * An exclusive French restaurant in Boston has decided to replace its waiter staff with robots. 
 * They take orders, serve food, and do all the other things that waiters do. 
 * However, the restaurant does not want to compromise on quality. 
 * Robot waiters must run efficiently and achieve high customer satisfaction.

* Your job is to: 
    * Use good design principles to outline the major components and data involved.
    * If doing object-oriented design, this is usually going to be a class diagram of some kind.
    * If doing service-oriented design, this will usually be a set of self-contained services with API routes.
    * Run through some use cases, producing specific traces using the exact entities defined in #1, not just hand-waving.
 */

import { EventEmitter } from "node:stream";

interface IRestaurant {
    tables: Table[];
    customers: Customer[];
    robots: RoboWaiter[]
    menu: MenuItem[]
}

class Restaurant implements IRestaurant {
    customers: Customer[] = [];

    constructor(public tables: Table[], public menu: MenuItem[], public robots: RoboWaiter[]) {
    }

    addCustomer(customerName: string) {
        const vacantTable = this.tables.find(table => table.isTableVacant());
        const robot = this.robots.find(robot => !robot.isBusyServing());
        if(vacantTable && robot) {
            const customer = new Customer(customerName, vacantTable, robot, this.menu);
            this.customers.push(customer);
            vacantTable.assignCustomer(customer);
            return customer;
        }
        throw new Error("No vacant table or no free robot");
    }
}

class Table {
    private customer: Customer[] = [];
    constructor(public tableNumber: number, public capacity: number) {}
    assignCustomer(customer: Customer) {
        this.customer.push(customer);
    }
    isTableVacant(){
        return this.customer.length < this.capacity;
    }
}

class MenuItem {
    constructor(public name: string, public cost: number, public timeToPrepare: number) {}
}

enum OrderStatus {
    PLACED = 'PLACED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    SERVED = 'SERVED'
}

class Order {
    orderStatus: OrderStatus = OrderStatus.PLACED;
    constructor(public menuItem: MenuItem, public table: Table) {}

    changeOrderStatus(status: OrderStatus) {
        this.orderStatus = status;
    }
}

class Customer {
    constructor(public name: string, public table: Table, public roboWaiter: RoboWaiter, public menu: MenuItem[]) {

    }

    makeOrder(menuItem: MenuItem) {
        this.roboWaiter.takeOrder(new Order(menuItem, this.table));
    }

    requestGlassOfWater() {
        this.roboWaiter.needGlassOfWater(this.table);
    }

}

type RoboTask = {
    type: "serveOrder" | "serveWater",
    task : Order | Table
}

class RoboWaiter {
    
    tasks: RoboTask[] = [];
    isBusy: boolean = false;
    constructor(private orderManager: OrderManager) {
        this.orderManager.on("orderReady", this.queueOrder.bind(this));
        this.pollTasks();
    }

    queueOrder(order: Order) {
        this.tasks?.push({
            type: "serveOrder",
            task: order
        })
    }

    takeOrder(order: Order) {
        this.orderManager.placeOrder(order);
    }

    needGlassOfWater(table: Table) {
        this.tasks.push({
            type: "serveWater",
            task: table
        })
    }

    isBusyServing() {
        return this.isBusy;
    }

    pollTasks() {
        setInterval(() => {
            const task = this.tasks.shift();
            if(!task) {
                this.isBusy = false;
                return;
            }
            this.isBusy = true;
            if(task.type === "serveWater") {
                console.log(`water serverd to the table #${(task?.task as Table).tableNumber}`);
            } else if(task.type === "serveOrder") {
                const order = (task?.task as Order);
                if(order && order?.orderStatus !== OrderStatus.SERVED) {
                    order.changeOrderStatus(OrderStatus.SERVED);
                    console.log(`Order ${order.menuItem.name} serverd to the table #${order.table.tableNumber}`);
                }
            }
        }, 1000);
    }


}

class Kitchen {
    private orders: Order[] = [];
    make(order: Order) {
        this.orders.push(order);
    }
    IsReady(order: Order): boolean {
        return Math.random() > 0.5;
    }
    getOrder(order: Order) {
        // find and remove from the list and return the order 
        const index = this.orders.findIndex(o => o === order);
        if (index !== -1) {
            return this.orders.splice(index, 1)[0];
        }
        return undefined;   
    }
}

class OrderManager extends EventEmitter {
    private orders: Order[] = [];
    constructor(private kitchen: Kitchen) {
        super();
        this.pollOrders();
    }

    placeOrder(order: Order) {
        this.kitchen.make(order);
        order.changeOrderStatus(OrderStatus.PREPARING);
        this.orders.push(order);
    }

    serveOrder(order: Order) {
        if(this.kitchen.IsReady(order) && order.orderStatus !== OrderStatus.READY) {
            order.changeOrderStatus(OrderStatus.READY);
            const readyOrder = this.kitchen.getOrder(order);
            this.emit('orderReady', readyOrder);
        }
    }

    pollOrders() {
        setInterval(() => {
            this.orders.forEach(order => {
                this.serveOrder(order);
            })
        }, 5000)
    }

}

function main() {
    const tables = [new Table(1, 4), new Table(2, 4)];
    const menu = [new MenuItem("Pasta", 20, 10), new MenuItem("Pizza", 25, 15)];
    const kitchen = new Kitchen();
    const orderManager = new OrderManager(kitchen);
    const robots = [new RoboWaiter(orderManager), new RoboWaiter(orderManager)];
    const restaurant = new Restaurant(tables, menu, robots);
    const customer1 = restaurant.addCustomer("Alice");
    const customer2 = restaurant.addCustomer("Bob");
    customer1.makeOrder(menu[0]);
    customer2.makeOrder(menu[1]);
    customer1.requestGlassOfWater();
}

main();
