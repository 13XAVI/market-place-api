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

## Entity Relationships


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

