const PRODUCT_API = "http://localhost:8082";
const ORDER_API = "http://localhost:8083";


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

    try {

        const response = await fetch(`${PRODUCT_API}/products`);

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const products = await response.json();

        const productList = document.getElementById("product-list");

        productList.innerHTML = "";

        products.forEach(product => {

            const card = document.createElement("div");

            card.className = "product-card";

            card.innerHTML = `
                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <p class="price">₹${product.price}</p>

                <p>Category: ${product.category}</p>

                <p>Available: ${product.quantity}</p>

                <button onclick="placeOrder(${product.id})">
                    Buy Now
                </button>
            `;

            productList.appendChild(card);
        });

    } catch (error) {

        console.error("Product loading error:", error);

        document.getElementById("product-list").innerHTML =
            "<p>Unable to load products. Please start Product Service.</p>";
    }
}


// ===============================
// PLACE ORDER
// ===============================

async function placeOrder(productId) {

    const userId = prompt("Enter User ID:");

    if (!userId) {
        return;
    }

    const quantity = prompt("Enter Quantity:");

    if (!quantity || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }


    const order = {

        userId: Number(userId),

        productId: Number(productId),

        quantity: Number(quantity),

        status: "PLACED"
    };


    try {

        const response = await fetch(`${ORDER_API}/orders`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(order)
        });


        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(
                errorData.message || "Order creation failed"
            );
        }


        const createdOrder = await response.json();

        alert(
            `Order placed successfully!\n\n` +
            `Order ID: ${createdOrder.id}\n` +
            `Total Price: ₹${createdOrder.totalPrice}`
        );


        // Refresh products so updated stock is visible
        loadProducts();


    } catch (error) {

        console.error("Order error:", error);

        alert("Failed to place order: " + error.message);
    }
}


// ===============================
// LOAD ORDERS
// ===============================

async function loadOrders() {

    try {

        const response = await fetch(`${ORDER_API}/orders`);

        if (!response.ok) {
            throw new Error("Failed to load orders");
        }

        const orders = await response.json();

        const orderList = document.getElementById("order-list");

        orderList.innerHTML = "";

        if (orders.length === 0) {
            orderList.innerHTML = "<p>No orders found.</p>";
            return;
        }

        orders.forEach(order => {

            const card = document.createElement("div");

            card.className = "order-card";

            card.innerHTML = `
                <h3>Order #${order.id}</h3>

                <p>Product ID: ${order.productId}</p>

                <p>Quantity: ${order.quantity}</p>

                <p>Status: ${order.status}</p>

                <p class="price">
                    Total: ₹${order.totalPrice}
                </p>

                <p>User ID: ${order.userId}</p>
            `;

            orderList.appendChild(card);
        });

    } catch (error) {

        console.error("Order loading error:", error);

        document.getElementById("order-list").innerHTML =
            "<p>Unable to load orders. Please start Order Service.</p>";
    }
}

// ===============================
// LOAD PRODUCTS WHEN PAGE OPENS
// ===============================


document.addEventListener("DOMContentLoaded", () => {

    loadProducts();
    loadOrders();

});