# 🛒 E-Commerce Microservices Platform

A production-grade, distributed E-Commerce platform developed with **Java 21**, **Spring Boot 4.0.7**, **Spring Data JPA**, **MySQL**, and a modern responsive **HTML5/CSS3/JavaScript Glassmorphic Frontend**.

---

## 🏗️ Architecture Overview

The system is designed following the **Microservices Architecture pattern**. Each service is decoupled, runs independently on its own HTTP port, and maintains data persistence in MySQL.

```
                  +-----------------------------------+
                  |   Modern HTML5/JS Glassmorphism   |
                  |             Frontend              |
                  +-----------------+-----------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
+-------------------+     +-------------------+     +-------------------+
|   User Service    |     |  Product Service  |     |   Order Service   |
|    (Port 8081)    |     |    (Port 8082)    |     |    (Port 8083)    |
+---------+---------+     +---------+---------+     +---------+---------+
          |                         |                         |
          |                         +<------- RestClient -----+ (Stock & Price Check)
          |                         |                         |
          +-------------------------+-------------------------+
                                    |
                                    v
                        +-----------------------+
                        |  MySQL Database 8.0   |
                        |      (ecommerce)      |
                        +-----------------------+
```

---

## ⚡ Technologies Used

- **Java 21** - Core backend language features
- **Spring Boot 4.0.7** - Service initialization & REST APIs
- **Spring Data JPA & Hibernate** - Object-Relational Mapping (ORM)
- **Spring Security Crypto (BCrypt)** - Secure password hashing
- **MySQL 8.0.40** - Relational Database
- **Spring RestClient** - Synchronous inter-service HTTP communication
- **HTML5, CSS3 Glassmorphism, Vanilla ES6 JavaScript** - Responsive Frontend UI
- **Postman** - API testing & verification

---

## 🧩 Microservices Breakdown

### 1. User Service (`user-service` - Port 8081)
- Manages User registration, profiles, and roles (`CUSTOMER`, `ADMIN`).
- Implements **BCrypt Password Hashing** before saving to MySQL.
- Uses `@JsonProperty(access = Access.WRITE_ONLY)` to prevent password leaks in JSON responses.

### 2. Product Service (`product-service` - Port 8082)
- Manages Product catalogue, pricing, quantity, category, and visual thumbnail URLs (`imageUrl`).
- Supports search and category filtering.

### 3. Order Service (`order-service` - Port 8083)
- Orchestrates checkout orders.
- Uses Spring `RestClient` to synchronously query **User Service** (`:8081`) to verify user existence and **Product Service** (`:8082`) to check stock availability.
- Automatically calculates totals and updates product stock upon order placement.

---

## 🗄️ Database Setup

- **Database Name:** `ecommerce`
- **Default Database Port:** `3306`
- **Tables Managed via JPA (`ddl-auto=update`):**
  - `users` (id, first_name, last_name, email, password [BCrypt], phone, role)
  - `product` (id, name, description, price, quantity, category, image_url)
  - `orders` (id, user_id, product_id, quantity, total_price, status)

### Environment Variable Configuration (Optional)
If your local MySQL uses custom credentials, set environment variables before running:
```bash
set DB_USERNAME=root
set DB_PASSWORD=your_password
```

---

## 📌 REST API Endpoints

### User Service (`http://localhost:8081`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/users` | Register user (BCrypt password hashed) |
| `GET` | `/users` | List all users |
| `GET` | `/users/{id}` | Get user by ID |
| `PUT` | `/users/{id}` | Update user details |
| `DELETE` | `/users/{id}` | Delete user |

### Product Service (`http://localhost:8082`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/products` | Create new product |
| `GET` | `/products` | Fetch all products |
| `GET` | `/products/{id}` | Fetch product by ID |
| `PUT` | `/products/{id}` | Update product & stock |
| `DELETE` | `/products/{id}` | Delete product |

### Order Service (`http://localhost:8083`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/orders` | Place order (validates user & stock) |
| `GET` | `/orders` | Fetch order history |
| `GET` | `/orders/{id}` | Fetch order by ID |
| `PUT` | `/orders/{id}` | Update order status |
| `DELETE` | `/orders/{id}` | Cancel order |

---

## 🚀 How to Run the Application

### 1. Database Requirement
Ensure MySQL Server 8.0 is running on port `3306`. The database `ecommerce` will be auto-created if missing.

### 2. Start Microservices in Eclipse / STS
1. Open Eclipse IDE or Spring Tool Suite.
2. Expand `user-service` ➔ right-click `UserServiceApplication.java` ➔ **Run As** ➔ **Spring Boot App** (Port 8081).
3. Expand `product-service` ➔ right-click `ProductServiceApplication.java` ➔ **Run As** ➔ **Spring Boot App** (Port 8082).
4. Expand `order-service` ➔ right-click `OrderServiceApplication.java` ➔ **Run As** ➔ **Spring Boot App** (Port 8083).

### 3. Open Frontend Storefront
Open `frontend/index.html` in your favorite web browser (Chrome, Firefox, Edge).

---

## 🛒 Sample User Workflow

1. **User Registration:** Click **Login** top-right ➔ Register a new account.
2. **Seed Sample Products:** Click **Seed Demo Data** in the hero banner to populate products into MySQL.
3. **Browse Catalogue:** Filter by categories (Electronics, Fashion, Footwear, Accessories) or search in real time.
4. **Shopping Cart:** Click **Add** on any product ➔ Open slide-out cart drawer ➔ Adjust quantities (+/-).
5. **Checkout & Order Placement:** Click **Proceed to Checkout** ➔ Select user ➔ Place order.
6. **Track Orders:** Click **Orders** in the navigation header to view real-time order history and status badges.

---

## 🔒 Security Highlights

- **BCrypt Password Hashing:** Plaintext passwords are NEVER stored in MySQL.
- **WRITE_ONLY Protection:** Passwords are NEVER serialized or returned in REST API responses.
- **Git Hygiene:** Build artifacts (`target/`, `.classpath`, `.project`, `.settings/`) and local credentials are excluded via `.gitignore`.

---

## 🔮 Future Enhancements

- **Spring Cloud Gateway:** Centralized routing & rate limiting.
- **Eureka Service Discovery:** Dynamic service registration.
- **JWT Authentication:** Stateful token-based authentication headers.
- **Docker Containerization:** Dockerfile & `docker-compose.yml` deployment.
