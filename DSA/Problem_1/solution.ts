
export interface ICartItem {
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
    console.log(`Actual total: $${cart.totalPrice()} `);
};

// Cart 2
const runCart2 = () => {
    const coupon1 = new PercentOffNextCoupon('coup1', 10);
    const item1 = new Product('item1', 10, 'postcardsorter');
    const item2 = new Product('item2', 20, 'stationaryorganizer');

    const cart = new Cart([item1, coupon1, item2]);
    console.log('Cart 2 total should be $28');
    console.log(`Actual total: $${cart.totalPrice()} `);
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
    console.log(`Actual total: $${cart.totalPrice()} `);
};


runCart1();
runCart2();
runCart3();

