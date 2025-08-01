// --- Imports for EventEmitter ---
import { EventEmitter } from 'events';

// --- Kitchen Interface (Third-party placeholder) ---
interface KitchenAPI {
    Make(order: Order): void;
    IsReady(order: Order): boolean;
    Get(order: Order): Order;
}

// Dummy Kitchen object to simulate third-party interface
const Kitchen: KitchenAPI = {
    Make(order: Order) {
        console.log(`[Kitchen] Received order: ${order.item}`);
    },
    IsReady(order: Order) {
        return Math.random() > 0.7; // Simulate readiness
    },
    Get(order: Order) {
        return order;
    }
};

// --- Kitchen Adapter (Third-party Interface Wrapper) ---
class KitchenAdapter {
    makeOrder(order: Order) {
        console.log(`KitchenAdapter: Making ${order.item}`);
        Kitchen.Make(order);
    }

    isReady(order: Order): boolean {
        return Kitchen.IsReady(order);
    }

    getOrder(order: Order): Order {
        return Kitchen.Get(order);
    }
}

// --- Order Manager ---
interface OrderManagerEvents {
    orderReady: (order: Order) => void;
}

class OrderManager extends EventEmitter {
    private pendingOrders: Order[] = [];

    override emit<K extends keyof OrderManagerEvents>(
        event: K,
        ...args: Parameters<OrderManagerEvents[K]>
    ): boolean {
        return super.emit(event, ...args);
    }

    override on<K extends keyof OrderManagerEvents>(
        event: K,
        listener: OrderManagerEvents[K]
    ): this {
        return super.on(event, listener);
    }

    constructor(private kitchen: KitchenAdapter) {
        super();
        this.pollOrders();
    }

    placeOrder(order: Order) {
        this.kitchen.makeOrder(order);
        this.pendingOrders.push(order);
    }

    private pollOrders() {
        setInterval(() => {
            for (let order of [...this.pendingOrders]) {
                if (this.kitchen.isReady(order)) {
                    this.pendingOrders = this.pendingOrders.filter(o => o.id !== order.id);
                    const readyOrder = this.kitchen.getOrder(order);
                    this.emit('orderReady', readyOrder);
                }
            }
        }, 1000);
    }
}

// --- Order and Table ---
class Order {
    static counter = 0;
    id: number;
    status: 'pending' | 'ready' | 'delivered' = 'pending';

    constructor(public item: string, public tableId: number) {
        this.id = Order.counter++;
    }
}

class Table {
    constructor(public id: number, public customers: Customer[]) { }
}

// --- WaiterRobot ---
type WaiterTask = { type: 'deliver', order: Order } | { type: 'water', tableId: number };

class WaiterRobot {
    private taskQueue: WaiterTask[] = [];
    private busy = false;

    constructor(public id: number, private orderManager: OrderManager) {
        this.orderManager.on('orderReady', (order: Order) => {
            if (order.status !== 'delivered') {
                this.enqueueTask({ type: 'deliver', order });
            }
        });
    }

    takeOrder(item: string, tableId: number) {
        const order = new Order(item, tableId);
        console.log(`WaiterRobot${this.id}: Taking order for ${item} from table ${tableId}`);
        this.orderManager.placeOrder(order);
        return true;
    }

    enqueueTask(task: WaiterTask) {
        if (task.type === 'deliver' && task.order.status === 'delivered') {
            console.log(`WaiterRobot${this.id}: Order ${task.order.item} already delivered to table ${task.order.tableId}`);
            return;
        }
        this.taskQueue.push(task);
        this.processQueue();
    }

    isFree(): boolean {
        return !this.busy;
    }

    private async processQueue() {
        if (this.busy || this.taskQueue.length === 0) return;
        const task = this.taskQueue.shift();
        if (!task) return;
        this.busy = true;

        switch (task.type) {
            case 'deliver':
                if (task.order.status !== 'delivered') {
                    this.deliverFood(task.order);
                }
                break;
            case 'water':
                this.serveWater(task.tableId);
                break;
        }

        this.busy = false;
        this.processQueue();
    }

    private deliverFood(order: Order) {
        console.log(`WaiterRobot${this.id}: Delivering ${order.item} to table ${order.tableId}`);
        order.status = 'delivered';
    }

    private serveWater(tableId: number) {
        console.log(`WaiterRobot${this.id}: Serving water to table ${tableId}`);
    }
}

// --- Customer ---
class Customer {
    constructor(
        public name: string,
        public tableId: number,
        private waiter: WaiterRobot,
        private menu: Menu
    ) { }

    orderFood(item: string): boolean {
        if (!this.menu.hasItem(item)) {
            console.log(`${this.name}: Sorry, ${item} is not on the menu`);
            return false;
        }
        console.log(`${this.name}: Ordering ${item}`);
        return this.waiter.takeOrder(item, this.tableId);
    }

    requestWater() {
        console.log(`${this.name}: Requesting water`);
        this.waiter.enqueueTask({ type: 'water', tableId: this.tableId });
    }
}

// --- Menu ---
class MenuItem {
    constructor(
        public name: string,
        public price: number,
        public description: string,
        public preparationTime: number = 10 // in minutes
    ) {}
}

class Menu {
    private items: Map<string, MenuItem> = new Map();

    addItem(item: MenuItem) {
        this.items.set(item.name, item);
    }

    getItem(name: string): MenuItem | undefined {
        return this.items.get(name);
    }

    getAllItems(): MenuItem[] {
        return Array.from(this.items.values());
    }

    hasItem(name: string): boolean {
        return this.items.has(name);
    }
}

// --- Restaurant Setup ---
class Restaurant {
    private kitchen = new KitchenAdapter();
    private orderManager = new OrderManager(this.kitchen);
    private waiters: WaiterRobot[] = [
        new WaiterRobot(1, this.orderManager),
        new WaiterRobot(2, this.orderManager)
    ];
    private tables: Table[] = [];
    private menu: Menu = new Menu();

    constructor() {
        // Initialize menu with some items
        this.initializeMenu();
    }

    private initializeMenu() {
        this.menu.addItem(new MenuItem("Ratatouille", 15.99, "Classic French vegetable dish", 20));
        this.menu.addItem(new MenuItem("Salad", 8.99, "Fresh garden salad", 5));
        this.menu.addItem(new MenuItem("Steak", 25.99, "Grilled to perfection", 25));
        this.menu.addItem(new MenuItem("Pasta", 12.99, "House-made pasta", 15));
    }

    addCustomerToTable(customerName: string, tableId: number) {
        let table = this.tables.find(t => t.id === tableId);
        if (!table) {
            table = new Table(tableId, []);
            this.tables.push(table);
        }
        const waiter = this.waiters.find(w => w.isFree()) || this.waiters[0];
        const customer = new Customer(customerName, tableId, waiter, this.menu);
        table.customers.push(customer);
        return customer;
    }

}

// --- Example Usage ---
const restaurant = new Restaurant();
const alice = restaurant.addCustomerToTable("Alice", 1);
const bob = restaurant.addCustomerToTable("Bob", 1);
const carol = restaurant.addCustomerToTable("Carol", 2);

alice.orderFood("Ratatouille");
bob.requestWater();
carol.requestWater();

// Simulate a second dish that will be faster to prepare
setTimeout(() => {
    carol.orderFood("Salad");
}, 1000);