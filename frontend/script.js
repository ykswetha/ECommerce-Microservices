// ================= CONFIGURATION & PORTS =================
const API_PORTS = {
    USER_SERVICE: 'http://localhost:8081',
    PRODUCT_SERVICE: 'http://localhost:8082',
    ORDER_SERVICE: 'http://localhost:8083'
};

// Application State
let productsState = [];
let usersState = [];
let cartState = JSON.parse(localStorage.getItem('nexstore_cart')) || [];
let activeCategory = 'ALL';
let currentUser = null;

// Initial Fallback Sample Products (In case database is empty initially)
const SAMPLE_PRODUCTS = [
    {
        name: "Wireless Noise Cancelling Headphones",
        description: "Premium over-ear headphones with active noise cancellation and 30hr battery life.",
        price: 199.99,
        quantity: 25,
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop"
    },
    {
        name: "Smart Fitness Watch Ultra",
        description: "Track steps, heart rate, sleep cycles, and GPS metrics with AMOLED display.",
        price: 149.50,
        quantity: 40,
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop"
    },
    {
        name: "Designer Leather Jacket",
        description: "100% genuine black leather jacket with handcrafted stitching and modern fit.",
        price: 249.00,
        quantity: 15,
        category: "Fashion",
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop"
    },
    {
        name: "Pro Performance Running Shoes",
        description: "Lightweight breathable mesh sneakers designed for maximum comfort and speed.",
        price: 119.95,
        quantity: 30,
        category: "Footwear",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop"
    },
    {
        name: "Ergonomic Mechanical Keyboard",
        description: "RGB backlit mechanical keyboard with tactile blue switches and aluminum frame.",
        price: 89.99,
        quantity: 50,
        category: "Accessories",
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop"
    }
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadUsers();
    loadOrders();
    updateCartUI();
});

// ================= TOAST NOTIFICATIONS =================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ================= TAB NAVIGATION =================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ================= PRODUCT SERVICE (PORT 8082) =================
async function loadProducts() {
    try {
        const response = await fetch(`${API_PORTS.PRODUCT_SERVICE}/products`);
        if (response.ok) {
            const data = await response.json();
            productsState = data.length > 0 ? data : [];
            if (productsState.length === 0) {
                // Render sample data locally if DB is empty
                productsState = SAMPLE_PRODUCTS.map((p, idx) => ({ ...p, id: idx + 1 }));
            }
        } else {
            productsState = SAMPLE_PRODUCTS.map((p, idx) => ({ ...p, id: idx + 1 }));
        }
    } catch (error) {
        console.warn('Product Service offline, displaying sample products:', error);
        productsState = SAMPLE_PRODUCTS.map((p, idx) => ({ ...p, id: idx + 1 }));
    }
    renderProducts(productsState);
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    const filtered = activeCategory === 'ALL' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No products found in this category.</p>`;
        return;
    }

    filtered.forEach(product => {
        const fallbackImg = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop";
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <span class="category-tag">${product.category || 'General'}</span>
                <img src="${product.imageUrl || fallbackImg}" alt="${product.name}" onerror="this.src='${fallbackImg}'">
            </div>
            <div class="product-content">
                <h4 class="product-title">${product.name}</h4>
                <p class="product-desc">${product.description || ''}</p>
                <div class="product-footer">
                    <span class="product-price">$${parseFloat(product.price).toFixed(2)}</span>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterCategory(category) {
    activeCategory = category;
    document.querySelectorAll('.pill').forEach(pill => pill.classList.remove('active'));
    event.currentTarget.classList.add('active');
    renderProducts(productsState);
}

function filterProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = productsState.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
    );
    renderProducts(filtered);
}

// Seed Sample Data to Database
async function seedSampleProducts() {
    let seededCount = 0;
    for (const prod of SAMPLE_PRODUCTS) {
        try {
            const res = await fetch(`${API_PORTS.PRODUCT_SERVICE}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prod)
            });
            if (res.ok) seededCount++;
        } catch (e) {
            console.error('Failed to seed:', prod.name);
        }
    }
    showToast(`Successfully seeded ${seededCount} products into database!`);
    loadProducts();
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const productData = {
        name: document.getElementById('adminProductName').value,
        description: document.getElementById('adminProductDesc').value,
        price: parseFloat(document.getElementById('adminProductPrice').value),
        quantity: parseInt(document.getElementById('adminProductQty').value),
        category: document.getElementById('adminProductCategory').value,
        imageUrl: document.getElementById('adminProductImg').value || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop"
    };

    try {
        const res = await fetch(`${API_PORTS.PRODUCT_SERVICE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (res.ok) {
            showToast('Product created in MySQL Database!');
            document.getElementById('productForm').reset();
            loadProducts();
        }
    } catch (err) {
        showToast('Error saving product to backend API', 'danger');
    }
}

// ================= SHOPPING CART DRAWER =================
function toggleCartDrawer() {
    document.getElementById('cartDrawer').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
}

function addToCart(productId) {
    const product = productsState.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cartState.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        cartState[existingIndex].quantity += 1;
    } else {
        cartState.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${product.name} to cart!`);
}

