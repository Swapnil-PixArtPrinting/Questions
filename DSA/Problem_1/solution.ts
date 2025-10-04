// Interfaces and Base Classes
export interface ICartItem {
    id: string;
}

class Product implements ICartItem {
    id: string;
    productType: string;
    currentCost: number;
    readonly originalCost: number;

    constructor(id: string, cost: number, productType: string) {
        this.id = id;
        this.productType = productType;
        this.currentCost = cost;
        this.originalCost = cost;
    }

    applyPercentageDiscount(percent: number) {
        this.currentCost -= this.originalCost * (percent / 100);
    }

    applyFlatDiscount(amount: number) {
        this.currentCost = Math.max(0, this.originalCost - amount);
    }
}

abstract class Coupon implements ICartItem {
    id: string;
    constructor(id: string) {
        this.id = id;
    }
    abstract apply(cart: ICartItem[], index: number): void;
}

// Coupon: X% off all products
class PercentOffAllCoupon extends Coupon {
    percentageOff: number;

    constructor(id: string, percentageOff: number) {
        super(id);
        this.percentageOff = percentageOff;
    }

    apply(cart: ICartItem[], _index: number): void {
        for (const item of cart) {
            if (item instanceof Product) {
                item.applyPercentageDiscount(this.percentageOff);
            }
        }
    }
}

// Coupon: X% off the next product
class PercentOffNextCoupon extends Coupon {
    percentageOff: number;

    constructor(id: string, percentageOff: number) {
        super(id);
        this.percentageOff = percentageOff;
    }

    apply(cart: ICartItem[], index: number): void {
        for (let i = index + 1; i < cart.length; i++) {
            const next = cart[i];
            if (next instanceof Product) {
                next.applyPercentageDiscount(this.percentageOff);
                break;
            }
        }
    }
}

// Coupon: $X off Nth product of given type
class DollarOffNthProductCoupon extends Coupon {
    amount: number;
    targetCount: number;
    productType: string;

    constructor(id: string, amount: number, targetCount: number, productType: string) {
        super(id);
        this.amount = amount;
        this.targetCount = targetCount;
        this.productType = productType;
    }

    apply(cart: ICartItem[], _index: number): void {
        let count = 0;
        for (const item of cart) {
            if (item instanceof Product && item.productType === this.productType) {
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
function isCoupon(item: ICartItem) {
    return item instanceof Coupon;
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
