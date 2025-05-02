# Market Place API

## Overview

Marketplace API provides a comprehensive RESTful API for an online marketplace that allows users to buy
and sell products, manage their inventory and process orders. and perform other related activities

## Documentation

Find the Swagger API documentation at `http://localhost:5000/api`

## Installation

To get started with Dynamites API, follow these simple steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/13XAVI/market-place-api.git
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run start
   ```

## Testing

- Run tests

  ```bash
  npm run test
  ```

- Run tests with coverage

  ```bash
  npm run test:cov
  ```

## Docker

Before you run that commands you must have docker installed in your PC

1.  **Build the Docker Image Containers Together:**

    ```sh
    docker-compose up --build -d
    ```

2.  **Use Docker Compose to run migration :**
    ```sh
    docker-compose run --rm app npx prisma migrate dev --name init
    ```
3.  **Use Docker to run Seed :**
    ```sh
    docker-compose exec app npm run seed
    ```
4.  **UI URLS :**
    - If running database UI
    ```sh
    docker-compose exec app npx prisma studio --port 5555
    ```
    - If running Kafka Visit
    ```sh
     http://localhost:8080
    ```
5.  **Additionally if you want to Stop the Running Containers:**
    - running with Docker Compose:
    ```sh
    docker-compose down
    ```
    - logging kafka and zookeper
      ```sh
      docker-compose logs kafka
      docker-compose logs zookeeper
      ```

## Usage

Once the development server is running, you can interact with the API using HTTP requests.


You can use tools like **Postman**, **Insomnia**, or **cURL** to test the endpoints.

---

## API Endpoints

### 🔐 Authentication

- `POST /auth/signup` – Register a new user  
- `POST /auth/login` – Login and receive JWT  
- `POST /auth/verify-email` – Verify user email  
- `POST /auth/forgot-password` – Initiate password reset  
- `POST /auth/reset-password` – Reset password using token  

### 👤 Users

- `GET /users/:id` – Get user profile  
- `PUT /users/:id` – Update user info  
- `DELETE /users/:id` – Delete user  

### 🛍️ Products

- `GET /products` – List all products  
- `GET /products/:id` – Get product details  
- `POST /products` – Create a new product (seller only)  
- `PUT /products/:id` – Update product  
- `DELETE /products/:id` – Delete product  

### 🏬 Stores

- `POST /stores` – Create a new store  
- `GET /stores` – List all stores  
- `GET /stores/:id` – Get store by ID  
- `PUT /stores/:id` – Update store  
- `DELETE /stores/:id` – Delete store  

### 📦 Orders

- `POST /orders` – Create a new order  
- `GET /orders` – List user’s orders  
- `GET /orders/:id` – Get order details  
- `PUT /orders/:id` – Update order status (admin only)  

### ⭐ Reviews

- `POST /reviews` – Add a product review  
- `GET /products/:id/reviews` – List product reviews  

---

## Ev used
- PORT=5000
- DATABASE_PORT=5432
- POSTGRES_USER=postgres
- POSTGRES_PASSWORD=postgres
- POSTGRES_DB=market_api
- DATABASE_URL=postgresql://postgres:postgres@localhost:5432/market_api
- JWT_SECRET=market-api-secret
- SENDGRID_API_KEY=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
- KAFKA_BROKERS=kafka:9092
- KAFKAJS_NO_PARTITIONER_WARNING=1
- PRISMA_STUDIO_PORT=5555
- postgresql://user:password@localhost:5432/db

## Admin credentials
- email:tresorxavier16@gmail.com
- password:Hello@123!

## Entity Relationships
## 🧩 Entity Relationship Diagram (ERD)

The following section describes the key entities in the Marketplace system and how they relate to one another.

### 🔗 Relationships Overview

- A **User** can have one **Profile**.
- A **User** has a **Role** (admin, seller, or shopper).
- A **User** can own multiple **Stores**.
- A **User** can place multiple **Orders**.
- A **User** can write multiple **Reviews**.
- A **Store** can contain multiple **Products**.
- A **Product** belongs to a **Category** and optionally a **Store**.
- A **Product** can have multiple **OrderItems** and **Reviews**.
- An **Order** belongs to a **User** and contains multiple **OrderItems**.
- An **OrderItem** references a single **Product** and belongs to a single **Order**.
- A **Review** is linked to a **User** and a **Product**.

### 📦 Entities

#### User
- `id`, `name`, `email`, `password`, `roleId`, `profileId`, ...
- Relationships: Profile (1:1), Role (M:1), Orders (1:M), Stores (1:M), Reviews (1:M)

#### Role
- `id`, `name`
- Relationships: Users (1:M)

#### Profile
- `id`, `userId`
- Relationships: User (1:1)

#### Store
- `id`, `name`, `ownerId`
- Relationships: Owner (User), Products (1:M)

#### Product
- `id`, `name`, `price`, `categoryId`, `storeId`
- Relationships: Category (M:1), Store (M:1, optional), OrderItems (1:M), Reviews (1:M)

#### Category
- `id`, `name`, `description`
- Relationships: Products (1:M)

#### Order
- `id`, `userId`, `status`, ...
- Relationships: User (M:1), OrderItems (1:M)

#### OrderItem
- `id`, `orderId`, `productId`, `quantity`
- Relationships: Order (M:1), Product (M:1)

#### Review
- `id`, `rating`, `userId`, `productId`, `comment`
- Relationships: User (M:1), Product (M:1)

---

> 📝 **Note:** For a visual representation, refer to the ER diagram provided in the documentation or architecture section.


## System Design
![system design](https://github.com/user-attachments/assets/44fdecb5-2a8a-4959-9829-6f18fb665340)


```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--o{ STORE : owns
    USER ||--o| PROFILE : has
    USER }o--|| ROLE : assigned

    ROLE ||--o{ USER : includes

    ORDER ||--|{ ORDERITEM : contains
    ORDERITEM }|--|| PRODUCT : references

    PRODUCT }o--|| CATEGORY : belongs
    PRODUCT }o--|| STORE : listedBy
    PRODUCT ||--o{ REVIEW : receives

