
### Problem 6 (HLD):

* We want to build a product catalog for our ecommerce platform to enable our customers to easily find products based on different criteria. We need to fetch the product data from different services on the platform. For example, the product description, variants, availability, pricing, URL, images, etc. Each of these services is owned by a different team and some may scale better than others. You may assume that there is another service (a product store) that is a black box, where you store the data which provide an interface for searching the products using free text search.

    * Design a system to gather product data for different products and to make them indexable.
    * We need to be able to index all products as a batch.
    * We need to be able to index a specific product on demand.
    * We need to be able to delete a product.

* Questions:
    * To start the interview the candidate will need to figure out what product data is needed and what dependencies provide that data. Here the interviewer can push the candidate to continue exploring possible dependencies if the candidate is stuck. For example, merchandising data (text, product name), pricing, product attributes/variants, product availability, stock info, etc. See 
    https://vistaprint.atlassian.net/wiki/spaces/LAT/pages/405438716/Dependencies for examples.

    * How often can we run this (how many times a day) if we have 100 products? What about 1000 products? Or 10000? What does this mean for the requirements on the scalability of the underlying dependencies?

    * The candidate should estimate the response time for each dependency, and based on the number of dependencies and the number of products, figure out how long it takes to index all products, and from that, how often it can run.

    * Another good question to ask is “how often does it make sense to index all products?” Ask the candidate to think about how often the data changes. Does some data change more often? What do we do if we need to have more up to date stock information compared to merchandising data? Does the candidates design force a full reindex of all data if we only want to update one part of it? How can the candidate adapt their design to enable the system to index some data more frequently?

    * How can we scale this to a larger number of products? How can we make this an event driven architecture?
