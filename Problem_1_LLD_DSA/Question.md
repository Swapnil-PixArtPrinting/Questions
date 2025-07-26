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
