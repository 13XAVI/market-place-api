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
