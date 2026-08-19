// =========================
// Product Data
// =========================

const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 1499,
        description: "Premium wireless headphones with clear sound.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 2499,
        description: "Modern smartwatch with fitness tracking.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Running Shoes",
        price: 1999,
        description: "Comfortable shoes for running and everyday use.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Laptop",
        price: 54999,
        description: "Powerful laptop for work, study and coding.",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "Smartphone",
        price: 18999,
        description: "Feature-packed smartphone with a modern design.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "Backpack",
        price: 999,
        description: "Stylish and durable backpack for everyday use.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 7,
        name: "Gaming Keyboard",
        price: 1799,
        description: "RGB mechanical keyboard for gaming and coding.",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 8,
        name: "Sunglasses",
        price: 799,
        description: "Classic sunglasses with a stylish frame.",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
    }
];


// =========================
// Cart
// =========================

let cart = JSON.parse(localStorage.getItem("shopnestCart")) || [];


// =========================
// Display Products
// =========================

function displayProducts() {

    const container = document.getElementById("product-container");

    container.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");

        card.classList.add("product-card");

        card.innerHTML = `
            <img 
                src="${product.image}" 
                alt="${product.name}"
            >

            <div class="product-info">

                <h3>${product.name}</h3>

                <p>
                    ${product.description}
                </p>

                <div class="product-price">
                    ₹${product.price.toLocaleString("en-IN")}
                </div>

                <button 
                    class="add-cart-btn"
                    onclick="addToCart(${product.id})"
                >
                    Add to Cart
                </button>

            </div>
        `;

        container.appendChild(card);
    });
}


// =========================
// Add Product To Cart
// =========================

function addToCart(productId) {

    const product = products.find(
        product => product.id === productId
    );

    cart.push(product);

localStorage.setItem(
    "shopnestCart",
    JSON.stringify(cart)
);

updateCartCount();

    alert(`${product.name} added to cart!`);

    window.location.href = "cart.html";
}


// =========================
// Update Cart Count
// =========================

function updateCartCount() {

    const cartCount =
        document.getElementById("cart-count");

    cartCount.textContent = cart.length;
}


// =========================
// Shop Now Button
// =========================

function scrollToProducts() {

    document
        .getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// =========================
// Start Website
// =========================

displayProducts();

updateCartCount();
// =========================
// Open Cart
// =========================

function openCart() {
    window.location.href = "cart.html";
}


// =========================
// Display Cart
// =========================

function displayCart() {

    const container =
        document.getElementById("cart-container");

    if (!container) {
        return;
    }

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-cart">

                <h2>Your cart is empty 🛒</h2>

                <p>
                    Looks like you haven't added
                    anything to your cart yet.
                </p>

                <a
                    href="index.html#products"
                    class="continue-shopping"
                >
                    Continue Shopping
                </a>

            </div>
        `;

        return;
    }


    container.innerHTML = "";


    cart.forEach((product, index) => {

        const item = document.createElement("div");

        item.classList.add("cart-item");

        item.innerHTML = `

            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <div class="cart-item-info">

                <h3>
                    ${product.name}
                </h3>

                <div class="cart-item-price">
                    ₹${product.price.toLocaleString("en-IN")}
                </div>

            </div>

            <div class="quantity-controls">

                <button
                    onclick="decreaseQuantity(${index})"
                >
                    −
                </button>

                <span>1</span>

                <button
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>

            </div>

            <button
                class="remove-btn"
                onclick="removeFromCart(${index})"
            >
                Remove
            </button>
        `;

        container.appendChild(item);

    });


    displayCartSummary();
}


// =========================
// Cart Summary
// =========================

function displayCartSummary() {

    const container =
        document.getElementById("cart-container");

    let total = 0;

    cart.forEach(product => {
        total += product.price;
    });


    const summary =
        document.createElement("div");

    summary.classList.add("cart-summary");

    summary.innerHTML = `

        <h2>Order Summary</h2>

        <div class="cart-total">

            <span>Total</span>

            <span>
                ₹${total.toLocaleString("en-IN")}
            </span>

        </div>

        <button
            class="checkout-btn"
            onclick="checkout()"
        >
            Proceed to Checkout
        </button>
    `;

    container.appendChild(summary);
}


// =========================
// Remove From Cart
// =========================

function removeFromCart(index) {

   cart.splice(index, 1);

localStorage.setItem(
    "shopnestCart",
    JSON.stringify(cart)
);

updateCartCount();
    displayCart();
}


// =========================
// Quantity Buttons
// =========================

function increaseQuantity(index) {

    cart.push(cart[index]);

localStorage.setItem(
    "shopnestCart",
    JSON.stringify(cart)
);

updateCartCount();
displayCart();
}


function decreaseQuantity(index) {

    const product = cart[index];

    const anotherIndex =
        cart.findIndex(
            (item, i) =>
                item.id === product.id &&
                i !== index
        );

    if (anotherIndex !== -1) {

        cart.splice(anotherIndex, 1);

    } else {

        cart.splice(index, 1);
    }
localStorage.setItem(
    "shopnestCart",
    JSON.stringify(cart)
);
    updateCartCount();

    displayCart();
}


// =========================
// Checkout
// =========================

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }

    alert(
        "Checkout system will be connected to the backend in the next step!"
    );
}


// =========================
// Load Cart Page
// =========================

displayCart();