# E-Commerce Microservices

A simple E-Commerce application developed using a Microservices Architecture.

## Project Overview

This project is divided into independent services for users, products, and orders. A frontend application communicates with these services through REST APIs.

## Architecture

```text
                Frontend
                   |
        -----------------------
        |          |          |
        v          v          v
   User Service Product Service Order Service
      :8081         :8082          :8083
                                  |
                         ----------------
                         |              |
                         v              v
                    User Service  Product Service
## Services

### User Service
- Manages user information
- Provides REST APIs for user operations
- Port: `8081`

### Product Service
- Manages product information
- Handles product stock
- Provides REST APIs for product operations
- Port: `8082`

### Order Service
- Creates and manages orders
- Validates users and products
- Checks product availability
- Calculates total price
- Updates product stock
- Port: `8083`

## Frontend

The frontend is developed using:

- HTML
- CSS
- JavaScript

It allows users to:
- View products
- Place orders
- View orders

## Technologies Used

- Java
- Spring Boot
- Spring Data JPA
- MySQL
- REST APIs
- HTML
- CSS
- JavaScript
- Git & GitHub

## Database

MySQL database is used for storing application data.

Database name:

`ecommerce`

## How to Run

Start the services in the following order:

1. User Service
2. Product Service
3. Order Service
4. Frontend using Live Server

Then open the frontend in a browser.

## Project Structure

```text
ECommerce-Microservices/
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── user-service/
│
├── product-service/
│
└── order-service/