function updateQuantity(productId, delta) {
    const item = cartState.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cartState = cartState.filter(i => i.id !== productId);
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('nexstore_cart', JSON.stringify(cartState));
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const badge = document.getElementById('cartCount');
    container.innerHTML = '';

    let totalCount = 0;
    let totalPrice = 0;

    cartState.forEach(item => {
        totalCount += item.quantity;
        totalPrice += item.price * item.quantity;

        const cartEl = document.createElement('div');
        cartEl.className = 'cart-item';
        cartEl.innerHTML = `
            <img class="cart-item-img" src="${item.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop'}" alt="${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        `;
        container.appendChild(cartEl);
    });

    badge.innerText = totalCount;
    document.getElementById('cartSubtotal').innerText = `$${totalPrice.toFixed(2)}`;
    document.getElementById('cartTotal').innerText = `$${totalPrice.toFixed(2)}`;
}

// ================= USER SERVICE (PORT 8081) =================
async function loadUsers() {
    try {
        const res = await fetch(`${API_PORTS.USER_SERVICE}/users`);
        if (res.ok) {
            usersState = await res.json();
            renderUserList(usersState);
            populateCheckoutUsers(usersState);
        }
    } catch (e) {
        console.warn('User service offline or starting up.');
        usersState = [{ id: 1, firstName: "Demo", lastName: "User", email: "demo@example.com", role: "CUSTOMER" }];
        renderUserList(usersState);
        populateCheckoutUsers(usersState);
    }
}

function renderUserList(users) {
    const container = document.getElementById('adminUserList');
    container.innerHTML = '';
    users.forEach(u => {
        const item = document.createElement('div');
        item.style.padding = '0.75rem';
        item.style.borderBottom = '1px solid var(--border-glass)';
        item.innerHTML = `<strong>ID ${u.id}: ${u.firstName} ${u.lastName}</strong> (${u.email}) - <span class="status-pill PLACED">${u.role || 'USER'}</span>`;
        container.appendChild(item);
    });
}

function populateCheckoutUsers(users) {
    const select = document.getElementById('checkoutUserSelect');
    select.innerHTML = '';
    users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.innerText = `User ID ${u.id} - ${u.firstName} (${u.email})`;
        select.appendChild(opt);
    });
}

function openAuthModal() {
    document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const userData = {
        firstName: document.getElementById('authFirstName').value,
        lastName: document.getElementById('authLastName').value,
        email: document.getElementById('authEmail').value,
        password: document.getElementById('authPassword').value,
        phone: document.getElementById('authPhone').value,
        role: document.getElementById('authRole').value
    };

    try {
        const res = await fetch(`${API_PORTS.USER_SERVICE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (res.ok) {
            const created = await res.json();
            currentUser = created;
            showToast(`User ${created.firstName} registered successfully (ID: ${created.id})! Password protected.`);
            document.getElementById('currentUserLabel').innerText = created.firstName;
            closeAuthModal();
            loadUsers();
        }
    } catch (e) {
        showToast('Registration failed', 'danger');
    }
}

// ================= ORDER SERVICE (PORT 8083) =================
function openCheckoutModal() {
    if (cartState.length === 0) {
        showToast('Your cart is empty!', 'danger');
        return;
    }
    const container = document.getElementById('checkoutItemsList');
    container.innerHTML = '';
    let grandTotal = 0;

    cartState.forEach(item => {
        const sub = item.price * item.quantity;
        grandTotal += sub;
        container.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.85rem;">
            <span>${item.name} (x${item.quantity})</span>
            <span>$${sub.toFixed(2)}</span>
        </div>`;
    });

    document.getElementById('checkoutTotalAmount').innerText = `$${grandTotal.toFixed(2)}`;
    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
}

async function submitOrder() {
    const userId = parseInt(document.getElementById('checkoutUserSelect').value) || 1;
    let placedOrders = 0;

    for (const item of cartState) {
        const orderPayload = {
            userId: userId,
            productId: item.id,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
            status: "PLACED"
        };

        try {
            const res = await fetch(`${API_PORTS.ORDER_SERVICE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
            if (res.ok) placedOrders++;
        } catch (e) {
            console.error('Order service call error:', e);
        }
    }

    showToast(`Order Placed Successfully! (${placedOrders} item lines created)`);
    cartState = [];
    saveCart();
    updateCartUI();
    closeCheckoutModal();
    toggleCartDrawer();
    loadOrders();
}

async function loadOrders() {
    try {
        const res = await fetch(`${API_PORTS.ORDER_SERVICE}/orders`);
        if (res.ok) {
            const orders = await res.json();
            renderOrdersTable(orders);
        }
    } catch (e) {
        renderOrdersTable([]);
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No orders found. Place your first order!</td></tr>`;
        return;
    }

    orders.forEach(o => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#ORD-${o.id}</td>
            <td>User #${o.userId}</td>
            <td>Prod #${o.productId}</td>
            <td>${o.quantity}</td>
            <td style="color:var(--accent-emerald); font-weight:600;">$${parseFloat(o.totalPrice).toFixed(2)}</td>
            <td><span class="status-pill ${o.status}">${o.status}</span></td>
            <td><button class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Details</button></td>
        `;
        tbody.appendChild(tr);
    });
}