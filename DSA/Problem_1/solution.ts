// Interfaces and Base Classes
export interface ICartItem {
    id: string;
}

class Product implements ICartItem {
    id: string;
    productId: string;
    currentCost: number;
    readonly originalCost: number;

    constructor(id: string, cost: number, productId: string) {
        this.id = id;
        this.productId = productId;
        this.currentCost = cost;
        this.originalCost = cost;
    }

    applyDiscount(percent: number) {
        this.currentCost -= this.currentCost * (percent / 100);
    }

    applyFlatDiscount(amount: number) {
        this.currentCost = Math.max(0, this.currentCost - amount);
    }
}

interface ICoupon extends ICartItem {
    apply(cart: ICartItem[], index: number): void;
}

// Coupon: X% off all products
class PercentOffAllCoupon implements ICoupon {
    id: string;
    percentageOff: number;

    constructor(id: string, percentageOff: number) {
        this.id = id;
        this.percentageOff = percentageOff;
    }

    apply(cart: ICartItem[], _index: number): void {
        for (const item of cart) {
            if (item instanceof Product) {
                item.applyDiscount(this.percentageOff);
            }
        }
    }
}

// Coupon: X% off the next product
class PercentOffNextCoupon implements ICoupon {
    id: string;
    percentageOff: number;

    constructor(id: string, percentageOff: number) {
        this.id = id;
        this.percentageOff = percentageOff;
    }

    apply(cart: ICartItem[], index: number): void {
        for (let i = index + 1; i < cart.length; i++) {
            const next = cart[i];
            if (next instanceof Product) {
                next.applyDiscount(this.percentageOff);
                break;
            }
        }
    }
}

// Coupon: $X off Nth product of given type
class DollarOffNthProductCoupon implements ICoupon {
    id: string;
    amount: number;
    targetCount: number;
    productId: string;

    constructor(id: string, amount: number, targetCount: number, productId: string) {
        this.id = id;
        this.amount = amount;
        this.targetCount = targetCount;
        this.productId = productId;
    }

    apply(cart: ICartItem[], _index: number): void {
        let count = 0;
        for (const item of cart) {
            if (item instanceof Product && item.productId === this.productId) {
                count++;
                if (count === this.targetCount) {
                    item.applyFlatDiscount(this.amount);
                    break;
                }
            }
        }
    }
}

// Type Guard
function isCoupon(item: ICartItem): item is ICoupon {
    return (item as ICoupon).apply !== undefined;
}

// Cart
class Cart {
    constructor(private items: ICartItem[]) { }

    totalPrice(): number {
        this.items.forEach((item, index) => {
            if (isCoupon(item)) {
                item.apply(this.items, index);
            }
        });

        return this.items.reduce((sum, item) =>
            item instanceof Product ? sum + item.currentCost : sum, 0);
    }
}

// --- TEST CASES ---

function runCart(title: string, cartItems: ICartItem[]) {
    const cart = new Cart(cartItems);
    console.log(`${title}: Total = $${cart.totalPrice().toFixed(2)}`);
}

// Cart 1
runCart("Cart 1", [
    new PercentOffNextCoupon("c1", 10),
    new Product("p1", 10, "postcardsorter"),
    new Product("p2", 20, "stationaryorganizer"),
]);

// Cart 2
runCart("Cart 2", [
    new Product("p1", 10, "postcardsorter"),
    new PercentOffNextCoupon("c1", 10),
    new Product("p2", 20, "stationaryorganizer"),
]);

// Cart 3
runCart("Cart 3", [
    new Product("p1", 10, "postcardsorter"),
    new DollarOffNthProductCoupon("c1", 2, 2, "postcardsorter"),
    new PercentOffAllCoupon("c2", 25),
    new PercentOffNextCoupon("c3", 10),
    new Product("p2", 10, "postcardsorter"),
]);

// Complex Cart
runCart("Complex Cart", [
    new PercentOffAllCoupon("c1", 5),
    new Product("p1", 10, "postcardsorter"),
    new Product("p2", 15, "stationaryorganizer"),
    new DollarOffNthProductCoupon("c2", 5, 3, "postcardsorter"),
    new PercentOffNextCoupon("c3", 50),
    new Product("p3", 10, "postcardsorter"),
    new Product("p4", 18, "businesscardholder"),
    new DollarOffNthProductCoupon("c4", 2, 2, "postcardsorter"),
    new Product("p5", 16, "postcardsorter"),
    new Product("p6", 10, "postcardsorter"),
]);
