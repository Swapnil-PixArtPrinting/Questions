/**
 * 

Web sites like Vistaprint and Amazon have an online shopping cart that holds the customer's order.

Your goal is to write a program that calculates the total price of the order in the cart. 
The catch is that the cart may contain coupons that affect the prices. 

There are three kinds of coupons:
    Take N% off each individual item in the cart (e.g. a general "10% off" coupon)
    Take P% off the next item in the cart (e.g. "take 20% off your next product")
    Take $D off your Nth item of type T (e.g. "take $5 off your third business card holder")

The cart contents (products and coupons) must be considered in sequence.

*/

interface ICart {
    cartItems: ICartItems[];
    getTotalPrice: () => number;
} 

interface ICartItems {
    id: string;
}

interface IProduct extends ICartItems {
    type: string;
    currentPrice: number;
    applyFlatDiscount: (amount: number) => number;
    applyPercentageDiscount: (discountPercentage: number) => number;
}

abstract class Coupon implements ICartItems {
    constructor(public id: string) {}
    abstract apply(cartItems:ICartItems[], currentIndex: number): void
}

class Cart implements ICart {
    constructor(public cartItems: ICartItems[]) {
    }
    getTotalPrice() {
        this.cartItems.forEach((item, index) => {
            if(item instanceof Coupon) {
                item.apply(this.cartItems, index)
            }
        });

        let totalPrice = 0;
        this.cartItems.forEach((item, index) => {
            if(item instanceof Product) {
                totalPrice += item.currentPrice;
            }
        });
        return totalPrice;
    }
}

class Product implements IProduct {
    constructor(
        public id: string, 
        public type: string,
        public currentPrice: number,
    ) {
    }
    applyFlatDiscount(amount: number) {
        this.currentPrice = Math.max(this.currentPrice - amount, 0);
        return this.currentPrice;
    }
    applyPercentageDiscount(discountPercentage: number) {
        this.currentPrice = this.currentPrice - (this.currentPrice * (discountPercentage / 100));
        return this.currentPrice;
    }
}

class PercentageOffForAll extends Coupon {
    constructor(
        public id: string, 
        public discountPercentage: number
    ) {
        super(id);
    }
    apply(cartItems: ICartItems[], currentIndex: number) {
        for(const item of cartItems) {
            if(item instanceof Product) {
                item.applyPercentageDiscount(this.discountPercentage)
            }
        }
    }
}

class PercentageOffForNextItem extends Coupon {
    constructor(
        public id: string, 
        public discountPercentage: number
    ) {
        super(id);
    }
    apply(cartItems: ICartItems[], currentIndex: number) {
        for(let i = currentIndex + 1; i < cartItems.length; i++) {
            const item = cartItems[i];
            if(item instanceof Product) {
                item.applyPercentageDiscount(this.discountPercentage);
                break;
            }
        }
    }
}

class AmountOffForNthProductType extends Coupon {
    constructor(
        public id: string, 
        public amount: number,
        public count: number,
        public productType: string
    ) {
        super(id);
    }
    apply(cartItems: ICartItems[], currentIndex: number) {
        let productCount = 0;
            for(const item of cartItems) {
            if(item instanceof Product && item.type === this.productType) {
                productCount++;
                if(productCount === this.count) {
                    item.applyFlatDiscount(this.amount);
                    break;
                }
            }
        }
    }
}

function runCart(cartItems: ICartItems[]) {
    const cart = new Cart(cartItems);
    console.log(`Total Price of cart ${cart.getTotalPrice()}`)
}

/**
 * Cart #1

Coupon: Take 10% off your next item
$10 postcard sorter
$20 stationery organizer
Total = $29
 */

runCart([
    new PercentageOffForNextItem("c1", 10),
    new Product("P1", "postcard-sorter", 10),
    new Product("P2", "stationery-organizer", 20)
]);


/**
 *
Cart #2

$10 postcard sorter
Coupon: Take 10% off your next item
$20 stationery organizer
Total = $28

*/
runCart([
    new Product("P1", "postcard-sorter", 10),
    new PercentageOffForNextItem("c1", 10),
    new Product("P2", "stationery-organizer", 20)
]);

/**
 * 
Cart #3

$10 postcard sorter
Coupon: Take $2 off your 2nd postcard sorter
Coupon: 25% off each individual item
Coupon: Take 10% off the next item in the cart
$10 postcard sorter

Total = ($10 * 75%) + (($10 - $2) * 75% * 90%) = $7.50 + $5.40 = $12.90

*/
runCart([
    new Product("P1", "postcard-sorter", 10),
    new AmountOffForNthProductType("C1", 2, 2, "postcard-sorter"),
    new PercentageOffForAll("C2", 25),
    new PercentageOffForNextItem("C3", 10),
    new Product("P1", "postcard-sorter", 10),
]);










