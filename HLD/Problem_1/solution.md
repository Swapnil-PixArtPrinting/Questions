# Product Catalog Indexing System - HLD Solution

## Problem Overview
Design a scalable product catalog indexing system that can aggregate product data from multiple microservices and make them searchable. The system must support batch indexing, on-demand indexing, and product deletion.

## Solution Approach

This high-level design uses **microservices architecture** with **event-driven patterns** and **cloud-native AWS services** to create a scalable, resilient product indexing system.

### Key Requirements
- Fetch product data from multiple services (pricing, inventory, content, etc.)
- Support batch indexing of all products
- Support on-demand indexing of specific products
- Support product deletion from index
- Handle different scaling characteristics of various services

## High-Level Architecture

```mermaid
graph TB
    subgraph "External Triggers"
        API[API Gateway]
        CRON[EventBridge Scheduler]
        EVENTS[Product Events SNS/SQS]
    end
    
    subgraph "Orchestration Layer"
        SF[Step Functions Workflow]
        LAMBDA_ORCH[Orchestrator Lambda]
    end
    
    subgraph "Data Sources"
        MERCH[Merchandising Service]
        PRICE[Pricing Service]
        INV[Inventory Service]
        MEDIA[Media Service]
        VAR[Variants Service]
        URL[URL Service]
    end
    
    subgraph "Processing Layer"
        FETCH_POOL[Parallel Fetcher Lambdas]
        AGG[Data Aggregator Lambda]
        TRANS[Data Transformer Lambda]
    end
    
    subgraph "Storage & Index"
        OPENSEARCH[Amazon OpenSearch]
        PRODUCT_DB[Product Reference DB DynamoDB]
    end
    
    API --> SF
    CRON --> SF
    EVENTS --> SF
    
    SF --> LAMBDA_ORCH
    LAMBDA_ORCH --> FETCH_POOL
    
    FETCH_POOL --> MERCH
    FETCH_POOL --> PRICE
    FETCH_POOL --> INV
    FETCH_POOL --> MEDIA
    FETCH_POOL --> VAR
    FETCH_POOL --> URL
    
    FETCH_POOL --> AGG
    AGG --> TRANS
    TRANS --> OPENSEARCH
    
    LAMBDA_ORCH --> PRODUCT_DB
```

## System Flow Diagrams

### Batch Indexing Flow
```mermaid
sequenceDiagram
    participant EB as EventBridge
    participant SF as Step Functions
    participant DB as Product DB
    participant Fetchers as Parallel Fetchers
    participant Services as External Services
    participant Agg as Aggregator
    participant OS as OpenSearch
    
    EB->>SF: Trigger batch job (cron)
    SF->>DB: Get all product IDs
    DB-->>SF: Return product list
    
    loop For each product batch
        SF->>Fetchers: Spawn parallel fetchers
        Fetchers->>Services: Fetch product data
        Services-->>Fetchers: Return data
        Fetchers->>Agg: Send fetched data
        Agg->>Agg: Merge & validate data
        Agg->>OS: Index transformed document
    end
    
    SF-->>EB: Batch complete
```

### On-Demand Indexing Flow
```mermaid
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Lambda as Orchestrator
    participant SF as Step Functions
    participant Fetchers
    participant Services as External Services
    participant OS as OpenSearch
    
    Client->>API: POST /index/{productId}
    API->>Lambda: Trigger indexing
    Lambda->>SF: Start workflow for single product
    SF->>Fetchers: Parallel fetch product data
    Fetchers->>Services: Get latest product info
    Services-->>Fetchers: Return data
    Fetchers->>SF: Aggregated data
    SF->>OS: Update product index
    OS-->>SF: Index success
    SF-->>API: Response
    API-->>Client: 200 OK
```

### Event-Driven Updates
```mermaid
flowchart TD
    A[Product Change Event] --> B{Event Type}
    B -->|Stock Change| C[Inventory-Only Update]
    B -->|Price Change| D[Pricing-Only Update]
    B -->|Content Change| E[Merchandising-Only Update]
    B -->|Full Update| F[Complete Re-index]
    
    C --> G[Fetch Inventory Service]
    D --> H[Fetch Pricing Service]
    E --> I[Fetch Merchandising Service]
    F --> J[Fetch All Services]
    
    G --> K[Update OpenSearch]
    H --> K
    I --> K
    J --> K
    
    K --> L[Index Updated]
```

## Service Architecture Components

