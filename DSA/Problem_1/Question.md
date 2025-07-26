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

#### Follow up questions:

* Lots of coupon types
    * You hear that the Marketing department is planning to introduce 20 new kinds of coupons over the next few months. How does this knowledge affect your implementation? If they have a good implementation, it should not affect it at all, perhaps with the exception of adding factory methods.

* Sorting the list
    * Another good follow-up question is "If allowed to sort the list to get the best price, how would you implement this?". Implementing an exact solution for this problem is pretty tricky, so don't expect even a strong candidate to complete it within the hour's time. 


# 🛒 Shopping Cart Price Calculator (with Coupons)

This TypeScript solution simulates a shopping cart with support for coupons that affect pricing. Coupons must be applied **in sequence**, and they can be of different types.

---

### UML

```
+----------------------+
|      ICartItem       |  <<interface>>
+----------------------+
| + id: string         |
+----------------------+

            ▲
            |
+----------------------+        +---------------------------+
|       Product        |        |         ICoupon           |  <<interface>>
+----------------------+        +---------------------------+
| + id: string         |        | + id: string              |
| + productId: string  |        | + apply(cart, index): void|
| + currentCost: number|        +---------------------------+
| + originalCost: number|
+----------------------+
| + applyDiscount(percent)      ▲
| + applyFlatDiscount(amount)   |
+----------------------+
                                  |
          +-----------------------+------------------------------+
          |                       |                              |
+------------------------+ +------------------------+ +-------------------------------+
| PercentOffAllCoupon    | | PercentOffNextCoupon   | | DollarOffNthProductCoupon     |
+------------------------+ +------------------------+ +-------------------------------+
| + id: string           | | + id: string           | | + id: string                  |
| + percentageOff: number| | + percentageOff: number| | + amount: number              |
| + apply(...)           | | + apply(...)           | | + targetCount: number         |
|                        | |                        | | + productId: string           |
+------------------------+ +------------------------+ | + apply(...)                  |
                                                      +-------------------------------+

+----------------------+
|        Cart          |
+----------------------+
| - items: ICartItem[] |
+----------------------+
| + totalPrice(): number |
+----------------------+
           |
           v
   Uses a list of ICartItem
   Applies coupons in sequence

```
---

## 💡 Problem

Given a list of products and coupons interleaved in a cart (processed in order), compute the final price.

---

## 🎟️ Coupon Types

1. **PercentOffAllCoupon**
   - Applies a discount to **every product** in the cart.
   - E.g. "5% off all items"

2. **PercentOffNextCoupon**
   - Applies a discount to the **next product** after the coupon.
   - E.g. "10% off your next item"

3. **DollarOffNthProductCoupon**
   - Applies a **fixed amount discount** to the Nth product of a specific type.
   - E.g. "$5 off your 3rd postcard sorter"

---

## ✅ Rules

- Coupons are applied **in order**, as they appear in the cart.
- A product can be affected by **multiple coupons**.
- A coupon may or may not be effective depending on cart state.

---

## 🧱 Architecture

### Classes

- `Product`: Represents a buyable item.
- `ICoupon`: Interface for all coupon types.
- `Cart`: Holds cart items and calculates total price.
- `PercentOffAllCoupon`, `PercentOffNextCoupon`, `DollarOffNthProductCoupon`: Implement the `ICoupon` interface.

### Design Principles

- **Open-Closed Principle**: Add new coupon types by implementing `ICoupon`—no change to existing logic.
- **Single Responsibility**: Each class does one job (product logic, coupon logic, total logic).
- **Extensibility**: Easily supports future coupon types and logic.

---

## 🧪 Test Output

Cart 1: Total = $29.00
Cart 2: Total = $28.00
Cart 3: Total = $12.90
Complex Cart: Total = $60.22


---

## 📦 Future Enhancements

- Add coupon **expiration rules** or **minimum cart amount conditions**.
- Add support for **sorting items** to get lowest total.
- Use a **factory** pattern for creating coupons from strings/configs.
- Implement immutable cart operations for safe preview/undo.

