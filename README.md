# Market Place API

## Overview

Marketplace API provides endpoints to manage users, products, orders, reviews, and transactions within an online marketplace. It allows buyers to browse and purchase products, while sellers can list, update, and manage their inventory. The API supports authentication, role-based access,It allows users manage products, place orders, manage their accounts, and perform other related activities

## Documentation

Find the Swagger API documentation at `https:`

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

1. **Build the Docker Image:**
   ```sh
   docker build -t <image_name> .
   ```
2. **Use Docker Compose to run Containers :**
   ```sh
   docker-compose up
   ```
3. **Stop the Running Containers:**
   - If running with Docker Compose:
     ```sh
     docker-compose down
     ```

## Usage

Once the development server is running, you can interact with the API using HTTP requests.