```mermaid
classDiagram
    class ProductIndexingOrchestrator {
        +indexProduct(productId: string) Promise~void~
        +batchIndexProducts(productIds: string[]) Promise~void~
        +deleteProduct(productId: string) Promise~void~
        -fetchProductData(productId: string) Promise~ProductData~
        -transformForIndex(data: ProductData) IndexDocument
    }
    
    class DataFetcher {
        <<interface>>
        +fetchData(productId: string) Promise~ServiceData~
        +getServiceName() string
    }
    
    class MerchandisingFetcher {
        +fetchData(productId: string) Promise~MerchandisingData~
        +getServiceName() string
    }
    
    class PricingFetcher {
        +fetchData(productId: string) Promise~PricingData~
        +getServiceName() string
    }
    
    class InventoryFetcher {
        +fetchData(productId: string) Promise~InventoryData~
        +getServiceName() string
    }
    
    class DataAggregator {
        +aggregateData(fetchedData: Map~string, ServiceData~) ProductData
        +validateData(data: ProductData) boolean
    }
    
    class SearchIndexer {
        +indexDocument(document: IndexDocument) Promise~void~
        +deleteDocument(productId: string) Promise~void~
        +bulkIndex(documents: IndexDocument[]) Promise~void~
    }
    
    DataFetcher <|-- MerchandisingFetcher
    DataFetcher <|-- PricingFetcher
    DataFetcher <|-- InventoryFetcher
    ProductIndexingOrchestrator --> DataFetcher
    ProductIndexingOrchestrator --> DataAggregator
    ProductIndexingOrchestrator --> SearchIndexer
```

## Key Design Decisions

### 1. **Microservices Integration**
- **Pattern**: Service Aggregation Pattern
- **Benefit**: Isolates failures, allows independent scaling
- **Implementation**: Parallel fetchers with circuit breakers

### 2. **Event-Driven Architecture**
- **Pattern**: Event Sourcing + CQRS
- **Benefit**: Real-time updates, reduced full reindexing
- **Implementation**: SNS/SQS for product change events

### 3. **Orchestration Strategy**
- **Pattern**: Workflow Orchestration (Step Functions)
- **Benefit**: Visual workflow, built-in error handling, state management
- **Implementation**: Map states for parallel processing

### 4. **Data Consistency**
- **Pattern**: Eventually Consistent
- **Benefit**: High availability, partition tolerance
- **Trade-off**: Some data may be briefly stale

## Scalability Analysis

### Performance Estimates
| Products | Sequential Time | Parallel Time (10 workers) | Frequency |
|----------|-----------------|----------------------------|-----------|
| 100      | ~3 minutes      | ~18 seconds               | Every 15 min |
| 1,000    | ~30 minutes     | ~3 minutes                | Hourly |
| 10,000   | ~5 hours        | ~30 minutes               | Daily |
| 100,000  | ~50 hours       | ~5 hours                  | Weekly |

### Scaling Strategies
1. **Horizontal Scaling**: Auto-scaling Lambda functions
2. **Batching**: Process products in configurable batch sizes
3. **Rate Limiting**: Protect downstream services from overload
4. **Caching**: Cache frequently accessed product reference data
5. **Sharding**: Partition products by category or region

## Monitoring & Observability

```mermaid
graph LR
    subgraph "Metrics"
        M1[Index Success Rate]
        M2[Fetch Latency per Service]
        M3[Processing Throughput]
        M4[Error Rate by Service]
    end
    
    subgraph "Alerts"
        A1[High Error Rate]
        A2[Service Timeout]
        A3[Index Lag]
        A4[Queue Backlog]
    end
    
    subgraph "Dashboards"
        D1[Real-time Processing]
        D2[Service Health]
        D3[Cost Analysis]
    end
    
    M1 --> A1
    M2 --> A2
    M3 --> A3
    M4 --> A1
```

## Extension Points

### 1. **Partial Indexing**
```typescript
enum IndexType {
    FULL = 'full',
    PRICING_ONLY = 'pricing',
    INVENTORY_ONLY = 'inventory',
    CONTENT_ONLY = 'content'
}
```

### 2. **Multi-Region Support**
- Deploy orchestrators in each region
- Cross-region replication of OpenSearch
- Regional service endpoints

### 3. **A/B Testing Support**
- Multiple index versions
- Traffic splitting for index validation
- Rollback capabilities

## Cost Optimization

1. **Spot Instances**: Use for batch processing workflows
2. **Reserved Capacity**: For predictable baseline load
3. **Intelligent Tiering**: Archive old product data
4. **Service Mesh**: Optimize inter-service communication

This design provides a robust, scalable solution that can handle varying loads while maintaining data consistency and system reliability.

