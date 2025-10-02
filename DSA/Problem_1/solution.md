# Shopping Cart with Coupons - Solution

## Problem Overview
This solution implements a shopping cart system that can handle different types of coupons that affect the total price calculation. The system processes items and coupons in sequence.

## Solution Approach

The solution uses object-oriented design with interfaces and polymorphism to handle different types of coupons:

1. **Interface Segregation**: Separate interfaces for cart items and coupons
2. **Strategy Pattern**: Different coupon types implement the same interface but with different discount logic
3. **Sequential Processing**: Items and coupons are processed in the order they appear in the cart

## Architecture Diagram

```mermaid
classDiagram
    class ICartItem {
        <<interface>>
        +string id
    }
    
    class ICoupon {
        <<interface>>
        +string id
        +apply(cart: ICartItem[], index: number) void
    }
    
    class Product {
        +string id
        +string productId
        +number currentCost
        +number originalCost
        +constructor(id: string, cost: number, productId: string)
        +applyDiscount(percent: number) void
        +applyFlatDiscount(amount: number) void
    }
    
    class PercentOffAllCoupon {
        +string id
        +number percentageOff
        +constructor(id: string, percentageOff: number)
        +apply(cart: ICartItem[], index: number) void
    }
    
    class PercentOffNextCoupon {
        +string id
        +number percentageOff
        +constructor(id: string, percentageOff: number)
        +apply(cart: ICartItem[], index: number) void
    }
    
    class DollarOffNthProductCoupon {
        +string id
        +number amount
        +number targetCount
        +string productId
        +constructor(id: string, amount: number, targetCount: number, productId: string)
        +apply(cart: ICartItem[], index: number) void
    }
    
    class Cart {
        -ICartItem[] items
        +constructor(items: ICartItem[])
        +totalPrice() number
    }
    
    ICartItem <|-- Product
    ICartItem <|-- ICoupon
    ICoupon <|-- PercentOffAllCoupon
    ICoupon <|-- PercentOffNextCoupon
    ICoupon <|-- DollarOffNthProductCoupon
    Cart --> ICartItem
```

## Algorithm Flow

```mermaid
flowchart TD
    A[Start: Cart.totalPrice] --> B[Iterate through all items]
    B --> C{Is item a coupon?}
    C -->|Yes| D[Apply coupon logic based on type]
    C -->|No| E[Continue to next item]
    
    D --> F{Coupon Type?}
    F -->|PercentOffAll| G[Apply discount to all products]
    F -->|PercentOffNext| H[Apply discount to next product]
    F -->|DollarOffNth| I[Apply discount to Nth product of specific type]
    
    G --> E
    H --> E
    I --> E
    
    E --> J{More items?}
    J -->|Yes| B
    J -->|No| K[Calculate total from all products]
    K --> L[Return total price]
```

## Coupon Processing Logic

```mermaid
sequenceDiagram
    participant Cart
    participant Coupon
    participant Product
    
    Cart->>Cart: Process items sequentially
    Cart->>Coupon: Apply coupon at current index
    
    alt PercentOffAllCoupon
        Coupon->>Product: Apply percentage discount to all products
    else PercentOffNextCoupon
        Coupon->>Product: Apply percentage discount to next product only
    else DollarOffNthProductCoupon
        Coupon->>Product: Apply flat discount to Nth product of specific type
    end
    
    Product->>Product: Update currentCost
    Cart->>Cart: Continue to next item
    Cart->>Cart: Sum all product costs for total
```

## Key Components

### 1. Interfaces
- **ICartItem**: Base interface for all cart items (products and coupons)
- **ICoupon**: Interface defining the contract for all coupon types

### 2. Product Class
- Maintains original and current cost
- Supports both percentage and flat discounts
- Identified by product type for targeted coupons

### 3. Coupon Types
- **PercentOffAllCoupon**: Applies percentage discount to all products
- **PercentOffNextCoupon**: Applies percentage discount to the next product in sequence
- **DollarOffNthProductCoupon**: Applies flat discount to the Nth occurrence of a specific product type

### 4. Cart Class
- Processes items sequentially
- Applies coupons as they are encountered
- Calculates final total from product costs

## Time Complexity
- **O(n²)** in worst case where each coupon needs to scan remaining items
- **O(n)** space complexity for storing cart items

## Implementation Notes
The solution includes all necessary components:
1. **ICoupon interface**: Properly extends ICartItem and defines the apply method contract
2. **applyFlatDiscount method**: Implemented in Product class with proper bounds checking (Math.max(0, ...))
3. **Complete type safety**: All interfaces and implementations are fully defined

The code is production-ready and handles edge cases appropriately.
