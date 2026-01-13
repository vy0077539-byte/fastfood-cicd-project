// ===== GLOBAL STATE =====
let cart = [];

// ===== ADD ITEM TO CART (STATIC MENU) =====
function addToCart(name, price) {
    const existingItem = cart.find(i => i.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    updateCart();
    showNotification(`${name} added to cart! 🎉`);

    // Shake cart button
    const cartBtn = document.getElementById('cartBtn');
    cartBtn.style.animation = 'none';
    setTimeout(() => {
        cartBtn.style.animation = 'shake 0.5s';
    }, 10);
}

// ===== REMOVE ITEM =====
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCart();
    showNotification(`${name} removed from cart`);
}

// ===== UPDATE QUANTITY =====
function updateQuantity(name, change) {
    const item = cart.find(i => i.name === name);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(name);
    } else {
        updateCart();
    }
}

// ===== UPDATE CART UI =====
function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = `₹${totalPrice}`;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">🛒 Your cart is empty</p>';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-header">
                <span class="cart-item-name">${item.name}</span>
                <button onclick="removeFromCart('${item.name}')" class="remove-item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="cart-item-details">
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', 1)">+</button>
                </div>
                <span>₹${item.price * item.quantity}</span>
            </div>
        </div>
    `).join('');
}

// ===== CART SIDEBAR =====
document.getElementById('cartBtn').onclick = () =>
    document.getElementById('cartSidebar').classList.add('active');

document.getElementById('closeCart').onclick = () =>
    document.getElementById('cartSidebar').classList.remove('active');

// ===== CHECKOUT =====
document.getElementById('checkoutBtn').onclick = () => {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('checkoutModal').classList.add('active');

    const summaryItems = document.getElementById('summaryItems');
    const subtotal = document.getElementById('subtotal');
    const summaryTotal = document.getElementById('summaryTotal');

    const itemsTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryFee = 40;

    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} x${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join('');

    subtotal.textContent = `₹${itemsTotal}`;
    summaryTotal.textContent = `₹${itemsTotal + deliveryFee}`;
};

// ===== PLACE ORDER =====
document.getElementById('checkoutForm').addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
        customerName: customerName.value,
        phone: customerPhone.value,
        address: customerAddress.value,
        items: cart,
        total: cart.reduce((s, i) => s + i.price * i.quantity, 0) + 40
    };

    const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        document.getElementById('checkoutModal').classList.remove('active');
        document.getElementById('successModal').classList.add('active');
        displayOrderId.textContent = result.orderId;
        displayDeliveryTime.textContent = result.estimatedTime;

        cart = [];
        updateCart();
        checkoutForm.reset();
    }
});

// ===== SUCCESS MODAL =====
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'success') {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#e94560'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 9999;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// ===== BUILD VERSION =====
document.getElementById('buildVersion').textContent =
    '1.0.' + Date.now().toString().slice(-4);
